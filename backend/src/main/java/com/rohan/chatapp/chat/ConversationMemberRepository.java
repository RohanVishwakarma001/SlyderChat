package com.rohan.chatapp.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {

    List<ConversationMember> findByUserId(Long userId);

    List<ConversationMember> findByConversationId(Long conversationId);

    Optional<ConversationMember> findByConversationIdAndUserId(Long conversationId, Long userId);

    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);

    void deleteByConversationIdAndUserId(Long conversationId, Long userId);

    long countByConversationId(Long conversationId);

    @Query("SELECT DISTINCT cm2.userId FROM ConversationMember cm1 " +
            "JOIN ConversationMember cm2 ON cm1.conversationId = cm2.conversationId " +
            "WHERE cm1.userId = :userId AND cm2.userId <> :userId")
    List<Long> findDistinctPartnerIds(@Param("userId") Long userId);
}
