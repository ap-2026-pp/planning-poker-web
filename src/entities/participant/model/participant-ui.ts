import { ParticipantRole, type GameParticipant } from './participant';

export const roleLabels: Record<ParticipantRole, string> = {
  [ParticipantRole.Master]: 'Ведучий',
  [ParticipantRole.Player]: 'Гравець',
  [ParticipantRole.Spectator]: 'Спостерігач',
};

export const getParticipantInitials = (displayName: string) => {
  const normalizedName = displayName.trim();

  if (!normalizedName) {
    return '?';
  }

  const words = normalizedName.split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const isParticipantOnline = (participant: GameParticipant) => {
  return participant.isConnected && !participant.removedAt;
};