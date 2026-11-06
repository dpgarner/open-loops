export interface BuildInfo {
  id: string;
  at: string;
}

/** Injected by Vite at build time; null under `npm run dev` and in tests. */
export const build: BuildInfo | null = typeof __BUILD__ === 'undefined' ? null : __BUILD__;

/**
 * Deterministic on purpose: the same string on every machine, instead of a
 * locale-formatted date that differs between the app and its tests.
 */
export function buildLabel(info: BuildInfo | null): string {
  if (!info) return 'Development build';
  return `Build ${info.id} · ${info.at.slice(0, 10)} ${info.at.slice(11, 16)} UTC`;
}
