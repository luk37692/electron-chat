import { useState, useEffect, useCallback, useRef } from 'react';

export const useChat = (settings, onTitleGenerated) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [conversationId, setConversationId] = useState(null);

    // Ref to track the current conversation for UI updates
    const conversationIdRef = useRef(conversationId);
    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    // Ref to track the conversation that is currently generating (for saving)
    const generatingForConversationRef = useRef(null);
    // Ref to track streaming text for the generating conversation
    const streamingTextRef = useRef('');
    // Ref to track the first user message for title generation
    const firstUserMessageRef = useRef(null);

    // Save message to database
    const saveMessageToDb = useCallback(async (convId, role, content, attachment = null, imageData = null, mimeType = null) => {
        if (convId) {
            try {
                await window.electronAPI.saveMessage(convId, role, content, attachment, imageData, mimeType);
            } catch (error) {
                console.error('Failed to save message:', error);
            }
        }
    }, []);

    // Generate AI title for conversation
    const generateTitle = useCallback(async (convId, userMessage, assistantMessage) => {
        try {
            // Check if the conversation still has the default title
            const conv = await window.electronAPI.getConversation(convId);
            if (!conv || conv.title !== 'New Chat') {
                return; // Title already set, skip generation
            }

            const result = await window.electronAPI.generateTitle(
                userMessage,
                assistantMessage,
                { model: settings.ollamaModel, url: settings.ollamaUrl }
            );
            if (result.success && result.title) {
                await window.electronAPI.updateConversationTitle(convId, result.title);
                if (onTitleGenerated) {
                    onTitleGenerated(convId, result.title);
                }
            }
        } catch (error) {
            console.error('Failed to generate title:', error);
        }
    }, [settings.ollamaModel, settings.ollamaUrl, onTitleGenerated]);

    useEffect(() => {
        // Handle full message (legacy or error fallback)
        const cleanupMessage = window.electronAPI.onMessage((message) => {
            setMessages((prev) => [...prev, { id: Date.now() + Math.random(), text: message, type: 'received' }]);
            setIsGenerating(false);

            // Save to the conversation that was generating
            const targetConvId = generatingForConversationRef.current;
            if (targetConvId) {
                saveMessageToDb(targetConvId, 'assistant', message);
            }
            generatingForConversationRef.current = null;

            if (settings?.desktopNotifications && !document.hasFocus()) {
                if (Notification.permission === 'granted') {
                    new Notification('New Message', {
                        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
                    });
                }
            }
        });

        // Handle streaming chunks
        const cleanupChunk = window.electronAPI.onMessageChunk((chunk, streamConvId) => {
            // Always accumulate the streaming text for saving later
            streamingTextRef.current += chunk;

            // Only update UI if this is for the current conversation
            const currentConvId = conversationIdRef.current;
            if (streamConvId === currentConvId) {
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
            }
        });

        // Handle stream done
        const cleanupDone = window.electronAPI.onMessageDone((streamConvId) => {
            const targetConvId = generatingForConversationRef.current;
            const streamedText = streamingTextRef.current;
            const userMessage = firstUserMessageRef.current;

            // Only update generating state if this was for the current conversation
            const currentConvId = conversationIdRef.current;
            if (streamConvId === currentConvId) {
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
            }

            // Always save the completed message to the correct conversation
            if (targetConvId && streamedText) {
                saveMessageToDb(targetConvId, 'assistant', streamedText);
                
                // Generate title if this was the first exchange (title is still "New Chat")
                if (userMessage) {
                    generateTitle(targetConvId, userMessage, streamedText);
                }
            }

            // Reset refs
            generatingForConversationRef.current = null;
            streamingTextRef.current = '';
            firstUserMessageRef.current = null;
        });

        return () => {
            cleanupMessage();
            cleanupChunk();
            cleanupDone();
        };
    }, [settings?.desktopNotifications, saveMessageToDb, generateTitle]);

    const handleNewChat = useCallback(() => {
        // Don't stop generation - let it continue in the background for the original conversation
        // Just clear the UI for the new chat
        setMessages([]);
        setAttachedFile(null);
        setIsGenerating(false);
        // Note: conversationId is set by App.jsx
    }, []);

    const handleStopGeneration = useCallback(() => {
        if (isGenerating) {
            window.electronAPI.stopGeneration();
            setIsGenerating(false);
            // Mark the last streaming message as complete
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
            // Clear the generating refs
            generatingForConversationRef.current = null;
            streamingTextRef.current = '';
            firstUserMessageRef.current = null;
        }
    }, [isGenerating]);

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

            // Track which conversation this generation is for
            const targetConvId = conversationIdRef.current;
            generatingForConversationRef.current = targetConvId;
            streamingTextRef.current = '';
            
            // Check if this is a new conversation (for title generation)
            // We'll set this for any message and let the database logic handle if title needs updating
            firstUserMessageRef.current = text;

            let finalMessage = text;

            if (currentAttachedFile) {
                const fileName = currentAttachedFile.split(/[/\\]/).pop();

                try {
                    const fileData = await window.electronAPI.readFile(currentAttachedFile);

                    if (fileData) {
                        if (fileData.type === 'image') {
                            const newMsg = {
                                id: Date.now() + Math.random(),
                                text: text,
                                type: 'sent',
                                attachment: fileName,
                                image: fileData.content,
                                mimeType: fileData.mimeType
                            };
                            setMessages(prev => [...prev, newMsg]);

                            // Save to database
                            saveMessageToDb(targetConvId, 'user', text, fileName, fileData.content, fileData.mimeType);

                            window.electronAPI.sendMessage(finalMessage, {
                                model: settings.ollamaModel,
                                url: settings.ollamaUrl,
                                images: [fileData.content],
                                conversationId: targetConvId
                            });
                        } else {
                            const displayText = text || "Sent a file";
                            setMessages(prev => [...prev, {
                                id: Date.now() + Math.random(),
                                text: displayText,
                                type: 'sent',
                                attachment: fileName
                            }]);

                            // Save to database
                            saveMessageToDb(targetConvId, 'user', displayText, fileName);

                            finalMessage += `\n\n--- Content from ${fileName} ---\n${fileData.content}\n-----------------------------`;

                            window.electronAPI.sendMessage(finalMessage, {
                                model: settings.ollamaModel,
                                url: settings.ollamaUrl,
                                conversationId: targetConvId
                            });
                        }
                    }
                } catch (e) {
                    console.error("Failed to read file", e);
                    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text: finalMessage, type: 'sent' }]);
                    saveMessageToDb(targetConvId, 'user', finalMessage);
                    window.electronAPI.sendMessage(finalMessage, {
                        model: settings.ollamaModel,
                        url: settings.ollamaUrl,
                        conversationId: targetConvId
                    });
                }
            } else {
                setMessages(prev => [...prev, { id: Date.now() + Math.random(), text: finalMessage, type: 'sent' }]);

                // Save to database
                saveMessageToDb(targetConvId, 'user', finalMessage);

                window.electronAPI.sendMessage(finalMessage, {
                    model: settings.ollamaModel,
                    url: settings.ollamaUrl,
                    conversationId: targetConvId
                });
            }
        }
    }, [inputValue, attachedFile, settings, isGenerating, saveMessageToDb]);

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
        handleStopGeneration,
        isGenerating,
        conversationId,
        setConversationId,
    };
};
