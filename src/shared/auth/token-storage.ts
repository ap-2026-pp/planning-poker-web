const GUEST_TOKEN_COOKIE_KEY = 'guestToken';
const GUEST_TOKEN_COOKIE_NAMES = ['guestToken', 'guest_token', 'guest-token'];
const LAST_AUTH_EMAIL_KEY = 'planning-poker.last-auth-email';
const AUTH_SESSION_HINT_KEY = 'planning-poker.auth-session-hint';
const AUTH_STATE_SYNC_KEY = 'planning-poker.auth-state-sync';

const getCookieValue = (cookieNames: readonly string[]) => {
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

  for (const cookieName of cookieNames) {
    const match = entries.find(([key]) => key === cookieName);

    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
};

export const getGuestAccessToken = () => {
  return getCookieValue(GUEST_TOKEN_COOKIE_NAMES);
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

export const getLastAuthenticatedEmail = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(LAST_AUTH_EMAIL_KEY);

  return value?.trim() || null;
};

export const hasAuthenticatedSessionHint = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === '1';
};

export const setAuthenticatedSessionHint = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_HINT_KEY, '1');
};

export const clearAuthenticatedSessionHint = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
};

export const setLastAuthenticatedEmail = (email: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return;
  }

  window.localStorage.setItem(LAST_AUTH_EMAIL_KEY, normalizedEmail);
};

export const clearLastAuthenticatedEmail = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LAST_AUTH_EMAIL_KEY);
};

export const notifyAuthStateChanged = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STATE_SYNC_KEY, String(Date.now()));
};
