package com.rohan.chatapp.presence;

public record PresenceDto(Long userId, boolean online, Long lastSeen) {
}
