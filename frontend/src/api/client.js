import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/config/env';
import { TOKEN_STORAGE_KEY } from '@/config/storageKeys';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Generous timeout: the free-tier backend sleeps after ~15 min idle and can
  // take 30-60s to cold-start on the first request after a lull.
  timeout: 60000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      router.replace('/phone-input');
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.error ?? error?.message ?? fallback;
}
