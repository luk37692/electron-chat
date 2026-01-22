import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import mermaid from 'mermaid';

// Initialize mermaid with theme-aware config
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
});

let mermaidId = 0;

const MermaidBlock = ({ code }) => {
    const containerRef = useRef(null);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!code) return;

            setLoading(true);
            setError(null);

            try {
                const id = `mermaid-${mermaidId++}`;
                const cleanCode = String(code).trim();
                const { svg } = await mermaid.render(id, cleanCode);
                setSvg(svg);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(err.message || 'Failed to render diagram');
            } finally {
                setLoading(false);
            }
        };

        renderDiagram();
    }, [code]);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(String(code).trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    my: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    p: 2,
                    my: 1,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                }}
            >
                Mermaid Error: {error}
                <Box component="pre" sx={{ mt: 1, opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                    {String(code).trim()}
                </Box>
            </Box>
        );
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                my: 1.5,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'auto',
                '& svg': {
                    maxWidth: '100%',
                    height: 'auto',
                },
            }}
        >
            <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <IconButton
                    size="small"
                    onClick={handleCopy}
                    aria-label="Copy diagram code"
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        opacity: 0.7,
                        '&:hover': {
                            opacity: 1,
                            bgcolor: 'background.paper',
                        },
                        zIndex: 1,
                    }}
                >
                    {copied ? (
                        <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
                    ) : (
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )}
                </IconButton>
            </Tooltip>
            <Box
                dangerouslySetInnerHTML={{ __html: svg }}
                sx={{ display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default MermaidBlock;
