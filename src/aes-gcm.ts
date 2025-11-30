import { getCrypto } from './env.js'

export type AesGcmKey = CryptoKey

/**
 * Options for AES-GCM encryption and decryption.
 */
export interface AesGcmOptions {
  /**
   * Initialization vector (IV).
   * Recommended length: 12 bytes (default enforced).
   */
  iv?: Uint8Array

  /**
   * Optional additional authenticated data (AAD).
   */
  aad?: Uint8Array

  /**
   * Tag length in bits.
   * Allowed values: 96, 104, 112, 120, 128.
   * Default: 128.
   */
  tagLength?: number
}

/** Default IV length in bytes for AES-GCM (12). */
export const DEFAULT_IV_BYTES = 12

/** Default authentication tag length in bits for AES-GCM (128). */
export const DEFAULT_TAG_BITS = 128

/**
 * Imports a raw 32-byte key as a `CryptoKey` for AES-GCM.
 *
 * @param rawKey - Raw key material (must be 32 bytes for AES-256).
 * @returns A `CryptoKey` usable for AES-GCM encryption/decryption.
 * @throws If the key length is not 32 bytes.
 */
export async function importKey(rawKey: Uint8Array): Promise<AesGcmKey> {
  if (rawKey.length !== 32) {
    throw new Error('AES-GCM requires 32-byte key (AES-256)')
  }
  const crypto = getCrypto()

  const keyData = rawKey.slice()

  return await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
}

/**
 * Derives a 32-byte key from a password using PBKDF2 with SHA-256.
 *
 * @param password - Input password string.
 * @param salt - Unique, random salt (must be supplied per secret).
 * @param iterations - Number of PBKDF2 iterations (default: 150,000).
 * @returns A derived 32-byte key as `Uint8Array`.
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations = 150_000,
): Promise<Uint8Array> {
  const crypto = getCrypto()
  const enc = new TextEncoder()

  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])

  const saltBuf = salt.slice()

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuf as BufferSource, iterations },
    baseKey,
    256,
  )

  return new Uint8Array(bits)
}

/**
 * Generates a secure random IV of 12 bytes.
 *
 * @returns A random 12-byte `Uint8Array`.
 */
export function randomIv(): Uint8Array {
  const crypto = getCrypto()
  const iv = new Uint8Array(DEFAULT_IV_BYTES)
  crypto.getRandomValues(iv)
  return iv
}

/**
 * Encrypts plaintext using AES-GCM.
 *
 * @param key - AES-GCM key (`CryptoKey`).
 * @param plaintext - Data to encrypt.
 * @param opts - Optional AES-GCM parameters (IV, AAD, tag length).
 * @returns An object containing the IV and ciphertext (with tag).
 * @throws If IV length is not 12 bytes.
 */
export async function encrypt(
  key: AesGcmKey,
  plaintext: Uint8Array,
  opts: AesGcmOptions = {},
): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const crypto = getCrypto()
  const iv = opts.iv ?? randomIv()
  if (iv.length !== DEFAULT_IV_BYTES) {
    throw new Error('AES-GCM IV must be 12 bytes')
  }
  const tagLength = opts.tagLength ?? DEFAULT_TAG_BITS

  const params: AesGcmParams = {
    name: 'AES-GCM',
    iv: iv as BufferSource,
    additionalData: opts.aad as BufferSource | undefined,
    tagLength,
  }
  const ct = await crypto.subtle.encrypt(params, key, plaintext as BufferSource)
  return { iv, ciphertext: new Uint8Array(ct) }
}

/**
 * Decrypts ciphertext using AES-GCM.
 *
 * @param key - AES-GCM key (`CryptoKey`).
 * @param iv - Initialization vector (must be 12 bytes).
 * @param ciphertext - Encrypted data (includes tag).
 * @param opts - Optional AES-GCM parameters (AAD, tag length).
 * @returns The decrypted plaintext as `Uint8Array`.
 * @throws If IV length is not 12 bytes.
 */
export async function decrypt(
  key: AesGcmKey,
  iv: Uint8Array,
  ciphertext: Uint8Array,
  opts: Omit<AesGcmOptions, 'iv'> = {},
): Promise<Uint8Array> {
  const crypto = getCrypto()
  if (iv.length !== DEFAULT_IV_BYTES) {
    throw new Error('AES-GCM IV must be 12 bytes')
  }
  const tagLength = opts.tagLength ?? DEFAULT_TAG_BITS

  const params: AesGcmParams = {
    name: 'AES-GCM',
    iv: iv as BufferSource,
    additionalData: opts.aad as BufferSource | undefined,
    tagLength,
  }
  const pt = await crypto.subtle.decrypt(params, key, ciphertext as BufferSource)
  return new Uint8Array(pt)
}
