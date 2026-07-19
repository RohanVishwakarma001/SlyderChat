import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useAppTheme } from '@/theme';

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

type AlphabetScrubberProps = {
  onSelect: (letter: string) => void;
};

export function AlphabetScrubber({ onSelect }: AlphabetScrubberProps) {
  const { colors, typography } = useAppTheme();
  const [active, setActive] = useState<string | null>(null);
  const rowHeight = useRef(0);

  const handleAt = (y: number) => {
    if (!rowHeight.current) return;
    const idx = Math.min(LETTERS.length - 1, Math.max(0, Math.floor(y / rowHeight.current)));
    const letter = LETTERS[idx];
    setActive(letter);
    Haptics.selectionAsync().catch(() => {});
    onSelect(letter);
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => runOnJS(handleAt)(e.y))
    .onUpdate((e) => runOnJS(handleAt)(e.y))
    .onFinalize(() => runOnJS(setActive)(null));

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={styles.wrap}
        onLayout={(e) => {
          rowHeight.current = e.nativeEvent.layout.height / LETTERS.length;
        }}
      >
        {LETTERS.map((letter) => (
          <View key={letter} style={styles.letterRow}>
            <Text
              style={[
                typography.caption,
                {
                  fontSize: 11,
                  fontWeight: '700',
                  color: active === letter ? colors.primary : colors.primary + 'AA',
                },
              ]}
            >
              {letter}
            </Text>
          </View>
        ))}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 2,
    top: 8,
    bottom: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 16,
  },
  letterRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
});
