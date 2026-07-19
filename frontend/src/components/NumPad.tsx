import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

const ROWS: [string, string][][] = [
  [
    ['1', ''],
    ['2', 'ABC'],
    ['3', 'DEF'],
  ],
  [
    ['4', 'GHI'],
    ['5', 'JKL'],
    ['6', 'MNO'],
  ],
  [
    ['7', 'PQRS'],
    ['8', 'TUV'],
    ['9', 'WXYZ'],
  ],
];

type NumPadProps = {
  onKeyPress: (digit: string) => void;
  onBackspace: () => void;
};

export function NumPad({ onKeyPress, onBackspace }: NumPadProps) {
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const press = (digit: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onKeyPress(digit);
  };

  return (
    <View
      style={[
        styles.pad,
        { backgroundColor: scheme === 'dark' ? '#1c1c1e' : '#d1d3d9', paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {ROWS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map(([digit, letters]) => (
            <PressableScale
              key={digit}
              haptic={false}
              onPress={() => press(digit)}
              style={[styles.key, { backgroundColor: colors.surfaceContainerLowest }]}
            >
              <Text style={[styles.digit, { color: colors.onSurface }]}>{digit}</Text>
              <Text style={[styles.letters, { color: colors.onSurfaceVariant }]}>{letters}</Text>
            </PressableScale>
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <View style={styles.key} />
        <PressableScale
          haptic={false}
          onPress={() => press('0')}
          style={[styles.key, { backgroundColor: colors.surfaceContainerLowest }]}
        >
          <Text style={[styles.digit, { color: colors.onSurface }]}>0</Text>
        </PressableScale>
        <PressableScale
          onPress={onBackspace}
          style={styles.key}
          accessibilityLabel="Backspace"
        >
          <Icon name="backspace" size={24} color={colors.onSurface} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    width: '100%',
    paddingTop: 6,
    paddingHorizontal: 6,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  key: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '400',
  },
  letters: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: -2,
  },
});
