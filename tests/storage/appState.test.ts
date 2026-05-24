import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadState,
  saveState,
  resetState,
  recordAnswer,
  recordRound,
  setThemeFilter,
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
