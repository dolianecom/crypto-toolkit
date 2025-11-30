/**
 * Deterministic unit tests for AES-GCM cryptographic utilities.
 *
 * This suite validates:
 * - Positive deterministic tests: key import correctness, password-based key derivation determinism,
 *   IV generation properties, encryption/decryption round-trip correctness, support for AAD and tag length variations
 * - Negative deterministic tests: error handling for invalid inputs, wrong key/IV, and corrupted ciphertext
 *
 * Tests are organized into logical groups with JSDoc comments
 * for clarity and maintainability.
 */

import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'

import { getCrypto } from '../src/env.js'
import { bytesToUtf8, decrypt, deriveKeyFromPassword, encrypt, importKey, randomIv, utf8ToBytes } from '../src/index.js'

/**
 * Helper utility for tests.
 *
 * Converts a `Uint8Array` into a plain number array
 * so that assertions can use deep equality on simple arrays.
 *
 * @param u8 - Input byte array.
 * @returns Number array representation of the input.
 */
function toArray(u8: Uint8Array): number[] {
  return Array.from(u8)
}

/**
 * Positive deterministic tests: Key Import.
 *
 * Validates that 32-byte keys are accepted and shorter keys throw errors.
 */
describe('Key Import', () => {
  test('accepts valid 32-byte key', async () => {
    const raw = getCrypto().getRandomValues(new Uint8Array(32))
    const key = await importKey(raw)
    assert.ok(key)
  })

  test('throws on invalid key length', async () => {
    const raw = new Uint8Array(16)
    await assert.rejects(() => importKey(raw))
  })
})

/**
 * Positive deterministic tests: Password Derivation.
 *
 * Ensures PBKDF2 with SHA-256 produces deterministic keys
 * and that different salts yield different outputs.
 */
describe('Password Derivation', () => {
  test('same password+salt yields same key', async () => {
    const salt = new Uint8Array([1, 2, 3])
    const k1 = await deriveKeyFromPassword('secret', salt)
    const k2 = await deriveKeyFromPassword('secret', salt)
    assert.deepStrictEqual(toArray(k1), toArray(k2))
  })

  test('different salt yields different key', async () => {
    const k1 = await deriveKeyFromPassword('secret', new Uint8Array([1]))
    const k2 = await deriveKeyFromPassword('secret', new Uint8Array([2]))
    assert.notDeepStrictEqual(toArray(k1), toArray(k2))
  })
})

/**
 * Positive deterministic tests: IV Generation.
 *
 * Validates that IVs are 12 bytes long and random across calls.
 */
describe('IV Generation', () => {
  test('randomIv returns 12-byte array', () => {
    const iv = randomIv()
    assert.strictEqual(iv.length, 12)
  })

  test('two IVs are not identical', () => {
    const iv1 = randomIv()
    const iv2 = randomIv()
    assert.notDeepStrictEqual(toArray(iv1), toArray(iv2))
  })
})

/**
 * Positive deterministic tests: Encryption/Decryption.
 *
 * Covers round-trip correctness, AAD support, tag length variations,
 * and invalid IV length handling.
 */
describe('Encryption/Decryption', () => {
  test('round-trip encrypt/decrypt returns original plaintext', async () => {
    const raw = getCrypto().getRandomValues(new Uint8Array(32))
    const key = await importKey(raw)
    const iv = randomIv()
    const pt = utf8ToBytes('test message')
    const { ciphertext } = await encrypt(key, pt, { iv })
    const out = await decrypt(key, iv, ciphertext)
    assert.strictEqual(bytesToUtf8(out), 'test message')
  })

  test('supports AAD', async () => {
    const raw = getCrypto().getRandomValues(new Uint8Array(32))
    const key = await importKey(raw)
    const iv = randomIv()
    const pt = utf8ToBytes('authenticated')
    const aad = utf8ToBytes('extra')
    const { ciphertext } = await encrypt(key, pt, { iv, aad })
    const out = await decrypt(key, iv, ciphertext, { aad })
    assert.strictEqual(bytesToUtf8(out), 'authenticated')
  })

  test('throws on invalid IV length', async () => {
    const raw = getCrypto().getRandomValues(new Uint8Array(32))
    const key = await importKey(raw)
    const badIv = new Uint8Array(8)
    const pt = utf8ToBytes('oops')
    await assert.rejects(() => encrypt(key, pt, { iv: badIv }))
  })

  test('supports custom tag length', async () => {
    const raw = getCrypto().getRandomValues(new Uint8Array(32))
    const key = await importKey(raw)
    const iv = randomIv()
    const pt = utf8ToBytes('tag length test')
    const { ciphertext } = await encrypt(key, pt, { iv, tagLength: 96 })
    const out = await decrypt(key, iv, ciphertext, { tagLength: 96 })
    assert.strictEqual(bytesToUtf8(out), 'tag length test')
  })
})

/**
 * Negative deterministic tests: Error Handling.
 *
 * Ensures decryption fails with wrong key, wrong IV,
 * or corrupted ciphertext.
 */
describe('Error Handling', () => {
  test('decryption fails with wrong key', async () => {
    const crypto = getCrypto()
    const raw1 = crypto.getRandomValues(new Uint8Array(32))
    const raw2 = crypto.getRandomValues(new Uint8Array(32))
    const key1 = await importKey(raw1)
    const key2 = await importKey(raw2)

    const iv = randomIv()
    const pt = utf8ToBytes('secret')
    const { ciphertext } = await encrypt(key1, pt, { iv })

    await assert.rejects(() => decrypt(key2, iv, ciphertext))
  })

  test('decryption fails with wrong IV', async () => {
    const raw = getCrypto().getRandomValues(new Uint8Array(32))
    const key = await importKey(raw)

    const iv1 = randomIv()
    const iv2 = randomIv()
    const pt = utf8ToBytes('secret')
    const { ciphertext } = await encrypt(key, pt, { iv: iv1 })

    await assert.rejects(() => decrypt(key, iv2, ciphertext))
  })

  test('decryption fails with corrupted ciphertext', async () => {
    const raw = getCrypto().getRandomValues(new Uint8Array(32))
    const key = await importKey(raw)

    const iv = randomIv()
    const pt = utf8ToBytes('secret')
    const { ciphertext } = await encrypt(key, pt, { iv })

    // Flip a bit in ciphertext
    ciphertext[0] ^= 0xff

    await assert.rejects(() => decrypt(key, iv, ciphertext))
  })
})
