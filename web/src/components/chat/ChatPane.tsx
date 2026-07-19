import { useState, type DragEvent } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { Composer } from '@/components/chat/Composer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { MediaPreviewModal } from '@/components/chat/MediaPreviewModal';
import { GroupInfoDrawer } from '@/components/chat/GroupInfoDrawer';
import { MediaApi } from '@/lib/endpoints';
import { useUiStore } from '@/store/uiStore';
import { contentTypeFromMime } from '@/utils/format';
import type { ContentType } from '@/types';

const EMPTY_TYPING: Record<number, boolean> = {};

interface ChatPaneProps {
  conversationId: number;
}

export function ChatPane({ conversationId }: ChatPaneProps) {
  const conversation = useChatStore((s) => s.conversations[conversationId]);
  const myUserId = useChatStore((s) => s.myUserId);
  const typingUsers = useChatStore(
    (s) => s.typingByConversation[conversationId] ?? EMPTY_TYPING,
  );
  const replyTarget = useChatStore(
    (s) => s.replyTargetByConversation[conversationId] ?? null,
  );
  const setReplyTarget = useChatStore((s) => s.setReplyTarget);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const usersById = useChatStore((s) => s.usersById);
  const addToast = useUiStore((s) => s.addToast);

  const [pendingFile, setPendingFile] = useState<{ file: File; contentType: ContentType } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const isOthersTyping = Object.entries(typingUsers).some(
    ([id, typing]) => typing && Number(id) !== myUserId,
  );

  const handlePickFile = (file: File) => {
    setPendingFile({ file, contentType: contentTypeFromMime(file.type) });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePickFile(file);
  };

  const handleConfirmMedia = async (caption: string) => {
    if (!pendingFile) return;
    setUploading(true);
    setProgress(0);
    try {
      const res = await MediaApi.upload(pendingFile.file, setProgress);
      sendMessage(conversationId, {
        contentType: pendingFile.contentType,
        body: caption.trim() || null,
        mediaUrl: res.url,
        replyToId: replyTarget?.id ?? null,
      });
      setReplyTarget(conversationId, null);
      setPendingFile(null);
    } catch {
      addToast('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full flex-col">
        <div className="glass h-[65px] shrink-0 animate-pulse border-b border-[var(--color-border)]" />
        <div className="flex-1" />
      </div>
    );
  }

  const replyToSenderName =
    replyTarget?.senderId === myUserId ? 'You' : (usersById[replyTarget?.senderId ?? -1]?.name ?? '');

  return (
    <div
      className="relative flex h-full flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <ChatHeader conversation={conversation} onOpenInfo={() => setShowInfo(true)} />

      <MessageList
        conversationId={conversationId}
        conversation={conversation}
        onReply={(messageId) => {
          const list = useChatStore.getState().messagesByConversation[conversationId] ?? [];
          const msg = list.find((m) => m.id === messageId);
          if (msg) setReplyTarget(conversationId, msg);
        }}
      />

      {isOthersTyping && (
        <div className="px-4 pb-1">
          <TypingIndicator />
        </div>
      )}

      <Composer
        conversationId={conversationId}
        replyTarget={replyTarget}
        replyToSenderName={replyToSenderName}
        onClearReply={() => setReplyTarget(conversationId, null)}
        onPickFile={handlePickFile}
      />

      {dragActive && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-accent)]/10 backdrop-blur-sm">
          <div className="glass rounded-2xl border-2 border-dashed border-[var(--color-accent)] px-8 py-6 text-center">
            <p className="text-sm font-medium text-[var(--color-accent)]">Drop file to send</p>
          </div>
        </div>
      )}

      {pendingFile && (
        <MediaPreviewModal
          file={pendingFile.file}
          contentType={pendingFile.contentType}
          uploading={uploading}
          progress={progress}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleConfirmMedia}
        />
      )}

      {showInfo && conversation.type === 'GROUP' && (
        <GroupInfoDrawer conversation={conversation} onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}
