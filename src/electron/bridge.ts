import { ipcRenderer, contextBridge } from 'electron';

export const WINDOW_API = {
  GetVersion: () => ipcRenderer.invoke('get/version'),
};

contextBridge.exposeInMainWorld('api', WINDOW_API);
