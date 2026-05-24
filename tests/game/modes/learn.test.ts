import { describe, it, expect } from 'vitest';
import { learn, makeLearnMode } from '../../../src/game/modes/learn';
import type { Question, GameRunState } from '../../../src/game/types';

function q(id: string): Question {
  return { id, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp'], difficulty: 1, pantheon: 'griechisch' };
}
function freshState(): GameRunState {
  return { modeId: 'learn', themeFilter: 'alle', answeredIds: [], results: [], currentStreak: 0, bestStreakInRound: 0, startedAt: 0 };
}

describe('learn mode', () => {
  it('exported learn has id "learn" and a German label', () => {
    expect(learn.id).toBe('learn');
    expect(learn.label).toMatch(/lern/i);
  });

  it('totalQuestions returns 10 capped by pool size', () => {
    expect(learn.totalQuestions(Array.from({ length: 20 }, (_, i) => q(`q${i}`)))).toBe(10);
    expect(learn.totalQuestions([q('a'), q('b')])).toBe(2);
  });

  it('selectNext returns null after target reached', () => {
    const pool = Array.from({ length: 20 }, (_, i) => q(`q${i}`));
    const state: GameRunState = { ...freshState(), answeredIds: Array.from({ length: 10 }, (_, i) => `q${i}`), results: Array(10).fill('correct') };
    expect(learn.selectNext(pool, state)).toBeNull();
  });

  it('selectNext returns an unused id while target not reached', () => {
    const pool = [q('a'), q('b'), q('c')];
    const state: GameRunState = { ...freshState(), answeredIds: ['a'], results: ['correct'] };
    expect(['b', 'c']).toContain(learn.selectNext(pool, state));
  });

  it('makeLearnMode with stats favors questions with more wrong than correct', () => {
    // Statistical check: over many trials, the wrong-heavy question should be picked more often
    const pool = [q('right'), q('wrong')];
    const stats: Record<string, { correctCount: number; wrongCount: number; lastSeen: number }> = {
      right: { correctCount: 10, wrongCount: 0, lastSeen: Date.now() },
      wrong: { correctCount: 0, wrongCount: 10, lastSeen: Date.now() },
    };
    const mode = makeLearnMode(id => stats[id]);

    let wrongPicks = 0;
    const N = 500;
    for (let i = 0; i < N; i++) {
      const picked = mode.selectNext(pool, freshState());
      if (picked === 'wrong') wrongPicks++;
    }
    // Expect "wrong" picked majority of the time
    expect(wrongPicks).toBeGreaterThan(N * 0.7);
  });
});
