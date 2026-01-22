import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import CreateIcon from '@mui/icons-material/Create';
import MessageItem from './MessageItem';

// Get greeting based on time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

// Suggestion cards for empty state
const suggestions = [
    { icon: CodeIcon, title: 'Help me code', prompt: 'Help me write a function that...', color: '#3b82f6' },
    { icon: LightbulbIcon, title: 'Brainstorm ideas', prompt: 'Give me creative ideas for...', color: '#f59e0b' },
    { icon: SchoolIcon, title: 'Explain a concept', prompt: 'Explain in simple terms how...', color: '#10b981' },
    { icon: CreateIcon, title: 'Write content', prompt: 'Write a professional email about...', color: '#8b5cf6' },
];

const SuggestionCard = ({ icon: Icon, title, prompt, color, onClick }) => (
    <Paper
        elevation={0}
        onClick={() => onClick(prompt)}
        sx={{
            p: 2,
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: color,
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${color}20`,
            },
        }}
    >
        <Icon sx={{ color, mb: 1 }} />
        <Typography variant="body2" fontWeight={500}>
            {title}
        </Typography>
    </Paper>
);

// Animated typing dots component
const TypingIndicator = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1 }}>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'background.paper',
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            {[0, 1, 2].map((i) => (
                <Box
                    key={i}
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: 'typingDot 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
        </Box>
    </Box>
);

const MessageList = ({ messages, isGenerating, onSuggestionClick }) => {
    const scrollRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, messages[messages.length - 1]?.text]);

    return (
        <Box sx={{ flex: 1, p: 1, display: 'flex', flexDirection: 'column' }}>
            {messages.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        animation: 'fadeIn 0.5s ease-out',
                        px: 3,
                    }}
                >
                    <SmartToyIcon
                        sx={{
                            fontSize: 72,
                            mb: 2,
                            color: 'primary.main',
                            opacity: 0.8,
                        }}
                    />
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
                        {getGreeting()}! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                        What would you like to explore today?
                    </Typography>

                    {onSuggestionClick && (
                        <Grid container spacing={2} sx={{ maxWidth: 500 }}>
                            {suggestions.map((suggestion) => (
                                <Grid item xs={6} key={suggestion.title}>
                                    <SuggestionCard {...suggestion} onClick={onSuggestionClick} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: 1,
                        height: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        pr: 1,
                    }}
                >
                    {messages.map((msg, index) => (
                        <Box
                            key={msg.id}
                            sx={{
                                animation: 'slideUp 0.3s ease-out',
                                animationFillMode: 'both',
                                animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
                            }}
                        >
                            <MessageItem message={msg} />
                        </Box>
                    ))}
                    {isGenerating && !messages[messages.length - 1]?.isStreaming && (
                        <TypingIndicator />
                    )}
                    <div ref={scrollRef} />
                </Box>
            )}
        </Box>
    );
};

export default React.memo(MessageList);

