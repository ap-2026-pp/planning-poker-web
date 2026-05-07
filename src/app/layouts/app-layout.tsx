import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import { Header } from '@widgets/header';
import styles from './app-layout.module.css';

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isHomePage = pathname === appRoutes.home;

  return (
    <Box
      className={[styles.page, isHomePage ? styles.pageHome : styles.pageDefault].join(' ')}
    >
      <Box className={[styles.shell, isHomePage ? styles.shellHome : ''].join(' ').trim()}>
        <Header />

        {isHomePage ? (
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
