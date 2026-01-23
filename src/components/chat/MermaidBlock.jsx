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

// Simple check if mermaid code looks complete
const isLikelyComplete = (code) => {
    if (!code || code.length < 10) return false;
    const trimmed = code.trim();
    // Check for common incomplete patterns
    if (trimmed.endsWith('-->') || trimmed.endsWith('-->|')) return false;
    if (trimmed.endsWith('[') || trimmed.endsWith('(') || trimmed.endsWith('{')) return false;
    // Check for unclosed brackets in the last line
    const lines = trimmed.split('\n');
    const lastLine = lines[lines.length - 1];
    const openBrackets = (lastLine.match(/\[/g) || []).length;
    const closeBrackets = (lastLine.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) return false;
    return true;
};

const MermaidBlock = ({ code }) => {
    const containerRef = useRef(null);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const debounceRef = useRef(null);
    const lastSuccessfulCode = useRef('');

    useEffect(() => {
        // Clear any pending render
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const renderDiagram = async () => {
            if (!code) return;

            const cleanCode = String(code).trim();
            
            // Skip rendering if code looks incomplete
            if (!isLikelyComplete(cleanCode)) {
                // Keep showing loading state for incomplete diagrams
                if (!svg) setLoading(true);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const id = `mermaid-${mermaidId++}`;
                const { svg: renderedSvg } = await mermaid.render(id, cleanCode);
                setSvg(renderedSvg);
                lastSuccessfulCode.current = cleanCode;
            } catch (err) {
                // Only show error if we don't have a previous successful render
                // and the code looks complete
                if (!lastSuccessfulCode.current) {
                    setError(err.message || 'Failed to render diagram');
                }
                // Otherwise keep showing the last successful render
            } finally {
                setLoading(false);
            }
        };

        // Debounce rendering to avoid rapid re-renders during streaming
        debounceRef.current = setTimeout(renderDiagram, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
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
