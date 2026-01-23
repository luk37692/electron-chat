import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    Toolbar,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    IconButton,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';

const DRAWER_WIDTH = 280;

// Parse simple markdown bold syntax (**text** or __text__)
const parseMarkdownTitle = (text) => {
    if (!text) return text;
    
    // Split by bold patterns while keeping delimiters
    const parts = [];
    let lastIndex = 0;
    const regex = /(\*\*|__)(.*?)\1/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        // Add text before the bold
        if (match.index > lastIndex) {
            parts.push({ text: text.slice(lastIndex, match.index), bold: false });
        }
        // Add bold text
        parts.push({ text: match[2], bold: true });
        lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), bold: false });
    }
    
    return parts.length > 0 ? parts : [{ text, bold: false }];
};

// Format relative time
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
};

// Conversation item component
const ConversationItem = ({ conversation, isActive, onClick, onDelete, onRename, onStartRename }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
    };

    const handleMenuClose = () => setMenuAnchor(null);

    const handleDelete = () => {
        handleMenuClose();
        onDelete(conversation.id);
    };

    const handleRename = () => {
        handleMenuClose();
        onStartRename(conversation);
    };

    return (
        <ListItem
            disablePadding
            sx={{ mb: 0.5 }}
            secondaryAction={
                <IconButton
                    edge="end"
                    size="small"
                    onClick={handleMenuClick}
                    sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '.MuiListItem-root:hover &': { opacity: 1 },
                    }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            }
        >
            <ListItemButton
                selected={isActive}
                onClick={onClick}
                sx={{
                    borderRadius: 1.5,
                    pr: 4,
                    transition: 'all 0.15s ease',
                    '&.Mui-selected': {
                        bgcolor: 'action.selected',
                    },
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <ListItemIcon sx={{ minWidth: 32 }}>
                    <ChatIcon fontSize="small" color={isActive ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Box component="span" sx={{ display: 'inline' }}>
                            {parseMarkdownTitle(conversation.title).map((part, idx) => (
                                <Box
                                    component="span"
                                    key={idx}
                                    sx={{
                                        fontWeight: part.bold ? 700 : isActive ? 600 : 400,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {part.text}
                                </Box>
                            ))}
                        </Box>
                    }
                    secondary={formatRelativeTime(conversation.updated_at)}
                    primaryTypographyProps={{
                        noWrap: true,
                        component: 'div',
                    }}
                    secondaryTypographyProps={{
                        fontSize: '0.75rem',
                    }}
                />
            </ListItemButton>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleRename}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Rename
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>
        </ListItem>
    );
};

const Sidebar = ({
    mobileOpen,
    handleDrawerToggle,
    view,
    setView,
    onNewChat,
    conversations = [],
    currentConversationId,
    onSelectConversation,
    onDeleteConversation,
    onRenameConversation,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [renameDialog, setRenameDialog] = useState({ open: false, conversation: null });
    const [renameValue, setRenameValue] = useState('');

    const handleStartRename = (conversation) => {
        setRenameValue(conversation.title);
        setRenameDialog({ open: true, conversation });
    };

    const handleCloseRenameDialog = () => {
        setRenameDialog({ open: false, conversation: null });
        setRenameValue('');
    };

    const handleConfirmRename = () => {
        if (renameValue.trim() && renameDialog.conversation) {
            onRenameConversation(renameDialog.conversation.id, renameValue.trim());
        }
        handleCloseRenameDialog();
    };

    // Filter conversations by search query
    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const drawerContent = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.sidebar',
            }}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Header */}
            <Toolbar sx={{ px: 2, minHeight: '64px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.contrastText',
                        }}
                    >
                        <ChatIcon fontSize="small" />
                    </Box>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Ollama Chat
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />

            {/* New Chat Button */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Tooltip title="Start a new conversation (Ctrl+N)" placement="right">
                    <ListItemButton
                        onClick={onNewChat}
                        aria-label="New chat"
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderRadius: 2,
                            py: 1.25,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            },
                            justifyContent: 'center',
                        }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        <Typography fontWeight={600}>New Chat</Typography>
                    </ListItemButton>
                </Tooltip>
            </Box>

            {/* Search Box */}
            <Box sx={{ px: 2, pb: 1 }}>
                <TextField
                    size="small"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            fontSize: '0.875rem',
                        },
                    }}
                />
            </Box>

            {/* Conversation History */}
            <Box sx={{ px: 1, py: 0.5 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ px: 1, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    <HistoryIcon sx={{ fontSize: 14 }} />
                    Recent Conversations
                </Typography>
            </Box>

            <List sx={{ flexGrow: 1, px: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                {filteredConversations.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </Typography>
                    </Box>
                ) : (
                    filteredConversations.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isActive={conv.id === currentConversationId}
                            onClick={() => {
                                onSelectConversation(conv.id);
                                setView('chat');
                                if (mobileOpen) handleDrawerToggle();
                            }}
                            onDelete={onDeleteConversation}
                            onRename={onRenameConversation}
                            onStartRename={handleStartRename}
                        />
                    ))
                )}
            </List>

            <Divider />

            {/* Settings */}
            <List sx={{ px: 1, pb: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={view === 'settings'}
                        onClick={() => { setView('settings'); if (mobileOpen) handleDrawerToggle(); }}
                        aria-current={view === 'settings' ? 'page' : undefined}
                        sx={{
                            borderRadius: 1.5,
                            transition: 'all 0.15s ease',
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                            },
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <SettingsIcon color={view === 'settings' ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Settings"
                            primaryTypographyProps={{
                                fontWeight: view === 'settings' ? 600 : 400,
                            }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
            aria-label="Sidebar navigation"
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                    },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>

            {/* Rename Dialog */}
            <Dialog open={renameDialog.open} onClose={handleCloseRenameDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Rename Conversation</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleConfirmRename();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRenameDialog}>Cancel</Button>
                    <Button onClick={handleConfirmRename} variant="contained">Rename</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default React.memo(Sidebar);
