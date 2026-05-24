# Meret's Mythologie

Mobile PWA-Quiz zur griechisch-römischen Götter- und Göttinnenwelt — für Meret (11).

## Stack

Svelte 5 (Runes) · Vite · TypeScript · pnpm · vite-plugin-pwa · Vitest

## Entwicklung

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # Unit-Tests
pnpm build        # Production-Build nach dist/
pnpm preview      # Production-Preview lokal
```

## Deploy

Auf jeden Push nach `main` deployt GitHub Actions automatisch auf GitHub Pages.

**Einmalige Einrichtung im Repo:**
1. Settings → Pages → Build and deployment → Source: **GitHub Actions**
2. Erster Push auf `main` triggert den Workflow
3. App ist erreichbar unter `https://<user>.github.io/meretquiz/`

## Projektstruktur

```
src/
  views/          # Home, ThemePicker, Quiz, Result, Stats
  components/     # QuestionCard, AnswerOption, ExplanationBox, ProgressBar, StatsCard, ThemeChip, ModeCard
  game/           # Mode-Interface, 3 Modi (ten/endless/learn), themeFilter
  storage/        # localStorage-Schema und Sync
  data/           # questions.ts
  lib/            # Router, App-State-Store
docs/superpowers/
  specs/          # Design-Spec
  plans/          # Implementation-Plan
```

## Datenmodell

Alle Spielergebnisse leben in `localStorage` unter dem Key `meretsMythologie.v1`. Schema in `src/storage/schema.ts`. Bei Schema-Mismatch laden Defaults (V1 hat noch keine Migrationen).

## Offline

Nach dem ersten Aufruf läuft die App komplett offline (Workbox-Precache). Updates werden automatisch eingespielt, sobald keine Quiz-Runde läuft.

## Inklusive Sprache

Keine generischen Maskulina in UI-Texten — siehe Spec, Abschnitt 1.
