import { fireEvent, render, screen, within } from '@testing-library/react';
import NextActionsView from '../src/components/NextActionsView';
import { StoreProvider } from '../src/store';
import { useStore } from '../src/store-context';
import { STORAGE_KEY } from '../src/store-data';
import { emptyState } from '../src/seed';
import type { Action, AppState } from '../src/types';

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

const makeState = (over: Partial<AppState> = {}): AppState => ({ ...emptyState(), ...over });

/** A date-only key offset from the fixed "today". */
const at = (offsetDays: number): string => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

interface ProbeAction {
  id: string;
  title: string;
  context: string;
  done: boolean;
  date: string | null;
}

interface ProbeState {
  actions: ProbeAction[];
  contexts: string[];
}

function Probe() {
  const { state } = useStore();
  const view: ProbeState = {
    actions: state.actions.map((a) => ({
      id: a.id,
      title: a.title,
      context: a.context,
      done: a.done,
      date: a.ticklerDate,
    })),
    contexts: state.contexts,
  };
  return <div data-testid="probe">{JSON.stringify(view)}</div>;
}

function renderActions(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return render(
    <StoreProvider>
      <NextActionsView />
      <Probe />
    </StoreProvider>,
  );
}

const probe = (): ProbeState => JSON.parse(screen.getByTestId('probe').textContent ?? '{}');
const rowOf = (title: string) => screen.getByText(title).closest('li') as HTMLElement;
const addForm = () =>
  screen.getByPlaceholderText('Add a next action — one physical step').closest('form') as HTMLFormElement;
const addedAction = (title: string) => probe().actions.find((a) => a.title === title);

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

const baseActions = () => [
  makeAction({ id: 'call', title: 'Ring the venue', context: '@calls' }),
  makeAction({ id: 'write', title: 'Draft the deck', context: '@computer' }),
  makeAction({ id: 'done', title: 'Book the room', context: '@computer', done: true, doneAt: NOW.toISOString() }),
];

const base = () => makeState({ actions: baseActions() });

describe('the next actions list', () => {
  it('groups open actions by context and holds dated ones back', () => {
    renderActions(
      makeState({
        actions: [
          ...baseActions(),
          makeAction({ id: 'later', title: 'Chase the invoice', context: '@calls', ticklerDate: at(2) }),
        ],
      }),
    );

    expect(screen.getByRole('heading', { name: /@calls/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /@computer/ })).toBeTruthy();
    expect(screen.getByText('Ring the venue')).toBeTruthy();
    expect(screen.getByText('Draft the deck')).toBeTruthy();

    expect(screen.getByText('Deferred')).toBeTruthy();
    expect(screen.getByText('Chase the invoice')).toBeTruthy();
    expect(screen.getByText('resurfaces in 2 days')).toBeTruthy();

    // Completed actions stay out of the way until asked for.
    expect(screen.queryByText('Book the room')).toBeNull();
  });

  it('adds an action from the form under the chosen context', () => {
    renderActions(base());

    fireEvent.change(within(addForm()).getByPlaceholderText('Add a next action — one physical step'), {
      target: { value: 'Pick up the keys' },
    });
    fireEvent.change(within(addForm()).getAllByRole('combobox')[0], { target: { value: '@errands' } });
    fireEvent.click(within(addForm()).getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Pick up the keys')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /@errands/ })).toBeTruthy();
    expect(addedAction('Pick up the keys')?.context).toBe('@errands');
    expect(addedAction('Pick up the keys')?.date).toBeNull();
  });

  it('adds an action straight into the future when the form carries a date', () => {
    renderActions(base());

    fireEvent.change(within(addForm()).getByPlaceholderText('Add a next action — one physical step'), {
      target: { value: 'Renew the domain' },
    });
    fireEvent.change(screen.getByLabelText('Resurface on'), { target: { value: at(4) } });
    fireEvent.click(within(addForm()).getByRole('button', { name: 'Add' }));

    expect(screen.getByText('resurfaces in 4 days')).toBeTruthy();
    expect(addedAction('Renew the domain')?.date).toBe(at(4));
  });

  it('creates a context typed into the box, adding the @ if it was left off', () => {
    renderActions(base());

    const box = screen.getByPlaceholderText('New context, e.g. @workshop');
    fireEvent.change(box, { target: { value: 'workshop' } });
    fireEvent.keyDown(box, { key: 'Enter' });

    expect(probe().contexts).toContain('@workshop');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toContain('@workshop');
  });

  it('defers an action with the tickler control and brings it back when cleared', () => {
    renderActions(base());

    fireEvent.click(within(rowOf('Ring the venue')).getByRole('button', { name: 'Set a resurface date' }));
    // The popover group and its input share the same label, so narrow to the field.
    fireEvent.change(screen.getByLabelText('Resurface date', { selector: 'input' }), {
      target: { value: at(3) },
    });

    expect(probe().actions.find((a) => a.id === 'call')?.date).toBe(at(3));
    expect(screen.getByText('Deferred')).toBeTruthy();
    expect(screen.getByText('resurfaces in 3 days')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /@calls/ })).toBeNull();

    const deferredRow = rowOf('Ring the venue');
    fireEvent.click(within(deferredRow).getByRole('button', { name: /^Resurface date/ }));
    fireEvent.click(within(deferredRow).getByRole('button', { name: 'Clear' }));

    expect(probe().actions.find((a) => a.id === 'call')?.date).toBeNull();
    expect(screen.queryByText('Deferred')).toBeNull();
    expect(screen.getByRole('heading', { name: /@calls/ })).toBeTruthy();
  });

  it('ticks an action off and reveals it again behind Show completed', () => {
    renderActions(base());

    fireEvent.click(within(rowOf('Draft the deck')).getByRole('checkbox'));

    expect(screen.queryByText('Draft the deck')).toBeNull();
    expect(addedAction('Draft the deck')?.done).toBe(true);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Show completed' }));
    expect(screen.getByText('Draft the deck')).toBeTruthy();
    expect(screen.getByText('Book the room')).toBeTruthy();
  });

  it('deletes an action from its row', () => {
    renderActions(base());

    fireEvent.click(within(rowOf('Draft the deck')).getByTitle('Delete action'));

    expect(screen.queryByText('Draft the deck')).toBeNull();
    expect(addedAction('Draft the deck')).toBeUndefined();
  });
});
