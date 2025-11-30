/**
 * Fuzz tests for encoding utilities.
 *
 * This suite validates encoding behavior under randomized inputs:
 * - Positive fuzz tests: round-trip correctness with random inputs, composition across UTF-8,
 * Base64, Base64Url, and byte concatenation helpers
 * - Negative fuzz tests: error handling for malformed or invalid inputs
 *
 * Fuzzing complements deterministic unit tests by exploring broader input spaces and edge cases.
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

// Use crypto for randomness (browser or Node)
const crypto = globalThis.crypto ?? (await import('node:crypto')).webcrypto

/**
 * Converts a Uint8Array to a plain number array for easier deep equality checks.
 *
 * @param u8 - Input byte array.
 * @returns Number array representation of the input.
 */
function toArray(u8: Uint8Array): number[] {
  return Array.from(u8)
}

/**
 * Generates a random printable ASCII string.
 * Restricts characters to range 32-126 to avoid control characters.
 *
 * @param length - Desired string length.
 * @returns A random string of printable ASCII characters.
 */
function randomAsciiString(length: number): string {
  const chars: string[] = []
  for (let i = 0; i < length; i++) {
    const code = 32 + (crypto.getRandomValues(new Uint8Array(1))[0] % 95)
    chars.push(String.fromCharCode(code))
  }
  return chars.join('')
}

/**
 * Generates a guaranteed invalid Base64 string by using characters
 * outside the Base64 alphabet (A-Z, a-z, 0-9, +, /, =).
 *
 * @returns A string that cannot be valid Base64.
 */
function randomInvalidBase64(): string {
  const invalidChars = '!@#$%^&*(){}[]|:;<>,.?'
  const chars: string[] = []
  for (let i = 0; i < 8; i++) {
    const idx = crypto.getRandomValues(new Uint8Array(1))[0] % invalidChars.length
    chars.push(invalidChars[idx])
  }
  return chars.join('')
}

/**
 * Positive fuzz tests: UTF-8 Encoding/Decoding.
 *
 * Validates round-trip correctness with random printable strings.
 */
describe('UTF-8 fuzz', () => {
  test('round-trip with random printable strings', () => {
    for (let i = 0; i < 20; i++) {
      const len = crypto.getRandomValues(new Uint8Array(1))[0] % 32
      const str = randomAsciiString(len)

      const bytes = utf8ToBytes(str)
      const decoded = bytesToUtf8(bytes)
      assert.strictEqual(decoded, str)
    }
  })
})

/**
 * Negative fuzz tests: UTF-8 Encoding/Decoding.
 *
 * Ensures invalid input types produce a TypeError with a helpful message.
 */
describe('UTF-8 fuzz', () => {
  test('bytesToUtf8 throws on invalid input types', () => {
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
 * Positive fuzz tests: Base64 Encoding/Decoding.
 *
 * Validates round-trip correctness with random byte arrays and composition with UTF-8.
 */
describe('Base64 fuzz', () => {
  test('round-trip with random byte arrays', () => {
    for (let i = 0; i < 20; i++) {
      const len = crypto.getRandomValues(new Uint8Array(1))[0] % 64
      const data = crypto.getRandomValues(new Uint8Array(len))

      const b64 = toBase64(data)
      const decoded = fromBase64(b64)
      assert.deepStrictEqual(toArray(decoded), toArray(data))
    }
  })

  test('composition round-trip utf8 → base64 → decode → utf8', () => {
    for (let i = 0; i < 20; i++) {
      const str = 'fuzz-' + i + '-' + Math.random().toString(36).slice(2)
      const bytes = utf8ToBytes(str)
      const b64 = toBase64(bytes)
      const decoded = fromBase64(b64)
      const roundTrip = bytesToUtf8(decoded)
      assert.strictEqual(roundTrip, str)
    }
  })
})

/**
 * Negative fuzz tests: Base64 Encoding/Decoding.
 *
 * Ensures malformed strings throw InvalidCharacterError (DOMException from atob).
 */
describe('Base64 fuzz', () => {
  test('malformed strings throw InvalidCharacterError', () => {
    for (let i = 0; i < 10; i++) {
      const bad = randomInvalidBase64()
      assert.throws(() => fromBase64(bad), {
        name: 'InvalidCharacterError',
        message: /Invalid character/i,
      })
    }
  })
})

/**
 * Positive fuzz tests: Base64Url Encoding/Decoding.
 *
 * Validates round-trip correctness with random byte arrays.
 */
describe('Base64Url fuzz (Positive)', () => {
  test('round-trip with random byte arrays', () => {
    for (let i = 0; i < 20; i++) {
      const len = crypto.getRandomValues(new Uint8Array(1))[0] % 64
      const data = crypto.getRandomValues(new Uint8Array(len))

      const b64url = toBase64Url(data)
      const decoded = fromBase64Url(b64url)
      assert.deepStrictEqual(toArray(decoded), toArray(data))
    }
  })
})

/**
 * Negative fuzz tests: Base64Url Encoding/Decoding.
 *
 * Ensures malformed strings throw InvalidCharacterError.
 */
describe('Base64Url fuzz (Negative)', () => {
  test('malformed strings throw InvalidCharacterError', () => {
    for (let i = 0; i < 10; i++) {
      const bad = randomInvalidBase64()
      assert.throws(() => fromBase64Url(bad), {
        name: 'InvalidCharacterError',
        message: /Invalid character/i,
      })
    }
  })
})

/**
 * Positive fuzz tests: concatBytes.
 *
 * Ensures concatenation preserves segment boundaries and handles empty arrays.
 */
describe('concatBytes fuzz (Positive)', () => {
  test('concatenates random arrays correctly', () => {
    for (let i = 0; i < 20; i++) {
      const lenA = crypto.getRandomValues(new Uint8Array(1))[0] % 16
      const lenB = crypto.getRandomValues(new Uint8Array(1))[0] % 16
      const a = crypto.getRandomValues(new Uint8Array(lenA))
      const b = crypto.getRandomValues(new Uint8Array(lenB))

      const out = concatBytes(a, b)
      assert.deepStrictEqual(toArray(out.slice(0, lenA)), toArray(a))
      assert.deepStrictEqual(toArray(out.slice(lenA)), toArray(b))
    }
  })

  test('handles empty arrays correctly', () => {
    for (let i = 0; i < 10; i++) {
      const b = crypto.getRandomValues(new Uint8Array(i))
      const out = concatBytes(new Uint8Array([]), b)
      assert.deepStrictEqual(toArray(out), toArray(b))
    }
  })
})
