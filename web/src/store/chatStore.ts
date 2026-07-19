import { create } from 'zustand';
import type {
  AckDto,
  ConversationSummaryDto,
  MessageDeliveryStatus,
  MessageDto,
  PresenceDto,
  ReceiptDto,
  TypingDto,
  UserDto,
} from '@/types';
import { ConversationApi, UserApi } from '@/lib/endpoints';
import { publishChatSend, publishRead } from '@/lib/ws';
import { notifyIncomingMessage } from '@/lib/notifications';

export type LocalMessage = MessageDto & { pending?: boolean };

const STATUS_ORDER: MessageDeliveryStatus[] = ['SENT', 'DELIVERED', 'READ'];
const STATUS_RANK: Record<MessageDeliveryStatus, number> = {
  SENT: 0,
  DELIVERED: 1,
  READ: 2,
};

let tempIdCounter = 0;

function nextTempMessageId(): number {
  tempIdCounter -= 1;
  return tempIdCounter;
}

function upsertById(list: LocalMessage[], msg: MessageDto): LocalMessage[] {
  const idx = list.findIndex((m) => m.id === msg.id);
  if (idx >= 0) {
    const merged: LocalMessage = { ...list[idx], ...msg, pending: false };
    const copy = list.slice();
    copy[idx] = merged;
    return copy;
  }
  const entry: LocalMessage = { ...msg, pending: false };
  const insertIdx = list.findIndex((m) => m.id > msg.id);
  if (insertIdx === -1) return [...list, entry];
  return [...list.slice(0, insertIdx), entry, ...list.slice(insertIdx)];
}

function aggregateStatus(
  receipts: Record<number, MessageDeliveryStatus> | undefined,
  recipientIds: number[],
): MessageDeliveryStatus {
  if (recipientIds.length === 0) return 'SENT';
  let minRank = 2;
  for (const id of recipientIds) {
    const status = receipts?.[id];
    const rank = status ? STATUS_RANK[status] : 0;
    if (rank < minRank) minRank = rank;
  }
  return STATUS_ORDER[minRank];
}

interface ChatState {
  myUserId: number | null;
  conversations: Record<number, ConversationSummaryDto>;
  usersById: Record<number, UserDto>;
  messagesByConversation: Record<number, LocalMessage[]>;
  hasMoreByConversation: Record<number, boolean>;
  loadingMessages: Record<number, boolean>;
  loadingConversations: boolean;
  activeConversationId: number | null;
  typingByConversation: Record<number, Record<number, boolean>>;
  messageReceipts: Record<number, Record<number, MessageDeliveryStatus>>;
  replyTargetByConversation: Record<number, MessageDto | null>;

  setMyUserId: (id: number) => void;
  reset: () => void;
  cacheUsers: (users: UserDto[]) => void;
  ensureUsers: (ids: number[]) => Promise<void>;
  loadConversations: () => Promise<void>;
  upsertConversation: (conv: ConversationSummaryDto) => void;
  selectConversation: (id: number | null) => void;
  loadInitialMessages: (conversationId: number) => Promise<void>;
  loadMoreMessages: (conversationId: number) => Promise<void>;
  sendMessage: (
    conversationId: number,
    payload: {
      contentType: MessageDto['contentType'];
      body: string | null;
      mediaUrl: string | null;
      replyToId: number | null;
    },
  ) => void;
  handleIncomingMessage: (msg: MessageDto) => void;
  handleAck: (ack: AckDto) => void;
  handleReceipt: (r: ReceiptDto) => void;
  handleTyping: (t: TypingDto) => void;
  handlePresence: (p: PresenceDto) => void;
  markRead: (conversationId: number) => void;
  deleteMessage: (conversationId: number, messageId: number) => Promise<void>;
  setReplyTarget: (conversationId: number, message: MessageDto | null) => void;
  createDirectChat: (userId: number) => Promise<ConversationSummaryDto>;
  createGroupChat: (
    name: string,
    memberIds: number[],
  ) => Promise<ConversationSummaryDto>;
  addMembers: (conversationId: number, memberIds: number[]) => Promise<void>;
  leaveConversation: (conversationId: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  myUserId: null,
  conversations: {},
  usersById: {},
  messagesByConversation: {},
  hasMoreByConversation: {},
  loadingMessages: {},
  loadingConversations: false,
  activeConversationId: null,
  typingByConversation: {},
  messageReceipts: {},
  replyTargetByConversation: {},

  setMyUserId: (id) => set({ myUserId: id }),

  reset: () =>
    set({
      myUserId: null,
      conversations: {},
      usersById: {},
      messagesByConversation: {},
      hasMoreByConversation: {},
      loadingMessages: {},
      loadingConversations: false,
      activeConversationId: null,
      typingByConversation: {},
      messageReceipts: {},
      replyTargetByConversation: {},
    }),

  cacheUsers: (users) =>
    set((state) => {
      const usersById = { ...state.usersById };
      for (const u of users) usersById[u.id] = u;
      return { usersById };
    }),

  ensureUsers: async (ids) => {
    const missing = [...new Set(ids)].filter((id) => !get().usersById[id]);
    if (missing.length === 0) return;
    const users = await Promise.all(
      missing.map((id) => UserApi.getById(id).catch(() => null)),
    );
    get().cacheUsers(users.filter((u): u is UserDto => u !== null));
  },

  loadConversations: async () => {
    set({ loadingConversations: true });
    try {
      const list = await ConversationApi.list();
      const map: Record<number, ConversationSummaryDto> = {};
      for (const c of list) map[c.id] = c;
      set({ conversations: map, loadingConversations: false });
      const allMemberIds = list.flatMap((c) => c.memberIds);
      await get().ensureUsers(allMemberIds);
    } catch {
      set({ loadingConversations: false });
    }
  },

  upsertConversation: (conv) =>
    set((state) => ({
      conversations: { ...state.conversations, [conv.id]: conv },
    })),

  selectConversation: (id) => {
    set({ activeConversationId: id });
    if (id !== null) {
      if (!get().messagesByConversation[id]) {
        get().loadInitialMessages(id);
      }
      const conv = get().conversations[id];
      if (conv && conv.unreadCount > 0) {
        get().markRead(id);
      }
    }
  },

  loadInitialMessages: async (conversationId) => {
    set((state) => ({
      loadingMessages: { ...state.loadingMessages, [conversationId]: true },
    }));
    try {
      const desc = await ConversationApi.messages(conversationId);
      const asc = [...desc].reverse();
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: asc,
        },
        hasMoreByConversation: {
          ...state.hasMoreByConversation,
          [conversationId]: desc.length === 50,
        },
        loadingMessages: { ...state.loadingMessages, [conversationId]: false },
      }));
      const senderIds = asc.map((m) => m.senderId);
      await get().ensureUsers(senderIds);
    } catch {
      set((state) => ({
        loadingMessages: { ...state.loadingMessages, [conversationId]: false },
      }));
    }
  },

  loadMoreMessages: async (conversationId) => {
    const existing = get().messagesByConversation[conversationId] ?? [];
    if (existing.length === 0) return;
    if (!get().hasMoreByConversation[conversationId]) return;
    if (get().loadingMessages[conversationId]) return;
    set((state) => ({
      loadingMessages: { ...state.loadingMessages, [conversationId]: true },
    }));
    try {
      const beforeId = existing[0].id;
      const desc = await ConversationApi.messages(conversationId, beforeId);
      const asc = [...desc].reverse();
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [
            ...asc,
            ...(state.messagesByConversation[conversationId] ?? []),
          ],
        },
        hasMoreByConversation: {
          ...state.hasMoreByConversation,
          [conversationId]: desc.length === 50,
        },
        loadingMessages: { ...state.loadingMessages, [conversationId]: false },
      }));
      const senderIds = asc.map((m) => m.senderId);
      await get().ensureUsers(senderIds);
    } catch {
      set((state) => ({
        loadingMessages: { ...state.loadingMessages, [conversationId]: false },
      }));
    }
  },

  sendMessage: (conversationId, payload) => {
    const myUserId = get().myUserId;
    if (myUserId === null) return;
    const clientTempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tempMessage: LocalMessage = {
      id: nextTempMessageId(),
      conversationId,
      senderId: myUserId,
      contentType: payload.contentType,
      body: payload.body,
      mediaUrl: payload.mediaUrl,
      replyToId: payload.replyToId,
      deleted: false,
      createdAt: Date.now(),
      status: 'SENT',
      clientTempId,
      pending: true,
    };
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [
          ...(state.messagesByConversation[conversationId] ?? []),
          tempMessage,
        ],
      },
    }));
    publishChatSend({
      conversationId,
      contentType: payload.contentType,
      body: payload.body,
      mediaUrl: payload.mediaUrl,
      replyToId: payload.replyToId,
      clientTempId,
    });
  },

  handleIncomingMessage: (msg) => {
    const state = get();
    const isNew = !(state.messagesByConversation[msg.conversationId] ?? []).some(
      (m) => m.id === msg.id,
    );
    set((s) => ({
      messagesByConversation: {
        ...s.messagesByConversation,
        [msg.conversationId]: upsertById(
          s.messagesByConversation[msg.conversationId] ?? [],
          msg,
        ),
      },
    }));

    const conv = state.conversations[msg.conversationId];
    if (conv) {
      const isLatest = !conv.lastMessage || msg.id >= conv.lastMessage.id;
      const isActive =
        state.activeConversationId === msg.conversationId &&
        document.hasFocus();
      const bumpUnread =
        isNew && msg.senderId !== state.myUserId && !isActive;
      set((s) => ({
        conversations: {
          ...s.conversations,
          [msg.conversationId]: {
            ...conv,
            lastMessage: isLatest ? msg : conv.lastMessage,
            updatedAt: isNew ? Date.now() : conv.updatedAt,
            unreadCount: bumpUnread
              ? conv.unreadCount + 1
              : conv.unreadCount,
          },
        },
      }));
    }

    if (isNew && msg.senderId !== state.myUserId) {
      get().ensureUsers([msg.senderId]);
      notifyIncomingMessage(msg, state.usersById[msg.senderId]?.name ?? 'New message');
    }

    if (
      isNew &&
      msg.senderId !== state.myUserId &&
      state.activeConversationId === msg.conversationId &&
      document.hasFocus()
    ) {
      get().markRead(msg.conversationId);
    }
  },

  handleAck: (ack) => {
    set((state) => {
      const list = (
        state.messagesByConversation[ack.message.conversationId] ?? []
      ).filter((m) => !(m.pending && m.clientTempId === ack.clientTempId));
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [ack.message.conversationId]: upsertById(list, ack.message),
        },
      };
    });
    const conv = get().conversations[ack.message.conversationId];
    if (conv) {
      const isLatest = !conv.lastMessage || ack.message.id >= conv.lastMessage.id;
      set((s) => ({
        conversations: {
          ...s.conversations,
          [ack.message.conversationId]: {
            ...conv,
            lastMessage: isLatest ? ack.message : conv.lastMessage,
            updatedAt: Date.now(),
          },
        },
      }));
    }
  },

  handleReceipt: (r) => {
    const state = get();
    const conv = state.conversations[r.conversationId];
    const recipientIds = conv
      ? conv.memberIds.filter((id) => id !== state.myUserId)
      : [];

    set((s) => {
      const receipts = { ...s.messageReceipts };
      const messages = s.messagesByConversation[r.conversationId] ?? [];
      const targetIds =
        r.messageId !== null
          ? [r.messageId]
          : messages
              .filter((m) => m.senderId === s.myUserId && !m.deleted)
              .map((m) => m.id);

      for (const messageId of targetIds) {
        receipts[messageId] = {
          ...(receipts[messageId] ?? {}),
          [r.userId]: r.status,
        };
      }

      const updatedMessages = messages.map((m) => {
        if (!targetIds.includes(m.id)) return m;
        const status = aggregateStatus(receipts[m.id], recipientIds);
        return { ...m, status };
      });

      return {
        messageReceipts: receipts,
        messagesByConversation: {
          ...s.messagesByConversation,
          [r.conversationId]: updatedMessages,
        },
      };
    });
  },

  handleTyping: (t) =>
    set((state) => ({
      typingByConversation: {
        ...state.typingByConversation,
        [t.conversationId]: {
          ...state.typingByConversation[t.conversationId],
          [t.userId]: t.typing,
        },
      },
    })),

  handlePresence: (p) =>
    set((state) => {
      const existing = state.usersById[p.userId];
      if (!existing) return {};
      return {
        usersById: {
          ...state.usersById,
          [p.userId]: { ...existing, online: p.online, lastSeen: p.lastSeen },
        },
      };
    }),

  markRead: (conversationId) => {
    set((state) => {
      const conv = state.conversations[conversationId];
      if (!conv || conv.unreadCount === 0) return {};
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: { ...conv, unreadCount: 0 },
        },
      };
    });
    publishRead(conversationId);
    ConversationApi.markRead(conversationId).catch(() => {});
  },

  deleteMessage: async (conversationId, messageId) => {
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (
          state.messagesByConversation[conversationId] ?? []
        ).map((m) => (m.id === messageId ? { ...m, deleted: true, body: null, mediaUrl: null } : m)),
      },
    }));
    await ConversationApi.deleteMessage(messageId);
  },

  setReplyTarget: (conversationId, message) =>
    set((state) => ({
      replyTargetByConversation: {
        ...state.replyTargetByConversation,
        [conversationId]: message,
      },
    })),

  createDirectChat: async (userId) => {
    const conv = await ConversationApi.createDirect(userId);
    get().upsertConversation(conv);
    await get().ensureUsers(conv.memberIds);
    return conv;
  },

  createGroupChat: async (name, memberIds) => {
    const conv = await ConversationApi.createGroup(name, memberIds);
    get().upsertConversation(conv);
    await get().ensureUsers(conv.memberIds);
    return conv;
  },

  addMembers: async (conversationId, memberIds) => {
    await ConversationApi.addMembers(conversationId, memberIds);
    const list = await ConversationApi.list();
    const conv = list.find((c) => c.id === conversationId);
    if (conv) {
      get().upsertConversation(conv);
      await get().ensureUsers(conv.memberIds);
    }
  },

  leaveConversation: async (conversationId) => {
    await ConversationApi.leave(conversationId);
    set((state) => {
      const conversations = { ...state.conversations };
      delete conversations[conversationId];
      return {
        conversations,
        activeConversationId:
          state.activeConversationId === conversationId
            ? null
            : state.activeConversationId,
      };
    });
  },
}));
