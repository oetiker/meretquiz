import type { GameModeId, ThemeFilter } from '../storage/schema';

export type Pantheon = 'griechisch' | 'roemisch' | 'beide';

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  themes: string[];                  // tag values from ThemeFilter except 'alle'
  difficulty: 1 | 2 | 3;
  pantheon: Pantheon;
  relatedIds?: string[];
}

export type GameStateStatus = 'in-progress' | 'finished';

export interface GameRunState {
  modeId: GameModeId;
  themeFilter: ThemeFilter;
  answeredIds: string[];             // in order
  results: Array<'correct' | 'wrong'>;
  currentStreak: number;
  bestStreakInRound: number;
  startedAt: number;                 // unix ms
}

export interface GameMode {
  id: GameModeId;
  label: string;                     // German UI label
  /** Pick the next question id, or null if the round is over. */
  selectNext(pool: Question[], state: GameRunState): string | null;
  /** Does this mode have a fixed total? Used for progress bars. Undefined = open-ended. */
  totalQuestions(pool: Question[]): number | undefined;
}
