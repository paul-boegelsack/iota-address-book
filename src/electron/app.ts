import { EventEmitter } from 'events';
import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { SingleNodeClient } from '@iota/iota.js';
import { MqttClient } from '@iota/mqtt.js';

import { IotaAddressService } from './lib/IotaAddressService';
import type { IotaAddress } from './lib/IotaAddress';

const isDev: boolean = !app.isPackaged;
const events = new EventEmitter();
const NODE_HOST = 'api.lb-0.h.chrysalis-devnet.iota.cafe';
const nodeClient = new SingleNodeClient(`http://${NODE_HOST}/`);
const mqttClient = new MqttClient(`mqtt://${NODE_HOST}/`);
const addressService = new IotaAddressService(nodeClient, mqttClient);

let mainWindow: BrowserWindow;
const addressList: Array<IotaAddress> = [];

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, './bridge.js'),
    },
  });

  mainWindow.loadFile(join(__dirname, '../index.html'));
  mainWindow.on('ready-to-show', mainWindow.show);

  events.on('balance-changed', (addressList) => {
    mainWindow.webContents.send('event/balance-update', addressList);
  });

  if (isDev) mainWindow.webContents.openDevTools();
}

function prepareAddressListForRenderer() {
  return addressList.map((address) => {
    return {
      bechAddress: address.GetBechAddress(),
      balance: address.GetBalanceMI(),
    };
  });
}

function addressBalanceChanged(changedAddress) {
  events.emit('balance-changed', prepareAddressListForRenderer());
}

function deleteFromAddressList(bechAddress) {
  let deleteIndex: number;
  addressList.forEach((address, index) => {
    if (address.GetBechAddress() === bechAddress) deleteIndex = index;
  });
  if (deleteIndex || deleteIndex === 0) addressList.splice(deleteIndex, 1);
}

app.on('ready', createMainWindow);

ipcMain.handle('update/address-list', async (event, bechAddress) => {
  console.log(bechAddress);
  const address: IotaAddress = await addressService.GetAddress(bechAddress);
  address.ListenToBalanceChange(addressBalanceChanged);
  addressList.push(address);
  return prepareAddressListForRenderer();
});

ipcMain.handle('delete/address-list', async (event, bechAddress) => {
  deleteFromAddressList(bechAddress);
  return prepareAddressListForRenderer();
});
