import type { GameMode, Question, GameRunState } from '../types';
import { pickRandomUnused } from '../selectQuestion';

const TARGET = 10;

export const tenQuestions: GameMode = {
  id: 'ten',
  label: '10 Fragen',
  totalQuestions(pool: Question[]) {
    return Math.min(TARGET, pool.length);
  },
  selectNext(pool: Question[], state: GameRunState): string | null {
    if (state.answeredIds.length >= TARGET) return null;
    const next = pickRandomUnused(pool, state.answeredIds);
    return next ? next.id : null;
  },
};
