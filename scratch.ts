// Example script demonstrating encryption and decryption using AES-GCM
// with helper functions from the crypto-toolkit library.

import { getCrypto } from './src/env.js'
import {
  bytesToUtf8,
  decrypt,
  encrypt,
  fromBase64Url,
  importKey,
  randomIv,
  toBase64Url,
  utf8ToBytes,
} from './src/index.js' // note .js extension for NodeNext

/**
 * Demonstrates the full lifecycle of:
 * 1. Generating a random AES key
 * 2. Encrypting a plaintext message
 * 3. Packing IV and ciphertext into a Base64Url string
 * 4. Unpacking and decrypting the ciphertext
 * 5. Printing results to the console
 *
 * This serves as a usage example for the crypto-toolkit library.
 */
async function main(): Promise<void> {
  // Get the Web Crypto API (browser or Node.js depending on environment)
  const crypto = getCrypto()

  // Generate a random 256-bit key (32 bytes)
  const rawKey = crypto.getRandomValues(new Uint8Array(32))

  // Import the raw key into a CryptoKey usable for AES-GCM
  const key = await importKey(rawKey)

  // Generate a random initialization vector (IV)
  const iv = randomIv()

  // Convert plaintext string into UTF-8 encoded bytes
  const plaintext = utf8ToBytes('hello, world')

  // Encrypt the plaintext using AES-GCM with the generated key and IV
  const { ciphertext } = await encrypt(key, plaintext, { iv })

  // Pack IV and ciphertext into a Base64Url string for transport/storage
  const packed = `${toBase64Url(iv)}.${toBase64Url(ciphertext)}`
  console.log('Packed:', packed)

  // Unpack IV and ciphertext from the packed string
  const [ivB64, ctB64] = packed.split('.')
  const iv2 = fromBase64Url(ivB64)
  const ct2 = fromBase64Url(ctB64)

  // Decrypt the ciphertext back into plaintext bytes
  const decrypted = await decrypt(key, iv2, ct2)

  // Convert decrypted bytes back into a UTF-8 string
  console.log('Decrypted:', bytesToUtf8(decrypted))
}

// Run the example and log any errors
main().catch(console.error)
