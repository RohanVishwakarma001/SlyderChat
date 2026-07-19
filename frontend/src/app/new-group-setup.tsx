import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { ParticipantChip } from '@/components/ParticipantChip';
import { PressableScale } from '@/components/PressableScale';
import { useAuthStore } from '@/store/authStore';
import { useChatsStore } from '@/store/chatsStore';
import { useUsersStore } from '@/store/usersStore';
import { useAppTheme } from '@/theme';
import type { Contact } from '@/data/types';

export default function NewGroupSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const createGroup = useChatsStore((s) => s.createGroup);
  const myId = useAuthStore((s) => s.profile.id);
  const byId = useUsersStore((s) => s.byId);

  const [subject, setSubject] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(true);
  const [creating, setCreating] = useState(false);

  const candidates = useMemo(
    () =>
      Object.values(byId)
        .filter((c) => c.id !== myId && /^\d+$/.test(c.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [byId, myId],
  );
  const sections = useMemo(() => [{ title: 'CONTACTS ON SLYDERCHAT', data: candidates }], [candidates]);
  const participants = participantIds.map((id) => byId[id]).filter(Boolean) as Contact[];

  const toggleParticipant = (id: string) => {
    setParticipantIds((ids) => (ids.includes(id) ? ids.filter((pid) => pid !== id) : [...ids, id]));
  };

  const handleCreate = async () => {
    if (!subject.trim() || participantIds.length === 0 || creating) return;
    setCreating(true);
    try {
      const chat = await createGroup(subject.trim(), participantIds);
      router.replace(`/chat/${chat.id}`);
    } catch (e) {
      Alert.alert('Could not create group', extractErrorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.outlineVariant + '4d' }]}>
        <PressableScale haptic={false} onPress={() => router.back()}>
          <Text style={[typography.body, { color: colors.primary }]}>Cancel</Text>
        </PressableScale>
        <Text style={[typography.headline, { color: colors.onSurface }]}>New Group</Text>
        <PressableScale haptic={false} onPress={handleCreate} disabled={!subject.trim() || participantIds.length === 0}>
          <Text
            style={[
              typography.headline,
              { color: subject.trim() && participantIds.length > 0 ? colors.primary : colors.onSurfaceVariant + '66' },
            ]}
          >
            {creating ? '…' : 'Create'}
          </Text>
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={styles.subjectRow}>
          <View style={[styles.iconPlaceholder, { backgroundColor: colors.surfaceContainerHigh }]}>
            <Icon name="groups" size={30} color={colors.onSurfaceVariant} />
          </View>
          <View style={[styles.subjectInputWrap, { borderBottomColor: colors.outlineVariant }]}>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              maxLength={25}
              placeholder="Group Subject (required)"
              placeholderTextColor={colors.onSurfaceVariant + '99'}
              style={[typography.body, { color: colors.onSurface, flex: 1, padding: 0 }]}
            />
          </View>
        </View>

        <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          PARTICIPANTS: {participants.length}
        </Text>
        {participants.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipStrip}>
            {participants.map((p) => (
              <ParticipantChip key={p.id} name={p.name} uri={p.avatarUri} onRemove={() => toggleParticipant(p.id)} />
            ))}
          </ScrollView>
        )}

        <PressableScale haptic={false} style={styles.pickerToggle} onPress={() => setShowPicker((v) => !v)}>
          <Text style={[typography.body, { color: colors.primary, fontWeight: '600' }]}>
            {showPicker ? 'Hide contacts' : 'Add participants'}
          </Text>
          <Icon name={showPicker ? 'expand_less' : 'expand_more'} size={18} color={colors.primary} />
        </PressableScale>

        {showPicker && (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderSectionHeader={({ section }) => (
              <Text style={[typography.labelBold, styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
                {section.title}
              </Text>
            )}
            ListEmptyComponent={
              <Text style={[typography.body, { color: colors.onSurfaceVariant, textAlign: 'center', padding: 16 }]}>
                No registered contacts found yet — visit New Chat first to sync your address book.
              </Text>
            }
            renderItem={({ item }) => {
              const selected = participantIds.includes(item.id);
              return (
                <PressableScale haptic={false} style={styles.contactRow} onPress={() => toggleParticipant(item.id)}>
                  <Avatar name={item.name} uri={item.avatarUri} size={44} />
                  <Text style={[typography.body, { color: colors.onSurface, flex: 1 }]}>{item.name}</Text>
                  <Icon
                    name={selected ? 'check_circle' : 'radio_button_unchecked'}
                    size={22}
                    color={selected ? colors.primary : colors.onSurfaceVariant + '66'}
                  />
                </PressableScale>
              );
            }}
          />
        )}
      </ScrollView>
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
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    letterSpacing: 0.4,
  },
  chipStrip: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pickerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
