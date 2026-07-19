package com.rohan.chatapp.presence;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Map<Long, Set<String>> sessionsByUser = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public PresenceService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public boolean isOnline(Long userId) {
        Set<String> sessions = sessionsByUser.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    /**
     * Registers a session for the user. Returns true if this is the user's first
     * active session (i.e. they just transitioned from offline to online).
     */
    public boolean addSession(Long userId, String sessionId) {
        Set<String> sessions = sessionsByUser.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
        boolean wasEmpty = sessions.isEmpty();
        sessions.add(sessionId);
        return wasEmpty;
    }

    /**
     * Removes a session for the user. Returns true if that was the user's last
     * active session (i.e. they just transitioned from online to offline).
     */
    public boolean removeSession(Long userId, String sessionId) {
        Set<String> sessions = sessionsByUser.get(userId);
        if (sessions == null) {
            return false;
        }
        sessions.remove(sessionId);
        if (sessions.isEmpty()) {
            sessionsByUser.remove(userId);
            return true;
        }
        return false;
    }

    public void broadcastPresence(Long userId, boolean online, Instant lastSeen, List<Long> notifyUserIds) {
        PresenceDto dto = new PresenceDto(userId, online, lastSeen == null ? null : lastSeen.toEpochMilli());
        for (Long recipientId : notifyUserIds) {
            messagingTemplate.convertAndSendToUser(String.valueOf(recipientId), "/queue/presence", dto);
        }
    }
}
