import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { User } from '@entities/user';
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '@shared/api';
import {
  clearCurrentRoomParticipantSession,
  clearGuestAccessToken,
  clearStoredSession,
  setStoredSession,
  subscribeToSessionInvalidated,
  type LoginPayload,
  type RegisterPayload,
  SessionContext,
} from '@shared/auth';

type AuthStatus = 'loading' | 'authenticated' | 'guest';

type SessionProviderProps = {
  children: ReactNode;
};

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const markGuest = useCallback(() => {
    clearStoredSession();
    clearGuestAccessToken();
    clearCurrentRoomParticipantSession();

    setUser(null);
    setStatus('guest');
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUserRequest();

      setUser(currentUser);
      setStatus('authenticated');
    } catch {
      markGuest();
    }
  }, [markGuest]);

  useEffect(() => {
    void refreshCurrentUser();
  }, [refreshCurrentUser]);

  useEffect(() => {
    return subscribeToSessionInvalidated(() => {
      markGuest();
    });
  }, [markGuest]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginRequest(payload);

      setStoredSession(session);
      await refreshCurrentUser();
    },
    [refreshCurrentUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const session = await registerRequest(payload);

      setStoredSession(session);
      await refreshCurrentUser();
    },
    [refreshCurrentUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      markGuest();
    }
  }, [markGuest]);

  const updateCurrentUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isGuestSession: status === 'guest',
      login,
      register,
      logout,
      refreshCurrentUser,
      updateCurrentUser,
    }),
    [
      user,
      status,
      login,
      register,
      logout,
      refreshCurrentUser,
      updateCurrentUser,
    ],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};