import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import Settings from './Settings';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    username: 'User',
    statusMessage: '',
    ollamaModel: 'llama3.2',
    ollamaUrl: 'http://localhost:11434',
    darkMode: false,
    compactMode: false,
    soundNotifications: true,
    desktopNotifications: true,
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for incoming messages from main process
    const cleanup = window.electronAPI.onMessage((message) => {
      setMessages((prev) => [...prev, { text: message, type: 'received' }]);
    });
    
    // Cleanup listener on unmount
    return cleanup;
  }, []);

  const handleSend = () => {
    const text = inputValue.trim();
    if (text) {
      // Add sent message to UI
      setMessages((prev) => [...prev, { text, type: 'sent' }]);
      
      // Send to main process
      window.electronAPI.sendMessage(text, {
        model: settings.ollamaModel,
        url: settings.ollamaUrl
      });
      
      // Clear input
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* App Bar with Tabs */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Electron Chat
          </Typography>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab icon={<ChatIcon />} label="Chat" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Content Area */}
      {currentTab === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: '#f5f5f5',
          }}
        >
          {/* Chat messages area */}
          <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
        }}
      >
        <Container maxWidth="md">
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.type === 'sent' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  backgroundColor: message.type === 'sent' ? '#2196f3' : '#fff',
                  color: message.type === 'sent' ? '#fff' : '#000',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      {/* Input area */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Container>
      </Paper>
        </Box>
      ) : (
        <Settings settings={settings} onSettingsChange={setSettings} />
      )}
    </Box>
  );
};

export default App;
