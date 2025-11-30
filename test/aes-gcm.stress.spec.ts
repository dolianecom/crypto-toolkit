/**
 * Stress tests for AES-GCM cryptographic utilities.
 *
 * This suite validates AES-GCM performance and reliability under heavy load:
 * - Positive stress tests: very large plaintext, sequential and concurrent round-trips, password derivation
 * - Negative stress tests: corrupted large ciphertext, invalid inputs under stress
 *
 * These tests ensure the implementation remains correct and performant
 * under demanding scenarios.
 */

import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'

import { getCrypto } from '../src/env.js'
import { bytesToUtf8, decrypt, deriveKeyFromPassword, encrypt, importKey, randomIv, utf8ToBytes } from '../src/index.js'

const crypto = getCrypto()

/**
 * Helper: generate secure random bytes in chunks ≤ 65536.
 *
 * Ensures compatibility with WebCrypto's getRandomValues,
 * which limits maximum buffer size per call.
 *
 * @param totalLength - Total number of random bytes to generate.
 * @returns A Uint8Array filled with secure random values.
 */
function secureRandomBytes(totalLength: number): Uint8Array {
  const out = new Uint8Array(totalLength)
  let offset = 0
  while (offset < totalLength) {
    const chunkSize = Math.min(65536, totalLength - offset)
    crypto.getRandomValues(out.subarray(offset, offset + chunkSize))
    offset += chunkSize
  }
  return out
}

/**
 * Positive stress tests: very large plaintext.
 *
 * Validates round-trip correctness for 1MB payloads,
 * ensuring AES-GCM can handle large data sizes.
 */
describe('Stress: Large Plaintext', () => {
  test('round-trip with 1MB plaintext', async () => {
    const rawKey = secureRandomBytes(32)
    const key = await importKey(rawKey)
    const iv = randomIv()

    const pt = secureRandomBytes(1024 * 1024) // 1MB
    const { ciphertext } = await encrypt(key, pt, { iv })
    const out = await decrypt(key, iv, ciphertext)

    assert.deepStrictEqual(Array.from(out), Array.from(pt))
  })
})

/**
 * Positive stress tests: sequential round-trips.
 *
 * Ensures correctness across repeated encryption/decryption cycles
 * using the same key but different IVs.
 */
describe('Stress: Sequential Round-Trips', () => {
  test('100 sequential round-trips', async () => {
    const rawKey = secureRandomBytes(32)
    const key = await importKey(rawKey)

    for (let i = 0; i < 100; i++) {
      const iv = randomIv()
      const pt = utf8ToBytes('iteration-' + i)
      const { ciphertext } = await encrypt(key, pt, { iv })
      const out = await decrypt(key, iv, ciphertext)
      assert.strictEqual(bytesToUtf8(out), 'iteration-' + i)
    }
  })
})

/**
 * Positive stress tests: concurrent round-trips.
 *
 * Validates correctness when multiple encrypt/decrypt operations
 * run in parallel using the same key.
 */
describe('Stress: Concurrent Round-Trips', () => {
  test('50 concurrent round-trips', async () => {
    const rawKey = secureRandomBytes(32)
    const key = await importKey(rawKey)

    const tasks = Array.from({ length: 50 }, async (_, i) => {
      const iv = randomIv()
      const pt = utf8ToBytes('concurrent-' + i)
      const { ciphertext } = await encrypt(key, pt, { iv })
      const out = await decrypt(key, iv, ciphertext)
      assert.strictEqual(bytesToUtf8(out), 'concurrent-' + i)
    })

    await Promise.all(tasks)
  })
})

/**
 * Positive stress tests: password derivation.
 *
 * Ensures PBKDF2 with SHA-256 remains deterministic and performant
 * under repeated and large-scale derivations.
 */
describe('Stress: Password Derivation', () => {
  test('100 sequential derivations with same password+salt', async () => {
    const salt = secureRandomBytes(16)
    const password = 'stress-secret'
    let prevKey: Uint8Array | null = null

    for (let i = 0; i < 100; i++) {
      const key = await deriveKeyFromPassword(password, salt)
      if (prevKey) {
        assert.deepStrictEqual(Array.from(key), Array.from(prevKey))
      }
      prevKey = key
    }
  })

  test('different salts yield different keys under stress', async () => {
    const password = 'stress-secret'
    const salt1 = secureRandomBytes(16)
    const salt2 = secureRandomBytes(16)
    const k1 = await deriveKeyFromPassword(password, salt1)
    const k2 = await deriveKeyFromPassword(password, salt2)
    assert.notDeepStrictEqual(Array.from(k1), Array.from(k2))
  })
})

/**
 * Negative stress tests: corrupted ciphertext.
 *
 * Ensures decryption fails when large ciphertext are tampered.
 */
describe('Stress: Corrupted Ciphertext', () => {
  test('decryption fails with corrupted 256KB ciphertext', async () => {
    const rawKey = secureRandomBytes(32)
    const key = await importKey(rawKey)
    const iv = randomIv()

    const pt = secureRandomBytes(1024 * 256) // 256KB
    const { ciphertext } = await encrypt(key, pt, { iv })

    // Flip a bit in ciphertext
    ciphertext[0] ^= 0xff

    await assert.rejects(() => decrypt(key, iv, ciphertext))
  })
})
