import { ParticipantRole, type GameParticipant } from '@entities/participant';
import { getGuestAccessToken, getValidAccessToken } from '@shared/auth';
import { env } from '@shared/config/env';

export const gameRoomRealtimeEventNames = {
  participantJoined: 'ParticipantJoined',
  participantLeft: 'ParticipantLeft',
  participantKicked: 'ParticipantKicked',
  userUpdated: 'UserUpdated',
  participantUpdated: 'ParticipantUpdated',
  gameUpdated: 'GameUpdated',
  issueCreated: 'IssueCreated',
  issueUpdated: 'IssueUpdated',
  issuesImported: 'IssuesImported',
} as const;

export const buildGameRoomHubUrl = (gameId: string) => {
  const separator = env.signalRHubPath.includes('?') ? '&' : '?';

  return `${env.signalRHubPath}${separator}gameId=${encodeURIComponent(gameId)}`;
};

export const getGameRoomRealtimeAccessToken = () => {
  return getValidAccessToken().then((token) => token ?? getGuestAccessToken());
};

export const upsertGameRoomParticipant = (
  participants: GameParticipant[],
  nextParticipant: GameParticipant,
) => {
  const existingIndex = participants.findIndex(
    (participant) => participant.id === nextParticipant.id,
  );

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

export const applyGameRoomParticipantUpdate = (
  participants: GameParticipant[],
  participantUpdate: GameParticipant,
) => {
  if (participantUpdate.role !== ParticipantRole.Master) {
    return upsertGameRoomParticipant(participants, participantUpdate);
  }

  const normalizedParticipants = participants.map((participant) => {
    if (participant.id === participantUpdate.id) {
      return {
        ...participant,
        ...participantUpdate,
        role: ParticipantRole.Master,
      };
    }

    if (participant.role === ParticipantRole.Master) {
      return {
        ...participant,
        role: ParticipantRole.Player,
      };
    }

    return participant;
  });

  const hasParticipant = normalizedParticipants.some(
    (participant) => participant.id === participantUpdate.id,
  );

  if (hasParticipant) {
    return normalizedParticipants;
  }

  return [...normalizedParticipants, participantUpdate];
};