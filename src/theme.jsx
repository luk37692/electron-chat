import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light Palette
                primary: {
                    main: '#2563eb', // Modern blue
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f3f4f6', // Light gray background
                    paper: '#ffffff',
                    sidebar: '#f8fafc', // Sidebar background
                },
                text: {
                    primary: '#1f2937',
                    secondary: '#4b5563',
                },
            }
            : {
                // Dark Palette
                primary: {
                    main: '#3b82f6', // Brighter blue for dark mode
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#111827', // Dark gray/blue
                    paper: '#1f2937', // Slightly lighter for cards
                    sidebar: '#111827',
                },
                text: {
                    primary: '#f9fafb',
                    secondary: '#9ca3af',
                },
            }),
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove weird overlay in dark mode
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: mode === 'light' ? '#e5e7eb' : '#374151',
                    backgroundImage: 'none',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid',
                    borderColor: mode === 'light' ? '#e5e7eb' : '#374151',
                }
            }
        }
    },
});
