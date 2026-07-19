import { useRef, useState, type ChangeEvent } from 'react';
import { Drawer } from '@/components/Drawer';
import { Avatar } from '@/components/Avatar';
import { MediaApi, UserApi } from '@/lib/endpoints';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

interface ProfileDrawerProps {
  onClose: () => void;
}

export function ProfileDrawer({ onClose }: ProfileDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const addToast = useUiStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [about, setAbout] = useState(user?.about ?? '');
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) {
      setName(user.name);
      return;
    }
    try {
      const updated = await UserApi.updateMe({ name: trimmed });
      updateUser(updated);
    } catch {
      setName(user.name);
    }
  };

  const saveAbout = async () => {
    if (about === (user.about ?? '')) return;
    try {
      const updated = await UserApi.updateMe({ about });
      updateUser(updated);
    } catch {
      setAbout(user.about ?? '');
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await MediaApi.upload(file);
      const updated = await UserApi.updateMe({ avatarUrl: res.url });
      updateUser(updated);
    } catch {
      addToast('Failed to update avatar');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <Drawer title="Profile" onClose={onClose}>
      <div className="flex flex-col items-center gap-3 pb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="group relative"
        >
          <Avatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} size={96} />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
            {uploading ? 'Uploading…' : 'Change'}
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-dim)]">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-full rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-dim)]">
            About
          </label>
          <input
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            onBlur={saveAbout}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            placeholder="Hey there! I'm using ChatApp."
            className="w-full rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-dim)]">
            Phone
          </label>
          <div className="rounded-xl border border-[var(--color-border)] bg-black/10 px-4 py-2.5 font-mono text-sm text-[var(--color-text-dim)]">
            {user.phone}
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-4 rounded-xl border border-[var(--color-danger)]/40 py-2.5 text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10"
        >
          Log out
        </button>
      </div>
    </Drawer>
  );
}
