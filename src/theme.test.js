import { getTheme } from './theme';

describe('getTheme', () => {
    test('returns light theme for light mode', () => {
        const theme = getTheme('light');
        expect(theme.palette.mode).toBe('light');
        expect(theme.palette.primary.main).toBe('#2563eb');
    });

    test('returns dark theme for dark mode', () => {
        const theme = getTheme('dark');
        expect(theme.palette.mode).toBe('dark');
        expect(theme.palette.primary.main).toBe('#3b82f6');
    });

    test('returns christmas theme for christmas mode', () => {
        const theme = getTheme('christmas');
        // Christmas theme uses light mode base
        expect(theme.palette.mode).toBe('light');
        
        // Check custom christmas colors
        expect(theme.palette.primary.main).toBe('#d32f2f'); // Red
        expect(theme.palette.secondary.main).toBe('#2e7d32'); // Green
        expect(theme.palette.background.default).toBe('#f1f8e9'); // Snowy/Mint
        expect(theme.palette.background.sidebar).toBe('#1b5e20'); // Dark Green
        
        // Check component overrides
        expect(theme.components.MuiAppBar.styleOverrides.root.backgroundColor).toBe('#d32f2f');
        expect(theme.components.MuiDrawer.styleOverrides.paper.backgroundColor).toBe('#1b5e20');
    });
});
