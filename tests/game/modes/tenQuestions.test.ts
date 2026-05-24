import { describe, it, expect } from 'vitest';
import { tenQuestions } from '../../../src/game/modes/tenQuestions';
import type { Question, GameRunState } from '../../../src/game/types';

function q(id: string): Question {
  return { id, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp'], difficulty: 1, pantheon: 'griechisch' };
}
function freshState(): GameRunState {
  return { modeId: 'ten', themeFilter: 'alle', answeredIds: [], results: [], currentStreak: 0, bestStreakInRound: 0, startedAt: 0 };
}

describe('tenQuestions mode', () => {
  it('totalQuestions returns 10 when pool has >=10', () => {
    const pool = Array.from({ length: 15 }, (_, i) => q(`q${i}`));
    expect(tenQuestions.totalQuestions(pool)).toBe(10);
  });

  it('totalQuestions returns pool size when pool < 10', () => {
    const pool = [q('a'), q('b'), q('c')];
    expect(tenQuestions.totalQuestions(pool)).toBe(3);
  });

  it('selectNext returns null after 10 answered', () => {
    const pool = Array.from({ length: 15 }, (_, i) => q(`q${i}`));
    const state: GameRunState = { ...freshState(), answeredIds: Array.from({ length: 10 }, (_, i) => `q${i}`), results: Array(10).fill('correct') };
    expect(tenQuestions.selectNext(pool, state)).toBeNull();
  });

  it('selectNext returns null when pool exhausted before 10', () => {
    const pool = [q('a'), q('b')];
    const state: GameRunState = { ...freshState(), answeredIds: ['a', 'b'], results: ['correct', 'correct'] };
    expect(tenQuestions.selectNext(pool, state)).toBeNull();
  });

  it('selectNext returns an unused id when answered < 10 and pool has unused', () => {
    const pool = [q('a'), q('b'), q('c')];
    const state: GameRunState = { ...freshState(), answeredIds: ['a'], results: ['correct'] };
    const next = tenQuestions.selectNext(pool, state);
    expect(['b', 'c']).toContain(next);
  });
});
