import { gradientForId, initials } from '@/utils/format';

interface AvatarProps {
  id: number;
  name: string;
  avatarUrl?: string | null;
  size?: number;
  online?: boolean;
  showOnlineDot?: boolean;
}

export function Avatar({
  id,
  name,
  avatarUrl,
  size = 44,
  online,
  showOnlineDot,
}: AvatarProps) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${gradientForId(id)} font-semibold text-white`}
          style={{ fontSize: size * 0.38 }}
        >
          {initials(name)}
        </div>
      )}
      {showOnlineDot && (
        <span
          className={`absolute right-0 bottom-0 rounded-full border-2 border-[var(--color-panel)] ${online ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-text-faint)]'}`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}
