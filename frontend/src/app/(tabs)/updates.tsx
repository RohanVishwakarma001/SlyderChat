import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Divider } from '@/components/Divider';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusRing } from '@/components/StatusRing';
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader';
import { useAuthStore } from '@/store/authStore';
import { useStatusStore } from '@/store/statusStore';
import { useAppTheme } from '@/theme';
import { initialChannels } from '@/data/statuses';
import { formatChatTimestamp } from '@/utils/formatTime';

const AnimatedScrollView = Animated.ScrollView;

export default function UpdatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { scrollY, onScroll } = useCollapsingHeader();
  const { statuses, markSeen } = useStatusStore();
  const profile = useAuthStore((s) => s.profile);

  const openStatus = (statusId: string) => {
    markSeen(statusId);
    router.push(`/status/${statusId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader
        title="Updates"
        scrollY={scrollY}
        leading={
          <PressableScale haptic={false}>
            <Text style={[typography.body, { color: colors.primary }]}>Edit</Text>
          </PressableScale>
        }
        trailing={
          <>
            <PressableScale haptic={false}>
              <Icon name="photo_camera" size={22} color={colors.primary} />
            </PressableScale>
            <PressableScale haptic={false}>
              <Icon name="search" size={22} color={colors.primary} />
            </PressableScale>
          </>
        }
      />

      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 32 }}
      >
        <Text style={[typography.largeTitle, styles.title, { color: colors.onSurface }]}>Updates</Text>

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>STATUS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusStrip}>
          <PressableScale
            haptic={false}
            onPress={() => Alert.alert('Add status', 'Camera/gallery picker is not wired up in this prototype.')}
            style={styles.statusItem}
          >
            <StatusRing name={profile.name} uri={profile.avatarUri} state="none" showAddBadge />
            <Text style={[typography.caption, { color: colors.onSurface }]}>My Status</Text>
          </PressableScale>
          {statuses.map((status) => (
            <PressableScale key={status.id} haptic={false} onPress={() => openStatus(status.id)} style={styles.statusItem}>
              <StatusRing name={status.name} state={status.seen ? 'seen' : 'unseen'} />
              <Text style={[typography.caption, { color: colors.onSurface }]} numberOfLines={1}>
                {status.name.split(' ')[0]}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>CHANNELS</Text>
        <View style={styles.channelsCard}>
          {initialChannels.map((channel, i) => (
            <View key={channel.id}>
              <PressableScale
                haptic={false}
                style={styles.channelRow}
                onPress={() => Alert.alert(channel.name, 'Channels are read-only in this prototype.')}
              >
                <View style={[styles.channelIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <Icon name="campaign" size={20} color={colors.onSecondaryContainer} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.onSurface }]}>{channel.name}</Text>
                  <Text style={[typography.subheadline, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                    {channel.preview}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>
                  {formatChatTimestamp(channel.updatedAt)}
                </Text>
              </PressableScale>
              {i < initialChannels.length - 1 && <Divider inset={68} />}
            </View>
          ))}
        </View>
        <PressableScale
          haptic={false}
          style={[styles.findChannels, { backgroundColor: colors.surfaceContainerHigh }]}
          onPress={() => Alert.alert('Explore channels', 'Channel discovery is not part of this prototype.')}
        >
          <Icon name="travel_explore" size={18} color={colors.primary} />
          <Text style={[typography.body, { color: colors.primary, fontWeight: '600' }]}>Find channels to follow</Text>
        </PressableScale>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    letterSpacing: 0.4,
  },
  statusStrip: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 20,
  },
  statusItem: {
    alignItems: 'center',
    gap: 6,
    width: 68,
  },
  channelsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findChannels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
