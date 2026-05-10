import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Avatar, Box, Button, Divider, Drawer, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import { BrandMark } from '@shared/ui/BrandMark';
import styles from '../header.module.css';

type MobileNavigationDrawerProps = {
  open: boolean;
  isHeroPage: boolean;
  isAuthenticated: boolean;
  userLabel: string;
  userInitials: string;
  onClose: () => void;
  onLogout: () => Promise<void>;
};

export const MobileNavigationDrawer = ({
  open,
  isHeroPage,
  isAuthenticated,
  userLabel,
  userInitials,
  onClose,
  onLogout,
}: MobileNavigationDrawerProps) => {
  const { pathname, search } = useLocation();
  const currentPath = `${pathname}${search}`;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: styles.drawerPaper }}>
      <Box className={styles.drawerBody}>
        <Stack className={styles.drawerStack}>
          <BrandMark inverse={isHeroPage} />
          <Divider className={styles.drawerDivider} />

          <Button
            component={RouterLink}
            to={appRoutes.home}
            state={{ from: currentPath }}
            variant="text"
            className={isHeroPage ? styles.outlineButton : styles.defaultTextButton}
            onClick={onClose}
          >
            Головна
          </Button>

          {isAuthenticated ? (
            <>
              <Box
                component={RouterLink}
                to={appRoutes.account}
                state={{ from: currentPath }}
                onClick={onClose}
                className={styles.drawerProfile}
              >
                <Avatar className={styles.profileAvatar}>{userInitials}</Avatar>
                <Typography className={styles.drawerProfileText}>{userLabel}</Typography>
              </Box>

              <Button
                component={RouterLink}
                to={appRoutes.myGames}
                state={{ from: currentPath }}
                variant="text"
                onClick={onClose}
                className={isHeroPage ? styles.outlineButton : styles.defaultTextButton}
              >
                Ігри
              </Button>

              <Button
                component={RouterLink}
                to={appRoutes.account}
                state={{ from: currentPath }}
                variant="text"
                onClick={onClose}
                className={isHeroPage ? styles.outlineButton : styles.defaultTextButton}
              >
                Мій акаунт
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

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  onClose();
                  void onLogout();
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
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};