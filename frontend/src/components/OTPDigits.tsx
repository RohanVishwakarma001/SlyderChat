import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { useAppTheme } from '@/theme';

export function OTPDigits({ code, length = 6 }: { code: string; length?: number }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <View key={i} style={styles.slotWrap}>
          {i === 3 && <Text style={[styles.dash, { color: colors.outlineVariant }]}>—</Text>}
          <Slot value={code[i]} active={i === code.length} />
        </View>
      ))}
    </View>
  );
}

function Slot({ value, active }: { value?: string; active: boolean }) {
  const { colors } = useAppTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })), -1);
    } else {
      opacity.value = 1;
    }
  }, [active]);

  const cursorStyle = useAnimatedStyle(() => ({ opacity: active ? opacity.value : 0 }));

  return (
    <View style={styles.slot}>
      <Text style={[styles.digit, { color: colors.onSurface }]}>{value ?? ''}</Text>
      {active && !value && (
        <Animated.View style={[styles.cursor, cursorStyle, { backgroundColor: colors.primary }]} />
      )}
      <View
        style={[
          styles.underline,
          { backgroundColor: active ? colors.primary : colors.outlineVariant },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  slotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slot: {
    width: 32,
    alignItems: 'center',
  },
  digit: {
    fontSize: 32,
    fontWeight: '500',
    height: 40,
    lineHeight: 40,
  },
  cursor: {
    position: 'absolute',
    top: 6,
    width: 2,
    height: 28,
  },
  underline: {
    width: 32,
    height: 2,
    marginTop: 4,
  },
  dash: {
    marginHorizontal: 6,
    fontSize: 18,
  },
});
