import { useState } from 'react';
import { Ticks } from '@/components/chat/Ticks';
import { MediaContent } from '@/components/chat/MediaContent';
import { colorForSender, formatClock, mediaPreviewLabel } from '@/utils/format';
import type { LocalMessage } from '@/store/chatStore';
import type { MessageDto } from '@/types';

interface MessageBubbleProps {
  message: LocalMessage;
  isMine: boolean;
  showSenderName: boolean;
  senderName: string;
  replyToMessage: MessageDto | null | undefined;
  replyToSenderName: string;
  onReply: () => void;
  onDelete: () => void;
  onScrollToReply: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}

export function MessageBubble({
  message,
  isMine,
  showSenderName,
  senderName,
  replyToMessage,
  replyToSenderName,
  onReply,
  onDelete,
  onScrollToReply,
  registerRef,
}: MessageBubbleProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (message.deleted) {
    return (
      <div ref={registerRef} className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-4 py-0.5`}>
        <div className="glass max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm text-[var(--color-text-faint)] italic">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      ref={registerRef}
      className={`animate-pop-in group flex px-4 py-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[70%] items-center gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`relative rounded-2xl px-3.5 py-2 ${
            isMine
              ? 'rounded-br-sm border border-[var(--color-accent)]/25 bg-[var(--color-accent-dim)]'
              : 'glass rounded-bl-sm'
          }`}
        >
          {showSenderName && !isMine && (
            <div
              className="mb-0.5 text-xs font-semibold"
              style={{ color: colorForSender(message.senderId) }}
            >
              {senderName}
            </div>
          )}

          {replyToMessage && (
            <button
              onClick={onScrollToReply}
              className="mb-1.5 block w-full rounded-lg border-l-2 border-[var(--color-accent)] bg-black/20 px-2.5 py-1.5 text-left"
            >
              <div className="text-xs font-medium" style={{ color: colorForSender(replyToMessage.senderId) }}>
                {replyToSenderName}
              </div>
              <div className="truncate text-xs text-[var(--color-text-dim)]">
                {replyToMessage.deleted
                  ? 'This message was deleted'
                  : replyToMessage.contentType === 'TEXT'
                    ? replyToMessage.body
                    : mediaPreviewLabel(replyToMessage.contentType)}
              </div>
            </button>
          )}

          {message.contentType !== 'TEXT' && message.mediaUrl && (
            <div className="mb-1 w-56 sm:w-64">
              <MediaContent contentType={message.contentType} mediaUrl={message.mediaUrl} />
            </div>
          )}

          {message.body && (
            <div className="text-sm whitespace-pre-wrap break-words text-[var(--color-text)]">
              {message.body}
            </div>
          )}

          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="font-mono text-[10px] text-[var(--color-text-faint)]">
              {formatClock(message.createdAt)}
            </span>
            {isMine && <Ticks status={message.status} pending={message.pending} />}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={onReply}
            title="Reply"
            className="rounded-full p-1.5 text-[var(--color-text-dim)] hover:bg-white/10 hover:text-[var(--color-text)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 10L4 15l5 5M4 15h11a4 4 0 0 0 4-4V5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {isMine && (
            <div className="relative">
              <button
                onClick={() => setConfirmingDelete((v) => !v)}
                title="Delete"
                className="rounded-full p-1.5 text-[var(--color-text-dim)] hover:bg-white/10 hover:text-[var(--color-danger)]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {confirmingDelete && (
                <div className="glass absolute top-8 right-0 z-10 w-44 rounded-xl p-2 text-xs shadow-xl">
                  <p className="mb-2 px-1 text-[var(--color-text-dim)]">Delete for everyone?</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className="flex-1 rounded-lg border border-[var(--color-border)] py-1 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setConfirmingDelete(false);
                        onDelete();
                      }}
                      className="flex-1 rounded-lg bg-[var(--color-danger)] py-1 font-medium text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
