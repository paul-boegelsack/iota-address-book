import * as fs from 'fs'
import { exit } from 'process'
import { join } from 'path'
import { homedir } from 'os'
import { EventEmitter } from 'events'
import { app, BrowserWindow, ipcMain, clipboard, Menu, MenuItemConstructorOptions, globalShortcut } from 'electron'
import { SingleNodeClient } from '@iota/iota.js'
import { MqttClient } from '@iota/mqtt.js'

import { IotaAddressService } from './lib/IotaAddressService'
import { ErrorHelper } from './lib/helper/ErrorHelper'
import { AddressStorageHelper } from './lib/helper/StorageHelper'
import type { IotaAddress } from './lib/IotaAddress'

const isDev: boolean = !app.isPackaged
const events = new EventEmitter()
const NODE_HOST = isDev ? 'api.lb-0.h.chrysalis-devnet.iota.cafe' : 'chrysalis-nodes.iota.org'
const nodeClient = new SingleNodeClient(`http://${NODE_HOST}/`)
const mqttClient = new MqttClient(`mqtt://${NODE_HOST}/`)
const addressService = new IotaAddressService(nodeClient, mqttClient)
const addressList: IotaAddress[] = []
const dir = join(`${homedir}`, '.iotaAB')
const storagePath = join(`${dir}`, 'storage.txt')
const errorLogPath = join(`${dir}`, 'error.log')
const errorHelper = new ErrorHelper(errorLogPath)
const storageHelepr = new AddressStorageHelper(storagePath, addressService)
let mainWindow: BrowserWindow

const isMac = process.platform === 'darwin'

const setAddMode = () => {
    events.emit('add-mode')
}

const setSearchMode = () => {
    events.emit('search-mode')
}

const modes = [
    { label: 'Add', click: setAddMode },
    { label: 'Search', click: setSearchMode },
]

const menuTeplate: MenuItemConstructorOptions[] = isMac
    ? [
          {
              label: app.name,
              submenu: [
                  {
                      label: 'Input Modes',
                      submenu: modes,
                  },
                  {
                      type: 'separator',
                  },
                  {
                      role: 'quit',
                  },
              ],
          },
      ]
    : [
          {
              label: 'Files',
              submenu: [{ role: 'close' }],
          },
          {
              label: 'Modes',
              submenu: modes,
          },
      ]

menuTeplate.push({
    label: 'Edit',
    submenu: [
        { role: 'undo', accelerator: 'CmdOrCtrl+Z' },
        { role: 'redo', accelerator: 'Shift+CmdOrCtrl+Z' },
        { type: 'separator' },
        { role: 'cut', accelerator: 'CmdOrCtrl+X' },
        { role: 'copy', accelerator: 'CmdOrCtrl+C' },
        { role: 'paste', accelerator: 'CmdOrCtrl+V' },
        { role: 'selectAll', accelerator: 'CmdOrCtrl+A' },
    ],
})

const menu = Menu.buildFromTemplate(menuTeplate)
Menu.setApplicationMenu(menu)

/**
 * Creating main window
 */
function createMainWindow(): void {
    try {
        if (fs.existsSync(dir) === false) fs.mkdirSync(dir)
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            autoHideMenuBar: false,
            webPreferences: {
                preload: join(__dirname, './bridge.js'),
            },
        })

        mainWindow.loadFile(join(__dirname, '../index.html')).catch((error: Error) => {
            errorHelper.HandleError(error)
        })
        mainWindow.on('ready-to-show', () => {
            mainWindow.show()
            storageHelepr.AddresLoadListener(loadedAddresses)
            storageHelepr.LoadAddresses().catch((error: Error) => errorHelper.HandleError(error))
        })

        events.on('add-mode', () => {
            mainWindow.webContents.send('event/add-mode', addressList)
        })

        events.on('search-mode', () => {
            mainWindow.webContents.send('event/search-mode', addressList)
        })

        events.on('balance-changed', (addressList) => {
            mainWindow.webContents.send('event/balance-update', addressList)
        })
        events.on('loaded-addresses', (addressList) => {
            mainWindow.webContents.send('event/loaded-addresses', addressList)
        })

        if (isDev) mainWindow.webContents.openDevTools()
    } catch (error: unknown) {
        if (error instanceof Error) {
            errorHelper.HandleError(error)
            return
        }
        exit(1)
    }
}

/**
 * Extract address values for renderer.
 * @returns array with IotaAddress objects
 */
function prepareAddressListForRenderer() {
    return addressList.map((address) => ({
        bechAddress: address.GetBechAddress(),
        balance: address.GetBalanceMI(),
    }))
}

/**
 * Callback function for loading addresses with storage helper. Emits
 * an event with addresses for the main window.
 * @param loadedAddresses array with IotaAddress objects from storage
 */
function loadedAddresses(loadedAddresses: IotaAddress[]) {
    loadedAddresses.forEach((address) => {
        address.ListenToBalanceChange(addressBalanceChanged)
    })
    addressList.push(...loadedAddresses)
    events.emit('loaded-addresses', prepareAddressListForRenderer())
}

/**
 * Callback function for balance change. Emits an event with addresses
 * for the main window.
 */
function addressBalanceChanged() {
    events.emit('balance-changed', prepareAddressListForRenderer())
}

/**
 * Delets an address object from the addressList array
 * @param bechAddress bech32 address of the object that will be deleted
 */
function deleteFromAddressList(bechAddress: string) {
    let deleteIndex: number
    addressList.forEach((address, index) => {
        if (address.GetBechAddress() === bechAddress) deleteIndex = index
    })
    if (deleteIndex || deleteIndex === 0) addressList.splice(deleteIndex, 1)
}

ipcMain.handle('update/address-list', async (event, bechAddress: string) => {
    try {
        const exists = addressList.find((address) => address.GetBechAddress() === bechAddress)
        if (exists) return prepareAddressListForRenderer()

        const address: IotaAddress = await addressService.GetAddress(bechAddress)
        address.ListenToBalanceChange(addressBalanceChanged)
        addressList.push(address)
        await storageHelepr.UpdateStorage(addressList)
        return prepareAddressListForRenderer()
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'address/undefined') return prepareAddressListForRenderer()
            errorHelper.HandleError(error)
        }
        exit(1)
    }
})

ipcMain.handle('delete/address-list', async (event, bechAddress: string) => {
    try {
        deleteFromAddressList(bechAddress)
        await storageHelepr.UpdateStorage(addressList)
        return prepareAddressListForRenderer()
    } catch (error) {
        if (error instanceof Error) errorHelper.HandleError(error)
        exit(1)
    }
})

ipcMain.handle('copy/address', (event, bechAddress: string) => {
    try {
        clipboard.writeText(bechAddress)
    } catch (error) {
        if (error instanceof Error) errorHelper.HandleError(error)
        exit(1)
    }
})

app.on('ready', createMainWindow)
