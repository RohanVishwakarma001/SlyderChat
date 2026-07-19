// stompjs relies on TextEncoder/TextDecoder, which aren't available in the RN JS runtime.
// This must be imported before anything that touches @stomp/stompjs.
import { TextDecoder, TextEncoder } from 'text-encoding';

if (typeof (global as any).TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}
