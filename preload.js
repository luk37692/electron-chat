const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (message, options) => ipcRenderer.send('message', message, options),
    stopGeneration: () => ipcRenderer.send('stop-generation'),

    onMessage: (callback) => {
        const subscription = (_event, value) => callback(value);
        ipcRenderer.on('message', subscription);
        return () => ipcRenderer.removeListener('message', subscription);
    },

    onMessageChunk: (callback) => {
        const subscription = (_event, chunk, conversationId) => callback(chunk, conversationId);
        ipcRenderer.on('message-chunk', subscription);
        return () => ipcRenderer.removeListener('message-chunk', subscription);
    },

    onMessageDone: (callback) => {
        const subscription = (_event, conversationId) => callback(conversationId);
        ipcRenderer.on('message-done', subscription);
        return () => ipcRenderer.removeListener('message-done', subscription);
    },

    generateTitle: (userMessage, assistantMessage, options) => 
        ipcRenderer.invoke('generate-title', userMessage, assistantMessage, options),
    testConnection: (url) => ipcRenderer.invoke('test-connection', url),
    fetchModels: (url) => ipcRenderer.invoke('fetch-models', url),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

    selectFile: () => ipcRenderer.invoke('select-file'),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    getPathForFile: (file) => webUtils.getPathForFile(file),

    onMenuAction: (callback) => {
        const subscription = (_event, action) => callback(action);
        ipcRenderer.on('menu-action', subscription);
        return () => ipcRenderer.removeListener('menu-action', subscription);
    },

    // Database APIs for conversation persistence
    createConversation: (title, model) => ipcRenderer.invoke('db-create-conversation', title, model),
    getConversations: () => ipcRenderer.invoke('db-get-conversations'),
    getConversation: (id) => ipcRenderer.invoke('db-get-conversation', id),
    updateConversationTitle: (id, title) => ipcRenderer.invoke('db-update-conversation-title', id, title),
    deleteConversation: (id) => ipcRenderer.invoke('db-delete-conversation', id),
    getMessages: (conversationId) => ipcRenderer.invoke('db-get-messages', conversationId),
    saveMessage: (conversationId, role, content, attachment, imageData, mimeType) =>
        ipcRenderer.invoke('db-save-message', conversationId, role, content, attachment, imageData, mimeType),
});

