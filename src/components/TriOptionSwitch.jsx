import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

const TriOptionSwitch = React.memo(({ value, onChange }) => {
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
                        px: 2,
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
            </ToggleButtonGroup>
        </Box>
    );
});

export default TriOptionSwitch;
