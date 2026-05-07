import type {
  CreateGamePayload,
  Game,
  GameInvite,
  JoinGamePayload,
} from '@entities/game';
import type { VotingHistoryList } from '@entities/history';
import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';

import { apiClientService } from './client';

export const createGameRequest = (payload: CreateGamePayload) =>
  apiClientService.post<Game, CreateGamePayload>('/game', payload);

export const getGameRequest = (gameId: string) =>
  apiClientService.get<Game>(`/game/${gameId}`);

export const getGameInviteRequest = (gameId: string) =>
  apiClientService.get<GameInvite>(`/game/${gameId}/invite`);

export const joinGameRequest = (inviteCode: string, payload: JoinGamePayload) =>
  apiClientService.post<Game, JoinGamePayload>(`/games/join/${inviteCode}`, payload);

export const getParticipantsRequest = (gameId: string) =>
  apiClientService.get<GameParticipant[]>(`/games/${gameId}/participants`);

export const updateDisplayNameRequest = (gameId: string, displayName: string) =>
  apiClientService.put<GameParticipant, { displayName: string }>(
    `/games/${gameId}/participants/me/display-name`,
    {
      displayName,
    }
  );

export const leaveGameRequest = (gameId: string) =>
  apiClientService.delete<void>(`/games/${gameId}/participants/me`);

export const setSpectatorModeRequest = (gameId: string, isSpectator: boolean) =>
  apiClientService.patch<void, boolean>(`/games/${gameId}/participants/me/spectator`, isSpectator);

export const getIssuesRequest = (gameId: string) =>
  apiClientService.get<Issue[]>(`/games/${gameId}/issues`);

export const getVotingHistoryRequest = (gameId: string) =>
  apiClientService.get<VotingHistoryList>(`/games/${gameId}/history`);
