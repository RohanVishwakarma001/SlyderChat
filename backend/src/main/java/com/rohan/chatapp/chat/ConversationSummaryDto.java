package com.rohan.chatapp.chat;

import java.util.List;

public record ConversationSummaryDto(
        Long id,
        String type,
        String name,
        String avatarUrl,
        List<Long> memberIds,
        MessageDto lastMessage,
        long unreadCount,
        long updatedAt
) {
}
