import { getValidAccessToken } from '@shared/auth/session-refresh';
import { getGuestAccessToken } from '@shared/auth/token-storage';
import { env } from '@shared/config/env';

export const userGamesRealtimeEventNames = {
  gameUpdated: 'GameUpdated',
} as const;

export const buildUserGamesHubUrl = () => env.userSignalRHubPath;

export const getUserGamesRealtimeAccessToken = () =>
  getValidAccessToken().then((token) => token ?? getGuestAccessToken());
