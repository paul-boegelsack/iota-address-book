import { SingleNodeClient } from '@iota/iota.js';
import { MqttClient } from '@iota/mqtt.js';

export interface AddressCallback {
  (bechAddress: string): void;
}

export type Address = {
  bechAddress: string;
  balance: number;
};

export class IotaAddressService {
  private client: SingleNodeClient;
  private mqttClient: MqttClient;

  constructor(private host = 'chrysalis-nodes.iota.org') {
    const endpoint = `https://${this.host}`;
    this.client = new SingleNodeClient(endpoint);
    this.mqttClient = new MqttClient(`mqtt://${this.host}:1883`);
  }

  ListenToAddress(bechAddress: string, callback: AddressCallback) {
    this.mqttClient.addressOutputs(bechAddress, async (topic, data) => {
      const [, addressId] = topic.split('/');
      callback(addressId);
    });
  }

  async GetAddress(bechAddress: string): Promise<Address> {
    try {
      const result = await this.client.address(bechAddress);
      const { balance } = result;
      return { bechAddress, balance };
    } catch (error) {
      console.log(error);
    }
  }
}
