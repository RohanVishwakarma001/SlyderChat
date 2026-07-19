import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '@/components/Avatar';
import { ChatListItem } from '@/components/sidebar/ChatListItem';
import { NewChatModal } from '@/components/sidebar/NewChatModal';
import { NewGroupModal } from '@/components/sidebar/NewGroupModal';
import { ProfileDrawer } from '@/components/sidebar/ProfileDrawer';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
      <div className="flex-1">
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const activeId = conversationId ? Number(conversationId) : null;

  const user = useAuthStore((s) => s.user);
  const conversations = useChatStore((s) => s.conversations);
  const loadingConversations = useChatStore((s) => s.loadingConversations);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'chat' | 'group' | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const sorted = useMemo(() => {
    const list = Object.values(conversations);
    const filtered = search.trim()
      ? list.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
      : list;
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations, search]);

  const openConversation = (id: number) => navigate(`/app/${id}`);

  if (!user) return null;

  return (
    <div className="flex h-full flex-col bg-[var(--color-panel)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2.5 rounded-lg py-1 pr-2 transition hover:bg-white/[0.05]"
        >
          <Avatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} size={38} />
          <span className="max-w-[140px] truncate text-sm font-medium">{user.name}</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal('chat')}
            title="New chat"
            className="rounded-full p-2 text-[var(--color-text-dim)] transition hover:bg-white/10 hover:text-[var(--color-text)]"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={() => setModal('group')}
            title="New group"
            className="rounded-full p-2 text-[var(--color-text-dim)] transition hover:bg-white/10 hover:text-[var(--color-text)]"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M23 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div className="relative">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--color-text-faint)]"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-xl border border-[var(--color-border)] bg-black/20 py-2 pr-3 pl-9 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-2">
        {loadingConversations ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : sorted.length === 0 ? (
          <p className="mt-8 px-2 text-center text-sm text-[var(--color-text-dim)]">
            {search ? 'No chats match your search' : 'No conversations yet. Start a new chat!'}
          </p>
        ) : (
          sorted.map((c) => (
            <ChatListItem
              key={c.id}
              conversation={c}
              active={activeId === c.id}
              onClick={() => openConversation(c.id)}
            />
          ))
        )}
      </div>

      {modal === 'chat' && (
        <NewChatModal onClose={() => setModal(null)} onOpenConversation={openConversation} />
      )}
      {modal === 'group' && (
        <NewGroupModal onClose={() => setModal(null)} onOpenConversation={openConversation} />
      )}
      {showProfile && <ProfileDrawer onClose={() => setShowProfile(false)} />}
    </div>
  );
}
