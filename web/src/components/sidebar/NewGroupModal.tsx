import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { UserApi } from '@/lib/endpoints';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { normalizePhone } from '@/utils/format';
import type { UserDto } from '@/types';

interface NewGroupModalProps {
  onClose: () => void;
  onOpenConversation: (conversationId: number) => void;
}

export function NewGroupModal({ onClose, onOpenConversation }: NewGroupModalProps) {
  const [step, setStep] = useState<'pick' | 'name'>('pick');
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserDto[]>([]);
  const [selected, setSelected] = useState<Map<number, UserDto>>(new Map());
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const createGroupChat = useChatStore((s) => s.createGroupChat);
  const cacheUsers = useChatStore((s) => s.cacheUsers);
  const addToast = useUiStore((s) => s.addToast);

  const handleSearch = async () => {
    if (!phone.trim()) return;
    setSearching(true);
    try {
      const users = await UserApi.sync([normalizePhone(phone)]);
      cacheUsers(users);
      setResults(users);
      if (users.length === 0) addToast('No registered user found for that number', 'info');
    } catch {
      // handled globally
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (user: UserDto) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.size === 0) return;
    setCreating(true);
    try {
      const conv = await createGroupChat(groupName.trim(), [...selected.keys()]);
      onOpenConversation(conv.id);
      onClose();
    } catch {
      // handled globally
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal title={step === 'pick' ? 'Add group members' : 'Name your group'} onClose={onClose}>
      {step === 'pick' ? (
        <div className="flex flex-col gap-4">
          {selected.size > 0 && (
            <div className="flex flex-wrap gap-2">
              {[...selected.values()].map((u) => (
                <span
                  key={u.id}
                  className="flex items-center gap-1.5 rounded-full bg-[var(--color-accent-dim)] py-1 pr-2 pl-1 text-xs text-[var(--color-accent)]"
                >
                  <Avatar id={u.id} name={u.name} avatarUrl={u.avatarUrl} size={20} />
                  {u.name}
                  <button onClick={() => toggleSelect(u)} className="ml-0.5 hover:text-white">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

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

          <div className="flex flex-col gap-1">
            {results.map((user) => {
              const isSelected = selected.has(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleSelect(user)}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.05] ${isSelected ? 'bg-white/[0.06]' : ''}`}
                >
                  <Avatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{user.name}</div>
                    <div className="truncate text-xs text-[var(--color-text-dim)]">
                      {user.about || user.phone}
                    </div>
                  </div>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[#0A0E1A]' : 'border-[var(--color-border)]'}`}
                  >
                    {isSelected && '✓'}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep('name')}
            disabled={selected.size === 0}
            className="mt-2 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#0A0E1A] disabled:opacity-40"
          >
            Next ({selected.size} selected)
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-dim)]">
              Group name
            </label>
            <input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Weekend Trip"
              className="w-full rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <p className="text-xs text-[var(--color-text-dim)]">
            {selected.size} member{selected.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setStep('pick')}
              className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-sm font-medium hover:bg-white/5"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={!groupName.trim() || creating}
              className="flex-1 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#0A0E1A] disabled:opacity-40"
            >
              {creating ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
