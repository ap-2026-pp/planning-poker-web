import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { AppBar, Button, Container, IconButton, Stack, Toolbar } from '@mui/material';
import type { CSSProperties } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import { BrandMark } from '@shared/ui/BrandMark';
import styles from './header.module.css';
import { UserGamesMenu } from './user-games-menu';

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
}: DefaultHeaderProps) => (
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
          <Stack direction="row" alignItems="center" component={RouterLink} to={appRoutes.home} className={styles.brandLink}>
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
                <Button component={RouterLink} to={appRoutes.account} variant="text" className={styles.defaultTextButton}>
                  {userLabel}
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => void onLogout()} className={styles.defaultOutlineButton}>
                  Вийти
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to={appRoutes.login} variant="text" className={styles.defaultTextButton}>
                  Вхід
                </Button>
                <Button
                  component={RouterLink}
                  to={appRoutes.register}
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
);
