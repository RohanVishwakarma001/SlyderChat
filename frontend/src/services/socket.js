import { Client } from '@stomp/stompjs';
import { AppState } from 'react-native';

import { WS_URL } from '@/config/env';

let client = null;
let currentToken = null;
let appStateListenerAdded = false;

const handlers = {
  message: () => {},
  ack: () => {},
  receipt: () => {},
  typing: () => {},
  presence: () => {},
};

export function setSocketHandlers(next) {
  Object.assign(handlers, next);
}

function safeParse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function ensureAppStateListener() {
  if (appStateListenerAdded) return;
  appStateListenerAdded = true;
  AppState.addEventListener('change', (state) => {
    if (state === 'active' && currentToken && (!client || !client.active)) {
      connectSocket(currentToken);
    }
  });
}

export function connectSocket(token) {
  if (!token) return;
  currentToken = token;

  if (client && client.active) {
    return;
  }
  if (client) {
    client.deactivate();
  }

  client = new Client({
    brokerURL: `${WS_URL.replace(/^http/, 'ws')}/ws`,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,
    onConnect: () => {
      client.subscribe('/user/queue/messages', (frame) => {
        const body = safeParse(frame.body);
        if (body) handlers.message(body);
      });
      client.subscribe('/user/queue/ack', (frame) => {
        const body = safeParse(frame.body);
        if (body) handlers.ack(body);
      });
      client.subscribe('/user/queue/receipts', (frame) => {
        const body = safeParse(frame.body);
        if (body) handlers.receipt(body);
      });
      client.subscribe('/user/queue/typing', (frame) => {
        const body = safeParse(frame.body);
        if (body) handlers.typing(body);
      });
      client.subscribe('/user/queue/presence', (frame) => {
        const body = safeParse(frame.body);
        if (body) handlers.presence(body);
      });
    },
  });

  client.activate();
  ensureAppStateListener();
}

export function disconnectSocket() {
  currentToken = null;
  if (client) {
    client.deactivate();
    client = null;
  }
}

export function isSocketConnected() {
  return !!client?.connected;
}

function publish(destination, payload) {
  if (!client || !client.connected) return;
  client.publish({ destination, body: JSON.stringify(payload) });
}

/**
 * @param {{ conversationId: string|number, contentType: string, body?: string|null, mediaUrl?: string|null, replyToId?: string|number|null, clientTempId: string }} params
 */
export function sendChatMessage({ conversationId, contentType, body = null, mediaUrl = null, replyToId = null, clientTempId }) {
  publish('/app/chat.send', {
    conversationId: Number(conversationId),
    contentType,
    body: body ?? null,
    mediaUrl: mediaUrl ?? null,
    replyToId: replyToId ? Number(replyToId) : null,
    clientTempId,
  });
}

export function sendTyping(conversationId, typing) {
  publish('/app/chat.typing', { conversationId: Number(conversationId), typing });
}

export function sendRead(conversationId) {
  publish('/app/chat.read', { conversationId: Number(conversationId) });
}
