import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { useAppTheme } from '@/theme';

type StatusRingProps = {
  name: string;
  uri?: string | null;
  size?: number;
  /** 'unseen' = gradient ring (new update), 'seen' = dim solid ring, 'none' = no story to show */
  state: 'unseen' | 'seen' | 'none';
  showAddBadge?: boolean;
};

const RING_WIDTH = 2.5;
const GAP = 2;

export function StatusRing({ name, uri, size = 56, state, showAddBadge }: StatusRingProps) {
  const { colors } = useAppTheme();
  const outerSize = size + (RING_WIDTH + GAP) * 2;

  const inner = (
    <View
      style={{
        width: size + GAP * 2,
        height: size + GAP * 2,
        borderRadius: (size + GAP * 2) / 2,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Avatar name={name} uri={uri} size={size} />
    </View>
  );

  return (
    <View style={{ width: outerSize, height: outerSize }}>
      {state === 'unseen' ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryFixed, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ring,
            { width: outerSize, height: outerSize, borderRadius: outerSize / 2 },
          ]}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.ring,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              borderWidth: RING_WIDTH,
              borderColor: state === 'seen' ? colors.outlineVariant : 'transparent',
            },
          ]}
        >
          {inner}
        </View>
      )}
      {showAddBadge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.primary, borderColor: colors.surface },
          ]}
        >
          <Icon name="add" size={14} color={colors.onPrimary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
