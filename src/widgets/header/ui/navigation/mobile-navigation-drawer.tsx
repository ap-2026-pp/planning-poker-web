import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type CSSProperties, type MouseEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import { useThemeSettings } from '@shared/config/theme';
import { BrandMark } from '@shared/ui/BrandMark';
import { ThemeMenu } from '../theme/theme-menu';
import styles from '../header.module.css';

type MobileNavigationDrawerProps = {
  open: boolean;
  isHeroPage: boolean;
  isAuthenticated: boolean;
  userLabel: string;
  userInitials: string;
  headerVars: Record<string, string>;
  onClose: () => void;
  onLogout: () => Promise<void>;
};

export const MobileNavigationDrawer = ({
  open,
  isHeroPage,
  isAuthenticated,
  userLabel,
  userInitials,
  headerVars,
  onClose,
  onLogout,
}: MobileNavigationDrawerProps) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const currentPath = `${pathname}${search}`;

  const [isProfileExpanded, setProfileExpanded] = useState(false);
  const [themeAnchorEl, setThemeAnchorEl] = useState<HTMLElement | null>(null);
  const { accentColor, setAccentColor, setThemeMode, themeMode } = useThemeSettings();

  const handleOpenThemeMenu = (event: MouseEvent<HTMLElement>) => {
    setThemeAnchorEl(event.currentTarget);
  };

  const handleCloseThemeMenu = () => {
    setThemeAnchorEl(null);
  };

  const handleOpenAccount = async () => {
    onClose();

    await navigate(appRoutes.account, {
      state: { from: currentPath },
    });
  };

  const handleLogout = async () => {
    onClose();
    await onLogout();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          className: styles.drawerPaper,
          style: headerVars as CSSProperties,
        }}
      >
        <Box className={styles.drawerBody}>
          <Box className={styles.drawerHeader}>
            <BrandMark inverse={isHeroPage} />

            <IconButton
              className={styles.drawerCloseButton}
              onClick={onClose}
              aria-label="Закрити меню"
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Divider className={styles.drawerDivider} />

          <Stack className={styles.drawerStack}>
            {isAuthenticated ? (
              <Box className={styles.drawerProfileBlock}>
                <button
                  type="button"
                  className={styles.drawerProfileButton}
                  onClick={() => setProfileExpanded((current) => !current)}
                  aria-expanded={isProfileExpanded}
                >
                  <Avatar className={styles.profileAvatar}>{userInitials}</Avatar>

                  <Box className={styles.drawerProfileTextBlock}>
                    <Typography className={styles.drawerProfileText}>
                      {userLabel}
                    </Typography>

                    <Typography className={styles.drawerProfileHint}>
                      Профіль і налаштування
                    </Typography>
                  </Box>

                  <ExpandMoreRoundedIcon
                    className={[
                      styles.drawerProfileArrow,
                      isProfileExpanded ? styles.drawerProfileArrowExpanded : '',
                    ]
                      .join(' ')
                      .trim()}
                  />
                </button>

                <Collapse in={isProfileExpanded} timeout={220} unmountOnExit>
                  <Stack className={styles.drawerProfileSubmenu}>
                    <button
                      type="button"
                      className={styles.drawerProfileSubmenuItem}
                      onClick={() => void handleOpenAccount()}
                    >
                      <AccountCircleRoundedIcon fontSize="small" />
                      <span>Мій акаунт</span>
                    </button>

                    <button
                      type="button"
                      className={styles.drawerProfileSubmenuItem}
                      onClick={handleOpenThemeMenu}
                    >
                      <PaletteRoundedIcon fontSize="small" />
                      <span>Вигляд</span>
                    </button>

                    <button
                      type="button"
                      className={[
                        styles.drawerProfileSubmenuItem,
                        styles.drawerProfileSubmenuItemDanger,
                      ]
                        .join(' ')
                        .trim()}
                      onClick={() => void handleLogout()}
                    >
                      <LogoutRoundedIcon fontSize="small" />
                      <span>Вийти з акаунта</span>
                    </button>
                  </Stack>
                </Collapse>
              </Box>
            ) : null}

            <Button
              component={RouterLink}
              to={appRoutes.home}
              state={{ from: currentPath }}
              variant="text"
              className={styles.drawerNavButton}
              onClick={onClose}
            >
              Головна
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to={appRoutes.myGames}
                  state={{ from: currentPath }}
                  variant="text"
                  onClick={onClose}
                  className={styles.drawerNavButton}
                >
                  Ігри
                </Button>

                <Button
                  component={RouterLink}
                  to={appRoutes.createGame}
                  state={{ from: currentPath }}
                  variant="contained"
                  onClick={onClose}
                  className={styles.drawerPrimaryButton}
                >
                  Створити гру
                </Button>

                <Button
                  component={RouterLink}
                  to={appRoutes.joinGame}
                  state={{ from: currentPath }}
                  variant="outlined"
                  onClick={onClose}
                  className={styles.drawerOutlineButton}
                >
                  Приєднатися до гри
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to={appRoutes.login}
                  state={{ from: currentPath }}
                  variant="outlined"
                  onClick={onClose}
                  className={styles.drawerOutlineButton}
                >
                  Увійти
                </Button>

                <Button
                  component={RouterLink}
                  to={appRoutes.register}
                  state={{ from: currentPath }}
                  variant="contained"
                  onClick={onClose}
                  className={styles.drawerRegisterButton}
                >
                  Зареєструватися
                </Button>

                <Button
                  component={RouterLink}
                  to={appRoutes.joinGame}
                  state={{ from: currentPath }}
                  variant="contained"
                  onClick={onClose}
                  className={styles.drawerSecondaryFilledButton}
                >
                  Приєднатися до гри
                </Button>

                <Button
                  type="button"
                  variant="text"
                  startIcon={<PaletteRoundedIcon />}
                  onClick={handleOpenThemeMenu}
                  className={styles.drawerNavButton}
                >
                  Вигляд
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Drawer>

      <ThemeMenu
        anchorEl={themeAnchorEl}
        isOpen={Boolean(themeAnchorEl)}
        currentTheme={themeMode}
        currentAccent={accentColor}
        onClose={handleCloseThemeMenu}
        onSelectTheme={setThemeMode}
        onSelectAccent={setAccentColor}
      />
    </>
  );
};
