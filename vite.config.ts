/// <reference types="vitest" />
// Vite configuration — Sets up the React building engine and unit test runner settings.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Enable JSX parsing and fast hot module replacement for React.
  plugins: [react()],
  
  // Configure Vitest test behavior for client component validation.
  test: {
    globals: true, // Enable global test APIs (describe, test, expect) without manual imports.
    environment: 'jsdom', // Mock a browser environment in Node for testing components.
    setupFiles: './test/setup.ts', // Run initial mock utilities before testing starts.
    css: true, // Parse CSS files during testing to support layout assertions.
  },
});
