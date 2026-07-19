import type { MessageDeliveryStatus } from '@/types';

export function Ticks({
  status,
  pending,
}: {
  status: MessageDeliveryStatus | null;
  pending?: boolean;
}) {
  if (pending) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[var(--color-text-faint)]">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (!status) return null;

  const color = status === 'READ' ? 'var(--color-blue)' : 'var(--color-text-faint)';

  if (status === 'SENT') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M4 12l5 5L20 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="18" height="14" viewBox="0 0 30 24" fill="none">
      <path d="M1 12l5 5L17 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 12l5 5L26 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
