import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { apiClient, extractErrorMessage } from '@/api/client';
import { TOKEN_STORAGE_KEY } from '@/config/storageKeys';
import { connectSocket, disconnectSocket } from '@/services/socket';

type Profile = {
  id: string;
  name: string;
  about: string;
  avatarUri: string | null;
  phone: string;
};

const EMPTY_PROFILE: Profile = { id: '', name: '', about: '', avatarUri: null, phone: '' };

function mapUserDto(dto: any): Profile {
  return {
    id: String(dto.id),
    name: dto.name ?? '',
    about: dto.about ?? '',
    avatarUri: dto.avatarUrl ?? null,
    phone: dto.phone ?? '',
  };
}

type AuthState = {
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  bootstrapping: boolean;
  profile: Profile;
  token: string | null;
  pendingPhone: string;
  devOtp: string | null;
  otpRequestInFlight: boolean;
  otpError: string | null;
  verifyInFlight: boolean;
  verifyError: string | null;

  setOnboarded: () => void;
  bootstrap: () => Promise<void>;
  requestOtp: (phoneE164: string) => Promise<void>;
  verifyOtp: (otp: string, name?: string) => Promise<void>;
  updateProfile: (patch: Partial<{ name: string; about: string; avatarUrl: string }>) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      isAuthenticated: false,
      bootstrapping: true,
      profile: EMPTY_PROFILE,
      token: null,
      pendingPhone: '',
      devOtp: null,
      otpRequestInFlight: false,
      otpError: null,
      verifyInFlight: false,
      verifyError: null,

      setOnboarded: () => set({ hasOnboarded: true }),

      bootstrap: async () => {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) {
          set({ bootstrapping: false, isAuthenticated: false });
          return;
        }
        try {
          const { data } = await apiClient.get('/api/users/me');
          set({ token, profile: mapUserDto(data), isAuthenticated: true, bootstrapping: false });
          connectSocket(token);
        } catch {
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          set({ token: null, profile: EMPTY_PROFILE, isAuthenticated: false, bootstrapping: false });
        }
      },

      requestOtp: async (phoneE164) => {
        set({ otpRequestInFlight: true, otpError: null, pendingPhone: phoneE164 });
        try {
          const { data } = await apiClient.post('/api/auth/request-otp', { phone: phoneE164 });
          set({ devOtp: data.devOtp ?? null, otpRequestInFlight: false });
        } catch (e) {
          set({ otpRequestInFlight: false, otpError: extractErrorMessage(e) });
          throw e;
        }
      },

      verifyOtp: async (otp, name) => {
        set({ verifyInFlight: true, verifyError: null });
        try {
          const phone = get().pendingPhone;
          const { data } = await apiClient.post('/api/auth/verify-otp', { phone, otp, name });
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token);
          set({
            token: data.token,
            profile: mapUserDto(data.user),
            isAuthenticated: true,
            devOtp: null,
            verifyInFlight: false,
          });
          connectSocket(data.token);
        } catch (e) {
          set({ verifyInFlight: false, verifyError: extractErrorMessage(e) });
          throw e;
        }
      },

      updateProfile: async (patch) => {
        const { data } = await apiClient.put('/api/users/me', patch);
        set({ profile: mapUserDto(data) });
      },

      signOut: async () => {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        disconnectSocket();
        set({ token: null, profile: EMPTY_PROFILE, isAuthenticated: false });
      },
    }),
    {
      name: 'slyderchat.auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ hasOnboarded: s.hasOnboarded }) as AuthState,
    },
  ),
);
