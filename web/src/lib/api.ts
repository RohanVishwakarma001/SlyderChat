import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/env';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = [800, 1600, 3200];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const TOKEN_STORAGE_KEY = 'chat_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

type UnauthorizedHandler = () => void;
type ErrorHandler = (message: string) => void;

let onUnauthorized: UnauthorizedHandler | null = null;
let onError: ErrorHandler | null = null;

export function registerApiHandlers(handlers: {
  onUnauthorized: UnauthorizedHandler;
  onError: ErrorHandler;
}): void {
  onUnauthorized = handlers.onUnauthorized;
  onError = handlers.onError;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const config = error.config as RetriableConfig | undefined;
    const isAuthRoute = config?.url?.includes('/api/auth');

    // A 5xx on a GET is usually a transient blip (e.g. the DB's connection
    // pool recovering from a serverless free-tier auto-suspend, which can
    // take a few seconds to fully wake up), not a real failure. Retry with
    // backoff before bothering the user with a toast.
    const retryCount = config?._retryCount ?? 0;
    const isRetriableGet =
      status !== undefined &&
      status >= 500 &&
      config?.method?.toLowerCase() === 'get' &&
      retryCount < MAX_RETRIES;

    if (isRetriableGet && config) {
      config._retryCount = retryCount + 1;
      await delay(RETRY_BACKOFF_MS[retryCount]);
      return api(config);
    }

    if (status === 401 && !isAuthRoute) {
      onUnauthorized?.();
    } else {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong';
      onError?.(message);
    }
    return Promise.reject(error);
  },
);
