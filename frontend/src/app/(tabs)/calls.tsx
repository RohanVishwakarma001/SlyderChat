import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Divider } from '@/components/Divider';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader';
import { useAppTheme } from '@/theme';
import { initialCalls } from '@/data/calls';
import { formatChatTimestamp } from '@/utils/formatTime';

export default function CallsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { scrollY, onScroll } = useCollapsingHeader();
  const [query, setQuery] = useState('');

  const calls = initialCalls.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const directionMeta = (direction: (typeof initialCalls)[number]['direction']) => {
    if (direction === 'missed') return { icon: 'call_received', label: 'Missed' };
    if (direction === 'outgoing') return { icon: 'call_made', label: 'Outgoing' };
    return { icon: 'call_received', label: 'Incoming' };
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader
        title="Calls"
        scrollY={scrollY}
        leading={
          <PressableScale haptic={false}>
            <Text style={[typography.body, { color: colors.primary }]}>Edit</Text>
          </PressableScale>
        }
        trailing={
          <PressableScale haptic={false}>
            <Icon name="add_circle" size={24} color={colors.primary} />
          </PressableScale>
        }
      />

      <Animated.FlatList
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 24 }}
        data={calls}
        keyExtractor={(item) => (item as (typeof calls)[number]).id}
        ItemSeparatorComponent={() => <Divider inset={72} />}
        ListHeaderComponent={
          <View>
            <Text style={[typography.largeTitle, styles.title, { color: colors.onSurface }]}>Calls</Text>
            <View style={styles.searchWrap}>
              <SearchBar value={query} onChangeText={setQuery} />
            </View>
            <PressableScale
              haptic={false}
              style={styles.heroRow}
              onPress={() => Alert.alert('Create Call Link', 'Call links are not part of this prototype.')}
            >
              <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
                <Icon name="add" size={22} color={colors.onPrimaryContainer} />
              </View>
              <Text style={[typography.headline, { color: colors.onSurface }]}>Create Call Link</Text>
            </PressableScale>
            <Divider inset={72} />
          </View>
        }
        renderItem={({ item }) => {
          const call = item as (typeof calls)[number];
          const meta = directionMeta(call.direction);
          const missed = call.direction === 'missed';
          return (
            <PressableScale
              haptic={false}
              style={styles.row}
              onPress={() => router.push(call.isGroup ? `/group-info/${call.contactId}` : `/contact-info/${call.contactId}`)}
            >
              <Avatar name={call.name} isGroup={call.isGroup} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.headline, { color: missed ? colors.error : colors.onSurface }]} numberOfLines={1}>
                  {call.name}
                </Text>
                <View style={styles.metaRow}>
                  <Icon
                    name={meta.icon}
                    size={14}
                    color={missed ? colors.error : colors.onSurfaceVariant}
                  />
                  <Text style={[typography.subheadline, { color: colors.onSurfaceVariant }]}>{meta.label}</Text>
                </View>
              </View>
              <Text style={[typography.caption, { color: colors.onSurfaceVariant }]}>
                {formatChatTimestamp(call.createdAt)}
              </Text>
              <PressableScale
                haptic={false}
                style={styles.infoBtn}
                onPress={() => router.push(call.isGroup ? `/group-info/${call.contactId}` : `/contact-info/${call.contactId}`)}
              >
                <Icon name={call.kind === 'video' ? 'videocam' : 'call'} size={20} color={colors.primary} />
              </PressableScale>
            </PressableScale>
          );
        }}
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  infoBtn: {
    paddingLeft: 12,
  },
});
