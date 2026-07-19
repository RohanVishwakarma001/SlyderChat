import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { useStatusStore } from '@/store/statusStore';
import { gradientForName } from '@/utils/avatarColor';
import { formatChatTimestamp } from '@/utils/formatTime';

const DURATION = 5000;

export default function StatusViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const status = useStatusStore((s) => s.statuses.find((st) => st.id === id));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: DURATION }, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  }, []);

  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  if (!status) {
    router.back();
    return null;
  }

  const [from, to] = gradientForName(status.name);

  return (
    <Pressable style={styles.container} onPress={() => router.back()}>
      <LinearGradient colors={[from, to]} style={StyleSheet.absoluteFill} />
      <View style={[styles.overlay, { paddingTop: insets.top + 8 }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <View style={styles.header}>
          <Avatar name={status.name} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{status.name}</Text>
            <Text style={styles.time}>{formatChatTimestamp(status.createdAt)}</Text>
          </View>
          <PressableScale haptic={false} onPress={() => router.back()}>
            <Icon name="close" size={24} color="#fff" />
          </PressableScale>
        </View>
      </View>

      <View style={styles.centerContent}>
        <Text style={styles.bigInitial}>{status.name[0]}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    paddingHorizontal: 10,
    gap: 10,
  },
  progressTrack: {
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  name: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  time: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigInitial: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 120,
    fontWeight: '700',
  },
});
