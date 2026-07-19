package com.rohan.chatapp.chat.ws;

public record ChatSendRequest(
        Long conversationId,
        String contentType,
        String body,
        String mediaUrl,
        Long replyToId,
        String clientTempId
) {
}
