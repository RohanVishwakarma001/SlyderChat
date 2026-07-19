import { StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { colors, typography, radii } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer + '26', borderRadius: radii.full }]}>
        <Icon name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={[typography.headline, { color: colors.onSurface, textAlign: 'center' }]}>{title}</Text>
      <Text
        style={[typography.subheadline, { color: colors.onSurfaceVariant, textAlign: 'center' }]}
      >
        {description}
      </Text>
      {actionLabel && (
        <PressableScale
          onPress={onAction}
          style={[styles.action, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}
        >
          <Text style={[typography.headline, { color: colors.onPrimaryContainer }]}>{actionLabel}</Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  action: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
