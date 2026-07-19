// Backend connection config.
//
// Deployed backend (default): https://slyderchat-1.onrender.com
//
// For LOCAL dev against `mvn spring-boot:run` instead, swap BASE_URL below for:
//   Android emulator  -> http://10.0.2.2:8080     (emulator's alias for the host machine)
//   iOS simulator     -> http://localhost:8080
//   Physical device   -> http://<your-LAN-IP>:8080 (phone and dev machine on the same Wi-Fi —
//                        run `ipconfig` / `ifconfig` for the current IPv4 address)

const BASE_URL = 'https://slyderchat-1.onrender.com';

export const API_BASE_URL = BASE_URL;
export const WS_URL = BASE_URL;
