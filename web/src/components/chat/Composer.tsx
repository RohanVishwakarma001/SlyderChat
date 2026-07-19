import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { useChatStore } from '@/store/chatStore';
import { publishTyping } from '@/lib/ws';
import { EmojiPicker } from '@/components/chat/EmojiPicker';
import { colorForSender, mediaPreviewLabel } from '@/utils/format';
import type { MessageDto } from '@/types';

interface ComposerProps {
  conversationId: number;
  replyTarget: MessageDto | null;
  replyToSenderName: string;
  onClearReply: () => void;
  onPickFile: (file: File) => void;
}

const TYPING_IDLE_MS = 2000;

export function Composer({
  conversationId,
  replyTarget,
  replyToSenderName,
  onClearReply,
  onPickFile,
}: ComposerProps) {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText('');
    return () => {
      if (isTypingRef.current) {
        publishTyping(conversationId, false);
        isTypingRef.current = false;
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      publishTyping(conversationId, true);
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      publishTyping(conversationId, false);
    }, TYPING_IDLE_MS);
  };

  const stopTyping = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      publishTyping(conversationId, false);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(conversationId, {
      contentType: 'TEXT',
      body: trimmed,
      mediaUrl: null,
      replyToId: replyTarget?.id ?? null,
    });
    setText('');
    stopTyping();
    onClearReply();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          onPickFile(file);
          return;
        }
      }
    }
  };

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPickFile(file);
    e.target.value = '';
  };

  const insertEmoji = (emoji: string) => {
    setText((t) => t + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="glass shrink-0 border-t border-[var(--color-border)] px-3 py-2.5">
      {replyTarget && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-[var(--color-accent)] bg-black/20 px-3 py-2">
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-medium"
              style={{ color: colorForSender(replyTarget.senderId) }}
            >
              {replyToSenderName}
            </div>
            <div className="truncate text-xs text-[var(--color-text-dim)]">
              {replyTarget.deleted
                ? 'This message was deleted'
                : replyTarget.contentType === 'TEXT'
                  ? replyTarget.body
                  : mediaPreviewLabel(replyTarget.contentType)}
            </div>
          </div>
          <button
            onClick={onClearReply}
            className="rounded-full p-1 text-[var(--color-text-dim)] hover:bg-white/10"
            aria-label="Cancel reply"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <div className="relative">
          <button
            onClick={() => setShowEmoji((v) => !v)}
            className="rounded-full p-2.5 text-[var(--color-text-dim)] transition hover:bg-white/10 hover:text-[var(--color-text)]"
            aria-label="Emoji"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-20">
              <EmojiPicker onSelect={insertEmoji} />
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full p-2.5 text-[var(--color-text-dim)] transition hover:bg-white/10 hover:text-[var(--color-text)]"
          aria-label="Attach file"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.2-9.19a3.67 3.67 0 0 1 5.19 5.19l-9.2 9.19a1.83 1.83 0 0 1-2.6-2.6l8.49-8.48"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={stopTyping}
          rows={1}
          placeholder="Type a message"
          className="scrollbar-thin max-h-[140px] flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-[var(--color-accent)]"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="rounded-full bg-[var(--color-accent)] p-2.5 text-[#0A0E1A] transition hover:brightness-110 disabled:opacity-40"
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
