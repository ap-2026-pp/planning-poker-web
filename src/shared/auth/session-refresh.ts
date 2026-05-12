import axios from 'axios';

import { env } from '@shared/config/env';
import { isApiEnvelope } from '@shared/model/api';

import type { StoredSession } from './auth-contracts';
import {
  clearGuestAccessToken,
  clearStoredSession,
  getStoredSession,
  setStoredSession,
  clearCurrentRoomParticipantSession
} from '@shared/auth';

type RefreshTokenPayload = {
  accessToken: string;
  refreshToken: string;
};

const SESSION_INVALIDATED_EVENT = 'planning-poker:session-invalidated';
const TOKEN_REFRESH_LEEWAY_MS = 60_000;

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshSessionPromise: Promise<StoredSession | null> | null = null;

const unwrap = <T>(payload: unknown): T => {
  if (isApiEnvelope<T>(payload)) {
    return payload.data;
  }

  return payload as T;
};

const notifySessionInvalidated = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
};

const isStoredSessionExpiring = (session: StoredSession) => {
  const expirationTimestamp = Date.parse(session.expiration);

  if (Number.isNaN(expirationTimestamp)) {
    return true;
  }

  return expirationTimestamp - Date.now() <= TOKEN_REFRESH_LEEWAY_MS;
};

const requestSessionRefresh = async (session: StoredSession) => {
  const payload: RefreshTokenPayload = {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };

  return unwrap<StoredSession>((await refreshClient.post('/auth/refresh', payload)).data);
};

export const refreshStoredSession = async (force = false): Promise<StoredSession | null> => {
  const session = getStoredSession();

  if (!session?.accessToken || !session.refreshToken) {
    return null;
  }

  if (!force && !isStoredSessionExpiring(session)) {
    return session;
  }

  if (!refreshSessionPromise) {
    refreshSessionPromise = (async () => {
      try {
        const refreshedSession = await requestSessionRefresh(session);
        setStoredSession(refreshedSession);
        return refreshedSession;
      } catch (error) {
        clearStoredSession();
        notifySessionInvalidated();
        throw error;
      } finally {
        refreshSessionPromise = null;
      }
    })();
  }

  return refreshSessionPromise;
};

export const invalidateStoredSession = () => {
  clearStoredSession();
  clearCurrentRoomParticipantSession();
  clearGuestAccessToken();
  notifySessionInvalidated();
};

export const getValidAccessToken = async () => {
  return (await refreshStoredSession())?.accessToken ?? null;
};

export const subscribeToSessionInvalidated = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(SESSION_INVALIDATED_EVENT, listener);

  return () => {
    window.removeEventListener(SESSION_INVALIDATED_EVENT, listener);
  };
};
