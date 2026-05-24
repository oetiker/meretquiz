export const STORAGE_KEY = 'meretsMythologie.v1';
export const SCHEMA_VERSION = 1 as const;

export type GameModeId = 'ten' | 'endless' | 'learn';
export type ThemeFilter = 'alle' | 'olymp' | 'helden' | 'monster' | 'mythen' | 'griechisch' | 'roemisch';

export interface QuestionStats {
  correctCount: number;
  wrongCount: number;
  lastSeen: number;       // unix ms; 0 if never
  lastResult: 'correct' | 'wrong' | null;
}

export interface RoundRecord {
  date: number;
  mode: GameModeId;
  themeFilter: ThemeFilter;
  score: number;
  total: number;
  bestStreakInRound: number;
  answeredIds: string[];                      // ordered, length == total
  results: Array<'correct' | 'wrong'>;        // ordered, length == total
}

export interface Totals {
  gamesPlayed: number;
  correctTotal: number;
  wrongTotal: number;
  bestStreakAllTime: number;
}

export interface Settings {
  themeFilter: ThemeFilter;
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  perQuestion: Record<string, QuestionStats>;
  rounds: RoundRecord[];
  totals: Totals;
  settings: Settings;
}

export const MAX_ROUNDS_KEPT = 50;

export function makeDefaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    perQuestion: {},
    rounds: [],
    totals: {
      gamesPlayed: 0,
      correctTotal: 0,
      wrongTotal: 0,
      bestStreakAllTime: 0,
    },
    settings: {
      themeFilter: 'alle',
    },
  };
}
