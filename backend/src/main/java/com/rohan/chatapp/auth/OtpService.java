package com.rohan.chatapp.auth;

import com.rohan.chatapp.config.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class OtpService {

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.dev-mode}")
    private boolean devMode;

    @Value("${app.otp.expiry-minutes}")
    private long expiryMinutes;

    @Value("${app.otp.max-attempts}")
    private int maxAttempts;

    public String generate(String phone) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES);
        store.put(phone, new OtpEntry(code, expiresAt));

        if (devMode) {
            log.info("[DEV-MODE] OTP for {} is {}", phone, code);
        } else {
            sendSms(phone, code);
        }
        return code;
    }

    public boolean isDevMode() {
        return devMode;
    }

    public void verify(String phone, String otp) {
        OtpEntry entry = store.get(phone);
        if (entry == null) {
            throw new BadRequestException("No OTP requested for this phone number");
        }
        if (entry.used) {
            throw new BadRequestException("OTP already used, please request a new one");
        }
        if (entry.isExpired()) {
            store.remove(phone);
            throw new BadRequestException("OTP expired, please request a new one");
        }
        if (entry.attempts >= maxAttempts) {
            store.remove(phone);
            throw new BadRequestException("Too many incorrect attempts, please request a new OTP");
        }
        if (!entry.code.equals(otp)) {
            entry.attempts++;
            throw new BadRequestException("Incorrect OTP");
        }
        entry.used = true;
        store.remove(phone);
    }

    // Prod-mode SMS hook. Wire up MSG91 / Twilio here.
    private void sendSms(String phone, String code) {
        // TODO(prod): integrate MSG91 or Twilio SMS API to deliver `code` to `phone`.
        log.info("SMS OTP dispatch requested for {} (provider not configured)", phone);
    }

    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void cleanupExpired() {
        store.entrySet().removeIf(e -> e.getValue().isExpired());
    }
}
