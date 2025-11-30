import { webcrypto } from 'node:crypto'

/**
 * Returns a `Crypto` implementation.
 *
 * - Uses `globalThis.crypto` if available (browser environments).
 * - Falls back to Node.js `webcrypto` when running outside the browser.
 *
 * @returns A `Crypto` instance for cryptographic operations.
 */
export function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== 'undefined') {
    return globalThis.crypto as Crypto
  }
  return webcrypto as unknown as Crypto
}
