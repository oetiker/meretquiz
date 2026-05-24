<script lang="ts">
  import { getAppState, getViewContext, navigate, openLexikon } from '../lib/store.svelte';
  import { questions } from '../data/questions';

  const state = $derived(getAppState());
  const ctx = $derived(getViewContext());
  const round = $derived(state.rounds[ctx.resultRoundIndex ?? state.rounds.length - 1]);

  const wrongQuestions = $derived.by(() => {
    if (!round) return [];
    const byId = new Map(questions.map(q => [q.id, q]));
    return round.answeredIds
      .map((id, idx) => ({ id, wrong: round.results[idx] === 'wrong' }))
      .filter(x => x.wrong)
      .map(x => byId.get(x.id))
      .filter((q): q is NonNullable<typeof q> => q !== undefined);
  });

  const avgPct = $derived.by(() => {
    const total = state.totals.correctTotal + state.totals.wrongTotal;
    return total === 0 ? 0 : Math.round((state.totals.correctTotal / total) * 100);
  });

  const thisPct = $derived(round && round.total > 0 ? Math.round((round.score / round.total) * 100) : 0);

  const isGood = $derived(round && round.total > 0 && round.score / round.total >= 0.7);
</script>

{#if round}
  <header class="app-header result-head">
    <h2>Runde fertig</h2>
    <button class="icon-btn" onclick={openLexikon} aria-label="Lexikon">📖</button>
  </header>

  <div class="app-content">
    <div class="card big" style="text-align:center;">
      <div class="lbl-small">RUNDE FERTIG</div>
      <div class="emoji">{isGood ? '⚡🏛️' : '📚'}</div>
      <div class="big-score">{round.score}/{round.total}</div>
      <div class="msg">{isGood ? 'Super gemacht!' : 'Knifflig — weitermachen!'}</div>
      <div class="comp">Schnitt: {avgPct}% &nbsp;·&nbsp; jetzt: <b>{thisPct}%</b></div>
    </div>

    <div class="card mini">
      <div><div class="num green">{round.score}</div><div class="lbl">Richtig</div></div>
      <div><div class="num red">{round.total - round.score}</div><div class="lbl">Falsch</div></div>
      <div><div class="num orange">🔥 {round.bestStreakInRound}</div><div class="lbl">Best-Streak</div></div>
    </div>

    {#if wrongQuestions.length > 0}
      <div class="card">
        <div class="label-small" style="margin-bottom:8px;">Zum Nachlernen</div>
        {#each wrongQuestions as q}
          <div class="wrong">
            <div class="wq">{q.question}</div>
            <div class="wa">✓ {q.options[q.correctIndex]}</div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="btn-stack">
      <button class="btn btn-primary" onclick={() => navigate('quiz', { modeId: round.mode })}>Nochmal spielen ▶</button>
      <button class="btn btn-secondary" onclick={() => navigate('home')}>Zur Übersicht</button>
    </div>
  </div>
{:else}
  <div class="app-content"><p>Keine Runde vorhanden.</p><button class="btn btn-secondary" onclick={() => navigate('home')}>Zurück</button></div>
{/if}

<style>
  h2 { margin: 0; font-size: 18px; font-weight: 900; }
  .result-head { display: flex; justify-content: space-between; align-items: center; }
  .icon-btn {
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: 999px;
    width: 36px; height: 36px;
    font-size: 16px;
    box-shadow: var(--card-shadow);
    cursor: pointer;
  }
  .big { padding: 18px; }
  .lbl-small { font-size: 12px; letter-spacing: 2px; color: var(--text-faint); font-weight: 800; }
  .emoji { font-size: 32px; margin: 8px 0; }
  .big-score {
    font-size: clamp(40px, 12vw, 56px); font-weight: 900; line-height: 1;
    background: linear-gradient(135deg, var(--primary-from), var(--primary-to));
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  .msg { font-size: 14px; font-weight: 700; color: var(--success); margin-top: 8px; }
  .comp { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .mini { display: flex; justify-content: space-around; text-align: center; padding: 14px; }
  .mini .num { font-size: 20px; font-weight: 900; }
  .mini .lbl { font-size: 10px; color: var(--text-muted); }
  .num.green { color: var(--success); }
  .num.red { color: var(--error); }
  .num.orange { color: var(--warn); }
  .wrong { background: #fef2f2; border-radius: 12px; padding: 10px 12px; margin-bottom: 6px; font-size: 13px; }
  .wq { font-weight: 700; color: #7c2d2d; }
  .wa { color: #5a3e3e; margin-top: 2px; }
</style>
