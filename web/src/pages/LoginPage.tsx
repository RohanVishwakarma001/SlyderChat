import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '@/lib/endpoints';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { normalizePhone } from '@/utils/format';
import { requestNotificationPermission } from '@/lib/notifications';
import { useSlowRequest } from '@/hooks/useSlowRequest';

type Step = 'phone' | 'otp';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const addToast = useUiStore((s) => s.addToast);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const wakingUp = useSlowRequest(loading, 4000);

  const handleRequestOtp = async () => {
    const normalized = normalizePhone(phone);
    if (normalized.length < 8) {
      addToast('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await AuthApi.requestOtp(normalized);
      setPhone(normalized);
      setStep('otp');
      if (res.devOtp) {
        addToast(`Dev OTP: ${res.devOtp}`, 'info');
        setDigits(res.devOtp.padEnd(6, '').slice(0, 6).split(''));
      }
    } catch {
      // handled by global error toast
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }
    const next = [...digits];
    next[index] = clean[clean.length - 1];
    setDigits(next);
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.padEnd(6, '').split('');
    setDigits(next);
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== 6) {
      addToast('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await AuthApi.verifyOtp(phone, otp, name || phone);
      login(res.token, res.user);
      requestNotificationPermission();
      navigate('/app', { replace: true });
    } catch {
      // handled by global error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="glass w-full max-w-sm rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-blue)]">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <path
                d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9l-5 3v-3a4 4 0 0 1-1-3V8z"
                fill="#0A0E1A"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">ChatApp</h1>
          <p className="text-sm text-[var(--color-text-dim)]">
            {step === 'phone' ? 'Sign in with your phone number' : 'Enter the code we sent you'}
          </p>
        </div>

        {step === 'phone' ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-dim)]">
                Phone number
              </label>
              <input
                type="tel"
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                placeholder="9876543210 or +91 9876543210"
                className="w-full rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-dim)]">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="mt-2 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#0A0E1A] transition hover:brightness-110 disabled:opacity-50"
            >
              {wakingUp ? 'Waking up server…' : loading ? 'Sending…' : 'Send code'}
            </button>
            {wakingUp && (
              <p className="animate-fade-in text-center text-xs text-[var(--color-text-dim)]">
                The server was asleep and is starting back up — this can take up to a
                minute on the first request. Hang tight.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  maxLength={1}
                  autoFocus={i === 0}
                  className="h-12 w-10 rounded-xl border border-[var(--color-border)] bg-black/20 text-center text-lg font-mono outline-none focus:border-[var(--color-accent)]"
                />
              ))}
            </div>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#0A0E1A] transition hover:brightness-110 disabled:opacity-50"
            >
              {wakingUp ? 'Waking up server…' : loading ? 'Verifying…' : 'Verify & continue'}
            </button>
            {wakingUp && (
              <p className="animate-fade-in text-center text-xs text-[var(--color-text-dim)]">
                The server was asleep and is starting back up — this can take up to a
                minute on the first request. Hang tight.
              </p>
            )}
            <button
              onClick={() => setStep('phone')}
              className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            >
              ← Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
