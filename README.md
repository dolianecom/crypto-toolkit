# Crypto Toolkit

A lightweight TypeScript/JavaScript library providing **AES‑256‑GCM encryption/decryption** and **encoding utilities** (UTF‑8, Base64, Base64URL, byte concatenation).  
Includes **comprehensive test coverage** with regular, fuzz, and stress suites.  
Works seamlessly in **Node.js (v18+)** and modern browsers.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
  - [🖥️ Node.js (ESM)](#-nodejs-esm)
  - [🌐 Browser](#-browser)
- [🔧 API](#-api)
- [🧪 Testing](#-testing)
  - [⚡ Quick Test](#-quick-test)
  - [🧭 Running Tests](#-running-tests)
- [🛠 Development](#-development)
- [🤝 Contributing](#-contributing)
- [🔒 Security](#-security)
- [🔖 Release & Versioning](#-release--versioning)
- [🗺 Roadmap](#-roadmap)
- [❓ FAQ](#-faq)
- [💬 Support](#-support)
- [🙏 Credits / Acknowledgements](#-credits--acknowledgements)
- [📥 Installation from Source](#-installation-from-source)
- [⚖️ License](#-license)

---

## ✨ Features

- AES‑256‑GCM symmetric encryption/decryption
- PBKDF2 key derivation with SHA‑256
- Secure random IV generation (12 bytes, recommended for GCM)
- Encoding helpers: UTF‑8, Base64, Base64URL, byte concatenation
- Portable across Node.js and browsers
- **Testing strategy with finer‑control scripts:**
  - Regular tests (deterministic correctness)
  - Fuzz tests (randomized breadth)
  - Stress tests (large inputs & concurrency)

---

## 📦 Installation

```bash
pnpm add @dolianecom/crypto-toolkit
# or
npm install @dolianecom/crypto-toolkit
```

---

## 🚀 Usage

### 🖥️ Node.js (ESM)

```ts
import {
  importKey,
  encrypt,
  decrypt,
  randomIv,
  utf8ToBytes,
  bytesToUtf8,
  toBase64Url,
  fromBase64Url,
} from '@dolianecom/crypto-toolkit'

import { getCrypto } from '@dolianecom/crypto-toolkit/env.js'

async function demo() {
  const crypto = getCrypto()

  // Generate a random AES-256 key
  const rawKey = crypto.getRandomValues(new Uint8Array(32))
  const key = await importKey(rawKey)

  // Encrypt a message
  const iv = randomIv()
  const plaintext = utf8ToBytes('hello, world')
  const { ciphertext } = await encrypt(key, plaintext, { iv })

  // Pack IV and ciphertext into a Base64Url string
  const packed = `${toBase64Url(iv)}.${toBase64Url(ciphertext)}`
  console.log('Packed:', packed)

  // Unpack and decrypt
  const [ivB64, ctB64] = packed.split('.')
  const decrypted = await decrypt(key, fromBase64Url(ivB64), fromBase64Url(ctB64))

  console.log('Decrypted:', bytesToUtf8(decrypted))
}

demo()
```

### 🌐 Browser

```ts
import { importKey, encrypt, decrypt, randomIv, utf8ToBytes, bytesToUtf8 } from '@dolianecom/crypto-toolkit'
;(async () => {
  // Generate a random AES-256 key
  const rawKey = crypto.getRandomValues(new Uint8Array(32))
  const key = await importKey(rawKey)

  // Encrypt a message
  const iv = randomIv()
  const msg = utf8ToBytes('secret message')
  const { ciphertext } = await encrypt(key, msg, { iv })

  // Decrypt the message
  const decrypted = await decrypt(key, iv, ciphertext)
  console.log(bytesToUtf8(decrypted)) // "secret message"
})()
```

---

## 🔧 API

```ts
// Key management
importKey(rawKey: Uint8Array): Promise<CryptoKey>
deriveKeyFromPassword(password: string, salt: Uint8Array, iterations?: number): Promise<Uint8Array>

// AES-GCM encryption/decryption
encrypt(key: CryptoKey, plaintext: Uint8Array, opts?: AesGcmOptions): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }>
decrypt(key: CryptoKey, iv: Uint8Array, ciphertext: Uint8Array, opts?: AesGcmOptions): Promise<Uint8Array>
randomIv(): Uint8Array

// Encoding utilities
utf8ToBytes(input: string): Uint8Array
bytesToUtf8(bytes: Uint8Array): string
toBase64(bytes: Uint8Array): string
fromBase64(str: string): Uint8Array
toBase64Url(bytes: Uint8Array): string
fromBase64Url(str: string): Uint8Array
concatBytes(...arrays: Uint8Array[]): Uint8Array
```

---

## 🧪 Testing

We maintain **three layers of tests**:

- **Regular tests**: deterministic correctness (round‑trip, wrong key/IV, corrupted ciphertext, malformed encodings).
- **Fuzz tests**: randomized inputs for breadth (random plaintext, strings, AAD/tag lengths, malformed encodings).
- **Stress tests**: large inputs and concurrency for robustness (1MB plaintext, 100 sequential, 50 concurrent, large Base64).

### ⚡ Quick Test

You can quickly verify the build with:

```bash
pnpm build
node dist/scratch.js
```

Expected output:

```text
Packed: <base64url-iv>.<base64url-ciphertext>
Decrypted: hello, world
```

### 🧭 Running Tests

We use finer‑control scripts in `package.json`:

```bash
pnpm test
pnpm test:regular
pnpm test:fuzz
pnpm test:stress
```

Run all suites:

```bash
pnpm build
pnpm test
```

---

## 🛠 Development

To set up a local development environment:

```bash
# Clone the repository
git clone https://github.com/dolianecom/crypto-toolkit.git

# Navigate into the project directory
cd crypto-toolkit

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run the full test suite to verify everything works
pnpm test

# Execute a quick scratch script for a sanity check
node dist/scratch.js
```

---

## 🤝 Contributing

We welcome contributions of all kinds — bug fixes, documentation improvements, and new features.  
To keep our history clean and consistent, we follow specific development and commit guidelines.

👉 Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contributor guide.

---

## 🔒 Security

For details on reporting vulnerabilities and best practices for safe usage,  
please see our dedicated [SECURITY.md](./SECURITY.md) file.

We take security seriously and appreciate responsible disclosure.  
Following the guidelines in `SECURITY.md` helps ensure your use of the toolkit remains secure in production environments.

---

## 🔖 Release & Versioning

We follow **Semantic Versioning (SemVer)**:

- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

```bash
pnpm test
pnpm version <major|minor|patch>
git push && git push --tags
pnpm publish --access public
```

---

## 🗺 Roadmap

- Streaming API support
- Key wrapping/unwrapping (AES‑KW)
- Browser UMD build
- Hex and base58 encoding helpers
- Performance benchmarks and tracking
- Examples gallery (Express, React, Deno)

---

## ❓ FAQ

**Q: Why AES‑GCM instead of other modes like CBC?**  
A: AES‑GCM provides both confidentiality and integrity (authenticated encryption). It's faster and safer than CBC for modern applications.

**Q: Does this library work in Deno?**  
A: Yes. Deno supports the Web Crypto API, so the core functions should work. You may need to adjust imports for Deno's module system.

**Q: How do I generate a secure key?**  
A: Use `crypto.getRandomValues(new Uint8Array(32))` for a raw 256‑bit key, then call `importKey`.

**Q: Can I use this for password storage?**  
A: No. AES‑GCM is for encryption/decryption. For password storage, use a hashing algorithm like bcrypt, scrypt, or Argon2.

**Q: Is this library production‑ready?**  
A: It's designed to be lightweight and standards‑compliant. Always audit cryptographic code before deploying in production.

**Q: Does this library include encoders?**  
A: Yes. It provides UTF‑8, Base64, Base64URL, and byte concatenation helpers, tested with regular, fuzz, and stress suites.

**Q: How are tests organized?**  
A: With finer‑control scripts: `test:regular`, `test:fuzz`, `test:stress`, and `test` to run everything.

---

## 💬 Support

If you need help:

- Open an issue on [GitHub Issues](https://github.com/dolianecom/crypto-toolkit/issues).
- Check the [FAQ](#-faq) and [Roadmap](#-roadmap) for common questions and planned features.
- For security concerns, follow the steps in the [Security](#-security) section.
- For general questions, discussions, or feature requests, use [GitHub Discussions](https://github.com/dolianecom/crypto-toolkit/discussions).

We aim to respond promptly and welcome community engagement.

---

## 🙏 Credits / Acknowledgements

- Inspired by the **Web Crypto API** and its cross‑platform capabilities.
- Thanks to the **TypeScript** and **Node.js** communities for guidance on strict typing and ESM support.
- Special appreciation to contributors who improve documentation, tests, and features.
- Badge icons provided by [Shields.io](https://shields.io).

---

## 📥 Installation from Source

```bash
git clone https://github.com/dolianecom/crypto-toolkit.git
cd crypto-toolkit
pnpm install
pnpm build
node dist/scratch.js
```

---

## ⚖️ License

```text
This project is licensed under the terms of the MIT license.
```
