import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';
import type { Chat } from '@/data/types';
import { formatChatTimestamp } from '@/utils/formatTime';

type ChatRowProps = {
  chat: Chat;
  onPress: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onPin: () => void;
};

export function ChatRow({ chat, onPress, onArchive, onDelete, onPin }: ChatRowProps) {
  const { colors, typography } = useAppTheme();
  const swipeableRef = useRef<React.ComponentRef<typeof Swipeable>>(null);

  const renderRightActions = (progress: SharedValue<number>) => {
    const style = useAnimatedStyle(() => ({
      transform: [{ translateX: interpolate(progress.value, [0, 1], [140, 0]) }],
    }));
    return (
      <Animated.View style={[styles.actions, style]}>
        <PressableScale
          haptic={false}
          onPress={() => {
            swipeableRef.current?.close();
            onArchive();
          }}
          style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
        >
          <Icon name="archive" size={22} color="#fff" />
        </PressableScale>
        <PressableScale
          haptic={false}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          style={[styles.actionBtn, { backgroundColor: colors.error }]}
        >
          <Icon name="delete" size={22} color="#fff" />
        </PressableScale>
      </Animated.View>
    );
  };

  const hasReadTicks = chat.lastMessageStatus && chat.lastMessageStatus !== null;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
    >
      <PressableScale
        onPress={onPress}
        onLongPress={onPin}
        haptic={false}
        style={[styles.row, { backgroundColor: colors.surface }]}
      >
        <Avatar name={chat.name} uri={chat.avatarUri} isGroup={chat.isGroup} />
        <View style={styles.stack}>
          <View style={styles.topLine}>
            <Text style={[typography.headline, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>
              {chat.name}
            </Text>
            <Text
              style={[
                typography.caption,
                {
                  color: chat.unreadCount > 0 ? colors.primary : colors.onSurfaceVariant,
                  fontWeight: chat.unreadCount > 0 ? '700' : '400',
                },
              ]}
            >
              {formatChatTimestamp(chat.updatedAt)}
            </Text>
          </View>
          <View style={styles.bottomLine}>
            <View style={styles.previewRow}>
              {hasReadTicks && (
                <Icon
                  name={chat.lastMessageStatus === 'read' ? 'done_all' : 'done'}
                  size={16}
                  color={chat.lastMessageStatus === 'read' ? colors.readTick : colors.onSurfaceVariant + '99'}
                />
              )}
              {chat.lastMessageSenderName && (
                <Text style={[typography.subheadline, { color: colors.onSurface }]} numberOfLines={1}>
                  {chat.lastMessageSenderName}:
                </Text>
              )}
              <Text
                style={[typography.subheadline, styles.preview, { color: colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {chat.lastMessagePreview}
              </Text>
            </View>
            {chat.unreadCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{chat.unreadCount}</Text>
              </View>
            ) : chat.pinned ? (
              <Icon name="push_pin" size={16} color={colors.onSurfaceVariant + '66'} />
            ) : chat.muted ? (
              <Icon name="notifications" size={16} color={colors.onSurfaceVariant + '66'} />
            ) : null}
          </View>
        </View>
      </PressableScale>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  stack: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
    minWidth: 0,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  preview: {
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    width: 140,
  },
  actionBtn: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
