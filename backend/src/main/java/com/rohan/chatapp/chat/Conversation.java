package com.rohan.chatapp.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationType type;

    private String name;

    private String avatarUrl;

    private Long createdBy;

    @Column(unique = true)
    private String directKey;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant lastActivityAt;

    @jakarta.persistence.PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
        this.lastActivityAt = this.createdAt;
    }

    public static String directKey(Long userIdA, Long userIdB) {
        long min = Math.min(userIdA, userIdB);
        long max = Math.max(userIdA, userIdB);
        return min + "_" + max;
    }
}
