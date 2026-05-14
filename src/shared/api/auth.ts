import type { User } from '@entities/user';
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
} from '@shared/auth';

import { apiClientService } from './client';

export const loginRequest = (payload: LoginPayload) =>
  apiClientService.post<User, LoginPayload>('/auth/login', payload);

export const registerRequest = (payload: RegisterPayload) =>
  apiClientService.post<User, RegisterPayload>('/auth/register', payload);

export const getCurrentUserRequest = () => apiClientService.get<User>('/auth/me');

export const updateCurrentUserDisplayNameRequest = (displayName: string) =>
  apiClientService.put<User, { displayName: string }>('/auth/me/display-name', {
    displayName,
  });

export const changePasswordRequest = (payload: ChangePasswordPayload) =>
  apiClientService.post<void, ChangePasswordPayload>('/auth/change-password', payload);

export const logoutRequest = () => apiClientService.post<void, undefined>('/auth/logout', undefined);
