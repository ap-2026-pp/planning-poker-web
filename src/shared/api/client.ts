import axios, { AxiosHeaders, type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@shared/config/env';
import {
  invalidateStoredSession,
  invalidateGuestSession,
  refreshAuthenticatedSession,
} from '@shared/auth/session-refresh';
import {
  getGuestAccessToken,
  hasAuthenticatedSessionHint,
} from '@shared/auth/token-storage';
import { isApiEnvelope } from '@shared/model/api';

const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const setAuthorizationHeader = (
  config: AxiosRequestConfig | InternalAxiosRequestConfig,
  token: string,
) => {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`);
    return;
  }

  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };
};

const clearAuthorizationHeader = (config: AxiosRequestConfig | InternalAxiosRequestConfig) => {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.delete('Authorization');
    return;
  }

  if (config.headers && 'Authorization' in config.headers) {
    delete config.headers.Authorization;
  }
};

apiClient.interceptors.request.use((config) => {
  const guestAccessToken = getGuestAccessToken();

  if (guestAccessToken) {
    setAuthorizationHeader(config, guestAccessToken);
  } else {
    clearAuthorizationHeader(config);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (isApiEnvelope(response.data)) {
      response.data = response.data.data;
    }
    return response;
  },
);

const toErrorMessage = (error: AxiosError<unknown>) => {
  const responseBody = error.response?.data;

  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (responseBody && typeof responseBody === 'object') {
    if ('message' in responseBody && typeof responseBody.message === 'string') {
      return responseBody.message;
    }

    if ('detail' in responseBody && typeof responseBody.detail === 'string') {
      return responseBody.detail;
    }

    if ('title' in responseBody && typeof responseBody.title === 'string') {
      return responseBody.title;
    }
  }

  return error.message || 'Request failed';
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    const requestUrl = originalRequest?.url ?? '';
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isRegisterRequest = requestUrl.includes('/auth/register');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
    const guestAccessToken = getGuestAccessToken();
    const hasGuestSession = Boolean(guestAccessToken);
    const hasAuthSessionHint = hasAuthenticatedSessionHint();
    const shouldPreserveSession = isLoginRequest || isRegisterRequest;

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      hasAuthSessionHint &&
      !hasGuestSession &&
      !shouldPreserveSession
    ) {
      originalRequest._retry = true;

      try {
        const refreshed = await refreshAuthenticatedSession();
        if (refreshed) {
          clearAuthorizationHeader(originalRequest);
          return apiClient(originalRequest);
        }
      } catch {
        // handled by refresh manager
      }
    }

    if (isUnauthorized && !shouldPreserveSession) {
      if (hasGuestSession) {
        invalidateGuestSession();
      } else if (hasAuthSessionHint) {
        invalidateStoredSession();
      }
    }

    return Promise.reject(new Error(toErrorMessage(error)));
  }
);

const unwrap = <T>(payload: unknown): T => {
  if (isApiEnvelope<T>(payload)) {
    return payload.data;
  }

  return payload as T;
};

export const apiClientService = {
  get: async <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>((await apiClient.get(url, config)).data),
  post: async <TResponse, TBody>(url: string, body: TBody, config?: AxiosRequestConfig) =>
    unwrap<TResponse>((await apiClient.post(url, body, config)).data),
  put: async <TResponse, TBody>(url: string, body: TBody, config?: AxiosRequestConfig) =>
    unwrap<TResponse>((await apiClient.put(url, body, config)).data),
  patch: async <TResponse, TBody>(url: string, body: TBody, config?: AxiosRequestConfig) =>
    unwrap<TResponse>((await apiClient.patch(url, body, config)).data),
  delete: async <TResponse>(url: string, config?: AxiosRequestConfig) =>
    unwrap<TResponse>((await apiClient.delete(url, config)).data),
};
