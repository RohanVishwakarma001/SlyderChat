# SlyderChat

A WhatsApp-style chat app: an Expo/React Native client and a Spring Boot backend.

```
frontend/   Expo Router React Native app (TypeScript, Zustand, STOMP over WebSocket)
backend/    Spring Boot 3.3 / Java 17 REST + WebSocket API
```

## Frontend

```bash
cd frontend
npm install
npx expo start
```

See `frontend/src/config/env.js` for the backend URL the app connects to (defaults to this machine's LAN IP on port 8080).

## Backend

```bash
cd backend
mvn spring-boot:run
```

Requires Java 17 and NeonDB/Cloudinary credentials — see `backend/README.md` for what to configure before running.
