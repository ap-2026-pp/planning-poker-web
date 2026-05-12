import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  getStoredSession,
  getStoredSessionEmail,
  hasGuestTokenCookie,
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

const SESSION_STORAGE_SYNC_INTERVAL_MS = 500;

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [hasGuestAccess, setHasGuestAccess] = useState(() => hasGuestTokenCookie());
  const [expiredSessionEmail, setExpiredSessionEmail] = useState<string | null>(null);
  const lastAuthenticatedEmailRef = useRef<string | null>(getStoredSessionEmail());

  const markGuest = useCallback(() => {
    const nextExpiredSessionEmail = lastAuthenticatedEmailRef.current ?? getStoredSessionEmail();

    clearStoredSession();

    setUser(null);
    setStatus('guest');
    setHasGuestAccess(hasGuestTokenCookie());
    setExpiredSessionEmail(nextExpiredSessionEmail);
  }, []);

  const clearAllSessionState = useCallback(() => {
    clearStoredSession();
    clearGuestAccessToken();
    clearCurrentRoomParticipantSession();

    setUser(null);
    setStatus('guest');
    setHasGuestAccess(false);
    setExpiredSessionEmail(null);
    lastAuthenticatedEmailRef.current = null;
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!getStoredSession()) {
      setUser(null);
      setStatus('guest');
      setHasGuestAccess(hasGuestTokenCookie());
      return;
    }

    try {
      const currentUser = await getCurrentUserRequest();

      lastAuthenticatedEmailRef.current = currentUser.email;
      setUser(currentUser);
      setStatus('authenticated');
      setHasGuestAccess(hasGuestTokenCookie());
      setExpiredSessionEmail(null);
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

  useEffect(() => {
    const syncStoredSession = () => {
      const storedSessionEmail = getStoredSessionEmail();
      const hasStoredAuthSession = Boolean(getStoredSession());
      const nextHasGuestAccess = hasGuestTokenCookie();

      setHasGuestAccess(nextHasGuestAccess);

      if (status === 'authenticated' && !hasStoredAuthSession) {
        setExpiredSessionEmail(lastAuthenticatedEmailRef.current ?? storedSessionEmail);
        setUser(null);
        setStatus('guest');
      }
    };

    syncStoredSession();

    const intervalId = window.setInterval(
      syncStoredSession,
      SESSION_STORAGE_SYNC_INTERVAL_MS,
    );

    window.addEventListener('storage', syncStoredSession);
    window.addEventListener('focus', syncStoredSession);
    document.addEventListener('visibilitychange', syncStoredSession);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', syncStoredSession);
      window.removeEventListener('focus', syncStoredSession);
      document.removeEventListener('visibilitychange', syncStoredSession);
    };
  }, [status]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginRequest(payload);

      setStoredSession(session);
      lastAuthenticatedEmailRef.current = session.email;
      setHasGuestAccess(hasGuestTokenCookie());
      await refreshCurrentUser();
    },
    [refreshCurrentUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const session = await registerRequest(payload);

      setStoredSession(session);
      lastAuthenticatedEmailRef.current = session.email;
      setHasGuestAccess(hasGuestTokenCookie());
      await refreshCurrentUser();
    },
    [refreshCurrentUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAllSessionState();
    }
  }, [clearAllSessionState]);

  const updateCurrentUser = useCallback((nextUser: User) => {
    lastAuthenticatedEmailRef.current = nextUser.email;
    setUser(nextUser);
    setStatus('authenticated');
    setHasGuestAccess(hasGuestTokenCookie());
    setExpiredSessionEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isGuestSession: status === 'guest',
      hasGuestAccess,
      expiredSessionEmail,
      login,
      register,
      logout,
      refreshCurrentUser,
      updateCurrentUser,
    }),
    [
      user,
      status,
      hasGuestAccess,
      expiredSessionEmail,
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
