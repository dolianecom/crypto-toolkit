/**
 * AES-GCM cryptographic utilities.
 *
 * Provides functions for key import, password-based key derivation,
 * encryption, decryption, and IV generation.
 */
export {
  decrypt,
  DEFAULT_IV_BYTES,
  DEFAULT_TAG_BITS,
  deriveKeyFromPassword,
  encrypt,
  importKey,
  randomIv,
} from './aes-gcm.js'

/**
 * Exported types for AES-GCM operations.
 *
 * - `AesGcmKey`: Alias for `CryptoKey` used in AES-GCM.
 * - `AesGcmOptions`: Options for encryption/decryption (IV, AAD, tag length).
 */
export type { AesGcmKey, AesGcmOptions } from './aes-gcm.js'

/**
 * Encoding and decoding utilities.
 *
 * Includes UTF-8 conversion, Base64 (standard and URL-safe),
 * and byte array concatenation helpers.
 */
export { bytesToUtf8, concatBytes, fromBase64, fromBase64Url, toBase64, toBase64Url, utf8ToBytes } from './encoders.js'
