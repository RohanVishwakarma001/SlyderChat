package com.rohan.chatapp.chat.ws;

import com.rohan.chatapp.chat.ConversationMember;
import com.rohan.chatapp.chat.ConversationMemberRepository;
import com.rohan.chatapp.chat.ConversationService;
import com.rohan.chatapp.chat.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final ConversationService conversationService;
    private final ConversationMemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(@Payload ChatSendRequest request, Principal principal) {
        Long senderId = Long.valueOf(principal.getName());
        messageService.sendMessage(
                senderId,
                request.conversationId(),
                request.contentType(),
                request.body(),
                request.mediaUrl(),
                request.replyToId(),
                request.clientTempId()
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload ChatTypingRequest request, Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        conversationService.assertMember(request.conversationId(), userId);

        TypingDto dto = new TypingDto(request.conversationId(), userId, request.typing());
        for (ConversationMember member : memberRepository.findByConversationId(request.conversationId())) {
            if (!member.getUserId().equals(userId)) {
                messagingTemplate.convertAndSendToUser(String.valueOf(member.getUserId()), "/queue/typing", dto);
            }
        }
    }

    @MessageMapping("/chat.read")
    public void read(@Payload ChatReadRequest request, Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        messageService.markConversationRead(request.conversationId(), userId);
    }
}
