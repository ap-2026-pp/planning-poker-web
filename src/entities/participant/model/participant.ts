export enum ParticipantRole {
  Master = 0,
  Player = 1,
  Spectator = 2,
}

export type GameParticipant = {
  id: string;
  userId: string | null;
  displayName: string;
  role: ParticipantRole;
  joinedAt: string;
  isConnected: boolean;
  isActive?: boolean;
  hasVoted?: boolean;
  voteValue?: string | null;
  removedAt?: string;
  canRevealCards: boolean;
  canManageIssues: boolean;
};
