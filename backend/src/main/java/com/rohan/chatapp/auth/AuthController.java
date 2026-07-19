package com.rohan.chatapp.auth;

import com.rohan.chatapp.user.User;
import com.rohan.chatapp.user.UserDto;
import com.rohan.chatapp.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final OtpService otpService;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/request-otp")
    public RequestOtpResponse requestOtp(@Valid @RequestBody RequestOtpRequest request) {
        String code = otpService.generate(request.phone());
        return new RequestOtpResponse(
                "OTP sent",
                otpService.isDevMode() ? code : null
        );
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        otpService.verify(request.phone(), request.otp());
        User user = userService.findOrCreateByPhone(request.phone(), request.name());
        String token = jwtService.generateToken(user.getId());
        UserDto dto = userService.getDto(user.getId());
        return new AuthResponse(token, dto);
    }
}
