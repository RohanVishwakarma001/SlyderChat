import type { ReactNode } from 'react';

interface DrawerProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ title, onClose, children }: DrawerProps) {
  return (
    <div className="animate-fade-in fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass flex h-full w-full max-w-sm flex-col shadow-2xl"
        style={{ animation: 'slide-in 200ms ease-out' }}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--color-text-dim)] hover:bg-white/10 hover:text-[var(--color-text)]"
            aria-label="Close"
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
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">{children}</div>
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(24px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
