import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Loopback only: this app holds personal commitments and has no auth.
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5179 },
  preview: { host: '127.0.0.1', port: 5179 },
});
