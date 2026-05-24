# Meret's Mythologie

Mobile PWA-Quiz zur griechisch-römischen Götter- und Göttinnenwelt — gebaut für Meret (11), aber für jede:n geeignet.

> 201 Fragen quer durch Olymp, Held:innen, Monster und Mythen — mit erklärenden Antworten zu jeder Option.

## Features

- **Drei Spielmodi**: 10-Fragen-Runde, Endless mit Streak, Lern-Modus (häufig falsch beantwortete Fragen kommen öfter zurück).
- **Orthogonaler Themen-Filter**: Topics (Olymp / Held:innen / Monster / Mythen) und Pantheon (Beide / Griechisch / Römisch) lassen sich frei kombinieren.
- **Didaktisch**: Nach jeder Antwort gibt es eine ausführliche Erklärung — bei falschen Antworten zusätzlich, was die getippte Option eigentlich ist.
- **Offline-fähig** über Service Worker (PWA). Nach dem ersten Aufruf läuft die App komplett ohne Netz.
- **Installierbar**: "Zum Home-Bildschirm hinzufügen" für standalone-Look auf dem Handy.
- **Persistente Statistik**: Spielverlauf, Best-Streak und pro-Frage-Statistik bleiben in `localStorage`.
- **Inklusive Sprache** und Schweizer Schreibweise (ss statt ß).

## Stack

Svelte 5 (Runes) · Vite · TypeScript · pnpm · vite-plugin-pwa · Vitest · happy-dom

## Entwicklung

```bash
pnpm install
pnpm dev          # Dev-Server (http://localhost:5173)
pnpm dev --host   # Im LAN erreichbar (für Handy-Test im selben WLAN)
pnpm test         # 43 Unit-Tests
pnpm check        # svelte-check + tsc
pnpm build        # Production-Build nach dist/
pnpm preview      # Production-Preview lokal
```

> **Node-Hinweis:** Das `pnpm test`-Skript setzt `NODE_OPTIONS=--no-experimental-webstorage`, weil Node v25+ ein eingebautes `localStorage` mitbringt, das happy-dom in den Tests sonst verdeckt. Auf Node v22 (CI) ist das Flag unbekannt — der GitHub-Actions-Workflow umgeht das Skript daher und ruft vitest direkt auf.

## Deploy

Auf jeden Push nach `main` deployt GitHub Actions automatisch auf GitHub Pages (`.github/workflows/deploy.yml`).

**Einmalige Einrichtung im Repo:**

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**
2. Erster Push auf `main` triggert den Workflow
3. App ist erreichbar unter `https://<user>.github.io/meretquiz/`

Der Vite-`base` wechselt automatisch auf `/meretquiz/`, sobald `GITHUB_PAGES=true` gesetzt ist — lokal bleibt es `/`.

## Projektstruktur

```
src/
  views/          # Home, ThemePicker, Quiz, Result, Stats
  components/     # QuestionCard, AnswerOption, ExplanationBox, ProgressBar,
                  # StatsCard, ThemeChip, ModeCard, ConfirmModal
  game/           # GameMode-Interface, 3 Modi (ten/endless/learn), themeFilter
  storage/        # AppState-Schema und localStorage-Sync
  data/           # questions.ts (201 Fragen)
  lib/            # Router-Typen und reaktiver App-Store (Svelte 5 Runes)
tests/            # Vitest Unit-Tests für Logik
docs/superpowers/
  specs/          # Design-Spec
  plans/          # Implementierungs-Plan
```

## Architektur kurz

- **Spielmodi orthogonal zum Themen-Filter**: `themeFilter` reduziert den Fragen-Pool zuerst (topic-set ∩ pantheon), dann wählt der Modus die nächste Frage aus dem gefilterten Pool. Neue Modi oder neue Topics lassen sich unabhängig hinzufügen.
- **Frage-Schema**: jede Frage trägt 4 Optionen, einen `correctIndex`, eine Haupterklärung und `optionNotes[4]` mit null für die richtige Antwort und kurzen Erklärungen für die falschen.
- **Single-Page-View-Switch**: kein Router-Framework — ein Svelte-Store hält den aktiven View ('home' | 'themePicker' | 'quiz' | 'result' | 'stats'), `App.svelte` switcht.
- **Storage** mit Schema-Versionierung und Crash-Härtung (geguardete Loads, Migration alter `themeFilter`-Strings).

## Datenmodell

`localStorage`-Key: `meretsMythologie.v1`. Inhalt:

```ts
{
  schemaVersion: 1,
  perQuestion: { [id]: { correctCount, wrongCount, lastSeen, lastResult } },
  rounds: RoundRecord[],        // gecappt auf 50, jeweils mit answeredIds + results
  totals: { gamesPlayed, correctTotal, wrongTotal, bestStreakAllTime },
  settings: { themeFilter: { topics, pantheon } }
}
```

Defaults und Typen in `src/storage/schema.ts`.

## Mitmachen

PRs willkommen — besonders Fragen-Erweiterungen. Beachte die Schreib-Regeln im `src/data/questions.ts`-Header und in den vorhandenen Fragen:

- Schweizer ss (kein ß)
- Inklusive Sprache (kein generisches Maskulinum)
- Faktentreu nach Standard-Mythologie (Hesiod/Homer als Hauptquellen)
- Kindgerecht für 11-Jährige

Bei neuen Themen-Tags den `ThemeFilter`-Typ in `src/storage/schema.ts` erweitern und Tests in `tests/game/themeFilter.test.ts` ergänzen.

## Lizenz

[MIT](./LICENSE) — Tobias Oetiker, 2026.
