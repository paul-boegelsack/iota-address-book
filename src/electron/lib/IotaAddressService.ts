import type { SingleNodeClient } from '@iota/iota.js'
import type { MqttClient } from '@iota/mqtt.js'

import { IotaAddress } from './IotaAddress'

/**
 * Defines signature of balance change callback
 */
export interface AddressCallback {
    (amount: number): void
}

/**
 * Class offers an api to gather address informations of an iota node
 */
export class IotaAddressService {
    /**
     * @param nodeClient node client to request data of an iota node
     * @param mqttClient mqtt api to establish a socket connection to the node
     */
    constructor(private nodeClient: SingleNodeClient, private mqttClient: MqttClient) {}

    /**
     * Listens if the balance of the passed IotaAddress object changed.
     * Increases the balance after a change was detected.
     * @param address IotaAddress object.
     */
    private listenToAddressBalance(address: IotaAddress) {
        this.mqttClient.addressOutputs(address.GetBechAddress(), (topic, data) => {
            const { amount } = data.output
            address.IncreaseBalance(amount)
        })
    }

    /**
     * Requests data about the passed bech32 address from the connected node
     * @param bechAddress bech32 address
     * @returns IotaAddress object
     */
    async GetAddress(bechAddress: string): Promise<IotaAddress> {
        const { balance } = await this.nodeClient.address(bechAddress)
        const address = new IotaAddress(bechAddress, balance)
        this.listenToAddressBalance(address)
        return address
    }
}
