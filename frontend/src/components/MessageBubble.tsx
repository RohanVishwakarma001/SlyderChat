import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { useAppTheme } from '@/theme';
import type { Message } from '@/data/types';
import { formatClockTime } from '@/utils/formatTime';

type QuotedMessage = {
  senderLabel: string;
  text: string;
};

type MessageBubbleProps = {
  message: Message;
  isOutgoing: boolean;
  showTail: boolean;
  senderLabel?: string;
  quoted?: QuotedMessage | null;
  onLongPress?: () => void;
  onPressMedia?: () => void;
};

export function MessageBubble({
  message,
  isOutgoing,
  showTail,
  senderLabel,
  quoted,
  onLongPress,
  onPressMedia,
}: MessageBubbleProps) {
  const { colors, typography, radii } = useAppTheme();

  const bubbleColor = isOutgoing ? colors.bubbleOut : colors.bubbleIn;
  const textColor = isOutgoing ? colors.onBubbleOut : colors.onBubbleIn;

  const mediaLabel =
    message.contentType === 'VIDEO'
      ? '🎥 Video'
      : message.contentType === 'AUDIO'
        ? '🎤 Audio'
        : message.contentType === 'DOCUMENT'
          ? '📄 Document'
          : null;

  return (
    <View style={[styles.wrap, isOutgoing ? styles.alignEnd : styles.alignStart]}>
      <Pressable onLongPress={onLongPress} disabled={message.deleted}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleColor,
              borderRadius: radii.lg,
              borderBottomRightRadius: isOutgoing && showTail ? 4 : radii.lg,
              borderBottomLeftRadius: !isOutgoing && showTail ? 4 : radii.lg,
            },
          ]}
        >
          {senderLabel && (
            <Text style={[typography.labelBold, { color: colors.secondary, marginBottom: 2 }]}>
              {senderLabel}
            </Text>
          )}
          {quoted && (
            <View style={[styles.quote, { borderLeftColor: textColor + '80', backgroundColor: textColor + '14' }]}>
              <Text style={[typography.labelBold, { color: textColor }]} numberOfLines={1}>
                {quoted.senderLabel}
              </Text>
              <Text style={[typography.caption, { color: textColor + 'CC' }]} numberOfLines={1}>
                {quoted.text}
              </Text>
            </View>
          )}
          {message.deleted ? (
            <Text style={[typography.body, { color: textColor + '99', fontStyle: 'italic' }]}>
              This message was deleted
            </Text>
          ) : message.contentType === 'IMAGE' && message.mediaUrl ? (
            <Pressable onPress={onPressMedia}>
              <Image source={{ uri: message.mediaUrl }} style={styles.image} resizeMode="cover" />
            </Pressable>
          ) : mediaLabel ? (
            <Pressable onPress={onPressMedia} style={styles.mediaTile}>
              <Text style={[typography.body, { color: textColor }]}>{mediaLabel}</Text>
            </Pressable>
          ) : (
            <Text style={[typography.body, { color: textColor }]}>{message.text}</Text>
          )}
          <View style={styles.meta}>
            {message.pending && <Icon name="schedule" size={12} color={textColor + 'B3'} />}
            <Text style={[styles.time, { color: textColor + 'B3' }]}>
              {formatClockTime(message.createdAt)}
            </Text>
            {isOutgoing && !message.pending && (
              <Icon
                name={message.status === 'sent' ? 'done' : 'done_all'}
                size={14}
                color={message.status === 'read' ? colors.readTick : textColor + 'B3'}
              />
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: '80%',
    marginBottom: 3,
  },
  alignStart: {
    alignSelf: 'flex-start',
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quote: {
    borderLeftWidth: 3,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 8,
    marginBottom: 4,
  },
  mediaTile: {
    paddingVertical: 12,
    minWidth: 160,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  time: {
    fontSize: 10,
  },
});
