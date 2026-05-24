import type { GameMode, Question, GameRunState } from '../types';
import { pickRandomUnused } from '../selectQuestion';

export const endless: GameMode = {
  id: 'endless',
  label: 'Endless',
  totalQuestions() {
    return undefined;
  },
  selectNext(pool: Question[], state: GameRunState): string | null {
    const next = pickRandomUnused(pool, state.answeredIds);
    return next ? next.id : null;
  },
};
