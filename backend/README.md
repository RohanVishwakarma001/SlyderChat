# SlyderChat Backend

Spring Boot 3.3 / Java 17 REST + WebSocket API powering the SlyderChat mobile app: phone/OTP auth, direct + group messaging, WhatsApp-style delivery/read receipts, typing indicators, live presence, and media upload.

```
com.rohan.chatapp
├── auth          OTP request/verify, JWT issuance + validation
├── user          User profiles, contact sync
├── chat          Conversations, messages, delivery/read receipts (REST)
│   └── ws        The same, over STOMP (send/typing/read)
├── presence      Multi-session online/offline tracking, last-seen
├── media         Cloudinary upload
└── config        Security, WebSocket, CORS, exception handling
```

## Tech stack

| Concern            | Choice                                              |
|---------------------|------------------------------------------------------|
| Language / runtime  | Java 17                                              |
| Framework           | Spring Boot 3.3.5 (Web, WebSocket, Security, Data JPA, Validation) |
| Database            | PostgreSQL (NeonDB), via Hikari (`maximum-pool-size: 5`) |
| ORM                 | Spring Data JPA / Hibernate, `ddl-auto: update` (no manual migrations) |
| Realtime            | STOMP over WebSocket, in-process `SimpleBroker` (no external broker) |
| Auth                | Phone + OTP → JWT (`jjwt` 0.12.x, HS256, 30-day expiry) |
| Media               | Cloudinary (`cloudinary-http44`), 25MB multipart cap |
| Build               | Maven                                                |

## Project layout

```
backend/
├── pom.xml
├── src/main/java/com/rohan/chatapp/   (see package tree above)
└── src/main/resources/
    ├── application.yml.example         safe placeholder config (tracked in git)
    └── application.yml                 your real config (gitignored — never commit this)
```

## Prerequisites

- **JDK 17.** If you don't have it, download Eclipse Temurin 17 and point `JAVA_HOME` at it — don't rely on a newer JDK on PATH; Lombok's annotation processor is known to misbehave silently on very new JDKs (no error, just missing generated getters/setters), and `maven.compiler.release` is pinned to 17 anyway.
- **Maven.** Any recent 3.9.x.
- A **NeonDB** Postgres database (free tier is fine).
- A **Cloudinary** account (free tier is fine).

## Configuration

Copy the template and fill in your own values:

```bash
cp src/main/resources/application.yml.example src/main/resources/application.yml
```

| Property | Env var override | Notes |
|---|---|---|
| `spring.datasource.url` | `DB_URL` | Full **JDBC** URL — must literally start with `jdbc:postgresql://...`. NeonDB's dashboard gives you a plain `postgresql://user:pass@host/db?...` URI; you have to split that into `url` / `username` / `password` yourself and prefix the URL with `jdbc:`. Putting the raw value inside `${...}` (e.g. `${postgresql://...}`) is a common mistake — that syntax means "look up an env var with this name," not "use this literal string." |
| `spring.datasource.username` | `DB_USERNAME` | |
| `spring.datasource.password` | `DB_PASSWORD` | |
| `app.jwt.secret` | `JWT_SECRET` | HS256 key material — 32+ characters, random. |
| `app.jwt.expiration-ms` | — | Default 30 days (`2592000000`). |
| `app.otp.dev-mode` | — | `true` (default): OTP is logged **and** returned as `devOtp` in the `/request-otp` response — no SMS provider needed for local/dev testing. Set `false` for production once `OtpService.sendSms()` is wired to a real provider. |
| `app.cloudinary.cloud-name` / `api-key` / `api-secret` | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard. |

Either edit `application.yml` directly (fine for local dev) or export the env vars and leave the file's placeholders in place (better for deployment — see below).

## Running locally

```bash
export JAVA_HOME=/path/to/jdk-17
mvn spring-boot:run
```

Starts on `:8080`. First boot creates all tables automatically (`ddl-auto: update`). Sanity check:

```bash
curl -X POST http://localhost:8080/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'
# {"message":"OTP sent","devOtp":"123456"}
```

**Windows note:** if `mvn`/`java` aren't recognized, either install JDK 17 + Maven normally, or set them per-session:
```powershell
$env:JAVA_HOME = "C:\path\to\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;C:\path\to\apache-maven\bin;" + $env:PATH
```
(add both to your user PATH permanently via System Properties → Environment Variables to avoid repeating this every terminal session.)

## REST API reference

All endpoints except `/api/auth/**` require `Authorization: Bearer <jwt>`. Errors come back as `{"error": "message"}` with the appropriate status (400/403/404/500).

### Auth — `/api/auth`

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/request-otp` | `{ "phone": "+91..." }` (E.164) | `{ "message", "devOtp" }` | `devOtp` only populated when `app.otp.dev-mode: true`. 6-digit, SecureRandom, 5-min expiry, max 5 attempts, single-use. |
| POST | `/verify-otp` | `{ "phone", "otp", "name"? }` | `{ "token", "user" }` | Auto-registers new phone numbers. `name` used only on first registration. |

### Users — `/api/users`

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| GET | `/me` | — | `UserDto` | Current authenticated user. |
| PUT | `/me` | `{ "name"?, "about"?, "avatarUrl"? }` | `UserDto` | Partial update. |
| POST | `/sync` | `{ "phones": ["+91...", ...] }` | `UserDto[]` | Returns only the phones that are registered users — used for "contacts on SlyderChat." |
| GET | `/{id}` | — | `UserDto` | Includes a live `online` flag. |

`UserDto`: `{ id, phone, name, about, avatarUrl, lastSeen, online }`

### Conversations — `/api/conversations`

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| GET | `` | — | `ConversationSummaryDto[]` | Chat list: resolved name/avatar (direct = other user's), member ids, last message, unread count. Sorted by last activity. |
| POST | `/direct` | `{ "userId" }` | `ConversationSummaryDto` | Get-or-create — a `directKey` (`minId_maxId`) uniqueness constraint means the same pair of users can never end up with two direct conversations. |
| POST | `/group` | `{ "name", "memberIds": [...] }` | `ConversationSummaryDto` | Creator becomes `ADMIN`. |
| POST | `/{id}/members` | `{ "memberIds": [...] }` | 200 | Admin-only (403 otherwise). |
| DELETE | `/{id}/members/me` | — | 200 | Leave a group. |
| GET | `/{id}/messages` | query: `beforeId?`, `limit?` (default 50, capped 100) | `MessageDto[]` | Keyset pagination, newest-first. Omit `beforeId` for the first page. |
| POST | `/{id}/read` | — | 200 | Marks the whole conversation read for the caller; notifies senders over `/user/queue/receipts`. |
| DELETE | `/messages/{messageId}` | — | 200 | Delete-for-everyone. Sender only. Broadcast live to all members over `/user/queue/messages`. |

`ConversationSummaryDto`: `{ id, type, name, avatarUrl, memberIds, lastMessage, unreadCount, updatedAt }`
`MessageDto`: `{ id, conversationId, senderId, contentType, body, mediaUrl, replyToId, deleted, createdAt, status, clientTempId }`
— `status` is the aggregate delivery state for the sender's own message: `SENT` / `DELIVERED` / `READ` (in a group, `READ` only once **every** recipient has read it).

### Media — `/api/media`

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/upload` | multipart `file` | `{ url, publicId, resourceType, bytes }` |

Uploads to Cloudinary folder `chatapp`, `resource_type: auto` (images/video/audio/docs all accepted). 25MB cap.

## WebSocket protocol

Endpoint: `ws(s)://<host>/ws`. STOMP, native WebSocket (no SockJS). Auth happens on the STOMP `CONNECT` frame — send a native header `Authorization: Bearer <jwt>`; an invalid/missing token rejects the connection at that point (a `ChannelInterceptor` validates it before the session is accepted).

Broker prefixes: app destinations under `/app`, per-user destinations under `/user` (mapped internally to `/queue/...`), simple broker topics under `/queue` and `/topic`.

### Client → Server

| Destination | Payload | Effect |
|---|---|---|
| `/app/chat.send` | `{ conversationId, contentType, body?, mediaUrl?, replyToId?, clientTempId }` | Persists the message, computes per-recipient delivery status (online → `DELIVERED` instantly, offline → `SENT`), and fans out the three server→client events below. |
| `/app/chat.typing` | `{ conversationId, typing }` | Relayed to every other member of the conversation. |
| `/app/chat.read` | `{ conversationId }` | Bulk-marks the conversation read for the caller; notifies senders. |

### Server → Client (all per-user queues, i.e. `/user/queue/...`)

| Destination | Payload | When |
|---|---|---|
| `/user/queue/messages` | `MessageDto` | New message **or** an edit (delete-for-everyone) — pushed to every member of the conversation, including the sender. |
| `/user/queue/ack` | `{ clientTempId, message: MessageDto }` | Sent only to the sender, right after `/queue/messages` — lets the client swap its optimistic bubble for the real server-assigned id. |
| `/user/queue/receipts` | `{ conversationId, messageId, userId, status, at }` | Fired whenever *one recipient's* status on a message changes (`DELIVERED` or `READ`). The client aggregates these against the conversation's member list itself to decide the tick color (single/grey-double/blue-double). |
| `/user/queue/typing` | `{ conversationId, userId, typing }` | Someone else in the conversation started/stopped typing. |
| `/user/queue/presence` | `{ userId, online, lastSeen }` | A user you share a conversation with went online/offline. Fired on WS connect (first session) / disconnect (last session) — multi-device aware (a user with 2 devices connected only goes "offline" once both disconnect). |

Presence connect also **triggers a bulk delivery-status flush**: any messages that arrived while you were offline flip from `SENT` → `DELIVERED` the moment you reconnect, and your senders get `/queue/receipts` events for each.

## Data model

Plain `Long` foreign-key columns throughout (no JPA `@ManyToOne` relations) — kept intentionally simple/flat given the explicit indexing requirements below, and to avoid N+1 query traps.

| Entity | Key columns | Indexes |
|---|---|---|
| `User` | `phone` (unique) | `phone` |
| `Conversation` | `type`, `directKey` (unique, nullable), `lastActivityAt` | — |
| `ConversationMember` | `conversationId`, `userId`, `role` | unique `(conversationId, userId)` |
| `Message` | `conversationId`, `senderId`, `contentType`, `body`, `mediaUrl`, `replyToId`, `deleted` | `(conversationId, id)` composite |
| `MessageStatus` | `messageId`, `userId`, `conversationId`, `status`, `deliveredAt`, `readAt` | unique `(messageId, userId)`, `(userId, status)`, `messageId` |

## Deployment (free tier)

[Render](https://render.com) works well for this — supports long-running JVM processes and WebSockets, which rules out most serverless/functions-based free tiers.

**Render has no native Java/Maven runtime** (unlike Node/Python/Ruby/Go, which get Build Command / Start Command fields) — Java services there always go through Docker. A `Dockerfile` and `.dockerignore` are already included for exactly this.

1. Push this repo to GitHub. **`application.yml` is gitignored — it never leaves your machine as-is; the deployed service needs its config from environment variables instead** (see the Configuration table above for the exact var names).
2. Render → New → Web Service → connect the repo.
3. When it asks for environment/language, pick **Docker** (there's no Java option). Set:
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile`
   - **Docker Build Context Directory:** `.` (or leave the default — it follows Root Directory)

   These paths are relative to whatever Root Directory you set — since it's `backend`, the other two fields are just `Dockerfile` and `.`, not `backend/Dockerfile` again.
4. Set the env vars from the Configuration table above in Render's dashboard (Environment tab).
5. Deploy. Render injects its own `PORT` env var at runtime — `server.port: ${PORT:8080}` in `application.yml` already picks it up automatically, no changes needed.
6. Update the frontend's `src/config/env.js` to point at the resulting `https://your-service.onrender.com` URL (and its `wss://` equivalent for the socket).

Free-tier caveat: the service sleeps after ~15 minutes idle; the first request after a lull takes 30-60s to wake up while the container cold-starts. Fine for a demo/personal project, not for a "real" always-on backend — for that, look at a small always-on VM (e.g. Oracle Cloud's Always Free tier) instead.

### Building/running the Docker image locally (optional, to sanity-check before pushing)

```bash
docker build -t slyderchat-backend .
docker run -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://..." \
  -e DB_USERNAME="..." \
  -e DB_PASSWORD="..." \
  -e JWT_SECRET="..." \
  -e CLOUDINARY_CLOUD_NAME="..." \
  -e CLOUDINARY_API_KEY="..." \
  -e CLOUDINARY_API_SECRET="..." \
  slyderchat-backend
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `URL must start with 'jdbc'` on startup | Real DB URL was pasted inside `${...}` (treated as an env var *name*, not a value), or the `jdbc:` prefix was dropped | Use a literal value like `jdbc:postgresql://host/db?sslmode=require`, not `${jdbc:postgresql://...}` |
| `mvn`/`java` not recognized | PATH/`JAVA_HOME` set in one terminal session don't carry to a new window | Set them permanently (user-level env vars), not per-session, or re-export them in every new terminal |
| Lombok-generated methods (getters/setters) "don't exist" at compile time | Running on a JDK newer than Lombok's tested support (this has bitten very-new JDKs before) | Build with JDK 17 specifically, matching `maven.compiler.release` |
| `Address already in use` on port 8080 | A previous run is still alive | Find and stop it: (Windows) `Get-NetTCPConnection -LocalPort 8080 \| Stop-Process -Id { $_.OwningProcess } -Force` |
| Render asks for a "Dockerfile path" with no Build/Start Command fields | Render has no native Java runtime — Docker is the only option for JVM apps there | Use the included `Dockerfile` (path: `backend/Dockerfile`, context: `backend`) — see Deployment above |
| Service deployed fine but nothing responds / wrong port | Host platform injected its own `PORT` env var and the app ignored it | Already handled — `server.port: ${PORT:8080}` reads it automatically; don't hardcode `8080` back in |
