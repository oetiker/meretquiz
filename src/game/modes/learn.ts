import type { GameMode, Question, GameRunState } from '../types';
import { pickWeightedForLearning, type QuestionStatsLike } from '../selectQuestion';

const TARGET = 10;

export function makeLearnMode(statsFor: (id: string) => QuestionStatsLike | undefined): GameMode {
  return {
    id: 'learn',
    label: 'Lernen',
    totalQuestions(pool: Question[]) {
      return Math.min(TARGET, pool.length);
    },
    selectNext(pool: Question[], state: GameRunState): string | null {
      if (state.answeredIds.length >= TARGET) return null;
      const next = pickWeightedForLearning(pool, state.answeredIds, statsFor);
      return next ? next.id : null;
    },
  };
}

// Default export uses no stats source (uniform random + recency-only).
// Real app wires it up in App.svelte via makeLearnMode(perQuestionStats).
export const learn: GameMode = makeLearnMode(() => undefined);
