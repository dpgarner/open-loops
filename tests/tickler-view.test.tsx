import { fireEvent, render, screen, within } from '@testing-library/react';
import TicklerView from '../src/components/TicklerView';
import { StoreProvider } from '../src/store';
import { useStore } from '../src/store-context';
import { STORAGE_KEY } from '../src/store-data';
import { emptyState } from '../src/seed';
import type { Action, AppState, SomedayItem } from '../src/types';

// Fri 6 Nov 2026, 09:30 local time — the tickler's whole view depends on "today".
const NOW = new Date(2026, 10, 6, 9, 30, 0);

let seq = 0;
const makeAction = (over: Partial<Action> = {}): Action => ({
  id: `a${++seq}`,
  title: 'Ring the venue',
  context: '@calls',
  projectId: null,
  done: false,
  doneAt: null,
  createdAt: NOW.toISOString(),
  ticklerDate: null,
  ...over,
});

const makeIdea = (over: Partial<SomedayItem> = {}): SomedayItem => ({
  id: `s${++seq}`,
  title: 'Learn to sail',
  note: '',
  createdAt: NOW.toISOString(),
  remindOn: null,
  ...over,
});

const makeState = (over: Partial<AppState> = {}): AppState => ({ ...emptyState(), ...over });

/** A date-only key offset from the fixed "today". */
const at = (offsetDays: number): string => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

interface ProbeState {
  actions: Array<{ id: string; done: boolean; date: string | null }>;
  someday: Array<{ id: string; remindOn: string | null }>;
  inbox: string[];
}

/** Reads the store directly, so a test can check what a click changed. */
function Probe() {
  const { state } = useStore();
  const view: ProbeState = {
    actions: state.actions.map((a) => ({ id: a.id, done: a.done, date: a.ticklerDate })),
    someday: state.someday.map((i) => ({ id: i.id, remindOn: i.remindOn })),
    inbox: state.inbox.map((i) => i.text),
  };
  return <div data-testid="probe">{JSON.stringify(view)}</div>;
}

function renderTickler(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return render(
    <StoreProvider>
      <TicklerView />
      <Probe />
    </StoreProvider>,
  );
}

const probe = (): ProbeState => JSON.parse(screen.getByTestId('probe').textContent ?? '{}');
const rowOf = (title: string) => screen.getByText(title).closest('li') as HTMLElement;

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

const fullState = () =>
  makeState({
    actions: [
      makeAction({ id: 'domain', title: 'Renew the domain', ticklerDate: at(-2) }),
      makeAction({ id: 'dentist', title: 'Book the dentist', ticklerDate: at(0) }),
      makeAction({ id: 'invoice', title: 'Chase the invoice', ticklerDate: at(7) }),
      makeAction({ id: 'undated', title: 'Undated action', ticklerDate: null }),
    ],
    someday: [
      makeIdea({ id: 'sail', title: 'Learn to sail', remindOn: at(-1), note: 'Coastal course' }),
      makeIdea({ id: 'essay', title: 'Write the essay', remindOn: at(7) }),
      makeIdea({ id: 'knit', title: 'Learn to knit', remindOn: null }),
    ],
  });

describe('what the tickler shows', () => {
  it('lists what has come due and groups what is still ahead', () => {
    renderTickler(fullState());

    expect(screen.getByText('Renew the domain')).toBeTruthy();
    expect(screen.getByText('2 days overdue')).toBeTruthy();
    expect(screen.getByText('Book the dentist')).toBeTruthy();
    expect(screen.getByText('due today')).toBeTruthy();
    expect(screen.getByText('Learn to sail')).toBeTruthy();
    // An idea's label shares its line with the "someday" tag and its note.
    expect(screen.getByText(/1 day overdue/)).toBeTruthy();

    expect(screen.getByText('Chase the invoice')).toBeTruthy();
    expect(screen.getByText('Write the essay')).toBeTruthy();
    expect(screen.getByText('in 7 days')).toBeTruthy();

    // Undated actions and ideas belong to other lists, not this one.
    expect(screen.queryByText('Undated action')).toBeNull();
    expect(screen.queryByText('Learn to knit')).toBeNull();
  });

  it('says a quiet tickler is a working tickler when nothing is due', () => {
    renderTickler(makeState({ actions: [makeAction({ title: 'Renew the domain', ticklerDate: at(3) })] }));

    expect(
      screen.getByText('Nothing has come due. A quiet tickler is a working tickler.'),
    ).toBeTruthy();
    expect(screen.getByText('in 3 days')).toBeTruthy();
  });
});

describe('acting on what is due', () => {
  it('ticks a due action off', () => {
    renderTickler(
      makeState({ actions: [makeAction({ id: 'domain', title: 'Renew the domain', ticklerDate: at(-2) })] }),
    );

    fireEvent.click(within(rowOf('Renew the domain')).getByRole('checkbox'));

    expect(screen.queryByText('Renew the domain')).toBeNull();
    expect(probe().actions).toEqual([{ id: 'domain', done: true, date: at(-2) }]);
    expect(
      screen.getByText('Nothing has come due. A quiet tickler is a working tickler.'),
    ).toBeTruthy();
  });

  it('pushes a due action a week out, where it joins the upcoming list', () => {
    renderTickler(
      makeState({ actions: [makeAction({ id: 'domain', title: 'Renew the domain', ticklerDate: at(-2) })] }),
    );

    fireEvent.click(within(rowOf('Renew the domain')).getByRole('button', { name: 'Push a week' }));

    expect(probe().actions[0].date).toBe(at(7));
    expect(screen.queryByText('2 days overdue')).toBeNull();
    expect(screen.getByText('in 7 days')).toBeTruthy();
    expect(screen.getByText('Renew the domain')).toBeTruthy();
  });

  it('clears a date so the action leaves the tickler', () => {
    renderTickler(
      makeState({ actions: [makeAction({ id: 'domain', title: 'Renew the domain', ticklerDate: at(-2) })] }),
    );

    fireEvent.click(within(rowOf('Renew the domain')).getByRole('button', { name: 'Clear' }));

    expect(probe().actions[0].date).toBeNull();
    expect(screen.queryByText('Renew the domain')).toBeNull();
  });

  it('moves a due idea back to the inbox', () => {
    renderTickler(makeState({ someday: [makeIdea({ id: 'sail', title: 'Learn to sail', remindOn: at(-1) })] }));

    fireEvent.click(within(rowOf('Learn to sail')).getByRole('button', { name: 'Move to inbox' }));

    expect(probe().inbox).toEqual(['Learn to sail']);
    expect(probe().someday).toEqual([]);
    expect(screen.queryByText('Learn to sail')).toBeNull();
  });

  it('pushes a due idea a week out or lets it go', () => {
    renderTickler(
      makeState({
        someday: [
          makeIdea({ id: 'sail', title: 'Learn to sail', remindOn: at(-1) }),
          makeIdea({ id: 'essay', title: 'Write the essay', remindOn: at(-1) }),
        ],
      }),
    );

    fireEvent.click(within(rowOf('Learn to sail')).getByRole('button', { name: 'Push a week' }));
    fireEvent.click(within(rowOf('Write the essay')).getByRole('button', { name: 'Let it go' }));

    expect(probe().someday).toEqual([{ id: 'sail', remindOn: at(7) }]);
    expect(screen.queryByText('Write the essay')).toBeNull();
  });
});
