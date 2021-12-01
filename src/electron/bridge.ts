import { ipcRenderer, contextBridge } from 'electron';

export const WINDOW_API = {
  UpdateAddressList: (bechAddress: string) =>
    ipcRenderer.invoke('update/address-list', bechAddress),
};

contextBridge.exposeInMainWorld('api', WINDOW_API);
