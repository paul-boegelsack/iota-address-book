import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

import type { IotaAddress } from './lib/IotaAddress';

const isDev: boolean = !app.isPackaged;
const addressService = new IotaAddressService(
  'api.lb-0.h.chrysalis-devnet.iota.cafe'
);

let mainWindow: BrowserWindow;

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

  if (isDev) mainWindow.webContents.openDevTools();
}

app.on('ready', createMainWindow);

ipcMain.handle('get/address', async (event, bechAddress) => {
  console.log(bechAddress);
  const address: IotaAddress = await addressService.GetAddress(bechAddress);
  return address;
});
