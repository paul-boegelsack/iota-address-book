import { ipcRenderer, contextBridge } from 'electron';

export const WINDOW_API = {
  UpdateAddressList: (bechAddress: string) =>
    ipcRenderer.invoke('update/address-list', bechAddress),
  ListenToBalanceChanges: (callback) =>
    ipcRenderer.on('event/balance-update', callback),
  DeleteAddressFromList: (bechAddress: string) =>
    ipcRenderer.invoke('delete/address-list', bechAddress),
};

contextBridge.exposeInMainWorld('api', WINDOW_API);
