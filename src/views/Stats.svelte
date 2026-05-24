<script lang="ts">
  import { getAppState, setAppState, navigate } from '../lib/store.svelte';
  import { resetState } from '../storage/appState';
  import { themeLabel } from '../game/themeFilter';

  const state = $derived(getAppState());

  const MODE_LABEL: Record<string, string> = {
    ten: '10 Fragen',
    endless: 'Endless',
    learn: 'Lernen',
  };

  function formatDate(ms: number): string {
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}. ${hh}:${mi}`;
  }

  function confirmReset() {
    if (confirm('Alle Daten löschen? Dies kann nicht rückgängig gemacht werden.')) {
      setAppState(resetState());
    }
  }

  const sortedRounds = $derived([...state.rounds].reverse());
</script>

<header class="app-header">
  <button class="back" onclick={() => navigate('home')} aria-label="Zurück">←</button>
  <h2>Statistik</h2>
</header>

<div class="app-content">
  <div class="card grid">
    <div><div class="num">{state.totals.gamesPlayed}</div><div class="lbl">Runden</div></div>
    <div><div class="num green">{state.totals.correctTotal}</div><div class="lbl">Richtig</div></div>
    <div><div class="num red">{state.totals.wrongTotal}</div><div class="lbl">Falsch</div></div>
    <div><div class="num orange">🔥 {state.totals.bestStreakAllTime}</div><div class="lbl">Best-Streak</div></div>
  </div>

  <div class="label-small" style="margin: 12px 4px 8px;">Letzte Runden</div>

  {#if sortedRounds.length === 0}
    <p class="empty">Noch keine Runden gespielt.</p>
  {:else}
    <ul class="rounds">
      {#each sortedRounds as r}
        <li class="round">
          <div class="r-left">
            <div class="r-mode">{MODE_LABEL[r.mode] ?? r.mode}</div>
            <div class="r-meta">{themeLabel(r.themeFilter)} · {formatDate(r.date)}</div>
          </div>
          <div class="r-score">{r.score}/{r.total}</div>
        </li>
      {/each}
    </ul>
  {/if}

  <button class="btn btn-secondary danger" onclick={confirmReset} style="margin-top: 20px;">Alle Daten löschen</button>
</div>

<style>
  .app-header { display: flex; align-items: center; gap: 8px; }
  .back { background: none; border: none; font-size: 24px; color: var(--text); padding: 4px 8px; }
  h2 { margin: 0; font-size: 18px; font-weight: 900; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: center; padding: 14px; }
  .num { font-size: 22px; font-weight: 900; color: var(--primary-from); }
  .num.green { color: var(--success); }
  .num.red { color: var(--error); }
  .num.orange { color: var(--warn); }
  .lbl { font-size: 10px; color: var(--text-muted); }
  .empty { text-align: center; color: var(--text-muted); font-size: 13px; }
  .rounds { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
  .round { background: white; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--card-shadow); }
  .r-mode { font-weight: 800; font-size: 14px; }
  .r-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .r-score { font-weight: 900; color: var(--primary-from); }
  .danger { color: var(--error); border-color: rgba(239,68,68,0.3); }
</style>
