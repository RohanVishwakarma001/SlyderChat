import { create } from 'zustand';

import { apiClient } from '@/api/client';
import { contacts as demoContacts } from '@/data/demoContacts';
import type { Contact } from '@/data/types';

type UsersState = {
  byId: Record<string, Contact>;
  upsertMany: (contacts: Contact[]) => void;
  upsertOne: (contact: Contact) => void;
  setOnline: (id: string, online: boolean) => void;
};

const seed: Record<string, Contact> = {};
demoContacts.forEach((c) => {
  seed[c.id] = c;
});

export const useUsersStore = create<UsersState>()((set) => ({
  byId: seed,

  upsertMany: (contacts) =>
    set((s) => {
      const byId = { ...s.byId };
      contacts.forEach((c) => {
        byId[c.id] = { ...byId[c.id], ...c };
      });
      return { byId };
    }),

  upsertOne: (contact) =>
    set((s) => ({ byId: { ...s.byId, [contact.id]: { ...s.byId[contact.id], ...contact } } })),

  setOnline: (id, online) =>
    set((s) => ({
      byId: {
        ...s.byId,
        [id]: s.byId[id]
          ? { ...s.byId[id], online }
          : { id, name: id, phone: '', about: '', avatarUri: null, online },
      },
    })),
}));

export function contactById(id: string): Contact | undefined {
  return useUsersStore.getState().byId[id];
}

export function allContacts(): Contact[] {
  return Object.values(useUsersStore.getState().byId);
}

/** Fetches and caches any user ids not already known (e.g. group members we haven't seen yet). */
export async function ensureUsersLoaded(ids: string[]): Promise<void> {
  const state = useUsersStore.getState();
  const missing = [...new Set(ids)].filter((id) => id && !state.byId[id]);
  if (missing.length === 0) return;

  const results = await Promise.allSettled(missing.map((id) => apiClient.get(`/api/users/${id}`)));
  const loaded: Contact[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const dto = result.value.data;
      loaded.push({
        id: String(dto.id),
        name: dto.name,
        phone: dto.phone,
        about: dto.about ?? '',
        avatarUri: dto.avatarUrl ?? null,
        online: dto.online,
      });
    }
  });
  if (loaded.length > 0) {
    useUsersStore.getState().upsertMany(loaded);
  }
}
