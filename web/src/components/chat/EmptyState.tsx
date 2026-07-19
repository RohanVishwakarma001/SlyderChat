export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--color-bg)] px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-blue)]/20">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
          <path
            d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9l-5 3v-3a4 4 0 0 1-1-3V8z"
            stroke="url(#g)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="24" y2="24">
              <stop stopColor="#00E5A0" />
              <stop offset="1" stopColor="#4FC3F7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          ChatApp Web
        </h2>
        <p className="mt-1 max-w-xs text-sm text-[var(--color-text-dim)]">
          Select a conversation from the list or start a new chat to begin
          messaging.
        </p>
      </div>
    </div>
  );
}
