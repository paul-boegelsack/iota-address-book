import {
  Ed25519Seed,
  generateBip44Address,
  Ed25519Address,
  ED25519_ADDRESS_TYPE,
  Bech32Helper,
} from '@iota/iota.js';
import { Bip32Path, Bip39 } from '@iota/crypto.js';
import { SingleNodeClient } from '@iota/iota.js';
import { MqttClient } from '@iota/mqtt.js';
import { IotaAddressService } from '../lib/IotaAddressService';
import { IotaAddress } from '../lib/IotaAddress';

interface BalanceCallback {
  (topic: string, data: { output: { amount: number } }): void;
}

describe('IotaNodeService Integration', () => {
  let service;
  let nodeClient;
  let mqttClient;
  const NODE = 'api.lb-0.h.chrysalis-devnet.iota.cafe';
  const newBechAddress = generateBechAddress();

  beforeEach(() => {
    nodeClient = new SingleNodeClient(`http://${NODE}`);
    mqttClient = new MqttClient(`mqtt://${NODE}`);
    service = new IotaAddressService(nodeClient, mqttClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return an iota address object', async () => {
    jest
      .spyOn(mqttClient, 'addressOutputs')
      .mockImplementation((topic: string, callback: BalanceCallback) => {
        callback('', { output: { amount: 0 } });
      });
    const address = await service.GetAddress(newBechAddress);
    expect(address).toBeInstanceOf(IotaAddress);
    expect(address.GetBechAddress()).toBe(newBechAddress);
    expect(address.GetBalance()).toBe(0);
  });

  test('should call the balance listener of the returning object if balance of the corresponding address changed', async () => {
    jest
      .spyOn(mqttClient, 'addressOutputs')
      .mockImplementation((topic: string, callback: BalanceCallback) => {
        callback('', { output: { amount: 200000 } });
      });
    const address = await service.GetAddress(newBechAddress);
    expect(address.GetBalance()).toBe(200000);
  });
});

function generateBechAddress() {
  const randomMnemonic = Bip39.randomMnemonic();
  const baseSeed = Ed25519Seed.fromMnemonic(randomMnemonic);
  const addressGeneratorAccountState = {
    accountIndex: 0,
    addressIndex: 0,
    isInternal: false,
  };
  const path = generateBip44Address(addressGeneratorAccountState, true);
  const addressSeed = baseSeed.generateSeedFromPath(new Bip32Path(path));
  const addressKeyPair = addressSeed.keyPair();
  const indexEd25519Address = new Ed25519Address(addressKeyPair.publicKey);
  const indexPublicKeyAddress = indexEd25519Address.toAddress();
  return Bech32Helper.toBech32(
    ED25519_ADDRESS_TYPE,
    indexPublicKeyAddress,
    'atoi'
  );
}
