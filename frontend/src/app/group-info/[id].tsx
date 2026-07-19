import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { ListSectionCard } from '@/components/ListSectionCard';
import { MediaStrip } from '@/components/MediaStrip';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedActionGrid } from '@/components/SegmentedActionGrid';
import { SettingsRow } from '@/components/SettingsRow';
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader';
import { useAuthStore } from '@/store/authStore';
import { useChatsStore } from '@/store/chatsStore';
import { useAppTheme } from '@/theme';
import { contactById } from '@/data/contacts';
import { ensureUsersLoaded, useUsersStore } from '@/store/usersStore';

export default function GroupInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { scrollY, onScroll } = useCollapsingHeader();
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [addingMembers, setAddingMembers] = useState(false);
  const myId = useAuthStore((s) => s.profile.id);
  const leaveGroup = useChatsStore((s) => s.leaveGroup);
  const addMembers = useChatsStore((s) => s.addMembers);
  const byId = useUsersStore((s) => s.byId);

  const chat = useChatsStore((s) => s.chats.find((c) => c.id === id));

  useEffect(() => {
    if (chat?.memberIds?.length) {
      ensureUsersLoaded(chat.memberIds);
    }
  }, [chat?.memberIds]);

  const addCandidates = Object.values(byId).filter(
    (c) => /^\d+$/.test(c.id) && c.id !== myId && !chat?.memberIds?.includes(c.id),
  );

  const toggleAddSelection = (userId: string) => {
    setSelectedToAdd((ids) => (ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId]));
  };

  const handleAddMembers = async () => {
    if (!chat || selectedToAdd.length === 0) return;
    setAddingMembers(true);
    try {
      await addMembers(chat.id, selectedToAdd);
      setSelectedToAdd([]);
      setShowAddPicker(false);
    } catch (e) {
      Alert.alert('Could not add participants', extractErrorMessage(e));
    } finally {
      setAddingMembers(false);
    }
  };

  if (!chat) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <Text style={{ color: colors.onSurfaceVariant }}>Group not found.</Text>
      </View>
    );
  }

  const members = (chat.memberIds ?? []).map((mid) => contactById(mid)).filter(Boolean) as ReturnType<typeof contactById>[];
  const visibleMembers = showAllMembers ? members : members.slice(0, 4);
  const adminId = chat.memberIds?.[0];

  const handleExitGroup = () => {
    Alert.alert('Exit Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup(chat.id);
            router.replace('/(tabs)/chats');
          } catch (e) {
            Alert.alert('Error', extractErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <ScreenHeader
        title={chat.name}
        scrollY={scrollY}
        threshold={220}
        leading={
          <PressableScale haptic={false} onPress={() => router.back()}>
            <Icon name="chevron_left" size={26} color={colors.primary} />
          </PressableScale>
        }
        trailing={
          <PressableScale haptic={false}>
            <Icon name="more_vert" size={22} color={colors.primary} />
          </PressableScale>
        }
      />

      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Avatar name={chat.name} isGroup size={128} />
          <Text style={[typography.largeTitle, { color: colors.onSurface, fontSize: 24, textAlign: 'center' }]}>
            {chat.name}
          </Text>
          <Text style={[typography.body, { color: colors.onSurfaceVariant }]}>Group · {members.length} members</Text>
        </View>

        <SegmentedActionGrid
          actions={[
            { icon: 'call', label: 'Audio', onPress: () => Alert.alert('Group Call', 'Not part of this prototype.') },
            { icon: 'videocam', label: 'Video', onPress: () => Alert.alert('Video Call', 'Not part of this prototype.') },
            { icon: 'person_add', label: 'Add', onPress: () => setShowAddPicker((v) => !v) },
            { icon: 'search', label: 'Search', onPress: () => Alert.alert('Search', 'Not part of this prototype.') },
          ]}
        />

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          MEDIA, LINKS, AND DOCS
        </Text>
        <MediaStrip uris={[]} />

        <View style={{ height: 20 }} />
        <ListSectionCard>
          <SettingsRow label="Mute" accessory={{ type: 'value', text: 'No' }} onPress={() => Alert.alert('Mute', 'Not part of this prototype.')} />
          <SettingsRow label="Wallpaper & Sound" onPress={() => router.push('/settings/wallpaper')} />
          <SettingsRow label="Save to Camera Roll" accessory={{ type: 'switch', value: true, onValueChange: () => {} }} />
        </ListSectionCard>

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          {members.length} PARTICIPANTS
        </Text>
        <ListSectionCard>
          {visibleMembers.map((member) => (
            <View key={member!.id} style={styles.memberRow}>
              <Avatar name={member!.name} uri={member!.avatarUri} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.onSurface }]}>{member!.name}</Text>
                <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>
                  {member!.online ? 'Available' : member!.about}
                </Text>
              </View>
              {member!.id === adminId && (
                <View style={[styles.adminBadge, { backgroundColor: colors.surfaceContainerHigh }]}>
                  <Text style={[typography.caption, { color: colors.onSurfaceVariant, fontWeight: '700' }]}>
                    Group Admin
                  </Text>
                </View>
              )}
            </View>
          ))}
          {members.length > 4 && (
            <PressableScale haptic={false} style={styles.viewAllRow} onPress={() => setShowAllMembers((v) => !v)}>
              <Text style={[typography.body, { color: colors.primary, fontWeight: '600' }]}>
                {showAllMembers ? 'Show less' : `View all ${members.length} participants`}
              </Text>
              <Icon name={showAllMembers ? 'expand_less' : 'expand_more'} size={18} color={colors.primary} />
            </PressableScale>
          )}
        </ListSectionCard>

        {showAddPicker && (
          <>
            <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              ADD PARTICIPANTS
            </Text>
            <ListSectionCard>
              {addCandidates.length === 0 ? (
                <Text style={[typography.body, { color: colors.onSurfaceVariant, padding: 12 }]}>
                  No other registered contacts to add. Visit New Chat to sync your address book.
                </Text>
              ) : (
                addCandidates.map((candidate) => (
                  <PressableScale
                    key={candidate.id}
                    haptic={false}
                    style={styles.memberRow}
                    onPress={() => toggleAddSelection(candidate.id)}
                    disabled={addingMembers}
                  >
                    <Avatar name={candidate.name} uri={candidate.avatarUri} size={44} />
                    <Text style={[typography.body, { color: colors.onSurface, flex: 1 }]}>{candidate.name}</Text>
                    <Icon
                      name={selectedToAdd.includes(candidate.id) ? 'check_circle' : 'radio_button_unchecked'}
                      size={22}
                      color={selectedToAdd.includes(candidate.id) ? colors.primary : colors.onSurfaceVariant + '66'}
                    />
                  </PressableScale>
                ))
              )}
              {selectedToAdd.length > 0 && (
                <PressableScale haptic={false} style={styles.viewAllRow} onPress={handleAddMembers} disabled={addingMembers}>
                  <Text style={[typography.body, { color: colors.primary, fontWeight: '600' }]}>
                    {addingMembers ? 'Adding…' : `Add ${selectedToAdd.length} participant(s)`}
                  </Text>
                </PressableScale>
              )}
            </ListSectionCard>
          </>
        )}

        <ListSectionCard>
          <SettingsRow
            icon="logout"
            iconBackground={colors.error}
            label="Exit Group"
            destructive
            accessory={{ type: 'none' }}
            onPress={handleExitGroup}
          />
          <SettingsRow
            icon="report"
            iconBackground={colors.error}
            label="Report Group"
            destructive
            accessory={{ type: 'none' }}
            onPress={() => Alert.alert('Report Group', 'Not part of this prototype.')}
          />
        </ListSectionCard>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 20,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 0.4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
});
