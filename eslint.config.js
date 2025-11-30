import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default [
  // Base recommended rules from ESLint
  js.configs.recommended,

  // Recommended rules for TypeScript
  ...tseslint.configs.recommended,

  // Prettier integration (disables conflicting ESLint rules)
  prettier,

  {
    files: ['src/**/*.ts', 'test/**/*.ts', 'scratch.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-parens': ['error', 'always'],
      'max-len': ['warn', { code: 120 }],
      'linebreak-style': ['error', 'unix'],

      // General best practices
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',

      // Import sorting rules
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['scratch.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // NEW: ignore generated and dependency folders
    ignores: ['dist/**', 'node_modules/**', 'pnpm-lock.yaml', '.env'],
  },
]
