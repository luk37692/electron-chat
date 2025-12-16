import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import Sidebar from './components/layout/Sidebar';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import { useSettings } from './hooks/useSettings';
import { useChat } from './hooks/useChat';

const DRAWER_WIDTH = 260;

const App = () => {
  const [view, setView] = useState('chat'); // 'chat' or 'settings'
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const { settings, setSettings, theme, isSettingsLoaded } = useSettings();
  const {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    attachedFile,
    setAttachedFile,
    handleNewChat,
    handleAttachFile,
    handleSend,
    isGenerating // Get isGenerating from useChat
  } = useChat(settings);

  useEffect(() => {
    const removeMenuListener = window.electronAPI.onMenuAction((action) => {
      if (action === 'new-chat') {
        handleNewChat();
      }
    });
    return removeMenuListener;
  }, [handleNewChat]);

  // Prevent default drag-drop behavior at document level
  useEffect(() => {
    const preventDragOver = (e) => {
      e.preventDefault();
    };

    const preventDrop = (e) => {
      if (!e.target.closest('[data-dropzone="true"]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('dragover', preventDragOver);
    document.addEventListener('drop', preventDrop);

    return () => {
      document.removeEventListener('dragover', preventDragOver);
      document.removeEventListener('drop', preventDrop);
    };
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const onNewChat = useCallback(() => {
    handleNewChat();
    setView('chat');
    if (isMobile) setMobileOpen(false);
  }, [handleNewChat, isMobile]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { sm: `${DRAWER_WIDTH}px` },
            display: { sm: 'none' }, 
            bgcolor: 'background.default',
            color: 'text.primary',
            boxShadow: 1
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {view === 'chat' ? 'Chat' : 'Settings'}
            </Typography>
          </Toolbar>
        </AppBar>

        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          view={view}
          setView={setView}
          onNewChat={onNewChat}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            pt: { xs: 7, sm: 0 },
            bgcolor: 'background.default'
          }}
        >
          {view === 'chat' ? (
            <ChatPage
              messages={messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSend={handleSend}
              handleAttachFile={handleAttachFile}
              attachedFile={attachedFile}
              setAttachedFile={setAttachedFile}
              settings={settings}
              onSettingsChange={setSettings} // Pass onSettingsChange
              isGenerating={isGenerating} // Pass isGenerating
            />
          ) : (
            <SettingsPage settings={settings} onSettingsChange={setSettings} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
