// Wires incoming STOMP frames (src/services/socket.js) into app state.
// Kept as a separate module (rather than socket.js importing the stores directly)
// to avoid a socket <-> store import cycle.
import { setSocketHandlers } from '@/services/socket';
import { useChatsStore } from '@/store/chatsStore';
import { usePresenceStore } from '@/store/presenceStore';
import { useUsersStore } from '@/store/usersStore';

setSocketHandlers({
  message: (dto: any) => useChatsStore.getState().applyIncomingMessage(dto),
  ack: (payload: any) => useChatsStore.getState().applyAck(payload.clientTempId, payload.message),
  receipt: (payload: any) => useChatsStore.getState().applyReceipt(payload),
  typing: (payload: any) =>
    usePresenceStore.getState().setTyping(String(payload.conversationId), String(payload.userId), payload.typing),
  presence: (payload: any) => {
    usePresenceStore.getState().setPresence(String(payload.userId), payload.online, payload.lastSeen ?? undefined);
    useUsersStore.getState().setOnline(String(payload.userId), payload.online);
  },
});
