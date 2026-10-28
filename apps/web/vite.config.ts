/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    // `npm run dev:api` serves photos and the visit endpoint during local design work.
    proxy: { '/media': 'http://localhost:3000', '/api': 'http://localhost:3000' },
  },
  test: { environment: 'node' },
});
