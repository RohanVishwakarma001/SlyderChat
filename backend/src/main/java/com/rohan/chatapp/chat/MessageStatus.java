package com.rohan.chatapp.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "message_status",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_message_status_message_user", columnNames = {"message_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_message_status_user_status", columnList = "user_id, status"),
                @Index(name = "idx_message_status_message_id", columnList = "message_id")
        })
@Getter
@Setter
@NoArgsConstructor
public class MessageStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    private Instant deliveredAt;

    private Instant readAt;

    public MessageStatus(Long messageId, Long userId, Long conversationId, DeliveryStatus status) {
        this.messageId = messageId;
        this.userId = userId;
        this.conversationId = conversationId;
        this.status = status;
        if (status == DeliveryStatus.DELIVERED) {
            this.deliveredAt = Instant.now();
        }
    }
}
