# Meret's Mythologie — Design Spec

**Datum:** 2026-05-24
**Zielgruppe:** Meret, 11 Jahre, Schweiz. Interessiert an griechisch-römischer Mythologie, mit wenig Vorwissen.
**Zweck:** Mobile Quiz-Webapp mit didaktischem Anspruch — beim Spielen Wissen aufbauen.

## 1. Übersicht

Mobile-first PWA für ein Quiz zu griechischer und römischer Mythologie. Mehrere Spielmodi, die alle aus dem gleichen Fragen-Pool schöpfen (Fragen tragen die nötigen Meta-Daten). Single-User (keine Profile). Offline-fähig nach erstem Aufruf. Ergebnisse persistieren in `localStorage`.

UI in Hochdeutsch, "du"-Form, kindgerecht. Inklusive Sprache: kein generisches Maskulinum (z.B. "Gottheiten", "Götter und Göttinnen", nicht "Götter" als Sammelbegriff).

## 2. Tech-Stack

- **Build/Dev:** Vite (latest)
- **Framework:** Svelte (latest stable, mind. Svelte 5 mit Runes-API)
- **Sprache:** TypeScript
- **Paketmanager:** pnpm (zwingend, kein npm/yarn)
- **PWA:** `vite-plugin-pwa` (`registerType: 'autoUpdate'`, Strategie `precache`)
- **Styling:** Vanilla CSS mit CSS-Variablen für Theme-Farben (klein gehalten, keine Build-Dependency mehr; falls Tailwind im Plan-Schritt überzeugend argumentiert wird, kann das gewechselt werden)
- **Tests:** Vitest für Unit (Logik), Playwright optional für E2E
- **Hosting:** beliebig (statischer Output) — z.B. GitHub Pages, Netlify, eigener Webserver

Ausdrücklich **keine**: Backend, Datenbank, Login, Cloud-Sync, Analytics.

## 3. Spielmodi (V1, alle vier)

Alle Modi schöpfen aus demselben Fragen-Pool. Modus-Konfiguration legt fest: Rundenlänge, Auswahl-Strategie, Timer ja/nein, Filter.

| Modus | Länge | Auswahl | Timer | Besonderheit |
|---|---|---|---|---|
| **10 Fragen** | 10 | Zufall aus allen | nein | Klassische Runde, Score am Ende |
| **Endless** | offen | Zufall, keine Wiederholung pro Sitzung | nein | Streak-Zähler läuft bis erster Fehler; danach Streak auf 0 zurück, Spiel läuft trotzdem weiter; Beenden jederzeit via Zurück-Button |
| **Lern-Modus** | 10 oder offen | Gewichtete Auswahl (häufig-falsch zuerst, lange-nicht-gesehen) | nein | Vereinfachter Leitner; pro Frage `correctCount`/`wrongCount` |
| **Themen** | 10 | Zufall aus gewähltem Thema | nein | Nutzer:in wählt vor Start ein Thema (Olymp / Helden / Monster / Pantheon-Filter) |

Architektur: Game-Mode ist ein Interface mit Methoden wie `selectNextQuestion(pool, history)`, `isFinished(state)`, `onAnswer(state, result)`. Neue Modi (z.B. mit Timer) lassen sich später ohne UI-Umbau ergänzen.

## 4. Datenmodell

### 4.1 Frage (statisches JSON, ausgeliefert mit App)

```ts
interface Question {
  id: string;                        // stabil, z.B. "q-zeus-king"
  question: string;
  options: string[];                 // 4 Antworten
  correctIndex: number;              // 0..3
  explanation: string;               // 2-4 Sätze, didaktisch
  themes: string[];                  // ["olymp", "griechisch"] etc.
  difficulty: 1 | 2 | 3;             // 1 leicht ... 3 schwer
  pantheon: 'griechisch' | 'römisch' | 'beide';
  relatedIds?: string[];             // optional, z.B. Zeus ↔ Jupiter
}
```

**Themen-Vokabular (Tags):**
- `olymp` — die 12 Olympier:innen
- `helden` — Herakles, Perseus, Theseus, Achilles, Odysseus …
- `monster` — Medusa, Minotaurus, Hydra, Zyklopen, Sphinx …
- `mythen` — Erzählungen (Pandora, Trojanischer Krieg, …)
- `griechisch` / `römisch` — Pantheon-Filter (orthogonal zu obigen)

Eine Frage kann mehrere Tags haben.

### 4.2 localStorage

Ein Schlüssel `meretsMythologie.v1`, Wert ein JSON-Objekt:

```ts
interface AppState {
  schemaVersion: 1;
  perQuestion: Record<string, {
    correctCount: number;
    wrongCount: number;
    lastSeen: number;        // unix ms
    lastResult: 'correct' | 'wrong';
  }>;
  rounds: Array<{
    date: number;            // unix ms
    mode: 'ten' | 'endless' | 'learn' | 'theme';
    score: number;           // richtige
    total: number;           // gespielte
    bestStreakInRound: number;
    themeFilter?: string;    // bei mode='theme'
  }>;                        // begrenzt auf letzte 50
  totals: {
    gamesPlayed: number;
    correctTotal: number;
    wrongTotal: number;
    bestStreakAllTime: number;
  };
  settings: {
    // platzhalter für später (sound etc.)
  };
}
```

Schreibe-Strategie: nach jeder beantworteten Frage atomar speichern (kompletter State, kein Diff). Lesen beim App-Start einmal in Svelte-Store laden, danach in-memory mutieren und nach jedem Mutation-Punkt zurückschreiben. Bei `schemaVersion`-Mismatch im V1: Defaults laden (V1 hat noch keine Migrationen).

### 4.3 Frage-Daten als statische Asset

Fragen liegen in `src/data/questions.ts` (oder `.json`) und werden mit dem Bundle ausgeliefert. Kein Lazy-Load. So sind sie automatisch Teil des Service-Worker-Precache und offline verfügbar.

## 5. UI-Architektur

### 5.1 Screens

1. **Home** — Header (App-Titel), Stats-Karte oben (gespielt / % richtig / Streak), Modus-Liste (4 Karten mit Icon + Titel + Subline). Footer mit Link zu "Statistik" und ggf. "Über".
2. **Modus-Setup** (nur Themen-Modus) — Themenwahl als Karten-Grid, dann "Start".
3. **Quiz** — Header (Zurück / Fragezähler / Streak), Fortschrittsbalken, Frage-Karte, 4 Antwort-Optionen. Nach Tap: Antwort-Karten färben sich (grün/rot), Erklärungsbox darunter wird sichtbar, "Weiter"-Button erscheint.
4. **Ergebnis** — Score gross, Vergleich mit eigenem Schnitt, Mini-Stats (richtig/falsch/Best-Streak), Liste falscher Fragen mit korrekter Antwort, primärer Button (Nochmal / Falsche im Lern-Modus üben), Sekundär-Button "Zur Übersicht".
5. **Statistik** — Verlauf der letzten Runden (Liste), Gesamtstatistik, Button "Daten löschen" mit Bestätigungs-Prompt.

### 5.2 Layout-Pattern

App-Shell: fixer Header oben + scrollbarer Content-Bereich darunter. Scroll passiert **innerhalb** der App, nicht auf `<body>`. Bei sehr kleinen Bildschirmen sind Erklärungsbox + Antworten gemeinsam scrollbar; Header und "Weiter"-Button bleiben sichtbar (sticky).

### 5.3 Responsive

Mobile-first, getestet auf Bildschirmen 320–430 px breit (gängige Handy-Bereiche). Bis ~768 px Single-Column-Layout zentriert mit max-width ~480 px auf grösseren Geräten. Tablet/Desktop: gleicher Single-Column-Look, einfach zentriert mit etwas Luft — keine Desktop-spezifische Variante in V1.

Typografie skaliert mit `rem` und `clamp()` — keine fixen px für Text. Touch-Targets mind. 44 px.

### 5.4 Visueller Stil

Verspielt, aber mit ordentlicher Sans-Serif (Nunito oder Quicksand via Google Fonts mit Self-Hosting für Offline). Pastellfarben:
- Hintergrund-Gradient: rosa → hellblau
- Primär (Buttons, Akzent): violett→pink Verlauf (`#7c3aed → #ec4899`)
- Erfolg: grün (`#10b981`)
- Fehler: rot (`#ef4444`)
- Streak/Warm: gelb (`#f59e0b`, Emoji 🔥)
- Karten: weiss mit weichem Schatten, abgerundet (16–18 px)

Emojis als visuelle Symbole (Blitz für Zeus, Eule für Athene, etc.) — keine eigenen Illustrationen oder Bilder von Gottheiten (vermeidet Lizenzfragen, hält Bundle klein).

## 6. Offline & PWA

- `vite-plugin-pwa` Konfiguration: `registerType: 'autoUpdate'`, Workbox-Precache aller Build-Assets inkl. Fragen-JSON
- Web App Manifest mit Name "Meret's Mythologie", Short-Name "Mythologie", Theme-Color passend zum Primary, `display: 'standalone'`, Icons (192/512 px) — Icon-Design: stilisierter Blitz oder Tempel, passend zum Theme
- Erster Aufruf braucht Netz, danach komplett offline (App, Fragen, vorhandene Ergebnisse)
- Update-Strategie: bei neuer Version automatisch reloaden, sobald keine aktive Quiz-Runde läuft (kein abrupter Reload mitten in einer Frage)
- "Zum Home-Bildschirm hinzufügen"-Prompt nutzen falls Browser unterstützt; sonst dokumentieren wir den manuellen Weg im "Über"-Bereich

## 7. Code-Struktur (Vorschlag)

```
src/
  routes/              # falls SvelteKit; sonst views/
    Home.svelte
    Quiz.svelte
    Result.svelte
    Stats.svelte
    ThemePicker.svelte
  components/
    QuestionCard.svelte
    AnswerOption.svelte
    ExplanationBox.svelte
    ProgressBar.svelte
    StatsCard.svelte
  game/
    modes/
      tenQuestions.ts
      endless.ts
      learn.ts
      theme.ts
    types.ts          # GameMode, GameState, AnswerResult
    selectQuestion.ts # gemeinsame Auswahl-Helfer
  storage/
    appState.ts       # Svelte-Store + localStorage-Sync
    schema.ts         # AppState-Typen + Defaults
  data/
    questions.ts      # die Fragen
  lib/
    inclusiveLang.ts  # Hilfsfunktionen für UI-Texte falls nötig
  app.html
  main.ts
```

Empfehlung: **kein SvelteKit-Router**. Für 5 Screens reicht ein State-basierter View-Switch (Svelte-Store hält den aktuellen Screen). Spart Build-Komplexität und passt zur Single-Page-PWA-Natur. Falls sich später Routing lohnt, ist Migration zu SvelteKit überschaubar.

## 8. Was nicht in V1 ist

Explizit ausgeklammert (damit V1 fokussiert bleibt):

- Profile / Mehrbenutzer:innen
- Cloud-Sync, Login, Backend
- Sounds (vielleicht V2)
- Animationen über CSS-Transitions hinaus
- Bilder/Illustrationen von Gottheiten
- Schwierigkeits-Filter im UI (Difficulty ist im Datenmodell, kein UI dafür in V1)
- Daten-Export/Import
- Mehrsprachigkeit (nur Hochdeutsch)
- Vollständiger Fragen-Katalog — V1 startet mit ~20–30 sorgfältig formulierten Fragen quer durch die Themen; Erweiterung in eigener Phase nach UI-Abschluss

## 9. Erfolgskriterien

V1 ist fertig, wenn:

1. Meret kann die App auf ihrem Handy zur Startseite hinzufügen und ohne Netz spielen
2. Alle vier Modi spielbar (auch wenn Lern-Modus und Themen-Modus nur Sinn machen, sobald mehr Fragen da sind)
3. Ergebnisse persistieren über App-Neustart und Browser-Neustart
4. Stats-Screen zeigt sinnvolle Daten nach mehreren Runden
5. UI funktioniert von 320 px aufwärts ohne horizontale Scrollbalken oder abgeschnittene Texte
6. Keine generischen Maskulina in UI-Texten oder Erklärungen
7. Mindestens 20 Beispiel-Fragen vorhanden, damit die App von Tag 1 testbar ist

## 10. Phase 2 (nach UI-Abschluss)

Sobald die UI steht, kommt die zweite Phase: **Fragen-Inhalte**. Ziel ca. 80–150 Fragen quer durch die Themen, in kindgerechter Sprache, mit didaktischen Erklärungen. Diese Phase bekommt einen eigenen Spec.
