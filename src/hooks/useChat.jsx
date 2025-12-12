import { useState, useEffect } from 'react';

export const useChat = (settings) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);

    useEffect(() => {
        const cleanup = window.electronAPI.onMessage((message) => {
            setMessages((prev) => [...prev, { text: message, type: 'received' }]);

            // Show desktop notification if enabled and window is not focused
            if (settings?.desktopNotifications && !document.hasFocus()) {
                // Request permission if not granted
                if (Notification.permission === 'granted') {
                    new Notification('New Message', {
                        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
                        icon: undefined
                    });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('New Message', {
                                body: message.length > 100 ? message.substring(0, 100) + '...' : message,
                                icon: undefined
                            });
                        }
                    });
                }
            }
        });
        return cleanup;
    }, [settings?.desktopNotifications]);

    const handleNewChat = () => {
        setMessages([]);
        setAttachedFile(null);
    };

    const handleAttachFile = async () => {
        try {
            const filePath = await window.electronAPI.selectFile();
            if (filePath) {
                setAttachedFile(filePath);
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    };

    const handleSend = async () => {
        let text = inputValue.trim();
        if (text || attachedFile) {
            setInputValue('');
            const currentAttachedFile = attachedFile;
            setAttachedFile(null);

            let finalMessage = text;

            if (currentAttachedFile) {
                const fileName = currentAttachedFile.split(/[/\\]/).pop();

                try {
                    const fileData = await window.electronAPI.readFile(currentAttachedFile);

                    if (fileData) {
                        if (fileData.type === 'image') {
                            setMessages(prev => [...prev, {
                                text: text,
                                type: 'sent',
                                attachment: fileName,
                                image: fileData.content, // Base64 content
                                mimeType: fileData.mimeType
                            }]);

                            window.electronAPI.sendMessage(finalMessage, {
                                model: settings.ollamaModel,
                                url: settings.ollamaUrl,
                                images: [fileData.content]
                            });
                        } else {
                            // It's text
                            setMessages(prev => [...prev, {
                                text: text || "Sent a file",
                                type: 'sent',
                                attachment: fileName
                            }]);

                            finalMessage += `\n\n--- Content from ${fileName} ---\n${fileData.content}\n-----------------------------`;

                            window.electronAPI.sendMessage(finalMessage, {
                                model: settings.ollamaModel,
                                url: settings.ollamaUrl
                            });
                        }
                    }
                } catch (e) {
                    console.error("Failed to read file", e);
                    // Fallback if read fails
                    setMessages(prev => [...prev, { text: finalMessage, type: 'sent' }]);
                    window.electronAPI.sendMessage(finalMessage, {
                        model: settings.ollamaModel,
                        url: settings.ollamaUrl
                    });
                }
            } else {
                setMessages(prev => [...prev, { text: finalMessage, type: 'sent' }]);
                window.electronAPI.sendMessage(finalMessage, {
                    model: settings.ollamaModel,
                    url: settings.ollamaUrl
                });
            }
        }
    };

    return {
        messages,
        setMessages,
        inputValue,
        setInputValue,
        attachedFile,
        setAttachedFile,
        handleNewChat,
        handleAttachFile,
        handleSend
    };
};
