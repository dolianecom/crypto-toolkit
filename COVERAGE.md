# ✅ Coverage Checklist: AES‑GCM & Encoders Modules

This document maps each function in `src/aes-gcm.ts` and `src/encoders.ts` against the **regular**, **fuzz**, and **stress** test suites.  
It ensures **Positive** and **Negative** cases are explicitly covered across deterministic, randomized, and heavy‑load scenarios.

---

## 🔐 AES‑GCM (`src/aes-gcm.ts`)

| Function / Feature          | Regular Tests                                     | Fuzz Tests                                  | Stress Tests                                                          | Coverage Notes     |
| --------------------------- | ------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------- | ------------------ |
| **`importKey`**             | ✅ valid/invalid lengths                          | ✅ random keys                              | ✅ used in all stress cases                                           | Fully covered      |
| **`deriveKeyFromPassword`** | ✅ deterministic same/different salts             | ✅ random passwords + salts                 | ✅ sequential derivations, large salts                                | Fully covered      |
| **`randomIv`**              | ✅ length + randomness                            | ✅ used in fuzz loops                       | ✅ used in stress loops                                               | Fully covered      |
| **`encrypt`**               | ✅ round‑trip, AAD, tag length, invalid IV        | ✅ random plaintexts, strings, AAD/tag fuzz | ✅ large payloads, sequential, concurrent                             | Fully covered      |
| **`decrypt`**               | ✅ round‑trip, wrong key/IV, corrupted ciphertext | ✅ wrong key/IV, corrupted ciphertext       | ✅ large payloads, sequential, concurrent, corrupted large ciphertext | Fully covered      |
| **Constants**               | ✅ indirectly validated (IV length, tag length)   | ✅ tag length fuzz                          | ✅ defaults used in stress                                            | Covered indirectly |

---

## 🔤 Encoders (`src/encoders.ts`)

| Function / Feature  | Regular Tests                                     | Fuzz Tests                               | Stress Tests                        | Coverage Notes |
| ------------------- | ------------------------------------------------- | ---------------------------------------- | ----------------------------------- | -------------- |
| **`utf8ToBytes`**   | ✅ ASCII, emoji, non‑ASCII                        | ✅ random printable strings              | ✅ large 1MB string                 | Fully covered  |
| **`bytesToUtf8`**   | ✅ round‑trip, invalid input type                 | ✅ round‑trip correctness                | ✅ large 1MB string, invalid inputs | Fully covered  |
| **`toBase64`**      | ✅ round‑trip, padding, large input               | ✅ random byte arrays, UTF‑8 composition | ✅ large 1MB random array           | Fully covered  |
| **`fromBase64`**    | ✅ round‑trip, padding, malformed input           | ✅ malformed random strings              | ✅ malformed oversized string       | Fully covered  |
| **`toBase64Url`**   | ✅ round‑trip, URL‑safe output                    | ✅ random byte arrays                    | ✅ large 1MB random array           | Fully covered  |
| **`fromBase64Url`** | ✅ round‑trip, malformed input                    | ✅ malformed random strings              | ✅ malformed oversized string       | Fully covered  |
| **`concatBytes`**   | ✅ merges arrays, empty arrays, sequential merges | ✅ random arrays, empty arrays           | ✅ large arrays (512KB each)        | Fully covered  |

---

## 📌 Summary

- **Regular tests**: Deterministic correctness and explicit error handling.
- **Fuzz tests**: Randomized inputs for robustness against unpredictable cases.
- **Stress tests**: Large‑scale workloads and repeated operations for performance and resilience.

👉 Together, the three suites provide **complete coverage** across both modules:

- **Functional correctness** (regular)
- **Robustness against random inputs** (fuzz)
- **Performance and resilience under load** (stress)

---

## 🗂 Legend

- **✅** → Explicitly tested and covered.
- **Covered indirectly** → Not directly tested in isolation, but validated through dependent functionality (e.g., constants verified via IV length or tag length tests).
- **Positive tests** → Validate expected correct behavior (round‑trip correctness, valid inputs, performance under load).
- **Negative tests** → Validate error handling and robustness against invalid, malformed, or corrupted inputs.

---

This file serves as a **single source of truth** for test coverage across both modules.  
It should be updated whenever new functions are added or test suites are expanded.
