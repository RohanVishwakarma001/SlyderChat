# SlyderChat backend

Spring Boot 3.3.5 / Java 17 / STOMP WebSocket chat backend.

## Before running

Edit `src/main/resources/application.yml` (or set the env vars it reads) with:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — your NeonDB Postgres connection (JDBC URL must include `sslmode=require`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — your Cloudinary credentials
- `JWT_SECRET` — any random string 32+ characters long

`app.otp.dev-mode` is `true` by default, so OTP requests return the code in the response (`devOtp`) and log it — no SMS provider needed for local testing.

## Running

Requires JDK 17. This machine did not have Maven or JDK 17 installed globally, so both were downloaded locally during this build:

- Maven: `D:\tools\apache-maven-3.9.9`
- JDK 17: `D:\tools\jdk-17.0.19+10`

```
set JAVA_HOME=D:\tools\jdk-17.0.19+10
set PATH=%JAVA_HOME%\bin;D:\tools\apache-maven-3.9.9\bin;%PATH%
mvn spring-boot:run
```

Server starts on `:8080`. The React Native app's `src/config/env.js` points at this machine's LAN IP on port 8080 by default.

## Notes

- `ddl-auto: update` — tables are created/updated automatically on startup, no manual migrations needed.
- Only `/api/auth/**` and `/ws/**` are public; everything else requires `Authorization: Bearer <token>`.
- The SMS provider hook (`OtpService.sendSms`) is a stub — wire up MSG91/Twilio there before going to `dev-mode: false`.
