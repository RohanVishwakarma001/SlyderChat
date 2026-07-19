package com.rohan.chatapp.chat.ws;

public record ReceiptDto(Long conversationId, Long messageId, Long userId, String status, long at) {
}
