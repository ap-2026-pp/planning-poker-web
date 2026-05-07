export type VoteResult = {
  participantId: string;
  displayName: string;
  voteValue: string;
};

export type VotingHistoryItem = {
  id: string;
  issueId?: string | null;
  issueName: string;
  result?: string | null;
  average?: number | null;
  mostVotedCard?: string | null;
  agreementPercent: number;
  agreementLevel: string;
  duration?: string | null;
  completedAt: string;
  totalPlayers: number;
  votedCount: number;
  playerResults: VoteResult[];
};

export type VotingHistoryList = {
  totalCount: number;
  page: number;
  pageSize: number;
  items: VotingHistoryItem[];
};
