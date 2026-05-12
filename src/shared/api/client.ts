import axios, { AxiosHeaders, type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@shared/config/env';
import { getGuestAccessToken, getStoredSession, getValidAccessToken, refreshStoredSession } from '@shared/auth';
import { isApiEnvelope } from '@shared/model/api';
import { invalidateStoredSession } from '../auth/session-refresh';

const apiClient = axios.create({
  baseURL: env.apiUrl,
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

apiClient.interceptors.request.use(async (config) => {

  const accessToken = await getValidAccessToken();

  const guestAccessToken = getGuestAccessToken();

  if (accessToken) {

    config.headers.Authorization = `Bearer ${accessToken}`;

  } else if (guestAccessToken) {

    config.headers.Authorization = `Bearer ${guestAccessToken}`;

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

  (error) => {
    if (error.response?.status === 401) {
      invalidateStoredSession();
    }
    return Promise.reject(error);
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
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      getStoredSession()?.refreshToken
    ) {
      originalRequest._retry = true;

      try {
        const refreshedSession = await refreshStoredSession(true);

        if (refreshedSession?.accessToken) {
          setAuthorizationHeader(originalRequest, refreshedSession.accessToken);
          return apiClient(originalRequest);
        }
      } catch {
        // handled by session refresh manager
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
