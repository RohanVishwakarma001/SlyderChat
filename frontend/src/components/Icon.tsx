import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { Text } from 'react-native';

import { sfSymbolFor } from '@/theme/icons';

type IconProps = {
  /** Material Symbols ligature name (matches the original design mockups 1:1). */
  name: string;
  size?: number;
  color: string;
  weight?: SymbolWeight;
  style?: React.ComponentProps<typeof SymbolView>['style'];
};

/**
 * Cross-platform icon: renders native SF Symbols on iOS and native Material
 * Symbols on Android/web via expo-symbols, driven by a single semantic name
 * taken straight from the design mockups (which already use Material Symbols).
 */
export function Icon({ name, size = 24, color, weight = 'regular', style }: IconProps) {
  return (
    <SymbolView
      name={{ ios: sfSymbolFor(name), android: name, web: name } as never}
      size={size}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
      fallback={<Text style={{ fontSize: size * 0.6, color, lineHeight: size }}>•</Text>}
      style={[{ width: size, height: size }, style]}
    />
  );
}
