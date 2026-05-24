import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadState,
  saveState,
  resetState,
  recordAnswer,
  recordRound,
  setThemeFilter,
  toggleLexikonRead,
  isLexikonRead,
} from '../../src/storage/appState';
import { STORAGE_KEY, makeDefaultState } from '../../src/storage/schema';

beforeEach(() => {
  localStorage.clear();
});

describe('loadState', () => {
  it('returns defaults when storage is empty', () => {
    const state = loadState();
    expect(state).toEqual(makeDefaultState());
  });

  it('returns defaults when stored schemaVersion mismatches', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 999 }));
    const state = loadState();
    expect(state).toEqual(makeDefaultState());
  });

  it('returns defaults when stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const state = loadState();
    expect(state).toEqual(makeDefaultState());
  });

  it('returns defaults when stored object lacks required fields', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1 }));
    const state = loadState();
    expect(state).toEqual(makeDefaultState());
  });

  it('returns stored state when valid', () => {
    const state = makeDefaultState();
    state.totals.gamesPlayed = 7;
    saveState(state);
    expect(loadState().totals.gamesPlayed).toBe(7);
  });
});

describe('recordAnswer', () => {
  it('increments correctCount on correct answer', () => {
    const state = makeDefaultState();
    const next = recordAnswer(state, 'q-1', true);
    expect(next.perQuestion['q-1'].correctCount).toBe(1);
    expect(next.perQuestion['q-1'].wrongCount).toBe(0);
    expect(next.perQuestion['q-1'].lastResult).toBe('correct');
    expect(next.perQuestion['q-1'].lastSeen).toBeGreaterThan(0);
  });

  it('increments wrongCount on wrong answer', () => {
    const state = makeDefaultState();
    const next = recordAnswer(state, 'q-1', false);
    expect(next.perQuestion['q-1'].correctCount).toBe(0);
    expect(next.perQuestion['q-1'].wrongCount).toBe(1);
    expect(next.perQuestion['q-1'].lastResult).toBe('wrong');
  });

  it('accumulates counts across multiple answers', () => {
    let s = makeDefaultState();
    s = recordAnswer(s, 'q-1', true);
    s = recordAnswer(s, 'q-1', false);
    s = recordAnswer(s, 'q-1', true);
    expect(s.perQuestion['q-1'].correctCount).toBe(2);
    expect(s.perQuestion['q-1'].wrongCount).toBe(1);
  });
});

describe('recordRound', () => {
  it('appends to rounds, updates totals, updates bestStreakAllTime', () => {
    let s = makeDefaultState();
    s = recordRound(s, {
      date: 1000,
      mode: 'ten',
      themeFilter: { topics: [], pantheon: 'beide' },
      score: 8,
      total: 10,
      bestStreakInRound: 5,
      answeredIds: ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'],
      results: ['correct','correct','correct','correct','correct','correct','correct','correct','wrong','wrong'],
    });
    expect(s.rounds).toHaveLength(1);
    expect(s.totals.gamesPlayed).toBe(1);
    expect(s.totals.correctTotal).toBe(8);
    expect(s.totals.wrongTotal).toBe(2);
    expect(s.totals.bestStreakAllTime).toBe(5);
  });

  it('does not lower bestStreakAllTime on later worse round', () => {
    let s = makeDefaultState();
    s = recordRound(s, { date: 1, mode: 'ten', themeFilter: { topics: [], pantheon: 'beide' }, score: 10, total: 10, bestStreakInRound: 10, answeredIds: [], results: [] });
    s = recordRound(s, { date: 2, mode: 'ten', themeFilter: { topics: [], pantheon: 'beide' }, score: 3, total: 10, bestStreakInRound: 1, answeredIds: [], results: [] });
    expect(s.totals.bestStreakAllTime).toBe(10);
  });

  it('caps rounds list at MAX_ROUNDS_KEPT (50), keeping most recent', () => {
    let s = makeDefaultState();
    for (let i = 0; i < 55; i++) {
      s = recordRound(s, { date: i, mode: 'ten', themeFilter: { topics: [], pantheon: 'beide' }, score: 0, total: 10, bestStreakInRound: 0, answeredIds: [], results: [] });
    }
    expect(s.rounds).toHaveLength(50);
    expect(s.rounds[0].date).toBe(5);
    expect(s.rounds[49].date).toBe(54);
  });
});

describe('setThemeFilter', () => {
  it('updates settings.themeFilter', () => {
    const s = setThemeFilter(makeDefaultState(), { topics: ['olymp'], pantheon: 'griechisch' });
    expect(s.settings.themeFilter).toEqual({ topics: ['olymp'], pantheon: 'griechisch' });
  });
});

describe('resetState', () => {
  it('wipes localStorage and returns defaults', () => {
    saveState({ ...makeDefaultState(), totals: { gamesPlayed: 9, correctTotal: 1, wrongTotal: 1, bestStreakAllTime: 1 } });
    const fresh = resetState();
    expect(fresh).toEqual(makeDefaultState());
    expect(loadState()).toEqual(makeDefaultState());
  });
});

describe('schema v1 → v2 migration', () => {
  it('migrates a valid v1 state by adding empty lexikonRead', () => {
    const v1 = {
      schemaVersion: 1,
      perQuestion: {},
      rounds: [],
      totals: { gamesPlayed: 0, correctTotal: 0, wrongTotal: 0, bestStreakAllTime: 0 },
      settings: { themeFilter: { topics: [], pantheon: 'beide' } },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1));
    const loaded = loadState();
    expect(loaded.schemaVersion).toBe(2);
    expect(loaded.lexikonRead).toEqual({ figures: [], stories: [] });
  });

  it('preserves v2 state across reload', () => {
    const v2 = makeDefaultState();
    v2.lexikonRead.figures.push('zeus');
    saveState(v2);
    const loaded = loadState();
    expect(loaded.lexikonRead.figures).toContain('zeus');
  });

  it('resets to defaults for unknown schemaVersion', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 999 }));
    expect(loadState()).toEqual(makeDefaultState());
  });

  it('migrates v1 state with legacy string themeFilter', () => {
    const v1Legacy = {
      schemaVersion: 1,
      perQuestion: {},
      rounds: [],
      totals: { gamesPlayed: 0, correctTotal: 0, wrongTotal: 0, bestStreakAllTime: 0 },
      settings: { themeFilter: 'alle' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1Legacy));
    const loaded = loadState();
    expect(loaded.schemaVersion).toBe(2);
    expect(loaded.lexikonRead).toEqual({ figures: [], stories: [] });
    expect(loaded.settings.themeFilter).toEqual({ topics: [], pantheon: 'beide' });
  });
});

describe('toggleLexikonRead', () => {
  it('adds a figure id when not present', () => {
    const s = toggleLexikonRead(makeDefaultState(), { kind: 'figure', id: 'zeus' });
    expect(s.lexikonRead.figures).toEqual(['zeus']);
    expect(s.lexikonRead.stories).toEqual([]);
  });

  it('removes a figure id when already present', () => {
    let s = makeDefaultState();
    s.lexikonRead.figures.push('zeus');
    s = toggleLexikonRead(s, { kind: 'figure', id: 'zeus' });
    expect(s.lexikonRead.figures).toEqual([]);
  });

  it('toggles stories independently of figures', () => {
    const s = toggleLexikonRead(makeDefaultState(), { kind: 'story', id: 'troja' });
    expect(s.lexikonRead.stories).toEqual(['troja']);
    expect(s.lexikonRead.figures).toEqual([]);
  });

  it('does not mutate input state', () => {
    const before = makeDefaultState();
    const after = toggleLexikonRead(before, { kind: 'figure', id: 'zeus' });
    expect(before.lexikonRead.figures).toEqual([]);
    expect(after).not.toBe(before);
  });
});

describe('isLexikonRead', () => {
  it('returns false when not in list', () => {
    expect(isLexikonRead(makeDefaultState(), { kind: 'figure', id: 'zeus' })).toBe(false);
  });

  it('returns true when figure id is in list', () => {
    const s = makeDefaultState();
    s.lexikonRead.figures.push('zeus');
    expect(isLexikonRead(s, { kind: 'figure', id: 'zeus' })).toBe(true);
  });

  it('does not cross figure/story namespaces', () => {
    const s = makeDefaultState();
    s.lexikonRead.figures.push('troja');
    expect(isLexikonRead(s, { kind: 'story', id: 'troja' })).toBe(false);
  });
});
