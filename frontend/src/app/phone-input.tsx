import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { Icon } from '@/components/Icon';
import { NumPad } from '@/components/NumPad';
import { PressableScale } from '@/components/PressableScale';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

function formatDigits(raw: string) {
  if (raw.length > 5) return `${raw.slice(0, 5)} ${raw.slice(5, 10)}`;
  return raw;
}

export default function PhoneInputScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const [digits, setDigits] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = digits.length >= 10 && !submitting;

  const handleNext = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestOtp(`+91${digits}`);
      router.push('/otp');
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.outlineVariant + '4d' }]}>
        <View style={{ width: 60 }} />
        <Text style={[typography.headline, { color: colors.onSurface }]}>Phone number</Text>
        <View style={{ width: 60, alignItems: 'flex-end' }}>
          <PressableScale onPress={handleNext} disabled={!canContinue} haptic={false}>
            {submitting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text
                style={[typography.headline, { color: canContinue ? colors.primary : colors.onSurfaceVariant + '66' }]}
              >
                Next
              </Text>
            )}
          </PressableScale>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[typography.subheadline, styles.instructions, { color: colors.onSurface }]}>
          SlyderChat will need to verify your phone number.
        </Text>
        {error && (
          <Text style={[typography.caption, { color: colors.error, textAlign: 'center' }]}>{error}</Text>
        )}

        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant + '4d' }]}>
          <View style={styles.row}>
            <Text style={[typography.subheadline, { color: colors.primary }]}>India</Text>
            <Icon name="chevron_right" size={18} color={colors.outlineVariant} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '4d' }]} />
          <View style={styles.row}>
            <View style={[styles.codeBox, { borderRightColor: colors.outlineVariant + '4d' }]}>
              <Text style={[typography.body, { color: colors.onSurfaceVariant }]}>+</Text>
              <Text style={[typography.body, { color: colors.onSurface }]}>91</Text>
            </View>
            <Text style={[typography.body, styles.numberText, { color: digits ? colors.onSurface : colors.outlineVariant }]}>
              {digits ? formatDigits(digits) : 'phone number'}
            </Text>
          </View>
        </View>

        <Text style={[typography.caption, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
          Carrier charges may apply
        </Text>
      </View>

      <NumPad
        onKeyPress={(d) => setDigits((prev) => (prev.length < 10 ? prev + d : prev))}
        onBackspace={() => setDigits((prev) => prev.slice(0, -1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  instructions: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  codeBox: {
    flexDirection: 'row',
    gap: 4,
    paddingRight: 16,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  numberText: {
    flex: 1,
    paddingLeft: 16,
  },
});
