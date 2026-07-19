import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { useAppTheme } from '@/theme';

export function MediaStrip({ uris }: { uris: string[] }) {
  const { colors, radii } = useAppTheme();
  if (uris.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: colors.surfaceContainerHigh, borderRadius: radii.md },
        ]}
      >
        <Icon name="image" size={24} color={colors.onSurfaceVariant} />
      </View>
    );
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {uris.map((uri, i) => (
        <Image key={i} source={{ uri }} style={[styles.thumb, { borderRadius: radii.DEFAULT }]} contentFit="cover" />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumb: {
    width: 84,
    height: 84,
  },
  empty: {
    marginHorizontal: 16,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
