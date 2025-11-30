# 🔒 Security Policy

We take security seriously and appreciate your efforts to responsibly disclose vulnerabilities.

---

## 📢 Reporting a Vulnerability

- **Do not open a public issue** for security vulnerabilities.
- Report privately via email or through GitHub [Security Advisories](https://docs.github.com/en/code-security/security-advisories).
- Please include:
  - A clear description of the vulnerability
  - Steps to reproduce
  - Any potential impact
- We will respond promptly and patch responsibly.

---

## 🛡️ Best Practices for Safe Usage

To ensure secure use of this toolkit in production environments:

- **Unique salts for PBKDF2**  
  Always supply a unique, random salt when deriving keys from passwords. Reusing salts across secrets weakens security.

- **Correct IV length for AES‑GCM**  
  AES‑GCM requires a 12‑byte initialization vector (IV). This library enforces the default, but ensure you never deviate.

- **Never reuse IVs with the same key**  
  Reusing an IV with the same AES‑GCM key can catastrophically compromise confidentiality and integrity. Always generate a fresh IV with `randomIv()`.

- **Strong iteration count for PBKDF2**  
  Use a sufficiently high iteration count (default: 150,000) to resist brute‑force attacks. Increase further if performance allows.

- **Key management**  
  Keep raw keys and derived keys secret. Do not log them, commit them to source control, or expose them in client‑side code unnecessarily.

- **Encoding safety**  
  When transmitting ciphertext and IVs, prefer URL‑safe Base64 (`toBase64Url`) to avoid issues with transport layers that may alter `+` or `/`.

---

## ✅ Commitment

Following these guidelines helps ensure your use of the toolkit remains secure in production environments.  
We are committed to addressing vulnerabilities quickly and transparently.
