import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
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
import { useChatsStore } from '@/store/chatsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppTheme } from '@/theme';
import { contactById } from '@/data/contacts';
import { ensureUsersLoaded } from '@/store/usersStore';

export default function ContactInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { scrollY, onScroll } = useCollapsingHeader();
  const contact = contactById(id ?? '');
  const chats = useChatsStore((s) => s.chats);
  const ensureDirectChat = useChatsStore((s) => s.ensureDirectChat);
  const { readReceipts } = useSettingsStore();

  useEffect(() => {
    if (id) ensureUsersLoaded([id]);
  }, [id]);

  const commonGroups = chats.filter((c) => c.isGroup && c.memberIds?.includes(id ?? ''));

  const openMessage = async () => {
    if (!contact) return;
    if (!/^\d+$/.test(contact.id)) {
      router.push(`/chat/${contact.id}`);
      return;
    }
    try {
      const chat = await ensureDirectChat(contact.id);
      router.push(`/chat/${chat.id}`);
    } catch (e) {
      Alert.alert('Could not open chat', extractErrorMessage(e));
    }
  };

  if (!contact) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <Text style={{ color: colors.onSurfaceVariant }}>Contact not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.grouped }}>
      <ScreenHeader
        title={contact.name}
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
          <Avatar name={contact.name} uri={contact.avatarUri} size={128} />
          <Text style={[typography.largeTitle, { color: colors.onSurface, fontSize: 26, textAlign: 'center' }]}>
            {contact.name}
          </Text>
          <Text style={[typography.body, { color: colors.onSurfaceVariant }]}>{contact.phone}</Text>
        </View>

        <SegmentedActionGrid
          actions={[
            { icon: 'chat', label: 'Message', onPress: openMessage },
            { icon: 'call', label: 'Audio', onPress: () => Alert.alert('Calling', `Calling ${contact.name}…`) },
            { icon: 'videocam', label: 'Video', onPress: () => Alert.alert('Video Call', `Video calling ${contact.name}…`) },
            { icon: 'search', label: 'Search', onPress: () => Alert.alert('Search', 'Search in chat is not part of this prototype.') },
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
          <SettingsRow
            label="Save to Camera Roll"
            accessory={{ type: 'switch', value: true, onValueChange: () => {} }}
          />
        </ListSectionCard>

        <ListSectionCard>
          <SettingsRow
            icon="security"
            iconBackground={colors.primary}
            label="Encryption"
            subtitle="Messages and calls are end-to-end encrypted."
            accessory={{ type: 'none' }}
          />
          <SettingsRow
            label="Disappearing Messages"
            accessory={{ type: 'value', text: readReceipts ? 'Off' : 'Off' }}
            onPress={() => router.push('/settings/privacy')}
          />
        </ListSectionCard>

        {commonGroups.length > 0 && (
          <>
            <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              {commonGroups.length} GROUPS IN COMMON
            </Text>
            <ListSectionCard>
              {commonGroups.map((group) => (
                <SettingsRow
                  key={group.id}
                  icon="groups"
                  iconBackground={colors.secondary}
                  label={group.name}
                  subtitle={`${group.memberIds?.length ?? 0} members`}
                  onPress={() => router.push(`/group-info/${group.id}`)}
                />
              ))}
            </ListSectionCard>
          </>
        )}

        <ListSectionCard>
          <SettingsRow
            icon="block"
            iconBackground={colors.error}
            label={`Block ${contact.name}`}
            destructive
            accessory={{ type: 'none' }}
            onPress={() => Alert.alert('Block', 'Not part of this prototype.')}
          />
          <SettingsRow
            icon="report"
            iconBackground={colors.error}
            label={`Report ${contact.name}`}
            destructive
            accessory={{ type: 'none' }}
            onPress={() => Alert.alert('Report', 'Not part of this prototype.')}
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
});
