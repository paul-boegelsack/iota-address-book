import * as fs from 'fs'
import EventEmitter from 'events'
import type { IotaAddress } from '../IotaAddress'
import type { IotaAddressService } from '../IotaAddressService'
import readLine from 'readline'

export interface AddressLoaderCallback {
    (addressList: IotaAddress[]): void
}

export class AddressStorageHelper {
    private events: EventEmitter

    constructor(private storagePath: string, private addressService: IotaAddressService) {
        this.events = new EventEmitter()
    }

    UpdateStorage(addressList: IotaAddress[]): void {
        fs.writeFile(this.storagePath, '', (error) => {
            if (error) throw error
            let addressString = ''
            addressList.forEach((address) => {
                addressString += `${address.GetBechAddress()}\n`
            })
            fs.writeFile(this.storagePath, addressString, (error) => {
                if (error) throw error
            })
        })
    }

    async LoadAddresses(): Promise<void> {
        const addressList = []
        const addressPromises = []
        const readStream = fs.createReadStream(this.storagePath)
        const rl = readLine.createInterface({
            input: readStream,
        })
        for await (const line of rl) {
            addressPromises.push(this.addressService.GetAddress(line))
        }
        addressList.push(Promise.all(addressPromises))
        this.events.emit('address-list-loaded', addressList)
    }

    AddresLoadListener(callback: AddressLoaderCallback): void {
        this.events.on('address-list-loader', (addressList: IotaAddress[]) => {
            callback(addressList)
        })
    }
}
