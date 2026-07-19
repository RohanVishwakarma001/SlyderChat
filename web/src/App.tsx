import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { registerApiHandlers } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { LoginPage } from '@/pages/LoginPage';
import { AppPage } from '@/pages/AppPage';
import { ToastContainer } from '@/components/ToastContainer';
import { useSlowRequest } from '@/hooks/useSlowRequest';

function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const isBooting = status === 'booting';
  const wakingUp = useSlowRequest(isBooting, 4000);

  if (isBooting) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-[var(--color-text-dim)]">
        <span>Loading…</span>
        {wakingUp && (
          <span className="animate-fade-in max-w-xs text-center text-xs">
            The server was asleep and is starting back up — this can take up to a
            minute on the first request.
          </span>
        )}
      </div>
    );
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const boot = useAuthStore((s) => s.boot);
  const logout = useAuthStore((s) => s.logout);
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    registerApiHandlers({
      onUnauthorized: () => logout(),
      onError: (message) => addToast(message, 'error'),
    });
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app/*"
          element={
            <RequireAuth>
              <AppPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
