import { ipcRenderer, contextBridge } from 'electron';

export const WINDOW_API = {
  GetAddress: (bechAddress: string) =>
    ipcRenderer.invoke('get/address', bechAddress),
};

contextBridge.exposeInMainWorld('api', WINDOW_API);
