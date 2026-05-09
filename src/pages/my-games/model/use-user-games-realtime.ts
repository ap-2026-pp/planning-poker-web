import { useEffect, useRef } from 'react';
import type { HubConnection } from '@microsoft/signalr';

import type { UserGame } from '@entities/game';
import { createSignalRConnection, startSignalRConnection, stopSignalRConnection } from '@shared/realtime';
import {
  buildUserGamesHubUrl,
  getUserGamesRealtimeAccessToken,
  userGamesRealtimeEventNames,
} from './user-games-realtime';

type UseUserGamesRealtimeParams = {
  onGameUpdated?: (updatedGame: UserGame | { id: string; isDeleted?: boolean } | string) =>
    void | Promise<void>;
};

export const useUserGamesRealtime = ({ onGameUpdated }: UseUserGamesRealtimeParams) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef({ onGameUpdated });

  useEffect(() => {
    handlersRef.current = { onGameUpdated };
  }, [onGameUpdated]);

  useEffect(() => {
    const connection = createSignalRConnection(buildUserGamesHubUrl(), {
      getAccessToken: getUserGamesRealtimeAccessToken,
    });

    connectionRef.current = connection;

    connection.on(userGamesRealtimeEventNames.gameUpdated, (updatedGame: UserGame | { id: string; isDeleted?: boolean } | string) => {
      void handlersRef.current.onGameUpdated?.(updatedGame);
    });

    const connect = async () => {
      try {
        await startSignalRConnection(connection);
      } catch (error) {
        console.error('Failed to start user games SignalR connection', error);
      }
    };

    void connect();

    return () => {
      connection.off(userGamesRealtimeEventNames.gameUpdated);
      void stopSignalRConnection(connection);
      connectionRef.current = null;
    };
  }, [onGameUpdated]);
};
