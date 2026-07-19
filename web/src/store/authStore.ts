import { create } from 'zustand';
import type { UserDto } from '@/types';
import { clearToken, getToken, setToken } from '@/lib/api';
import { UserApi } from '@/lib/endpoints';
import { connectWs, disconnectWs } from '@/lib/ws';
import { useUiStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { wireWsHandlers } from '@/store/wsHandlers';

type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: UserDto | null;
  status: AuthStatus;
  boot: () => Promise<void>;
  login: (token: string, user: UserDto) => void;
  logout: () => void;
  updateUser: (patch: Partial<UserDto>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'booting',

  boot: async () => {
    const token = getToken();
    if (!token) {
      set({ status: 'unauthenticated' });
      return;
    }
    try {
      const user = await UserApi.me();
      set({ user, status: 'authenticated' });
      useChatStore.getState().setMyUserId(user.id);
      connectWs(token, wireWsHandlers());
    } catch {
      clearToken();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: (token, user) => {
    setToken(token);
    set({ user, status: 'authenticated' });
    useChatStore.getState().setMyUserId(user.id);
    connectWs(token, wireWsHandlers());
  },

  logout: () => {
    clearToken();
    disconnectWs();
    useChatStore.getState().reset();
    useUiStore.getState().setWsConnected(false);
    set({ user: null, status: 'unauthenticated' });
  },

  updateUser: (patch) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...patch } });
  },
}));
