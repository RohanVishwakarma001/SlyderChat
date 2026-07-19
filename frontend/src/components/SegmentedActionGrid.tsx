import { StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

export type QuickAction = { icon: string; label: string; onPress?: () => void };

export function SegmentedActionGrid({ actions }: { actions: QuickAction[] }) {
  const { colors, typography, radii } = useAppTheme();
  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <PressableScale
          key={action.label}
          onPress={action.onPress}
          style={[
            styles.cell,
            { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.md },
          ]}
        >
          <Icon name={action.icon} size={22} color={colors.primary} />
          <Text style={[typography.caption, { color: colors.onSurface }]}>{action.label}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
