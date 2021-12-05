import {
    Ed25519Seed,
    generateBip44Address,
    Ed25519Address,
    ED25519_ADDRESS_TYPE,
    Bech32Helper,
    IOutputResponse,
} from '@iota/iota.js'
import { Bip32Path, Bip39 } from '@iota/crypto.js'
import { SingleNodeClient } from '@iota/iota.js'
import { MqttClient } from '@iota/mqtt.js'
import { IotaAddressService } from '../lib/IotaAddressService'
import { IotaAddress } from '../lib/IotaAddress'

interface BalanceCallback {
    (topic: string, data: IOutputResponse): void
}

describe('IotaNodeService Integration', () => {
    let service
    let nodeClient: SingleNodeClient
    let mqttClient: MqttClient
    const NODE = 'api.lb-0.h.chrysalis-devnet.iota.cafe'
    const newBechAddress = generateBechAddress()

    beforeEach(() => {
        nodeClient = new SingleNodeClient(`http://${NODE}`)
        mqttClient = new MqttClient(`mqtt://${NODE}`)
        service = new IotaAddressService(nodeClient, mqttClient)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('should return an iota address object', async () => {
        jest.spyOn(mqttClient, 'addressOutputs').mockImplementation(
            (addressBech32: string, callback: BalanceCallback) => {
                callback(addressBech32, {
                    messageId: '',
                    transactionId: '',
                    outputIndex: 0,
                    isSpent: false,
                    output: { amount: 0, type: 0, address: { address: '', type: 0 } },
                })
                return addressBech32
            }
        )
        const address = await service.GetAddress(newBechAddress)
        expect(address).toBeInstanceOf(IotaAddress)
        expect(address.GetBechAddress()).toBe(newBechAddress)
        expect(address.GetBalance()).toBe(0)
    })

    test('should call the balance listener of the returning object if balance of the corresponding address changed', async () => {
        jest.spyOn(mqttClient, 'addressOutputs').mockImplementation(
            (addressBech32: string, callback: BalanceCallback) => {
                callback(addressBech32, {
                    messageId: '',
                    transactionId: '',
                    outputIndex: 0,
                    isSpent: false,
                    output: { amount: 200000, type: 0, address: { address: '', type: 0 } },
                })
                return addressBech32
            }
        )
        const address = await service.GetAddress(newBechAddress)
        expect(address.GetBalance()).toBe(200000)
    })

    test('should return an error if no address was found', async () => {
        await expect(service.GetAddress()).rejects.toEqual(new Error('address/undefined'))
        await expect(
            service.GetAddress('atoithisisatest70zsa9fn5t98mnt2zsstlert0wd20uesk0h4thz0123456789')
        ).rejects.toEqual(new Error('address/undefined'))
    })
})

function generateBechAddress() {
    const randomMnemonic = Bip39.randomMnemonic()
    const baseSeed = Ed25519Seed.fromMnemonic(randomMnemonic)
    const addressGeneratorAccountState = {
        accountIndex: 0,
        addressIndex: 0,
        isInternal: false,
    }
    const path = generateBip44Address(addressGeneratorAccountState)
    const addressSeed = baseSeed.generateSeedFromPath(new Bip32Path(path))
    const addressKeyPair = addressSeed.keyPair()
    const indexEd25519Address = new Ed25519Address(addressKeyPair.publicKey)
    const indexPublicKeyAddress = indexEd25519Address.toAddress()
    return Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, indexPublicKeyAddress, 'atoi')
}
