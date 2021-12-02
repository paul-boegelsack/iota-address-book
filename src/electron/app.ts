import * as fs from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { EventEmitter } from 'events'
import { app, BrowserWindow, ipcMain } from 'electron'
import { SingleNodeClient } from '@iota/iota.js'
import { MqttClient } from '@iota/mqtt.js'

import { IotaAddressService } from './lib/IotaAddressService'
import type { IotaAddress } from './lib/IotaAddress'
import { ErrorHelper } from './lib/helper/ErrorHelper'
import { AddressStorageHelper } from './lib/helper/StorageHelper'

const isDev: boolean = !app.isPackaged
const events = new EventEmitter()
const NODE_HOST = 'api.lb-0.h.chrysalis-devnet.iota.cafe'
const nodeClient = new SingleNodeClient(`http://${NODE_HOST}/`)
const mqttClient = new MqttClient(`mqtt://${NODE_HOST}/`)
const addressService = new IotaAddressService(nodeClient, mqttClient)

let mainWindow: BrowserWindow
const addressList: IotaAddress[] = []
const dir = join(`${homedir}`, '.iotaAB')
const storagePath = join(`${dir}`, 'storage.json')
const errorLogPath = join(`${dir}`, 'error.log')
const errorHelper = new ErrorHelper(errorLogPath)
const storageHelepr = new AddressStorageHelper(storagePath, addressService)

function createMainWindow(): void {
    if (fs.existsSync(dir) === false) fs.mkdirSync(dir)
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, './bridge.js'),
        },
    })

    mainWindow.loadFile(join(__dirname, '../index.html')).catch((error: Error) => {
        errorHelper.HandleError(error)
    })
    mainWindow.on('ready-to-show', () => mainWindow.show())

    events.on('balance-changed', (addressList) => {
        mainWindow.webContents.send('event/balance-update', addressList)
    })
    events.on('loaded-addresses', (addressList) => {
        mainWindow.webContents.send('event/loaded-addresses', addressList)
    })

    if (isDev) mainWindow.webContents.openDevTools()

    storageHelepr.AddresLoadListener(loadedAddresses)
    storageHelepr.LoadAddresses().catch((error: Error) => errorHelper.HandleError(error))
}

app.on('ready', createMainWindow)

function prepareAddressListForRenderer() {
    return addressList.map((address) => ({
        bechAddress: address.GetBechAddress(),
        balance: address.GetBalanceMI(),
    }))
}

function loadedAddresses(loadedAddresses: IotaAddress[]) {
    events.emit('loaded-addresses', loadedAddresses)
}

function addressBalanceChanged() {
    events.emit('balance-changed', prepareAddressListForRenderer())
}

function deleteFromAddressList(bechAddress: string) {
    let deleteIndex: number
    addressList.forEach((address, index) => {
        if (address.GetBechAddress() === bechAddress) deleteIndex = index
    })
    if (deleteIndex || deleteIndex === 0) addressList.splice(deleteIndex, 1)
}

ipcMain.handle('update/address-list', async (event, bechAddress: string) => {
    const address: IotaAddress = await addressService.GetAddress(bechAddress)
    address.ListenToBalanceChange(addressBalanceChanged)
    addressList.push(address)
    storageHelepr.UpdateStorage(addressList)
    return prepareAddressListForRenderer()
})

ipcMain.handle('delete/address-list', (event, bechAddress: string) => {
    deleteFromAddressList(bechAddress)
    return prepareAddressListForRenderer()
})
