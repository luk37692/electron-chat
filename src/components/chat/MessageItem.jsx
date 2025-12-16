import React from 'react';
import { Box, Paper, Typography, Chip, Avatar, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessagePaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isSent',
})(({ theme, isSent }) => ({
    padding: theme.spacing(2),
    maxWidth: '75%',
    backgroundColor: isSent ? theme.palette.primary.main : theme.palette.background.paper,
    color: isSent ? theme.palette.primary.contrastText : theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius * 1.5,
    borderTopLeftRadius: !isSent ? 0 : theme.shape.borderRadius * 1.5,
    borderTopRightRadius: isSent ? 0 : theme.shape.borderRadius * 1.5,
    border: '1px solid',
    borderColor: isSent ? 'transparent' : theme.palette.divider,
    position: 'relative',
    '&:hover .copy-button': {
        opacity: 1,
    }
}));

const MessageItem = ({ message }) => {
    const isSent = message.type === 'sent';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', mb: 1 }}>
            {!isSent && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1, mt: 0.5 }}>
                    <SmartToyIcon fontSize="small" />
                </Avatar>
            )}
            <MessagePaper isSent={isSent} elevation={0}>
                {!isSent && (
                    <Tooltip title="Copy">
                        <IconButton
                            className="copy-button"
                            size="small"
                            onClick={handleCopy}
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                color: 'text.secondary',
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ContentCopyIcon fontSize="small" sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                )}

                {isSent ? (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
                ) : (
                    <Box sx={{
                        '& pre': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            padding: 1,
                            borderRadius: 1,
                            overflowX: 'auto',
                        },
                        '& code': {
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            padding: '2px 4px',
                            borderRadius: 4
                        },
                        '& p': { margin: 0, marginBottom: 1 },
                        '& p:last-child': { marginBottom: 0 }
                    }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.text}
                        </ReactMarkdown>
                    </Box>
                )}

                {message.image && (
                    <Box sx={{ mt: 1, mb: 1, maxWidth: '100%' }}>
                        <img
                            src={`data:${message.mimeType || 'image/jpeg'};base64,${message.image}`}
                            alt="Attached"
                            style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
                        />
                    </Box>
                )}

                {message.attachment && (
                    <Chip
                        icon={<AttachFileIcon sx={{ "&&": { color: 'inherit' } }} />}
                        label={message.attachment}
                        size="small"
                        sx={{ mt: 1, bgcolor: 'rgba(0,0,0,0.1)', color: 'inherit' }}
                    />
                )}
            </MessagePaper>
            {isSent && (
                <Avatar sx={{ bgcolor: 'primary.dark', width: 32, height: 32, ml: 1, mt: 0.5 }}>
                    <PersonIcon fontSize="small" />
                </Avatar>
            )}
        </Box>
    );
};

export default React.memo(MessageItem);
