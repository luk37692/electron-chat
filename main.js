const { app, BrowserWindow, ipcMain, Menu, shell, dialog, Tray, nativeImage } = require('electron/main')
const path = require('node:path')
const axios = require('axios')
const fs = require('node:fs')
const db = require('./database')

const OLLAMA_URL = 'http://localhost:11434/api/chat'
const DEFAULT_MODEL = 'llama3.2'

// Storage handling
const userDataPath = app.getPath('userData')
const settingsPath = path.join(userDataPath, 'settings.json')

function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
        }
    } catch (error) {
        console.error('Error loading settings:', error)
    }
    return {
        ollamaUrl: 'http://localhost:11434',
        model: DEFAULT_MODEL
    }
}

function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
        return true
    } catch (error) {
        console.error('Error saving settings:', error)
        return false
    }
}

// Initialize settings
let currentSettings = loadSettings()
let tray = null
let mainWindow = null

async function handleMessage(event, message, options = {}) {
    const model = options.model || DEFAULT_MODEL
    const baseUrl = options.url || 'http://localhost:11434'
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/api/chat`

    const payload = {
        model: model,
        messages: [{ role: 'user', content: message }],
        stream: true
    }

    if (options.images && options.images.length > 0) {
        payload.messages[0].images = options.images
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')

            buffer = lines.pop()

            for (const line of lines) {
                if (!line.trim()) continue
                try {
                    const json = JSON.parse(line)
                    if (json.message && json.message.content) {
                        event.reply('message-chunk', json.message.content)
                    }
                    if (json.done) {
                        event.reply('message-done')
                    }
                } catch (e) {
                    console.error('Error parsing JSON chunk', e)
                }
            }
        }
    } catch (error) {
        console.error('Ollama error:', error)
        const errorMsg = error.code === 'ECONNREFUSED'
            ? `Cannot connect to Ollama at ${baseUrl}. Ensure Ollama is running.`
            : `Error: ${error.message}`

        // Fallback: send as chunk and done to display error cleanly
        event.reply('message-chunk', errorMsg)
        event.reply('message-done')
    }
}

async function handleTestConnection(event, baseUrl) {
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/api/tags`
    try {
        const response = await axios.get(apiUrl, { timeout: 5000 })
        return { success: true, message: 'Connected successfully!' }
    } catch (error) {
        console.error('Connection test failed:', error)
        return {
            success: false,
            message: error.code === 'ECONNREFUSED'
                ? `Cannot connect to ${baseUrl}. Is Ollama running?`
                : `Connection failed: ${error.message}`
        }
    }
}

async function handleFetchModels(event, baseUrl) {
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/api/tags`
    try {
        const response = await axios.get(apiUrl, { timeout: 5000 })
        if (response.data && response.data.models) {
            const models = response.data.models.map(m => m.name)
            return { success: true, models }
        } else {
            return { success: false, error: 'Unexpected response format' }
        }
    } catch (error) {
        console.error('Fetch models failed:', error)
        return {
            success: false,
            error: error.code === 'ECONNREFUSED'
                ? 'Cannot connect to Ollama'
                : error.message
        }
    }
}

function createWindow() {
    const { width, height, x, y } = currentSettings.windowBounds || {}

    mainWindow = new BrowserWindow({
        width: width || 800,
        height: height || 600,
        x: x,
        y: y,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('index.html')

    // Minimize to tray instead of closing
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault()
            mainWindow.hide()
            return false
        }
        const bounds = mainWindow.getBounds()
        currentSettings.windowBounds = bounds
        saveSettings(currentSettings)
    })

    mainWindow.webContents.on('context-menu', (event, params) => {
        const menuTemplate = [
            { role: 'cut', enabled: params.editFlags.canCut },
            { role: 'copy', enabled: params.editFlags.canCopy },
            { role: 'paste', enabled: params.editFlags.canPaste },
            { type: 'separator' },
            { role: 'selectAll', enabled: params.editFlags.canSelectAll },
            { type: 'separator' },
            {
                label: 'Inspect Element',
                click: () => mainWindow.webContents.inspectElement(params.x, params.y)
            }
        ]
        Menu.buildFromTemplate(menuTemplate).popup({ window: mainWindow })
    })
}

function createTray() {
    const icon = nativeImage.createFromDataURL(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADjSURBVDiNpZMxDoJAEEX/Lhsb4gXsLO21tMFOG7TRA3ACOYInkBNwAU5gQ6eJRxAPoGWxlIyFrmEXXPRVM8n8N5P5M0Moj2vTdYCSpYBiBBwAK0nxM8n8TWQDCIACGAOLNMC+74uqOgVwBrBLEyzLKqnqDcAOwCWN4LpuRVUbAGoA2jFCLB4AWACqaROcc6aqNREpxuL/CNxJEREJROR7EThHKKgQEcfz/OHvBEm3CAB47QYNAEOgFhFfAKAAXkn+xk8CQQEAvwiOge+vI+L6QVCO7gBUAfQS2VT1EcfjUbMRfALaVEr1gKAQXAAAAABJRU5ErkJggg=='
    )

    tray = new Tray(icon)
    tray.setToolTip('Electron Chat')

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show/Hide',
            click: () => {
                if (mainWindow.isVisible()) {
                    mainWindow.hide()
                } else {
                    mainWindow.show()
                    mainWindow.focus()
                }
            }
        },
        {
            label: 'New Chat',
            click: () => {
                mainWindow.show()
                mainWindow.focus()
                mainWindow.webContents.send('menu-action', 'new-chat')
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true
                app.quit()
            }
        }
    ])

    tray.setContextMenu(contextMenu)

    tray.on('double-click', () => {
        mainWindow.show()
        mainWindow.focus()
    })
}

app.whenReady().then(() => {
    ipcMain.on('message', handleMessage)
    ipcMain.handle('test-connection', handleTestConnection)
    ipcMain.handle('fetch-models', handleFetchModels)
    ipcMain.handle('get-settings', () => currentSettings)
    ipcMain.handle('save-settings', (event, newSettings) => {
        currentSettings = newSettings
        return saveSettings(newSettings)
    })

    // Database handlers for conversation persistence
    db.initDatabase()

    ipcMain.handle('db-create-conversation', (event, title, model) => {
        return db.createConversation(title, model)
    })

    ipcMain.handle('db-get-conversations', () => {
        return db.getConversations()
    })

    ipcMain.handle('db-get-conversation', (event, id) => {
        return db.getConversation(id)
    })

    ipcMain.handle('db-update-conversation-title', (event, id, title) => {
        return db.updateConversationTitle(id, title)
    })

    ipcMain.handle('db-delete-conversation', (event, id) => {
        return db.deleteConversation(id)
    })

    ipcMain.handle('db-get-messages', (event, conversationId) => {
        return db.getMessages(conversationId)
    })

    ipcMain.handle('db-save-message', (event, conversationId, role, content, attachment, imageData, mimeType) => {
        return db.saveMessage(conversationId, role, content, attachment, imageData, mimeType)
    })

    // File handling
    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {
                    name: 'All Supported',
                    extensions: ['txt', 'md', 'js', 'json', 'py', 'html', 'css', 'c', 'cpp', 'h', 'java', 'ts', 'tsx', 'jsx', 'png', 'jpg', 'jpeg', 'webp']
                },
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
                { name: 'Text/Code', extensions: ['txt', 'md', 'js', 'json', 'py', 'html', 'css', 'c', 'cpp', 'h', 'java', 'ts', 'tsx', 'jsx'] }
            ]
        })
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0]
        }
        return null
    })

    ipcMain.handle('read-file', async (event, filePath) => {
        try {
            const ext = path.extname(filePath).toLowerCase()
            const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp']

            if (imageExtensions.includes(ext)) {
                const data = fs.readFileSync(filePath)
                const base64 = data.toString('base64')
                const mimeType = ext === '.png' ? 'image/png' :
                    ext === '.webp' ? 'image/webp' :
                        'image/jpeg'
                return { type: 'image', content: base64, mimeType }
            } else {
                const content = fs.readFileSync(filePath, 'utf8')
                return { type: 'text', content }
            }
        } catch (error) {
            console.error('Error reading file:', error)
            return null
        }
    })

    createWindow()
    createTray()

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Chat',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => BrowserWindow.getFocusedWindow().webContents.send('menu-action', 'new-chat')
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
