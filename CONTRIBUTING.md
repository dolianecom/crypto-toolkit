# Contributing to Crypto Toolkit

We're excited that you want to contribute! 🎉  
This document contains everything you need to know about working on the project.  
The README is focused on **using** the library — this guide is focused on **building and testing** it.

---

## 🔗 Quick Links

- [COVERAGE.md](./COVERAGE.md) → Detailed checklist of test coverage across regular, fuzz, and stress suites.
- [SECURITY.md](./SECURITY.md) → Security policy, vulnerability reporting instructions, and safe usage best practices.

Review these documents before contributing to ensure your changes maintain both **quality** and **security**.

---

## 📦 Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/dolianecom/crypto-toolkit.git
   cd crypto-toolkit
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the project**

   ```bash
   pnpm build
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

For details on what is covered by the test suites,  
please review the [COVERAGE.md](./COVERAGE.md) file. It maps each function in  
`src/aes-gcm.ts` and `src/encoders.ts` against Positive and Negative test cases  
to ensure complete coverage across deterministic, randomized, and heavy‑load scenarios.

---

## 🔒 Security Guidelines

Before contributing, please also review our [SECURITY.md](./SECURITY.md).  
It explains how to responsibly report vulnerabilities and outlines best practices for safe usage of the toolkit.

- **Do not open public issues** for vulnerabilities — report privately via email or GitHub Security Advisories.
- **Follow secure usage practices**:
  - Use unique salts for PBKDF2
  - Always generate fresh 12‑byte IVs with `randomIv()`
  - Never reuse IVs with the same key
  - Keep iteration counts strong (default: 150,000 or higher)
  - Manage keys securely (never log or commit them)
  - Prefer URL‑safe Base64 (`toBase64Url`) for transmitting ciphertext and IVs

By following `SECURITY.md`, you help ensure contributions remain secure and production‑ready.

---

## 🧹 Code Style

We enforce consistent style using **ESLint** and **Prettier**.

- **ESLint** checks for code quality issues.
- **Prettier** handles formatting (quotes, semicolons, indentation, trailing commas).

### Key Rules and Configurations

- **Semicolons**: not used (`semi: false`)
- **Quotes**: single quotes (`'`)
- **Indentation**: 2 spaces
- **Trailing commas**: required in multiline constructs
- **Line length and endings**: max 120 characters with LF line endings
- **Editor Setup**:
  - Use VS Code with recommended extensions. We provide a `.vscode/extensions.json` file to recommend essential extensions for contributors. When you open the project in VS Code, it will suggest installing them automatically.
  - Code is auto‑formatted and imports organized on save.
- **EditorConfig**: A `.editorconfig` file is included to ensure consistent indentation, line endings, and formatting across all editors. Most modern editors support EditorConfig out of the box or via a plugin, so even non‑VS Code users will follow the same style rules automatically.

---

## 📝 Commit Message Guidelines

We use **Conventional Commits** to keep history clear, searchable, and consistent.
Commit messages are automatically checked by Husky + Commitlint — if your message doesn't follow the rules, the commit will be blocked.

### Format

```
<type>(scope): <short description>
```

- **Types**:
  - `feat`: a new feature
  - `fix`: a bug fix
  - `docs`: documentation changes
  - `style`: formatting, whitespace, etc. (no code changes)
  - `refactor`: code changes that neither fix a bug nor add a feature
  - `test`: adding or updating tests
  - `chore`: maintenance tasks (build, tooling, dependencies)

- **scope** → The area of the codebase affected (e.g. `aes-gcm`, `encoders`, `readme`).
- **description** → Keep descriptions concise (≤ 72 characters). For larger changes, add details in the commit body.

### Examples

- `feat(encoders): add Base64Url support` → minor release
- `fix(aes-gcm): correct IV length validation` → patch release
- `feat(aes-gcm)!: remove deprecated IV format` → major release
- `docs(readme): update testing instructions` → no release

### Rules Enforced

- ✅ Scope is required and must be lowercase
- ✅ Description must be ≤ 72 characters
- ✅ Only allowed types are accepted
- ✅ Entire header must be ≤ 72 characters
- ✅ No empty type, scope, or description

---

## ⚠️ Breaking Changes

Major releases are triggered automatically by **semantic‑release** when a commit indicates a breaking change.
There are two supported ways to mark a breaking change:

### 1. Using the `!` syntax in the commit header

Add an exclamation mark (`!`) after the type or scope:

```
feat(encoders)!: drop legacy Base32 support
fix(aes-gcm)!: change IV length requirement
```

### 2. Adding a `BREAKING CHANGE:` footer in the commit body

```
feat(aes-gcm): refactor encryption API

BREAKING CHANGE: The IV must now be 12 bytes instead of variable length.
```

---

## 🚧 Fixing a Blocked Commit

If Husky + Commitlint reject your commit, it means the message didn't follow our guidelines.
You can fix it easily:

- **Amend the last commit**:

  ```bash
  git commit --amend
  ```

- **If already pushed**:

  ```bash
  git commit --amend
  git push --force-with-lease
  ```

---

## ✅ Pull Request Process

1. **Fork the repository** and create a new branch from `main` for your changes.
2. **Verify code quality and correctness** before committing:

   ```bash
   pnpm lint:check
   pnpm format:check
   pnpm lint && pnpm format
   pnpm test
   ```

3. **Update documentation** if you add new features or modify existing behavior.
4. **Open a pull request** with:
   - A clear and descriptive title
   - A summary of the changes you made
   - Any relevant notes for reviewers (e.g., breaking changes, new dependencies)

---

## 🙌 Thank You

By following these guidelines, you help keep the project maintainable and welcoming for everyone.  
We appreciate your contributions and look forward to collaborating!
