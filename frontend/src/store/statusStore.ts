import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { initialStatuses } from '@/data/statuses';
import type { StatusUpdate } from '@/data/types';

type StatusState = {
  statuses: StatusUpdate[];
  markSeen: (id: string) => void;
};

export const useStatusStore = create<StatusState>()(
  persist(
    (set) => ({
      statuses: initialStatuses,
      markSeen: (id) =>
        set((s) => ({ statuses: s.statuses.map((st) => (st.id === id ? { ...st, seen: true } : st)) })),
    }),
    { name: 'slyderchat.status', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
