import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import { Menu, MenuItem } from '@mui/material';

import type { ThemeMode } from '../../model/use-profile-menu';

type ThemeMenuProps = {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  currentTheme: ThemeMode;
  onClose: () => void;
  onSelectTheme: (theme: ThemeMode) => void;
};

export const ThemeMenu = ({
  anchorEl,
  isOpen,
  currentTheme,
  onClose,
  onSelectTheme,
}: ThemeMenuProps) => (
  <Menu
    anchorEl={anchorEl}
    open={isOpen}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <MenuItem
      onClick={() => {
        onSelectTheme('light');
        onClose();
      }}
      selected={currentTheme === 'light'}
    >
      <Brightness7RoundedIcon fontSize="small" style={{ marginRight: 8 }} />
      Світла
    </MenuItem>

    <MenuItem
      onClick={() => {
        onSelectTheme('dark');
        onClose();
      }}
      selected={currentTheme === 'dark'}
    >
      <Brightness4RoundedIcon fontSize="small" style={{ marginRight: 8 }} />
      Темна
    </MenuItem>

    <MenuItem
      onClick={() => {
        onSelectTheme('system');
        onClose();
      }}
      selected={currentTheme === 'system'}
    >
      <SettingsBrightnessRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
      Системна
    </MenuItem>
  </Menu>
);