package com.rohan.chatapp.chat;

import com.rohan.chatapp.chat.ws.AckDto;
import com.rohan.chatapp.chat.ws.ReceiptDto;
import com.rohan.chatapp.config.BadRequestException;
import com.rohan.chatapp.config.ResourceNotFoundException;
import com.rohan.chatapp.presence.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MessageService {

    private static final int MAX_PAGE_SIZE = 100;

    private final MessageRepository messageRepository;
    private final MessageStatusRepository messageStatusRepository;
    private final ConversationMemberRepository memberRepository;
    private final ConversationService conversationService;
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<MessageDto> getMessages(Long userId, Long conversationId, Long beforeId, int limit) {
        conversationService.assertMember(conversationId, userId);
        int pageSize = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
        List<Message> messages = beforeId == null
                ? messageRepository.findByConversationIdOrderByIdDesc(conversationId, PageRequest.of(0, pageSize))
                : messageRepository.findByConversationIdAndIdLessThanOrderByIdDesc(conversationId, beforeId, PageRequest.of(0, pageSize));

        return messages.stream()
                .map(m -> {
                    String status = m.getSenderId().equals(userId)
                            ? ReceiptStatusCalculator.aggregate(messageStatusRepository.findByMessageId(m.getId()))
                            : null;
                    return MessageDto.from(m, status);
                })
                .toList();
    }

    @Transactional
    public MessageDto sendMessage(Long senderId, Long conversationId, String contentType, String body,
                                   String mediaUrl, Long replyToId, String clientTempId) {
        conversationService.assertMember(conversationId, senderId);

        ContentType type;
        try {
            type = ContentType.valueOf(contentType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("Invalid contentType");
        }

        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setContentType(type);
        message.setBody(body);
        message.setMediaUrl(mediaUrl);
        message.setReplyToId(replyToId);
        Message saved = messageRepository.save(message);

        conversationService.touchActivity(conversationId);

        List<Long> memberIds = memberRepository.findByConversationId(conversationId).stream()
                .map(ConversationMember::getUserId)
                .toList();

        for (Long recipientId : memberIds) {
            if (recipientId.equals(senderId)) {
                continue;
            }
            boolean online = presenceService.isOnline(recipientId);
            DeliveryStatus status = online ? DeliveryStatus.DELIVERED : DeliveryStatus.SENT;
            messageStatusRepository.save(new MessageStatus(saved.getId(), recipientId, conversationId, status));
        }

        String aggregateStatus = ReceiptStatusCalculator.aggregate(messageStatusRepository.findByMessageId(saved.getId()));
        MessageDto dto = MessageDto.from(saved, aggregateStatus);

        for (Long memberId : memberIds) {
            messagingTemplate.convertAndSendToUser(String.valueOf(memberId), "/queue/messages", dto);
        }
        messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/ack",
                new AckDto(clientTempId, MessageDto.from(saved, aggregateStatus, clientTempId)));

        long now = Instant.now().toEpochMilli();
        for (MessageStatus recipientStatus : messageStatusRepository.findByMessageId(saved.getId())) {
            if (recipientStatus.getStatus() == DeliveryStatus.DELIVERED) {
                messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/receipts",
                        new ReceiptDto(conversationId, saved.getId(), recipientStatus.getUserId(), "DELIVERED", now));
            }
        }

        return dto;
    }

    @Transactional
    public void markDeliveredForUser(Long userId) {
        List<MessageStatus> pending = messageStatusRepository.findByUserIdAndStatus(userId, DeliveryStatus.SENT);
        if (pending.isEmpty()) {
            return;
        }
        Instant now = Instant.now();
        Map<Long, Long> messageIdToSender = new HashMap<>();
        for (MessageStatus status : pending) {
            status.setStatus(DeliveryStatus.DELIVERED);
            status.setDeliveredAt(now);
        }
        messageStatusRepository.saveAll(pending);

        for (MessageStatus status : pending) {
            Long senderId = messageIdToSender.computeIfAbsent(status.getMessageId(),
                    id -> messageRepository.findById(id).map(Message::getSenderId).orElse(null));
            if (senderId == null) {
                continue;
            }
            messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/receipts",
                    new ReceiptDto(status.getConversationId(), status.getMessageId(), userId, "DELIVERED", now.toEpochMilli()));
        }
    }

    @Transactional
    public void markConversationRead(Long conversationId, Long userId) {
        conversationService.assertMember(conversationId, userId);
        List<MessageStatus> unread = messageStatusRepository
                .findByConversationIdAndUserIdAndStatusNot(conversationId, userId, DeliveryStatus.READ);
        if (unread.isEmpty()) {
            return;
        }
        Instant now = Instant.now();
        Map<Long, Long> messageIdToSender = new HashMap<>();
        for (MessageStatus status : unread) {
            status.setStatus(DeliveryStatus.READ);
            status.setReadAt(now);
        }
        messageStatusRepository.saveAll(unread);

        for (MessageStatus status : unread) {
            Long senderId = messageIdToSender.computeIfAbsent(status.getMessageId(),
                    id -> messageRepository.findById(id).map(Message::getSenderId).orElse(null));
            if (senderId == null) {
                continue;
            }
            messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/receipts",
                    new ReceiptDto(conversationId, status.getMessageId(), userId, "READ", now.toEpochMilli()));
        }
    }

    @Transactional
    public void deleteForEveryone(Long messageId, Long requesterId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getSenderId().equals(requesterId)) {
            throw new SecurityException("Only the sender can delete this message for everyone");
        }
        message.setDeleted(true);
        Message saved = messageRepository.save(message);

        String status = ReceiptStatusCalculator.aggregate(messageStatusRepository.findByMessageId(saved.getId()));
        MessageDto dto = MessageDto.from(saved, status);

        List<Long> memberIds = memberRepository.findByConversationId(saved.getConversationId()).stream()
                .map(ConversationMember::getUserId)
                .toList();
        for (Long memberId : memberIds) {
            messagingTemplate.convertAndSendToUser(String.valueOf(memberId), "/queue/messages", dto);
        }
    }
}
