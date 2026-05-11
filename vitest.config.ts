import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/ai-service.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './@test'),
    },
  },
});