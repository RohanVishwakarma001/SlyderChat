package com.rohan.chatapp.chat;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AddMembersRequest(@NotEmpty List<Long> memberIds) {
}
