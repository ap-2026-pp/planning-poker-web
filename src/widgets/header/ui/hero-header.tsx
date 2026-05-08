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
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import type { CSSProperties } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import { BrandMark } from '@shared/ui/BrandMark';
import styles from './header.module.css';

type HeroHeaderProps = {
  headerVars: Record<string, string>;
  isHomePage: boolean;
  isAuthenticated: boolean;
  userLabel: string;
  userInitials: string;
  onLogout: () => Promise<void>;
  onOpenMobileMenu: () => void;
};

export const HeroHeader = ({
  headerVars,
  isHomePage,
  isAuthenticated,
  userLabel,
  userInitials,
  onLogout,
  onOpenMobileMenu,
}: HeroHeaderProps) => (
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
        </Stack>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Box component={RouterLink} to={appRoutes.account} className={styles.profile}>
                <Avatar className={styles.profileAvatar}>{userInitials}</Avatar>
                <Typography className={styles.profileEmail}>{userLabel}</Typography>
                <KeyboardArrowDownRoundedIcon className={styles.profileArrow} />
              </Box>

              <Button
                variant="outlined"
                startIcon={<LogoutRoundedIcon />}
                onClick={() => void onLogout()}
                className={styles.logoutButton}
              >
                Вийти
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              <Button component={RouterLink} to={appRoutes.login} variant="outlined" className={styles.outlineButton}>
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
          )}
        </div>

        <IconButton className={styles.menuButton} onClick={onOpenMobileMenu} aria-label="Open navigation">
          <MenuRoundedIcon />
        </IconButton>
      </Container>
    </Toolbar>
  </AppBar>
);
