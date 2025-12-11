const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const axios = require('axios')

const OLLAMA_URL = 'http://localhost:11434/api/chat'
const DEFAULT_MODEL = 'llama3.2'

async function handleMessage(event, message, options = {}) {
    const model = options.model || DEFAULT_MODEL
    const baseUrl = options.url || 'http://localhost:11434'
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/api/chat`

    try {
        const response = await axios.post(apiUrl, {
            model: model,
            messages: [{ role: 'user', content: message }],
            stream: false
        }, { timeout: 30000 })

        if (response.data && response.data.message) {
            event.reply('message', response.data.message.content)
        } else {
            event.reply('message', 'Error: Unexpected response format from Ollama.')
        }
    } catch (error) {
        console.error('Ollama error:', error)
        const errorMsg = error.code === 'ECONNREFUSED' 
            ? `Cannot connect to Ollama at ${baseUrl}. Ensure Ollama is running.`
            : `Error: ${error.message}`
        event.reply('message', errorMsg)
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
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.on('message', handleMessage)
    ipcMain.handle('test-connection', handleTestConnection)
    ipcMain.handle('fetch-models', handleFetchModels)
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})