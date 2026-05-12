import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';

import {
  ACCENT_COLORS,
  THEME_MODE_OPTIONS,
  type AccentColor,
  type ThemeMode,
} from '@shared/config/theme';

type ThemeMenuProps = {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  currentTheme: ThemeMode;
  currentAccent: AccentColor;
  onClose: () => void;
  onSelectTheme: (theme: ThemeMode) => void;
  onSelectAccent: (accent: AccentColor) => void;
};

const themeIcons: Record<ThemeMode, typeof Brightness7RoundedIcon> = {
  light: Brightness7RoundedIcon,
  dark: Brightness4RoundedIcon,
  system: SettingsBrightnessRoundedIcon,
};

export const ThemeMenu = ({
  anchorEl,
  isOpen,
  currentTheme,
  currentAccent,
  onClose,
  onSelectTheme,
  onSelectAccent,
}: ThemeMenuProps) => (
  <Menu
    anchorEl={anchorEl}
    open={isOpen}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    MenuListProps={{ sx: { py: 1 } }}
    PaperProps={{
      sx: {
        width: 300,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundImage: 'none',
      },
    }}
  >
    <Typography
      component="p"
      sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.78rem', fontWeight: 800 }}
    >
      Тема
    </Typography>

    {THEME_MODE_OPTIONS.map((theme) => {
      const Icon = themeIcons[theme.value];
      const isSelected = currentTheme === theme.value;

      return (
        <MenuItem
          key={theme.value}
          onClick={() => onSelectTheme(theme.value)}
          selected={isSelected}
        >
          <ListItemIcon>
            <Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{theme.label}</ListItemText>
          {isSelected ? <CheckRoundedIcon color="primary" fontSize="small" /> : null}
        </MenuItem>
      );
    })}

    <Divider sx={{ my: 1 }} />

    <Typography
      component="p"
      sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.78rem', fontWeight: 800 }}
    >
      Акцент
    </Typography>

    {ACCENT_COLORS.map((accent) => {
      const isSelected = currentAccent === accent.value;

      return (
        <MenuItem
          key={accent.value}
          onClick={() => onSelectAccent(accent.value)}
          selected={isSelected}
        >
          <ListItemIcon>
            <Box
              aria-hidden
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${accent.light} 0%, ${accent.dark} 100%)`,
                boxShadow: `0 0 0 4px ${accent.main}22`,
              }}
            />
          </ListItemIcon>
          <ListItemText>{accent.label}</ListItemText>
          {isSelected ? <CheckRoundedIcon color="primary" fontSize="small" /> : null}
        </MenuItem>
      );
    })}
  </Menu>
);
