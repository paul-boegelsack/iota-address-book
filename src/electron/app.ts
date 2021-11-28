import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

const isDev: boolean = !app.isPackaged;

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

ipcMain.handleOnce('get/version', () => {
  return app.getVersion();
});
