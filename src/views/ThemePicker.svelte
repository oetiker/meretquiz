<script lang="ts">
  import { allThemeFilters, themeLabel, filterByTheme } from '../game/themeFilter';
  import { questions } from '../data/questions';
  import { getAppState, setAppState, navigate } from '../lib/store.svelte';
  import { setThemeFilter } from '../storage/appState';
  import type { ThemeFilter } from '../storage/schema';

  const state = $derived(getAppState());

  function choose(f: ThemeFilter) {
    setAppState(setThemeFilter(state, f));
    navigate('home');
  }

  function countFor(f: ThemeFilter): number {
    return filterByTheme(questions, f).length;
  }
</script>

<header class="app-header">
  <button class="back" onclick={() => navigate('home')} aria-label="Zurück">←</button>
  <h2>Thema wählen</h2>
</header>

<div class="app-content">
  <ul class="list">
    {#each allThemeFilters as f}
      <li>
        <button
          class="row"
          class:active={f === state.settings.themeFilter}
          onclick={() => choose(f)}
        >
          <span class="lbl">{themeLabel(f)}</span>
          <span class="count">{countFor(f)} Fragen</span>
          {#if f === state.settings.themeFilter}
            <span class="check">✓</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .app-header { display: flex; align-items: center; gap: 8px; }
  .back { background: none; border: none; font-size: 24px; color: var(--text); padding: 4px 8px; }
  h2 { margin: 0; font-size: 18px; font-weight: 900; }
  .list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  .row {
    width: 100%;
    background: var(--card-bg);
    border: none;
    border-radius: var(--radius-option);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: var(--card-shadow);
    text-align: left;
    min-height: var(--touch-min);
  }
  .row.active { box-shadow: 0 2px 0 var(--primary-from); }
  .lbl { flex: 1; font-weight: 800; font-size: 15px; }
  .count { font-size: 12px; color: var(--text-muted); }
  .check { color: var(--primary-from); font-weight: 900; }
</style>
