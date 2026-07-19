import { Avatar } from '@/components/Avatar';
import { useChatStore } from '@/store/chatStore';
import { formatTime, mediaPreviewLabel } from '@/utils/format';
import type { ConversationSummaryDto } from '@/types';

interface ChatListItemProps {
  conversation: ConversationSummaryDto;
  active: boolean;
  onClick: () => void;
}

export function ChatListItem({ conversation, active, onClick }: ChatListItemProps) {
  const myUserId = useChatStore((s) => s.myUserId);
  const usersById = useChatStore((s) => s.usersById);
  const typingByConversation = useChatStore((s) => s.typingByConversation);

  const otherId =
    conversation.type === 'DIRECT'
      ? conversation.memberIds.find((id) => id !== myUserId)
      : undefined;
  const otherUser = otherId !== undefined ? usersById[otherId] : undefined;

  const typingUsers = typingByConversation[conversation.id] ?? {};
  const isSomeoneTyping = Object.values(typingUsers).some(Boolean);

  const preview = (() => {
    if (isSomeoneTyping) return 'typing…';
    const msg = conversation.lastMessage;
    if (!msg) return 'No messages yet';
    if (msg.deleted) return 'This message was deleted';
    if (msg.contentType !== 'TEXT') return mediaPreviewLabel(msg.contentType);
    return msg.body ?? '';
  })();

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
      }`}
    >
      <Avatar
        id={conversation.id}
        name={conversation.name}
        avatarUrl={conversation.avatarUrl}
        showOnlineDot={conversation.type === 'DIRECT'}
        online={otherUser?.online}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-[var(--color-text)]">
            {conversation.name}
          </span>
          {conversation.lastMessage && (
            <span className="shrink-0 font-mono text-[11px] text-[var(--color-text-faint)]">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={`truncate text-xs ${
              isSomeoneTyping
                ? 'text-[var(--color-accent)]'
                : conversation.lastMessage?.deleted
                  ? 'text-[var(--color-text-faint)] italic'
                  : 'text-[var(--color-text-dim)]'
            }`}
          >
            {preview}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[11px] font-semibold text-[#0A0E1A]">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
