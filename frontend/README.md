# SlyderChat Frontend

A WhatsApp-style chat client built with Expo Router + React Native, talking to the [SlyderChat backend](../backend/README.md) over REST and STOMP-over-WebSocket.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 / React 19 |
| Routing | Expo Router (file-based, typed routes) |
| State | Zustand (persisted via AsyncStorage where noted) |
| Networking | axios (REST), `@stomp/stompjs` (realtime) |
| Styling | Hand-rolled theme system (`src/theme`), no UI kit |
| Native features | `expo-contacts`, `expo-image-picker`, `expo-document-picker`, `expo-haptics` |

## Project structure

```
src/
├── app/                 Expo Router screens (file-based routing)
│   ├── (tabs)/          Chats, Updates, Calls, Communities, Settings
│   ├── chat/[id].tsx     The chat screen — history, send, receipts, typing, reply, media
│   ├── contact-info/     Contact detail
│   ├── group-info/       Group detail — members, add/leave
│   ├── settings/          Profile edit + assorted settings sub-screens
│   ├── welcome.tsx, phone-input.tsx, otp.tsx    Onboarding/auth flow
│   └── new-chat.tsx, new-group-setup.tsx
├── api/client.js         axios instance — attaches JWT from AsyncStorage, handles 401 → logout
├── services/
│   ├── socket.js          Single STOMP client — connect/disconnect/send/typing/read
│   └── socketBridge.ts    Wires incoming STOMP frames into the zustand stores below
├── store/
│   ├── authStore.ts       Auth/session state + actions (requestOtp, verifyOtp, bootstrap, signOut)
│   ├── chatsStore.ts       Conversations + messages: fetch, optimistic send, receipts, pagination
│   ├── presenceStore.ts   Ephemeral online/last-seen/typing state (not persisted)
│   ├── usersStore.ts      Cache of known users (demo contacts + real synced contacts merged)
│   └── settingsStore.ts   Local-only app preferences
├── components/            Presentational components (MessageBubble, ChatRow, Composer, ...)
├── config/
│   ├── env.js             API_BASE_URL / WS_URL — see below
│   └── storageKeys.js
├── data/                  Static/demo data for the out-of-scope tabs (see below) + shared types
├── theme/, hooks/, utils/
```

## Prerequisites

- Node.js
- The [backend](../backend/README.md) running somewhere reachable — either on your LAN for local dev, or deployed (see its README's deployment section).
- Expo Go (from your device's app store) for the fastest dev loop — no native build needed unless you want a standalone install (see **Building a release APK** below).

## Setup

```bash
npm install
```

Then point the app at your backend — edit `src/config/env.js`:

```js
const HOST = '192.168.31.129';  // <- change this
const PORT = 8080;
```

| Where you're running | `HOST` should be |
|---|---|
| Physical device (Expo Go) | Your dev machine's LAN IP (run `ipconfig` / `ifconfig`, both devices on the same Wi-Fi) |
| Android emulator | `10.0.2.2` (the emulator's alias for the host machine) |
| iOS simulator | `localhost` |
| Deployed backend | Its public URL, e.g. `your-service.onrender.com` |

## Running

```bash
npx expo start
```

Press `a` (Android emulator), `i` (iOS simulator, Mac only), or `w` (web), or scan the QR code with Expo Go on a physical device.

If something looks broken after pulling changes or after moving files around and you can't explain why (blank screens, unresponsive buttons, no errors shown) — clear the Metro cache first before assuming it's a real bug:

```bash
npx expo start -c
```

(and fully close + reopen Expo Go on the device — backgrounding isn't enough).

## How the pieces fit together

**Auth.** `welcome.tsx` → `phone-input.tsx` (calls `requestOtp`, dev-mode auto-fills the OTP from the backend's `devOtp` response) → `otp.tsx` (calls `verifyOtp`, stores the JWT, connects the socket) → `(tabs)/chats`. On cold start, `app/index.tsx` calls `authStore.bootstrap()`, which validates any stored token against `GET /api/users/me` before deciding where to route.

**Realtime.** `services/socket.js` owns a single STOMP client (connected once, on login/bootstrap). `services/socketBridge.ts` is a one-time side-effect import (from `app/_layout.tsx`) that subscribes the incoming-message/ack/receipt/typing/presence handlers to `chatsStore`/`presenceStore`/`usersStore` — this indirection exists specifically to avoid a socket↔store import cycle.

**Sending a message** is optimistic: `chatsStore.sendMessage` immediately renders a `pending` bubble with a `clientTempId`, publishes over the socket, then reconciles it against either the `/queue/ack` event (matched by `clientTempId`) or the `/queue/messages` broadcast (matched by sender + oldest-pending-bubble) — whichever arrives first. Both paths converge on the same real message id, so there's no dependency on ordering between the two events.

**Receipts.** Individual `/queue/receipts` events (one recipient's status at a time) are tracked per-message in `chatsStore.receiptsByMessage` and compared against the conversation's `memberIds` to compute the aggregate tick state client-side — this is how a group chat's tick only goes blue once *every* member has read it.

## What's actually wired up vs. demo-only

The backend only implements auth, users, conversations/messages, presence, and media — so that's what got fully wired. The **Calls**, **Updates/Status**, and **Communities** tabs have no backend counterpart in this build and still run on their original static demo data (`src/data/demoContacts.ts`, `calls.ts`, `statuses.ts`, `communities.ts`) — this is intentional, not an oversight.

Also simplified: the mic button in the chat composer opens a file picker (`expo-document-picker`, `audio/*`) rather than an actual voice recorder — sending pre-recorded audio files works, but there's no waveform/record-in-app UI.

## Building a release APK (free, no app store)

Uses [EAS Build](https://docs.expo.dev/build/introduction/)'s free tier — builds happen in Expo's cloud, no local Android SDK required.

```bash
npx eas-cli login          # free expo.dev account
npx eas-cli build --platform android --profile preview
```

The `preview` profile (see `eas.json`) is configured for a directly-installable `.apk` rather than the Play-Store-only `.aab`. When the build finishes you get a download link — anyone can install it on Android by opening that link and allowing "install from unknown sources" once. **Point `env.js` at your deployed backend before building** — an APK baked with a LAN IP only works on your own network.

iOS side-loading outside the App Store requires a paid Apple Developer account ($99/yr) — there's no free equivalent to Android's "just install the APK."

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Button taps do nothing, no error shown | Stale Metro cache, especially after big file moves/refactors | `npx expo start -c`, fully close + reopen Expo Go |
| `tsc` fails on a `.js` file with a missing types error | A plain-JS module (`socket.js`, `client.js`) is imported from `.ts` without type info | Add a `.d.ts` declaration or JSDoc annotations — see `src/types/text-encoding.d.ts` for the pattern |
| WebSocket never connects on device | `env.js` `HOST` is wrong for the platform, or the backend isn't reachable from the phone's network | Check the HOST table above; confirm the backend is actually reachable at that address from the phone's browser first |
| App can't find your contacts / registered users list is empty | Contacts permission denied, or those contacts' phone numbers aren't registered on SlyderChat | Re-check the permission prompt; `toE164()` (`src/utils/phone.ts`) assumes India (+91) for bare 10-digit numbers — adjust if you're testing with other-country numbers |
