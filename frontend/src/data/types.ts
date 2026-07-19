export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageContentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export type Message = {
  id: string;
  chatId: string;
  senderId: string; // real backend user id
  text: string;
  createdAt: number; // epoch ms
  status: MessageStatus; // meaningful only for messages sent by me
  starred?: boolean;
  contentType?: MessageContentType;
  mediaUrl?: string | null;
  replyToId?: string | null;
  deleted?: boolean;
  clientTempId?: string;
  pending?: boolean; // optimistic, not yet acked by the server
};

export type Chat = {
  id: string;
  name: string;
  avatarUri?: string | null;
  isGroup?: boolean;
  memberIds?: string[];
  lastMessagePreview: string;
  lastMessageSenderName?: string; // for group previews ("Sneha: ...")
  lastMessageStatus?: MessageStatus | null; // null = incoming, no tick
  updatedAt: number;
  unreadCount: number;
  pinned?: boolean;
  archived?: boolean;
  muted?: boolean;
};

export type Contact = {
  id: string;
  name: string;
  avatarUri?: string | null;
  phone: string;
  about: string;
  online?: boolean;
};

export type CallDirection = 'outgoing' | 'incoming' | 'missed';
export type CallKind = 'audio' | 'video';

export type CallLogEntry = {
  id: string;
  contactId: string;
  name: string;
  avatarUri?: string | null;
  isGroup?: boolean;
  direction: CallDirection;
  kind: CallKind;
  createdAt: number;
};

export type StatusUpdate = {
  id: string;
  contactId: string;
  name: string;
  avatarUri?: string | null;
  seen: boolean;
  createdAt: number;
};

export type Channel = {
  id: string;
  name: string;
  avatarUri?: string | null;
  preview: string;
  updatedAt: number;
};

export type CommunityGroup = {
  id: string;
  name: string;
  preview: string;
  updatedAt: number;
};

export type Community = {
  id: string;
  name: string;
  avatarUri?: string | null;
  announcementPreview: string;
  announcementAt: number;
  groups: CommunityGroup[];
  totalGroups: number;
};
