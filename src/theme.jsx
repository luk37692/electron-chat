import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
    const paletteMode = mode === 'christmas' ? 'light' : mode;

    const getPalette = (mode) => {
        switch (mode) {
            case 'light':
                return {
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
                };
            case 'christmas':
                return {
                    // Christmas Palette
                    primary: {
                        main: '#d32f2f', // Christmas Red
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        main: '#2e7d32', // Christmas Green
                        contrastText: '#ffffff',
                    },
                    background: {
                        default: '#f1f8e9', // Very light green (snowy/mint)
                        paper: '#ffffff',
                        sidebar: '#1b5e20', // Dark Green sidebar
                    },
                    text: {
                        primary: '#1b5e20', // Dark green text for high contrast
                        secondary: '#2e7d32',
                    },
                };
            case 'dark':
            default:
                return {
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
                };
        }
    };

    return createTheme({
        palette: {
            mode: paletteMode,
            ...getPalette(mode),
        },
        typography: {
            fontFamily: [
                'Inter',
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
            ].join(','),
            h4: {
                fontWeight: 700,
                letterSpacing: '-0.02em',
            },
            h5: {
                fontWeight: 600,
                letterSpacing: '-0.01em',
            },
            h6: {
                fontWeight: 600,
            },
            body1: {
                lineHeight: 1.6,
            },
            body2: {
                lineHeight: 1.5,
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
                        borderColor: paletteMode === 'light' ? '#e5e7eb' : '#374151',
                        backgroundImage: 'none',
                        ...(mode === 'christmas' && {
                            backgroundColor: '#d32f2f', // Red header for Christmas
                            borderColor: '#b71c1c',
                            color: '#ffffff',
                        }),
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        borderRight: '1px solid',
                        borderColor: paletteMode === 'light' ? '#e5e7eb' : '#374151',
                        ...(mode === 'christmas' && {
                            backgroundColor: '#1b5e20', // Ensure sidebar is green
                            color: '#ffffff',
                            borderColor: '#2e7d32',
                        }),
                    }
                }
            },
            ...(mode === 'christmas' && {
                MuiListItemText: {
                    styleOverrides: {
                        primary: {
                            color: '#ffffff', // White text in sidebar
                        },
                        secondary: {
                            color: 'rgba(255, 255, 255, 0.7)',
                        }
                    }
                },
                MuiListItemIcon: {
                    styleOverrides: {
                        root: {
                            color: '#ffffff',
                        }
                    }
                }
            })
        },
    });
};
