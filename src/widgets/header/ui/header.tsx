import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useMemo, useState, type CSSProperties } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { BrandMark } from '@shared/ui/BrandMark';
import styles from './header.module.css';

const getInitials = (email?: string) => {
  if (!email) {
    return 'U';
  }

  const [localPart] = email.split('@');
  const words = localPart
    .split(/[._-]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return localPart.slice(0, 1).toUpperCase();
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
};

export const Header = () => {
  const { user, isAuthenticated, logout } = useSession();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === appRoutes.home;
  const userInitials = useMemo(() => getInitials(user?.email), [user?.email]);
  const headerVars = isHomePage
    ? {
        '--header-border': 'rgba(255,255,255,0.08)',
        '--header-background': 'transparent',
        '--header-backdrop': 'none',
        '--menu-button-color': '#F8F3FF',
        '--menu-button-border': 'rgba(255,255,255,0.14)',
        '--menu-button-background': 'rgba(255,255,255,0.04)',
        '--drawer-background':
          'linear-gradient(180deg, rgba(10,11,25,0.98) 0%, rgba(22,14,42,0.98) 100%)',
        '--drawer-text-color': '#F8F3FF',
        '--drawer-divider': 'rgba(255,255,255,0.12)',
        '--drawer-profile-border': 'rgba(255,255,255,0.12)',
        '--drawer-profile-background': 'rgba(255,255,255,0.04)',
        '--drawer-outline-color': '#F8F3FF',
        '--drawer-outline-border': 'rgba(255,255,255,0.18)',
      }
    : {
        '--header-border': 'rgba(12,34,48,0.10)',
        '--header-background': 'rgba(239,245,251,0.78)',
        '--header-backdrop': 'blur(18px)',
        '--menu-button-color': '#0C2230',
        '--menu-button-border': 'rgba(255,255,255,0.8)',
        '--menu-button-background': 'rgba(255,255,255,0.7)',
        '--drawer-background': 'rgba(255,255,255,0.98)',
        '--drawer-text-color': '#0C2230',
        '--drawer-divider': 'rgba(12,34,48,0.10)',
        '--drawer-profile-border': 'rgba(17,24,39,0.08)',
        '--drawer-profile-background': 'rgba(17,24,39,0.04)',
        '--drawer-outline-color': '#0C2230',
        '--drawer-outline-border': 'rgba(12,34,48,0.10)',
      };

  const desktopAuthActions = isAuthenticated ? (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box className={styles.profile}>
        <Avatar className={styles.profileAvatar}>
          {userInitials}
        </Avatar>

        <Typography className={styles.profileEmail}>
          {user?.email}
        </Typography>

        <KeyboardArrowDownRoundedIcon className={styles.profileArrow} />
      </Box>

      <Button
        variant="outlined"
        startIcon={<LogoutRoundedIcon />}
        onClick={() => void logout()}
        className={styles.logoutButton}
      >
        Вийти
      </Button>
    </Stack>
  ) : (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button
        component={RouterLink}
        to={appRoutes.login}
        variant="outlined"
        className={styles.outlineButton}
      >
        Увійти
      </Button>

      <Button
        component={RouterLink}
        to={appRoutes.register}
        variant="contained"
        className={styles.filledButton}
      >
        Зареєструватися
      </Button>
    </Stack>
  );

  return (
    <>
      <AppBar
        position={isHomePage ? 'static' : 'sticky'}
        color="transparent"
        elevation={0}
        className={styles.header}
        style={headerVars as CSSProperties}
      >
        <Toolbar className={styles.toolbar}>
          {isHomePage ? (
            <Container maxWidth="xl" className={styles.container}>
              <Stack direction="row" alignItems="center" className={styles.leftBlock}>
                <Box
                  component={RouterLink}
                  to={appRoutes.home}
                  className={styles.brandLink}
                >
                  <BrandMark inverse />
                </Box>

                <Divider orientation="vertical" flexItem className={styles.navDivider} />

                <Box component={RouterLink} to={appRoutes.home} className={styles.homeLink}>
                  <HomeRoundedIcon fontSize="small" />
                  <span>Головна</span>
                </Box>
              </Stack>

              <div className={styles.actions}>{desktopAuthActions}</div>

              <IconButton className={styles.menuButton} onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation">
                <MenuRoundedIcon />
              </IconButton>
            </Container>
          ) : (
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
                  <Button
                    component={RouterLink}
                    to={appRoutes.home}
                    variant="text"
                    className={styles.defaultTextButton}
                  >
                    Головна
                  </Button>
                </div>
              </Stack>

              <div className={styles.actions}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {isAuthenticated ? (
                    <>
                      <Typography className={styles.drawerProfileText}>{user?.email}</Typography>
                      <Button variant="outlined" color="secondary" onClick={() => void logout()} className={styles.defaultOutlineButton}>
                        Вийти
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button component={RouterLink} to={appRoutes.login} variant="text" className={styles.defaultTextButton}>
                        Вхід
                      </Button>
                      <Button component={RouterLink} to={appRoutes.register} variant="contained" className={styles.filledButton}>
                        Реєстрація
                      </Button>
                    </>
                  )}
                </Stack>
              </div>

              <IconButton className={styles.menuButton} onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation">
                <MenuRoundedIcon />
              </IconButton>
            </Container>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ className: styles.drawerPaper }}
      >
        <Box className={styles.drawerBody}>
          <Stack className={styles.drawerStack}>
            <BrandMark inverse={isHomePage} />
            <Divider className={styles.drawerDivider} />

            <Button
              component={RouterLink}
              to={appRoutes.home}
              variant="text"
              className={isHomePage ? styles.outlineButton : styles.defaultTextButton}
              onClick={() => setMobileMenuOpen(false)}
            >
              Головна
            </Button>

            {isAuthenticated ? (
              <>
                <Box
                  className={styles.drawerProfile}
                >
                  <Avatar className={styles.profileAvatar}>
                    {userInitials}
                  </Avatar>
                  <Typography className={styles.drawerProfileText}>{user?.email}</Typography>
                </Box>

                <Button
                  component={RouterLink}
                  to={appRoutes.createGame}
                  variant="contained"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.drawerPrimaryButton}
                >
                  Створити гру
                </Button>

                <Button
                  component={RouterLink}
                  to={appRoutes.joinGame}
                  variant="outlined"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.drawerOutlineButton}
                >
                  Приєднатися до гри
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void logout();
                  }}
                  startIcon={<LogoutRoundedIcon />}
                  className={styles.drawerOutlineButton}
                >
                  Вийти
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to={appRoutes.login}
                  variant="outlined"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.drawerOutlineButton}
                >
                  Увійти
                </Button>

                <Button
                  component={RouterLink}
                  to={appRoutes.register}
                  variant="contained"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.drawerRegisterButton}
                >
                  Зареєструватися
                </Button>

                <Button
                  component={RouterLink}
                  to={appRoutes.joinGame}
                  variant="contained"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.drawerSecondaryFilledButton}
                >
                  Приєднатися до гри
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};
