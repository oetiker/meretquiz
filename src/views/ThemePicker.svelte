<script lang="ts">
  import {
    allTopicTags,
    allPantheons,
    topicLabel,
    pantheonLabel,
    filterByTheme,
  } from '../game/themeFilter';
  import { questions } from '../data/questions';
  import { getAppState, setAppState, navigate, openLexikon } from '../lib/store.svelte';
  import { setThemeFilter } from '../storage/appState';
  import type { TopicTag, PantheonFilter, ThemeFilter } from '../storage/schema';

  const appState = $derived(getAppState());

  // Draft of the filter being edited — committed back to appState on tap.
  let draft = $state<ThemeFilter>({
    topics: [...appState.settings.themeFilter.topics],
    pantheon: appState.settings.themeFilter.pantheon,
  });

  function toggleTopic(t: TopicTag) {
    draft = {
      ...draft,
      topics: draft.topics.includes(t)
        ? draft.topics.filter(x => x !== t)
        : [...draft.topics, t],
    };
    commit();
  }

  function selectPantheon(p: PantheonFilter) {
    draft = { ...draft, pantheon: p };
    commit();
  }

  function commit() {
    setAppState(setThemeFilter(appState, draft));
  }

  function reset() {
    draft = { topics: [], pantheon: 'beide' };
    commit();
  }

  const matchCount = $derived(filterByTheme(questions, draft).length);
</script>

<header class="app-header theme-head">
  <button class="back" onclick={() => navigate('home')} aria-label="Zurück">←</button>
  <h2>Themen wählen</h2>
  <button class="icon-btn" onclick={openLexikon} aria-label="Lexikon">📖</button>
</header>

<div class="app-content">
  <p class="hint">Mehrere Themen heisst "eines davon reicht". Kein Thema gewählt = alle.</p>

  <div class="label-small">Themen (Mehrfach-Auswahl)</div>
  <div class="topics">
    {#each allTopicTags as t}
      <button
        class="chip"
        class:active={draft.topics.includes(t)}
        onclick={() => toggleTopic(t)}
      >
        {#if draft.topics.includes(t)}✓ {/if}{topicLabel(t)}
      </button>
    {/each}
  </div>

  <div class="label-small" style="margin-top: 16px;">Pantheon</div>
  <div class="pantheons">
    {#each allPantheons as p}
      <button
        class="pchip"
        class:active={draft.pantheon === p}
        onclick={() => selectPantheon(p)}
      >
        {pantheonLabel(p)}
      </button>
    {/each}
  </div>

  <div class="match">
    <b>{matchCount}</b> {matchCount === 1 ? 'Frage' : 'Fragen'} in dieser Auswahl
  </div>

  <div class="btn-stack" style="margin-top: 16px;">
    <button class="btn btn-primary" onclick={() => navigate('home')}>Fertig</button>
    <button class="btn btn-secondary" onclick={reset}>Auf "Alle" zurücksetzen</button>
  </div>
</div>

<style>
  .app-header { display: flex; align-items: center; gap: 8px; }
  .theme-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .icon-btn {
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: 999px;
    width: 36px; height: 36px;
    font-size: 16px;
    box-shadow: var(--card-shadow);
    cursor: pointer;
  }
  .back { background: none; border: none; font-size: 24px; color: var(--text); padding: 4px 8px; }
  h2 { margin: 0; font-size: 18px; font-weight: 900; }
  .hint { font-size: 12px; color: var(--text-muted); margin: 8px 4px 16px; line-height: 1.4; }
  .topics, .pantheons { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .chip, .pchip {
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: var(--radius-chip);
    padding: 10px 14px;
    font-weight: 700;
    font-size: 14px;
    color: var(--text);
    box-shadow: var(--card-shadow);
    min-height: var(--touch-min);
  }
  .chip.active, .pchip.active {
    background: linear-gradient(135deg, var(--primary-from), var(--primary-to));
    color: white;
    border-color: transparent;
    box-shadow: 0 2px 0 var(--primary-shadow);
  }
  .match {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: var(--text-muted);
  }
  .match b { color: var(--primary-from); font-weight: 900; font-size: 16px; }
</style>
