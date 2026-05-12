import type { StoredSession } from './auth-contracts';

const SESSION_KEY = 'planning-poker.session';
const GUEST_TOKEN_COOKIE_KEY = 'guestToken';
const GUEST_TOKEN_COOKIE_NAMES = ['guestToken', 'guest_token', 'guest-token'];

const isStoredSession = (value: unknown): value is StoredSession => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<StoredSession>;

  return Boolean(
    session.accessToken &&
      session.refreshToken &&
      session.expiration &&
      typeof session.accessToken === 'string' &&
      typeof session.refreshToken === 'string' &&
      typeof session.expiration === 'string',
  );
};

export const getStoredSession = (): StoredSession | null => {
  const rawValue = localStorage.getItem(SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as unknown;

    if (!isStoredSession(session)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const getStoredSessionEmail = () => {
  const rawValue = localStorage.getItem(SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const value = JSON.parse(rawValue) as Partial<StoredSession>;

    return typeof value.email === 'string' && value.email ? value.email : null;
  } catch {
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

export const getGuestAccessToken = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  const entries = document.cookie
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [key, ...valueParts] = item.split('=');
      return [key, valueParts.join('=')] as const;
    });

  for (const cookieName of GUEST_TOKEN_COOKIE_NAMES) {
    const match = entries.find(([key]) => key === cookieName);

    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
};

export const setGuestAccessToken = (token: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${GUEST_TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
};

export const clearGuestAccessToken = () => {
  if (typeof document === 'undefined') {
    return;
  }

  GUEST_TOKEN_COOKIE_NAMES.forEach((cookieName) => {
    document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
  });
};

export const hasGuestTokenCookie = () => {
  return Boolean(getGuestAccessToken());
};
