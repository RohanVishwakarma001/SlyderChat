package com.rohan.chatapp.chat;

public record MessageDto(
        Long id,
        Long conversationId,
        Long senderId,
        String contentType,
        String body,
        String mediaUrl,
        Long replyToId,
        boolean deleted,
        long createdAt,
        String status,
        String clientTempId
) {
    public static MessageDto from(Message message, String status) {
        return from(message, status, null);
    }

    public static MessageDto from(Message message, String status, String clientTempId) {
        boolean deleted = message.isDeleted();
        return new MessageDto(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getContentType().name(),
                deleted ? null : message.getBody(),
                deleted ? null : message.getMediaUrl(),
                message.getReplyToId(),
                deleted,
                message.getCreatedAt().toEpochMilli(),
                status,
                clientTempId
        );
    }
}
