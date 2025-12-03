# AGENTS.md

This file provides agent‑focused guidance for using **crypto-toolkit** when installed from npm, pnpm, or yarn.  
It complements the README by documenting setup commands and usage conventions that matter to coding agents.

---

## Installation

You can install **crypto-toolkit** with any major package manager:

```bash
# npm
npm install @dolianecom/crypto-toolkit

# pnpm
pnpm add @dolianecom/crypto-toolkit

# yarn
yarn add @dolianecom/crypto-toolkit
```

All commands achieve the same result.  
Internally we use **pnpm**, but you are free to use whichever tool fits your workflow.

---

## Quick check

Verify installation works:

```bash
node -e "import('@dolianecom/crypto-toolkit').then(m=>console.log(m.toBase64(new Uint8Array([65]))))"
```

Expected output: `QQ==`

---

## Usage examples

Import functions:

```ts
import { toBase64, fromBase64, toBase64Url, fromBase64Url, getCrypto } from '@dolianecom/crypto-toolkit'
```

- Encode:  
  `toBase64(new Uint8Array([72,101,108,108,111])) // "SGVsbG8="`

- Decode:  
  `fromBase64("SGVsbG8=")` → `Uint8Array` → `"Hello"`

- URL-safe:  
  `toBase64Url(bytes)` / `fromBase64Url(str)`

- Crypto:  
  `getCrypto().getRandomValues(new Uint8Array(16))`

---

## Notes

- Works in both **browser** and **Node.js** environments.
- Uses `globalThis.crypto` when available; falls back to Node.js `webcrypto`.

---

## Summary

Install with npm, pnpm, or yarn. Import functions to perform Base64 and crypto operations in any JS environment.
