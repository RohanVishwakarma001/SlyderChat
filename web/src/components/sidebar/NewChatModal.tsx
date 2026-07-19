import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { UserApi } from '@/lib/endpoints';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { normalizePhone } from '@/utils/format';
import type { UserDto } from '@/types';

interface NewChatModalProps {
  onClose: () => void;
  onOpenConversation: (conversationId: number) => void;
}

export function NewChatModal({ onClose, onOpenConversation }: NewChatModalProps) {
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserDto[] | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const createDirectChat = useChatStore((s) => s.createDirectChat);
  const cacheUsers = useChatStore((s) => s.cacheUsers);
  const addToast = useUiStore((s) => s.addToast);

  const handleSearch = async () => {
    if (!phone.trim()) return;
    setSearching(true);
    try {
      const users = await UserApi.sync([normalizePhone(phone)]);
      cacheUsers(users);
      setResults(users);
      if (users.length === 0) {
        addToast('No registered user found for that number', 'info');
      }
    } catch {
      // handled globally
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (user: UserDto) => {
    setCreatingId(user.id);
    try {
      const conv = await createDirectChat(user.id);
      onOpenConversation(conv.id);
      onClose();
    } catch {
      // handled globally
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <Modal title="New chat" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            autoFocus
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter phone number"
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#0A0E1A] disabled:opacity-50"
          >
            {searching ? '…' : 'Search'}
          </button>
        </div>

        {results !== null && (
          <div className="flex flex-col gap-1">
            {results.length === 0 && (
              <p className="py-4 text-center text-sm text-[var(--color-text-dim)]">
                No user found with this number.
              </p>
            )}
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                disabled={creatingId !== null}
                className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.05] disabled:opacity-50"
              >
                <Avatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{user.name}</div>
                  <div className="truncate text-xs text-[var(--color-text-dim)]">
                    {user.about || user.phone}
                  </div>
                </div>
                {creatingId === user.id && (
                  <span className="text-xs text-[var(--color-text-dim)]">Opening…</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
