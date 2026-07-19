import { useUiStore } from '@/store/uiStore';

export function ConnectionBanner() {
  const wsConnected = useUiStore((s) => s.wsConnected);
  const wsEverConnected = useUiStore((s) => s.wsEverConnected);

  if (wsConnected) return null;

  return (
    <div className="animate-fade-in flex items-center justify-center gap-2 bg-amber-500/15 py-1.5 text-xs font-medium text-amber-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
      {wsEverConnected ? 'Reconnecting…' : 'Connecting…'}
    </div>
  );
}
