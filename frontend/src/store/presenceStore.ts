import { create } from 'zustand';

type PresenceEntry = { online: boolean; lastSeen?: number };

type PresenceState = {
  onlineByUser: Record<string, PresenceEntry>;
  typingByChat: Record<string, Record<string, boolean>>;
  setPresence: (userId: string, online: boolean, lastSeen?: number) => void;
  setTyping: (chatId: string, userId: string, typing: boolean) => void;
  isAnyoneTyping: (chatId: string, exceptUserId?: string) => boolean;
};

export const usePresenceStore = create<PresenceState>()((set, get) => ({
  onlineByUser: {},
  typingByChat: {},

  setPresence: (userId, online, lastSeen) =>
    set((s) => ({
      onlineByUser: { ...s.onlineByUser, [userId]: { online, lastSeen: lastSeen ?? s.onlineByUser[userId]?.lastSeen } },
    })),

  setTyping: (chatId, userId, typing) =>
    set((s) => {
      const chatTyping = { ...(s.typingByChat[chatId] ?? {}) };
      if (typing) {
        chatTyping[userId] = true;
      } else {
        delete chatTyping[userId];
      }
      return { typingByChat: { ...s.typingByChat, [chatId]: chatTyping } };
    }),

  isAnyoneTyping: (chatId, exceptUserId) => {
    const chatTyping = get().typingByChat[chatId] ?? {};
    return Object.keys(chatTyping).some((id) => id !== exceptUserId && chatTyping[id]);
  },
}));
