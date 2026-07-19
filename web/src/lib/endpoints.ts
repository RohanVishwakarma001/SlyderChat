import { api } from '@/lib/api';
import type {
  AuthResponse,
  ConversationSummaryDto,
  MediaUploadResponse,
  MessageDto,
  RequestOtpResponse,
  UserDto,
} from '@/types';

export const AuthApi = {
  requestOtp: (phone: string) =>
    api
      .post<RequestOtpResponse>('/api/auth/request-otp', { phone })
      .then((r) => r.data),

  verifyOtp: (phone: string, otp: string, name: string) =>
    api
      .post<AuthResponse>('/api/auth/verify-otp', { phone, otp, name })
      .then((r) => r.data),
};

export const UserApi = {
  me: () => api.get<UserDto>('/api/users/me').then((r) => r.data),

  updateMe: (patch: { name?: string; about?: string; avatarUrl?: string }) =>
    api.put<UserDto>('/api/users/me', patch).then((r) => r.data),

  getById: (id: number) =>
    api.get<UserDto>(`/api/users/${id}`).then((r) => r.data),

  sync: (phones: string[]) =>
    api.post<UserDto[]>('/api/users/sync', { phones }).then((r) => r.data),
};

export const ConversationApi = {
  list: () =>
    api
      .get<ConversationSummaryDto[]>('/api/conversations')
      .then((r) => r.data),

  createDirect: (userId: number) =>
    api
      .post<ConversationSummaryDto>('/api/conversations/direct', { userId })
      .then((r) => r.data),

  createGroup: (name: string, memberIds: number[]) =>
    api
      .post<ConversationSummaryDto>('/api/conversations/group', {
        name,
        memberIds,
      })
      .then((r) => r.data),

  addMembers: (conversationId: number, memberIds: number[]) =>
    api
      .post(`/api/conversations/${conversationId}/members`, { memberIds })
      .then((r) => r.data),

  leave: (conversationId: number) =>
    api
      .delete(`/api/conversations/${conversationId}/members/me`)
      .then((r) => r.data),

  messages: (conversationId: number, beforeId?: number, limit = 50) =>
    api
      .get<MessageDto[]>(`/api/conversations/${conversationId}/messages`, {
        params: { beforeId, limit },
      })
      .then((r) => r.data),

  markRead: (conversationId: number) =>
    api.post(`/api/conversations/${conversationId}/read`).then((r) => r.data),

  deleteMessage: (messageId: number) =>
    api
      .delete(`/api/conversations/messages/${messageId}`)
      .then((r) => r.data),
};

export const MediaApi = {
  upload: (file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<MediaUploadResponse>('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },
};
