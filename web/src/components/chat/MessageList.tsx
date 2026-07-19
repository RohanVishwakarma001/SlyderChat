import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useChatStore, type LocalMessage } from '@/store/chatStore';
import { DaySeparator } from '@/components/chat/DaySeparator';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { ConversationSummaryDto } from '@/types';

interface MessageListProps {
  conversationId: number;
  conversation: ConversationSummaryDto;
  onReply: (messageId: number) => void;
}

function SkeletonBubble({ mine }: { mine: boolean }) {
  return (
    <div className={`flex px-4 py-1 ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className="h-12 animate-pulse rounded-2xl bg-white/[0.05]"
        style={{ width: `${120 + Math.random() * 100}px` }}
      />
    </div>
  );
}

export function MessageList({ conversationId, conversation, onReply }: MessageListProps) {
  const messages = useChatStore((s) => s.messagesByConversation[conversationId]);
  const hasMore = useChatStore((s) => s.hasMoreByConversation[conversationId] ?? false);
  const loading = useChatStore((s) => s.loadingMessages[conversationId] ?? false);
  const usersById = useChatStore((s) => s.usersById);
  const myUserId = useChatStore((s) => s.myUserId);
  const loadMoreMessages = useChatStore((s) => s.loadMoreMessages);
  const deleteMessage = useChatStore((s) => s.deleteMessage);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);
  const nearBottomRef = useRef(true);
  const initializedForRef = useRef<number | null>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const messageById = useMemo(() => {
    const map = new Map<number, LocalMessage>();
    (messages ?? []).forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (el.scrollTop < 80 && hasMore && !loading) {
      prevScrollHeightRef.current = el.scrollHeight;
      isPrependingRef.current = true;
      loadMoreMessages(conversationId);
    }
  };

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !messages) return;

    if (isPrependingRef.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      isPrependingRef.current = false;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    const isFirstLoad = initializedForRef.current !== conversationId;
    const hasNewLastMessage = lastMsg && lastMsg.id !== lastMessageIdRef.current;

    if (isFirstLoad) {
      el.scrollTop = el.scrollHeight;
      initializedForRef.current = conversationId;
    } else if (hasNewLastMessage && (nearBottomRef.current || lastMsg.senderId === myUserId)) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }

    if (lastMsg) lastMessageIdRef.current = lastMsg.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, conversationId]);

  const scrollToMessage = (id: number) => {
    const el = messageRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(id);
    setTimeout(() => setHighlightedId((cur) => (cur === id ? null : cur)), 1200);
  };

  if (!messages) {
    return (
      <div className="scrollbar-thin flex-1 overflow-y-auto py-4">
        {[true, false, true, true, false].map((mine, i) => (
          <SkeletonBubble key={i} mine={mine} />
        ))}
      </div>
    );
  }

  let lastDateKey = '';

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="scrollbar-thin flex-1 overflow-y-auto py-3"
    >
      {loading && hasMore && (
        <div className="flex justify-center py-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
        </div>
      )}

      {messages.map((message, idx) => {
        const dateKey = new Date(message.createdAt).toDateString();
        const showSeparator = dateKey !== lastDateKey;
        lastDateKey = dateKey;

        const prevMessage = messages[idx - 1];
        const showSenderName =
          conversation.type === 'GROUP' &&
          message.senderId !== myUserId &&
          (showSeparator || !prevMessage || prevMessage.senderId !== message.senderId);

        const replyToMessage = message.replyToId
          ? (messageById.get(message.replyToId) ?? null)
          : undefined;
        const replyToSenderName =
          replyToMessage?.senderId === myUserId
            ? 'You'
            : (usersById[replyToMessage?.senderId ?? -1]?.name ?? '');

        return (
          <div key={message.id}>
            {showSeparator && <DaySeparator epochMs={message.createdAt} />}
            <div
              className={
                highlightedId === message.id
                  ? 'rounded-xl bg-[var(--color-accent-dim)] transition-colors duration-300'
                  : ''
              }
            >
              <MessageBubble
                message={message}
                isMine={message.senderId === myUserId}
                showSenderName={showSenderName}
                senderName={usersById[message.senderId]?.name ?? '...'}
                replyToMessage={replyToMessage}
                replyToSenderName={replyToSenderName}
                onReply={() => onReply(message.id)}
                onDelete={() => deleteMessage(conversationId, message.id)}
                onScrollToReply={() =>
                  message.replyToId && scrollToMessage(message.replyToId)
                }
                registerRef={(el) => {
                  if (el) messageRefs.current.set(message.id, el);
                  else messageRefs.current.delete(message.id);
                }}
              />
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
