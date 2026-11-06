import type { AppState } from './types';
import { emptyState } from './seed';

// Pure data handling kept out of store.tsx so that module exports only the
// provider component (Fast Refresh) and this logic stays testable on its own.

export const STORAGE_KEY = 'open-loops.v1';

/** Only a real date-only key is accepted, so a stray value cannot poison comparisons. */
export function dateOrNull(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function normalize(raw: unknown): AppState {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  return {
    inbox: Array.isArray(r.inbox) ? r.inbox : [],
    actions: Array.isArray(r.actions)
      ? r.actions.map((a) => ({ ...a, ticklerDate: dateOrNull(a.ticklerDate) }))
      : [],
    projects: Array.isArray(r.projects) ? r.projects : [],
    waiting: Array.isArray(r.waiting) ? r.waiting : [],
    someday: Array.isArray(r.someday)
      ? r.someday.map((i) => ({ ...i, remindOn: dateOrNull(i.remindOn) }))
      : [],
    contexts: Array.isArray(r.contexts) && r.contexts.length ? r.contexts : base.contexts,
    lastReview: typeof r.lastReview === 'string' ? r.lastReview : null,
    reviews: Array.isArray(r.reviews) ? r.reviews : [],
  };
}

/**
 * An import has to be recognisably one of our own exports. `normalize` fills in
 * any missing list with an empty array, so without this check a foreign JSON
 * file (or an unrelated backup the user picked by mistake) would replace a live
 * system with empty lists and look like it succeeded.
 */
export function looksLikeExport(raw: unknown): raw is Partial<AppState> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const lists = ['inbox', 'actions', 'projects', 'waiting', 'someday'];
  return lists.some((key) => Array.isArray((raw as Record<string, unknown>)[key]));
}
