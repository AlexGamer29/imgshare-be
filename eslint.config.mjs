import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  // Apply to all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node, // Ensure node.js global variables are available
    },
    rules: {
      // Customize rules here
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'warn',
    },
  },
  {
    languageOptions: {
      globals: globals.browser, // Add browser globals if necessary
    },
  },
  pluginJs.configs.recommended,
];
