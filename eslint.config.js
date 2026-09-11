import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: ['dist', 'design-system']
  },
  {
    rules: {
      'comma-dangle': ['error', 'never'],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.{1,2}/',
              message: '项目内部模块请使用 @ 路径别名'
            }
          ]
        }
      ],
      semi: ['error', 'never']
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser
    }
  }
])
