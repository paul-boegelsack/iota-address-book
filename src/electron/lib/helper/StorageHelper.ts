import { writeFile } from 'fs/promises'
import { createReadStream, existsSync } from 'fs'
import readLine from 'readline'
import EventEmitter from 'events'

import type { IotaAddress } from '../IotaAddress'
import type { IotaAddressService } from '../IotaAddressService'

export interface AddressLoaderCallback {
    (addressList: IotaAddress[]): void
}

export class AddressStorageHelper {
    private events: EventEmitter

    constructor(private storagePath: string, private addressService: IotaAddressService) {
        this.events = new EventEmitter()
    }

    async UpdateStorage(addressList: IotaAddress[]): Promise<void> {
        let addressString = ''
        await writeFile(this.storagePath, '')
        addressList.forEach((address) => {
            addressString += `${address.GetBechAddress()}\n`
        })
        await writeFile(this.storagePath, addressString)
    }

    async LoadAddresses(): Promise<void> {
        const addressPromises = []
        if (existsSync(this.storagePath) === false) {
            this.events.emit('address-list-loaded', [])
            return
        }
        const readStream = createReadStream(this.storagePath)
        const rl = readLine.createInterface({
            input: readStream,
        })
        for await (const line of rl) {
            addressPromises.push(this.addressService.GetAddress(line))
        }
        const addressList = await Promise.all(addressPromises)
        this.events.emit('address-list-loaded', addressList)
    }

    AddresLoadListener(callback: AddressLoaderCallback): void {
        this.events.on('address-list-loaded', (addressList: IotaAddress[]) => {
            callback(addressList)
        })
    }
}
