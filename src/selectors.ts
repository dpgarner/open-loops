import type { AppState } from './types';

// Read-only derivations over the stored state. Kept out of store.tsx so that
// module exports only the provider component and can hot-reload cleanly.

export const openActions = (s: AppState) => s.actions.filter((a) => !a.done);

export function nextActionFor(state: AppState, projectId: string) {
  return state.actions.find((a) => a.projectId === projectId && !a.done) ?? null;
}

export function isStuck(state: AppState, projectId: string): boolean {
  const project = state.projects.find((p) => p.id === projectId);
  if (!project || project.status !== 'active') return false;
  return nextActionFor(state, projectId) === null;
}

export const activeProjects = (s: AppState) => s.projects.filter((p) => p.status === 'active');

export function reviewIsDue(state: AppState): boolean {
  if (!state.lastReview) return true;
  const week = 7 * 86_400_000;
  return Date.now() - new Date(state.lastReview).getTime() >= week;
}

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'never';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
