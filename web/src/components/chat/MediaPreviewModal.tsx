import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import type { ContentType } from '@/types';

interface MediaPreviewModalProps {
  file: File;
  contentType: ContentType;
  uploading: boolean;
  progress: number;
  onCancel: () => void;
  onConfirm: (caption: string) => void;
}

export function MediaPreviewModal({
  file,
  contentType,
  uploading,
  progress,
  onCancel,
  onConfirm,
}: MediaPreviewModalProps) {
  const [caption, setCaption] = useState('');
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <Modal title="Send media" onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <div className="flex max-h-72 items-center justify-center overflow-hidden rounded-xl bg-black/30">
          {contentType === 'IMAGE' && (
            <img src={objectUrl} alt="" className="max-h-72 max-w-full object-contain" />
          )}
          {contentType === 'VIDEO' && (
            <video src={objectUrl} controls className="max-h-72 max-w-full" />
          )}
          {contentType === 'AUDIO' && (
            <div className="flex w-full flex-col items-center gap-3 p-6">
              <span className="text-3xl">🎵</span>
              <audio src={objectUrl} controls className="w-full" />
            </div>
          )}
          {contentType === 'DOCUMENT' && (
            <div className="flex w-full flex-col items-center gap-2 p-8">
              <span className="text-4xl">📄</span>
              <span className="max-w-full truncate px-4 text-sm text-[var(--color-text-dim)]">
                {file.name}
              </span>
            </div>
          )}
        </div>

        <input
          autoFocus
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !uploading && onConfirm(caption)}
          placeholder="Add a caption…"
          className="w-full rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        />

        {uploading && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-sm font-medium hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(caption)}
            disabled={uploading}
            className="flex-1 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#0A0E1A] disabled:opacity-50"
          >
            {uploading ? `Uploading ${progress}%` : 'Send'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
