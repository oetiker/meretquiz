<script lang="ts">
  import { getAppState, setAppState, navigate, openLexikon } from '../lib/store.svelte';
  import { resetState } from '../storage/appState';
  import { themeFilterSummary } from '../game/themeFilter';
  import ConfirmModal from '../components/ConfirmModal.svelte';

  const appState = $derived(getAppState());

  let showResetConfirm = $state(false);

  function doReset() {
    showResetConfirm = false;
    setAppState(resetState());
  }

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

  const sortedRounds = $derived([...appState.rounds].reverse());
</script>

<header class="app-header stats-head">
  <button class="back" onclick={() => navigate('home')} aria-label="Zurück">←</button>
  <h2>Statistik</h2>
  <button class="icon-btn" onclick={openLexikon} aria-label="Lexikon">📖</button>
</header>

<div class="app-content">
  <div class="card grid">
    <div><div class="num">{appState.totals.gamesPlayed}</div><div class="lbl">Runden</div></div>
    <div><div class="num green">{appState.totals.correctTotal}</div><div class="lbl">Richtig</div></div>
    <div><div class="num red">{appState.totals.wrongTotal}</div><div class="lbl">Falsch</div></div>
    <div><div class="num orange">🔥 {appState.totals.bestStreakAllTime}</div><div class="lbl">Best-Streak</div></div>
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
            <div class="r-meta">{themeFilterSummary(r.themeFilter)} · {formatDate(r.date)}</div>
          </div>
          <div class="r-score">{r.score}/{r.total}</div>
        </li>
      {/each}
    </ul>
  {/if}

  <button class="btn btn-secondary danger" onclick={() => (showResetConfirm = true)} style="margin-top: 20px;">Alle Daten löschen</button>
</div>

<ConfirmModal
  open={showResetConfirm}
  title="Alle Daten löschen?"
  message="Alle Spielergebnisse und Lernstände gehen verloren. Dies kann nicht rückgängig gemacht werden."
  confirmLabel="Löschen"
  cancelLabel="Abbrechen"
  danger
  onConfirm={doReset}
  onCancel={() => (showResetConfirm = false)}
/>

<style>
  .app-header { display: flex; align-items: center; gap: 8px; }
  .stats-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
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
