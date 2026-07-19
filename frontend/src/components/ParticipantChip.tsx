import { StyleSheet, View } from 'react-native';

import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

export function ParticipantChip({ name, uri, onRemove }: { name: string; uri?: string | null; onRemove: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <Avatar name={name} uri={uri} size={56} />
      <PressableScale
        onPress={onRemove}
        haptic={false}
        style={[styles.remove, { backgroundColor: colors.onSurfaceVariant, borderColor: colors.surface }]}
      >
        <Icon name="close" size={12} color="#fff" />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 56,
  },
  remove: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
