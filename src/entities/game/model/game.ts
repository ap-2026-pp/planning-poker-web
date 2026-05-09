import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';

import type { ParticipantRole } from '@entities/participant';

export enum VotingSystem {
  Fibonacci = 0,
  TShirtSizes = 1,
  PowersOfTwo = 2,
  Custom = 3,
}

export type Game = {
  id: string;
  name?: string | null;
  votingSystem: VotingSystem;
  inviteCode?: string | null;
  autoRevealCards: boolean;
  showAverage: boolean;
  showCountdownAnimation: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy?: string | null;
  participants?: GameParticipant[];
  issues?: Issue[];
};

export type CreateGamePayload = {
  name: string;
  hostDisplayName?: string;
  votingSystem: VotingSystem;
  autoRevealCards: boolean;
  showAverage: boolean;
  showCountdownAnimation: boolean;
};

export type UpdateGamePayload = {
  name: string;
  votingSystem: VotingSystem;
  autoRevealCards: boolean;
  showAverage: boolean;
  showCountdownAnimation: boolean;
  isActive: boolean;
};

export type JoinGamePayload = {
  displayName?: string;
};

export type JoinGameResponse = {
  game: Game;
  currentParticipantId: string;
  guestAccessToken?: string | null;
};

export type GameInvite = {
  gameId: string;
  inviteCode?: string | null;
  inviteUrl?: string | null;
  qrCodeBase64?: string | null;
};

export enum UserGamesScope {
  Created = 'Created',
  Participated = 'Participated',
  All = 'All',
}

export type UserGame = {
  id: string;
  name: string;
  joinedAt: string;
  sessionRole: ParticipantRole;
  isActive: boolean;
};
