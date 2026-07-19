package com.rohan.chatapp.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RequestOtpRequest(
        @NotBlank
        @Pattern(regexp = "^\\+[1-9]\\d{6,14}$", message = "must be a valid E.164 phone number")
        String phone
) {
}
