import { useState, useEffect, useCallback } from 'react';

export const useChat = (settings) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // Handle full message (legacy or error fallback)
        const cleanupMessage = window.electronAPI.onMessage((message) => {
            setMessages((prev) => [...prev, { id: Date.now() + Math.random(), text: message, type: 'received' }]);
            setIsGenerating(false);
            
            if (settings?.desktopNotifications && !document.hasFocus()) {
                if (Notification.permission === 'granted') {
                    new Notification('New Message', {
                        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
                    });
                }
            }
        });

        // Handle streaming chunks
        const cleanupChunk = window.electronAPI.onMessageChunk((chunk) => {
            setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.type === 'received' && lastMsg.isStreaming) {
                    // Update existing streaming message
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, text: lastMsg.text + chunk }
                    ];
                } else {
                    // Start new streaming message
                    return [...prev, { 
                        id: Date.now() + Math.random(), 
                        text: chunk, 
                        type: 'received',
                        isStreaming: true 
                    }];
                }
            });
        });

        // Handle stream done
        const cleanupDone = window.electronAPI.onMessageDone(() => {
            setIsGenerating(false);
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.isStreaming) {
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, isStreaming: false }
                    ];
                }
                return prev;
            });
        });

        return () => {
            cleanupMessage();
            cleanupChunk();
            cleanupDone();
        };
    }, [settings?.desktopNotifications]);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setAttachedFile(null);
        setIsGenerating(false);
    }, []);

    const handleAttachFile = useCallback(async () => {
        try {
            const filePath = await window.electronAPI.selectFile();
            if (filePath) {
                setAttachedFile(filePath);
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    }, []);

    const handleSend = useCallback(async () => {
        let text = inputValue.trim();
        if ((text || attachedFile) && !isGenerating) {
            setInputValue('');
            const currentAttachedFile = attachedFile;
            setAttachedFile(null);
            setIsGenerating(true);

            let finalMessage = text;

            if (currentAttachedFile) {
                const fileName = currentAttachedFile.split(/[/\\]/).pop();

                try {
                    const fileData = await window.electronAPI.readFile(currentAttachedFile);

                    if (fileData) {
                        if (fileData.type === 'image') {
                            setMessages(prev => [...prev, {
                                id: Date.now() + Math.random(),
                                text: text,
                                type: 'sent',
                                attachment: fileName,
                                image: fileData.content,
                                mimeType: fileData.mimeType
                            }]);

                            window.electronAPI.sendMessage(finalMessage, {
                                model: settings.ollamaModel,
                                url: settings.ollamaUrl,
                                images: [fileData.content]
                            });
                        } else {
                            setMessages(prev => [...prev, {
                                id: Date.now() + Math.random(),
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
                    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text: finalMessage, type: 'sent' }]);
                    window.electronAPI.sendMessage(finalMessage, {
                        model: settings.ollamaModel,
                        url: settings.ollamaUrl
                    });
                }
            } else {
                setMessages(prev => [...prev, { id: Date.now() + Math.random(), text: finalMessage, type: 'sent' }]);
                window.electronAPI.sendMessage(finalMessage, {
                    model: settings.ollamaModel,
                    url: settings.ollamaUrl
                });
            }
        }
    }, [inputValue, attachedFile, settings, isGenerating]);

    return {
        messages,
        setMessages,
        inputValue,
        setInputValue,
        attachedFile,
        setAttachedFile,
        handleNewChat,
        handleAttachFile,
        handleSend,
        isGenerating
    };
};
