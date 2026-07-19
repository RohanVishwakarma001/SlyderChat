package com.rohan.chatapp.auth;

import java.time.Instant;

class OtpEntry {
    final String code;
    final Instant expiresAt;
    int attempts;
    boolean used;

    OtpEntry(String code, Instant expiresAt) {
        this.code = code;
        this.expiresAt = expiresAt;
        this.attempts = 0;
        this.used = false;
    }

    boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
