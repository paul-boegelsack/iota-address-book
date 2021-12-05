import * as fs from 'fs'
import { join } from 'path'
import { SingleNodeClient } from '@iota/iota.js'
import { MqttClient } from '@iota/mqtt.js'
import { AddressStorageHelper } from '../lib/helper/StorageHelper'
import { IotaAddress } from '../lib/IotaAddress'
import { IotaAddressService } from '../lib/IotaAddressService'
// import { mocked } from 'ts-jest/utils'

describe('AddressStorageHelper Integration', () => {
    let helper: AddressStorageHelper
    const storagePath = join('./src', 'electron', 'test', 'fakeStorage.txt')
    beforeEach(() => {
        const mqttClient = new MqttClient('mqtt://http://api.lb-0.h.chrysalis-devnet.iota.cafe/')
        const nodeClient = new SingleNodeClient('http://api.lb-0.h.chrysalis-devnet.iota.cafe/')
        const addressService = new IotaAddressService(nodeClient, mqttClient)
        helper = new AddressStorageHelper(storagePath, addressService)
    })
    afterEach(() => {
        if (fs.existsSync(storagePath)) fs.unlinkSync(storagePath)
    })
    test('should store addresses in a file end load them if neccessary', (done) => {
        const addrOne = new IotaAddress('atoi1qqq2ahx0lfnx2u4t9aypqer0cqd35am7vstzj2f4pnj8sq5fldsa2px2c6w', 0)
        const addrTwo = new IotaAddress('atoi1qrqmmjs6chsakseg2rytd0gp8tpagq0d2q6z2m6z92kawe048tzy6n4rwvn', 0)
        const callback = (list: IotaAddress[]) => {
            expect(list[0].GetBechAddress()).toBe(addrOne.GetBechAddress())
            expect(list[1].GetBechAddress()).toBe(addrTwo.GetBechAddress())
            done()
        }
        const addresses = [addrOne, addrTwo]
        helper.AddresLoadListener(callback)
        helper
            .UpdateStorage(addresses)
            .then(() => {
                helper.LoadAddresses().catch(() => {})
            })
            .catch(() => {})
    }, 10000)
    test('should return an empty array while loading if no storage file exists', (done) => {
        const callback = (list: IotaAddress[]) => {
            expect(list.length).toBe(0)
            done()
        }
        helper.AddresLoadListener(callback)
        helper.LoadAddresses().catch(() => {})
    })
})
