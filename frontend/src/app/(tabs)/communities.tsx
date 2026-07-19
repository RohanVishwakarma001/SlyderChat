import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader';
import { useAppTheme } from '@/theme';
import { initialCommunities } from '@/data/communities';
import { formatChatTimestamp } from '@/utils/formatTime';

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, radii } = useAppTheme();
  const { scrollY, onScroll } = useCollapsingHeader();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader
        title="Communities"
        scrollY={scrollY}
        leading={
          <PressableScale haptic={false}>
            <Text style={[typography.body, { color: colors.primary }]}>Edit</Text>
          </PressableScale>
        }
        trailing={
          <PressableScale haptic={false}>
            <Icon name="photo_camera" size={22} color={colors.primary} />
          </PressableScale>
        }
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 32 }}
      >
        <Text style={[typography.largeTitle, styles.title, { color: colors.onSurface }]}>Communities</Text>

        <View style={[styles.newCard, { backgroundColor: colors.surfaceContainerLow, borderRadius: radii.lg }]}>
          <View style={[styles.newIcon, { backgroundColor: colors.primaryContainer }]}>
            <Icon name="groups" size={26} color={colors.onPrimaryContainer} />
          </View>
          <Text style={[typography.subheadline, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            Communities bring members together in topic-based groups, and admins can send announcements to everyone.
          </Text>
          <PressableScale
            style={[styles.newCta, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}
            onPress={() => Alert.alert('New Community', 'Community creation is not part of this prototype.')}
          >
            <Icon name="add" size={18} color={colors.onPrimaryContainer} />
            <Text style={[typography.headline, { color: colors.onPrimaryContainer }]}>New Community</Text>
          </PressableScale>
        </View>

        {initialCommunities.map((community) => (
          <View key={community.id} style={[styles.communityCard, { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.lg }]}>
            <View style={styles.communityHeader}>
              <Avatar name={community.name} uri={community.avatarUri} isCommunity size={44} />
              <Text style={[typography.headline, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>
                {community.name}
              </Text>
            </View>

            <PressableScale haptic={false} style={styles.nestedRow}>
              <View style={[styles.nestedIcon, { backgroundColor: colors.tertiaryContainer }]}>
                <Icon name="campaign" size={18} color={colors.onTertiaryContainer} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.onSurface }]}>Announcements</Text>
                <Text style={[typography.subheadline, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                  {community.announcementPreview}
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>
                {formatChatTimestamp(community.announcementAt)}
              </Text>
            </PressableScale>

            {community.groups.map((group) => (
              <PressableScale key={group.id} haptic={false} style={styles.nestedRow}>
                <View style={[styles.nestedIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <Icon name="groups" size={18} color={colors.onSecondaryContainer} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: colors.onSurface }]}>{group.name}</Text>
                  <Text style={[typography.subheadline, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                    {group.preview}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>
                  {formatChatTimestamp(group.updatedAt)}
                </Text>
              </PressableScale>
            ))}

            <PressableScale
              haptic={false}
              style={styles.viewAll}
              onPress={() => Alert.alert(community.name, `${community.totalGroups} groups in this community.`)}
            >
              <Text style={[typography.subheadline, { color: colors.primary, fontWeight: '600' }]}>
                View all {community.totalGroups} groups
              </Text>
            </PressableScale>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  newCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  newIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  communityCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    gap: 2,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  nestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingLeft: 28,
    paddingVertical: 8,
  },
  nestedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAll: {
    paddingHorizontal: 12,
    paddingLeft: 28,
    paddingTop: 4,
    paddingBottom: 4,
  },
});
