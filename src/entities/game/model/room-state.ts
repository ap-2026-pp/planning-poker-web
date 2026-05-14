import type { Issue } from '@entities/issue';

export type RoomParticipantVoteStatus = {
  participantId: string;
  displayName: string;
  hasVoted: boolean;
  voteValue?: string | null;
};

export type RoomRoundResult = {
  average?: number | null;
  agreement?: number | null;
  finalEstimate: string;
};

export type RoomTimerState = {
  gameId: string;
  startedAt: string;
  endsAt: string;
  remainingSeconds: number;
  isExpired: boolean;
};

export type RoomState = {
  gameId: string;
  activeIssue?: Issue | null;
  isRevealed: boolean;
  votingSystem: string;
  availableCards: string[];
  votedCount: number;
  totalPlayers: number;
  myVote?: string | null;
  canVote: boolean;
  canReveal: boolean;
  canManage: boolean;
  timer?: RoomTimerState | null;
  canManageTimer: boolean;
  autoRevealEnabled: boolean;
  participants: RoomParticipantVoteStatus[];
  result?: RoomRoundResult | null;
};
