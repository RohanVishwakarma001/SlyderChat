import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme';

export type StorageSegment = { color: string; ratio: number };

export function StorageBar({ segments }: { segments: StorageSegment[] }) {
  const { colors, radii } = useAppTheme();
  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.surfaceContainerHigh, borderRadius: radii.full },
      ]}
    >
      {segments.map((segment, i) => (
        <View
          key={i}
          style={{ flex: segment.ratio, backgroundColor: segment.color, height: '100%' }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
});
