import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

type SubScreenHeaderProps = {
  title: string;
  backLabel?: string;
  trailing?: ReactNode;
  onBack?: () => void;
};

/** Static (non-collapsing) push-screen header used across all Settings sub-pages. */
export function SubScreenHeader({ title, backLabel, trailing, onBack }: SubScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant + '4d' },
      ]}
    >
      <PressableScale haptic={false} onPress={onBack ?? (() => router.back())} style={styles.back}>
        <Icon name="chevron_left" size={26} color={colors.primary} />
        {backLabel && <Text style={[typography.body, { color: colors.primary }]}>{backLabel}</Text>}
      </PressableScale>
      <Text style={[typography.headline, styles.title, { color: colors.onSurface }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
  },
  title: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
  },
  trailing: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 8,
  },
});
