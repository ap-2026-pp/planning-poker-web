import { useCallback, useEffect, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';

import type { Game } from '@entities/game';
import type { GameParticipant } from '@entities/participant';
import { createSignalRConnection, startSignalRConnection, stopSignalRConnection } from '@shared/realtime';
import {
  buildGameRoomHubUrl,
  gameRoomRealtimeEventNames,
  getGameRoomRealtimeAccessToken,
} from './game-room-realtime';

type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

type UseGameRoomRealtimeParams = {
  gameId: string;
  onParticipantJoined?: (participant: GameParticipant) => void | Promise<void>;
  onParticipantLeft?: (participantId: GameParticipant['id']) => void | Promise<void>;
  onParticipantKicked?: (participantId: GameParticipant['id']) => void | Promise<void>;
  onUserUpdated?: (participant: GameParticipant) => void | Promise<void>;
  onGameUpdated?: (updatedGame: Game | string) => void | Promise<void>;
  onReconnected?: () => void | Promise<void>;
};

export const useGameRoomRealtime = ({
  gameId,
  onParticipantJoined,
  onParticipantLeft,
  onParticipantKicked,
  onUserUpdated,
  onGameUpdated,
  onReconnected,
}: UseGameRoomRealtimeParams) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const handlersRef = useRef({
    onParticipantJoined,
    onParticipantLeft,
    onParticipantKicked,
    onUserUpdated,
    onGameUpdated,
    onReconnected,
  });

  useEffect(() => {
    handlersRef.current = {
      onParticipantJoined,
      onParticipantLeft,
      onParticipantKicked,
      onUserUpdated,
      onGameUpdated,
      onReconnected,
    };
  }, [onGameUpdated, onUserUpdated, onParticipantJoined, onParticipantKicked, onParticipantLeft, onReconnected]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    const connection = createSignalRConnection(buildGameRoomHubUrl(gameId), {
      getAccessToken: getGameRoomRealtimeAccessToken,
    });

    connectionRef.current = connection;

    connection.on(gameRoomRealtimeEventNames.participantJoined, (participant: GameParticipant) => {
      void handlersRef.current.onParticipantJoined?.(participant);
    });

    connection.on(gameRoomRealtimeEventNames.participantLeft, (participantId: GameParticipant['id']) => {
      void handlersRef.current.onParticipantLeft?.(participantId);
    });

    connection.on(
      gameRoomRealtimeEventNames.participantKicked,
      (participantId: GameParticipant['id']) => {
        void handlersRef.current.onParticipantKicked?.(participantId);
      },
    );

    connection.on(gameRoomRealtimeEventNames.userUpdated, (participant: GameParticipant) => {
      void handlersRef.current.onUserUpdated?.(participant);
    });

    connection.on(gameRoomRealtimeEventNames.participantUpdated, (participant: GameParticipant) => {
      void handlersRef.current.onUserUpdated?.(participant);
    });

    connection.on(gameRoomRealtimeEventNames.gameUpdated, (updatedGame: Game | string) => {
      void handlersRef.current.onGameUpdated?.(updatedGame);
    });

    connection.onreconnecting(() => {
      setConnectionStatus('reconnecting');
    });

    connection.onreconnected(async () => {
      setConnectionStatus('connected');
      await handlersRef.current.onReconnected?.();
    });

    connection.onclose(() => {
      setConnectionStatus('disconnected');
    });

    const connect = async () => {
      try {
        setConnectionStatus('connecting');
        await startSignalRConnection(connection);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to start SignalR connection', error);
        setConnectionStatus('disconnected');
      }
    };

    void connect();

    return () => {
      connection.off(gameRoomRealtimeEventNames.participantJoined);
      connection.off(gameRoomRealtimeEventNames.participantLeft);
      connection.off(gameRoomRealtimeEventNames.participantKicked);
      connection.off(gameRoomRealtimeEventNames.userUpdated);
      connection.off(gameRoomRealtimeEventNames.participantUpdated);
      connection.off(gameRoomRealtimeEventNames.gameUpdated);

      void stopSignalRConnection(connection);
      connectionRef.current = null;
    };
  }, [gameId]);

  const retryConnection = useCallback(async () => {
    if (connectionRef.current) {
      try {
        setConnectionStatus('connecting');
        await stopSignalRConnection(connectionRef.current);
        await startSignalRConnection(connectionRef.current);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to retry SignalR connection', error);
        setConnectionStatus('disconnected');
      }
    }
  }, []);

  return { connectionStatus, retryConnection };
};
