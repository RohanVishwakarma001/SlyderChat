import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { useAppTheme } from '@/theme';
import { gradientForName, initialsForName } from '@/utils/avatarColor';

type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
  isGroup?: boolean;
  isCommunity?: boolean;
};

export function Avatar({ name, uri, size = 52, isGroup, isCommunity }: AvatarProps) {
  const { colors } = useAppTheme();
  const radius = isGroup || isCommunity ? size * 0.28 : size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: size, height: size, borderRadius: radius }]}
        contentFit="cover"
        transition={150}
      />
    );
  }

  if (isGroup || isCommunity) {
    return (
      <View
        style={[
          styles.base,
          styles.center,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: colors.surfaceContainerHighest,
          },
        ]}
      >
        <Icon
          name={isCommunity ? 'groups' : 'group'}
          size={size * 0.55}
          color={colors.onSurfaceVariant}
        />
      </View>
    );
  }

  const [from, to] = gradientForName(name);
  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, styles.center, { width: size, height: size, borderRadius: radius }]}
    >
      <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: size * 0.38 }}>
        {initialsForName(name)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
