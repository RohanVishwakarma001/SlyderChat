import { useEffect } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatPane } from '@/components/chat/ChatPane';
import { EmptyState } from '@/components/chat/EmptyState';
import { ConnectionBanner } from '@/components/ConnectionBanner';
import {
  registerNotificationClickHandler,
  requestNotificationPermission,
} from '@/lib/notifications';

function ChatRoute() {
  const { conversationId } = useParams();
  const selectConversation = useChatStore((s) => s.selectConversation);
  const id = conversationId ? Number(conversationId) : null;

  useEffect(() => {
    selectConversation(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return id !== null ? <ChatPane conversationId={id} /> : <EmptyState />;
}

function IndexRoute() {
  const selectConversation = useChatStore((s) => s.selectConversation);

  useEffect(() => {
    selectConversation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <EmptyState />;
}

export function AppPage() {
  const navigate = useNavigate();
  const loadConversations = useChatStore((s) => s.loadConversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const markRead = useChatStore((s) => s.markRead);
  const conversations = useChatStore((s) => s.conversations);

  useEffect(() => {
    loadConversations();
    requestNotificationPermission();
  }, [loadConversations]);

  useEffect(() => {
    registerNotificationClickHandler((conversationId) => {
      navigate(`/app/${conversationId}`);
    });
  }, [navigate]);

  useEffect(() => {
    const onFocus = () => {
      if (activeConversationId === null) return;
      const conv = conversations[activeConversationId];
      if (conv && conv.unreadCount > 0) markRead(activeConversationId);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [activeConversationId, conversations, markRead]);

  useEffect(() => {
    const total = Object.values(conversations).reduce(
      (sum, c) => sum + c.unreadCount,
      0,
    );
    document.title = total > 0 ? `(${total}) ChatApp` : 'ChatApp';
  }, [conversations]);

  const showSidebar = activeConversationId === null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--color-bg)]">
      <ConnectionBanner />
      <div className="flex min-h-0 flex-1">
        <div
          className={`w-full shrink-0 md:block md:w-[380px] ${showSidebar ? 'block' : 'hidden'}`}
        >
          <Sidebar />
        </div>
        <div
          className={`min-w-0 flex-1 md:block ${showSidebar ? 'hidden' : 'block'}`}
        >
          <Routes>
            <Route index element={<IndexRoute />} />
            <Route path=":conversationId" element={<ChatRoute />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
