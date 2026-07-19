import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'info' | 'success';
}

let toastCounter = 0;

interface UiState {
  toasts: Toast[];
  wsConnected: boolean;
  wsEverConnected: boolean;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
  setWsConnected: (connected: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  wsConnected: false,
  wsEverConnected: false,

  addToast: (message, type = 'error') => {
    const id = ++toastCounter;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setWsConnected: (connected) =>
    set((state) => ({
      wsConnected: connected,
      wsEverConnected: state.wsEverConnected || connected,
    })),
}));
