import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/Avatar';
import { useChatStore } from '@/store/chatStore';
import { formatLastSeen } from '@/utils/format';
import type { ConversationSummaryDto } from '@/types';

const EMPTY_TYPING: Record<number, boolean> = {};

interface ChatHeaderProps {
  conversation: ConversationSummaryDto;
  onOpenInfo: () => void;
}

export function ChatHeader({ conversation, onOpenInfo }: ChatHeaderProps) {
  const navigate = useNavigate();
  const myUserId = useChatStore((s) => s.myUserId);
  const usersById = useChatStore((s) => s.usersById);
  const typingUsers = useChatStore(
    (s) => s.typingByConversation[conversation.id] ?? EMPTY_TYPING,
  );

  const typingIds = Object.entries(typingUsers)
    .filter(([, typing]) => typing)
    .map(([id]) => Number(id));

  const statusText = (() => {
    if (conversation.type === 'DIRECT') {
      if (typingIds.length > 0) return 'typing…';
      const otherId = conversation.memberIds.find((id) => id !== myUserId);
      const other = otherId !== undefined ? usersById[otherId] : undefined;
      if (!other) return '';
      return other.online ? 'online' : formatLastSeen(other.lastSeen);
    }
    if (typingIds.length > 0) {
      const names = typingIds.map((id) => usersById[id]?.name ?? 'Someone');
      return `${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} typing…`;
    }
    const memberNames = conversation.memberIds
      .map((id) => (id === myUserId ? 'You' : usersById[id]?.name))
      .filter(Boolean);
    return memberNames.join(', ');
  })();

  const isTyping = typingIds.length > 0;

  return (
    <div className="glass flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
      <button
        onClick={() => navigate('/app')}
        className="rounded-full p-1 text-[var(--color-text-dim)] hover:bg-white/10 md:hidden"
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={onOpenInfo}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 text-left transition hover:bg-white/[0.03]"
      >
        <Avatar
          id={conversation.id}
          name={conversation.name}
          avatarUrl={conversation.avatarUrl}
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{conversation.name}</div>
          <div
            className={`truncate text-xs ${isTyping ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}
          >
            {statusText}
          </div>
        </div>
      </button>
    </div>
  );
}
