# SlyderChat

A WhatsApp-style chat app: an Expo/React Native client talking to a Spring Boot backend over REST and STOMP-over-WebSocket, backed by Postgres (NeonDB) and Cloudinary.

```
┌────────────────────┐        REST  (JWT)         ┌──────────────────────┐
│                    │ ───────────────────────────▶│                      │
│  frontend/         │                              │  backend/            │
│  Expo Router app    │◀─────────────────────────── │  Spring Boot 3.3     │
│  (iOS/Android/web) │      STOMP over WebSocket    │  (Java 17)           │
│                    │◀───────────────────────────▶│                      │
└────────────────────┘                              └──────────┬───────────┘
                                                                 │
                                                    ┌────────────┼────────────┐
                                                    ▼                         ▼
                                          ┌──────────────────┐    ┌──────────────────┐
                                          │  NeonDB           │    │  Cloudinary       │
                                          │  (Postgres)       │    │  (media storage)  │
                                          └──────────────────┘    └──────────────────┘
```

| | |
|---|---|
| **frontend/** | Expo Router React Native app — TypeScript, Zustand, `@stomp/stompjs` |
| **backend/**  | Spring Boot 3.3 / Java 17 — REST + WebSocket API, JPA/Hibernate, JWT auth |

Full docs for each half, including API/WebSocket protocol reference, architecture notes, and troubleshooting, live in their own READMEs:

- **[frontend/README.md](frontend/README.md)**
- **[backend/README.md](backend/README.md)**

## Quick start

```bash
# Backend — see backend/README.md for the config it needs first (DB, Cloudinary, JWT secret)
cd backend
mvn spring-boot:run

# Frontend — in another terminal
cd frontend
npm install
npx expo start
```

Point `frontend/src/config/env.js` at wherever the backend ends up running (LAN IP for local dev, a deployed URL otherwise) — see the frontend README's setup section for the emulator/simulator/device-specific rules.

## What's implemented

Auth (phone + OTP → JWT), 1:1 and group chat, live delivery/read receipts (✓ / ✓✓ / ✓✓ blue, correct even in groups), typing indicators, online/last-seen presence, image/video/audio/document messages via Cloudinary, reply-to, delete-for-everyone, contact sync from the device address book, and infinite-scroll pagination — all wired end-to-end between the two halves above.

The Calls, Updates/Status, and Communities tabs are intentionally left on static demo data — there's no backend for those in this build. See the frontend README for details.

## Deploying for free

Both halves have a free-tier path documented in their own READMEs:

- **Backend** → [Render](https://render.com)'s free web service tier (supports WebSockets; sleeps after 15 min idle) — see `backend/README.md#deployment-free-tier`.
- **Frontend** → [EAS Build](https://docs.expo.dev/build/introduction/)'s free tier produces a directly-installable Android APK (no Play Store needed) — see `frontend/README.md#building-a-release-apk-free-no-app-store`. iOS side-loading outside Expo Go needs a paid Apple Developer account either way.

## License

See [LICENSE](LICENSE).
