import { useState, type MouseEvent } from 'react';

import { useThemeSettings } from '@shared/config/theme';

export const useProfileMenu = () => {
  const { accentColor, setAccentColor, setThemeMode, themeMode } = useThemeSettings();

  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [themeAnchorEl, setThemeAnchorEl] = useState<HTMLElement | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  const handleOpenProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setMenuError(null);
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const handleOpenThemeMenu = () => {
    setThemeAnchorEl(profileAnchorEl);
    handleCloseProfileMenu();
  };

  const handleCloseThemeMenu = () => {
    setThemeAnchorEl(null);
  };

  return {
    profileAnchorEl,
    themeAnchorEl,
    currentTheme: themeMode,
    currentAccent: accentColor,
    menuError,
    setMenuError,

    isProfileMenuOpen: Boolean(profileAnchorEl),
    isThemeMenuOpen: Boolean(themeAnchorEl),

    handleOpenProfileMenu,
    handleCloseProfileMenu,
    handleOpenThemeMenu,
    handleCloseThemeMenu,
    handleSelectTheme: setThemeMode,
    handleSelectAccent: setAccentColor,
  };
};
