import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Container, IconButton, TextField, Chip, Typography, Menu, MenuItem, Tooltip, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import KeyboardIcon from '@mui/icons-material/Keyboard';

const SUPPORTED_EXTENSIONS = ['txt', 'md', 'js', 'json', 'py', 'html', 'css', 'c', 'cpp', 'h', 'java', 'ts', 'tsx', 'jsx', 'png', 'jpg', 'jpeg', 'webp'];

// Pulse animation for send button
const pulseAnimation = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

const DropzonePaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isDragging',
})(({ theme, isDragging }) => ({
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius * 2,
    border: isDragging ? `2px dashed ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
    backgroundColor: isDragging ? theme.palette.action.hover : theme.palette.background.paper,
    transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow'], {
        duration: 200,
    }),
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    },
}));

const SendButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'isReady',
})(({ theme, isReady }) => ({
    padding: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    backgroundColor: isReady ? theme.palette.primary.main : 'transparent',
    color: isReady ? theme.palette.primary.contrastText : theme.palette.action.disabled,
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: theme.transitions.create(['background-color', 'color', 'transform'], {
        duration: 200,
    }),
    '&:hover': {
        backgroundColor: isReady ? theme.palette.primary.dark : theme.palette.action.hover,
        transform: isReady ? 'scale(1.05)' : 'none',
    },
    '&:active': {
        transform: isReady ? 'scale(0.95)' : 'none',
    },
    ...(isReady && {
        animation: `${pulseAnimation} 2s infinite`,
    }),
}));

const StopButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: theme.transitions.create(['background-color', 'transform'], {
        duration: 200,
    }),
    '&:hover': {
        backgroundColor: theme.palette.error.dark,
        transform: 'scale(1.05)',
    },
    '&:active': {
        transform: 'scale(0.95)',
    },
}));

const ChatInput = ({
    inputValue,
    setInputValue,
    handleSend,
    handleAttachFile,
    attachedFile,
    setAttachedFile,
    settings,
    onSettingsChange,
    isGenerating,
    onStopGeneration
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [models, setModels] = useState([]);
    const inputRef = useRef(null);

    const isReady = inputValue.trim() || attachedFile;

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

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + Enter to send
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (isReady && !isGenerating) handleSend();
            }
            // Escape to stop generation
            if (e.key === 'Escape' && isGenerating && onStopGeneration) {
                e.preventDefault();
                onStopGeneration();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReady, handleSend, isGenerating, onStopGeneration]);

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
                            py: 2.5,
                            color: 'primary.main'
                        }}>
                            <AttachFileIcon sx={{ mr: 1 }} />
                            <Typography fontWeight={500}>Drop file here</Typography>
                        </Box>
                    ) : (
                        <>
                            <Fade in={!!attachedFile}>
                                <Box>
                                    {attachedFile && (
                                        <Chip
                                            label={attachedFile.split(/[/\\]/).pop()}
                                            onDelete={() => setAttachedFile(null)}
                                            size="small"
                                            sx={{
                                                ml: 1,
                                                animation: 'slideUp 0.2s ease-out',
                                            }}
                                        />
                                    )}
                                </Box>
                            </Fade>
                            <Tooltip title="Attach file">
                                <IconButton
                                    sx={{ p: 1 }}
                                    onClick={handleAttachFile}
                                    aria-label="Attach file"
                                >
                                    <AttachFileIcon />
                                </IconButton>
                            </Tooltip>
                            <TextField
                                ref={inputRef}
                                sx={{
                                    ml: 1,
                                    flex: 1,
                                    '& .MuiInputBase-root': {
                                        fontSize: '0.95rem',
                                    },
                                }}
                                placeholder="Type a message..."
                                variant="standard"
                                InputProps={{
                                    disableUnderline: true,
                                    'aria-label': 'Message input',
                                }}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                multiline
                                maxRows={6}
                                autoFocus
                                disabled={isGenerating}
                            />
                            {isGenerating ? (
                                <Tooltip title="Stop generating (Esc)">
                                    <StopButton
                                        onClick={onStopGeneration}
                                        aria-label="Stop generating"
                                    >
                                        <StopIcon fontSize="small" />
                                    </StopButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title={isReady ? "Send message (Enter)" : "Type a message to send"}>
                                    <span>
                                        <SendButton
                                            isReady={isReady}
                                            onClick={handleSend}
                                            disabled={!isReady}
                                            aria-label="Send message"
                                        >
                                            <SendIcon fontSize="small" />
                                        </SendButton>
                                    </span>
                                </Tooltip>
                            )}
                        </>
                    )}
                </DropzonePaper>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, gap: 2 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                                color: 'primary.main',
                                bgcolor: 'action.hover',
                            }
                        }}
                        onClick={handleModelClick}
                        role="button"
                        aria-label="Select model"
                        tabIndex={0}
                    >
                        Using <strong style={{ margin: '0 4px' }}>{settings.ollamaModel || 'Loading...'}</strong>
                        <ExpandLessIcon sx={{ fontSize: 16, ml: 0.5 }} />
                    </Typography>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleModelClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        PaperProps={{
                            sx: {
                                maxHeight: 300,
                                minWidth: 200,
                            }
                        }}
                    >
                        {models.length > 0 ? models.map((model) => (
                            <MenuItem
                                key={model}
                                onClick={() => handleModelSelect(model)}
                                selected={model === settings.ollamaModel}
                                sx={{
                                    borderRadius: 1,
                                    mx: 0.5,
                                    my: 0.25,
                                }}
                            >
                                {model}
                            </MenuItem>
                        )) : (
                            <MenuItem disabled>No models found</MenuItem>
                        )}
                    </Menu>
                    <Tooltip title="Shift+Enter for new line">
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.disabled',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <KeyboardIcon sx={{ fontSize: 14 }} />
                            Enter to send
                        </Typography>
                    </Tooltip>
                </Box>
            </Container>
        </Box>
    );
};

export default React.memo(ChatInput);

