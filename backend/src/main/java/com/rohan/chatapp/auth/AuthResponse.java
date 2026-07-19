package com.rohan.chatapp.auth;

import com.rohan.chatapp.user.UserDto;

public record AuthResponse(String token, UserDto user) {
}
