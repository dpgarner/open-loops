import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

interface BuildInfo {
  id: string;
  at: string;
  commit: string | null;
  commitUrl: string | null;
}

/**
 * Stamps the build id into the copied service worker. Without this, an asset-only
 * rebuild leaves sw.js byte-identical, so the browser never notices an update and
 * the "new version ready" banner could not appear.
 */
function stampServiceWorker(build: BuildInfo): Plugin {
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    closeBundle() {
      const worker = resolve(process.cwd(), 'dist/sw.js');
      if (!existsSync(worker)) return;
      writeFileSync(worker, readFileSync(worker, 'utf8').replaceAll('__BUILD_ID__', build.id));
    },
  };
}

/** The current commit, or null outside a git checkout (a source zip, say). */
function readCommit(): string | null {
  try {
    const sha = execSync('git rev-parse HEAD', {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    return sha || null;
  } catch {
    return null;
  }
}

/** Repository web URL, read from package.json so it is declared in one place. */
function readRepoUrl(): string | null {
  try {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
    const url: string | undefined = pkg.repository?.url;
    if (!url) return null;
    return url.replace(/^git\+/, '').replace(/\.git$/, '');
  } catch {
    return null;
  }
}

// Loopback only: this app holds personal commitments and has no auth.
export default defineConfig(({ command }) => {
  // One id for the bundle and the worker, so the sidebar footer names exactly
  // the version whose cache is in use.
  let build: BuildInfo | null = null;
  if (command === 'build') {
    const commit = readCommit();
    const repo = readRepoUrl();
    build = {
      id: Date.now().toString(36),
      at: new Date().toISOString(),
      commit,
      commitUrl: commit && repo ? `${repo}/commit/${commit}` : null,
    };
  }

  return {
    plugins: [react(), ...(build ? [stampServiceWorker(build)] : [])],
    define: { __BUILD__: JSON.stringify(build) },
    server: { host: '127.0.0.1', port: 5179 },
    preview: { host: '127.0.0.1', port: 5179 },
  };
});
