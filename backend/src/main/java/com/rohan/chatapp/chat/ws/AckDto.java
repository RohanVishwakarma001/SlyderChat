package com.rohan.chatapp.chat.ws;

import com.rohan.chatapp.chat.MessageDto;

public record AckDto(String clientTempId, MessageDto message) {
}
