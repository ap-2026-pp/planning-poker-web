import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Box, CircularProgress } from '@mui/material';

import {
  clearCurrentRoomParticipantSession,
  clearGuestAccessToken,
  clearStoredSession,
  getStoredSession,
  hasGuestTokenCookie,
  setStoredSession,
  subscribeToSessionInvalidated,
  type StoredSession,
  SessionContext,
} from '@shared/auth';
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '@shared/api';
import type { LoginPayload, RegisterPayload } from '@shared/auth';
import type { User } from '@entities/user';
import styles from './session-provider.module.css';

type AuthStatus = 'loading' | 'authenticated' | 'guest';

const useSessionBootstrap = () => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const markGuest = () => {
    clearStoredSession();
    setUser(null);
    setStatus('guest');
  };

  const hydrateUser = async (session?: StoredSession | null) => {
    const storedSession = session ?? getStoredSession();

    if (!storedSession?.accessToken) {
      markGuest();
      return;
    }

    try {
      const currentUser = await getCurrentUserRequest();
      setUser(currentUser);
      setStatus('authenticated');
    } catch {
      markGuest();
    }
  };

  useEffect(() => {
    void hydrateUser();
  }, []);

  useEffect(() => {
    return subscribeToSessionInvalidated(() => {
      markGuest();
    });
  }, []);

  return {
    user,
    status,
    setUser,
    setStatus,
    hydrateUser,
    markGuest,
  };
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const { user, status, setUser, setStatus, hydrateUser, markGuest } = useSessionBootstrap();

  const isGuestSession = status === 'guest' || (!user && hasGuestTokenCookie());

  const login = async (payload: LoginPayload) => {
    const session = await loginRequest(payload);

    clearCurrentRoomParticipantSession();
    clearGuestAccessToken();
    setStoredSession(session);

    await hydrateUser(session);
  };

  const register = async (payload: RegisterPayload) => {
    const session = await registerRequest(payload);

    clearCurrentRoomParticipantSession();
    clearGuestAccessToken();
    setStoredSession(session);

    await hydrateUser(session);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      clearCurrentRoomParticipantSession();
      clearGuestAccessToken();
      markGuest();
    }
  };

  const refreshCurrentUser = async () => {
    setStatus('loading');

    try {
      const currentUser = await getCurrentUserRequest();
      setUser(currentUser);
      setStatus('authenticated');
    } catch {
      markGuest();
    }
  };

  const updateCurrentUser = (currentUser: User) => {
    setUser(currentUser);
    setStatus('authenticated');
  };

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isGuestSession,
      login,
      register,
      logout,
      refreshCurrentUser,
      updateCurrentUser,
    }),
    [isGuestSession, status, user],
  );

  if (status === 'loading') {
    return (
      <Box className={styles.loader}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};