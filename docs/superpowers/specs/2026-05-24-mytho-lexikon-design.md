# Mytho-Lexikon — Design Spec

**Datum:** 2026-05-24
**Kontext:** Erweiterung von Meret's Mythologie (siehe `2026-05-24-meretquiz-design.md`)
**Auslöser:** Beim Spielen merkt man, dass man die Geschichten der Figuren nicht kennt — die `optionNotes` und Erklärungen reichen nicht für echtes Verstehen.

## 1. Ziel

Ein in die App eingebettetes Mini-Lexikon mit zwei Entitätstypen — **Figuren** (Götter, Heldinnen, Monster, Titanen) und **Geschichten** (Mythen) — das aus der Erklär-Box jeder Frage zugänglich ist und zusätzlich über ein Buch-Icon in der Titelleiste als eigenständige Browsing-Ressource dient.

Erfolg = beim Spielen einer Frage zu Hera kann Meret mit zwei Tippen ihre komplette Story und die ihrer Familie nachlesen, kann von Hera zu Zeus zu Persephones Raub springen, und behält den Überblick was sie schon gelesen hat.

## 2. Entscheidungen (fixiert in Brainstorming)

| # | Entscheidung |
|---|---|
| 1 | Zwei Entitätstypen: **Figur** und **Geschichte** (separates Konzept, nicht jedes Figur hat eine Geschichte, nicht jede Geschichte hat nur eine Figur) |
| 2 | Zugang: Chips in **MERKEN und GUT-GEMACHT-Box** + **Buch-Icon in Titelleiste** auf Home/ThemePicker/Result/Stats (NICHT im Quiz) |
| 3 | UI: **Modal-Overlay** mit eigenem Back-Stack. Schliessen kehrt zum darunter liegenden View zurück, Quiz-State bleibt erhalten |
| 4 | Lexikon-Übersicht: **Kategorien-Akkordeon** — Olymp / Held:innen / Monster / Titanen / Sonstige für Figuren, separate **Mythen**-Sektion für Geschichten |
| 5 | Content-Strategie: **Claude entwirft, User redigiert** in Batches. Stil-Leitfaden: 11-jährige Zielgruppe, inklusive Sprache, Schweizer Schreibweise (ss statt ß) |
| 6 | Pantheon-Merger: Zeus und Jupiter teilen einen Eintrag («Zeus / Jupiter»), `aliases[]` mappt beide Namen auf eine ID |
| 7 | Cross-Link-Syntax: Inline-Tokens `[[zeus]]`, `[[story:troja]]`, `[[zeus\|der Donnergott]]`. Eigener Tokenizer ~30 Zeilen, kein Markdown-Lib |
| 8 | Frage→Figur-Mapping: **hand-getaggt** als `figureIds: string[]` + optional `storyId` pro Frage. Skript schlägt vor, Mensch entscheidet |
| 9 | Gelesen-Status: **expliziter Button** am Ende jedes Eintrags. Persistiert in `localStorage` (Schema-Bump v1→v2). Sichtbar als ✓ in Übersicht und in Cross-Links |
| 10 | Verworfen: komprimiertes localStorage (statischer Content gehört ins Bundle, gzip + Service-Worker reichen) |

## 3. Architektur-Übersicht

```
                  ┌────────────────────────────────────────────┐
                  │  App.svelte (view switcher, unverändert)   │
                  │   Home · ThemePicker · Quiz · Result ·     │
                  │   Stats                                    │
                  └──────┬─────────────────────┬───────────────┘
                         │                     │
            (Buch-Icon)  │                     │  (Chips in
            ausser Quiz  │                     │   MERKEN/GUT-GEMACHT-Box
                         ▼                     ▼   während Quiz)
                  ┌────────────────────────────────────┐
                  │  LexikonModal.svelte (overlay)     │
                  │   • eigener Back-Stack             │
                  │   • Schliessen → kehrt zu darunter │
                  │     liegendem View zurück          │
                  ├────────────────────────────────────┤
                  │  LexikonList  ↔  LexikonEntry      │
                  │  (Akkordeon)     (Figur/Story)     │
                  └────────────────────────────────────┘

Datenquellen (alle statisch, ins Bundle gebacken):
  src/data/figures.ts     — Figure[]
  src/data/stories.ts     — Story[]
  src/data/questions.ts   — augmentiert mit figureIds[] + storyId?

State:
  src/lib/store.svelte.ts — bestehend, erweitert um lexikon: { open, stack }
  src/storage/appState.ts — bestehend, erweitert um lexikonRead (v2)
```

## 4. Komponenten-Aufteilung

| Komponente | Rolle | Datei |
|---|---|---|
| `LexikonModal` | Overlay-Shell. Öffnen/Schliessen, Header mit Zurück/✕, rendert oberen Stack-Eintrag | `src/components/LexikonModal.svelte` |
| `LexikonList` | Akkordeon-Übersicht. Sektionen mit Read-Counter, Liste mit ✓-Markierung | `src/components/LexikonList.svelte` |
| `LexikonEntry` | Detail-View: Header (Name + Tags), Body (mit gerenderten Cross-Links), «Gelesen»-Toggle | `src/components/LexikonEntry.svelte` |
| `LexikonLink` | Gerenderter Cross-Link aus Body — Button mit dezentem ✓ wenn Ziel schon gelesen | `src/components/LexikonLink.svelte` |
| `LexikonChips` | Chips-Reihe in MERKEN/GUT-GEMACHT-Box: Figuren-Chips + ein Story-Chip | `src/components/LexikonChips.svelte` |
| `resolver.ts` | Pure Funktionen: `getFigure(id)`, `getStory(id)`, `resolveByAlias(name)`, `tokenizeBody(text)` | `src/lexikon/resolver.ts` |
| `types.ts` | TS-Typen | `src/lexikon/types.ts` |

## 5. Datenmodell

### 5.1 Lexikon-Typen

```ts
// src/lexikon/types.ts
export type LexikonCategory =
  | 'olymp' | 'helden' | 'monster' | 'titanen' | 'sonstige'  // für Figuren
  | 'mythen';                                                 // für Geschichten

export type Pantheon = 'griechisch' | 'roemisch' | 'beide';

export type FigureKind =
  | 'gottheit' | 'held' | 'heldin' | 'monster' | 'titan' | 'nymphe' | 'sterblich';

export interface Figure {
  id: string;                 // kebab-case, stabil, z.B. 'zeus', 'herakles'
  name: string;               // Anzeigename, z.B. 'Zeus / Jupiter'
  aliases: string[];          // ['Zeus', 'Jupiter', 'Iuppiter'] — für Frage-Mapping
  category: Exclude<LexikonCategory, 'mythen'>;
  pantheon: Pantheon;
  kind: FigureKind;
  body: string;               // ~120–180 Wörter, plain text + [[token]]-Links
}

export interface Story {
  id: string;                 // z.B. 'persephone-raub', 'troja'
  title: string;              // Anzeigetitel
  body: string;               // ~180–280 Wörter, plain text + [[token]]-Links
}

export type LexikonEntry =
  | { kind: 'figure'; data: Figure }
  | { kind: 'story';  data: Story };

export type EntryRef =
  | { kind: 'figure'; id: string }
  | { kind: 'story';  id: string };
```

### 5.2 Question-Augmentation

```ts
// src/game/types.ts — bestehende Interface erweitert (alle neu sind optional)
export interface Question {
  // ... alle bisherigen Felder unverändert
  figureIds?: string[];       // hand-getaggte involvierte Figuren-IDs
  storyId?: string;           // optionaler Mythos zur Frage
}
```

Existierende Fragen ohne diese Felder funktionieren weiter; ihre Chips erscheinen nur dann, wenn etwas getaggt ist. Bis Phase D abgeschlossen ist, sehen nicht-getaggte Fragen keine Chips — keine «kommt bald»-Platzhalter, einfach Abwesenheit.

### 5.3 AppState v2

```ts
// src/storage/schema.ts
export const CURRENT_SCHEMA_VERSION = 2;

export interface AppStateV2 {
  schemaVersion: 2;
  // ... alle v1-Felder unverändert: perQuestion, rounds, totals, settings
  lexikonRead: {
    figures: string[];        // Set wäre semantisch, aber JSON → string[]
    stories: string[];
  };
}
```

**Migration v1 → v2** in `storage/appState.ts`:
- Beim Laden: Wenn `schemaVersion === 1`, hänge `lexikonRead: { figures: [], stories: [] }` an und setze Version auf 2
- Wenn `schemaVersion === undefined` oder unbekannt: kompletter Reset auf leeres v2 (wie heute v1-Reset)

### 5.4 Modal-UI-State (ephemer, NICHT persistiert)

```ts
// src/lib/store.svelte.ts
export interface LexikonUiState {
  open: boolean;
  stack: EntryRef[];          // top = aktuell sichtbar; [] wenn LexikonList angezeigt wird
}
```

Aktionen:
- `openLexikon()` → `open = true`, `stack = []` (zeigt Übersicht)
- `openEntry(ref)` → `open = true`, `stack = [ref]`
- `pushEntry(ref)` → push (Cross-Link folgen)
- `popEntry()` → pop (Zurück-Button)
- `closeLexikon()` → `open = false`, `stack = []`

Beim App-Reload startet das Modal geschlossen — bewusst, weil Modal-Wiederauftauchen verwirrend wäre.

## 6. Cross-Link-Format und Renderer

### 6.1 Token-Syntax

Im `body`-String:

| Token | Bedeutung | Anzeigetext |
|---|---|---|
| `[[zeus]]` | Figur mit ID `zeus` | Figuren-`name` (z.B. «Zeus / Jupiter») |
| `[[story:troja]]` | Geschichte mit ID `troja` | Geschichten-`title` (z.B. «Der Trojanische Krieg») |
| `[[zeus\|Zeus]]` | Figur, expliziter Anzeigetext | `Zeus` |
| `[[story:troja\|den Krieg um Troja]]` | Geschichte, expliziter Text | `den Krieg um Troja` |

### 6.2 Tokenizer

Pure Funktion in `src/lexikon/resolver.ts`:

```ts
type BodySegment =
  | { kind: 'text'; value: string }
  | { kind: 'link'; target: EntryRef; label: string };

function tokenizeBody(body: string): BodySegment[];
```

Regex-basiert (`/\[\[([^\]]+)\]\]/g`), Split-and-Map. Falls eine ID nicht aufgelöst werden kann (Tippfehler), wird der Token als Plain-Text «??:zeus» dargestellt und in der Dev-Konsole gewarnt — die Daten sind statisch, Inkonsistenzen sollen früh sichtbar werden.

Tests in `tests/`: leerer String, Body ohne Links, mehrere Links hintereinander, Link mit Pipe, unbekannte ID, verschachtelte Klammern (sollen nicht supportet werden — `[[a[[b]]]]` ist ein Fehler).

## 7. UI-Verhalten

### 7.1 Buch-Icon in Titelleiste

- Symbol: 📚 (oder 📖 — finale Wahl im Polish)
- Position: rechts in Header, 32×32px Tap-Target
- Erscheint in: `Home`, `ThemePicker`, `Result`, `Stats`
- Erscheint NICHT in: `Quiz` (Header bleibt unverändert mit Back-Pfeil, Counter, Streak)
- Tippen → `openLexikon()` → Modal mit `LexikonList`

### 7.2 Chips in Erklär-Box

`ExplanationBox.svelte` bekommt eine neue Sektion am Ende (nur wenn `question.figureIds?.length || question.storyId`):

```
┌──────────────────────────────────────────┐
│ 💡 ZUM MERKEN  oder  💡 GUT GEMACHT      │
│                                          │
│ <bestehender Body-Text>                  │
│ <wrongPickNote falls vorhanden>          │
│                                          │
│ Mehr erfahren:                           │  ← neue Sektion
│ 🧑 Hera ✓   🧑 Zeus   🧑 Apollon         │
│ 📜 Heras Eifersucht                      │
└──────────────────────────────────────────┘
```

- Figuren-Chips: 🧑-Icon + Anzeigename (vom Resolver), ✓-Badge wenn gelesen
- Story-Chip (falls vorhanden): 📜-Icon + Titel, ✓-Badge wenn gelesen
- Tap → `openEntry({ kind, id })`

**API-Änderung an `ExplanationBox`**: braucht jetzt nicht nur `text`/`wrongPickNote`, sondern auch `question: Question` (oder zumindest `figureIds`, `storyId`), damit es die Chips selbst aus dem Resolver auflösen kann. `Quiz.svelte` reicht das aktuelle Question-Objekt durch.

### 7.3 Modal — Lexikon-Übersicht

`LexikonList.svelte` wenn `stack.length === 0`:

```
┌── LexikonModal ────────────────────┐
│                       Lexikon  ✕   │
├────────────────────────────────────┤
│  ▼ Olymp                  18 / 24  │
│      ✓ Aphrodite / Venus           │
│        Apollon                     │
│      ✓ Ares / Mars                 │
│      …                             │
│  ▶ Held:innen              4 / 22  │
│  ▶ Monster                 0 / 18  │
│  ▶ Titanen                 0 / 8   │
│  ▶ Sonstige                0 / 6   │  ← nur wenn nicht leer
│  ▶ Mythen                  3 / 12  │
└────────────────────────────────────┘
```

- Sektionen zusammenklappbar (Olymp standardmässig offen, Rest zu — bei erstem Öffnen)
- Sektions-Zustand (offen/zu) ephemer, nicht persistiert
- Read-Counter pro Sektion: «X / Y» basierend auf `lexikonRead`
- Einträge alphabetisch sortiert (Locale-aware, `de-CH`)
- Tap auf Eintrag → `pushEntry({ kind, id })`

### 7.4 Modal — Eintrag-Detail

`LexikonEntry.svelte` wenn `stack.length >= 1` (rendert `stack[stack.length - 1]`):

```
┌── LexikonModal ────────────────────┐
│  ← Zurück            Hera     ✕   │  ← Zurück nur wenn stack.length > 1
├────────────────────────────────────┤
│  🧑  Hera / Juno                   │
│  Olymp · griechisch & römisch      │
│                                    │
│  Hera ist die Schwester und Frau   │
│  von [Zeus] und damit Königin der  │  ← Cross-Links als
│  Götter. …                         │     unterstrichene Buttons
│                                    │
│  ──────────────────────────────    │
│  📖 Als gelesen markieren          │  ← bzw. «✓ Gelesen — Tippen zum Zurücksetzen»
└────────────────────────────────────┘
```

- Header: Name, Pantheon-Badge, Kategorie
- Body: Tokenizer-Output gerendert als Svelte-Komponenten-Mix
- «Gelesen»-Toggle ganz unten, persistiert sofort in localStorage
- Cross-Link-Tap → `pushEntry(ref)` (neuer Stack-Eintrag)
- Hardware-Back / Backdrop-Tap / ✕ → `closeLexikon()`
- ← Zurück-Tap → `popEntry()`

### 7.5 Modal-Mechanik (Detail)

- Render via Portal (in `App.svelte` direkt nach dem View-Switch): `{#if lexikon.open}<LexikonModal />{/if}`
- Scroll-Position des darunter liegenden Views bleibt erhalten
- Innerhalb des Modals: jeder Stack-Push resettet die Scroll-Position auf 0
- Bei `popEntry`: Scroll-Position des vorherigen Eintrags **nicht** restored — Trade-off, hält den State-Tree klein. Falls später als störend empfunden, kann pro Stack-Eintrag ein `scrollY` mitgespeichert werden
- ESC-Taste (Desktop) → `closeLexikon()`
- Body-Scroll-Lock während Modal offen (CSS `overflow: hidden` auf `<html>`)

## 8. Datenvolumen und Build

Geschätzt (siehe Brainstorming):

- ~80–100 Figuren × ~150 Wörter × ~6 Bytes ≈ ~70–90 KB roh
- ~30–40 Geschichten × ~230 Wörter × ~6 Bytes ≈ ~40–55 KB roh
- 201 Fragen × ~30 Bytes (figureIds + storyId) ≈ ~6 KB roh
- **Zuwachs roh:** ~120–150 KB → **gzip:** ~35–45 KB
- Bundle wächst von ~70 KB gzip auf ~110 KB gzip. Akzeptabel für PWA.

PWA-Cache: kein Sonderfall — die Daten sind in `figures.ts` / `stories.ts`, werden ins Hauptbundle gebakkt, vom `vite-plugin-pwa` automatisch precached.

## 9. Tests

Neue Unit-Tests in `tests/`:

- `tests/lexikon-resolver.test.ts`:
  - `getFigure(id)` / `getStory(id)` Happy-Path und unbekannte ID
  - `resolveByAlias('Jupiter')` → `zeus`
  - `tokenizeBody` — alle in §6.2 genannten Fälle
- `tests/lexikon-readstate.test.ts`:
  - `toggleLexikonRead` flippt korrekt
  - `isLexikonRead` reagiert auf State
- `tests/storage-migration.test.ts`:
  - v1-State ohne `lexikonRead` → v2-State mit leeren Arrays
  - v2-State bleibt unverändert
  - Korrupter State → Reset auf leeres v2

Manuelle UI-Tests (am Ende von Phase B/C):
- Modal öffnet/schliesst, Back-Stack funktioniert
- Cross-Links navigieren
- Gelesen-Toggle persistiert über Reload
- Quiz-State bleibt erhalten, wenn man während Quiz das Modal öffnet… moment, Quiz hat ja kein Icon. → Stattdessen: Chip-Tap aus MERKEN-Box, Modal schliessen, Frage ist noch da, Erklärung ist noch sichtbar

## 10. Build-Sequenz (Phasen)

```
Phase A — Schema & Resolver (kein UI, testbar)
  1. src/lexikon/types.ts
  2. src/lexikon/resolver.ts             — getFigure, getStory, resolveByAlias, tokenizeBody
  3. src/storage/schema.ts               — v1→v2 Migration
     src/storage/appState.ts             — toggleLexikonRead, isLexikonRead
  4. src/data/figures.ts                 — leeres Array, Typ-Annotation
     src/data/stories.ts                 — leeres Array
  5. Tests (siehe §9)

Phase B — Modal-Infrastruktur (zeigt leere Listen, aber funktional)
  6. src/lib/store.svelte.ts             — lexikon UI-State + Aktionen
  7. src/components/LexikonLink.svelte
  8. src/components/LexikonEntry.svelte
  9. src/components/LexikonList.svelte
  10. src/components/LexikonModal.svelte — Backdrop, Header, Body-Scroll-Lock, ESC
  11. App.svelte                          — Modal-Mount

Phase C — Anker im bestehenden UI
  12. src/components/LexikonChips.svelte
  13. ExplanationBox.svelte               — Chips-Sektion + question-prop
  14. Quiz.svelte                         — Question-Objekt durchreichen
  15. Buch-Icon in Header von Home/ThemePicker/Result/Stats

Phase D — Content (eigener Effort, parallelisierbar)
  16. Skript: extrahiere distinkte Figuren-Namen aus questions.ts
                                          — schreibt scripts/extract-figures.ts
  17. figures.ts — initialer Entwurf für olympische 12 + grosse Helden
  18. figures.ts — Rest (Monster, Titanen, kleinere Gottheiten) in Batches
  19. stories.ts — Mythen identifizieren und schreiben
  20. questions.ts augmentieren: figureIds + storyId
       (Skript schlägt vor via Alias-Match, Mensch reviewt)
  21. User-Review-Schleifen

Phase E — Polish (nice-to-have)
  22. Such-Feld in LexikonList (wenn Sektionen >50 Einträge haben)
  23. Animationen für Modal slide-in/out
  24. PWA-Offline-Test
```

**Reihenfolge-Garantie:** Phase A → B → C ist strikt sequenziell. Phase D kann nach A starten (parallel zu B/C). Phase E erst nach D.

## 11. Aus Scope ausgeschlossen (V1)

- **Such-Funktion** — erst in Phase E, falls überhaupt nötig
- **History «Zuletzt gelesen»** — YAGNI, der ✓-Status ist genug
- **Bilder/Illustrationen** — nur Text + Emoji-Icons, sonst sprengt das Bundle und macht Content-Erstellung 10× aufwändiger
- **«Alle als gelesen markieren» / «Reset gelesen»** — Stats/Settings-Erweiterung später
- **Mehrsprachigkeit** — App ist deutsch
- **Voice-Reading / TTS** — kein Bedarf

## 12. Offene Punkte (nicht-blockierend für Implementierung)

- **Icon-Wahl**: 📚 vs. 📖 vs. eigenes SVG — entscheiden in Phase E
- **Standardmässig offene Sektion** in LexikonList — «Olymp» offen, Rest zu? Oder alle zu?
- **Story-Liste-Vorabauswahl** — welche ~30 Mythen kommen in V1? Vorschlag aus Phase D-Skript-Output ableiten.
