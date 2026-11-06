import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState, ProjectStatus } from './types';
import { emptyState, seedState } from './seed';

const KEY = 'open-loops.v1';

function uid(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(16).slice(2, 10);
  return `${prefix}-${rand}`;
}

const now = (): string => new Date().toISOString();

function normalize(raw: unknown): AppState {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  return {
    inbox: Array.isArray(r.inbox) ? r.inbox : [],
    actions: Array.isArray(r.actions) ? r.actions : [],
    projects: Array.isArray(r.projects) ? r.projects : [],
    waiting: Array.isArray(r.waiting) ? r.waiting : [],
    someday: Array.isArray(r.someday) ? r.someday : [],
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
function looksLikeExport(raw: unknown): raw is Partial<AppState> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const lists = ['inbox', 'actions', 'projects', 'waiting', 'someday'];
  return lists.some((key) => Array.isArray((raw as Record<string, unknown>)[key]));
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    // A corrupt or unavailable store must not stop the app from opening.
  }
  return seedState();
}

/** Transient UI state: the outcome of the last import attempt. Never persisted. */
export interface ImportNotice {
  kind: 'ok' | 'error';
  text: string;
}

export interface StoreApi {
  state: AppState;
  importNotice: ImportNotice | null;
  clearNotice(): void;
  capture(text: string): void;
  trashInbox(id: string): void;
  handleInbox(id: string): void;
  clarifyNextAction(id: string, step: { title: string; context: string; projectId: string | null }): void;
  clarifyProject(
    id: string,
    project: { title: string; outcome: string; firstActionTitle: string; context: string },
  ): void;
  clarifyWaiting(id: string, item: { title: string; person: string }): void;
  clarifySomeday(id: string, title: string, note: string): void;
  addAction(input: { title: string; context: string; projectId: string | null }): void;
  toggleAction(id: string): void;
  deleteAction(id: string): void;
  addContext(name: string): void;
  addProject(input: { title: string; outcome: string }): void;
  setProjectStatus(id: string, status: ProjectStatus): void;
  defineNextAction(projectId: string, input: { title: string; context: string }): void;
  receiveWaiting(id: string): void;
  addSomeday(title: string, note: string): void;
  promoteSomeday(id: string): void;
  deleteSomeday(id: string): void;
  completeReview(): void;
  clearData(): void;
  loadDemo(): void;
  exportJson(): void;
  importJson(file: File): void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [importNotice, setImportNotice] = useState<ImportNotice | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Private-mode quota failures are not worth interrupting capture over.
    }
  }, [state]);

  const api = useMemo<StoreApi>(() => {
    const apply = (fn: (s: AppState) => AppState) => setState(fn);

    return {
      state,
      importNotice,

      clearNotice() {
        setImportNotice(null);
      },

      capture(text) {
        const value = text.trim();
        if (!value) return;
        apply((s) => ({ ...s, inbox: [...s.inbox, { id: uid('i'), text: value, createdAt: now() }] }));
      },

      trashInbox(id) {
        apply((s) => ({ ...s, inbox: s.inbox.filter((i) => i.id !== id) }));
      },

      handleInbox(id) {
        // "Handled" means it needed no action: it leaves the inbox and keeps no record.
        apply((s) => ({ ...s, inbox: s.inbox.filter((i) => i.id !== id) }));
      },

      clarifyNextAction(id, step) {
        apply((s) => ({
          ...s,
          inbox: s.inbox.filter((i) => i.id !== id),
          actions: [
            ...s.actions,
            {
              id: uid('a'),
              title: step.title.trim(),
              context: step.context,
              projectId: step.projectId,
              done: false,
              doneAt: null,
              createdAt: now(),
            },
          ],
          contexts: s.contexts.includes(step.context) ? s.contexts : [...s.contexts, step.context],
        }));
      },

      clarifyProject(id, project) {
        const projectId = uid('p');
        const first = project.firstActionTitle.trim();
        apply((s) => ({
          ...s,
          inbox: s.inbox.filter((i) => i.id !== id),
          projects: [
            ...s.projects,
            {
              id: projectId,
              title: project.title.trim(),
              outcome: project.outcome.trim(),
              status: 'active',
              createdAt: now(),
              completedAt: null,
            },
          ],
          actions: first
            ? [
                ...s.actions,
                {
                  id: uid('a'),
                  title: first,
                  context: project.context,
                  projectId,
                  done: false,
                  doneAt: null,
                  createdAt: now(),
                },
              ]
            : s.actions,
          contexts: s.contexts.includes(project.context) ? s.contexts : [...s.contexts, project.context],
        }));
      },

      clarifyWaiting(id, item) {
        apply((s) => ({
          ...s,
          inbox: s.inbox.filter((i) => i.id !== id),
          waiting: [
            ...s.waiting,
            { id: uid('w'), title: item.title.trim(), person: item.person.trim() || 'Someone', projectId: null, since: now() },
          ],
        }));
      },

      clarifySomeday(id, title, note) {
        apply((s) => ({
          ...s,
          inbox: s.inbox.filter((i) => i.id !== id),
          someday: [...s.someday, { id: uid('s'), title: title.trim(), note: note.trim(), createdAt: now() }],
        }));
      },

      addAction(input) {
        const title = input.title.trim();
        if (!title) return;
        apply((s) => ({
          ...s,
          actions: [
            ...s.actions,
            {
              id: uid('a'),
              title,
              context: input.context,
              projectId: input.projectId,
              done: false,
              doneAt: null,
              createdAt: now(),
            },
          ],
          contexts: s.contexts.includes(input.context) ? s.contexts : [...s.contexts, input.context],
        }));
      },

      toggleAction(id) {
        apply((s) => ({
          ...s,
          actions: s.actions.map((a) =>
            a.id === id ? { ...a, done: !a.done, doneAt: a.done ? null : now() } : a,
          ),
        }));
      },

      deleteAction(id) {
        apply((s) => ({ ...s, actions: s.actions.filter((a) => a.id !== id) }));
      },

      addContext(name) {
        const value = name.trim();
        if (!value) return;
        const normalized = value.startsWith('@') ? value : `@${value}`;
        apply((s) => (s.contexts.includes(normalized) ? s : { ...s, contexts: [...s.contexts, normalized] }));
      },

      addProject(input) {
        const title = input.title.trim();
        if (!title) return;
        apply((s) => ({
          ...s,
          projects: [
            ...s.projects,
            {
              id: uid('p'),
              title,
              outcome: input.outcome.trim(),
              status: 'active',
              createdAt: now(),
              completedAt: null,
            },
          ],
        }));
      },

      setProjectStatus(id, status) {
        apply((s) => ({
          ...s,
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, status, completedAt: status === 'completed' ? now() : null } : p,
          ),
          // Completing a project closes its remaining actions rather than orphaning them.
          actions:
            status === 'completed'
              ? s.actions.map((a) =>
                  a.projectId === id && !a.done ? { ...a, done: true, doneAt: now() } : a,
                )
              : s.actions,
        }));
      },

      defineNextAction(projectId, input) {
        const title = input.title.trim();
        if (!title) return;
        apply((s) => ({
          ...s,
          actions: [
            ...s.actions,
            {
              id: uid('a'),
              title,
              context: input.context,
              projectId,
              done: false,
              doneAt: null,
              createdAt: now(),
            },
          ],
          contexts: s.contexts.includes(input.context) ? s.contexts : [...s.contexts, input.context],
        }));
      },

      receiveWaiting(id) {
        apply((s) => ({ ...s, waiting: s.waiting.filter((w) => w.id !== id) }));
      },

      addSomeday(title, note) {
        const value = title.trim();
        if (!value) return;
        apply((s) => ({
          ...s,
          someday: [...s.someday, { id: uid('s'), title: value, note: note.trim(), createdAt: now() }],
        }));
      },

      promoteSomeday(id) {
        apply((s) => {
          const item = s.someday.find((x) => x.id === id);
          if (!item) return s;
          return {
            ...s,
            someday: s.someday.filter((x) => x.id !== id),
            inbox: [...s.inbox, { id: uid('i'), text: item.title, createdAt: now() }],
          };
        });
      },

      deleteSomeday(id) {
        apply((s) => ({ ...s, someday: s.someday.filter((x) => x.id !== id) }));
      },

      completeReview() {
        apply((s) => ({ ...s, lastReview: now(), reviews: [...s.reviews, now()] }));
      },

      clearData() {
        apply(() => ({ ...emptyState() }));
      },

      loadDemo() {
        apply(() => seedState());
      },

      exportJson() {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `open-loops-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },

      importJson(file) {
        const name = `“${file.name}”`;
        file
          .text()
          .then((text) => {
            let parsed: unknown;
            try {
              parsed = JSON.parse(text);
            } catch {
              setImportNotice({ kind: 'error', text: `${name} is not valid JSON. Nothing was changed.` });
              return;
            }
            if (!looksLikeExport(parsed)) {
              setImportNotice({
                kind: 'error',
                text: `${name} is not an Open Loops backup. Nothing was changed.`,
              });
              return;
            }
            const next = normalize(parsed);
            setState(next);
            setImportNotice({
              kind: 'ok',
              text: `Imported ${name}: ${next.inbox.length} inbox, ${next.actions.length} actions, ${next.projects.length} projects, ${next.waiting.length} waiting, ${next.someday.length} someday.`,
            });
          })
          .catch(() => {
            setImportNotice({ kind: 'error', text: `Could not read ${name}. Nothing was changed.` });
          });
      },
    };
  }, [state, importNotice]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

// ---------- selectors ----------

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
