import { STORAGE_KEY, dateOrNull, looksLikeExport, normalize } from '../src/store-data';
import { emptyState } from '../src/seed';

describe('looksLikeExport', () => {
  it('accepts an object carrying at least one of our lists', () => {
    expect(looksLikeExport({ inbox: [] })).toBe(true);
    expect(looksLikeExport({ someday: [] })).toBe(true);
    expect(
      looksLikeExport({ inbox: [], actions: [], projects: [], waiting: [], someday: [] }),
    ).toBe(true);
  });

  it('rejects everything else', () => {
    expect(looksLikeExport({})).toBe(false);
    expect(looksLikeExport({ hello: 'world' })).toBe(false);
    expect(looksLikeExport({ inbox: 'not a list' })).toBe(false);
    expect(looksLikeExport([])).toBe(false);
    expect(looksLikeExport(null)).toBe(false);
    expect(looksLikeExport('inbox')).toBe(false);
    expect(looksLikeExport(42)).toBe(false);
  });
});

describe('dateOrNull', () => {
  it('keeps a date-only key', () => {
    expect(dateOrNull('2026-11-06')).toBe('2026-11-06');
  });

  it('rejects anything that is not a date-only key', () => {
    expect(dateOrNull('06/11/2026')).toBeNull();
    expect(dateOrNull('2026-11-06T10:00:00.000Z')).toBeNull();
    expect(dateOrNull('')).toBeNull();
    expect(dateOrNull(20261106)).toBeNull();
    expect(dateOrNull(undefined)).toBeNull();
    expect(dateOrNull(null)).toBeNull();
  });
});

describe('normalize', () => {
  it('returns an empty system for junk', () => {
    const result = normalize(null);
    expect(result).toEqual(emptyState());
    expect(normalize('nope')).toEqual(emptyState());
    expect(normalize([])).toEqual(emptyState());
  });

  it('keeps the lists it was given', () => {
    const result = normalize({
      inbox: [{ id: 'i1', text: 'Something', createdAt: '2026-11-01T00:00:00.000Z' }],
      actions: [],
      projects: [],
      waiting: [],
      someday: [],
      contexts: ['@calls'],
      lastReview: '2026-10-28T10:00:00.000Z',
      reviews: ['2026-10-28T10:00:00.000Z'],
    });
    expect(result.inbox).toHaveLength(1);
    expect(result.contexts).toEqual(['@calls']);
    expect(result.lastReview).toBe('2026-10-28T10:00:00.000Z');
    expect(result.reviews).toHaveLength(1);
  });

  it('supplies default contexts when none are saved', () => {
    expect(normalize({ inbox: [] }).contexts.length).toBeGreaterThan(0);
    expect(normalize({ inbox: [], contexts: [] }).contexts).toEqual(emptyState().contexts);
  });

  it('repairs a missing or invalid tickler date without dropping the action', () => {
    const result = normalize({
      actions: [
        { id: 'a1', title: 'Dated', context: '@home', done: false, ticklerDate: '2026-11-09' },
        { id: 'a2', title: 'Junk date', context: '@home', done: false, ticklerDate: 'soon' },
        { id: 'a3', title: 'No date', context: '@home', done: false },
      ],
    });
    expect(result.actions).toHaveLength(3);
    expect(result.actions[0].ticklerDate).toBe('2026-11-09');
    expect(result.actions[1].ticklerDate).toBeNull();
    expect(result.actions[2].ticklerDate).toBeNull();
  });

  it('repairs a missing or invalid someday reminder', () => {
    const result = normalize({
      someday: [
        { id: 's1', title: 'Dated', note: '', remindOn: '2026-11-20' },
        { id: 's2', title: 'Junk', note: '', remindOn: 'later' },
      ],
    });
    expect(result.someday[0].remindOn).toBe('2026-11-20');
    expect(result.someday[1].remindOn).toBeNull();
  });

  it('ignores a lastReview that is not a string', () => {
    expect(normalize({ lastReview: 12345 }).lastReview).toBeNull();
  });
});

describe('STORAGE_KEY', () => {
  it('is the key the app reads and writes', () => {
    expect(STORAGE_KEY).toBe('open-loops.v1');
  });
});
