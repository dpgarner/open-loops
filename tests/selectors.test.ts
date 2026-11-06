import {
  activeProjects,
  daysSince,
  formatDate,
  isStuck,
  nextActionFor,
  openActions,
  reviewIsDue,
} from '../src/selectors';
import { emptyState } from '../src/seed';
import type { Action, AppState, Project } from '../src/types';

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

const makeState = (over: Partial<AppState> = {}): AppState => ({ ...emptyState(), ...over });

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('next actions', () => {
  it('excludes completed actions', () => {
    const state = makeState({
      actions: [makeAction({ id: 'open' }), makeAction({ id: 'done', done: true })],
    });
    expect(openActions(state).map((a) => a.id)).toEqual(['open']);
  });

  it('finds the first open action for a project', () => {
    const project = makeProject({ id: 'p-one' });
    const state = makeState({
      projects: [project],
      actions: [
        makeAction({ id: 'done', projectId: 'p-one', done: true }),
        makeAction({ id: 'open', projectId: 'p-one' }),
        makeAction({ id: 'other', projectId: 'p-two' }),
      ],
    });
    expect(nextActionFor(state, 'p-one')?.id).toBe('open');
    expect(nextActionFor(state, 'p-two')?.id).toBe('other');
    expect(nextActionFor(state, 'p-missing')).toBeNull();
  });
});

describe('projects', () => {
  it('flags an active project with no open action as stuck', () => {
    const state = makeState({
      projects: [makeProject({ id: 'p-stuck' })],
      actions: [makeAction({ projectId: 'p-stuck', done: true })],
    });
    expect(isStuck(state, 'p-stuck')).toBe(true);
  });

  it('is not stuck once it has a next action', () => {
    const state = makeState({
      projects: [makeProject({ id: 'p-ok' })],
      actions: [makeAction({ projectId: 'p-ok' })],
    });
    expect(isStuck(state, 'p-ok')).toBe(false);
  });

  it('only considers active projects', () => {
    const onHold = makeProject({ id: 'p-hold', status: 'on-hold' });
    const completed = makeProject({ id: 'p-done', status: 'completed' });
    const state = makeState({ projects: [onHold, completed] });
    expect(isStuck(state, 'p-hold')).toBe(false);
    expect(isStuck(state, 'p-done')).toBe(false);
    expect(isStuck(state, 'p-missing')).toBe(false);
    expect(activeProjects(state)).toHaveLength(0);
  });

  it('counts only active projects', () => {
    const state = makeState({
      projects: [
        makeProject({ status: 'active' }),
        makeProject({ status: 'active' }),
        makeProject({ status: 'on-hold' }),
        makeProject({ status: 'completed' }),
      ],
    });
    expect(activeProjects(state)).toHaveLength(2);
  });
});

describe('the review nag', () => {
  it('is due when there has never been a review', () => {
    expect(reviewIsDue(makeState({ lastReview: null }))).toBe(true);
  });

  it('is not due within the week', () => {
    expect(reviewIsDue(makeState({ lastReview: isoDaysAgo(1) }))).toBe(false);
    expect(reviewIsDue(makeState({ lastReview: isoDaysAgo(6) }))).toBe(false);
  });

  it('is due at seven days and beyond', () => {
    expect(reviewIsDue(makeState({ lastReview: isoDaysAgo(7) }))).toBe(true);
    expect(reviewIsDue(makeState({ lastReview: isoDaysAgo(9) }))).toBe(true);
  });
});

describe('formatting', () => {
  it('counts whole days since an ISO timestamp', () => {
    expect(daysSince(isoDaysAgo(3))).toBe(3);
    expect(daysSince(isoDaysAgo(0))).toBe(0);
  });

  it('never reports negative days for a future timestamp', () => {
    expect(daysSince(new Date(NOW.getTime() + 2 * DAY).toISOString())).toBe(0);
  });

  it('renders a missing date as "never" and a real one with a year', () => {
    expect(formatDate(null)).toBe('never');
    expect(formatDate('2026-10-28T10:00:00.000Z')).toMatch(/\d{4}/);
  });
});
