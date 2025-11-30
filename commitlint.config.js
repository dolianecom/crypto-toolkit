// commitlint.config.js

// ✅ Define constants once
const TYPE_ENUM = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']
const SCOPE_ENUM = ['aes-gcm', 'encoders', 'readme', 'tests', 'deps']

// Build regex for breaking commits: type + optional scope + !:
const BREAKING_PATTERN = new RegExp(`^(${TYPE_ENUM.join('|')})(\\([\\w-]+\\))?!:`)

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        // ✅ Scope required unless breaking marker present
        'scope-required-unless-breaking': ({ header, scope }) => {
          const breaking = BREAKING_PATTERN.test(header)
          const hasScope = typeof scope === 'string' && scope.length > 0

          if (breaking || hasScope) {
            return [true]
          }
          return [false, 'scope may not be empty unless commit is marked as breaking (use `!:`)']
        },
      },
    },
  ],
  rules: {
    // ✅ Enforce specific commit types
    // These are the only allowed types. Semantic-release uses "feat" and "fix"
    // to determine minor/patch bumps. Other types are allowed for clarity but
    // do not trigger releases.
    'type-enum': [2, 'always', TYPE_ENUM],

    // ⚠️ Optional: restrict scopes to a known set
    // This is set to "warn" (level 1) so contributors can still use new scopes.
    'scope-enum': [1, 'always', SCOPE_ENUM],

    // ✅ Use custom rule instead of scope-empty
    // Replace the global "scope-empty" rule with the conditional rule above.
    // This ensures `feat!: ...` and `fix!: ...` are valid while keeping scope
    // required for non-breaking commits.
    'scope-required-unless-breaking': [2, 'always'],
    'scope-case': [2, 'always', 'lower-case'],

    // ✅ Subject (description) rules
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],
    'subject-case': [0], // allow lowercase imperative style

    // ✅ Format rules
    'header-max-length': [2, 'always', 72],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
}

/*
### ✅ Good commit examples

- feat(encoders): add Base64Url support       → minor release
- fix(aes-gcm): correct IV length validation  → patch release
- feat(aes-gcm)!: remove deprecated IV format → major release
- feat!: drop legacy Base32 support           → major release (no scope)
- docs(readme): update testing instructions   → no release

### ❌ Bad commit examples

- feat:                                       → missing scope (non-breaking)
- fix!:                                       → missing subject
- chore(deps):                                → missing subject
- Feat(encoders): Add Base64Url support       → type not lowercase
- initial setup                               → missing type/scope format
*/
