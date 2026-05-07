import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import { Header } from '@widgets/header';
import styles from './app-layout.module.css';

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isHeroPage =
    pathname === appRoutes.home ||
    pathname === appRoutes.login ||
    pathname === appRoutes.register;

  return (
    <Box
      className={[styles.page, isHeroPage ? styles.pageHome : styles.pageDefault].join(' ')}
    >
      <Box className={[styles.shell, isHeroPage ? styles.shellHome : ''].join(' ').trim()}>
        <Header />

        {isHeroPage ? (
          <Container maxWidth="xl" className={styles.homeContent}>
            <Outlet />
          </Container>
        ) : (
          <Container maxWidth="xl" className={styles.defaultContent}>
            <Outlet />
          </Container>
        )}
      </Box>
    </Box>
  );
};
