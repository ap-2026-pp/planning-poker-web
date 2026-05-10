import { useState, type MouseEvent } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useProfileMenu = (initialTheme: ThemeMode = 'system') => {
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [themeAnchorEl, setThemeAnchorEl] = useState<HTMLElement | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(initialTheme);
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

  const handleSelectTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    // TODO: implement theme switching
  };

  return {
    profileAnchorEl,
    themeAnchorEl,
    currentTheme,
    menuError,
    setMenuError,

    isProfileMenuOpen: Boolean(profileAnchorEl),
    isThemeMenuOpen: Boolean(themeAnchorEl),

    handleOpenProfileMenu,
    handleCloseProfileMenu,
    handleOpenThemeMenu,
    handleCloseThemeMenu,
    handleSelectTheme,
  };
};