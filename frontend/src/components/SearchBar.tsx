import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from './Icon';
import { useAppTheme } from '@/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search' }: SearchBarProps) {
  const { colors, typography, radii } = useAppTheme();
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.surfaceContainerHigh, borderRadius: radii.md },
      ]}
    >
      <Icon name="search" size={20} color={colors.onSurfaceVariant} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant + '99'}
        style={[typography.body, styles.input, { color: colors.onSurface }]}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  input: {
    flex: 1,
    padding: 0,
    height: '100%',
  },
});
