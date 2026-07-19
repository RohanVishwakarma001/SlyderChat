package com.rohan.chatapp.chat;

import jakarta.validation.constraints.NotNull;

public record CreateDirectRequest(@NotNull Long userId) {
}
