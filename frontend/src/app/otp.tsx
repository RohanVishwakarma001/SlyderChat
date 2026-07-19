import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { Icon } from '@/components/Icon';
import { NumPad } from '@/components/NumPad';
import { OTPDigits } from '@/components/OTPDigits';
import { PressableScale } from '@/components/PressableScale';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { pendingPhone, devOtp, verifyOtp, requestOtp } = useAuthStore();
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(114);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dev mode: backend echoes the OTP back so testing doesn't need real SMS.
  useEffect(() => {
    if (devOtp && code.length === 0) {
      setCode(devOtp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devOtp]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  useEffect(() => {
    if (code.length === 6 && !verifying) {
      setVerifying(true);
      setError(null);
      verifyOtp(code)
        .then(() => router.replace('/(tabs)/chats'))
        .catch((e) => {
          setError(extractErrorMessage(e));
          setCode('');
        })
        .finally(() => setVerifying(false));
    }
  }, [code]);

  const handleResend = async () => {
    if (resendIn !== 0) return;
    setResendIn(114);
    setError(null);
    try {
      await requestOtp(pendingPhone);
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.outlineVariant + '4d' }]}>
        <PressableScale onPress={() => router.back()} haptic={false} style={styles.backBtn}>
          <Icon name="chevron_left" size={24} color={colors.primary} />
          <Text style={[typography.body, { color: colors.primary }]}>Back</Text>
        </PressableScale>
        <Text style={[typography.headline, styles.headerTitle, { color: colors.onSurface }]}>Verify Number</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
          <Icon name="chat" size={36} color={colors.onPrimaryContainer} />
        </View>
        <Text style={[typography.largeTitle, { color: colors.onSurface, fontSize: 26, lineHeight: 32 }]}>
          Verification
        </Text>
        <Text style={[typography.body, styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Waiting to automatically detect an SMS sent to{' '}
          <Text style={{ color: colors.onSurface, fontWeight: '600' }}>{pendingPhone || '+91 00000 00000'}</Text>.
        </Text>

        <View style={styles.otpArea}>
          <OTPDigits code={code} />
          <Text style={[typography.subheadline, { color: error ? colors.error : colors.onSurfaceVariant, marginTop: 16 }]}>
            {error ?? (verifying ? 'Verifying…' : 'Enter 6-digit code')}
          </Text>
        </View>

        <View style={styles.actions}>
          <PressableScale
            haptic={false}
            onPress={handleResend}
            style={[styles.actionRow, { borderBottomColor: colors.outlineVariant + '33' }]}
          >
            <View style={styles.actionLabel}>
              <Icon name="sms" size={20} color={colors.primary} />
              <Text style={[typography.body, { color: colors.onSurface }]}>Resend SMS</Text>
            </View>
            <Text style={[typography.body, { color: colors.onSurfaceVariant }]}>
              {resendIn > 0 ? formatCountdown(resendIn) : 'Now'}
            </Text>
          </PressableScale>
          <View style={styles.actionRow}>
            <View style={styles.actionLabel}>
              <Icon name="call" size={20} color={colors.primary} />
              <Text style={[typography.body, { color: colors.onSurface }]}>Call Me</Text>
            </View>
            <Text style={[typography.body, { color: colors.onSurfaceVariant }]}>in 2:00</Text>
          </View>
        </View>
      </View>

      <NumPad
        onKeyPress={(d) => setCode((prev) => (prev.length < 6 ? prev + d : prev))}
        onBackspace={() => setCode((prev) => prev.slice(0, -1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 76,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 76,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  otpArea: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
