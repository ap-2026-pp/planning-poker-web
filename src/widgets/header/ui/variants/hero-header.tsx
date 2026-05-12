import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Container,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import type { CSSProperties } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { updateCurrentUserDisplayNameRequest } from '@shared/api';
import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { BrandMark } from '@shared/ui/BrandMark';
import { useDisplayNameDialog } from '../../model/use-display-name-dialog';
import { useProfileMenu } from '../../model/use-profile-menu';
import { DisplayNameDialog } from '../profile/display-name-dialog';
import styles from '../header.module.css';
import { ProfileMenu } from '../profile/profile-menu';
import { ThemeMenu } from '../theme/theme-menu';
import { UserGamesMenu } from '../navigation/user-games-menu';

type HeroHeaderProps = {
  headerVars: Record<string, string>;
  isHomePage: boolean;
  isMyGamesPage: boolean;
  isAuthenticated: boolean;
  userLabel: string;
  userInitials: string;
  showLogout: boolean;
  onLogout: () => Promise<void>;
  onOpenMobileMenu: () => void;
};

export const HeroHeader = ({
  headerVars,
  isHomePage,
  isMyGamesPage,
  isAuthenticated,
  userLabel,
  userInitials,
  showLogout,
  onLogout,
  onOpenMobileMenu,
}: HeroHeaderProps) => {
  const { user, refreshCurrentUser } = useSession();
  const { pathname, search } = useLocation();
  const currentPath = `${pathname}${search}`;

  const {
    profileAnchorEl,
    themeAnchorEl,
    currentTheme,
    currentAccent,
    menuError,
    isProfileMenuOpen,
    isThemeMenuOpen,
    handleOpenProfileMenu,
    handleCloseProfileMenu,
    handleOpenThemeMenu,
    handleCloseThemeMenu,
    handleSelectTheme,
    handleSelectAccent,
  } = useProfileMenu();

  const displayNameDialog = useDisplayNameDialog({
    initialValue: user?.displayName ?? '',
    requiredMessage: 'Імʼя обовʼязкове.',
    maxLengthMessage: 'Імʼя не має перевищувати 200 символів.',
    fallbackErrorMessage: 'Не вдалося оновити імʼя',
    onSave: async (value) => {
      await updateCurrentUserDisplayNameRequest(value);
      await refreshCurrentUser();
    },
  });

  const handleLogout = async () => {
    handleCloseProfileMenu();
    await onLogout();
  };

  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className={styles.header}
        style={headerVars as CSSProperties}
      >
        <Toolbar className={styles.toolbar}>
          <Container maxWidth="xl" className={styles.container}>
            <Stack direction="row" alignItems="center" className={styles.leftBlock}>
              <Box component={RouterLink} to={appRoutes.home} className={styles.brandLink}>
                <BrandMark inverse />
              </Box>

              <Divider orientation="vertical" flexItem className={styles.navDivider} />

              <Box
                component={RouterLink}
                to={appRoutes.home}
                className={[styles.homeLink, isHomePage ? styles.homeLinkActive : ''].join(' ').trim()}
              >
                <HomeRoundedIcon fontSize="small" />
                <span>Головна</span>
              </Box>

              {isAuthenticated ? (
                <UserGamesMenu variant="hero" isMyGamesPage={isMyGamesPage} />
              ) : null}
            </Stack>

            <div className={styles.actions}>
              {isAuthenticated ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <ButtonBase
                    className={styles.profile}
                    onClick={handleOpenProfileMenu}
                    aria-label="Відкрити меню користувача"
                  >
                    <Avatar className={styles.profileAvatar}>{userInitials}</Avatar>
                    <Typography className={styles.profileEmail}>{userLabel}</Typography>
                    <KeyboardArrowDownRoundedIcon className={styles.profileArrow} />
                  </ButtonBase>
                </Stack>
              ) : (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    component={RouterLink}
                    to={appRoutes.login}
                    state={{ from: currentPath }}
                    variant="outlined"
                    className={styles.outlineButton}
                  >
                    Увійти
                  </Button>
                  <Button
                    component={RouterLink}
                    to={appRoutes.register}
                    state={{ from: currentPath }}
                    variant="contained"
                    className={styles.filledButton}
                  >
                    Зареєструватися
                  </Button>
                </Stack>
              )}
            </div>

            <IconButton className={styles.menuButton} onClick={onOpenMobileMenu} aria-label="Open navigation">
              <MenuRoundedIcon />
            </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

      <ProfileMenu
        anchorEl={profileAnchorEl}
        errorMessage={menuError}
        isOpen={isProfileMenuOpen}
        label={userLabel}
        caption="Користувач"
        initials={userInitials}
        accountLabel="Мій акаунт"
        accountTo={appRoutes.account}
        showLogout={showLogout}
        onClose={handleCloseProfileMenu}
        onEditName={displayNameDialog.open}
        onLogout={handleLogout}
        onNavigateToAccount={handleCloseProfileMenu}
        onOpenThemeMenu={handleOpenThemeMenu}
      />

      <ThemeMenu
        anchorEl={themeAnchorEl}
        isOpen={isThemeMenuOpen}
        currentTheme={currentTheme}
        currentAccent={currentAccent}
        onClose={handleCloseThemeMenu}
        onSelectTheme={handleSelectTheme}
        onSelectAccent={handleSelectAccent}
      />

      <DisplayNameDialog
        title="Змінити імʼя"
        description="Оновіть ваше імʼя, яке відображається в акаунті."
        label="Імʼя"
        errorMessage={displayNameDialog.errorMessage}
        isOpen={displayNameDialog.isOpen}
        isSubmitting={displayNameDialog.isSubmitting}
        value={displayNameDialog.value}
        onChange={displayNameDialog.setValue}
        onClose={displayNameDialog.close}
        onSubmit={displayNameDialog.submit}
      />
    </>
  );
};
