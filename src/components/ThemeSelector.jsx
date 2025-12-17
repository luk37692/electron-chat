import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import AcUnitIcon from '@mui/icons-material/AcUnit';

const ThemeSelector = React.memo(({ value, onChange }) => {
    const handleChange = (event, newValue) => {
        if (newValue !== null) {
            onChange(newValue);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={handleChange}
                aria-label="theme selection"
                size="small"
                fullWidth
                sx={{
                    '& .MuiToggleButton-root': {
                        flex: 1,
                        textTransform: 'none',
                        px: 1, // Reduced padding to fit 4 items
                    }
                }}
            >
                <ToggleButton value="light" aria-label="light mode">
                    <LightModeIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">White</Typography>
                </ToggleButton>
                <ToggleButton value="system" aria-label="system mode">
                    <SettingsBrightnessIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">System</Typography>
                </ToggleButton>
                <ToggleButton value="dark" aria-label="dark mode">
                    <DarkModeIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Dark</Typography>
                </ToggleButton>
                <ToggleButton value="christmas" aria-label="christmas mode">
                    <AcUnitIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Xmas</Typography>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
});

export default ThemeSelector;
