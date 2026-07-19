import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Pressable } from 'react-native-gesture-handler';

type PressableScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: React.ComponentProps<typeof Pressable>['accessibilityRole'];
};

/** Mirrors the mockups' `active:scale-95 transition-transform` + haptic-tap pattern. */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.96,
  haptic = true,
  disabled,
  accessibilityLabel,
  accessibilityRole = 'button',
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        onPressIn={() => {
          scale.value = withTiming(scaleTo, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
        onPress={() => {
          if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress?.();
        }}
        onLongPress={onLongPress}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
