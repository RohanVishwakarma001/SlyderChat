package com.rohan.chatapp.presence;

import com.rohan.chatapp.chat.ConversationMemberRepository;
import com.rohan.chatapp.chat.MessageService;
import com.rohan.chatapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final PresenceService presenceService;
    private final ConversationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();
        if (user == null) {
            return;
        }
        Long userId = Long.valueOf(user.getName());
        String sessionId = accessor.getSessionId();

        boolean firstSession = presenceService.addSession(userId, sessionId);
        if (firstSession) {
            List<Long> partners = memberRepository.findDistinctPartnerIds(userId);
            presenceService.broadcastPresence(userId, true, null, partners);
            messageService.markDeliveredForUser(userId);
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();
        if (user == null) {
            return;
        }
        Long userId = Long.valueOf(user.getName());
        String sessionId = accessor.getSessionId();

        boolean lastSession = presenceService.removeSession(userId, sessionId);
        if (lastSession) {
            Instant now = Instant.now();
            userRepository.findById(userId).ifPresent(u -> {
                u.setLastSeen(now);
                userRepository.save(u);
            });
            List<Long> partners = memberRepository.findDistinctPartnerIds(userId);
            presenceService.broadcastPresence(userId, false, now, partners);
        }
    }
}
