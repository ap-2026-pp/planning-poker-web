import { useEffect, useRef } from 'react';
import type { HubConnection } from '@microsoft/signalr';

import type { Game } from '@entities/game';
import type { GameParticipant } from '@entities/participant';
import { createSignalRConnection, startSignalRConnection, stopSignalRConnection } from '@shared/realtime';
import {
  buildGameRoomHubUrl,
  gameRoomRealtimeEventNames,
  getGameRoomRealtimeAccessToken,
} from './game-room-realtime';

type UseGameRoomRealtimeParams = {
  gameId: string;
  onParticipantJoined?: (participant: GameParticipant) => void | Promise<void>;
  onParticipantLeft?: (participantId: GameParticipant['id']) => void | Promise<void>;
  onParticipantKicked?: (participantId: GameParticipant['id']) => void | Promise<void>;
  onUserUpdated?: (participant: GameParticipant) => void | Promise<void>;
  onGameUpdated?: (updatedGame: Game | string) => void | Promise<void>;
};

export const useGameRoomRealtime = ({
  gameId,
  onParticipantJoined,
  onParticipantLeft,
  onParticipantKicked,
  onUserUpdated,
  onGameUpdated,
}: UseGameRoomRealtimeParams) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef({
    onParticipantJoined,
    onParticipantLeft,
    onParticipantKicked,
    onUserUpdated,
    onGameUpdated,
  });

  useEffect(() => {
    handlersRef.current = {
      onParticipantJoined,
      onParticipantLeft,
      onParticipantKicked,
      onUserUpdated,
      onGameUpdated,
    };
  }, [onGameUpdated, onUserUpdated, onParticipantJoined, onParticipantKicked, onParticipantLeft]);

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

    const connect = async () => {
      try {
        await startSignalRConnection(connection);
      } catch (error) {
        console.error('Failed to start SignalR connection', error);
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
};
