import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

import { env } from '@shared/config/env';
import { getAccessToken } from '@shared/auth';
import { isApiEnvelope } from '@shared/model/api';

const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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
  (error: AxiosError<unknown>) => Promise.reject(new Error(toErrorMessage(error)))
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
