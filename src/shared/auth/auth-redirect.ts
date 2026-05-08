const AUTH_RETURN_TO_PARAM = 'returnTo';

const isSafeReturnPath = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.startsWith('/');

export const getAuthReturnTo = (search: string) => {
  const value = new URLSearchParams(search).get(AUTH_RETURN_TO_PARAM);

  return isSafeReturnPath(value) ? value : null;
};

export const buildAuthRedirectPath = (basePath: string, returnTo?: string | null) => {
  if (!isSafeReturnPath(returnTo)) {
    return basePath;
  }

  const searchParams = new URLSearchParams();
  searchParams.set(AUTH_RETURN_TO_PARAM, returnTo);

  return `${basePath}?${searchParams.toString()}`;
};
