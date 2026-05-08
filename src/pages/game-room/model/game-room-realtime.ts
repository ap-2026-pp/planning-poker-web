import type { GameParticipant } from '@entities/participant';
import { getAccessToken, getGuestAccessToken } from '@shared/auth';
import { env } from '@shared/config/env';

export const gameRoomRealtimeEventNames = {
  participantJoined: 'ParticipantJoined',
  participantLeft: 'ParticipantLeft',
  participantKicked: 'ParticipantKicked',
  masterChanged: 'MasterChanged',
} as const;

export const buildGameRoomHubUrl = (gameId: string) => {
  const separator = env.signalRHubPath.includes('?') ? '&' : '?';
  return `${env.signalRHubPath}${separator}gameId=${encodeURIComponent(gameId)}`;
};

export const getGameRoomRealtimeAccessToken = () => {
  return getAccessToken() ?? getGuestAccessToken();
};

export const upsertGameRoomParticipant = (
  participants: GameParticipant[],
  nextParticipant: GameParticipant,
) => {
  const existingIndex = participants.findIndex((participant) => participant.id === nextParticipant.id);

  if (existingIndex < 0) {
    return [...participants, nextParticipant];
  }

  return participants.map((participant, index) =>
    index === existingIndex ? { ...participant, ...nextParticipant } : participant,
  );
};

export const removeGameRoomParticipant = (
  participants: GameParticipant[],
  participantId: GameParticipant['id'],
) => {
  return participants.filter((participant) => participant.id !== participantId);
};
