import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { AppBar, Button, Container, IconButton, Stack, Toolbar } from '@mui/material';
import type { CSSProperties } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { updateCurrentUserDisplayNameRequest } from '@shared/api';
import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { BrandMark } from '@shared/ui/BrandMark';
import { getUserInitials } from '../../model/get-user-initials';
import { useDisplayNameDialog } from '../../model/use-display-name-dialog';
import { useProfileMenu } from '../../model/use-profile-menu';
import { DisplayNameDialog } from '../profile/display-name-dialog';
import styles from '../header.module.css';
import { ProfileMenu } from '../profile/profile-menu';
import { ThemeMenu } from '../theme/theme-menu';
import { UserGamesMenu } from '../navigation/user-games-menu';

type DefaultHeaderProps = {
  headerVars: Record<string, string>;
  isAuthenticated: boolean;
  userLabel: string;
  onLogout: () => Promise<void>;
  onOpenMobileMenu: () => void;
};

export const DefaultHeader = ({
  headerVars,
  isAuthenticated,
  userLabel,
  onLogout,
  onOpenMobileMenu,
}: DefaultHeaderProps) => {
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

  const userInitials = getUserInitials(userLabel);

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
        position="sticky"
        color="transparent"
        elevation={0}
        className={styles.header}
        style={headerVars as CSSProperties}
      >
        <Toolbar className={styles.toolbar}>
          <Container maxWidth="xl" className={styles.container}>
            <Stack direction="row" alignItems="center" className={styles.leftBlock}>
              <Stack
                direction="row"
                alignItems="center"
                component={RouterLink}
                to={appRoutes.home}
                className={styles.brandLink}
              >
                <BrandMark />
              </Stack>

              <div className={styles.desktopTextButton}>
                <Button component={RouterLink} to={appRoutes.home} variant="text" className={styles.defaultTextButton}>
                  Головна
                </Button>
              </div>
            </Stack>

            <div className={styles.actions}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {isAuthenticated ? (
                  <>
                    <UserGamesMenu variant="default" isMyGamesPage={false} />

                    <Button
                      variant="text"
                      onClick={handleOpenProfileMenu}
                      className={styles.defaultTextButton}
                      aria-label="Відкрити меню користувача"
                    >
                      {userLabel}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to={appRoutes.login}
                      state={{ from: currentPath }}
                      variant="text"
                      className={styles.defaultTextButton}
                    >
                      Вхід
                    </Button>

                    <Button
                      component={RouterLink}
                      to={appRoutes.register}
                      state={{ from: currentPath }}
                      variant="contained"
                      className={styles.filledButton}
                    >
                      Реєстрація
                    </Button>
                  </>
                )}
              </Stack>
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
        showLogout={isAuthenticated}
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
