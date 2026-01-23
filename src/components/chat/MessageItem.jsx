import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, Avatar, IconButton, Tooltip, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import MermaidBlock from './MermaidBlock';

// Import KaTeX CSS for math rendering
import 'katex/dist/katex.min.css';

// Convert LaTeX bracket notation to dollar notation for remark-math
const preprocessLatex = (text) => {
    if (!text) return text;
    // Convert \[ ... \] to $$ ... $$ (display math)
    let result = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math}$$`);
    // Convert \( ... \) to $ ... $ (inline math)
    result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);
    return result;
};

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
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
        boxShadow: isSent ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
    },
    '&:hover .message-actions': {
        opacity: 1,
    }
}));

// Code block with copy button
const CodeBlock = ({ children, className }) => {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, '');

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box sx={{ position: 'relative', my: 1 }}>
            <Tooltip title={copied ? "Copied!" : "Copy code"}>
                <IconButton
                    size="small"
                    onClick={handleCopy}
                    aria-label="Copy code"
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
            <pre className={className}>
                <code>{children}</code>
            </pre>
        </Box>
    );
};

const MessageItem = ({ message }) => {
    const [showCopied, setShowCopied] = useState(false);
    const isSent = message.type === 'sent';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setShowCopied(true);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                mb: 1.5,
            }}
            role="article"
            aria-label={isSent ? "Your message" : "Assistant message"}
        >
            {!isSent && (
                <Avatar
                    sx={{
                        bgcolor: 'primary.main',
                        width: 32,
                        height: 32,
                        mr: 1,
                        mt: 0.5,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    aria-hidden="true"
                >
                    <SmartToyIcon fontSize="small" />
                </Avatar>
            )}
            <MessagePaper isSent={isSent} elevation={0}>
                {/* Action toolbar */}
                {!isSent && (
                    <Box
                        className="message-actions"
                        sx={{
                            position: 'absolute',
                            top: -12,
                            right: 8,
                            display: 'flex',
                            gap: 0.5,
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 0.5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Tooltip title="Copy message">
                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                aria-label="Copy message"
                                sx={{
                                    p: 0.5,
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                <Box
                    sx={(theme) => ({
                        '& pre': {
                            backgroundColor: isSent ? 'rgba(255,255,255,0.12)' : theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                            padding: theme.spacing(1.5),
                            borderRadius: theme.shape.borderRadius,
                            overflowX: 'auto',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                        },
                        '& code': {
                            fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                            backgroundColor: isSent ? 'rgba(255,255,255,0.12)' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: '0.875em',
                        },
                        '& pre code': {
                            backgroundColor: 'transparent',
                            padding: 0,
                        },
                        '& p': { margin: 0, marginBottom: theme.spacing(1) },
                        '& p:last-child': { marginBottom: 0 },
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                            margin: 0,
                            marginTop: theme.spacing(1.5),
                            marginBottom: theme.spacing(1),
                            fontWeight: 600,
                        },
                        '& ul, & ol': {
                            margin: theme.spacing(0.5, 0),
                            paddingLeft: theme.spacing(3),
                        },
                        '& li': {
                            marginBottom: theme.spacing(0.5),
                        },
                        '& blockquote': {
                            margin: theme.spacing(1, 0),
                            paddingLeft: theme.spacing(1.5),
                            borderLeft: `3px solid ${isSent ? 'rgba(255,255,255,0.4)' : theme.palette.primary.main}`,
                            color: isSent ? 'rgba(255,255,255,0.85)' : theme.palette.text.secondary,
                            fontStyle: 'italic',
                        },
                        '& table': {
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginTop: theme.spacing(1),
                        },
                        '& th, & td': {
                            border: `1px solid ${theme.palette.divider}`,
                            padding: theme.spacing(0.75, 1),
                            textAlign: 'left',
                        },
                        '& th': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            fontWeight: 600,
                        },
                        '& hr': {
                            border: 0,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            margin: theme.spacing(1.5, 0),
                        },
                        '& a': {
                            color: isSent ? theme.palette.common.white : theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        },
                        '& .katex': {
                            fontSize: '1em',
                        },
                        '& .katex-display': {
                            margin: theme.spacing(1, 0),
                            overflowX: 'auto',
                            overflowY: 'hidden',
                        }
                    })}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
                        components={{
                            pre: ({ children }) => <>{children}</>,
                            code: ({ node, inline, className, children, ...props }) => {
                                // Check if it's a mermaid diagram
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';

                                if (inline) {
                                    return <code className={className} {...props}>{children}</code>;
                                }

                                // Render mermaid diagrams
                                if (language === 'mermaid') {
                                    return <MermaidBlock code={children} />;
                                }

                                return <CodeBlock className={className}>{children}</CodeBlock>;
                            }
                        }}
                    >
                        {preprocessLatex(message.text)}
                    </ReactMarkdown>
                </Box>

                {message.image && (
                    <Box sx={{ mt: 1.5, mb: 0.5, maxWidth: '100%' }}>
                        <img
                            src={`data:${message.mimeType || 'image/jpeg'};base64,${message.image}`}
                            alt="Attached"
                            style={{
                                maxWidth: '100%',
                                borderRadius: 8,
                                display: 'block',
                                cursor: 'pointer',
                            }}
                        />
                    </Box>
                )}

                {message.attachment && (
                    <Chip
                        icon={<AttachFileIcon sx={{ "&&": { color: 'inherit' } }} />}
                        label={message.attachment}
                        size="small"
                        sx={{ mt: 1, bgcolor: 'rgba(0,0,0,0.08)', color: 'inherit' }}
                    />
                )}
            </MessagePaper>
            {isSent && (
                <Avatar
                    sx={{
                        bgcolor: 'grey.600',
                        width: 32,
                        height: 32,
                        ml: 1,
                        mt: 0.5,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    aria-hidden="true"
                >
                    <PersonIcon fontSize="small" />
                </Avatar>
            )}

            {/* Copy feedback snackbar */}
            <Snackbar
                open={showCopied}
                autoHideDuration={2000}
                onClose={() => setShowCopied(false)}
                message="Copied to clipboard"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

export default React.memo(MessageItem);

