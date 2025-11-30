/**
 * Fuzz tests for AES-GCM cryptographic utilities.
 *
 * This suite validates AES-GCM behavior under randomized inputs:
 * - Positive fuzz tests: random plaintext, Unicode strings, AAD/tag length variations, password derivation
 * - Negative fuzz tests: corrupted ciphertext, wrong key, wrong IV
 *
 * These tests aim to uncover edge cases and ensure robustness
 * beyond deterministic unit tests.
 */

import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'

import { getCrypto } from '../src/env.js'
import { bytesToUtf8, decrypt, deriveKeyFromPassword, encrypt, importKey, randomIv, utf8ToBytes } from '../src/index.js'

const crypto = getCrypto()

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
 * Positive fuzz tests: randomized plaintext.
 *
 * Ensures that arbitrary byte arrays can be encrypted and
 * decrypted correctly across multiple iterations.
 */
describe('Fuzz: Random Plaintext', () => {
  test('round-trip with random byte arrays', async () => {
    for (let i = 0; i < 20; i++) {
      const len = crypto.getRandomValues(new Uint8Array(1))[0] % 256
      const pt = crypto.getRandomValues(new Uint8Array(len))

      const rawKey = crypto.getRandomValues(new Uint8Array(32))
      const key = await importKey(rawKey)
      const iv = randomIv()

      const { ciphertext } = await encrypt(key, pt, { iv })
      const out = await decrypt(key, iv, ciphertext)

      assert.deepStrictEqual(toArray(out), toArray(pt))
    }
  })
})

/**
 * Positive fuzz tests: randomized Unicode strings.
 *
 * Validates that arbitrary strings (including non-ASCII characters)
 * can be round-tripped through AES-GCM encryption/decryption.
 */
describe('Fuzz: Random Strings', () => {
  test('round-trip with random Unicode strings', async () => {
    for (let i = 0; i < 20; i++) {
      const len = crypto.getRandomValues(new Uint8Array(1))[0] % 32
      const chars: string[] = []
      for (let j = 0; j < len; j++) {
        const code = crypto.getRandomValues(new Uint8Array(1))[0]
        chars.push(String.fromCharCode(code))
      }
      const str = chars.join('')

      const rawKey = crypto.getRandomValues(new Uint8Array(32))
      const key = await importKey(rawKey)
      const iv = randomIv()

      const { ciphertext } = await encrypt(key, utf8ToBytes(str), { iv })
      const out = await decrypt(key, iv, ciphertext)

      assert.strictEqual(bytesToUtf8(out), str)
    }
  })
})

/**
 * Positive fuzz tests: AAD and tag length variations.
 *
 * Ensures AES-GCM supports randomized AAD values and
 * different tag lengths across multiple iterations.
 */
describe('Fuzz: AAD and Tag Lengths', () => {
  test('round-trip with random AAD and tag lengths', async () => {
    const tagLengths = [96, 104, 112, 120, 128]
    for (let i = 0; i < 10; i++) {
      const rawKey = crypto.getRandomValues(new Uint8Array(32))
      const key = await importKey(rawKey)
      const iv = randomIv()
      const pt = crypto.getRandomValues(new Uint8Array(32))
      const aad = crypto.getRandomValues(new Uint8Array(8))
      const tagLength = tagLengths[i % tagLengths.length]

      const { ciphertext } = await encrypt(key, pt, { iv, aad, tagLength })
      const out = await decrypt(key, iv, ciphertext, { aad, tagLength })

      assert.deepStrictEqual(toArray(out), toArray(pt))
    }
  })
})

/**
 * Positive fuzz tests: password derivation.
 *
 * Ensures PBKDF2 with SHA-256 produces deterministic keys
 * for identical inputs and variability for different salts/passwords.
 */
describe('Fuzz: Password Derivation', () => {
  test('same password+salt yields same key', async () => {
    for (let i = 0; i < 10; i++) {
      const salt = crypto.getRandomValues(new Uint8Array(8))
      const k1 = await deriveKeyFromPassword('secret-' + i, salt)
      const k2 = await deriveKeyFromPassword('secret-' + i, salt)
      assert.deepStrictEqual(toArray(k1), toArray(k2))
    }
  })

  test('different salt yields different key', async () => {
    const password = 'constant'
    const salt1 = crypto.getRandomValues(new Uint8Array(8))
    const salt2 = crypto.getRandomValues(new Uint8Array(8))
    const k1 = await deriveKeyFromPassword(password, salt1)
    const k2 = await deriveKeyFromPassword(password, salt2)
    assert.notDeepStrictEqual(toArray(k1), toArray(k2))
  })

  test('different password yields different key', async () => {
    const salt = crypto.getRandomValues(new Uint8Array(8))
    const k1 = await deriveKeyFromPassword('alpha', salt)
    const k2 = await deriveKeyFromPassword('beta', salt)
    assert.notDeepStrictEqual(toArray(k1), toArray(k2))
  })
})

/**
 * Negative fuzz tests: corrupted ciphertext.
 *
 * Validates that tampered ciphertext fails decryption.
 */
describe('Fuzz: Corrupted Ciphertext', () => {
  test('decryption fails when ciphertext is corrupted', async () => {
    const rawKey = crypto.getRandomValues(new Uint8Array(32))
    const key = await importKey(rawKey)
    const iv = randomIv()
    const pt = utf8ToBytes('fuzz corruption')
    const { ciphertext } = await encrypt(key, pt, { iv })

    // Flip a bit in ciphertext
    ciphertext[0] ^= 0xff

    await assert.rejects(() => decrypt(key, iv, ciphertext))
  })
})

/**
 * Negative fuzz tests: wrong key.
 *
 * Ensures decryption fails when using a different key.
 */
describe('Fuzz: Wrong Key', () => {
  test('decryption fails with wrong key', async () => {
    for (let i = 0; i < 10; i++) {
      const raw1 = crypto.getRandomValues(new Uint8Array(32))
      const raw2 = crypto.getRandomValues(new Uint8Array(32))
      const key1 = await importKey(raw1)
      const key2 = await importKey(raw2)

      const iv = randomIv()
      const pt = crypto.getRandomValues(new Uint8Array(16))
      const { ciphertext } = await encrypt(key1, pt, { iv })

      await assert.rejects(() => decrypt(key2, iv, ciphertext))
    }
  })
})

/**
 * Negative fuzz tests: wrong IV.
 *
 * Ensures decryption fails when using a different IV.
 */
describe('Fuzz: Wrong IV', () => {
  test('decryption fails with wrong IV', async () => {
    for (let i = 0; i < 10; i++) {
      const raw = crypto.getRandomValues(new Uint8Array(32))
      const key = await importKey(raw)

      const iv1 = randomIv()
      const iv2 = randomIv()
      const pt = crypto.getRandomValues(new Uint8Array(16))
      const { ciphertext } = await encrypt(key, pt, { iv: iv1 })

      await assert.rejects(() => decrypt(key, iv2, ciphertext))
    }
  })
})
