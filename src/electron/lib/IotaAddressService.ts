import type { SingleNodeClient } from '@iota/iota.js'
import type { MqttClient } from '@iota/mqtt.js'

import { IotaAddress } from './IotaAddress'

export interface AddressCallback {
    (amount: number): void
}

export class IotaAddressService {
    constructor(private nodeClient: SingleNodeClient, private mqttClient: MqttClient) {}

    private listenToAddressBalance(address: IotaAddress) {
        this.mqttClient.addressOutputs(address.GetBechAddress(), (topic, data) => {
            const { amount } = data.output
            address.IncreaseBalance(amount)
        })
    }

    async GetAddress(bechAddress: string): Promise<IotaAddress> {
        const { balance } = await this.nodeClient.address(bechAddress)
        const address = new IotaAddress(bechAddress, balance)
        this.listenToAddressBalance(address)
        return address
    }
}
