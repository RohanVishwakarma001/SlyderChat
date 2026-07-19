import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

type ScreenHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
  leading?: ReactNode;
  trailing?: ReactNode;
  threshold?: number;
};

/** Sticky translucent bar whose centered title fades in once the large title scrolls past. */
export function ScreenHeader({ title, scrollY, leading, trailing, threshold = 44 }: ScreenHeaderProps) {
  const { colors, scheme, typography } = useAppTheme();
  const insets = useSafeAreaInsets();

  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [threshold * 0.4, threshold], [0, 1], 'clamp'),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, threshold], [0, 1], 'clamp'),
  }));

  return (
    <View style={[styles.wrap, { height: insets.top + 44 }]} pointerEvents="box-none">
      <BlurView
        intensity={80}
        tint={scheme}
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod="dimezisBlurView"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.surface}CC` }]} />
      <Animated.View
        style={[styles.border, borderStyle, { backgroundColor: colors.outlineVariant }]}
      />
      <View style={[styles.row, { paddingTop: insets.top, height: insets.top + 44 }]}>
        <View style={styles.side}>{leading}</View>
        <Animated.Text
          numberOfLines={1}
          style={[
            typography.headline,
            titleStyle,
            { color: colors.onSurface, position: 'absolute', left: 60, right: 60, textAlign: 'center' },
          ]}
        >
          {title}
        </Animated.Text>
        <View style={[styles.side, styles.trailingSide]}>{trailing}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minWidth: 40,
  },
  trailingSide: {
    justifyContent: 'flex-end',
  },
  border: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
