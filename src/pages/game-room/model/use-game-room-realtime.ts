import { useEffect, useRef } from 'react';
import type { HubConnection } from '@microsoft/signalr';

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
  onMasterChanged?: (participant: GameParticipant) => void | Promise<void>;
};

export const useGameRoomRealtime = ({
  gameId,
  onParticipantJoined,
  onParticipantLeft,
  onParticipantKicked,
  onMasterChanged,
}: UseGameRoomRealtimeParams) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef({
    onParticipantJoined,
    onParticipantLeft,
    onParticipantKicked,
    onMasterChanged,
  });

  useEffect(() => {
    handlersRef.current = {
      onParticipantJoined,
      onParticipantLeft,
      onParticipantKicked,
      onMasterChanged,
    };
  }, [onMasterChanged, onParticipantJoined, onParticipantKicked, onParticipantLeft]);

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

    connection.on(gameRoomRealtimeEventNames.masterChanged, (participant: GameParticipant) => {
      void handlersRef.current.onMasterChanged?.(participant);
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
      connection.off(gameRoomRealtimeEventNames.masterChanged);

      void stopSignalRConnection(connection);
      connectionRef.current = null;
    };
  }, [gameId]);
};
