import { useState } from 'react';
import { Lightbox } from '@/components/chat/Lightbox';
import type { ContentType } from '@/types';

interface MediaContentProps {
  contentType: ContentType;
  mediaUrl: string;
}

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split('/').pop() || 'file');
  } catch {
    return url.split('/').pop() || 'file';
  }
}

export function MediaContent({ contentType, mediaUrl }: MediaContentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (contentType === 'IMAGE') {
    return (
      <>
        <img
          src={mediaUrl}
          alt=""
          onClick={() => setLightboxOpen(true)}
          className="max-h-72 w-full cursor-pointer rounded-lg object-cover"
          loading="lazy"
        />
        {lightboxOpen && (
          <Lightbox url={mediaUrl} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    );
  }

  if (contentType === 'VIDEO') {
    return (
      <video
        src={mediaUrl}
        controls
        className="max-h-72 w-full rounded-lg bg-black"
      />
    );
  }

  if (contentType === 'AUDIO') {
    return <audio src={mediaUrl} controls className="w-full max-w-xs" />;
  }

  const fileName = fileNameFromUrl(mediaUrl);
  return (
    <a
      href={mediaUrl}
      download={fileName}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-black/20 px-3 py-2.5 transition hover:bg-black/30"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-blue-dim)] text-lg">
        📄
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{fileName}</div>
        <div className="text-xs text-[var(--color-text-dim)]">Download</div>
      </div>
    </a>
  );
}
