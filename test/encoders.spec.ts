/**
 * Deterministic unit tests for encoding utilities.
 *
 * This suite validates:
 * - Positive deterministic tests: round-trip correctness for UTF-8, Base64, Base64Url, and byte concatenation helpers;
 *   edge cases such as padding and empty arrays; non-ASCII scripts; performance with large inputs
 * - Negative deterministic tests: error handling for malformed inputs and invalid types
 *
 * These tests are reproducible and target specific scenarios to ensure
 * correctness, reliability, and maintainability of the encoding layer.
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
 * Positive deterministic tests: UTF-8 Encoding/Decoding.
 *
 * Validates round-trip correctness for ASCII, emoji, and non-ASCII scripts.
 */
describe('UTF-8 Encoding/Decoding (Positive)', () => {
  test('round-trip with ASCII and emoji characters', () => {
    const str = 'Hello 🌍'
    const bytes = utf8ToBytes(str)
    const decoded = bytesToUtf8(bytes)
    assert.strictEqual(decoded, str)
  })

  test('round-trip with non-ASCII scripts (Japanese)', () => {
    const str = 'こんにちは世界' // "Hello World" in Japanese
    const bytes = utf8ToBytes(str)
    const decoded = bytesToUtf8(bytes)
    assert.strictEqual(decoded, str)
  })
})

/**
 * Negative deterministic tests: UTF-8 Encoding/Decoding.
 *
 * Ensures invalid inputs throw appropriate errors.
 */
describe('UTF-8 Encoding/Decoding (Negative)', () => {
  test('throws on invalid input type', () => {
    assert.throws(
      () => {
        // @ts-expect-error intentionally wrong type to trigger error
        bytesToUtf8('not a buffer')
      },
      {
        name: 'TypeError',
        message: /expects ArrayBuffer/i,
      },
    )
  })
})

/**
 * Positive deterministic tests: concatBytes.
 *
 * Ensures arrays are concatenated correctly, including edge cases
 * with empty arrays and multiple sequential merges.
 */
describe('concatBytes (Positive)', () => {
  test('merges two arrays', () => {
    const a = new Uint8Array([1, 2])
    const b = new Uint8Array([3, 4])
    const out = concatBytes(a, b)
    assert.deepStrictEqual(toArray(out), [1, 2, 3, 4])
  })

  test('handles empty arrays correctly', () => {
    const a = new Uint8Array([])
    const b = new Uint8Array([1, 2])
    const out = concatBytes(a, b)
    assert.deepStrictEqual(toArray(out), [1, 2])
  })

  test('merges multiple arrays sequentially', () => {
    const a = new Uint8Array([1])
    const b = new Uint8Array([2, 3])
    const c = new Uint8Array([4])
    const out = concatBytes(concatBytes(a, b), c)
    assert.deepStrictEqual(toArray(out), [1, 2, 3, 4])
  })
})

/**
 * Positive deterministic tests: Base64 Encoding/Decoding.
 *
 * Covers round-trip correctness, padding behavior, and performance with large inputs.
 */
describe('Base64 Encoding/Decoding (Positive)', () => {
  test('round-trip encoding/decoding', () => {
    const data = utf8ToBytes('crypto')
    const b64 = toBase64(data)
    const decoded = fromBase64(b64)
    assert.deepStrictEqual(toArray(decoded), toArray(data))
  })

  test('handles padding correctly', () => {
    // Single byte → two padding characters
    assert.strictEqual(toBase64(new Uint8Array([1])), 'AQ==')
    // Two bytes → one padding character
    assert.strictEqual(toBase64(new Uint8Array([1, 2])), 'AQI=')
    // Three bytes → no padding
    assert.strictEqual(toBase64(new Uint8Array([1, 2, 3])), 'AQID')
  })

  test('round-trip with large input', () => {
    const largeStr = 'a'.repeat(1024 * 1024) // 1MB string
    const data = utf8ToBytes(largeStr)
    const b64 = toBase64(data)
    const decoded = fromBase64(b64)
    assert.deepStrictEqual(toArray(decoded), toArray(data))
  })
})

/**
 * Negative deterministic tests: Base64 Encoding/Decoding.
 *
 * Ensures malformed input strings throw errors.
 */
describe('Base64 Encoding/Decoding (Negative)', () => {
  test('throws on malformed string', () => {
    assert.throws(
      () => {
        fromBase64('%%%') // invalid base64 string
      },
      {
        name: 'InvalidCharacterError', // DOMException thrown by atob()
        message: /Invalid character/i,
      },
    )
  })
})

/**
 * Positive deterministic tests: Base64Url Encoding/Decoding.
 *
 * Validates round-trip correctness and URL-safe output without padding.
 */
describe('Base64Url Encoding/Decoding (Positive)', () => {
  test('round-trip encoding/decoding', () => {
    const data = utf8ToBytes('toolkit')
    const b64url = toBase64Url(data)
    const decoded = fromBase64Url(b64url)
    assert.deepStrictEqual(toArray(decoded), toArray(data))
  })

  test('strips padding and is URL-safe', () => {
    const data = new Uint8Array([0xff, 0xee, 0xdd])
    const b64url = toBase64Url(data)

    // Ensure output only contains URL-safe characters
    assert.match(b64url, /^[A-Za-z0-9\-_]+$/)

    const decoded = fromBase64Url(b64url)
    assert.deepStrictEqual(toArray(decoded), toArray(data))
  })
})

/**
 * Negative deterministic tests: Base64Url Encoding/Decoding.
 *
 * Ensures malformed input strings throw errors.
 */
describe('Base64Url Encoding/Decoding (Negative)', () => {
  test('throws on malformed string', () => {
    assert.throws(
      () => {
        fromBase64Url('###') // invalid base64url string
      },
      {
        name: 'InvalidCharacterError', // DOMException thrown by atob()
        message: /Invalid character/i,
      },
    )
  })
})
