import React, { useState } from 'react';
import { Box, Paper, Container, IconButton, TextField, Chip, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';

const SUPPORTED_EXTENSIONS = ['txt', 'md', 'js', 'json', 'py', 'html', 'css', 'c', 'cpp', 'h', 'java', 'ts', 'tsx', 'jsx', 'png', 'jpg', 'jpeg', 'webp'];

const ChatInput = ({
    inputValue,
    setInputValue,
    handleSend,
    handleAttachFile,
    attachedFile,
    setAttachedFile,
    settings
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isFileSupported = (filePath) => {
        const ext = filePath.split('.').pop().toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;

        if (files && files.length > 0) {
            const file = files[0];
            // Use Electron's webUtils API (exposed via preload) to get file path
            const filePath = window.electronAPI.getPathForFile(file);
            console.log('Dropped file:', file.name, 'Path:', filePath);

            if (filePath) {
                setAttachedFile(filePath);
            } else {
                console.warn('Could not get file path');
            }
        }
    };

    return (
        <Box
            data-dropzone="true"
            sx={{ p: 2, bgcolor: 'background.default' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Container maxWidth="lg" disableGutters>
                <Paper
                    elevation={0}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 3,
                        border: isDragging ? '2px dashed' : '1px solid',
                        borderColor: isDragging ? 'primary.main' : 'divider',
                        bgcolor: isDragging ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isDragging ? (
                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 2,
                            color: 'primary.main'
                        }}>
                            <AttachFileIcon sx={{ mr: 1 }} />
                            <Typography>Drop file here</Typography>
                        </Box>
                    ) : (
                        <>
                            {attachedFile && (
                                <Chip
                                    label={attachedFile.split(/[/\\]/).pop()}
                                    onDelete={() => setAttachedFile(null)}
                                    sx={{ ml: 1 }}
                                />
                            )}
                            <IconButton sx={{ p: '10px' }} onClick={handleAttachFile} title="Attach File">
                                <AttachFileIcon />
                            </IconButton>
                            <TextField
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Type a message or drag & drop a file..."
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                multiline
                                maxRows={4}
                            />
                            <IconButton
                                color="primary"
                                sx={{ p: '10px' }}
                                onClick={handleSend}
                                disabled={!inputValue.trim() && !attachedFile}
                            >
                                <SendIcon />
                            </IconButton>
                        </>
                    )}
                </Paper>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                    Using {settings.ollamaModel} • {settings.ollamaUrl}
                </Typography>
            </Container>
        </Box>
    );
};

export default ChatInput;
