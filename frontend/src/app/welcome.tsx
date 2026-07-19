import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { PressableScale } from '@/components/PressableScale';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, radii } = useAppTheme();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const handleContinue = () => {
    setOnboarded();
    router.replace('/phone-input');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primaryContainer + '26' }]}>
          <Logo size={140} />
        </View>
        <View style={styles.copy}>
          <Text style={[typography.largeTitle, { color: colors.onSurface, textAlign: 'center', fontSize: 30, lineHeight: 36 }]}>
            Welcome to SlyderChat
          </Text>
          <Text style={[typography.subheadline, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            A simple, reliable, and private way to use SlyderChat on your phone.
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={[typography.caption, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
          Read our <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>. Tap
          &quot;Agree &amp; Continue&quot; to accept the{' '}
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text>.
        </Text>
        <PressableScale
          onPress={handleContinue}
          style={[styles.cta, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}
        >
          <Text style={[typography.headline, { color: colors.onPrimaryContainer }]}>Agree &amp; Continue</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  logoWrap: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 12,
    maxWidth: 320,
  },
  bottom: {
    gap: 20,
    alignItems: 'center',
  },
  cta: {
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
