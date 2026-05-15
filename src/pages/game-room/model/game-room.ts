import { VotingSystem } from '@entities/game';
import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import { ParticipantRole } from '@entities/participant';
import { getVotingSystemDeck, getVotingSystemLabel, type VoteDeckCard } from '@entities/game';

export type SidebarView = 'players' | 'issues';
export type CopiedItem = 'code' | 'invite-link' | null;

const roleWeights: Record<ParticipantRole, number> = {
  [ParticipantRole.Master]: 0,
  [ParticipantRole.Player]: 1,
  [ParticipantRole.Spectator]: 2,
};

export const roleLabels: Record<ParticipantRole, string> = {
  [ParticipantRole.Master]: 'Master',
  [ParticipantRole.Player]: 'Player',
  [ParticipantRole.Spectator]: 'Spectator',
};

export const getParticipantInitials = (displayName: string) => {
  const parts = displayName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return 'PP';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

export const isParticipantOnline = (participant: GameParticipant) =>
  participant.isConnected || participant.isActive === true;

export const sortParticipants = (left: GameParticipant, right: GameParticipant) => {
  const roleWeightDiff = roleWeights[left.role] - roleWeights[right.role];

  if (roleWeightDiff !== 0) {
    return roleWeightDiff;
  }

  return new Date(left.joinedAt).getTime() - new Date(right.joinedAt).getTime();
};

const sortByJoinedAt = (left: GameParticipant, right: GameParticipant) =>
  new Date(left.joinedAt).getTime() - new Date(right.joinedAt).getTime();

export const sortSidebarParticipants = (
  participants: GameParticipant[],
  currentParticipantId: string | null,
) => {
  const master = participants.find((participant) => participant.role === ParticipantRole.Master);
  const currentParticipant = currentParticipantId
    ? participants.find((participant) => participant.id === currentParticipantId) ?? null
    : null;

  const isMaster = (participant: GameParticipant) => participant.role === ParticipantRole.Master;
  const isCurrent = (participant: GameParticipant) =>
    currentParticipant !== null && participant.id === currentParticipant.id;

  const onlinePlayers = participants
    .filter(
      (participant) =>
        !isMaster(participant) &&
        !isCurrent(participant) &&
        isParticipantOnline(participant) &&
        participant.role === ParticipantRole.Player,
    )
    .sort(sortByJoinedAt);

  const onlineSpectators = participants
    .filter(
      (participant) =>
        !isMaster(participant) &&
        !isCurrent(participant) &&
        isParticipantOnline(participant) &&
        participant.role === ParticipantRole.Spectator,
    )
    .sort(sortByJoinedAt);

  const offlinePlayers = participants
    .filter(
      (participant) =>
        !isMaster(participant) &&
        !isCurrent(participant) &&
        !isParticipantOnline(participant) &&
        participant.role === ParticipantRole.Player,
    )
    .sort(sortByJoinedAt);

  const offlineSpectators = participants
    .filter(
      (participant) =>
        !isMaster(participant) &&
        !isCurrent(participant) &&
        !isParticipantOnline(participant) &&
        participant.role === ParticipantRole.Spectator,
    )
    .sort(sortByJoinedAt);

  return [
    ...((master && [master]) || []),
    ...((currentParticipant && !isMaster(currentParticipant) && [currentParticipant]) || []),
    ...onlinePlayers,
    ...onlineSpectators,
    ...offlinePlayers,
    ...offlineSpectators,
  ];
};

export const getRoundLabel = (issues: Issue[], activeIssueIndex: number) => {
  if (activeIssueIndex >= 0) {
    return `Раунд ${activeIssueIndex + 1} з ${issues.length} задач`;
  }

  if (issues.length > 0) {
    return `${issues.length} задач у черзі`;
  }

  return 'Очікуємо перший issue';
};

export const getGameRoomDeck = (
  votingSystem?: VotingSystem | null,
  customCards?: readonly string[] | null,
  availableCards?: readonly string[] | null,
) => {
  const normalizedAvailableCards = [...new Set(
    (availableCards ?? [])
      .map((card) => card.trim())
      .filter(Boolean),
  )];
  const normalizedCustomCards = [...new Set(
    (customCards ?? [])
      .map((card) => card.trim())
      .filter(Boolean),
  )];

  const toDeckCards = (cards: readonly string[]): VoteDeckCard[] => {
    const normalizedCards = [...cards];

    if (!normalizedCards.includes('?')) {
      normalizedCards.push('?');
    }

    if (!normalizedCards.includes('coffee')) {
      normalizedCards.push('coffee');
    }

    return normalizedCards.map((card) => ({
      value: card,
      label: card === 'coffee' ? '☕' : card,
      ...(card === 'coffee' ? { ariaLabel: 'Пауза' } : {}),
      ...(card === '?' ? { ariaLabel: 'Не знаю' } : {}),
    }));
  };

  if (normalizedAvailableCards.length) {
    const fallbackDeckValues = getVotingSystemDeck(
      votingSystem ?? VotingSystem.Fibonacci,
      normalizedCustomCards,
    ).map((card) => card.value);
    const mergedDeckValues = [...fallbackDeckValues];

    normalizedAvailableCards.forEach((card) => {
      if (!mergedDeckValues.includes(card)) {
        mergedDeckValues.push(card);
      }
    });

    return toDeckCards(mergedDeckValues);
  }

  return getVotingSystemDeck(votingSystem ?? VotingSystem.Fibonacci, normalizedCustomCards);
};

export const getGameRoomVotingLabel = (votingSystem?: VotingSystem | null) =>
  getVotingSystemLabel(votingSystem ?? VotingSystem.Fibonacci);
