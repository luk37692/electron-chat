import React, { useState, useEffect } from 'react';
import { Box, Paper, Container, IconButton, TextField, Chip, Typography, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const SUPPORTED_EXTENSIONS = ['txt', 'md', 'js', 'json', 'py', 'html', 'css', 'c', 'cpp', 'h', 'java', 'ts', 'tsx', 'jsx', 'png', 'jpg', 'jpeg', 'webp'];

const DropzonePaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isDragging',
})(({ theme, isDragging }) => ({
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius * 1.5,
    border: isDragging ? `2px dashed ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
    backgroundColor: isDragging ? theme.palette.action.hover : theme.palette.background.paper,
    transition: theme.transitions.create('all'),
}));

const ChatInput = ({
    inputValue,
    setInputValue,
    handleSend,
    handleAttachFile,
    attachedFile,
    setAttachedFile,
    settings,
    onSettingsChange
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [models, setModels] = useState([]);
    
    // Fetch models on mount if not available or to ensure list is fresh
    useEffect(() => {
        const fetchModels = async () => {
             try {
                const result = await window.electronAPI.fetchModels(settings.ollamaUrl || 'http://localhost:11434');
                if (result.success) {
                    setModels(result.models);
                }
             } catch (e) {
                 console.error("Failed to fetch models for switcher", e);
             }
        };
        fetchModels();
    }, [settings.ollamaUrl]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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
            const filePath = window.electronAPI.getPathForFile(file);
            
            if (filePath) {
                setAttachedFile(filePath);
            }
        }
    };
    
    const handleModelClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleModelClose = () => {
        setAnchorEl(null);
    };
    
    const handleModelSelect = (model) => {
        if (onSettingsChange) {
            onSettingsChange({ ...settings, ollamaModel: model });
        }
        handleModelClose();
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
                <DropzonePaper isDragging={isDragging} elevation={0}>
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
                </DropzonePaper>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: 'text.secondary', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': { color: 'primary.main' }
                        }}
                        onClick={handleModelClick}
                    >
                        Using {settings.ollamaModel || 'Loading...'} • {settings.ollamaUrl} <ExpandLessIcon sx={{ fontSize: 16, ml: 0.5 }} />
                    </Typography>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleModelClose}
                    >
                        {models.length > 0 ? models.map((model) => (
                            <MenuItem 
                                key={model} 
                                onClick={() => handleModelSelect(model)}
                                selected={model === settings.ollamaModel}
                            >
                                {model}
                            </MenuItem>
                        )) : (
                             <MenuItem disabled>No models found</MenuItem>
                        )}
                    </Menu>
                </Box>
            </Container>
        </Box>
    );
};

export default React.memo(ChatInput);
