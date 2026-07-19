import { StyleSheet, Switch, Text, View } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

type SettingsRowProps = {
  icon?: string;
  iconBackground?: string;
  label: string;
  subtitle?: string;
  destructive?: boolean;
  disabled?: boolean;
  accessory?:
    | { type: 'chevron' }
    | { type: 'value'; text: string }
    | { type: 'switch'; value: boolean; onValueChange: (v: boolean) => void }
    | { type: 'none' };
  onPress?: () => void;
};

export function SettingsRow({
  icon,
  iconBackground,
  label,
  subtitle,
  destructive,
  disabled,
  accessory = { type: 'chevron' },
  onPress,
}: SettingsRowProps) {
  const { colors, typography, radii } = useAppTheme();

  const content = (
    <View style={styles.row}>
      {icon && (
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: iconBackground ?? colors.primary, borderRadius: radii.DEFAULT },
          ]}
        >
          <Icon name={icon} size={18} color="#ffffff" />
        </View>
      )}
      <View style={styles.labelStack}>
        <Text
          style={[typography.body, { color: destructive ? colors.error : colors.onSurface }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {subtitle && (
          <Text style={[typography.caption, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {accessory.type === 'chevron' && (
        <Icon name="chevron_right" size={18} color={colors.outline} />
      )}
      {accessory.type === 'value' && (
        <Text style={[typography.body, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {accessory.text}
        </Text>
      )}
      {accessory.type === 'switch' && (
        <Switch
          value={accessory.value}
          onValueChange={accessory.onValueChange}
          trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
          thumbColor="#ffffff"
        />
      )}
    </View>
  );

  if (accessory.type === 'switch') {
    return <View style={[styles.padding, disabled && styles.disabled]}>{content}</View>;
  }

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic={false}
      style={[styles.padding, disabled && styles.disabled]}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 28,
  },
  iconBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelStack: {
    flex: 1,
    gap: 2,
  },
});
