import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { MessageBubble } from '@/components/MessageBubble';
import { PressableScale } from '@/components/PressableScale';
import { SearchBar } from '@/components/SearchBar';
import { SubScreenHeader } from '@/components/SubScreenHeader';
import { selectStarredMessages, useChatsStore } from '@/store/chatsStore';
import { useAppTheme } from '@/theme';
import type { Message } from '@/data/types';
import { formatDayHeading } from '@/utils/formatTime';

export default function StarredMessagesScreen() {
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const { chats, messagesByChat, toggleStar } = useChatsStore();
  const [query, setQuery] = useState('');

  const starred = selectStarredMessages(messagesByChat).filter((m) =>
    m.text.toLowerCase().includes(query.toLowerCase()),
  );

  const sections = useMemo(() => {
    const byDay = new Map<string, Message[]>();
    starred.forEach((m) => {
      const key = formatDayHeading(m.createdAt);
      byDay.set(key, [...(byDay.get(key) ?? []), m]);
    });
    return Array.from(byDay.entries()).map(([title, data]) => ({ title, data }));
  }, [starred]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <SubScreenHeader
        title="Starred Messages"
        backLabel="Chats"
        trailing={
          <PressableScale haptic={false}>
            <Text style={[typography.body, { color: colors.primary }]}>Edit</Text>
          </PressableScale>
        }
      />
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderSectionHeader={({ section }) => (
          <Text style={[typography.labelBold, styles.sectionHeader, { color: colors.onSurfaceVariant, backgroundColor: colors.surface }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const chat = chats.find((c) => c.id === item.chatId);
          return (
            <View style={styles.item}>
              <View style={styles.bubbleRow}>
                <MessageBubble message={item} isOutgoing={item.senderId === 'me'} showTail />
                <PressableScale haptic={false} onPress={() => toggleStar(item.chatId, item.id)} style={styles.starBtn}>
                  <Icon name="star" size={16} color="#ffd600" />
                </PressableScale>
              </View>
              <PressableScale haptic={false} onPress={() => router.push(`/chat/${item.chatId}`)} style={styles.viewInChat}>
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                  {chat?.name ?? 'Unknown chat'} · View in Chat &gt;
                </Text>
              </PressableScale>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="star"
            title="No starred messages"
            description="Tap and hold on any message to star it. It'll show up here for quick reference."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 0.4,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bubbleRow: {
    position: 'relative',
  },
  starBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  viewInChat: {
    marginTop: 2,
  },
});
