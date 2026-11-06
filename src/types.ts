// The GTD model: an inbox you process, actions that are next physical steps,
// projects that are outcomes, and the lists that hold everything else.

export type Tab = 'inbox' | 'next' | 'projects' | 'waiting' | 'someday' | 'tickler' | 'review';

export type ProjectStatus = 'active' | 'on-hold' | 'completed';

export interface InboxItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface Context {
  name: string;
}

export interface Project {
  id: string;
  title: string;
  outcome: string;
  status: ProjectStatus;
  createdAt: string;
  completedAt: string | null;
}

/** A next action is one concrete, physical step — never a project title. */
export interface Action {
  id: string;
  title: string;
  context: string;
  projectId: string | null;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
  /** Date-only key (YYYY-MM-DD). While in the future the action is deferred. */
  ticklerDate: string | null;
}

export interface WaitingItem {
  id: string;
  title: string;
  person: string;
  projectId: string | null;
  since: string;
}

export interface SomedayItem {
  id: string;
  title: string;
  note: string;
  createdAt: string;
  /** Date-only key (YYYY-MM-DD) on which this idea should resurface. */
  remindOn: string | null;
}

export interface AppState {
  inbox: InboxItem[];
  actions: Action[];
  projects: Project[];
  waiting: WaitingItem[];
  someday: SomedayItem[];
  contexts: string[];
  lastReview: string | null;
  reviews: string[];
}
