package com.rohan.chatapp.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "conversation_members", uniqueConstraints = {
        @UniqueConstraint(name = "uq_conversation_member", columnNames = {"conversation_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ConversationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    @Column(nullable = false, updatable = false)
    private Instant joinedAt;

    public ConversationMember(Long conversationId, Long userId, MemberRole role) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.role = role;
    }

    @jakarta.persistence.PrePersist
    void prePersist() {
        this.joinedAt = Instant.now();
    }
}
