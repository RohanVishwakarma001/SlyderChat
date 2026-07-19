import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme';

export function Divider({ inset = 0 }: { inset?: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.line,
        { marginLeft: inset, backgroundColor: colors.outlineVariant },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
});
