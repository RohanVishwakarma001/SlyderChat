package com.rohan.chatapp.chat;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderByIdDesc(Long conversationId, Pageable pageable);

    List<Message> findByConversationIdAndIdLessThanOrderByIdDesc(Long conversationId, Long beforeId, Pageable pageable);

    Message findTopByConversationIdOrderByIdDesc(Long conversationId);
}
