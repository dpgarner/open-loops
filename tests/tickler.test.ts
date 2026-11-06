import {
  availableActions,
  dayDelta,
  deferredActions,
  dueActions,
  dueLabel,
  dueSomeday,
  isDeferred,
  isDue,
  nextWeekKey,
  ticklerDueCount,
  toDateKey,
  upcomingTickler,
} from '../src/selectors';
import { emptyState } from '../src/seed';
import type { Action, AppState, SomedayItem } from '../src/types';

// Fri 6 Nov 2026, 09:30 local time — every tickler rule depends on "today".
const NOW = new Date(2026, 10, 6, 9, 30, 0);

let seq = 0;
const makeAction = (over: Partial<Action> = {}): Action => ({
  id: `a${++seq}`,
  title: 'Draft the deck',
  context: '@computer',
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

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('date keys', () => {
  it('counts whole days from today, signed', () => {
    expect(dayDelta(at(0))).toBe(0);
    expect(dayDelta(at(1))).toBe(1);
    expect(dayDelta(at(-1))).toBe(-1);
    expect(dayDelta(at(10))).toBe(10);
  });

  it('crosses a month boundary', () => {
    jest.setSystemTime(new Date(2026, 9, 31, 12, 0, 0)); // 31 Oct
    expect(dayDelta('2026-11-01')).toBe(1);
    expect(dayDelta('2026-11-06')).toBe(6);
  });

  it('crosses a year boundary', () => {
    jest.setSystemTime(new Date(2026, 11, 31, 22, 0, 0)); // 31 Dec
    expect(dayDelta('2027-01-01')).toBe(1);
    expect(dayDelta('2026-12-31')).toBe(0);
  });

  it('pads month and day with zeroes', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('uses the local calendar rather than UTC', () => {
    // 00:30 local on 1 Jan: a UTC conversion could land on 31 Dec for anyone
    // west of Greenwich, which would make a tickler fire a day early or late.
    expect(toDateKey(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
  });

  it('nextWeekKey is seven days out', () => {
    expect(nextWeekKey()).toBe(at(7));
  });
});

describe('deferral and due dates', () => {
  it('treats a future date as deferred and today as not', () => {
    expect(isDeferred(makeAction({ ticklerDate: at(1) }))).toBe(true);
    expect(isDeferred(makeAction({ ticklerDate: at(0) }))).toBe(false);
    expect(isDeferred(makeAction({ ticklerDate: at(-3) }))).toBe(false);
    expect(isDeferred(makeAction({ ticklerDate: null }))).toBe(false);
  });

  it('treats today and anything overdue as due', () => {
    expect(isDue(at(0))).toBe(true);
    expect(isDue(at(-1))).toBe(true);
    expect(isDue(at(-30))).toBe(true);
    expect(isDue(at(1))).toBe(false);
    expect(isDue(null)).toBe(false);
  });

  it('flips from deferred to available at local midnight', () => {
    const tomorrow = at(1);
    const action = makeAction({ id: 'a-midnight', ticklerDate: tomorrow });
    const s = makeState({ actions: [action] });

    jest.setSystemTime(new Date(2026, 10, 6, 23, 59, 0));
    expect(isDeferred(action)).toBe(true);
    expect(availableActions(s)).toHaveLength(0);

    jest.setSystemTime(new Date(2026, 10, 7, 0, 1, 0));
    expect(isDeferred(action)).toBe(false);
    expect(availableActions(s)).toHaveLength(1);
  });

  it('describes how far off a date is', () => {
    expect(dueLabel(at(0))).toBe('due today');
    expect(dueLabel(at(-1))).toBe('1 day overdue');
    expect(dueLabel(at(-4))).toBe('4 days overdue');
    expect(dueLabel(at(1))).toBe('tomorrow');
    expect(dueLabel(at(9))).toBe('in 9 days');
  });
});

describe('what each list shows', () => {
  const s = makeState({
    actions: [
      makeAction({ id: 'open', ticklerDate: null }),
      makeAction({ id: 'today', ticklerDate: at(0) }),
      makeAction({ id: 'tomorrow', ticklerDate: at(1) }),
      makeAction({ id: 'nextweek', ticklerDate: at(7) }),
      makeAction({ id: 'overdue', ticklerDate: at(-2) }),
      makeAction({ id: 'done', done: true, doneAt: NOW.toISOString(), ticklerDate: at(-1) }),
    ],
  });

  const ids = (actions: Action[]) => actions.map((a) => a.id);

  it('keeps deferred actions out of the context lists', () => {
    expect(ids(availableActions(s))).toEqual(['open', 'today', 'overdue']);
  });

  it('lists only undone future actions as deferred', () => {
    expect(ids(deferredActions(s))).toEqual(['tomorrow', 'nextweek']);
  });

  it('collects actions that have come due, ignoring completed ones', () => {
    expect(ids(dueActions(s))).toEqual(['today', 'overdue']);
  });

  it('collects someday ideas that have come due', () => {
    const state = makeState({
      someday: [
        makeIdea({ id: 'past', remindOn: at(-1) }),
        makeIdea({ id: 'today', remindOn: at(0) }),
        makeIdea({ id: 'future', remindOn: at(3) }),
        makeIdea({ id: 'undated', remindOn: null }),
      ],
    });
    expect(dueSomeday(state).map((i) => i.id)).toEqual(['past', 'today']);
    expect(ticklerDueCount(state)).toBe(2);
  });

  it('counts both actions and ideas as due', () => {
    expect(ticklerDueCount(s)).toBe(2); // today + overdue
  });

  it('groups upcoming items by day, soonest first, excluding done and due', () => {
    const state = makeState({
      actions: [
        makeAction({ id: 'later', ticklerDate: at(14) }),
        makeAction({ id: 'done', done: true, ticklerDate: at(2) }),
        makeAction({ id: 'dueToday', ticklerDate: at(0) }),
        makeAction({ id: 'soon', ticklerDate: at(2) }),
      ],
      someday: [
        makeIdea({ id: 'ideaSoon', remindOn: at(2) }),
        makeIdea({ id: 'ideaLater', remindOn: at(9) }),
      ],
    });

    const days = upcomingTickler(state);
    expect(days.map((d) => d.date)).toEqual([at(2), at(9), at(14)]);
    expect(days[0].actions.map((a) => a.id)).toEqual(['soon']);
    expect(days[0].someday.map((i) => i.id)).toEqual(['ideaSoon']);
    expect(days[1].actions).toHaveLength(0);
    expect(days[2].actions.map((a) => a.id)).toEqual(['later']);
  });

  it('has nothing upcoming when everything is undated or done', () => {
    const state = makeState({ actions: [makeAction(), makeAction({ done: true, ticklerDate: at(3) })] });
    expect(upcomingTickler(state)).toEqual([]);
  });
});
