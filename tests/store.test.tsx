import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { StoreProvider } from '../src/store';
import { useStore } from '../src/store-context';
import { STORAGE_KEY } from '../src/store-data';
import { emptyState, seedState } from '../src/seed';
import type { Action, AppState, Project, SomedayItem, WaitingItem } from '../src/types';

const NOW = new Date(2026, 10, 6, 9, 30, 0);
const DAY = 86_400_000;
let seq = 0;

const isoDaysAgo = (days: number): string => new Date(NOW.getTime() - days * DAY).toISOString();

const makeAction = (over: Partial<Action> = {}): Action => ({
  id: `a${++seq}`,
  title: 'Ring the venue',
  context: '@calls',
  projectId: null,
  done: false,
  doneAt: null,
  createdAt: isoDaysAgo(1),
  ticklerDate: null,
  ...over,
});

const makeProject = (over: Partial<Project> = {}): Project => ({
  id: `p${++seq}`,
  title: 'Team offsite',
  outcome: 'A booked offsite',
  status: 'active',
  createdAt: isoDaysAgo(5),
  completedAt: null,
  ...over,
});

const makeIdea = (over: Partial<SomedayItem> = {}): SomedayItem => ({
  id: `s${++seq}`,
  title: 'Learn to sail',
  note: '',
  createdAt: isoDaysAgo(3),
  remindOn: null,
  ...over,
});

const makeWaiting = (over: Partial<WaitingItem> = {}): WaitingItem => ({
  id: `w${++seq}`,
  title: 'Signed contract',
  person: 'Dana',
  projectId: null,
  since: isoDaysAgo(2),
  ...over,
});

const inboxItem = (id = 'i1', text = 'Voicemail from the accountant') => ({
  id,
  text,
  createdAt: isoDaysAgo(1),
});

const makeState = (over: Partial<AppState> = {}): AppState => ({ ...emptyState(), ...over });

/** A File stand-in: importJson only reads `.name` and calls `.text()`. */
const fakeFile = (name: string, text: string) => ({ name, text: async () => text }) as unknown as File;

function mount(initial?: AppState) {
  if (initial) localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  const wrapper = ({ children }: { children: ReactNode }) => <StoreProvider>{children}</StoreProvider>;
  return renderHook(() => useStore(), { wrapper });
}

const saved = (): AppState => JSON.parse(localStorage.getItem(STORAGE_KEY) as string);

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('loading and saving', () => {
  it('starts from the demo seed when nothing is saved', () => {
    const { result } = mount();
    const seed = seedState();
    expect(result.current.state.inbox).toHaveLength(seed.inbox.length);
    expect(result.current.state.actions).toHaveLength(seed.actions.length);
    expect(result.current.state.projects).toHaveLength(seed.projects.length);
  });

  it('loads what was saved and repairs an invalid tickler date', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        inbox: [inboxItem()],
        actions: [{ id: 'a-old', title: 'Old action', context: '@home', done: false, ticklerDate: 'whenever' }],
      }),
    );
    const { result } = mount();
    expect(result.current.state.inbox).toHaveLength(1);
    expect(result.current.state.actions[0].ticklerDate).toBeNull();
  });

  it('writes every change to localStorage', () => {
    const { result } = mount(makeState());
    act(() => result.current.capture('Buy milk'));
    expect(saved().inbox).toHaveLength(1);
    expect(saved().inbox[0].text).toBe('Buy milk');
  });
});

describe('capture', () => {
  it('trims the text and ignores an empty capture', () => {
    const { result } = mount(makeState());
    act(() => result.current.capture('   '));
    expect(result.current.state.inbox).toHaveLength(0);

    act(() => result.current.capture('  Book the venue  '));
    expect(result.current.state.inbox).toHaveLength(1);
    expect(result.current.state.inbox[0].text).toBe('Book the venue');
  });
});

describe('clarifying the inbox', () => {
  it('turns an item into a next action with a context, project and date', () => {
    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() =>
      result.current.clarifyNextAction('i1', {
        title: '  Ring the venue  ',
        context: '@calls',
        projectId: 'p-1',
        ticklerDate: '2026-11-09',
      }),
    );
    const s = result.current.state;
    expect(s.inbox).toHaveLength(0);
    expect(s.actions).toHaveLength(1);
    expect(s.actions[0]).toMatchObject({
      title: 'Ring the venue',
      context: '@calls',
      projectId: 'p-1',
      done: false,
      doneAt: null,
      ticklerDate: '2026-11-09',
    });
    expect(s.contexts).toContain('@calls');
  });

  it('rejects an invalid date rather than storing it', () => {
    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() =>
      result.current.clarifyNextAction('i1', {
        title: 'Ring the venue',
        context: '@calls',
        projectId: null,
        ticklerDate: '09/11/2026',
      }),
    );
    expect(result.current.state.actions[0].ticklerDate).toBeNull();
  });

  it('turns an item into a project with its first action', () => {
    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() =>
      result.current.clarifyProject('i1', {
        title: 'Team offsite',
        outcome: 'A booked, agenda’d offsite',
        firstActionTitle: 'Ask about the deposit',
        context: '@calls',
      }),
    );
    const s = result.current.state;
    expect(s.inbox).toHaveLength(0);
    expect(s.projects).toHaveLength(1);
    expect(s.projects[0]).toMatchObject({ status: 'active', completedAt: null });
    expect(s.actions[0]).toMatchObject({ title: 'Ask about the deposit', projectId: s.projects[0].id });
  });

  it('creates a project without an action when no first step is given', () => {
    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() =>
      result.current.clarifyProject('i1', {
        title: 'Team offsite',
        outcome: 'Booked',
        firstActionTitle: '   ',
        context: '@calls',
      }),
    );
    expect(result.current.state.projects).toHaveLength(1);
    expect(result.current.state.actions).toHaveLength(0);
  });

  it('turns an item into a waiting-for entry', () => {
    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() => result.current.clarifyWaiting('i1', { title: 'Signed contract', person: 'Dana' }));
    const s = result.current.state;
    expect(s.inbox).toHaveLength(0);
    expect(s.waiting[0]).toMatchObject({ title: 'Signed contract', person: 'Dana' });
  });

  it('falls back to "Someone" when the person is blank', () => {
    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() => result.current.clarifyWaiting('i1', { title: 'Signed contract', person: '  ' }));
    expect(result.current.state.waiting[0].person).toBe('Someone');
  });

  it('parks an item as someday with a reminder date', () => {
    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() => result.current.clarifySomeday('i1', 'Learn to sail', 'Coastal course', '2026-11-20'));
    const s = result.current.state;
    expect(s.inbox).toHaveLength(0);
    expect(s.someday[0]).toMatchObject({ title: 'Learn to sail', note: 'Coastal course', remindOn: '2026-11-20' });
  });

  it('empties the inbox when an item is handled or trashed', () => {
    const { result } = mount(makeState({ inbox: [inboxItem('i1'), inboxItem('i2', 'Old note')] }));
    act(() => result.current.handleInbox('i1'));
    expect(result.current.state.inbox.map((i) => i.id)).toEqual(['i2']);
    act(() => result.current.trashInbox('i2'));
    expect(result.current.state.inbox).toHaveLength(0);
  });
});

describe('actions', () => {
  it('adds an action and records a new context', () => {
    const { result } = mount(makeState());
    act(() => result.current.addAction({ title: '  Buy milk  ', context: '@errands', projectId: null }));
    expect(result.current.state.actions[0]).toMatchObject({ title: 'Buy milk', context: '@errands', done: false });
    expect(result.current.state.contexts).toContain('@errands');
  });

  it('ignores an action with a blank title', () => {
    const { result } = mount(makeState());
    act(() => result.current.addAction({ title: '   ', context: '@home', projectId: null }));
    expect(result.current.state.actions).toHaveLength(0);
  });

  it('toggles an action done and back, setting and clearing doneAt', () => {
    const { result } = mount(makeState({ actions: [makeAction({ id: 'a1' })] }));
    act(() => result.current.toggleAction('a1'));
    expect(result.current.state.actions[0].done).toBe(true);
    expect(result.current.state.actions[0].doneAt).toBe(NOW.toISOString());

    act(() => result.current.toggleAction('a1'));
    expect(result.current.state.actions[0].done).toBe(false);
    expect(result.current.state.actions[0].doneAt).toBeNull();
  });

  it('sets, moves and clears an action date, rejecting junk', () => {
    const { result } = mount(makeState({ actions: [makeAction({ id: 'a1' })] }));
    act(() => result.current.setActionDate('a1', '2026-11-09'));
    expect(result.current.state.actions[0].ticklerDate).toBe('2026-11-09');

    act(() => result.current.setActionDate('a1', '2026-11-20'));
    expect(result.current.state.actions[0].ticklerDate).toBe('2026-11-20');

    act(() => result.current.setActionDate('a1', 'not-a-date'));
    expect(result.current.state.actions[0].ticklerDate).toBeNull();

    act(() => result.current.setActionDate('a1', '2026-11-09'));
    act(() => result.current.setActionDate('a1', null));
    expect(result.current.state.actions[0].ticklerDate).toBeNull();
  });

  it('deletes an action', () => {
    const { result } = mount(makeState({ actions: [makeAction({ id: 'a1' }), makeAction({ id: 'a2' })] }));
    act(() => result.current.deleteAction('a1'));
    expect(result.current.state.actions.map((a) => a.id)).toEqual(['a2']);
  });

  it('adds a context once, with or without the @', () => {
    const { result } = mount(makeState());
    act(() => result.current.addContext('workshop'));
    expect(result.current.state.contexts).toContain('@workshop');
    const count = result.current.state.contexts.length;
    act(() => result.current.addContext('@workshop'));
    expect(result.current.state.contexts).toHaveLength(count);
  });

  it('defines the next action for a project', () => {
    const project = makeProject({ id: 'p1' });
    const { result } = mount(makeState({ projects: [project] }));
    act(() => result.current.defineNextAction('p1', { title: 'Ask about the deposit', context: '@calls' }));
    expect(result.current.state.actions[0]).toMatchObject({ projectId: 'p1', title: 'Ask about the deposit' });
  });
});

describe('projects', () => {
  it('closes the remaining actions when a project is completed', () => {
    const project = makeProject({ id: 'p1' });
    const { result } = mount(
      makeState({
        projects: [project],
        actions: [
          makeAction({ id: 'open1', projectId: 'p1' }),
          makeAction({ id: 'open2', projectId: 'p1' }),
          makeAction({ id: 'elsewhere', projectId: 'p2' }),
        ],
      }),
    );
    act(() => result.current.setProjectStatus('p1', 'completed'));

    const s = result.current.state;
    expect(s.projects[0].status).toBe('completed');
    expect(s.projects[0].completedAt).toBe(NOW.toISOString());
    expect(s.actions.find((a) => a.id === 'open1')?.done).toBe(true);
    expect(s.actions.find((a) => a.id === 'open2')?.done).toBe(true);
    expect(s.actions.find((a) => a.id === 'elsewhere')?.done).toBe(false);
  });

  it('leaves actions alone when a project is only put on hold', () => {
    const project = makeProject({ id: 'p1' });
    const { result } = mount(
      makeState({ projects: [project], actions: [makeAction({ id: 'open1', projectId: 'p1' })] }),
    );
    act(() => result.current.setProjectStatus('p1', 'on-hold'));
    expect(result.current.state.projects[0].status).toBe('on-hold');
    expect(result.current.state.projects[0].completedAt).toBeNull();
    expect(result.current.state.actions[0].done).toBe(false);
  });

  it('adds a project without an action', () => {
    const { result } = mount(makeState());
    act(() => result.current.addProject({ title: '  Team offsite  ', outcome: 'Booked' }));
    expect(result.current.state.projects[0]).toMatchObject({ title: 'Team offsite', outcome: 'Booked', status: 'active' });
    expect(result.current.state.actions).toHaveLength(0);
  });
});

describe('waiting for', () => {
  it('clears an item once it is received', () => {
    const { result } = mount(makeState({ waiting: [makeWaiting({ id: 'w1' }), makeWaiting({ id: 'w2' })] }));
    act(() => result.current.receiveWaiting('w1'));
    expect(result.current.state.waiting.map((w) => w.id)).toEqual(['w2']);
  });
});

describe('someday', () => {
  it('adds an idea with a reminder date', () => {
    const { result } = mount(makeState());
    act(() => result.current.addSomeday('  Learn to sail  ', 'Coastal', '2026-11-20'));
    expect(result.current.state.someday[0]).toMatchObject({
      title: 'Learn to sail',
      note: 'Coastal',
      remindOn: '2026-11-20',
    });
  });

  it('ignores an idea with a blank title', () => {
    const { result } = mount(makeState());
    act(() => result.current.addSomeday('  ', '', null));
    expect(result.current.state.someday).toHaveLength(0);
  });

  it('sets and clears a reminder date', () => {
    const { result } = mount(makeState({ someday: [makeIdea({ id: 's1' })] }));
    act(() => result.current.setSomedayDate('s1', '2026-12-01'));
    expect(result.current.state.someday[0].remindOn).toBe('2026-12-01');
    act(() => result.current.setSomedayDate('s1', null));
    expect(result.current.state.someday[0].remindOn).toBeNull();
  });

  it('promotes an idea back into the inbox', () => {
    const { result } = mount(makeState({ someday: [makeIdea({ id: 's1', title: 'Learn to sail' })] }));
    act(() => result.current.promoteSomeday('s1'));
    expect(result.current.state.someday).toHaveLength(0);
    expect(result.current.state.inbox[0].text).toBe('Learn to sail');
  });

  it('lets an idea go', () => {
    const { result } = mount(makeState({ someday: [makeIdea({ id: 's1' }), makeIdea({ id: 's2' })] }));
    act(() => result.current.deleteSomeday('s1'));
    expect(result.current.state.someday.map((i) => i.id)).toEqual(['s2']);
  });
});

describe('the weekly review', () => {
  it('stamps the review date and keeps a history', () => {
    const { result } = mount(makeState({ lastReview: isoDaysAgo(9), reviews: [isoDaysAgo(9)] }));
    act(() => result.current.completeReview());
    expect(result.current.state.lastReview).toBe(NOW.toISOString());
    expect(result.current.state.reviews).toHaveLength(2);
  });
});

describe('data controls', () => {
  it('clears everything', () => {
    const { result } = mount(seedState());
    act(() => result.current.clearData());
    const s = result.current.state;
    expect(s.inbox).toHaveLength(0);
    expect(s.actions).toHaveLength(0);
    expect(s.projects).toHaveLength(0);
    expect(s.waiting).toHaveLength(0);
    expect(s.someday).toHaveLength(0);
    expect(s.lastReview).toBeNull();
  });

  it('restores the demo data', () => {
    const { result } = mount(makeState());
    act(() => result.current.loadDemo());
    expect(result.current.state.inbox).toHaveLength(seedState().inbox.length);
    expect(result.current.state.someday).toHaveLength(seedState().someday.length);
  });

  it('downloads a JSON backup', () => {
    const createObjectURL = jest.fn((_blob: Blob) => 'blob:mock');
    const revokeObjectURL = jest.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { result } = mount(makeState({ inbox: [inboxItem()] }));
    act(() => result.current.exportJson());

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(0);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});

describe('importing a backup', () => {
  const backup = {
    inbox: [inboxItem()],
    actions: [
      {
        id: 'a-imported',
        title: 'Imported action',
        context: '@computer',
        projectId: null,
        done: false,
        doneAt: null,
        createdAt: isoDaysAgo(1),
        ticklerDate: '2026-11-15',
      },
    ],
    projects: [],
    waiting: [],
    someday: [{ id: 's-imported', title: 'Imported idea', note: '', createdAt: isoDaysAgo(1), remindOn: '2026-11-10' }],
    contexts: ['@computer'],
    lastReview: null,
    reviews: [],
  };

  const importFile = async (result: { current: ReturnType<typeof useStore> }, file: File) => {
    await act(async () => {
      result.current.importJson(file);
    });
    await act(async () => {});
  };

  it('replaces the state and reports the counts, dates intact', async () => {
    const { result } = mount(makeState());
    await importFile(result, fakeFile('backup.json', JSON.stringify(backup)));

    const s = result.current.state;
    expect(result.current.importNotice?.kind).toBe('ok');
    expect(result.current.importNotice?.text).toContain('1 inbox');
    expect(result.current.importNotice?.text).toContain('1 someday');
    expect(s.actions[0].ticklerDate).toBe('2026-11-15');
    expect(s.someday[0].remindOn).toBe('2026-11-10');
  });

  it('refuses a file that is not one of ours and keeps the data', async () => {
    const start = makeState({ inbox: [inboxItem('keep', 'Keep me')] });
    const { result } = mount(start);
    await importFile(result, fakeFile('wrong.json', JSON.stringify({ hello: 'world' })));

    expect(result.current.importNotice?.kind).toBe('error');
    expect(result.current.importNotice?.text).toContain('is not an Open Loops backup');
    expect(result.current.importNotice?.text).toContain('Nothing was changed');
    expect(result.current.state.inbox).toEqual(start.inbox);
  });

  it('refuses invalid JSON', async () => {
    const { result } = mount(makeState());
    await importFile(result, fakeFile('broken.json', 'not json at all'));
    expect(result.current.importNotice?.kind).toBe('error');
    expect(result.current.importNotice?.text).toContain('is not valid JSON');
    expect(result.current.state).toEqual(makeState());
  });

  it('reports a file it cannot read', async () => {
    const { result } = mount(makeState());
    const unreadable = {
      name: 'locked.json',
      text: async () => {
        throw new Error('EACCES');
      },
    } as unknown as File;
    await importFile(result, unreadable);
    expect(result.current.importNotice?.kind).toBe('error');
    expect(result.current.importNotice?.text).toContain('Could not read');
  });

  it('can dismiss the notice', async () => {
    const { result } = mount(makeState());
    await importFile(result, fakeFile('broken.json', 'nope'));
    expect(result.current.importNotice).not.toBeNull();
    act(() => result.current.clearNotice());
    expect(result.current.importNotice).toBeNull();
  });
});

describe('contexts the store has not seen yet', () => {
  const NEW = '@workshop';

  it('creates the context when an inbox item is clarified into an action', () => {
    const { result } = mount(makeState({ inbox: [inboxItem('i1', 'Build a shelf')] }));

    act(() =>
      result.current.clarifyNextAction('i1', {
        title: 'Measure the wall',
        context: NEW,
        projectId: null,
      }),
    );

    expect(result.current.state.contexts).toContain(NEW);
    expect(result.current.state.actions[0].context).toBe(NEW);
  });

  it('creates the context for the first action of a project', () => {
    const { result } = mount(makeState({ inbox: [inboxItem('i1', 'Build a shelf')] }));

    act(() =>
      result.current.clarifyProject('i1', {
        title: 'Shelf',
        outcome: 'A shelf on the wall',
        firstActionTitle: 'Measure the wall',
        context: NEW,
      }),
    );

    expect(result.current.state.contexts).toContain(NEW);
    expect(result.current.state.actions[0].context).toBe(NEW);
  });

  it('creates the context when an action is added directly', () => {
    const { result } = mount(makeState());

    act(() => result.current.addAction({ title: 'Cut the keys', context: NEW, projectId: null }));

    expect(result.current.state.contexts).toContain(NEW);
  });

  it('creates the context when a project gets a next action', () => {
    const { result } = mount(makeState({ projects: [makeProject({ id: 'p1' })] }));

    act(() => result.current.defineNextAction('p1', { title: 'Cut the keys', context: NEW }));

    expect(result.current.state.contexts).toContain(NEW);
    expect(result.current.state.actions[0].projectId).toBe('p1');
  });

  it('does not duplicate a context it already has', () => {
    const { result } = mount(makeState());

    act(() => result.current.addAction({ title: 'Cut the keys', context: '@calls', projectId: null }));

    expect(result.current.state.contexts.filter((c) => c === '@calls')).toHaveLength(1);
  });
});

describe('input the store refuses', () => {
  it('adds nothing for blank titles and context names', () => {
    const { result } = mount(makeState());

    act(() => {
      result.current.addContext('   ');
      result.current.addProject({ title: '  ', outcome: 'Something' });
      result.current.defineNextAction('p-missing', { title: '', context: '@calls' });
    });

    expect(result.current.state.contexts).toEqual(emptyState().contexts);
    expect(result.current.state.projects).toHaveLength(0);
    expect(result.current.state.actions).toHaveLength(0);
  });

  it('changes nothing when an id is no longer in the list', () => {
    const start = makeState({
      actions: [makeAction({ id: 'a1' })],
      projects: [makeProject({ id: 'p1' })],
      someday: [makeIdea({ id: 's1' })],
    });
    const { result } = mount(start);

    // A rendered row can outlive its record, so these no-ops must be harmless.
    act(() => {
      result.current.toggleAction('gone');
      result.current.setActionDate('gone', '2026-11-10');
      result.current.setProjectStatus('gone', 'completed');
      result.current.setSomedayDate('gone', '2026-11-10');
      result.current.promoteSomeday('gone');
    });

    expect(result.current.state.actions).toEqual(start.actions);
    expect(result.current.state.projects).toEqual(start.projects);
    expect(result.current.state.someday).toEqual(start.someday);
    expect(result.current.state.inbox).toEqual(start.inbox);
  });
});

describe('the store hook', () => {
  it('refuses to be used outside the provider', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useStore())).toThrow('useStore must be used inside StoreProvider');
    quiet.mockRestore();
  });
});
