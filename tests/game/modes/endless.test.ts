import { describe, it, expect } from 'vitest';
import { endless } from '../../../src/game/modes/endless';
import type { Question, GameRunState } from '../../../src/game/types';

function q(id: string): Question {
  return { id, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp'], difficulty: 1, pantheon: 'griechisch' };
}
function freshState(): GameRunState {
  return { modeId: 'endless', themeFilter: 'alle', answeredIds: [], results: [], currentStreak: 0, bestStreakInRound: 0, startedAt: 0 };
}

describe('endless mode', () => {
  it('totalQuestions returns undefined (open-ended)', () => {
    expect(endless.totalQuestions([q('a')])).toBeUndefined();
  });

  it('selectNext returns an unused id while pool has unused', () => {
    const pool = [q('a'), q('b'), q('c')];
    const state: GameRunState = { ...freshState(), answeredIds: ['a'], results: ['correct'] };
    const next = endless.selectNext(pool, state);
    expect(['b', 'c']).toContain(next);
  });

  it('selectNext returns null when all questions in pool are exhausted', () => {
    const pool = [q('a'), q('b')];
    const state: GameRunState = { ...freshState(), answeredIds: ['a', 'b'], results: ['correct', 'wrong'] };
    expect(endless.selectNext(pool, state)).toBeNull();
  });
});
