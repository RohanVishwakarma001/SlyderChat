import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Logo } from '@/components/Logo';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/theme';

export default function SplashRoute() {
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const { hasOnboarded, isAuthenticated, bootstrapping, bootstrap } = useAuthStore();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withTiming(1, { duration: 600 });
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bootstrapping) return;
    const timer = setTimeout(() => {
      if (!hasOnboarded) router.replace('/welcome');
      else if (!isAuthenticated) router.replace('/phone-input');
      else router.replace('/(tabs)/chats');
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapping]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Animated.View style={[styles.center, animatedStyle]}>
        <Logo size={112} />
        <Text style={[typography.headline, styles.title, { color: colors.onSurface }]}>
          SlyderChat
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.3,
  },
});
