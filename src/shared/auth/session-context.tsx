import { createContext } from 'react';

import type { User } from '@entities/user';
import type { LoginPayload, RegisterPayload } from './auth-contracts';

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export type SessionContextValue = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isGuestSession: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);
