import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { apiClient } from '@/api/client';
import { sendChatMessage, sendRead } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import type { Chat, Message, MessageContentType, MessageStatus } from '@/data/types';

function currentUserId(): string {
  return useAuthStore.getState().profile.id;
}

function previewFor(dto: any): string {
  if (!dto) return '';
  if (dto.deleted) return 'This message was deleted';
  switch (dto.contentType) {
    case 'IMAGE':
      return '📷 Photo';
    case 'VIDEO':
      return '🎥 Video';
    case 'AUDIO':
      return '🎤 Audio';
    case 'DOCUMENT':
      return '📄 Document';
    default:
      return dto.body ?? '';
  }
}

function statusFromDto(status: string | null | undefined): MessageStatus {
  return (status ?? 'SENT').toLowerCase() as MessageStatus;
}

function messageFromDto(dto: any): Message {
  return {
    id: String(dto.id),
    chatId: String(dto.conversationId),
    senderId: String(dto.senderId),
    text: dto.deleted ? '' : dto.body ?? '',
    createdAt: dto.createdAt,
    status: statusFromDto(dto.status),
    contentType: dto.contentType as MessageContentType,
    mediaUrl: dto.deleted ? null : dto.mediaUrl,
    replyToId: dto.replyToId != null ? String(dto.replyToId) : null,
    deleted: !!dto.deleted,
    clientTempId: dto.clientTempId ?? undefined,
  };
}

function chatFromSummaryDto(dto: any): Chat {
  return {
    id: String(dto.id),
    name: dto.name ?? 'Unknown',
    avatarUri: dto.avatarUrl ?? null,
    isGroup: dto.type === 'GROUP',
    memberIds: (dto.memberIds ?? []).map(String),
    lastMessagePreview: previewFor(dto.lastMessage),
    lastMessageSenderName: undefined,
    lastMessageStatus: dto.lastMessage && dto.lastMessage.senderId != null && String(dto.lastMessage.senderId) === currentUserId()
      ? statusFromDto(dto.lastMessage.status)
      : null,
    updatedAt: dto.updatedAt,
    unreadCount: dto.unreadCount ?? 0,
  };
}

function upsertChat(chats: Chat[], chat: Chat): Chat[] {
  const idx = chats.findIndex((c) => c.id === chat.id);
  if (idx >= 0) {
    const next = [...chats];
    next[idx] = { ...chats[idx], ...chat };
    return next;
  }
  return [chat, ...chats];
}

function reduceIncoming(list: Message[], dto: any, meId: string, matchClientTempId?: string): Message[] {
  const realId = String(dto.id);
  let idx = -1;
  if (matchClientTempId) {
    idx = list.findIndex((m) => m.clientTempId === matchClientTempId);
  }
  if (idx < 0) {
    idx = list.findIndex((m) => m.id === realId);
  }
  if (idx < 0 && String(dto.senderId) === meId) {
    idx = list.findIndex((m) => m.pending);
  }
  const mapped = messageFromDto(dto);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = mapped;
    return next;
  }
  return [...list, mapped].sort((a, b) => a.createdAt - b.createdAt || Number(a.id) - Number(b.id));
}

type ChatsState = {
  chats: Chat[];
  messagesByChat: Record<string, Message[]>;
  hasMoreByChat: Record<string, boolean>;
  receiptsByMessage: Record<string, Record<string, 'DELIVERED' | 'READ'>>;
  activeChatId: string | null;
  loadingChats: boolean;

  setActiveChatId: (chatId: string | null) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string, before?: boolean) => Promise<void>;
  openChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string, replyToId?: string) => void;
  sendMediaMessage: (chatId: string, contentType: MessageContentType, mediaUrl: string, replyToId?: string) => void;
  deleteForEveryone: (messageId: string) => Promise<void>;

  applyIncomingMessage: (dto: any) => void;
  applyAck: (clientTempId: string, dto: any) => void;
  applyReceipt: (payload: { conversationId: number; messageId: number; userId: number; status: string }) => void;

  ensureDirectChat: (userId: string) => Promise<Chat>;
  createGroup: (name: string, memberIds: string[]) => Promise<Chat>;
  addMembers: (chatId: string, memberIds: string[]) => Promise<void>;
  leaveGroup: (chatId: string) => Promise<void>;

  markRead: (chatId: string) => void;
  togglePin: (chatId: string) => void;
  toggleMute: (chatId: string) => void;
  toggleArchive: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  toggleStar: (chatId: string, messageId: string) => void;
  ensureChat: (chat: Chat) => void;
};

export const useChatsStore = create<ChatsState>()(
  persist(
    (set, get) => ({
      chats: [],
      messagesByChat: {},
      hasMoreByChat: {},
      receiptsByMessage: {},
      activeChatId: null,
      loadingChats: false,

      setActiveChatId: (chatId) => set({ activeChatId: chatId }),

      fetchChats: async () => {
        set({ loadingChats: true });
        try {
          const { data } = await apiClient.get('/api/conversations');
          const chats: Chat[] = data.map(chatFromSummaryDto);
          chats.sort((a, b) => b.updatedAt - a.updatedAt);
          set({ chats, loadingChats: false });
        } catch {
          set({ loadingChats: false });
        }
      },

      fetchMessages: async (chatId, before) => {
        const state = get();
        if (before && state.hasMoreByChat[chatId] === false) return;
        const existing = state.messagesByChat[chatId] ?? [];
        const beforeId = before && existing.length > 0 ? existing[0].id : undefined;

        const { data } = await apiClient.get(`/api/conversations/${chatId}/messages`, {
          params: beforeId ? { beforeId, limit: 50 } : { limit: 50 },
        });
        const mapped: Message[] = data.map(messageFromDto).reverse();
        set((s) => ({
          messagesByChat: {
            ...s.messagesByChat,
            [chatId]: before ? [...mapped, ...(s.messagesByChat[chatId] ?? [])] : mapped,
          },
          hasMoreByChat: { ...s.hasMoreByChat, [chatId]: data.length === 50 },
        }));
      },

      openChat: (chatId) => {
        set((s) => ({ chats: s.chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)) }));
        sendRead(chatId);
        apiClient.post(`/api/conversations/${chatId}/read`).catch(() => {});
      },

      sendMessage: (chatId, text, replyToId) => {
        const meId = currentUserId();
        const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const optimistic: Message = {
          id: clientTempId,
          chatId,
          senderId: meId,
          text,
          createdAt: Date.now(),
          status: 'sent',
          contentType: 'TEXT',
          replyToId: replyToId ?? null,
          clientTempId,
          pending: true,
        };
        set((s) => ({
          messagesByChat: { ...s.messagesByChat, [chatId]: [...(s.messagesByChat[chatId] ?? []), optimistic] },
          chats: s.chats.map((c) =>
            c.id === chatId
              ? { ...c, lastMessagePreview: text, lastMessageStatus: 'sent', updatedAt: optimistic.createdAt }
              : c,
          ),
        }));
        sendChatMessage({ conversationId: chatId, contentType: 'TEXT', body: text, replyToId, clientTempId });
      },

      sendMediaMessage: (chatId, contentType, mediaUrl, replyToId) => {
        const meId = currentUserId();
        const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const optimistic: Message = {
          id: clientTempId,
          chatId,
          senderId: meId,
          text: '',
          createdAt: Date.now(),
          status: 'sent',
          contentType,
          mediaUrl,
          replyToId: replyToId ?? null,
          clientTempId,
          pending: true,
        };
        set((s) => ({
          messagesByChat: { ...s.messagesByChat, [chatId]: [...(s.messagesByChat[chatId] ?? []), optimistic] },
          chats: s.chats.map((c) =>
            c.id === chatId
              ? { ...c, lastMessagePreview: previewFor({ contentType }), lastMessageStatus: 'sent', updatedAt: optimistic.createdAt }
              : c,
          ),
        }));
        sendChatMessage({ conversationId: chatId, contentType, mediaUrl, replyToId, clientTempId });
      },

      deleteForEveryone: async (messageId) => {
        await apiClient.delete(`/api/conversations/messages/${messageId}`);
      },

      applyIncomingMessage: (dto) => {
        const meId = currentUserId();
        const chatId = String(dto.conversationId);
        const state = get();
        const isMine = String(dto.senderId) === meId;
        const isActive = state.activeChatId === chatId;

        set((s) => ({
          messagesByChat: {
            ...s.messagesByChat,
            [chatId]: reduceIncoming(s.messagesByChat[chatId] ?? [], dto, meId),
          },
        }));

        set((s) => {
          const existingChat = s.chats.find((c) => c.id === chatId);
          if (!existingChat) {
            // Conversation we don't know about yet (e.g. someone just started a chat with us).
            get().fetchChats();
            return {};
          }
          const bumpUnread = !isMine && !isActive;
          const chats = s.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  lastMessagePreview: previewFor(dto),
                  lastMessageStatus: isMine ? statusFromDto(dto.status) : null,
                  updatedAt: dto.createdAt,
                  unreadCount: bumpUnread ? c.unreadCount + 1 : c.unreadCount,
                }
              : c,
          );
          chats.sort((a, b) => b.updatedAt - a.updatedAt);
          return { chats };
        });

        if (!isMine && isActive) {
          sendRead(chatId);
        }
      },

      applyAck: (clientTempId, dto) => {
        const meId = currentUserId();
        const chatId = String(dto.conversationId);
        set((s) => ({
          messagesByChat: {
            ...s.messagesByChat,
            [chatId]: reduceIncoming(s.messagesByChat[chatId] ?? [], dto, meId, clientTempId),
          },
        }));
      },

      applyReceipt: ({ conversationId, messageId, userId, status }) => {
        const chatId = String(conversationId);
        const msgId = String(messageId);
        const meId = currentUserId();

        set((s) => {
          const receiptsForMessage = { ...(s.receiptsByMessage[msgId] ?? {}), [String(userId)]: status as 'DELIVERED' | 'READ' };
          const receiptsByMessage = { ...s.receiptsByMessage, [msgId]: receiptsForMessage };

          const chat = s.chats.find((c) => c.id === chatId);
          const recipientIds = (chat?.memberIds ?? []).filter((id) => id !== meId);
          const statuses = recipientIds.map((id) => receiptsForMessage[id] ?? 'SENT');
          const aggregate: MessageStatus = statuses.every((st) => st === 'READ')
            ? 'read'
            : statuses.every((st) => st === 'READ' || st === 'DELIVERED')
              ? 'delivered'
              : 'sent';

          const messages = (s.messagesByChat[chatId] ?? []).map((m) => (m.id === msgId ? { ...m, status: aggregate } : m));
          const lastMessage = messages[messages.length - 1];
          const chats = s.chats.map((c) =>
            c.id === chatId && lastMessage?.id === msgId ? { ...c, lastMessageStatus: aggregate } : c,
          );

          return {
            receiptsByMessage,
            messagesByChat: { ...s.messagesByChat, [chatId]: messages },
            chats,
          };
        });
      },

      ensureDirectChat: async (userId) => {
        const { data } = await apiClient.post('/api/conversations/direct', { userId: Number(userId) });
        const chat = chatFromSummaryDto(data);
        set((s) => ({ chats: upsertChat(s.chats, chat) }));
        return chat;
      },

      createGroup: async (name, memberIds) => {
        const { data } = await apiClient.post('/api/conversations/group', {
          name,
          memberIds: memberIds.map(Number),
        });
        const chat = chatFromSummaryDto(data);
        set((s) => ({ chats: upsertChat(s.chats, chat) }));
        return chat;
      },

      addMembers: async (chatId, memberIds) => {
        await apiClient.post(`/api/conversations/${chatId}/members`, { memberIds: memberIds.map(Number) });
        await get().fetchChats();
      },

      leaveGroup: async (chatId) => {
        await apiClient.delete(`/api/conversations/${chatId}/members/me`);
        set((s) => ({ chats: s.chats.filter((c) => c.id !== chatId) }));
      },

      markRead: (chatId) => get().openChat(chatId),

      togglePin: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === chatId ? { ...c, pinned: !c.pinned } : c)),
        })),

      toggleMute: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === chatId ? { ...c, muted: !c.muted } : c)),
        })),

      toggleArchive: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === chatId ? { ...c, archived: !c.archived } : c)),
        })),

      deleteChat: (chatId) =>
        set((s) => ({
          chats: s.chats.filter((c) => c.id !== chatId),
        })),

      toggleStar: (chatId, messageId) =>
        set((s) => ({
          messagesByChat: {
            ...s.messagesByChat,
            [chatId]: (s.messagesByChat[chatId] ?? []).map((m) =>
              m.id === messageId ? { ...m, starred: !m.starred } : m,
            ),
          },
        })),

      ensureChat: (chat) => {
        if (!get().chats.some((c) => c.id === chat.id)) {
          set((s) => ({ chats: [chat, ...s.chats] }));
        }
      },
    }),
    { name: 'slyderchat.chats', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function selectVisibleChats(chats: Chat[]): Chat[] {
  return chats
    .filter((c) => !c.archived)
    .sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
}

export function selectArchivedChats(chats: Chat[]): Chat[] {
  return chats.filter((c) => c.archived).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function selectStarredMessages(messagesByChat: Record<string, Message[]>): Message[] {
  return Object.values(messagesByChat)
    .flat()
    .filter((m) => m.starred)
    .sort((a, b) => b.createdAt - a.createdAt);
}
