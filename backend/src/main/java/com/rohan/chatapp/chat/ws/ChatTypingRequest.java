package com.rohan.chatapp.chat.ws;

public record ChatTypingRequest(Long conversationId, boolean typing) {
}
