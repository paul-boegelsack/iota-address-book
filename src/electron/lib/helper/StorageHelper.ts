import { writeFile } from 'fs/promises'
import { createReadStream, existsSync } from 'fs'
import readLine from 'readline'
import EventEmitter from 'events'

import type { IotaAddress } from '../IotaAddress'
import type { IotaAddressService } from '../IotaAddressService'

/**
 * Defines the signature of an address loader callback
 */
export interface AddressLoaderCallback {
    (addressList: IotaAddress[]): void
}

/**
 * Helper for storage interaction
 */
export class AddressStorageHelper {
    private events: EventEmitter

    /**
     * @param storagePath path to the storage file (e.g. index.txt)
     * @param addressService service to load address data from the connected node
     */
    constructor(private storagePath: string, private addressService: IotaAddressService) {
        this.events = new EventEmitter()
    }

    /**
     * Updates the storage file with the bech32 addresses of the passed objects
     * @param addressList array of IotaAddress objects
     */
    async UpdateStorage(addressList: IotaAddress[]): Promise<void> {
        let addressString = ''
        await writeFile(this.storagePath, '')
        addressList.forEach((address) => {
            addressString += `${address.GetBechAddress()}\n`
        })
        await writeFile(this.storagePath, addressString)
    }

    /**
     * Loads bech32 addresses from storage and requests the corresponding
     * informations from the connected node.
     * Fires an event with the address objects if loading is finished.
     * The Event will be detected by the AddressLoadListener
     * @returns a promise array with IotaAddress objects
     */
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

    /**
     * Detects if the load process of address objects is finished
     * with LoadAddresses method.
     * @param callback callback for loaded IotaAddress objects
     */
    AddresLoadListener(callback: AddressLoaderCallback): void {
        this.events.on('address-list-loaded', (addressList: IotaAddress[]) => {
            callback(addressList)
        })
    }
}
