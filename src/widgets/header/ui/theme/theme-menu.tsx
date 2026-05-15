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
import styles from './theme-menu.module.css';

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
}: ThemeMenuProps) => {
  const handleSelectTheme = (theme: ThemeMode) => {
    onSelectTheme(theme);
    onClose();
  };

  const handleSelectAccent = (accent: AccentColor) => {
    onSelectAccent(accent);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      MenuListProps={{ disablePadding: true, className: styles.list }}
      PaperProps={{ className: styles.paper }}
    >
      <Typography component="p" className={styles.sectionLabel}>
        Тема
      </Typography>

      {THEME_MODE_OPTIONS.map((theme) => {
        const Icon = themeIcons[theme.value];
        const isSelected = currentTheme === theme.value;

        return (
          <MenuItem
            key={theme.value}
            onClick={() => handleSelectTheme(theme.value)}
            selected={isSelected}
            className={styles.item}
          >
            <ListItemIcon className={styles.itemIcon}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={styles.itemText}>{theme.label}</ListItemText>
            {isSelected ? <CheckRoundedIcon className={styles.check} fontSize="small" /> : null}
          </MenuItem>
        );
      })}

      <Divider className={styles.divider} />

      <Typography component="p" className={styles.sectionLabel}>
        Акцент
      </Typography>

      {ACCENT_COLORS.map((accent) => {
        const isSelected = currentAccent === accent.value;

        return (
          <MenuItem
            key={accent.value}
            onClick={() => handleSelectAccent(accent.value)}
            selected={isSelected}
            className={styles.item}
          >
            <ListItemIcon className={styles.itemIcon}>
              <Box
                aria-hidden
                className={styles.swatch}
                sx={{
                  background: `linear-gradient(135deg, ${accent.light} 0%, ${accent.dark} 100%)`,
                  boxShadow: `0 0 0 4px ${accent.main}22`,
                }}
              />
            </ListItemIcon>
            <ListItemText className={styles.itemText}>{accent.label}</ListItemText>
            {isSelected ? <CheckRoundedIcon className={styles.check} fontSize="small" /> : null}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
