const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (message, options) => ipcRenderer.send('message', message, options),
    onMessage: (callback) => {
        const subscription = (_event, value) => callback(value);
        ipcRenderer.on('message', subscription);
        return () => ipcRenderer.removeListener('message', subscription);
    },
    testConnection: (url) => ipcRenderer.invoke('test-connection', url),
    fetchModels: (url) => ipcRenderer.invoke('fetch-models', url)
})