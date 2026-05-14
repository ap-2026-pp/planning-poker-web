import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';

import type { ParticipantRole } from '@entities/participant';

export enum VotingSystem {
  Fibonacci = 0,
  TShirtSizes = 1,
  PowersOfTwo = 2,
  Custom = 3,
}

export enum RevealPolicy {
  MasterOnly = 0,
  Everyone = 1,
  SpecificParticipants = 2,
}

export enum IssuesPolicy {
  MasterOnly = 0,
  Everyone = 1,
  SpecificParticipants = 2,
}

export type Game = {
  id: string;
  name?: string | null;
  customValues?: string | null;
  votingSystem: VotingSystem;
  inviteCode?: string | null;
  revealPolicy: RevealPolicy;
  issuesPolicy: IssuesPolicy;
  autoRevealCards: boolean;
  showAverage: boolean;
  showCountdownAnimation: boolean;
  enableFunFeatures: boolean;
  defaultTimerMinutes: number;
  autoResetTimer?: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy?: string | null;
  participants?: GameParticipant[];
  issues?: Issue[];
};

export type CreateGamePayload = {
  displayName: string;
  votingSystem: VotingSystem;
  customValues?: string;
  revealPolicy: RevealPolicy;
  issuesPolicy: IssuesPolicy;
  autoResetTimer: boolean;
  autoRevealCards: boolean;
  showAverage: boolean;
  showCountdownAnimation: boolean;
  enableFunFeatures: boolean;
  defaultTimerMinutes: number;
};

export type UpdateGamePayload = {
  name: string;
  votingSystem: VotingSystem;
  customValues?: string;
  revealPolicy: RevealPolicy;
  issuesPolicy: IssuesPolicy;
  autoRevealCards: boolean;
  showAverage: boolean;
  showCountdownAnimation: boolean;
  defaultTimerMinutes: number;
  autoResetTimer: boolean;
  enableFunFeatures: boolean;
  isActive?: boolean;

  revealAllowedParticipantIds?: string[];
  issuesAllowedParticipantIds?: string[];
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
