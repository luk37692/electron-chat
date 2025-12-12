import React from 'react';
import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const MessageItem = ({ message }) => {
    const isSent = message.type === 'sent';

    return (
        <Box sx={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', mb: 1 }}>
            {!isSent && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1, mt: 0.5 }}>
                    <SmartToyIcon fontSize="small" />
                </Avatar>
            )}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    maxWidth: '75%',
                    bgcolor: isSent ? 'primary.main' : 'background.paper',
                    color: isSent ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 3,
                    borderTopLeftRadius: !isSent ? 0 : 3,
                    borderTopRightRadius: isSent ? 0 : 3,
                    border: '1px solid',
                    borderColor: isSent ? 'transparent' : 'divider'
                }}
            >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>

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
            </Paper>
            {isSent && (
                <Avatar sx={{ bgcolor: 'primary.dark', width: 32, height: 32, ml: 1, mt: 0.5 }}>
                    <PersonIcon fontSize="small" />
                </Avatar>
            )}
        </Box>
    );
};

export default MessageItem;
