// ESLint configuration — Configures code style checks, language parsers, and plugins for TypeScript + React.

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Exclude production build output folders from linting.
  { ignores: ['dist'] },
  
  // Set up language specifications, plugins, and custom rules for source files.
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    
    // Define compiler standards and global scope environment.
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser, // Inject standard browser API globals (window, document).
    },
    
    // Register third-party rules checkers.
    plugins: {
      'react-hooks': reactHooks, // Enforces React Hooks rules (e.g. call order).
      'react-refresh': reactRefresh, // Validates components export structure for fast refresh.
    },
    
    // Configure warning thresholds and customize specific rules.
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // Allow exporting constants alongside functional components.
      ],
    },
  }
);
