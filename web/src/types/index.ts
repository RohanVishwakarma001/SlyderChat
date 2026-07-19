export type ConversationType = 'DIRECT' | 'GROUP';
export type ContentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
export type MessageDeliveryStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface UserDto {
  id: number;
  phone: string;
  name: string;
  about: string | null;
  avatarUrl: string | null;
  lastSeen: number | null;
  online: boolean;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  contentType: ContentType;
  body: string | null;
  mediaUrl: string | null;
  replyToId: number | null;
  deleted: boolean;
  createdAt: number;
  status: MessageDeliveryStatus | null;
  clientTempId: string | null;
}

export interface ConversationSummaryDto {
  id: number;
  type: ConversationType;
  name: string;
  avatarUrl: string | null;
  memberIds: number[];
  lastMessage: MessageDto | null;
  unreadCount: number;
  updatedAt: number;
}

export interface AckDto {
  clientTempId: string;
  message: MessageDto;
}

export interface ReceiptDto {
  conversationId: number;
  messageId: number | null;
  userId: number;
  status: MessageDeliveryStatus;
  at: number;
}

export interface TypingDto {
  conversationId: number;
  userId: number;
  typing: boolean;
}

export interface PresenceDto {
  userId: number;
  online: boolean;
  lastSeen: number | null;
}

export interface MediaUploadResponse {
  url: string;
  publicId: string;
  resourceType: string;
  bytes: number;
}

export interface RequestOtpResponse {
  message: string;
  devOtp?: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface ChatSendPayload {
  conversationId: number;
  contentType: ContentType;
  body: string | null;
  mediaUrl: string | null;
  replyToId: number | null;
  clientTempId: string;
}
