import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer } from '@/components/Drawer';
import { Avatar } from '@/components/Avatar';
import { UserApi } from '@/lib/endpoints';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { normalizePhone } from '@/utils/format';
import type { ConversationSummaryDto, UserDto } from '@/types';

interface GroupInfoDrawerProps {
  conversation: ConversationSummaryDto;
  onClose: () => void;
}

export function GroupInfoDrawer({ conversation, onClose }: GroupInfoDrawerProps) {
  const navigate = useNavigate();
  const myUserId = useChatStore((s) => s.myUserId);
  const usersById = useChatStore((s) => s.usersById);
  const addMembers = useChatStore((s) => s.addMembers);
  const leaveConversation = useChatStore((s) => s.leaveConversation);
  const addToast = useUiStore((s) => s.addToast);
  const cacheUsers = useChatStore((s) => s.cacheUsers);

  const [showAdd, setShowAdd] = useState(false);
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserDto[]>([]);
  const [adding, setAdding] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const handleSearch = async () => {
    if (!phone.trim()) return;
    setSearching(true);
    try {
      const users = await UserApi.sync([normalizePhone(phone)]);
      cacheUsers(users);
      setResults(users.filter((u) => !conversation.memberIds.includes(u.id)));
    } catch {
      // handled globally
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (user: UserDto) => {
    setAdding(true);
    try {
      await addMembers(conversation.id, [user.id]);
      addToast(`${user.name} added to group`, 'success');
      setShowAdd(false);
      setResults([]);
      setPhone('');
    } catch {
      // handled globally (likely 403 if not admin)
    } finally {
      setAdding(false);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveConversation(conversation.id);
      onClose();
      navigate('/app');
    } catch {
      // handled globally
    }
  };

  return (
    <Drawer title="Group info" onClose={onClose}>
      <div className="flex flex-col items-center gap-2 pb-6 text-center">
        <Avatar id={conversation.id} name={conversation.name} avatarUrl={conversation.avatarUrl} size={88} />
        <h3 className="text-lg font-semibold">{conversation.name}</h3>
        <p className="text-xs text-[var(--color-text-dim)]">
          {conversation.memberIds.length} members
        </p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold tracking-wide text-[var(--color-text-dim)] uppercase">
          Members
        </h4>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="text-xs font-medium text-[var(--color-accent)] hover:underline"
        >
          {showAdd ? 'Cancel' : '+ Add member'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-[var(--color-border)] p-3">
          <div className="flex gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Phone number"
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-[#0A0E1A] disabled:opacity-50"
            >
              {searching ? '…' : 'Find'}
            </button>
          </div>
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => handleAdd(u)}
              disabled={adding}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-white/5 disabled:opacity-50"
            >
              <Avatar id={u.id} name={u.name} avatarUrl={u.avatarUrl} size={32} />
              <span className="text-sm">{u.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {conversation.memberIds.map((id) => {
          const u = usersById[id];
          return (
            <div key={id} className="flex items-center gap-3 rounded-xl px-2 py-2">
              <Avatar
                id={id}
                name={u?.name ?? '…'}
                avatarUrl={u?.avatarUrl}
                showOnlineDot
                online={u?.online}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {id === myUserId ? 'You' : (u?.name ?? '...')}
                </div>
                <div className="truncate text-xs text-[var(--color-text-dim)]">
                  {u?.online ? 'online' : u?.phone}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[var(--color-border)] pt-4">
        {confirmingLeave ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--color-text-dim)]">
              Are you sure you want to leave this group?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingLeave(false)}
                className="flex-1 rounded-xl border border-[var(--color-border)] py-2 text-sm hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 rounded-xl bg-[var(--color-danger)] py-2 text-sm font-medium text-white"
              >
                Leave
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingLeave(true)}
            className="w-full rounded-xl border border-[var(--color-danger)]/40 py-2.5 text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10"
          >
            Leave group
          </button>
        )}
      </div>
    </Drawer>
  );
}
