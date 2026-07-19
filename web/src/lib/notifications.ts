import type { MessageDto } from '@/types';

export function requestNotificationPermission(): void {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

const PREVIEW_BY_TYPE: Record<string, string> = {
  IMAGE: '📷 Photo',
  VIDEO: '🎥 Video',
  AUDIO: '🎵 Audio',
  DOCUMENT: '📄 Document',
};

let onNotificationClick: ((conversationId: number) => void) | null = null;

export function registerNotificationClickHandler(
  handler: (conversationId: number) => void,
): void {
  onNotificationClick = handler;
}

export function notifyIncomingMessage(msg: MessageDto, senderName: string): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.hasFocus()) return;

  const body =
    msg.contentType === 'TEXT'
      ? (msg.body ?? '')
      : (PREVIEW_BY_TYPE[msg.contentType] ?? 'New message');

  const notification = new Notification(senderName, {
    body,
    icon: '/favicon.svg',
    tag: `msg-${msg.conversationId}`,
  });

  notification.onclick = () => {
    window.focus();
    onNotificationClick?.(msg.conversationId);
    notification.close();
  };
}
