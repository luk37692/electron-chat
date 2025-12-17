import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from '@mui/material';
import { getTheme } from '../theme';

export const useSettings = () => {
    const [settings, setSettings] = useState({
        username: 'User',
        statusMessage: '',
        ollamaModel: 'llama3.2',
        ollamaUrl: 'http://localhost:11434',
        themeMode: 'system', // 'light', 'dark', 'christmas', 'system'
        compactMode: false,
        soundNotifications: true,
        desktopNotifications: true,
    });

    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = useMemo(() => {
        let mode = 'light';
        if (settings.themeMode === 'system') {
            mode = prefersDarkMode ? 'dark' : 'light';
        } else {
            mode = settings.themeMode;
        }
        return getTheme(mode);
    }, [settings.themeMode, prefersDarkMode]);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await window.electronAPI.getSettings();
                if (savedSettings) {
                    // Backward compatibility for darkMode boolean
                    if (savedSettings.darkMode !== undefined && !savedSettings.themeMode) {
                        savedSettings.themeMode = savedSettings.darkMode ? 'dark' : 'light';
                        delete savedSettings.darkMode;
                    }
                    setSettings(prev => ({ ...prev, ...savedSettings }));
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsSettingsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        if (isSettingsLoaded) {
            window.electronAPI.saveSettings(settings);
        }
    }, [settings, isSettingsLoaded]);

    return { settings, setSettings, theme, isSettingsLoaded };
};
