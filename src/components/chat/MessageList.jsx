import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MessageItem from './MessageItem';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const MessageList = ({ messages, isGenerating }) => {
    const listRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (listRef.current) {
            // If isGenerating, we might want to follow the stream.
            // But FixedSizeList with variable content size (Markdown) is tricky.
            // Wait, FixedSizeList requires fixed size. Markdown messages vary wildly in height.
            // The original code used FixedSizeList with itemSize={120}, which is likely WRONG/Buggy for long messages.
            // But I should stick to the original structure if possible, OR switch to a normal map if list is small.
            // Given it's a chat, standard map is often better unless thousands of messages.
            // But I will keep the structure but maybe just ensure it scrolls.
            
            // Actually, for this task I won't rewrite the virtualization logic unless requested, 
            // but I will add the Thinking indicator outside the list or as the last item?
            // If I use virtualization, the thinking indicator is separate.
            
            listRef.current.scrollToItem(messages.length, 'end');
        }
    }, [messages.length, messages[messages.length-1]?.text]); // Scroll on text update too

    // Note: VariableSizedList is better for chat, but sticking to existing FixedSizeList for now.
    // However, since I'm implementing "Thinking", I'll just render it below the list if using flex.
    
    // Better approach: Just use a standard div for the list for now if virtualization is not critical, 
    // OR keep using AutoSizer but put the indicator below it?
    // Let's keep the existing code structure.

    const Row = ({ index, style }) => (
        <div style={style}>
            <MessageItem message={messages[index]} />
        </div>
    );

    return (
        <Box sx={{ flex: 1, p: 1, display: 'flex', flexDirection: 'column' }}>
            {messages.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                    <SmartToyIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">Start a conversation</Typography>
                </Box>
            ) : (
                <Box sx={{ flex: 1 }}>
                     {/* 
                       Using FixedSizeList with Markdown is definitely going to clip content.
                       I will check if I should replace it with a simple map for better UX (Markdown heights vary).
                       The user asked for QoL improvements. Fixing broken scrolling/clipping IS QoL.
                       I will replace Virtualized List with a standard scrollable Box for better Markdown support.
                     */}
                    <Box sx={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {messages.map((msg) => (
                            <MessageItem key={msg.id} message={msg} />
                        ))}
                        {isGenerating && !messages[messages.length - 1]?.isStreaming && (
                             <Box sx={{ display: 'flex', alignItems: 'center', p: 2, color: 'text.secondary' }}>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                <Typography variant="caption">Thinking...</Typography>
                            </Box>
                        )}
                        <div ref={(el) => { if (el) el.scrollIntoView({ behavior: 'smooth' }); }} />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default React.memo(MessageList);
