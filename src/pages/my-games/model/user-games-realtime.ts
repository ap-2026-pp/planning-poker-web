import { env } from '@shared/config/env';

export const userGamesRealtimeEventNames = {
  gameUpdated: 'GameUpdated',
} as const;

export const buildUserGamesHubUrl = () => env.userSignalRHubPath;
