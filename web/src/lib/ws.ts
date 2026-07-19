import { Client, type IMessage } from '@stomp/stompjs';
import { WS_URL } from '@/config/env';
import type {
  AckDto,
  ChatSendPayload,
  MessageDto,
  PresenceDto,
  ReceiptDto,
  TypingDto,
} from '@/types';

export interface WsHandlers {
  onMessage: (msg: MessageDto) => void;
  onAck: (ack: AckDto) => void;
  onReceipt: (r: ReceiptDto) => void;
  onTyping: (t: TypingDto) => void;
  onPresence: (p: PresenceDto) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

let client: Client | null = null;
let generation = 0;
let pendingSends: ChatSendPayload[] = [];

function parse<T>(msg: IMessage): T {
  return JSON.parse(msg.body) as T;
}

// stomp.js throws synchronously if publish() is called while the underlying
// WebSocket isn't connected (e.g. mid-reconnect). Never let that escape as an
// uncaught exception from a UI event handler.
function safePublish(destination: string, body: string): boolean {
  if (!client?.connected) return false;
  try {
    client.publish({ destination, body });
    return true;
  } catch {
    return false;
  }
}

function flushPendingSends(): void {
  if (pendingSends.length === 0) return;
  const queued = pendingSends;
  pendingSends = [];
  for (const payload of queued) {
    publishChatSend(payload);
  }
}

export function connectWs(token: string, handlers: WsHandlers): void {
  if (client) {
    client.deactivate();
  }

  generation += 1;
  const myGeneration = generation;
  const isCurrent = () => myGeneration === generation;

  const newClient = new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 3000,
    onConnect: () => {
      if (!isCurrent()) return;
      newClient.subscribe('/user/queue/messages', (msg) =>
        handlers.onMessage(parse<MessageDto>(msg)),
      );
      newClient.subscribe('/user/queue/ack', (msg) =>
        handlers.onAck(parse<AckDto>(msg)),
      );
      newClient.subscribe('/user/queue/receipts', (msg) =>
        handlers.onReceipt(parse<ReceiptDto>(msg)),
      );
      newClient.subscribe('/user/queue/typing', (msg) =>
        handlers.onTyping(parse<TypingDto>(msg)),
      );
      newClient.subscribe('/user/queue/presence', (msg) =>
        handlers.onPresence(parse<PresenceDto>(msg)),
      );
      flushPendingSends();
      handlers.onConnect();
    },
    onWebSocketClose: () => {
      if (!isCurrent()) return;
      handlers.onDisconnect();
    },
    onStompError: () => {
      if (!isCurrent()) return;
      handlers.onDisconnect();
    },
  });

  client = newClient;
  newClient.activate();
}

export function disconnectWs(): void {
  generation += 1;
  client?.deactivate();
  client = null;
  pendingSends = [];
}

export function isWsConnected(): boolean {
  return client?.connected ?? false;
}

// Chat sends must not be silently lost if the socket is mid-reconnect: queue
// and flush once the connection is back, rather than dropping the message.
export function publishChatSend(payload: ChatSendPayload): void {
  const ok = safePublish('/app/chat.send', JSON.stringify(payload));
  if (!ok) {
    pendingSends.push(payload);
  }
}

// Typing/read are ephemeral signals - fine to drop silently when disconnected,
// they'll naturally resync (read has a REST fallback; typing is transient anyway).
export function publishTyping(conversationId: number, typing: boolean): void {
  safePublish('/app/chat.typing', JSON.stringify({ conversationId, typing }));
}

export function publishRead(conversationId: number): void {
  safePublish('/app/chat.read', JSON.stringify({ conversationId }));
}
