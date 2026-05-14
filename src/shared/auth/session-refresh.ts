import axios from 'axios';

import { env } from '@shared/config/env';
import { clearCurrentRoomParticipantSession } from './current-room-participant';
import {
  clearAuthenticatedSessionHint,
  clearGuestAccessToken,
  clearLastAuthenticatedEmail,
  notifyAuthStateChanged,
} from './token-storage';

const SESSION_INVALIDATED_EVENT = 'planning-poker:session-invalidated';

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshSessionPromise: Promise<boolean> | null = null;

const notifySessionInvalidated = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
  notifyAuthStateChanged();
};

const requestSessionRefresh = async () => {
  await refreshClient.post('/auth/refresh', undefined);
  return true;
};

export const refreshAuthenticatedSession = async (): Promise<boolean> => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = (async () => {
      try {
        return await requestSessionRefresh();
      } catch (error) {
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
  clearAuthenticatedSessionHint();
  clearLastAuthenticatedEmail();
  notifySessionInvalidated();
};

export const invalidateGuestSession = () => {
  clearGuestAccessToken();
  clearCurrentRoomParticipantSession();
  notifySessionInvalidated();
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
