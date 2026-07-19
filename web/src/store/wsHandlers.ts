import type { WsHandlers } from '@/lib/ws';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';

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
