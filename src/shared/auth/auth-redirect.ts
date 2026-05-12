const AUTH_RETURN_TO_PARAM = 'returnTo';
const AUTH_REASON_PARAM = 'reason';
const AUTH_EMAIL_PARAM = 'email';
const SESSION_EXPIRED_REASON = 'session-expired';

const isSafeReturnPath = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.startsWith('/');

export const getAuthReturnTo = (search: string) => {
  const value = new URLSearchParams(search).get(AUTH_RETURN_TO_PARAM);

  return isSafeReturnPath(value) ? value : null;
};

export const getAuthExpectedEmail = (search: string) => {
  const value = new URLSearchParams(search).get(AUTH_EMAIL_PARAM);

  return value?.trim() || null;
};

export const buildAuthRedirectPath = (basePath: string, returnTo?: string | null) => {
  if (!isSafeReturnPath(returnTo)) {
    return basePath;
  }

  const searchParams = new URLSearchParams();
  searchParams.set(AUTH_RETURN_TO_PARAM, returnTo);

  return `${basePath}?${searchParams.toString()}`;
};

export const buildSessionExpiredRedirectPath = (
  basePath: string,
  returnTo?: string | null,
  email?: string | null,
) => {
  const redirectPath = buildAuthRedirectPath(basePath, returnTo);
  const [pathname, search = ''] = redirectPath.split('?');
  const searchParams = new URLSearchParams(search);

  searchParams.set(AUTH_REASON_PARAM, SESSION_EXPIRED_REASON);

  if (email?.trim()) {
    searchParams.set(AUTH_EMAIL_PARAM, email.trim());
  }

  return `${pathname}?${searchParams.toString()}`;
};

export const isSessionExpiredRedirect = (search: string) =>
  new URLSearchParams(search).get(AUTH_REASON_PARAM) === SESSION_EXPIRED_REASON;
