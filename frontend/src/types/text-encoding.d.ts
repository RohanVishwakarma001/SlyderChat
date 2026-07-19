declare module 'text-encoding' {
  export class TextEncoder {
    constructor(encoding?: string, options?: { NONSTANDARD_allowLegacyEncoding?: boolean });
    encode(input?: string): Uint8Array;
  }
  export class TextDecoder {
    constructor(encoding?: string, options?: { NONSTANDARD_allowLegacyEncoding?: boolean; fatal?: boolean; ignoreBOM?: boolean });
    decode(input?: ArrayBuffer | ArrayBufferView, options?: { stream?: boolean }): string;
  }
}
