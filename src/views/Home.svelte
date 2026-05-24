<script lang="ts">
  import StatsCard from '../components/StatsCard.svelte';
  import ThemeChip from '../components/ThemeChip.svelte';
  import ModeCard from '../components/ModeCard.svelte';
  import { getAppState, navigate } from '../lib/store.svelte';

  const state = $derived(getAppState());
</script>

<header class="app-header">
  <div class="title-row">
    <div class="hello">Hallo Meret ⚡</div>
    <button class="stats-link" onclick={() => navigate('stats')} aria-label="Statistik">📊</button>
  </div>
  <h1 class="title">Meret's Mythologie</h1>
</header>

<div class="app-content">
  <StatsCard totals={state.totals} />

  <div class="filter-row">
    <ThemeChip filter={state.settings.themeFilter} onclick={() => navigate('themePicker')} />
  </div>

  <div class="label-small mode-label">Spielmodus wählen</div>

  <div class="modes">
    <ModeCard icon="🎯" iconBg="#ffe9b3" title="10 Fragen" subline="Klassische Quiz-Runde"
              onclick={() => navigate('quiz', { modeId: 'ten' })} />
    <ModeCard icon="♾️" iconBg="#ffd4d4" title="Endless" subline="Solange du willst"
              onclick={() => navigate('quiz', { modeId: 'endless' })} />
    <ModeCard icon="📚" iconBg="#c5f0d4" title="Lernen" subline="Falsche kommen öfter"
              onclick={() => navigate('quiz', { modeId: 'learn' })} />
  </div>
</div>

<style>
  .title-row { display: flex; justify-content: space-between; align-items: center; }
  .hello { font-size: 11px; letter-spacing: 1.5px; color: var(--text-faint); font-weight: 800; text-transform: uppercase; }
  .stats-link { background: white; border: 1px solid #e0d4ff; border-radius: 999px; width: 36px; height: 36px; font-size: 16px; box-shadow: var(--card-shadow); }
  .title { font-size: clamp(20px, 6vw, 24px); font-weight: 900; margin: 4px 0 0; }
  .filter-row { display: flex; justify-content: center; margin: 8px 0 16px; }
  .mode-label { margin: 8px 4px; }
  .modes { display: flex; flex-direction: column; gap: 10px; }
</style>
