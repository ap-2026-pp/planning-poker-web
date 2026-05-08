import { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useRoutes } from 'react-router-dom';

import { AppLayout } from '@app/layouts/app-layout';
import styles from './routes.module.css';

const MainPage = lazy(() => import('@pages/main').then((module) => ({ default: module.MainPage })));
const LoginPage = lazy(() => import('@pages/login').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@pages/register').then((module) => ({ default: module.RegisterPage })));
const AccountPage = lazy(() => import('@pages/account').then((module) => ({ default: module.AccountPage })));
const CreateGamePage = lazy(() =>
  import('@pages/create-game').then((module) => ({ default: module.CreateGamePage }))
);
const JoinGamePage = lazy(() => import('@pages/join-game').then((module) => ({ default: module.JoinGamePage })));
const GameRoomPage = lazy(() =>
  import('@pages/game-room').then((module) => ({ default: module.GameRoomPage }))
);
const VotingHistoryPage = lazy(() =>
  import('@pages/voting-history').then((module) => ({ default: module.VotingHistoryPage }))
);

const NotFoundPage = () => <MainPage />;

const RouterFallback = () => (
  <Box className={styles.fallback}>
    <CircularProgress color="primary" />
  </Box>
);

export const AppRoutes = () =>
  useRoutes([
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<RouterFallback />}>
              <MainPage />
            </Suspense>
          ),
        },
        {
          path: 'login',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <LoginPage />
            </Suspense>
          ),
        },
        {
          path: 'register',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <RegisterPage />
            </Suspense>
          ),
        },
        {
          path: 'account',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <AccountPage />
            </Suspense>
          ),
        },
        {
          path: 'games/create',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <CreateGamePage />
            </Suspense>
          ),
        },
        {
          path: 'join',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <JoinGamePage />
            </Suspense>
          ),
        },
        {
          path: 'games/:gameId',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <GameRoomPage />
            </Suspense>
          ),
        },
        {
          path: 'games/:gameId/history',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <VotingHistoryPage />
            </Suspense>
          ),
        },
        {
          path: '*',
          element: (
            <Suspense fallback={<RouterFallback />}>
              <NotFoundPage />
            </Suspense>
          ),
        },
      ],
    },
  ]);
