import * as fs from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { EventEmitter } from 'events'
import { app, BrowserWindow, ipcMain } from 'electron'
import { SingleNodeClient } from '@iota/iota.js'
import { MqttClient } from '@iota/mqtt.js'

import { IotaAddressService } from './lib/IotaAddressService'
import type { IotaAddress } from './lib/IotaAddress'

const isDev: boolean = !app.isPackaged
const events = new EventEmitter()
const NODE_HOST = 'api.lb-0.h.chrysalis-devnet.iota.cafe'
const nodeClient = new SingleNodeClient(`http://${NODE_HOST}/`)
const mqttClient = new MqttClient(`mqtt://${NODE_HOST}/`)
const addressService = new IotaAddressService(nodeClient, mqttClient)

let mainWindow: BrowserWindow
const addressList: IotaAddress[] = []

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, './bridge.js'),
    },
    })

    mainWindow.on('ready-to-show', () => mainWindow.show())

  events.on('balance-changed', (addressList) => {
        mainWindow.webContents.send('event/balance-update', addressList)
    })

    if (isDev) mainWindow.webContents.openDevTools()
}

function prepareAddressListForRenderer() {
    return addressList.map((address) => ({
      bechAddress: address.GetBechAddress(),
      balance: address.GetBalanceMI(),
    }))
}

function addressBalanceChanged(changedAddress) {
  events.emit('balance-changed', prepareAddressListForRenderer());
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
