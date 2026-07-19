package com.rohan.chatapp.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users", indexes = {
        @jakarta.persistence.Index(name = "idx_users_phone", columnList = "phone", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String name;

    @Column(length = 250)
    private String about;

    private String avatarUrl;

    private Instant lastSeen;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
        if (this.about == null) {
            this.about = "Hey there! I am using SlyderChat.";
        }
        if (this.lastSeen == null) {
            this.lastSeen = Instant.now();
        }
    }
}
