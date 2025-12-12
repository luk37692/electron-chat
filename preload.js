const { contextBridge, ipcRenderer, webUtils } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (message, options) => ipcRenderer.send('message', message, options),
    onMessage: (callback) => {
        const subscription = (_event, value) => callback(value);
        ipcRenderer.on('message', subscription);
        return () => ipcRenderer.removeListener('message', subscription);
    },
    testConnection: (url) => ipcRenderer.invoke('test-connection', url),
    fetchModels: (url) => ipcRenderer.invoke('fetch-models', url),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    onMenuAction: (callback) => {
        const subscription = (_event, action) => callback(action)
        ipcRenderer.on('menu-action', subscription)
        return () => ipcRenderer.removeListener('menu-action', subscription)
    },
    selectFile: () => ipcRenderer.invoke('select-file'),
    readFile: (path) => ipcRenderer.invoke('read-file', path),
    // For drag-drop file path access (Electron 28+)
    getPathForFile: (file) => webUtils.getPathForFile(file)
})