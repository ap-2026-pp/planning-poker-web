import { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useRoutes } from 'react-router-dom';

import { AppLayout } from '@app/layouts/app-layout';
import { ProtectedRoute } from '@shared/auth';
import styles from './routes.module.css';

const MainPage = lazy(() => import('@pages/main').then((module) => ({ default: module.MainPage })));
const LoginPage = lazy(() => import('@pages/login').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@pages/register').then((module) => ({ default: module.RegisterPage })));
const AccountPage = lazy(() => import('@pages/account').then((module) => ({ default: module.AccountPage })));
const MyGamesPage = lazy(() =>
  import('@pages/my-games').then((module) => ({ default: module.MyGamesPage })),
);
const CreateGamePage = lazy(() =>
  import('@pages/create-game').then((module) => ({ default: module.CreateGamePage })),
);
const EditGamePage = lazy(() =>
  import('@pages/edit-game').then((module) => ({ default: module.EditGamePage })),
);
const JoinGamePage = lazy(() => import('@pages/join-game').then((module) => ({ default: module.JoinGamePage })));
const GameRoomPage = lazy(() =>
  import('@pages/game-room').then((module) => ({ default: module.GameRoomPage })),
);
const VotingHistoryPage = lazy(() =>
  import('@pages/voting-history').then((module) => ({ default: module.VotingHistoryPage })),
);

const NotFoundPage = () => <MainPage />;

const RouterFallback = () => (
  <Box className={styles.fallback}>
    <CircularProgress color="primary" />
  </Box>
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<RouterFallback />}>
    {element}
  </Suspense>
);

const withProtectedSuspense = (element: React.ReactNode, options?: { allowGuest?: boolean }) => (
  <ProtectedRoute allowGuest={options?.allowGuest}>
    <Suspense fallback={<RouterFallback />}>
      {element}
    </Suspense>
  </ProtectedRoute>
);

export const AppRoutes = () =>
  useRoutes([
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: withSuspense(<MainPage />),
        },
        {
          path: 'login',
          element: withSuspense(<LoginPage />),
        },
        {
          path: 'register',
          element: withSuspense(<RegisterPage />),
        },
        {
          path: 'account',
          element: withProtectedSuspense(<AccountPage />),
        },
        {
          path: 'games',
          element: withProtectedSuspense(<MyGamesPage />),
        },
        {
          path: 'games/create',
          element: withProtectedSuspense(<CreateGamePage />),
        },
        {
          path: 'games/:gameId/edit',
          element: withProtectedSuspense(<EditGamePage />),
        },
        {
          path: 'join',
          element: withSuspense(<JoinGamePage />),
        },
        {
          path: 'games/:gameId',
          element: withProtectedSuspense(<GameRoomPage />, { allowGuest: true }),
        },
        {
          path: 'games/:gameId/history',
          element: withProtectedSuspense(<VotingHistoryPage />),
        },
        {
          path: '*',
          element: withSuspense(<NotFoundPage />),
        },
      ],
    },
  ]);
