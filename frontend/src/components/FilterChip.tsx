import { StyleSheet, Text } from 'react-native';

import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

type FilterChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  const { colors, typography, radii } = useAppTheme();
  return (
    <PressableScale
      onPress={onPress}
      haptic={false}
      style={[
        styles.chip,
        {
          borderRadius: radii.full,
          backgroundColor: active ? colors.primaryContainer + '33' : colors.surfaceContainerHigh,
        },
      ]}
    >
      <Text
        style={[
          typography.subheadline,
          {
            fontWeight: active ? '700' : '500',
            color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant,
          },
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
});
