import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatRow } from '@/components/ChatRow';
import { Divider } from '@/components/Divider';
import { EmptyState } from '@/components/EmptyState';
import { FilterChip } from '@/components/FilterChip';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader';
import { selectArchivedChats, selectVisibleChats, useChatsStore } from '@/store/chatsStore';
import { useAppTheme } from '@/theme';
import type { Chat } from '@/data/types';

type FilterKey = 'all' | 'unread' | 'favourites' | 'groups';

export default function ChatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { scrollY, onScroll } = useCollapsingHeader();
  const { chats, togglePin, toggleArchive, deleteChat, markRead, fetchChats } = useChatsStore();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const archived = selectArchivedChats(chats);
  const visible = selectVisibleChats(chats);

  const filtered = useMemo(() => {
    const source = showArchived ? archived : visible;
    let list = source;
    if (filter === 'unread') list = list.filter((c) => c.unreadCount > 0);
    if (filter === 'favourites') list = list.filter((c) => c.pinned);
    if (filter === 'groups') list = list.filter((c) => c.isGroup);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [showArchived, archived, visible, filter, query]);

  const openChat = (chat: Chat) => {
    markRead(chat.id);
    router.push(`/chat/${chat.id}`);
  };

  const confirmDelete = (chat: Chat) => {
    Alert.alert('Delete chat?', `This will remove your conversation with ${chat.name}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteChat(chat.id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader
        title={showArchived ? 'Archived' : 'Chats'}
        scrollY={scrollY}
        leading={
          showArchived ? (
            <PressableScale haptic={false} onPress={() => setShowArchived(false)}>
              <Icon name="chevron_left" size={26} color={colors.primary} />
            </PressableScale>
          ) : (
            <PressableScale haptic={false}>
              <Text style={[typography.body, { color: colors.primary }]}>Edit</Text>
            </PressableScale>
          )
        }
        trailing={
          !showArchived && (
            <>
              <PressableScale haptic={false}>
                <Icon name="photo_camera" size={22} color={colors.primary} />
              </PressableScale>
              <PressableScale haptic={false} onPress={() => router.push('/new-chat')}>
                <Icon name="edit_square" size={22} color={colors.primary} />
              </PressableScale>
            </>
          )
        }
      />

      <Animated.FlatList
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 24 }}
        data={filtered}
        keyExtractor={(item) => (item as Chat).id}
        ItemSeparatorComponent={() => <Divider inset={72} />}
        ListHeaderComponent={
          <View>
            {!showArchived && (
              <>
                <Text style={[typography.largeTitle, styles.title, { color: colors.onSurface }]}>Chats</Text>
                <View style={styles.searchWrap}>
                  <SearchBar value={query} onChangeText={setQuery} />
                </View>
                <View style={styles.chipsRow}>
                  <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
                  <FilterChip label="Unread" active={filter === 'unread'} onPress={() => setFilter('unread')} />
                  <FilterChip
                    label="Favourites"
                    active={filter === 'favourites'}
                    onPress={() => setFilter('favourites')}
                  />
                  <FilterChip label="Groups" active={filter === 'groups'} onPress={() => setFilter('groups')} />
                </View>
                {archived.length > 0 && (
                  <>
                    <PressableScale
                      haptic={false}
                      onPress={() => setShowArchived(true)}
                      style={styles.archivedRow}
                    >
                      <View style={styles.archivedIcon}>
                        <Icon name="archive" size={26} color={colors.primary} />
                      </View>
                      <Text style={[typography.headline, { color: colors.onSurface, flex: 1 }]}>Archived</Text>
                      <Text style={[typography.subheadline, { color: colors.primary }]}>{archived.length}</Text>
                    </PressableScale>
                    <Divider inset={72} />
                  </>
                )}
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ChatRow
            chat={item as Chat}
            onPress={() => openChat(item as Chat)}
            onArchive={() => toggleArchive((item as Chat).id)}
            onDelete={() => confirmDelete(item as Chat)}
            onPin={() => togglePin((item as Chat).id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="chat"
            title={showArchived ? 'No archived chats' : 'No chats found'}
            description={
              showArchived
                ? 'Chats you archive will show up here.'
                : 'Try a different search, or start a new conversation.'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  archivedIcon: {
    width: 40,
    alignItems: 'center',
  },
});
