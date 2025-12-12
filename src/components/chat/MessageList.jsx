import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MessageItem from './MessageItem';

const MessageList = ({ messages }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                    <SmartToyIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">Start a conversation</Typography>
                </Box>
            )}
            {messages.map((message, index) => (
                <MessageItem key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default MessageList;
