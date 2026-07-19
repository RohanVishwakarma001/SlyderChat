package com.rohan.chatapp.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageStatusRepository extends JpaRepository<MessageStatus, Long> {

    Optional<MessageStatus> findByMessageIdAndUserId(Long messageId, Long userId);

    List<MessageStatus> findByMessageId(Long messageId);

    List<MessageStatus> findByUserIdAndStatus(Long userId, DeliveryStatus status);

    List<MessageStatus> findByConversationIdAndUserIdAndStatusNot(Long conversationId, Long userId, DeliveryStatus status);

    long countByConversationIdAndUserIdAndStatusNot(Long conversationId, Long userId, DeliveryStatus status);
}
