import { useUiStore } from '@/store/uiStore';

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`glass animate-fade-in max-w-sm cursor-pointer rounded-xl px-4 py-3 text-sm shadow-lg ${
            toast.type === 'error'
              ? 'border-[var(--color-danger)]/40 text-[var(--color-danger)]'
              : toast.type === 'success'
                ? 'border-[var(--color-accent)]/40 text-[var(--color-accent)]'
                : 'text-[var(--color-text)]'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
