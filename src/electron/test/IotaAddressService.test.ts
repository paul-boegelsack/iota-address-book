import {
  Ed25519Seed,
  generateBip44Address,
  Ed25519Address,
  ED25519_ADDRESS_TYPE,
  Bech32Helper,
} from '@iota/iota.js';
import { Bip32Path, Bip39 } from '@iota/crypto.js';
import { IotaAddressService, Address } from '../lib/IotaAddressService';
describe('IotaNodeService Integration', () => {
  let service;
  const API = 'api.lb-0.h.chrysalis-devnet.iota.cafe';
  const newBechAddress = generateBechAddress();

  beforeEach(async () => {
    service = new IotaAddressService(API);
  });

  test.only('should receive an address object', async () => {
    const expectedAddress: Address = {
      bechAddress: newBechAddress,
      balance: 0,
    };
    const address = await service.GetAddress(expectedAddress.bechAddress);
    expect(address).toEqual(expectedAddress);
  });

  test('should receive a bech32 address if its balance changed', (done) => {
    const expectedBechAddress = newBechAddress;
    service.ListenToAddress(expectedBechAddress, (becAddress: string) => {
      expect(becAddress).toBe(expectedBechAddress);
      done();
    });
  }, 60000);
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
