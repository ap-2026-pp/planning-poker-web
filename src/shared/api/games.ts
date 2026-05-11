import type {
  CreateGamePayload,
  Game,
  GameInvite,
  JoinGamePayload,
  JoinGameResponse,
  UpdateGamePayload,
  UserGame,
  UserGamesScope,
} from '@entities/game';
import type { VotingHistoryList } from '@entities/history';
import type { ImportPlaneIssuesPayload, Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';

import { clearCurrentRoomParticipantSession, clearGuestAccessToken } from '@shared/auth';
import { apiClientService } from './client';

export const createGameRequest = (payload: CreateGamePayload) =>
  apiClientService.post<Game, CreateGamePayload>('/game', payload);

export const getGameRequest = (gameId: string) =>
  apiClientService.get<Game>(`/game/${gameId}`);

export const updateGameRequest = (gameId: string, payload: UpdateGamePayload) =>
  apiClientService.put<Game, UpdateGamePayload>(`/game/${gameId}`, payload);

export const deleteGameRequest = (gameId: string) =>
  apiClientService.delete<void>(`/game/${gameId}`);

export const getGameInviteRequest = (gameId: string) =>
  apiClientService.get<GameInvite>(`/game/${gameId}/invite`);

export const getUserGamesRequest = (scope: UserGamesScope) =>
  apiClientService.get<UserGame[]>('/games/my', {
    params: {
      scope,
    },
  });

export const joinGameRequest = (inviteCode: string, payload: JoinGamePayload) =>
  apiClientService.post<JoinGameResponse, JoinGamePayload>(`/games/join/${inviteCode}`, payload);

export const reconnectToGameRequest = (gameId: string) =>
  apiClientService.post<JoinGameResponse, undefined>(`/games/${gameId}/reconnect`, undefined);

export const getParticipantsRequest = (gameId: string) =>
  apiClientService.get<GameParticipant[]>(`/games/${gameId}/participants`);

export const deleteGameParticipantRequest = (gameId: string, participantId: string) =>
  apiClientService.delete<void>(`/games/${gameId}/participants/${participantId}`);

export const transferMasterRequest = (gameId: string, participantId: string) =>
  apiClientService.patch<void, undefined>(
    `/games/${gameId}/participants/${participantId}/transfer-master`,
    undefined,
  );

export const updateDisplayNameRequest = (gameId: string, displayName: string) =>
  apiClientService.put<GameParticipant, { displayName: string }>(
    `/games/${gameId}/participants/me/display-name`,
    {
      displayName,
    }
  );

export const leaveGameRequest = async (gameId: string) => {
  try {
    return await apiClientService.delete<void>(`/games/${gameId}/participants/me`);
  } finally {
    clearCurrentRoomParticipantSession();
    clearGuestAccessToken();
  }
};

export const setSpectatorModeRequest = (gameId: string, isSpectator: boolean) =>
  apiClientService.patch<void, boolean>(`/games/${gameId}/participants/me/spectator`, isSpectator);

export const getIssuesRequest = (gameId: string) =>
  apiClientService.get<Issue[]>(`/games/${gameId}/issues`);

export const getVotingHistoryRequest = (gameId: string) =>
  apiClientService.get<VotingHistoryList>(`/games/${gameId}/history`);

export const createIssueRequest = (gameId: string, payload: { title: string },) =>
  apiClientService.post<Issue, { title: string }>(
    `/games/${gameId}/issues`,
    payload,
  );

export const updateIssueRequest = (
  gameId: string,
  issueId: string,
  payload: { title: string; code?: string; url?: string; description?: string },
) =>
  apiClientService.put<
    Issue,
    { title: string; code?: string; url?: string; description?: string }
  >(`/games/${gameId}/issues/${issueId}`, payload);

export const deleteIssueRequest = (gameId: string, issueId: string) =>
  apiClientService.delete<void>(`/games/${gameId}/issues/${issueId}`);

export const reorderIssuesRequest = (
  gameId: string,
  payload: { issuesIds: string[] },
) =>
  apiClientService.patch<void, { issuesIds: string[] }>(
    `/games/${gameId}/issues/reorder`,
    payload,
  );

export const setIssueActiveRequest = (gameId: string, issueId: string) =>
  apiClientService.patch<void, undefined>(
    `/games/${gameId}/issues/${issueId}/set-active`,
    undefined,
  );

export const importPlaneIssuesRequest = (
  gameId: string,
  payload: ImportPlaneIssuesPayload,
) =>
  apiClientService.post<Issue[], ImportPlaneIssuesPayload>(
    `/games/${gameId}/issues/import-plane`,
    payload,
  );