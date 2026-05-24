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
- **Hosting/Deploy:** **GitHub Pages** (statischer Output). Vite-`base` muss auf den Repo-Pfad gesetzt werden (z.B. `/meretquiz/`), damit alle Assets, Service-Worker-Scope und PWA-Manifest unter dem Sub-Pfad funktionieren. Deploy via GitHub Actions Workflow auf `gh-pages` Branch (oder Pages-Action). Eigenes Domain-Mapping optional, V1 läuft unter `https://<user>.github.io/meretquiz/`

Ausdrücklich **keine**: Backend, Datenbank, Login, Cloud-Sync, Analytics.

## 3. Spielmodi und Themen-Filter

**Spielmodi und Themen-Filter sind orthogonal.** Jeder Spielmodus kann mit jedem Themen-Filter kombiniert werden. Es gibt 3 Spielmodi und N Themen-Filter, die unabhängig voneinander gewählt werden.

### 3.1 Spielmodi (V1, drei)

Alle Modi schöpfen aus dem gleichen, durch den Themen-Filter eingeschränkten Pool. Modus-Konfiguration legt fest: Rundenlänge, Auswahl-Strategie, Timer ja/nein.

| Modus | Länge | Auswahl | Timer | Besonderheit |
|---|---|---|---|---|
| **10 Fragen** | 10 | Zufall aus gefiltertem Pool | nein | Klassische Runde, Score am Ende |
| **Endless** | offen | Zufall, keine Wiederholung pro Sitzung | nein | Streak-Zähler läuft bis erster Fehler; danach Streak auf 0 zurück, Spiel läuft weiter; Beenden via Zurück-Button. Pool erschöpft → Runde endet automatisch |
| **Lern-Modus** | 10 oder offen | Gewichtete Auswahl (häufig-falsch zuerst, lange-nicht-gesehen) | nein | Vereinfachter Leitner; pro Frage `correctCount`/`wrongCount`. Pool erschöpft → Runde endet |

Architektur: Game-Mode ist ein Interface mit Methoden wie `selectNextQuestion(filteredPool, state)`, `isFinished(state)`, `onAnswer(state, result)`. Der Themen-Filter ist eine separate Schicht, die den Pool VOR Übergabe an den Modus reduziert. Neue Modi (z.B. mit Timer) lassen sich ohne UI-Umbau ergänzen, neue Themen-Tags ohne Modus-Änderung.

### 3.2 Themen-Filter

Auswahl auf dem Home-Screen über einen permanenten "Themen"-Selektor (Chip mit aktueller Auswahl, antippen öffnet Picker). Filter persistiert in `settings.themeFilter` und gilt für die jeweils nächste gestartete Runde, bis er geändert wird.

**Verfügbare Filter-Werte:**
- `alle` — keine Einschränkung (Default)
- Einzeln auswählbare Tags aus dem Themen-Vokabular (siehe 4.1): `olymp`, `helden`, `monster`, `mythen`
- Pantheon-Filter: `griechisch`, `roemisch` (lassen sich mit obigen kombinieren) — ASCII-Transliteration für Storage-Keys

V1-Umfang im UI: einfacher Single-Select aus einer flachen Liste ("Alle", "Olymp", "Helden", "Monster", "Mythen", "Griechisch", "Römisch"). Mehrfach-Filter (z.B. "Olymp + Römisch") wäre möglich, ist aber V2 — V1 hält das UI bewusst einfach.

**Edge Case:** Bei sehr engem Filter und kleinem Fragen-Pool kann es passieren, dass weniger als 10 Fragen verfügbar sind. Verhalten: 10-Fragen-Modus spielt dann nur so viele, wie vorhanden; UI zeigt vor Start an, wieviele Fragen im aktuellen Filter sind, und warnt falls < 5.

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
  pantheon: 'griechisch' | 'roemisch' | 'beide';   // ASCII transliteration (für storage-keys + JSON-Safety)
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
    mode: 'ten' | 'endless' | 'learn';
    themeFilter: string;     // 'alle' | 'olymp' | 'helden' | ...
    score: number;           // richtige
    total: number;           // gespielte
    bestStreakInRound: number;
  }>;                        // begrenzt auf letzte 50
  totals: {
    gamesPlayed: number;
    correctTotal: number;
    wrongTotal: number;
    bestStreakAllTime: number;
  };
  settings: {
    themeFilter: string;     // 'alle' | 'olymp' | 'helden' | ... — persistent
    // platzhalter für weitere settings (sound etc.)
  };
}
```

Schreibe-Strategie: nach jeder beantworteten Frage atomar speichern (kompletter State, kein Diff). Lesen beim App-Start einmal in Svelte-Store laden, danach in-memory mutieren und nach jedem Mutation-Punkt zurückschreiben. Bei `schemaVersion`-Mismatch im V1: Defaults laden (V1 hat noch keine Migrationen).

### 4.3 Frage-Daten als statische Asset

Fragen liegen in `src/data/questions.ts` (oder `.json`) und werden mit dem Bundle ausgeliefert. Kein Lazy-Load. So sind sie automatisch Teil des Service-Worker-Precache und offline verfügbar.

## 5. UI-Architektur

### 5.1 Screens

1. **Home** — Header (App-Titel), Stats-Karte oben (gespielt / % richtig / Streak), **Themen-Chip** ("Themen: Alle ▼", antippen öffnet Theme-Picker), Modus-Liste (3 Karten: 10 Fragen / Endless / Lernen, jede mit Icon + Titel + Subline). Footer mit Link zu "Statistik".
2. **Theme-Picker** (Bottom-Sheet oder Vollbild) — Liste aller Filter-Werte, Single-Select, "Übernehmen" schliesst und kehrt zur Home zurück. Zeigt pro Filter die verfügbare Fragen-Anzahl an.
3. **Quiz** — Header (Zurück / Fragezähler / Streak), Fortschrittsbalken, Frage-Karte, 4 Antwort-Optionen. Nach Tap: Antwort-Karten färben sich (grün/rot), Erklärungsbox darunter wird sichtbar, "Weiter"-Button erscheint.
4. **Ergebnis** — Score gross, Vergleich mit eigenem Schnitt, Mini-Stats (richtig/falsch/Best-Streak), Liste falscher Fragen mit korrekter Antwort, primärer Button (Nochmal / Falsche im Lern-Modus üben), Sekundär-Button "Zur Übersicht".
5. **Statistik** — Verlauf der letzten Runden (Liste, zeigt auch Themen-Filter pro Runde), Gesamtstatistik, Button "Daten löschen" mit Bestätigungs-Prompt.

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
- Manifest-`start_url` und Service-Worker-`scope` müssen den GitHub-Pages-Sub-Pfad respektieren (siehe Tech-Stack, Vite-`base`)
- Erster Aufruf braucht Netz, danach komplett offline (App, Fragen, vorhandene Ergebnisse)
- Update-Strategie: bei neuer Version automatisch reloaden, sobald keine aktive Quiz-Runde läuft (kein abrupter Reload mitten in einer Frage)
- "Zum Home-Bildschirm hinzufügen"-Prompt nutzen falls Browser unterstützt; sonst dokumentieren wir den manuellen Weg im "Über"-Bereich

## 7. Code-Struktur (Vorschlag)

```
src/
  views/             # State-basierter View-Switch, kein Router
    Home.svelte
    ThemePicker.svelte
    Quiz.svelte
    Result.svelte
    Stats.svelte
  components/
    QuestionCard.svelte
    AnswerOption.svelte
    ExplanationBox.svelte
    ProgressBar.svelte
    StatsCard.svelte
    ThemeChip.svelte
  game/
    modes/
      tenQuestions.ts
      endless.ts
      learn.ts
    themeFilter.ts    # Pool-Reduktion nach Filter, orthogonal zu Modi
    types.ts          # GameMode, GameState, AnswerResult, ThemeFilter
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
- Login, Backend, Cloud-Sync (auch keine Vorbereitung — Sync-Konzept ist QR-basiert, siehe Section 11)
- Mehrsprachigkeit (nur Hochdeutsch)
- Vollständiger Fragen-Katalog — V1 startet mit ~20–30 sorgfältig formulierten Fragen quer durch die Themen; Erweiterung in eigener Phase nach UI-Abschluss
- Alle Items aus Section 11 ("Future Enhancements")

## 9. Erfolgskriterien

V1 ist fertig, wenn:

1. Meret kann die App auf ihrem Handy zur Startseite hinzufügen und ohne Netz spielen
2. Alle drei Modi spielbar mit beliebigem Themen-Filter (auch wenn Lern-Modus und enge Themen-Filter nur Sinn machen, sobald mehr Fragen da sind)
3. Ergebnisse persistieren über App-Neustart und Browser-Neustart
4. Stats-Screen zeigt sinnvolle Daten nach mehreren Runden
5. UI funktioniert von 320 px aufwärts ohne horizontale Scrollbalken oder abgeschnittene Texte
6. Keine generischen Maskulina in UI-Texten oder Erklärungen
7. Mindestens 20 Beispiel-Fragen vorhanden, damit die App von Tag 1 testbar ist

## 10. Phase 2 (nach UI-Abschluss)

Sobald die UI steht, kommt die zweite Phase: **Fragen-Inhalte**. Ziel ca. 80–150 Fragen quer durch die Themen, in kindgerechter Sprache, mit didaktischen Erklärungen. Diese Phase bekommt einen eigenen Spec.

## 11. Future Enhancements (nicht V1, nicht V2)

Hier dokumentiert, damit V1-Architektur diese Wege offen lässt — aber keinerlei Implementierung in V1:

- **Sounds und Animationen** über CSS-Transitions hinaus
- **Schwierigkeits-Filter** im UI (Difficulty ist im Datenmodell bereits angelegt)
- **Bilder/Illustrationen** von Gottheiten (falls passende Lizenz gefunden)
- **Eigenes Domain-Mapping** für die GitHub-Pages-Seite
- **Mehrbenutzer-Modus via QR-Code-Sync** — Idee: zwei Geräte tauschen ihren Spielstand über visuellen Kanal aus, ohne Backend. Eine Sitzung zeigt einen QR-Code mit ihrem State (oder ein Diff), das andere Gerät scannt diesen mit der Selfie-Kamera, beide Geräte liegen sich gegenüber. Bidirektional via zweimaliges Anzeigen/Scannen. Implementierung später möglich mit z.B. `qrcode`-Lib zum Erzeugen und `@zxing/browser` zum Scannen. **V1-Auswirkung:** State-Modell muss serialisierbar bleiben (ist es) und sollte für Sync später ein "merge"-fähiges Format haben (z.B. `lastSeen`-Timestamps pro Frage, die wir bereits speichern). Keine sonstige Vorbereitung nötig.
- **Datenexport/-import** als manuelle Sync-Alternative (JSON-Download/-Upload)
- **Mehrsprachigkeit** (Englisch, Französisch)
