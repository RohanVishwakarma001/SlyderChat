package com.rohan.chatapp.chat.ws;

public record TypingDto(Long conversationId, Long userId, boolean typing) {
}
