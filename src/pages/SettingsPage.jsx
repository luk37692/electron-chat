import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Switch,
    FormControlLabel,
    TextField,
    Divider,
    List,
    ListItem,
    ListItemText,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
} from '@mui/material';
import ThemeSelector from '../components/ThemeSelector';

const SettingsPage = ({ settings, onSettingsChange }) => {
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [models, setModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [modelsError, setModelsError] = useState(null);

    const handleToggle = (setting) => {
        onSettingsChange({
            ...settings,
            [setting]: !settings[setting],
        });
    };

    const handleTextChange = (setting, value) => {
        onSettingsChange({
            ...settings,
            [setting]: value,
        });
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const result = await window.electronAPI.testConnection(settings.ollamaUrl || 'http://localhost:11434');
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: 'Connection test failed' });
        }
        setTesting(false);
    };

    const handleFetchModels = async () => {
        setLoadingModels(true);
        setModelsError(null);
        try {
            const result = await window.electronAPI.fetchModels(settings.ollamaUrl || 'http://localhost:11434');
            if (result.success) {
                setModels(result.models);
                if (result.models.length > 0 && !settings.ollamaModel) {
                    handleTextChange('ollamaModel', result.models[0]);
                }
            } else {
                setModelsError(result.error);
            }
        } catch (error) {
            setModelsError('Failed to fetch models');
        }
        setLoadingModels(false);
    };

    return (
        <Box
            sx={{
                height: '100%',
                overflowY: 'auto',
                bgcolor: 'background.default',
                p: 3,
            }}
        >
            <Container maxWidth="md">
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Settings
                </Typography>

                <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Ollama Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                        💡 Running in WSL? Use your Windows host IP address (e.g., http://172.24.208.1:11434).
                        Find it with: ip route show | grep -i default | awk '{'print $3'}'
                    </Typography>

                    <TextField
                        fullWidth
                        label="Ollama URL"
                        value={settings.ollamaUrl || 'http://localhost:11434'}
                        onChange={(e) => handleTextChange('ollamaUrl', e.target.value)}
                        sx={{ mb: 2 }}
                        helperText="Base URL for Ollama API. WSL users: use Windows host IP"
                    />

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleTestConnection}
                            disabled={testing}
                            startIcon={testing && <CircularProgress size={20} />}
                        >
                            {testing ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleFetchModels}
                            disabled={loadingModels}
                            startIcon={loadingModels && <CircularProgress size={20} />}
                        >
                            {loadingModels ? 'Loading...' : 'Fetch Models'}
                        </Button>
                    </Box>

                    {testResult && (
                        <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                            {testResult.message}
                        </Alert>
                    )}

                    {modelsError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {modelsError}
                        </Alert>
                    )}

                    {models.length > 0 ? (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Model</InputLabel>
                            <Select
                                value={settings.ollamaModel || ''}
                                label="Model"
                                onChange={(e) => handleTextChange('ollamaModel', e.target.value)}
                            >
                                {models.map((model) => (
                                    <MenuItem key={model} value={model}>
                                        {model}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <TextField
                            fullWidth
                            label="Model Name"
                            value={settings.ollamaModel || 'llama3.2'}
                            onChange={(e) => handleTextChange('ollamaModel', e.target.value)}
                            helperText="Click 'Fetch Models' to load available models"
                        />
                    )}
                </Paper>

                <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Appearance
                    </Typography>
                    <List>
                        <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1">Theme</Typography>
                                <Typography variant="caption" color="text.secondary">Select application appearance</Typography>
                            </Box>
                            <ThemeSelector
                                value={settings.themeMode || 'system'}
                                onChange={(newValue) => handleTextChange('themeMode', newValue)}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Compact Mode"
                                secondary="Use compact message layout"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.compactMode || false}
                                        onChange={() => handleToggle('compactMode')}
                                    />
                                }
                                label=""
                            />
                        </ListItem>
                    </List>
                </Paper>

                <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Notifications
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Sound Notifications"
                                secondary="Play sound when receiving messages"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.soundNotifications || false}
                                        onChange={() => handleToggle('soundNotifications')}
                                    />
                                }
                                label=""
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Desktop Notifications"
                                secondary="Show desktop notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.desktopNotifications || false}
                                        onChange={() => handleToggle('desktopNotifications')}
                                    />
                                }
                                label=""
                            />
                        </ListItem>
                    </List>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        About
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Electron Chat v1.0.0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Built with Material UI and Electron
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default SettingsPage;
