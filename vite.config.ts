import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Stamps the build id into the copied service worker. Without this, an asset-only
 * rebuild leaves sw.js byte-identical, so the browser never notices an update and
 * the "new version ready" banner could not appear.
 */
function stampServiceWorker(): Plugin {
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    closeBundle() {
      const worker = resolve(process.cwd(), 'dist/sw.js');
      if (!existsSync(worker)) return;
      const stamp = Date.now().toString(36);
      writeFileSync(worker, readFileSync(worker, 'utf8').replaceAll('__BUILD_ID__', stamp));
    },
  };
}

// Loopback only: this app holds personal commitments and has no auth.
export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  server: { host: '127.0.0.1', port: 5179 },
  preview: { host: '127.0.0.1', port: 5179 },
});
