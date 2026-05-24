export const STORAGE_KEY = 'meretsMythologie.v1';
export const SCHEMA_VERSION = 2 as const;

export type GameModeId = 'ten' | 'endless' | 'learn';
export type TopicTag = 'olymp' | 'helden' | 'monster' | 'mythen';
export type PantheonFilter = 'beide' | 'griechisch' | 'roemisch';

export interface ThemeFilter {
  topics: TopicTag[];
  pantheon: PantheonFilter;
}

export interface QuestionStats {
  correctCount: number;
  wrongCount: number;
  lastSeen: number;
  lastResult: 'correct' | 'wrong' | null;
}

export interface RoundRecord {
  date: number;
  mode: GameModeId;
  themeFilter: ThemeFilter;
  score: number;
  total: number;
  bestStreakInRound: number;
  answeredIds: string[];
  results: Array<'correct' | 'wrong'>;
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

export interface LexikonRead {
  figures: string[];
  stories: string[];
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  perQuestion: Record<string, QuestionStats>;
  rounds: RoundRecord[];
  totals: Totals;
  settings: Settings;
  lexikonRead: LexikonRead;
}

export const MAX_ROUNDS_KEPT = 50;

export function makeDefaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    perQuestion: {},
    rounds: [],
    totals: { gamesPlayed: 0, correctTotal: 0, wrongTotal: 0, bestStreakAllTime: 0 },
    settings: { themeFilter: { topics: [], pantheon: 'beide' } },
    lexikonRead: { figures: [], stories: [] },
  };
}
