import type { Action, AppState, SomedayItem } from './types';

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

// ---------- tickler ----------

/** Today as a local date-only key, so "due today" changes at local midnight. */
export function toDateKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const todayKey = (): string => toDateKey();

/** Whole days from today to a date key: negative is overdue, 0 is today. */
export function dayDelta(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** A dated action hides from its context list until the morning of its date. */
export function isDeferred(action: Action): boolean {
  return !!action.ticklerDate && dayDelta(action.ticklerDate) > 0;
}

export function isDue(dateKey: string | null): boolean {
  return !!dateKey && dayDelta(dateKey) <= 0;
}

export function dueLabel(dateKey: string): string {
  const delta = dayDelta(dateKey);
  if (delta === 0) return 'due today';
  if (delta === -1) return '1 day overdue';
  if (delta < 0) return `${-delta} days overdue`;
  if (delta === 1) return 'tomorrow';
  return `in ${delta} days`;
}

export function formatDay(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Context lists show only actions that are not being held back by a date. */
export const availableActions = (s: AppState) => s.actions.filter((a) => !a.done && !isDeferred(a));

export const deferredActions = (s: AppState) => s.actions.filter((a) => !a.done && isDeferred(a));

export function dueActions(s: AppState): Action[] {
  return s.actions.filter((a) => !a.done && isDue(a.ticklerDate));
}

export function dueSomeday(s: AppState): SomedayItem[] {
  return s.someday.filter((i) => isDue(i.remindOn));
}

export function ticklerDueCount(s: AppState): number {
  return dueActions(s).length + dueSomeday(s).length;
}

export interface UpcomingDay {
  date: string;
  actions: Action[];
  someday: SomedayItem[];
}

/** Everything dated in the future, grouped by day, soonest first. */
export function upcomingTickler(s: AppState): UpcomingDay[] {
  const days = new Map<string, UpcomingDay>();
  const add = (date: string) => {
    const existing = days.get(date);
    if (existing) return existing;
    const created: UpcomingDay = { date, actions: [], someday: [] };
    days.set(date, created);
    return created;
  };

  for (const action of s.actions) {
    if (action.done || !action.ticklerDate) continue;
    if (dayDelta(action.ticklerDate) > 0) add(action.ticklerDate).actions.push(action);
  }
  for (const item of s.someday) {
    if (!item.remindOn) continue;
    if (dayDelta(item.remindOn) > 0) add(item.remindOn).someday.push(item);
  }

  return [...days.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function nextWeekKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toDateKey(d);
}
