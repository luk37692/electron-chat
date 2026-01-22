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

const DRAWER_WIDTH = 280;

const App = () => {
  const [view, setView] = useState('chat');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
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
    isGenerating,
    conversationId,
    setConversationId,
  } = useChat(settings);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await window.electronAPI.getConversations();
        setConversations(convs);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };
    loadConversations();
  }, []);

  // Refresh conversations list after message changes
  useEffect(() => {
    const refreshConversations = async () => {
      if (currentConversationId) {
        try {
          const convs = await window.electronAPI.getConversations();
          setConversations(convs);
        } catch (error) {
          console.error('Failed to refresh conversations:', error);
        }
      }
    };
    refreshConversations();
  }, [messages.length, currentConversationId]);

  // Sync conversation ID with useChat
  useEffect(() => {
    setConversationId(currentConversationId);
  }, [currentConversationId, setConversationId]);

  useEffect(() => {
    const removeMenuListener = window.electronAPI.onMenuAction((action) => {
      if (action === 'new-chat') {
        handleCreateNewChat();
      }
    });
    return removeMenuListener;
  }, []);

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

  // Create a new conversation
  const handleCreateNewChat = useCallback(async () => {
    try {
      const newConv = await window.electronAPI.createConversation('New Chat', settings.ollamaModel);
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      handleNewChat();
      setView('chat');
      if (isMobile) setMobileOpen(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Fallback to in-memory chat
      handleNewChat();
      setView('chat');
      if (isMobile) setMobileOpen(false);
    }
  }, [handleNewChat, isMobile, settings.ollamaModel]);

  // Select a conversation
  const handleSelectConversation = useCallback(async (id) => {
    try {
      const messages = await window.electronAPI.getMessages(id);
      // Convert database messages to UI format
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        type: msg.role === 'user' ? 'sent' : 'received',
        attachment: msg.attachment,
        image: msg.image_data,
        mimeType: msg.mime_type,
      }));
      setMessages(formattedMessages);
      setCurrentConversationId(id);
      setView('chat');
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }, [setMessages]);

  // Delete a conversation
  const handleDeleteConversation = useCallback(async (id) => {
    try {
      await window.electronAPI.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }, [currentConversationId, handleNewChat]);

  // Rename a conversation
  const handleRenameConversation = useCallback(async (id, newTitle) => {
    try {
      await window.electronAPI.updateConversationTitle(id, newTitle);
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, title: newTitle } : c
      ));
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  }, []);

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
          onNewChat={handleCreateNewChat}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
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
              onSettingsChange={setSettings}
              isGenerating={isGenerating}
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
