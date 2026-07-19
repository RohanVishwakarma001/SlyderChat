import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { registerApiHandlers } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { LoginPage } from '@/pages/LoginPage';
import { AppPage } from '@/pages/AppPage';
import { ToastContainer } from '@/components/ToastContainer';

function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === 'booting') {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-dim)]">
        Loading…
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
