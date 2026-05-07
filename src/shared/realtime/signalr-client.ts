import { getAccessToken } from '@shared/auth';
import { env } from '@shared/config/env';

export type PlannedSignalREvent =
  | 'ParticipantJoined'
  | 'ParticipantLeft'
  | 'IssueActivated'
  | 'VoteSubmitted'
  | 'VotesRevealed';

export const buildSignalRRoomDescriptor = (gameId: string) => ({
  hubUrl: `${env.signalRHubPath}?gameId=${gameId}`,
  accessToken: getAccessToken(),
  plannedEvents: [
    'ParticipantJoined',
    'ParticipantLeft',
    'IssueActivated',
    'VoteSubmitted',
    'VotesRevealed',
  ] as PlannedSignalREvent[],
});
