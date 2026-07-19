// Backend connection config.
//
//   Android emulator  -> http://10.0.2.2:8080     (emulator's alias for the host machine)
//   iOS simulator     -> http://localhost:8080
//   Physical device   -> http://<your-LAN-IP>:8080 (phone and dev machine on the same Wi-Fi)
//
// Defaulting to this machine's current LAN IP so a physical device works out of the box.
// If you're running on an emulator/simulator instead, change HOST below.
// If your LAN IP changes (new network, router reboot), run `ipconfig` (Windows) and
// update it here — look for the IPv4 Address under your active Wi-Fi/Ethernet adapter.

const HOST = '192.168.31.129';
const PORT = 8080;

export const API_BASE_URL = `http://${HOST}:${PORT}`;
export const WS_URL = `http://${HOST}:${PORT}`;
