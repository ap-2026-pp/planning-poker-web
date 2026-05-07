import type { StoredSession } from './auth-contracts';

const SESSION_KEY = 'planning-poker.session';
const GUEST_TOKEN_COOKIE_NAMES = ['guestToken', 'guest_token', 'guest-token'];

export const getStoredSession = (): StoredSession | null => {
  const rawValue = localStorage.getItem(SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const setStoredSession = (session: StoredSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getAccessToken = () => getStoredSession()?.accessToken ?? null;

export const hasGuestTokenCookie = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  const cookies = document.cookie
    .split(';')
    .map((item) => item.trim().split('=')[0])
    .filter(Boolean);

  return GUEST_TOKEN_COOKIE_NAMES.some((cookieName) => cookies.includes(cookieName));
};
