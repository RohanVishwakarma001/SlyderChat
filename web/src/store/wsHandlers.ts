import type { WsHandlers } from '@/lib/ws';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';

const RESYNC_MIN_INTERVAL_MS = 8000;
let lastResyncAt = 0;

export function wireWsHandlers(): WsHandlers {
  return {
    onMessage: (msg) => useChatStore.getState().handleIncomingMessage(msg),
    onAck: (ack) => useChatStore.getState().handleAck(ack),
    onReceipt: (r) => useChatStore.getState().handleReceipt(r),
    onTyping: (t) => useChatStore.getState().handleTyping(t),
    onPresence: (p) => useChatStore.getState().handlePresence(p),
    onConnect: () => {
      const ui = useUiStore.getState();
      const isReconnect = ui.wsEverConnected;
      ui.setWsConnected(true);
      if (isReconnect) {
        // If the socket is flapping (e.g. the backend is struggling), stomp.js's
        // reconnectDelay fires this on every attempt. Without a floor, each one
        // kicks off a REST resync that itself retries on failure - overlapping
        // resyncs compound into a request storm against an already-struggling
        // backend. One resync per window is enough; the next reconnect (or the
        // in-flight one) will catch up regardless.
        const now = Date.now();
        if (now - lastResyncAt < RESYNC_MIN_INTERVAL_MS) return;
        lastResyncAt = now;

        const chat = useChatStore.getState();
        chat.loadConversations();
        if (chat.activeConversationId !== null) {
          chat.loadInitialMessages(chat.activeConversationId);
        }
      }
    },
    onDisconnect: () => {
      useUiStore.getState().setWsConnected(false);
    },
  };
}
