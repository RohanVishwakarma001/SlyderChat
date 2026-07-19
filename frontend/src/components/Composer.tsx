import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useAppTheme } from '@/theme';

type ReplyPreview = {
  senderLabel: string;
  text: string;
};

type ComposerProps = {
  onSend: (text: string) => void;
  onTypingChange?: (typing: boolean) => void;
  onAttach?: () => void;
  onCamera?: () => void;
  onRecordAudio?: () => void;
  uploading?: boolean;
  replyingTo?: ReplyPreview | null;
  onCancelReply?: () => void;
};

export function Composer({
  onSend,
  onTypingChange,
  onAttach,
  onCamera,
  onRecordAudio,
  uploading,
  replyingTo,
  onCancelReply,
}: ComposerProps) {
  const { colors, typography, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');

  const hasText = text.trim().length > 0;

  const handleChangeText = (value: string) => {
    setText(value);
    onTypingChange?.(value.trim().length > 0);
  };

  const handleSend = () => {
    if (!hasText) return;
    onSend(text.trim());
    setText('');
    onTypingChange?.(false);
  };

  return (
    <View>
      <BlurView intensity={90} tint={scheme} style={StyleSheet.absoluteFill} />
      {replyingTo && (
        <View
          style={[
            styles.replyBar,
            { backgroundColor: colors.surfaceContainerLowest, borderLeftColor: colors.primary },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[typography.labelBold, { color: colors.primary }]}>{replyingTo.senderLabel}</Text>
            <Text style={[typography.subheadline, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <PressableScale haptic={false} onPress={onCancelReply} style={{ padding: 4 }}>
            <Icon name="close" size={20} color={colors.onSurfaceVariant} />
          </PressableScale>
        </View>
      )}
      <View
        style={[
          styles.row,
          { paddingBottom: Math.max(insets.bottom, 10), backgroundColor: colors.surfaceContainerLow + 'E6' },
        ]}
      >
        <PressableScale haptic={false} style={styles.iconBtn} onPress={onAttach} disabled={uploading}>
          <Icon name="add" size={28} color={colors.primary} />
        </PressableScale>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant + '66' },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={handleChangeText}
            placeholder="Message"
            placeholderTextColor={colors.onSurfaceVariant + '99'}
            multiline
            style={[typography.body, styles.input, { color: colors.onSurface }]}
          />
          <PressableScale haptic={false} style={styles.emojiBtn}>
            <Icon name="emoji_emotions" size={22} color={colors.primary} />
          </PressableScale>
        </View>
        {uploading ? (
          <View style={styles.iconBtn}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : hasText ? (
          <PressableScale
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          >
            <Icon name="arrow_upward" size={20} color={colors.onPrimary} />
          </PressableScale>
        ) : (
          <>
            <PressableScale haptic={false} style={styles.iconBtn} onPress={onCamera}>
              <Icon name="photo_camera" size={24} color={colors.primary} />
            </PressableScale>
            <PressableScale haptic={false} style={styles.iconBtn} onPress={onRecordAudio}>
              <Icon name="mic" size={24} color={colors.primary} />
            </PressableScale>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 10,
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 14,
    paddingRight: 4,
    minHeight: 36,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  emojiBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
});
