/**
 * Stress tests for encoding utilities.
 *
 * This suite validates performance and scalability of UTF-8, Base64,
 * Base64Url, and byte concatenation helpers under heavy workloads:
 * - Positive stress tests: round-trip correctness with very large inputs, repeated operations
 * - Negative stress tests: error handling for malformed or invalid large inputs
 *
 * It focuses on megabyte-scale workloads to ensure correctness, stability, and resilience under stress.
 */

import { strict as assert } from 'node:assert'
import { describe, test } from 'node:test'

import {
  bytesToUtf8,
  concatBytes,
  fromBase64,
  fromBase64Url,
  toBase64,
  toBase64Url,
  utf8ToBytes,
} from '../src/encoders.js'

// Use crypto for secure random byte generation (browser or Node)
const crypto = globalThis.crypto ?? (await import('node:crypto')).webcrypto

/**
 * Helper: generate secure random bytes in chunks ≤ 65536.
 *
 * Ensures compatibility with WebCrypto's getRandomValues,
 * which limits maximum buffer size per call.
 *
 * @param totalLength - Total number of random bytes to generate.
 * @returns A Uint8Array filled with random bytes.
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
 * Positive stress tests: UTF-8 Encoding/Decoding.
 *
 * Validates round-trip correctness with very large strings (1MB).
 */
describe('UTF-8 stress (Positive)', () => {
  test('large UTF-8 string round-trip (1MB)', () => {
    const str = 'x'.repeat(1024 * 1024) // 1MB string
    const bytes = utf8ToBytes(str)
    const decoded = bytesToUtf8(bytes)
    assert.strictEqual(decoded, str)
  })
})

/**
 * Negative stress tests: UTF-8 Encoding/Decoding.
 *
 * Ensures invalid input types throw even under stress conditions.
 */
describe('UTF-8 stress (Negative)', () => {
  test('bytesToUtf8 invalid input types throw', () => {
    const badInputs = [123, true, {}, 'string']
    for (const bad of badInputs) {
      assert.throws(
        () => {
          // @ts-expect-error intentionally wrong type
          bytesToUtf8(bad)
        },
        { name: 'TypeError', message: /expects ArrayBuffer/i },
      )
    }
  })
})

/**
 * Positive stress tests: Base64 Encoding/Decoding.
 *
 * Validates round-trip correctness with large random byte arrays (1MB).
 */
describe('Base64 stress (Positive)', () => {
  test('large Base64 round-trip (1MB)', () => {
    const data = secureRandomBytes(1024 * 1024)
    const b64 = toBase64(data)
    const decoded = fromBase64(b64)
    assert.deepStrictEqual(Array.from(decoded), Array.from(data))
  })
})

/**
 * Negative stress tests: Base64 Encoding/Decoding.
 *
 * Ensures malformed large strings throw errors.
 */
describe('Base64 stress (Negative)', () => {
  test('malformed large base64 strings throw', () => {
    const bad = '%%%'.repeat(1000) // deliberately invalid and oversized
    assert.throws(() => fromBase64(bad), {
      name: 'InvalidCharacterError',
      message: /Invalid character/i,
    })
  })
})

/**
 * Positive stress tests: Base64Url Encoding/Decoding.
 *
 * Validates round-trip correctness with large random byte arrays (1MB).
 */
describe('Base64Url stress (Positive)', () => {
  test('large Base64URL round-trip (1MB)', () => {
    const data = secureRandomBytes(1024 * 1024)
    const b64url = toBase64Url(data)
    const decoded = fromBase64Url(b64url)
    assert.deepStrictEqual(Array.from(decoded), Array.from(data))
  })
})

/**
 * Negative stress tests: Base64Url Encoding/Decoding.
 *
 * Ensures malformed large strings throw errors.
 */
describe('Base64Url stress (Negative)', () => {
  test('malformed large base64url strings throw', () => {
    const bad = '%%%'.repeat(1000) // deliberately invalid and oversized
    assert.throws(() => fromBase64Url(bad), {
      name: 'InvalidCharacterError',
      message: /Invalid character/i,
    })
  })
})

/**
 * Positive stress tests: concatBytes.
 *
 * Validates concatenation correctness with very large arrays (512KB each).
 */
describe('concatBytes stress (Positive)', () => {
  test('concatBytes with large arrays (512KB + 512KB)', () => {
    const a = secureRandomBytes(512 * 1024)
    const b = secureRandomBytes(512 * 1024)
    const out = concatBytes(a, b)

    // Verify first half equals `a`
    assert.deepStrictEqual(Array.from(out.slice(0, a.length)), Array.from(a))
    // Verify second half equals `b`
    assert.deepStrictEqual(Array.from(out.slice(a.length)), Array.from(b))
  })
})
