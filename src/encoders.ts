/**
 * Encodes a UTF-8 string into a byte array.
 *
 * @param str - Input string.
 * @returns UTF-8 encoded bytes as `Uint8Array`.
 */
export function utf8ToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * Decodes a byte array or buffer into a UTF-8 string.
 *
 * @param bytes - Input as `ArrayBuffer` or `ArrayBufferView`.
 * @returns Decoded UTF-8 string.
 * @throws If input is not an `ArrayBuffer` or `ArrayBufferView`.
 */
export function bytesToUtf8(bytes: ArrayBufferView | ArrayBuffer): string {
  if (!(bytes instanceof ArrayBuffer) && !ArrayBuffer.isView(bytes)) {
    throw new TypeError('bytesToUtf8 expects ArrayBuffer or ArrayBufferView')
  }

  const u8 =
    bytes instanceof ArrayBuffer
      ? new Uint8Array(bytes)
      : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  return new TextDecoder().decode(u8)
}

/**
 * Concatenates two byte arrays into a single array.
 *
 * @param a - First byte array.
 * @param b - Second byte array.
 * @returns A new `Uint8Array` containing both inputs.
 */
export function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length)
  out.set(a, 0)
  out.set(b, a.length)
  return out
}

/**
 * Encodes bytes into standard Base64 (not URL-safe).
 *
 * @param bytes - Input bytes.
 * @returns Base64 encoded string.
 */
export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

/**
 * Decodes a Base64 string into bytes.
 *
 * @param b64 - Base64 encoded string.
 * @returns Decoded bytes as `Uint8Array`.
 */
export function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Encodes bytes into URL-safe Base64 without padding.
 *
 * Replaces '+' -> '-', '/' -> '_' and strips trailing '='
 * in linear time without regex backtracking.
 *
 * @param bytes - Input bytes.
 * @returns URL-safe Base64 string.
 */
export function toBase64Url(bytes: Uint8Array): string {
  const b64 = toBase64(bytes)

  // Strip trailing '=' padding safely (no regex)
  let end = b64.length
  while (end > 0 && b64.charCodeAt(end - 1) === 61 /* '=' */) end--
  const noPad = b64.slice(0, end)

  // Translate characters in one pass
  const out: string[] = new Array(noPad.length)
  for (let i = 0; i < noPad.length; i++) {
    const ch = noPad.charCodeAt(i)
    out[i] = ch === 43 /* '+' */ ? '-' : ch === 47 /* '/' */ ? '_' : noPad[i]
  }
  return out.join('')
}

/**
 * Decodes a URL-safe Base64 string into bytes.
 *
 * @param b64url - URL-safe Base64 string.
 * @returns Decoded bytes as `Uint8Array`.
 */
export function fromBase64Url(b64url: string): Uint8Array {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64url.length + 3) % 4)
  return fromBase64(padded)
}
