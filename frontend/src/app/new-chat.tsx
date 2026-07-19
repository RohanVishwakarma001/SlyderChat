import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiClient, extractErrorMessage } from '@/api/client';
import { AlphabetScrubber } from '@/components/AlphabetScrubber';
import { Avatar } from '@/components/Avatar';
import { Divider } from '@/components/Divider';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { SearchBar } from '@/components/SearchBar';
import { useAuthStore } from '@/store/authStore';
import { useChatsStore } from '@/store/chatsStore';
import { useUsersStore } from '@/store/usersStore';
import { useAppTheme } from '@/theme';
import type { Contact } from '@/data/types';
import { toE164 } from '@/utils/phone';

export default function NewChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const listRef = useRef<SectionList>(null);
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const ensureDirectChat = useChatsStore((s) => s.ensureDirectChat);
  const upsertMany = useUsersStore((s) => s.upsertMany);
  const registeredContacts = useUsersStore((s) => s.byId);
  const myId = useAuthStore((s) => s.profile.id);
  const [registeredIds, setRegisteredIds] = useState<string[] | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    syncDeviceContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncDeviceContacts = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setSyncError('Allow contacts access to find friends already on SlyderChat.');
        setRegisteredIds([]);
        return;
      }
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
      const phones = new Set<string>();
      data.forEach((c) => {
        c.phoneNumbers?.forEach((p) => {
          const e164 = toE164(p.number ?? '');
          if (e164) phones.add(e164);
        });
      });
      if (phones.size === 0) {
        setRegisteredIds([]);
        return;
      }
      const { data: users } = await apiClient.post('/api/users/sync', { phones: [...phones] });
      const contacts: Contact[] = users.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        phone: u.phone,
        about: u.about ?? '',
        avatarUri: u.avatarUrl ?? null,
        online: u.online,
      }));
      upsertMany(contacts);
      setRegisteredIds(contacts.map((c) => c.id));
    } catch (e) {
      setSyncError(extractErrorMessage(e));
      setRegisteredIds([]);
    } finally {
      setSyncing(false);
    }
  };

  const filtered = useMemo(() => {
    const list = (registeredIds ?? [])
      .map((id) => registeredContacts[id])
      .filter((c): c is Contact => !!c && c.id !== myId);
    return list
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [registeredIds, registeredContacts, query, myId]);

  const sections = useMemo(() => {
    const byLetter = new Map<string, Contact[]>();
    filtered.forEach((contact) => {
      const letter = /[a-z]/i.test(contact.name[0]) ? contact.name[0].toUpperCase() : '#';
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), contact]);
    });
    return Array.from(byLetter.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const openChat = async (contact: Contact) => {
    setOpening(contact.id);
    try {
      const chat = await ensureDirectChat(contact.id);
      router.replace(`/chat/${chat.id}`);
    } catch (e) {
      Alert.alert('Could not start chat', extractErrorMessage(e));
    } finally {
      setOpening(null);
    }
  };

  const scrollToLetter = (letter: string) => {
    const index = sections.findIndex((s) => s.title === letter);
    if (index >= 0) {
      listRef.current?.scrollToLocation({ sectionIndex: index, itemIndex: 0, viewOffset: 0 });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.outlineVariant + '4d' }]}>
        <Text style={[typography.headline, { color: colors.onSurface }]}>New Chat</Text>
        <PressableScale haptic={false} onPress={() => router.back()}>
          <Text style={[typography.body, { color: colors.primary }]}>Cancel</Text>
        </PressableScale>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      <View style={styles.actionRows}>
        {[
          { icon: 'group_add', label: 'New Group', onPress: () => router.push('/new-group-setup') },
          { icon: 'person_add', label: 'New Contact', onPress: () => Alert.alert('New Contact', 'Not part of this prototype.') },
          { icon: 'groups', label: 'New Community', onPress: () => Alert.alert('New Community', 'Not part of this prototype.') },
        ].map((action) => (
          <PressableScale key={action.label} haptic={false} style={styles.actionRow} onPress={action.onPress}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryContainer }]}>
              <Icon name={action.icon} size={20} color={colors.onPrimaryContainer} />
            </View>
            <Text style={[typography.body, { color: colors.onSurface }]}>{action.label}</Text>
          </PressableScale>
        ))}
      </View>
      <Divider inset={16} />

      {syncing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.onSurfaceVariant }}>Finding friends on SlyderChat…</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {syncError && (
            <PressableScale haptic={false} onPress={syncDeviceContacts} style={styles.errorRow}>
              <Icon name="refresh" size={18} color={colors.error} />
              <Text style={[typography.subheadline, { color: colors.error, flex: 1 }]}>{syncError} Tap to retry.</Text>
            </PressableScale>
          )}
          <SectionList
            ref={listRef}
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24, paddingRight: 20 }}
            renderSectionHeader={({ section }) => (
              <Text style={[typography.labelBold, styles.sectionHeader, { color: colors.onSurfaceVariant, backgroundColor: colors.surface }]}>
                {section.title}
              </Text>
            )}
            ListHeaderComponent={
              <Text style={[typography.labelBold, styles.sectionHeader, { color: colors.onSurfaceVariant }]}>
                CONTACTS ON SLYDERCHAT
              </Text>
            }
            ListEmptyComponent={
              !syncError ? (
                <Text style={[typography.body, { color: colors.onSurfaceVariant, textAlign: 'center', padding: 24 }]}>
                  None of your contacts are on SlyderChat yet.
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <PressableScale haptic={false} style={styles.contactRow} onPress={() => openChat(item)} disabled={opening === item.id}>
                <Avatar name={item.name} uri={item.avatarUri} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: colors.onSurface }]}>{item.name}</Text>
                  <Text style={[typography.subheadline, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                    {item.about}
                  </Text>
                </View>
                {opening === item.id && <ActivityIndicator color={colors.primary} />}
              </PressableScale>
            )}
          />
          <AlphabetScrubber onSelect={scrollToLetter} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionRows: {
    paddingTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    letterSpacing: 0.4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
