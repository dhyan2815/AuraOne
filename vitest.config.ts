// Vitest configuration — Configures path routing aliases, test environments, and test coverage reporters.

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Enable JSX parsing for component testing.
  plugins: [react()],
  
  // Configure test suite runner options.
  test: {
    environment: 'jsdom', // Simulate the browser DOM.
    globals: true, // Allow usage of test functions (describe, it) without imports.
    setupFiles: ['./tests/setup.ts'], // Load environmental mocks before running suites.
    include: ['tests/**/*.test.ts', 'tests/**/ai-service.test.ts'], // Filter files considered as tests.
    
    // Configure test coverage settings.
    coverage: {
      provider: 'v8', // Use v8 engine for speed and accurate branch coverage.
      reporter: ['text', 'json', 'html'], // Output format types.
    },
  },
  
  // Set up path aliases to simplify import statements.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Maps '@' to project source directory.
      '@test': path.resolve(__dirname, './@test'), // Maps '@test' to global test mocks directory.
    },
  },
});