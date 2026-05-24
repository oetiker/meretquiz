import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  MAX_ROUNDS_KEPT,
  makeDefaultState,
  type AppState,
  type RoundRecord,
  type ThemeFilter,
} from './schema';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefaultState();
    const parsed = JSON.parse(raw);
    if (parsed?.schemaVersion !== SCHEMA_VERSION) return makeDefaultState();
    // Shape guard: a hand-edited localStorage entry with just `{schemaVersion: 1}`
    // would pass the version check but crash downstream callers.
    if (!parsed.perQuestion || !parsed.rounds || !parsed.totals || !parsed.settings) {
      return makeDefaultState();
    }
    // Migration from V1 pre-orthogonal-filter: themeFilter was a string
    // ('alle' | 'olymp' | ...). New shape is {topics, pantheon}. Reset
    // to defaults if we see the old string form — no schema version bump
    // because V1 is the only released version and no real user data exists.
    if (typeof parsed.settings.themeFilter === 'string') {
      parsed.settings.themeFilter = { topics: [], pantheon: 'beide' };
    }
    // Same migration for rounds[].themeFilter
    for (const r of parsed.rounds) {
      if (typeof r.themeFilter === 'string') {
        r.themeFilter = { topics: [], pantheon: 'beide' };
      }
    }
    return parsed as AppState;
  } catch {
    return makeDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — swallow; UI keeps in-memory state.
  }
}

export function recordAnswer(state: AppState, questionId: string, correct: boolean): AppState {
  const existing = state.perQuestion[questionId] ?? {
    correctCount: 0,
    wrongCount: 0,
    lastSeen: 0,
    lastResult: null,
  };
  return {
    ...state,
    perQuestion: {
      ...state.perQuestion,
      [questionId]: {
        correctCount: existing.correctCount + (correct ? 1 : 0),
        wrongCount: existing.wrongCount + (correct ? 0 : 1),
        lastSeen: Date.now(),
        lastResult: correct ? 'correct' : 'wrong',
      },
    },
  };
}

export function recordRound(state: AppState, round: RoundRecord): AppState {
  const newRounds = [...state.rounds, round].slice(-MAX_ROUNDS_KEPT);
  return {
    ...state,
    rounds: newRounds,
    totals: {
      gamesPlayed: state.totals.gamesPlayed + 1,
      correctTotal: state.totals.correctTotal + round.score,
      wrongTotal: state.totals.wrongTotal + (round.total - round.score),
      bestStreakAllTime: Math.max(state.totals.bestStreakAllTime, round.bestStreakInRound),
    },
  };
}

export function setThemeFilter(state: AppState, filter: ThemeFilter): AppState {
  return { ...state, settings: { ...state.settings, themeFilter: filter } };
}

export function resetState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return makeDefaultState();
}
