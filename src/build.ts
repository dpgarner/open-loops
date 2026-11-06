export interface BuildInfo {
  id: string;
  at: string;
  commit: string | null;
  commitUrl: string | null;
}

/** Injected by Vite at build time; null under `npm run dev` and in tests. */
export const build: BuildInfo | null = typeof __BUILD__ === 'undefined' ? null : __BUILD__;

/** `2026-11-06 20:47 UTC`, built by hand so it never depends on the locale. */
export function buildTime(info: BuildInfo): string {
  return `${info.at.slice(0, 10)} ${info.at.slice(11, 16)} UTC`;
}

export function shortCommit(commit: string): string {
  return commit.slice(0, 7);
}

/** e.g. "Build mw5g3w90 · be6f971 · 2026-11-06 20:47 UTC" */
export function buildLabel(info: BuildInfo | null): string {
  if (!info) return 'Development build';
  const commit = info.commit ? ` · ${shortCommit(info.commit)}` : '';
  return `Build ${info.id}${commit} · ${buildTime(info)}`;
}
