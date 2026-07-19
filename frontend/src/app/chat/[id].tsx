import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiClient, extractErrorMessage } from '@/api/client';
import { Avatar } from '@/components/Avatar';
import { Composer } from '@/components/Composer';
import { Icon } from '@/components/Icon';
import { MessageBubble } from '@/components/MessageBubble';
import { PressableScale } from '@/components/PressableScale';
import { sendTyping } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import { useChatsStore } from '@/store/chatsStore';
import { usePresenceStore } from '@/store/presenceStore';
import { useSettingsStore } from '@/store/settingsStore';
import { contactById } from '@/data/contacts';
import { ensureUsersLoaded } from '@/store/usersStore';
import { useAppTheme } from '@/theme';
import type { Message, MessageContentType } from '@/data/types';
import { wallpaperById } from '@/data/wallpapers';
import { formatDayHeading, formatLastSeen } from '@/utils/formatTime';

const GROUP_GAP_MS = 5 * 60 * 1000;
const TYPING_IDLE_MS = 2000;

type Row =
  | { type: 'date'; key: string; label: string }
  | { type: 'message'; key: string; message: Message; isOutgoing: boolean; showTail: boolean; senderLabel?: string };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id ?? '';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, scheme, typography } = useAppTheme();
  const listRef = useRef<FlatList<Row>>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasTypingRef = useRef(false);

  const myId = useAuthStore((s) => s.profile.id);
  const chat = useChatsStore((s) => s.chats.find((c) => c.id === chatId));
  const messages = useChatsStore((s) => s.messagesByChat[chatId] ?? []);
  const hasMore = useChatsStore((s) => s.hasMoreByChat[chatId] !== false);
  const { fetchMessages, openChat, setActiveChatId, sendMessage, sendMediaMessage, deleteForEveryone } =
    useChatsStore();
  const onlineByUser = usePresenceStore((s) => s.onlineByUser);
  const isAnyoneTyping = usePresenceStore((s) => s.isAnyoneTyping);

  const wallpaperId = useSettingsStore((s) => s.wallpaperId);
  const wallpaper = wallpaperById(wallpaperId);
  const wallpaperColor = scheme === 'dark' ? wallpaper.dark : wallpaper.light;

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);

  const otherUserId = !chat?.isGroup ? chat?.memberIds?.find((mid) => mid !== myId) : undefined;
  const otherPresence = otherUserId ? onlineByUser[otherUserId] : undefined;
  const typing = isAnyoneTyping(chatId, myId);

  useEffect(() => {
    if (!chatId) return;
    setActiveChatId(chatId);
    fetchMessages(chatId);
    openChat(chatId);
    return () => setActiveChatId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    if (chat?.memberIds?.length) {
      ensureUsersLoaded(chat.memberIds);
    }
  }, [chat?.memberIds]);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (wasTypingRef.current) sendTyping(chatId, false);
    },
    [chatId],
  );

  const handleTypingChange = (isTyping: boolean) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      if (!wasTypingRef.current) {
        wasTypingRef.current = true;
        sendTyping(chatId, true);
      }
      typingTimeoutRef.current = setTimeout(() => {
        wasTypingRef.current = false;
        sendTyping(chatId, false);
      }, TYPING_IDLE_MS);
    } else if (wasTypingRef.current) {
      wasTypingRef.current = false;
      sendTyping(chatId, false);
    }
  };

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let lastDay = '';
    messages.forEach((message, i) => {
      const day = formatDayHeading(message.createdAt);
      if (day !== lastDay) {
        out.push({ type: 'date', key: `date-${message.id}`, label: day });
        lastDay = day;
      }
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const isOutgoing = message.senderId === myId;
      const isFirstInGroup =
        !prev || prev.senderId !== message.senderId || message.createdAt - prev.createdAt > GROUP_GAP_MS;
      const isLastInGroup =
        !next || next.senderId !== message.senderId || next.createdAt - message.createdAt > GROUP_GAP_MS;
      const senderLabel =
        chat?.isGroup && !isOutgoing && isFirstInGroup
          ? (contactById(message.senderId)?.name ?? `User ${message.senderId}`)
          : undefined;
      out.push({
        type: 'message',
        key: message.id,
        message,
        isOutgoing,
        showTail: isLastInGroup,
        senderLabel,
      });
    });
    return out;
  }, [messages, chat?.isGroup, myId]);

  useEffect(() => {
    if (rows.length > 0) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
    }
  }, [rows.length === 0]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      await fetchMessages(chatId, true);
    } finally {
      setLoadingMore(false);
    }
  };

  const uploadFile = async (uri: string, name: string, mimeType: string) => {
    const form = new FormData();
    form.append('file', { uri, name, type: mimeType } as unknown as Blob);
    const { data } = await apiClient.post('/api/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url as string;
  };

  const sendMedia = async (contentType: MessageContentType, uri: string, name: string, mimeType: string) => {
    setUploading(true);
    try {
      const url = await uploadFile(uri, name, mimeType);
      sendMediaMessage(chatId, contentType, url, replyTo?.id);
      setReplyTo(null);
    } catch (e) {
      Alert.alert('Upload failed', extractErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to send media.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const contentType: MessageContentType = asset.type === 'video' ? 'VIDEO' : 'IMAGE';
    await sendMedia(contentType, asset.uri, asset.fileName ?? `media-${Date.now()}`, asset.mimeType ?? 'image/jpeg');
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    await sendMedia('IMAGE', asset.uri, asset.fileName ?? `photo-${Date.now()}.jpg`, asset.mimeType ?? 'image/jpeg');
  };

  const pickDocument = async (kind: 'DOCUMENT' | 'AUDIO') => {
    const result = await DocumentPicker.getDocumentAsync({ type: kind === 'AUDIO' ? 'audio/*' : '*/*' });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    await sendMedia(kind, asset.uri, asset.name, asset.mimeType ?? 'application/octet-stream');
  };

  const handleAttach = () => {
    Alert.alert('Attach', undefined, [
      { text: 'Photo or Video', onPress: pickFromLibrary },
      { text: 'Document', onPress: () => pickDocument('DOCUMENT') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRecordAudio = () => {
    Alert.alert('Audio message', 'Voice recording is not wired up yet — pick an audio file instead?', [
      { text: 'Choose file', onPress: () => pickDocument('AUDIO') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleLongPressMessage = (message: Message, isOutgoing: boolean) => {
    if (message.deleted) return;
    const buttons: any[] = [{ text: 'Reply', onPress: () => setReplyTo(message) }];
    if (isOutgoing) {
      buttons.push({
        text: 'Delete for everyone',
        style: 'destructive',
        onPress: () => deleteForEveryone(message.id).catch((e) => Alert.alert('Error', extractErrorMessage(e))),
      });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Message', undefined, buttons);
  };

  const handlePressMedia = (message: Message) => {
    if (!message.mediaUrl) return;
    if (message.contentType === 'IMAGE') {
      setFullscreenUri(message.mediaUrl);
    } else {
      Linking.openURL(message.mediaUrl).catch(() => {});
    }
  };

  if (!chat) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.onSurfaceVariant }}>This chat is no longer available.</Text>
      </View>
    );
  }

  const subtitle = chat.isGroup
    ? typing
      ? 'typing…'
      : `${chat.memberIds?.length ?? 0} members`
    : typing
      ? 'typing…'
      : otherPresence?.online
        ? 'online'
        : otherPresence?.lastSeen
          ? formatLastSeen(otherPresence.lastSeen)
          : 'tap here for contact info';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: wallpaperColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={[styles.header, { paddingTop: insets.top + 6, backgroundColor: colors.surface }]}>
        <PressableScale
          haptic={false}
          onPress={() => router.back()}
          style={styles.headerLeft}
          accessibilityLabel="Back"
        >
          <Icon name="chevron_left" size={28} color={colors.primary} />
          <PressableScale
            haptic={false}
            onPress={() =>
              router.push(chat.isGroup ? `/group-info/${chat.id}` : `/contact-info/${otherUserId ?? chat.id}`)
            }
            style={styles.identity}
          >
            <Avatar name={chat.name} uri={chat.avatarUri} size={34} isGroup={chat.isGroup} />
            <View>
              <Text style={[typography.headline, { color: colors.onSurface }]} numberOfLines={1}>
                {chat.name}
              </Text>
              <Text style={[typography.caption, { color: typing || otherPresence?.online ? colors.primary : colors.onSurfaceVariant }]}>
                {subtitle}
              </Text>
            </View>
          </PressableScale>
        </PressableScale>
        <View style={styles.headerRight}>
          <PressableScale haptic={false} onPress={() => Alert.alert('Video Call', 'Not part of this build.')}>
            <Icon name="videocam" size={24} color={colors.primary} />
          </PressableScale>
          <PressableScale haptic={false} onPress={() => Alert.alert('Call', 'Not part of this build.')}>
            <Icon name="call" size={22} color={colors.primary} />
          </PressableScale>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y < 60) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={100}
        ListHeaderComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          item.type === 'date' ? (
            <View style={styles.dateStampWrap}>
              <View style={[styles.dateStamp, { backgroundColor: colors.surfaceContainerLow + '99' }]}>
                <Text style={[typography.caption, { color: colors.outline, fontWeight: '700', letterSpacing: 0.4 }]}>
                  {item.label.toUpperCase()}
                </Text>
              </View>
            </View>
          ) : (
            <MessageBubble
              message={item.message}
              isOutgoing={item.isOutgoing}
              showTail={item.showTail}
              senderLabel={item.senderLabel}
              onLongPress={() => handleLongPressMessage(item.message, item.isOutgoing)}
              onPressMedia={() => handlePressMedia(item.message)}
              quoted={
                item.message.replyToId
                  ? (() => {
                      const q = messages.find((m) => m.id === item.message.replyToId);
                      if (!q) return null;
                      return {
                        senderLabel: q.senderId === myId ? 'You' : (contactById(q.senderId)?.name ?? 'Unknown'),
                        text: q.deleted ? 'This message was deleted' : q.text || previewForQuote(q),
                      };
                    })()
                  : null
              }
            />
          )
        }
      />

      <Composer
        onSend={(text) => {
          sendMessage(chatId, text, replyTo?.id);
          setReplyTo(null);
        }}
        onTypingChange={handleTypingChange}
        onAttach={handleAttach}
        onCamera={pickFromCamera}
        onRecordAudio={handleRecordAudio}
        uploading={uploading}
        replyingTo={
          replyTo
            ? {
                senderLabel: replyTo.senderId === myId ? 'You' : (contactById(replyTo.senderId)?.name ?? 'Unknown'),
                text: replyTo.deleted ? 'This message was deleted' : replyTo.text || previewForQuote(replyTo),
              }
            : null
        }
        onCancelReply={() => setReplyTo(null)}
      />

      <Modal visible={!!fullscreenUri} transparent animationType="fade" onRequestClose={() => setFullscreenUri(null)}>
        <Pressable style={styles.fullscreenBackdrop} onPress={() => setFullscreenUri(null)}>
          {fullscreenUri && (
            <Image source={{ uri: fullscreenUri }} style={styles.fullscreenImage} resizeMode="contain" />
          )}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function previewForQuote(message: Message): string {
  switch (message.contentType) {
    case 'IMAGE':
      return '📷 Photo';
    case 'VIDEO':
      return '🎥 Video';
    case 'AUDIO':
      return '🎤 Audio';
    case 'DOCUMENT':
      return '📄 Document';
    default:
      return message.text;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingRight: 12,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 2,
  },
  dateStampWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateStamp: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: '#000000ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
});
