import type { User } from '@entities/user';
import type { LoginPayload, RegisterPayload, StoredSession } from '@shared/auth';

import { apiClientService } from './client';

export const loginRequest = (payload: LoginPayload) =>
  apiClientService.post<StoredSession, LoginPayload>('/auth/login', payload);

export const registerRequest = (payload: RegisterPayload) =>
  apiClientService.post<StoredSession, RegisterPayload>('/auth/register', payload);

export const getCurrentUserRequest = () => apiClientService.get<User>('/auth/me');

export const logoutRequest = () => apiClientService.post<void, undefined>('/auth/logout', undefined);
