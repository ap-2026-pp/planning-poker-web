export enum ParticipantRole {
  Master = 0,
  Player = 1,
  Spectator = 2,
}

export type GameParticipant = {
  id: string;
  userId: string;
  displayName: string;
  role: ParticipantRole;
  joinedAt: string;
  isConnected: boolean;
};
