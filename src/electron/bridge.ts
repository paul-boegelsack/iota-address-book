import { contextBridge, ipcRenderer, IpcRenderer, IpcRendererEvent } from 'electron'
import type { IotaAddress } from './lib/IotaAddress'

/**
 * Defines a callback for window api events
 */
interface AddressListEventCallback {
    (event: IpcRendererEvent, addressList: IotaAddress[]): void
}

/**
 * API for communication between main process and renderer
 */
export const WINDOW_API = {
    UpdateAddressList: (bechAddress: string): Promise<IotaAddress[]> =>
        ipcRenderer.invoke('update/address-list', bechAddress),
    DeleteAddressFromList: (bechAddress: string): Promise<IotaAddress[]> =>
        ipcRenderer.invoke('delete/address-list', bechAddress),
    AddressCopied: (bechAddress: string): Promise<unknown> => ipcRenderer.invoke('copy/address', bechAddress),

    ListenToAddModeSet: (callback: AddressListEventCallback): IpcRenderer => ipcRenderer.on('event/add-mode', callback),
    ListenToSearchModeSet: (callback: AddressListEventCallback): IpcRenderer =>
        ipcRenderer.on('event/search-mode', callback),
    ListenToAddressesLoaded: (callback: AddressListEventCallback): IpcRenderer =>
        ipcRenderer.on('event/loaded-addresses', callback),
    ListenToBalanceChanged: (callback: AddressListEventCallback): IpcRenderer =>
        ipcRenderer.on('event/balance-update', callback),
}

contextBridge.exposeInMainWorld('api', WINDOW_API)
