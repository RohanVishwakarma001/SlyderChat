import { formatDaySeparator } from '@/utils/format';

export function DaySeparator({ epochMs }: { epochMs: number }) {
  return (
    <div className="my-3 flex items-center justify-center">
      <span className="glass rounded-full px-3 py-1 text-[11px] font-medium text-[var(--color-text-dim)]">
        {formatDaySeparator(epochMs)}
      </span>
    </div>
  );
}
