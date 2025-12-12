import React from 'react';
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
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

const DRAWER_WIDTH = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle, view, setView, onNewChat }) => {
    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.sidebar' }}>
            <Toolbar sx={{ px: 2 }}>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Ollama Chat
                </Typography>
            </Toolbar>
            <Divider />
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={onNewChat}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'primary.dark' },
                        justifyContent: 'center',
                        mb: 2
                    }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography fontWeight="bold">New Chat</Typography>
                </ListItemButton>
            </Box>
            <List sx={{ flexGrow: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton selected={view === 'chat'} onClick={() => { setView('chat'); if (mobileOpen) handleDrawerToggle(); }}>
                        <ListItemIcon><ChatIcon color={view === 'chat' ? 'primary' : 'inherit'} /></ListItemIcon>
                        <ListItemText primary="Chat" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton selected={view === 'settings'} onClick={() => { setView('settings'); if (mobileOpen) handleDrawerToggle(); }}>
                        <ListItemIcon><SettingsIcon color={view === 'settings' ? 'primary' : 'inherit'} /></ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
