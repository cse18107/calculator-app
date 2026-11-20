import { defineConfig } from 'eslint/config';
import expo from 'eslint-config-expo/flat.js';
import prettier from 'eslint-config-prettier';
import { configs as tsConfigs } from 'typescript-eslint';

export default defineConfig([
  expo,
  ...tsConfigs.recommended,
  prettier,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'coverage/*'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'import/no-cycle': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]);
