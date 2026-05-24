# Mytho-Lexikon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an in-app reference for figures (gods, heroes, monsters, titans) and stories (myths) — accessible from the explanation box of every question and from a book icon in the title bar on non-quiz views.

**Architecture:** Two static data modules (`figures.ts`, `stories.ts`) bundled with the app. Cross-linked via inline `[[id]]` tokens parsed by a tiny tokenizer. Surfaced through a Svelte modal-overlay with its own back-stack that floats above the existing view switcher. Read-state persists in `localStorage` (schema bumped v1 → v2 with automatic migration).

**Tech Stack:** Svelte 5 Runes · TypeScript · Vite · Vitest + happy-dom · pnpm

**Spec:** [`docs/superpowers/specs/2026-05-24-mytho-lexikon-design.md`](../specs/2026-05-24-mytho-lexikon-design.md)

---

## Conventions

- Tests live in `tests/`, mirror source paths (`src/lexikon/resolver.ts` → `tests/lexikon/resolver.test.ts`).
- All Svelte files use the **Runes API** (`$state`, `$derived`, `$props`, `$effect`). No legacy reactive syntax.
- Run **`pnpm test`** to verify unit tests, **`pnpm check`** to verify types (NOT `pnpm exec tsc --noEmit` — the project-references config makes plain tsc silently miss app code).
- Commit after every task. Conventional-commit-style messages (`feat:`, `test:`, `refactor:`, `data:`).
- Use **`du`** (Schweizer Du), inclusive German, **ss** statt **ß** in all user-visible strings.

---

## Phase A — Schema & Resolver (no UI; pure logic, fully testable)

### Task 1: Lexikon types module

**Files:**
- Create: `src/lexikon/types.ts`

- [ ] **Step 1: Write the type module**

```ts
// src/lexikon/types.ts
import type { Pantheon } from '../game/types';

export type LexikonCategory =
  | 'olymp'
  | 'helden'
  | 'monster'
  | 'titanen'
  | 'sonstige'
  | 'mythen';

export type FigureCategory = Exclude<LexikonCategory, 'mythen'>;

export type FigureKind =
  | 'gottheit'
  | 'held'
  | 'heldin'
  | 'monster'
  | 'titan'
  | 'nymphe'
  | 'sterblich';

export interface Figure {
  id: string;
  name: string;
  aliases: string[];
  category: FigureCategory;
  pantheon: Pantheon;
  kind: FigureKind;
  body: string;
}

export interface Story {
  id: string;
  title: string;
  body: string;
}

export type LexikonEntry =
  | { kind: 'figure'; data: Figure }
  | { kind: 'story';  data: Story };

export type EntryRef =
  | { kind: 'figure'; id: string }
  | { kind: 'story';  id: string };

export type BodySegment =
  | { kind: 'text'; value: string }
  | { kind: 'link'; target: EntryRef; label: string };
```

- [ ] **Step 2: Verify types compile**

Run: `pnpm check`
Expected: PASS (no usages yet, just declarations)

- [ ] **Step 3: Commit**

```bash
git add src/lexikon/types.ts
git commit -m "feat(lexikon): add Figure/Story/Entry types"
```

---

### Task 2: Empty data modules

**Files:**
- Create: `src/data/figures.ts`
- Create: `src/data/stories.ts`

- [ ] **Step 1: Create `src/data/figures.ts`**

```ts
import type { Figure } from '../lexikon/types';

export const figures: Figure[] = [];
```

- [ ] **Step 2: Create `src/data/stories.ts`**

```ts
import type { Story } from '../lexikon/types';

export const stories: Story[] = [];
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/data/figures.ts src/data/stories.ts
git commit -m "feat(lexikon): scaffold figures.ts and stories.ts data modules"
```

---

### Task 3: Resolver — `getFigure`, `getStory`, `resolveByAlias`

**Files:**
- Create: `src/lexikon/resolver.ts`
- Test:   `tests/lexikon/resolver.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/lexikon/resolver.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { figures } from '../../src/data/figures';
import { stories } from '../../src/data/stories';
import {
  getFigure,
  getStory,
  resolveByAlias,
} from '../../src/lexikon/resolver';
import type { Figure, Story } from '../../src/lexikon/types';

// Inject fixtures by mutating the (singleton) arrays for the test run.
// Mutation chosen over module mocks because vitest's vi.mock semantics are
// tricky with ESM + dynamic-array exports in this project.
const fixtureFigure: Figure = {
  id: 'zeus',
  name: 'Zeus / Jupiter',
  aliases: ['Zeus', 'Jupiter'],
  category: 'olymp',
  pantheon: 'beide',
  kind: 'gottheit',
  body: 'Zeus ist der König der Götter.',
};
const fixtureStory: Story = {
  id: 'troja',
  title: 'Der Trojanische Krieg',
  body: '[[zeus|Zeus]] schickte ...',
};

beforeEach(() => {
  figures.push(fixtureFigure);
  stories.push(fixtureStory);
});
afterEach(() => {
  figures.length = 0;
  stories.length = 0;
});

describe('getFigure', () => {
  it('returns the figure for a known id', () => {
    expect(getFigure('zeus')).toEqual(fixtureFigure);
  });
  it('returns undefined for an unknown id', () => {
    expect(getFigure('nope')).toBeUndefined();
  });
});

describe('getStory', () => {
  it('returns the story for a known id', () => {
    expect(getStory('troja')).toEqual(fixtureStory);
  });
  it('returns undefined for an unknown id', () => {
    expect(getStory('nope')).toBeUndefined();
  });
});

describe('resolveByAlias', () => {
  it('finds figure by main name', () => {
    expect(resolveByAlias('Zeus')?.id).toBe('zeus');
  });
  it('finds figure by alias (Jupiter)', () => {
    expect(resolveByAlias('Jupiter')?.id).toBe('zeus');
  });
  it('is case-insensitive', () => {
    expect(resolveByAlias('JUPITER')?.id).toBe('zeus');
    expect(resolveByAlias('zeus')?.id).toBe('zeus');
  });
  it('returns undefined for unknown alias', () => {
    expect(resolveByAlias('Bananaman')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL with module-not-found / function-not-defined errors

- [ ] **Step 3: Implement `resolver.ts`**

```ts
// src/lexikon/resolver.ts
import { figures } from '../data/figures';
import { stories } from '../data/stories';
import type { Figure, Story } from './types';

export function getFigure(id: string): Figure | undefined {
  return figures.find(f => f.id === id);
}

export function getStory(id: string): Story | undefined {
  return stories.find(s => s.id === id);
}

export function resolveByAlias(name: string): Figure | undefined {
  const needle = name.toLowerCase();
  return figures.find(
    f => f.aliases.some(a => a.toLowerCase() === needle),
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Run typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lexikon/resolver.ts tests/lexikon/resolver.test.ts
git commit -m "feat(lexikon): resolver for figures and stories by id/alias"
```

---

### Task 4: Resolver — `tokenizeBody`

**Files:**
- Modify: `src/lexikon/resolver.ts` (add `tokenizeBody`)
- Modify: `tests/lexikon/resolver.test.ts` (add tests)

- [ ] **Step 1: Add failing tests for tokenizeBody**

Append to `tests/lexikon/resolver.test.ts`:

```ts
import { tokenizeBody } from '../../src/lexikon/resolver';

describe('tokenizeBody', () => {
  it('returns single text segment for body without tokens', () => {
    const segs = tokenizeBody('Hallo Welt');
    expect(segs).toEqual([{ kind: 'text', value: 'Hallo Welt' }]);
  });

  it('parses a figure link [[zeus]] using figure name as label', () => {
    const segs = tokenizeBody('Mit [[zeus]] zusammen.');
    expect(segs).toEqual([
      { kind: 'text', value: 'Mit ' },
      { kind: 'link', target: { kind: 'figure', id: 'zeus' }, label: 'Zeus / Jupiter' },
      { kind: 'text', value: ' zusammen.' },
    ]);
  });

  it('parses a story link [[story:troja]] using story title as label', () => {
    const segs = tokenizeBody('siehe [[story:troja]].');
    expect(segs).toEqual([
      { kind: 'text', value: 'siehe ' },
      { kind: 'link', target: { kind: 'story', id: 'troja' }, label: 'Der Trojanische Krieg' },
      { kind: 'text', value: '.' },
    ]);
  });

  it('supports explicit label with pipe: [[zeus|Zeus]]', () => {
    const segs = tokenizeBody('Mit [[zeus|Zeus]].');
    expect(segs[1]).toEqual({
      kind: 'link',
      target: { kind: 'figure', id: 'zeus' },
      label: 'Zeus',
    });
  });

  it('supports explicit label for story', () => {
    const segs = tokenizeBody('im [[story:troja|Krieg um Troja]].');
    expect(segs[1].kind).toBe('link');
    if (segs[1].kind === 'link') {
      expect(segs[1].label).toBe('Krieg um Troja');
      expect(segs[1].target).toEqual({ kind: 'story', id: 'troja' });
    }
  });

  it('handles multiple links in one body', () => {
    const segs = tokenizeBody('[[zeus]] und [[story:troja]].');
    expect(segs.length).toBe(4);
    expect(segs[0]).toEqual({ kind: 'link', target: { kind: 'figure', id: 'zeus' }, label: 'Zeus / Jupiter' });
    expect(segs[1]).toEqual({ kind: 'text', value: ' und ' });
    expect(segs[2]).toEqual({ kind: 'link', target: { kind: 'story', id: 'troja' }, label: 'Der Trojanische Krieg' });
    expect(segs[3]).toEqual({ kind: 'text', value: '.' });
  });

  it('falls back to placeholder for unknown figure id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const segs = tokenizeBody('Mit [[ghost]].');
    expect(segs[1]).toEqual({ kind: 'text', value: '??:ghost' });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('falls back to placeholder for unknown story id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const segs = tokenizeBody('Mit [[story:lost]].');
    expect(segs[1]).toEqual({ kind: 'text', value: '??:story:lost' });
    warn.mockRestore();
  });

  it('handles empty body', () => {
    expect(tokenizeBody('')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL with "tokenizeBody is not a function"

- [ ] **Step 3: Implement tokenizeBody**

First, extend the type import at the top of `src/lexikon/resolver.ts` to include `BodySegment`:

```ts
import type { Figure, Story, BodySegment } from './types';
```

Then append the implementation:

```ts
const TOKEN_RE = /\[\[([^\]]+)\]\]/g;

export function tokenizeBody(body: string): BodySegment[] {
  if (body.length === 0) return [];
  const segments: BodySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: body.slice(lastIndex, match.index) });
    }
    segments.push(parseToken(match[1]));
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) {
    segments.push({ kind: 'text', value: body.slice(lastIndex) });
  }
  return segments;
}

function parseToken(raw: string): BodySegment {
  // Format: [id] | [story:id] | [id|label] | [story:id|label]
  const [refPart, labelPart] = raw.split('|', 2);
  let target: { kind: 'figure' | 'story'; id: string };
  if (refPart.startsWith('story:')) {
    target = { kind: 'story', id: refPart.slice('story:'.length) };
  } else {
    target = { kind: 'figure', id: refPart };
  }
  const lookup =
    target.kind === 'figure' ? getFigure(target.id) : getStory(target.id);
  if (!lookup) {
    console.warn(`[lexikon] unknown ref in body: ${raw}`);
    return { kind: 'text', value: `??:${raw}` };
  }
  const defaultLabel = target.kind === 'figure'
    ? (lookup as Figure).name
    : (lookup as Story).title;
  return {
    kind: 'link',
    target,
    label: labelPart ?? defaultLabel,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lexikon/resolver.ts tests/lexikon/resolver.test.ts
git commit -m "feat(lexikon): tokenize body strings into text/link segments"
```

---

### Task 5: Schema v2 — add `lexikonRead`

**Files:**
- Modify: `src/storage/schema.ts`
- Modify: `src/storage/appState.ts`
- Test:   `tests/storage/appState.test.ts` (additions)

- [ ] **Step 1: Write failing migration tests**

Append to `tests/storage/appState.test.ts`:

```ts
describe('schema v1 → v2 migration', () => {
  it('migrates a valid v1 state by adding empty lexikonRead', () => {
    const v1 = {
      schemaVersion: 1,
      perQuestion: {},
      rounds: [],
      totals: { gamesPlayed: 0, correctTotal: 0, wrongTotal: 0, bestStreakAllTime: 0 },
      settings: { themeFilter: { topics: [], pantheon: 'beide' } },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1));
    const loaded = loadState();
    expect(loaded.schemaVersion).toBe(2);
    expect(loaded.lexikonRead).toEqual({ figures: [], stories: [] });
  });

  it('preserves v2 state across reload', () => {
    const v2 = makeDefaultState();
    v2.lexikonRead.figures.push('zeus');
    saveState(v2);
    const loaded = loadState();
    expect(loaded.lexikonRead.figures).toContain('zeus');
  });

  it('resets to defaults for unknown schemaVersion', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 999 }));
    expect(loadState()).toEqual(makeDefaultState());
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `lexikonRead` undefined / `schemaVersion` is 1

- [ ] **Step 3: Bump schema in `src/storage/schema.ts`**

Replace the file contents:

```ts
export const STORAGE_KEY = 'meretsMythologie.v1'; // unchanged: localStorage key reused, schemaVersion field discriminates
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
```

- [ ] **Step 4: Update `loadState` in `src/storage/appState.ts`**

Replace `loadState` with:

```ts
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefaultState();
    const parsed = JSON.parse(raw);

    // Migration path v1 → v2: add empty lexikonRead.
    if (parsed?.schemaVersion === 1) {
      parsed.schemaVersion = 2;
      parsed.lexikonRead = { figures: [], stories: [] };
    }

    if (parsed?.schemaVersion !== SCHEMA_VERSION) return makeDefaultState();

    if (!parsed.perQuestion || !parsed.rounds || !parsed.totals || !parsed.settings || !parsed.lexikonRead) {
      return makeDefaultState();
    }

    if (typeof parsed.settings.themeFilter === 'string') {
      parsed.settings.themeFilter = { topics: [], pantheon: 'beide' };
    }
    for (const r of parsed.rounds) {
      if (typeof r.themeFilter === 'string') {
        r.themeFilter = { topics: [], pantheon: 'beide' };
      }
    }
    if (!Array.isArray(parsed.lexikonRead.figures)) parsed.lexikonRead.figures = [];
    if (!Array.isArray(parsed.lexikonRead.stories)) parsed.lexikonRead.stories = [];

    return parsed as AppState;
  } catch {
    return makeDefaultState();
  }
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: PASS (including all pre-existing tests — the existing "returns defaults when stored object lacks required fields" test still passes because the v1 object with `schemaVersion: 1` and no perQuestion/etc. now fails the shape guard)

> Note: The existing test "returns defaults when stored schemaVersion mismatches" uses `schemaVersion: 999`. That still passes because 999 is not 1 (no migration) and not 2.

- [ ] **Step 6: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/storage/schema.ts src/storage/appState.ts tests/storage/appState.test.ts
git commit -m "feat(storage): schema v2 adds lexikonRead with v1 migration"
```

---

### Task 6: AppState helpers — `toggleLexikonRead`, `isLexikonRead`

**Files:**
- Modify: `src/storage/appState.ts`
- Test:   `tests/storage/appState.test.ts` (additions)

- [ ] **Step 1: Write failing tests**

Append to `tests/storage/appState.test.ts`:

```ts
import { toggleLexikonRead, isLexikonRead } from '../../src/storage/appState';

describe('toggleLexikonRead', () => {
  it('adds a figure id when not present', () => {
    const s = toggleLexikonRead(makeDefaultState(), { kind: 'figure', id: 'zeus' });
    expect(s.lexikonRead.figures).toEqual(['zeus']);
    expect(s.lexikonRead.stories).toEqual([]);
  });

  it('removes a figure id when already present', () => {
    let s = makeDefaultState();
    s.lexikonRead.figures.push('zeus');
    s = toggleLexikonRead(s, { kind: 'figure', id: 'zeus' });
    expect(s.lexikonRead.figures).toEqual([]);
  });

  it('toggles stories independently of figures', () => {
    const s = toggleLexikonRead(makeDefaultState(), { kind: 'story', id: 'troja' });
    expect(s.lexikonRead.stories).toEqual(['troja']);
    expect(s.lexikonRead.figures).toEqual([]);
  });

  it('does not mutate input state', () => {
    const before = makeDefaultState();
    const after = toggleLexikonRead(before, { kind: 'figure', id: 'zeus' });
    expect(before.lexikonRead.figures).toEqual([]);
    expect(after).not.toBe(before);
  });
});

describe('isLexikonRead', () => {
  it('returns false when not in list', () => {
    expect(isLexikonRead(makeDefaultState(), { kind: 'figure', id: 'zeus' })).toBe(false);
  });

  it('returns true when figure id is in list', () => {
    const s = makeDefaultState();
    s.lexikonRead.figures.push('zeus');
    expect(isLexikonRead(s, { kind: 'figure', id: 'zeus' })).toBe(true);
  });

  it('does not cross figure/story namespaces', () => {
    const s = makeDefaultState();
    s.lexikonRead.figures.push('troja');
    expect(isLexikonRead(s, { kind: 'story', id: 'troja' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — functions not exported

- [ ] **Step 3: Implement helpers in `src/storage/appState.ts`**

Append:

```ts
import type { EntryRef } from '../lexikon/types';

export function toggleLexikonRead(state: AppState, ref: EntryRef): AppState {
  const key = ref.kind === 'figure' ? 'figures' : 'stories';
  const current = state.lexikonRead[key];
  const has = current.includes(ref.id);
  const next = has ? current.filter(x => x !== ref.id) : [...current, ref.id];
  return {
    ...state,
    lexikonRead: { ...state.lexikonRead, [key]: next },
  };
}

export function isLexikonRead(state: AppState, ref: EntryRef): boolean {
  const list = ref.kind === 'figure' ? state.lexikonRead.figures : state.lexikonRead.stories;
  return list.includes(ref.id);
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/storage/appState.ts tests/storage/appState.test.ts
git commit -m "feat(storage): toggleLexikonRead/isLexikonRead helpers"
```

---

### Task 7: Question augmentation — optional `figureIds` and `storyId`

**Files:**
- Modify: `src/game/types.ts`

- [ ] **Step 1: Add optional fields to `Question`**

Replace the `Question` interface in `src/game/types.ts`:

```ts
export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  optionNotes?: [string | null, string | null, string | null, string | null];
  themes: string[];
  difficulty: 1 | 2 | 3;
  pantheon: Pantheon;
  relatedIds?: string[];
  // Lexikon links — both optional. Set during content phase (Phase D).
  figureIds?: string[];
  storyId?: string;
}
```

- [ ] **Step 2: Verify type-check**

Run: `pnpm check`
Expected: PASS (existing question literals satisfy interface since both fields are optional)

- [ ] **Step 3: Run all tests**

Run: `pnpm test`
Expected: PASS (existing tests untouched by additive change)

- [ ] **Step 4: Commit**

```bash
git add src/game/types.ts
git commit -m "feat(game): Question gains optional figureIds and storyId"
```

---

## Phase B — Modal Infrastructure

### Task 8: Lexikon UI state in store

**Files:**
- Modify: `src/lib/store.svelte.ts`

- [ ] **Step 1: Add Lexikon UI state and actions**

Append to `src/lib/store.svelte.ts`:

```ts
import type { EntryRef } from '../lexikon/types';
import { toggleLexikonRead } from '../storage/appState';

export interface LexikonUiState {
  open: boolean;
  stack: EntryRef[]; // empty = list view; last item = currently shown entry
}

let lexikon = $state<LexikonUiState>({ open: false, stack: [] });

export function getLexikon(): LexikonUiState {
  return lexikon;
}

export function openLexikon(): void {
  lexikon = { open: true, stack: [] };
}

export function openEntry(ref: EntryRef): void {
  lexikon = { open: true, stack: [ref] };
}

export function pushEntry(ref: EntryRef): void {
  lexikon = { open: true, stack: [...lexikon.stack, ref] };
}

export function popEntry(): void {
  lexikon = { open: lexikon.open, stack: lexikon.stack.slice(0, -1) };
}

export function closeLexikon(): void {
  lexikon = { open: false, stack: [] };
}

export function toggleLexikonReadCurrent(): void {
  const top = lexikon.stack[lexikon.stack.length - 1];
  if (!top) return;
  setAppState(toggleLexikonRead(appState, top));
}
```

> **Note on `appState` access:** The variable `appState` is module-scoped (declared earlier in the file). Reuse the same scope; don't re-declare.

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/store.svelte.ts
git commit -m "feat(lexikon): UI state + actions in store"
```

---

### Task 9: `LexikonLink` component

**Files:**
- Create: `src/components/LexikonLink.svelte`

- [ ] **Step 1: Implement the component**

```svelte
<!-- src/components/LexikonLink.svelte -->
<script lang="ts">
  import type { EntryRef } from '../lexikon/types';
  import { getAppState, pushEntry } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';

  let { target, label }: { target: EntryRef; label: string } = $props();
  const state = $derived(getAppState());
  const read = $derived(isLexikonRead(state, target));
</script>

<button class="link" onclick={() => pushEntry(target)}>
  {#if read}<span class="check" aria-label="schon gelesen">✓</span>{/if}<span class="label">{label}</span>
</button>

<style>
  .link {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent, #6b3fb8);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }
  .check { font-size: 0.85em; opacity: 0.7; margin-right: 2px; }
  .label { /* inline with text */ }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/LexikonLink.svelte
git commit -m "feat(lexikon): LexikonLink component"
```

---

### Task 10: `LexikonEntry` component

**Files:**
- Create: `src/components/LexikonEntry.svelte`

- [ ] **Step 1: Implement the component**

```svelte
<!-- src/components/LexikonEntry.svelte -->
<script lang="ts">
  import type { EntryRef, Figure, Story } from '../lexikon/types';
  import { getFigure, getStory, tokenizeBody } from '../lexikon/resolver';
  import {
    getAppState,
    toggleLexikonReadCurrent,
  } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';
  import LexikonLink from './LexikonLink.svelte';

  let { ref }: { ref: EntryRef } = $props();
  const state = $derived(getAppState());
  const read = $derived(isLexikonRead(state, ref));

  const figure = $derived<Figure | undefined>(
    ref.kind === 'figure' ? getFigure(ref.id) : undefined,
  );
  const story = $derived<Story | undefined>(
    ref.kind === 'story' ? getStory(ref.id) : undefined,
  );
  const title = $derived(figure?.name ?? story?.title ?? 'Unbekannt');
  const body = $derived(figure?.body ?? story?.body ?? '');
  const segments = $derived(tokenizeBody(body));

  // Map figure kind to icon
  const icon = $derived.by(() => {
    if (!figure) return '📜';
    switch (figure.kind) {
      case 'gottheit': return '⚡';
      case 'held':
      case 'heldin': return '🛡️';
      case 'monster': return '🐲';
      case 'titan': return '🗻';
      case 'nymphe': return '🌿';
      default: return '🧑';
    }
  });

  const subtitle = $derived.by(() => {
    if (!figure) return 'Mythos';
    const cat = figure.category;
    const pan =
      figure.pantheon === 'beide' ? 'griechisch & römisch' : figure.pantheon;
    return `${cat} · ${pan}`;
  });
</script>

<article class="entry">
  <header class="entry-head">
    <div class="icon" aria-hidden="true">{icon}</div>
    <h2 class="title">{title}</h2>
    <div class="subtitle">{subtitle}</div>
  </header>

  <div class="body">
    {#each segments as seg, i (i)}
      {#if seg.kind === 'text'}{seg.value}{:else}<LexikonLink target={seg.target} label={seg.label} />{/if}
    {/each}
  </div>

  <hr class="sep" />

  <button class="read-toggle" onclick={toggleLexikonReadCurrent}>
    {read ? '✓ Gelesen — Tippen zum Zurücksetzen' : '📖 Als gelesen markieren'}
  </button>
</article>

<style>
  .entry { padding: 16px; }
  .entry-head { margin-bottom: 12px; }
  .icon { font-size: 28px; margin-bottom: 4px; }
  .title { font-size: 22px; font-weight: 900; margin: 0; }
  .subtitle { font-size: 12px; color: var(--text-faint); letter-spacing: 0.5px; text-transform: lowercase; margin-top: 2px; }
  .body { font-size: 15px; line-height: 1.55; color: var(--text); white-space: pre-wrap; }
  .sep { margin: 18px 0 12px; border: 0; border-top: 1px solid #eee; }
  .read-toggle {
    display: block;
    width: 100%;
    padding: 10px 12px;
    background: #f6f2ff;
    border: 1px solid #e0d4ff;
    border-radius: 12px;
    font-weight: 700;
    color: var(--text);
  }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/LexikonEntry.svelte
git commit -m "feat(lexikon): LexikonEntry view with body, cross-links, read-toggle"
```

---

### Task 11: `LexikonList` component — accordion overview

**Files:**
- Create: `src/components/LexikonList.svelte`

- [ ] **Step 1: Implement the component**

```svelte
<!-- src/components/LexikonList.svelte -->
<script lang="ts">
  import { figures } from '../data/figures';
  import { stories } from '../data/stories';
  import type { FigureCategory } from '../lexikon/types';
  import { getAppState, pushEntry } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';

  const state = $derived(getAppState());

  const FIG_SECTIONS: { id: FigureCategory; label: string }[] = [
    { id: 'olymp',    label: 'Olymp' },
    { id: 'helden',   label: 'Held:innen' },
    { id: 'monster',  label: 'Monster' },
    { id: 'titanen',  label: 'Titanen' },
    { id: 'sonstige', label: 'Sonstige' },
  ];

  const figureSections = $derived(
    FIG_SECTIONS.map(s => ({
      ...s,
      items: figures
        .filter(f => f.category === s.id)
        .sort((a, b) => a.name.localeCompare(b.name, 'de-CH')),
    })).filter(s => s.items.length > 0),
  );

  const storiesSorted = $derived(
    [...stories].sort((a, b) => a.title.localeCompare(b.title, 'de-CH')),
  );

  let openSections = $state<Record<string, boolean>>({ olymp: true, mythen: false });

  function toggle(key: string) {
    openSections = { ...openSections, [key]: !openSections[key] };
  }
</script>

<div class="list">
  {#each figureSections as section}
    {@const readCount = section.items.filter(f =>
      isLexikonRead(state, { kind: 'figure', id: f.id })
    ).length}
    <div class="section">
      <button class="head" onclick={() => toggle(section.id)} aria-expanded={openSections[section.id] ?? false}>
        <span class="caret">{openSections[section.id] ? '▼' : '▶'}</span>
        <span class="lbl">{section.label}</span>
        <span class="cnt">{readCount} / {section.items.length}</span>
      </button>
      {#if openSections[section.id]}
        <ul class="items">
          {#each section.items as fig}
            <li>
              <button class="item" onclick={() => pushEntry({ kind: 'figure', id: fig.id })}>
                {#if isLexikonRead(state, { kind: 'figure', id: fig.id })}<span class="check">✓</span>{:else}<span class="dot">·</span>{/if}
                {fig.name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/each}

  {#if storiesSorted.length > 0}
    {@const storiesRead = storiesSorted.filter(s =>
      isLexikonRead(state, { kind: 'story', id: s.id })
    ).length}
    <div class="section">
      <button class="head" onclick={() => toggle('mythen')} aria-expanded={openSections.mythen ?? false}>
        <span class="caret">{openSections.mythen ? '▼' : '▶'}</span>
        <span class="lbl">Mythen</span>
        <span class="cnt">{storiesRead} / {storiesSorted.length}</span>
      </button>
      {#if openSections.mythen}
        <ul class="items">
          {#each storiesSorted as st}
            <li>
              <button class="item" onclick={() => pushEntry({ kind: 'story', id: st.id })}>
                {#if isLexikonRead(state, { kind: 'story', id: st.id })}<span class="check">✓</span>{:else}<span class="dot">·</span>{/if}
                {st.title}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  {#if figureSections.length === 0 && storiesSorted.length === 0}
    <div class="empty">Lexikon noch leer — Inhalte kommen bald.</div>
  {/if}
</div>

<style>
  .list { padding: 12px; }
  .section { margin-bottom: 8px; }
  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: 12px;
    font-weight: 800;
    color: var(--text);
    text-align: left;
  }
  .caret { font-size: 10px; color: var(--text-faint); width: 12px; }
  .lbl { flex: 1; }
  .cnt { font-size: 12px; font-weight: 700; color: var(--text-faint); }
  .items { list-style: none; padding: 6px 0 6px 22px; margin: 0; }
  .item {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 8px 6px;
    font: inherit;
    color: var(--text);
  }
  .check { color: var(--accent, #6b3fb8); margin-right: 6px; }
  .dot { color: var(--text-faint); margin-right: 6px; }
  .empty { padding: 24px 12px; color: var(--text-faint); text-align: center; }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/LexikonList.svelte
git commit -m "feat(lexikon): LexikonList accordion overview"
```

---

### Task 12: `LexikonModal` component — shell

**Files:**
- Create: `src/components/LexikonModal.svelte`

- [ ] **Step 1: Implement the modal shell**

```svelte
<!-- src/components/LexikonModal.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    getLexikon,
    popEntry,
    closeLexikon,
  } from '../lib/store.svelte';
  import LexikonList from './LexikonList.svelte';
  import LexikonEntry from './LexikonEntry.svelte';

  const lex = $derived(getLexikon());
  const top = $derived(lex.stack[lex.stack.length - 1]);
  const canGoBack = $derived(lex.stack.length > 1);
  const title = $derived(lex.stack.length === 0 ? 'Lexikon' : 'Lexikon');

  function onKey(e: KeyboardEvent) {
    if (!lex.open) return;
    if (e.key === 'Escape') closeLexikon();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
  });
  onDestroy(() => {
    window.removeEventListener('keydown', onKey);
  });

  $effect(() => {
    if (lex.open) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  });
</script>

{#if lex.open}
  <div class="backdrop" onclick={closeLexikon} role="presentation"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label={title}>
    <header class="head">
      {#if canGoBack}
        <button class="nav" onclick={popEntry} aria-label="Zurück">←</button>
      {:else}
        <span class="nav-spacer"></span>
      {/if}
      <h1 class="title">{title}</h1>
      <button class="nav close" onclick={closeLexikon} aria-label="Schliessen">✕</button>
    </header>

    <div class="content">
      {#if top}
        <LexikonEntry ref={top} />
      {:else}
        <LexikonList />
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 9000;
  }
  .sheet {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    top: 5vh;
    background: var(--bg, #faf8f5);
    border-radius: 18px 18px 0 0;
    z-index: 9001;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -8px 24px rgba(0,0,0,0.18);
  }
  .head {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #e8e0f0;
  }
  .nav {
    background: none; border: none;
    font-size: 22px;
    width: 40px; height: 40px;
    color: var(--text);
  }
  .nav-spacer { width: 40px; }
  .title { flex: 1; text-align: center; font-size: 16px; font-weight: 900; margin: 0; }
  .content { flex: 1; overflow-y: auto; }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/LexikonModal.svelte
git commit -m "feat(lexikon): LexikonModal shell with back-stack header and ESC handling"
```

---

### Task 13: Mount LexikonModal in App.svelte

**Files:**
- Modify: `src/App.svelte`

- [ ] **Step 1: Add modal mount**

Replace `src/App.svelte` with:

```svelte
<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import Home from './views/Home.svelte';
  import ThemePicker from './views/ThemePicker.svelte';
  import Quiz from './views/Quiz.svelte';
  import Result from './views/Result.svelte';
  import Stats from './views/Stats.svelte';
  import LexikonModal from './components/LexikonModal.svelte';
  import { hydrate, getView } from './lib/store.svelte';

  onMount(() => hydrate());
  const view = $derived(getView());
</script>

{#if view === 'home'}
  <Home />
{:else if view === 'themePicker'}
  <ThemePicker />
{:else if view === 'quiz'}
  <Quiz />
{:else if view === 'result'}
  <Result />
{:else if view === 'stats'}
  <Stats />
{/if}

<LexikonModal />
```

- [ ] **Step 2: Sanity test — start dev server**

Run (briefly, then Ctrl-C): `pnpm dev`
Manual: open http://localhost:5173, verify app still renders home, no console errors.

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 4: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.svelte
git commit -m "feat(lexikon): mount LexikonModal in App"
```

---

## Phase C — Anchor Points in Existing UI

### Task 14: `LexikonChips` component

**Files:**
- Create: `src/components/LexikonChips.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- src/components/LexikonChips.svelte -->
<script lang="ts">
  import type { Question } from '../game/types';
  import { getFigure, getStory } from '../lexikon/resolver';
  import { getAppState, openEntry } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';

  let { question }: { question: Question } = $props();
  const state = $derived(getAppState());

  const figureChips = $derived(
    (question.figureIds ?? [])
      .map(id => getFigure(id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
  );

  const storyChip = $derived(
    question.storyId ? getStory(question.storyId) : undefined
  );

  const show = $derived(figureChips.length > 0 || storyChip !== undefined);
</script>

{#if show}
  <div class="chips">
    <div class="lbl">Mehr erfahren:</div>
    <div class="row">
      {#each figureChips as fig (fig.id)}
        {@const read = isLexikonRead(state, { kind: 'figure', id: fig.id })}
        <button class="chip" onclick={() => openEntry({ kind: 'figure', id: fig.id })}>
          {#if read}<span class="check">✓</span>{/if}<span class="ico">🧑</span> {fig.name}
        </button>
      {/each}
      {#if storyChip}
        {@const read = isLexikonRead(state, { kind: 'story', id: storyChip.id })}
        <button class="chip story" onclick={() => openEntry({ kind: 'story', id: storyChip.id })}>
          {#if read}<span class="check">✓</span>{/if}<span class="ico">📜</span> {storyChip.title}
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .chips { margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(184, 134, 11, 0.3); }
  .lbl { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #b8860b; margin-bottom: 6px; text-transform: uppercase; }
  .row { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px; font-weight: 700;
    color: var(--text);
    box-shadow: var(--card-shadow);
  }
  .chip.story { border-color: #ffd28a; background: #fff8e8; }
  .check { color: var(--accent, #6b3fb8); }
  .ico { font-size: 13px; }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/LexikonChips.svelte
git commit -m "feat(lexikon): LexikonChips component for explanation box"
```

---

### Task 15: Wire chips into ExplanationBox

**Files:**
- Modify: `src/components/ExplanationBox.svelte`
- Modify: `src/views/Quiz.svelte`

- [ ] **Step 1: Update ExplanationBox to accept and render question**

Replace `src/components/ExplanationBox.svelte`:

```svelte
<script lang="ts">
  import type { Question } from '../game/types';
  import LexikonChips from './LexikonChips.svelte';

  let {
    question,
    wasCorrect,
    wrongPickNote = null,
  }: { question: Question; wasCorrect: boolean; wrongPickNote?: string | null } = $props();
</script>

<div class="box">
  <div class="head">💡 {wasCorrect ? 'GUT GEMACHT' : 'ZUM MERKEN'}</div>
  <div class="body">{question.explanation}</div>
  {#if wrongPickNote}
    <div class="body wrong-note">Zu deiner Antwort: {wrongPickNote}</div>
  {/if}
  <LexikonChips {question} />
</div>

<style>
  .box {
    background: var(--warn-bg);
    border-radius: var(--radius-option);
    padding: 12px 14px;
    margin-top: 10px;
    border-left: 3px solid var(--warn-edge);
    color: #5a3e00;
  }
  .head { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #b8860b; margin-bottom: 4px; }
  .body { font-size: 13px; line-height: 1.45; }
  .wrong-note { margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(184, 134, 11, 0.3); font-style: italic; color: #7c2d2d; }
</style>
```

- [ ] **Step 2: Update Quiz.svelte to pass `question` instead of `text`**

In `src/views/Quiz.svelte`, locate the ExplanationBox usage (around line 134) and replace:

```svelte
      <ExplanationBox
        question={current}
        wasCorrect={pickedIndex === current.correctIndex}
        wrongPickNote={
          pickedIndex !== null && pickedIndex !== current.correctIndex
            ? (current.optionNotes?.[pickedIndex] ?? null)
            : null
        }
      />
```

(Remove the `text={current.explanation}` prop — now read from `question.explanation` inside the component.)

- [ ] **Step 3: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 4: Run tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ExplanationBox.svelte src/views/Quiz.svelte
git commit -m "feat(lexikon): chips in explanation box; pass full question through"
```

---

### Task 16: Book icon in Home title bar

**Files:**
- Modify: `src/views/Home.svelte`

- [ ] **Step 1: Add book icon next to stats icon**

Locate `<div class="title-row">` (around line 11) in `src/views/Home.svelte` and replace:

```svelte
  <div class="title-row">
    <div class="hello">Hallo Meret ⚡</div>
    <div class="icon-row">
      <button class="icon-btn" onclick={openLexikon} aria-label="Lexikon">📖</button>
      <button class="icon-btn" onclick={() => navigate('stats')} aria-label="Statistik">📊</button>
    </div>
  </div>
```

Add the import at the top of the `<script>`:

```ts
import { getAppState, navigate, openLexikon } from '../lib/store.svelte';
```

Add CSS in the `<style>` block:

```css
.icon-row { display: flex; gap: 8px; }
.icon-btn {
  background: white;
  border: 1px solid #e0d4ff;
  border-radius: 999px;
  width: 36px; height: 36px;
  font-size: 16px;
  box-shadow: var(--card-shadow);
}
```

Remove the now-redundant `.stats-link` class (the replacement `.icon-btn` covers both).

- [ ] **Step 2: Manual test**

Run: `pnpm dev`
Open http://localhost:5173. Click 📖. Modal should open with "Lexikon noch leer — Inhalte kommen bald." (because figures/stories arrays are still empty). Click ✕ to close.

- [ ] **Step 3: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/views/Home.svelte
git commit -m "feat(lexikon): book icon in Home title bar"
```

---

### Task 17: Book icon in Result title bar

**Files:**
- Modify: `src/views/Result.svelte`

- [ ] **Step 1: Add book icon next to the "Runde fertig" header**

Locate `<header class="app-header"><h2>Runde fertig</h2></header>` (around line 30) and replace:

```svelte
  <header class="app-header result-head">
    <h2>Runde fertig</h2>
    <button class="icon-btn" onclick={openLexikon} aria-label="Lexikon">📖</button>
  </header>
```

Add the import:

```ts
import { getAppState, getViewContext, navigate, openLexikon } from '../lib/store.svelte';
```

Add CSS:

```css
.result-head { display: flex; justify-content: space-between; align-items: center; }
.icon-btn {
  background: white;
  border: 1px solid #e0d4ff;
  border-radius: 999px;
  width: 36px; height: 36px;
  font-size: 16px;
  box-shadow: var(--card-shadow);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/views/Result.svelte
git commit -m "feat(lexikon): book icon on Result view"
```

---

### Task 18: Book icon in Stats title bar

**Files:**
- Modify: `src/views/Stats.svelte`

- [ ] **Step 1: Read the current header**

Use Read tool to inspect `src/views/Stats.svelte` and identify the header element.

- [ ] **Step 2: Add a book icon to the right of the title**

Wrap the existing title in a flex container with a book-icon button on the right, analogous to Task 17. Add the import:

```ts
import { openLexikon } from '../lib/store.svelte';
```

Add CSS reusing the `.icon-btn` pattern (same rules as Task 16/17).

> The exact JSX/template depends on Stats.svelte's structure — the engineer applies the same pattern (header becomes flex row with title + book button).

- [ ] **Step 3: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/views/Stats.svelte
git commit -m "feat(lexikon): book icon on Stats view"
```

---

### Task 19: Book icon in ThemePicker title bar

**Files:**
- Modify: `src/views/ThemePicker.svelte`

- [ ] **Step 1: Read current header**

Use Read tool to inspect `src/views/ThemePicker.svelte`.

- [ ] **Step 2: Add book icon to header**

Apply the same pattern as Tasks 16–18. Import `openLexikon` from `../lib/store.svelte`. Reuse `.icon-btn` CSS.

- [ ] **Step 3: Typecheck and tests**

Run: `pnpm check && pnpm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/views/ThemePicker.svelte
git commit -m "feat(lexikon): book icon on ThemePicker view"
```

---

## Phase D — Content Drafting

This phase produces the actual lexikon entries. Each batch is one commit. The Quiz integration (figureIds/storyId on questions) lands as separate commits at the end.

### Style guide for all content tasks

- **Zielgruppe:** 11 Jahre, neugierig, mit etwas Vorwissen
- **Sprache:** Hochdeutsch, **Schweizer Schreibweise** (ss statt ß), du-Form
- **Inklusiv:** «Götter und Göttinnen», «Held:innen», «Gottheiten» — kein generisches Maskulinum
- **Tonalität:** warm erzählend, neugierig machend, ohne kindisches Vereinfachen
- **Länge:** Figuren ~120–180 Wörter, Geschichten ~180–280 Wörter
- **Cross-Links:** `[[zeus]]`, `[[story:troja]]`, mit Pipe-Label wenn nötig: `[[zeus|Zeus]]`. **Mindestens 2 Cross-Links pro Eintrag**, wo sinnvoll
- **Pantheon-Merger:** Wo beide Pantheons denselben Gott haben → ein Eintrag («Zeus / Jupiter»), `aliases: ['Zeus', 'Jupiter']`, `pantheon: 'beide'`. Nur-griechische / nur-römische Figuren bekommen je einen Eintrag.
- **Keine kindischen Wertungen** wie «böser Hades» — neutral darstellen.

### Task 20: Extract distinct figure candidates from questions

**Files:**
- Create: `scripts/extract-figures.ts`

- [ ] **Step 1: Write the extraction script**

```ts
// scripts/extract-figures.ts
// Run: pnpm tsx scripts/extract-figures.ts
// Lists distinct capitalized proper-noun-looking strings from question options.
import { questions } from '../src/data/questions';

const counts = new Map<string, number>();

function addNoun(s: string) {
  // Trim, drop trailing punctuation, ignore single chars
  const cleaned = s.trim().replace(/[.,;:!?]+$/, '');
  if (cleaned.length < 2) return;
  // Heuristic: starts with capital letter, isn't all-caps
  if (/^[A-ZÄÖÜ][a-zäöüß-]+/.test(cleaned)) {
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
  }
}

for (const q of questions) {
  for (const opt of q.options) addNoun(opt);
  // Crude: also pull capitalized words from explanation
  for (const word of q.explanation.split(/\s+/)) addNoun(word);
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
for (const [name, n] of sorted) {
  console.log(`${String(n).padStart(3)} ${name}`);
}
console.log(`\n${sorted.length} distinct candidates.`);
```

- [ ] **Step 2: Add `tsx` dev-dep (one-time)**

Run: `pnpm add -D tsx`

- [ ] **Step 3: Run the script and capture output**

Run: `pnpm tsx scripts/extract-figures.ts > /tmp/figure-candidates.txt`
Inspect: `cat /tmp/figure-candidates.txt | head -80`

This is a working artifact — used to plan the figure-list for content drafting, not committed permanently.

- [ ] **Step 4: Commit the script (the output is ephemeral)**

```bash
git add scripts/extract-figures.ts package.json pnpm-lock.yaml
git commit -m "tooling: script to extract figure-name candidates from questions"
```

---

### Task 21: Write figure entries — olympische Gottheiten (Batch 1)

**Files:**
- Modify: `src/data/figures.ts`

- [ ] **Step 1: Add the canonical Olympic 12 (+ Hades & Hestia) as figures**

The 14 entries to write:

| ID | Name | Aliases |
|---|---|---|
| `zeus` | Zeus / Jupiter | Zeus, Jupiter, Iuppiter |
| `hera` | Hera / Juno | Hera, Juno |
| `poseidon` | Poseidon / Neptun | Poseidon, Neptun, Neptunus |
| `hades` | Hades / Pluto | Hades, Pluto |
| `demeter` | Demeter / Ceres | Demeter, Ceres |
| `athene` | Athene / Minerva | Athene, Athena, Minerva |
| `apollon` | Apollon / Apollo | Apollon, Apollo |
| `artemis` | Artemis / Diana | Artemis, Diana |
| `ares` | Ares / Mars | Ares, Mars |
| `aphrodite` | Aphrodite / Venus | Aphrodite, Venus |
| `hephaistos` | Hephaistos / Vulcanus | Hephaistos, Vulcanus, Vulkan |
| `hermes` | Hermes / Merkur | Hermes, Merkur, Mercurius |
| `dionysos` | Dionysos / Bacchus | Dionysos, Bacchus |
| `hestia` | Hestia / Vesta | Hestia, Vesta |

For each, fill in the `figures` array in `src/data/figures.ts` using this shape:

```ts
{
  id: 'zeus',
  name: 'Zeus / Jupiter',
  aliases: ['Zeus', 'Jupiter', 'Iuppiter'],
  category: 'olymp',
  pantheon: 'beide',
  kind: 'gottheit',
  body: `Zeus ist der König der Götter und Göttinnen und herrscht vom Berg Olymp aus. Sein Symbol ist der Blitz, sein heiliges Tier der Adler. Er ist mit seiner Schwester [[hera]] verheiratet und hat zahlreiche Kinder — darunter [[athene]], [[apollon]], [[artemis]], [[ares]], [[hermes]] und [[dionysos]]. Bei den Römern heisst er Jupiter und ist ebenso oberster Gott des Himmels und des Donners. Auch [[story:titanenkrieg|im Krieg gegen die Titanen]] führte Zeus die jüngere Göttergeneration in den Sieg.`
},
```

Apply the style guide rigorously. Use `[[...]]` cross-links where natural — they will resolve to placeholders for un-written entries (warnings in console), which becomes the to-do list for later batches.

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS

- [ ] **Step 3: Run tests (resolver tests now have real data alongside fixtures — fixtures still pushed in `beforeEach` so they coexist)**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 4: Manual UI check**

Run: `pnpm dev`. Open 📖 on Home → Olymp section now has 14 entries. Tap one. Body renders. Cross-links to un-written entries show as `??:helden:herakles` placeholders — expected.

- [ ] **Step 5: Commit**

```bash
git add src/data/figures.ts
git commit -m "data(lexikon): add 14 olympische Gottheiten with cross-linked bios"
```

---

### Task 22: Write figure entries — Held:innen (Batch 2)

**Files:**
- Modify: `src/data/figures.ts`

- [ ] **Step 1: Identify heroes from `/tmp/figure-candidates.txt` and questions.ts**

Likely heroes (from a typical mythology curriculum + this question set):

| ID | Name | Pantheon | Notes |
|---|---|---|---|
| `herakles` | Herakles / Hercules | beide | aliases incl. "Herakles", "Hercules", "Herkules" |
| `perseus` | Perseus | griechisch | |
| `theseus` | Theseus | griechisch | |
| `odysseus` | Odysseus / Ulysses | beide | aliases "Odysseus", "Ulixes", "Ulysses" |
| `achilles` | Achilles | griechisch | |
| `iason` | Iason / Jason | griechisch | aliases "Iason", "Jason" |
| `orpheus` | Orpheus | griechisch | |
| `bellerophon` | Bellerophon | griechisch | |
| `atalante` | Atalante | griechisch | |
| `ariadne` | Ariadne | griechisch | |
| `medea` | Medea | griechisch | |
| `aeneas` | Aeneas | roemisch | (Romulus → eigener Eintrag?) |
| `romulus` | Romulus | roemisch | Gründer Roms |

Cross-check `/tmp/figure-candidates.txt` for any not in this list that appear ≥2x — add them if they're heroic. **`kind: 'held'` for male, `kind: 'heldin'` for female.**

- [ ] **Step 2: Write the entries**

Append each entry to the `figures` array in `src/data/figures.ts`. Apply style guide. Cross-link liberally — to gods (existing entries), monsters they fought (placeholders until Batch 3), stories (placeholders until story batch).

- [ ] **Step 3: Typecheck, test, manual check**

Run: `pnpm check && pnpm test && pnpm dev`
Manual: open Lexikon → Held:innen section populated.

- [ ] **Step 4: Commit**

```bash
git add src/data/figures.ts
git commit -m "data(lexikon): add Held:innen bios with cross-links to gods and myths"
```

---

### Task 23: Write figure entries — Monster (Batch 3)

**Files:**
- Modify: `src/data/figures.ts`

- [ ] **Step 1: Identify monsters from candidates + questions**

Likely monsters:

| ID | Name |
|---|---|
| `medusa` | Medusa |
| `minotaurus` | Minotaurus |
| `kerberos` | Kerberos / Cerberus |
| `hydra` | Lernäische Hydra |
| `zyklopen` | Zyklopen (z.B. Polyphem) |
| `chimaera` | Chimaira |
| `sphinx` | Sphinx |
| `pegasus` | Pegasos (geflügeltes Pferd — `kind: 'monster'` oder `sterblich`? → `monster` als Sammelkategorie) |
| `typhon` | Typhon |
| `echidna` | Echidna |
| `sirenen` | Sirenen |
| `harpyien` | Harpyien |
| `gorgonen` | Gorgonen |

Cross-check `/tmp/figure-candidates.txt`. Set `kind: 'monster'` for all, `category: 'monster'`.

- [ ] **Step 2: Write entries** with cross-links to heroes who fought them and stories they're part of.

- [ ] **Step 3: Typecheck, test, manual check**

- [ ] **Step 4: Commit**

```bash
git add src/data/figures.ts
git commit -m "data(lexikon): add monsters with cross-links to heroes and myths"
```

---

### Task 24: Write figure entries — Titanen + Sonstige (Batch 4)

**Files:**
- Modify: `src/data/figures.ts`

- [ ] **Step 1: Identify titans and remaining figures from candidates**

Titans:

| ID | Name |
|---|---|
| `kronos` | Kronos / Saturn |
| `rhea` | Rhea |
| `gaia` | Gaia |
| `uranos` | Uranos |
| `prometheus` | Prometheus |
| `atlas` | Atlas |
| `hyperion` | Hyperion |
| `okeanos` | Okeanos |

Sonstige (Nymphen, kleinere Gottheiten, etc.):

| ID | Name | Kategorie |
|---|---|---|
| `persephone` | Persephone / Proserpina | sonstige (Tochter, halb-Olymp, halb-Unterwelt) |
| `eros` | Eros / Cupido | sonstige |
| `pan` | Pan / Faunus | sonstige |
| `nike` | Nike / Victoria | sonstige |
| `iris` | Iris | sonstige |
| `hekate` | Hekate | sonstige |

Cross-check candidates for anyone still uncovered (e.g. **`Echo`**, **`Narziss`**, **`Pandora`**) → `category: 'sonstige'`.

- [ ] **Step 2: Write entries**

- [ ] **Step 3: Typecheck, test, manual check**

By end of this task, console should have very few `[lexikon] unknown ref in body` warnings — most cross-links should resolve. Remaining ones are `story:...` placeholders, fixed in Task 25.

- [ ] **Step 4: Commit**

```bash
git add src/data/figures.ts
git commit -m "data(lexikon): add Titanen, Persephone, Eros, and Sonstige"
```

---

### Task 25: Write story entries

**Files:**
- Modify: `src/data/stories.ts`

- [ ] **Step 1: Identify the ~25–35 myths referenced in questions/explanations**

Suggested core myths (cross-reference with `questions.ts` explanations and figure bodies for any `[[story:xxx]]` placeholders still showing warnings):

| ID | Title |
|---|---|
| `titanenkrieg` | Der Titanenkrieg (Titanomachie) |
| `kronos-frisst-kinder` | Kronos verschlingt seine Kinder |
| `persephone-raub` | Persephones Raub und die Jahreszeiten |
| `troja` | Der Trojanische Krieg |
| `troja-pferd` | Das Trojanische Pferd |
| `odyssee` | Die Odyssee — Heimkehr |
| `polyphem` | Odysseus und der Zyklop Polyphem |
| `argonauten` | Die Argonauten und das Goldene Vlies |
| `herakles-arbeiten` | Die zwölf Aufgaben des Herakles |
| `theseus-minotaurus` | Theseus und der Minotaurus |
| `perseus-medusa` | Perseus enthauptet Medusa |
| `daedalus-ikarus` | Daedalus und Ikarus |
| `pandora` | Die Büchse der Pandora |
| `prometheus-feuer` | Prometheus bringt das Feuer |
| `arachne` | Arachne fordert Athene heraus |
| `narziss` | Narziss und Echo |
| `orpheus-eurydike` | Orpheus und Eurydike |
| `midas` | König Midas und das Gold |
| `phaeton` | Phaeton und der Sonnenwagen |
| `bellerophon-pegasus` | Bellerophon und Pegasus |
| `aphrodite-geburt` | Die Geburt der Aphrodite |
| `dionysos-piraten` | Dionysos und die Piraten |
| `oedipus` | Ödipus und das Rätsel der Sphinx |
| `iason-medea` | Iason und Medea |
| `aeneas-rom` | Aeneas und die Gründung Roms |
| `romulus-remus` | Romulus und Remus |

- [ ] **Step 2: Write story entries**

Each story is ~180–280 words, narrative tone, with cross-links to figures involved. Example:

```ts
{
  id: 'persephone-raub',
  title: 'Persephones Raub und die Jahreszeiten',
  body: `[[persephone]] war die Tochter von [[demeter]], der Göttin der Ernte. Als sie eines Tages auf einer Wiese Blumen pflückte, öffnete sich plötzlich der Boden: [[hades]] kam mit seinem Wagen aus der Unterwelt hervor und entführte sie ...`
},
```

- [ ] **Step 3: Typecheck, test, manual UI check**

- [ ] **Step 4: Commit**

```bash
git add src/data/stories.ts
git commit -m "data(lexikon): add core myth stories with cross-links"
```

---

### Task 26: Augment questions with `figureIds` and `storyId`

**Files:**
- Modify: `src/data/questions.ts` (all 201 questions get reviewed; most get edited)

- [ ] **Step 1: Write a mapping helper script**

Create `scripts/suggest-question-tags.ts`:

```ts
// scripts/suggest-question-tags.ts
// Reads questions and suggests figureIds via alias-match against figures.
// Run: pnpm tsx scripts/suggest-question-tags.ts > /tmp/suggested-tags.txt
import { questions } from '../src/data/questions';
import { figures } from '../src/data/figures';

function suggestForText(text: string): string[] {
  const hits = new Set<string>();
  for (const fig of figures) {
    for (const alias of fig.aliases) {
      // Word-boundary match, case-insensitive
      const re = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
      if (re.test(text)) {
        hits.add(fig.id);
        break;
      }
    }
  }
  return [...hits];
}

for (const q of questions) {
  const combined = q.question + ' ' + q.options.join(' ') + ' ' + q.explanation;
  const ids = suggestForText(combined);
  console.log(`${q.id}\t${ids.join(',')}`);
}
```

- [ ] **Step 2: Run the script**

Run: `pnpm tsx scripts/suggest-question-tags.ts > /tmp/suggested-tags.txt`

Inspect: `head -50 /tmp/suggested-tags.txt`

The output is tab-separated `question-id<TAB>figure-ids`. Use it as a starting point — manually review each question to confirm/adjust, and add `storyId` where appropriate.

- [ ] **Step 3: Commit the script**

```bash
git add scripts/suggest-question-tags.ts
git commit -m "tooling: script to suggest figureIds per question via alias match"
```

- [ ] **Step 4: Augment questions in batches of ~50**

Open `src/data/questions.ts` and walk through. For each question:
- Add `figureIds: ['...', '...']` listing the involved figures (typically 1–5)
- Add `storyId: '...'` if the question is about a specific narrative myth (often empty for attribute questions)

Commit after each batch:

```bash
git add src/data/questions.ts
git commit -m "data(questions): tag batch 1/4 (q1–q50) with figureIds and storyId"
```

Repeat for q51–q100, q101–q150, q151–q201.

- [ ] **Step 5: Final typecheck and tests**

Run: `pnpm check && pnpm test`
Expected: PASS

- [ ] **Step 6: Final manual check**

Run: `pnpm dev`. Play a round. After each question, the explanation box should show "Mehr erfahren:" with figure chips and (if applicable) story chip. Click around — modal opens with content, cross-links work, ✓ markers persist after closing/reopening.

---

## Phase E — Polish (skip for v1 unless requested)

Not in scope for initial implementation:
- Search field in `LexikonList` (only if any section >50 entries)
- Modal slide-in/out animation
- Custom SVG icons instead of emoji
- "Alle als gelesen markieren" / Reset gelesen

---

## Done-Criteria

- [ ] `pnpm test` passes (all unit tests for resolver, migration, lexikon helpers)
- [ ] `pnpm check` passes (type-check clean)
- [ ] `pnpm build` succeeds
- [ ] Manual: book icon visible on Home, ThemePicker, Result, Stats (not Quiz)
- [ ] Manual: chips appear in every explanation box that has tagged figures/stories
- [ ] Manual: modal opens, navigates via cross-links, back-stack works, ✕ closes
- [ ] Manual: "Als gelesen markieren" persists across page reloads
- [ ] Manual: existing localStorage with `schemaVersion: 1` migrates without data loss
- [ ] All 201 questions either have `figureIds`/`storyId` set, or are confirmed as attribute-only (no chips expected)
