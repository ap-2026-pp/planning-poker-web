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
  clearAuthenticatedSessionHint,
  clearLastAuthenticatedEmail,
  clearCurrentRoomParticipantSession,
  clearGuestAccessToken,
  getLastAuthenticatedEmail,
  hasAuthenticatedSessionHint,
  hasGuestTokenCookie,
  notifyAuthStateChanged,
  setAuthenticatedSessionHint,
  setLastAuthenticatedEmail,
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
  const [hasGuestAccess, setHasGuestAccess] = useState(() => hasGuestTokenCookie());
  const [expiredSessionEmail, setExpiredSessionEmail] = useState<string | null>(null);
  const lastAuthenticatedEmailRef = useRef<string | null>(getLastAuthenticatedEmail());

  const markGuest = useCallback(() => {
    const nextExpiredSessionEmail = lastAuthenticatedEmailRef.current ?? getLastAuthenticatedEmail();

    setUser(null);
    setStatus('guest');
    setHasGuestAccess(hasGuestTokenCookie());
    setExpiredSessionEmail(nextExpiredSessionEmail);
    notifyAuthStateChanged();
  }, []);

  const clearAllSessionState = useCallback(() => {
    clearAuthenticatedSessionHint();
    clearLastAuthenticatedEmail();
    clearGuestAccessToken();
    clearCurrentRoomParticipantSession();

    setUser(null);
    setStatus('guest');
    setHasGuestAccess(false);
    setExpiredSessionEmail(null);
    lastAuthenticatedEmailRef.current = null;
    notifyAuthStateChanged();
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!hasAuthenticatedSessionHint()) {
      setUser(null);
      setStatus('guest');
      setHasGuestAccess(hasGuestTokenCookie());
      setExpiredSessionEmail(null);
      return;
    }

    try {
      const currentUser = await getCurrentUserRequest();

      setAuthenticatedSessionHint();
      lastAuthenticatedEmailRef.current = currentUser.email;
      setLastAuthenticatedEmail(currentUser.email);
      clearGuestAccessToken();
      clearCurrentRoomParticipantSession();

      setUser(currentUser);
      setStatus('authenticated');
      setHasGuestAccess(false);
      setExpiredSessionEmail(null);
    } catch {
      if (lastAuthenticatedEmailRef.current ?? getLastAuthenticatedEmail()) {
        markGuest();
        return;
      }

      setUser(null);
      setStatus('guest');
      setHasGuestAccess(hasGuestTokenCookie());
      setExpiredSessionEmail(null);
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
    const syncSessionState = () => {
      void refreshCurrentUser();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncSessionState();
      }
    };

    syncSessionState();

    window.addEventListener('storage', syncSessionState);
    window.addEventListener('focus', syncSessionState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', syncSessionState);
      window.removeEventListener('focus', syncSessionState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshCurrentUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const currentUser = await loginRequest(payload);

      setAuthenticatedSessionHint();
      lastAuthenticatedEmailRef.current = currentUser.email;
      setLastAuthenticatedEmail(currentUser.email);
      clearGuestAccessToken();
      clearCurrentRoomParticipantSession();

      setUser(currentUser);
      setStatus('authenticated');
      setHasGuestAccess(false);
      setExpiredSessionEmail(null);
      notifyAuthStateChanged();
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const currentUser = await registerRequest(payload);

      setAuthenticatedSessionHint();
      lastAuthenticatedEmailRef.current = currentUser.email;
      setLastAuthenticatedEmail(currentUser.email);
      clearGuestAccessToken();
      clearCurrentRoomParticipantSession();

      setUser(currentUser);
      setStatus('authenticated');
      setHasGuestAccess(false);
      setExpiredSessionEmail(null);
      notifyAuthStateChanged();
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAllSessionState();
    }
  }, [clearAllSessionState]);

  const updateCurrentUser = useCallback((nextUser: User) => {
    setAuthenticatedSessionHint();
    lastAuthenticatedEmailRef.current = nextUser.email;
    setLastAuthenticatedEmail(nextUser.email);
    setUser(nextUser);
    setStatus('authenticated');
    setHasGuestAccess(false);
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
