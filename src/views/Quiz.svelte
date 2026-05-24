<script lang="ts">
  import QuestionCard from '../components/QuestionCard.svelte';
  import AnswerOption from '../components/AnswerOption.svelte';
  import ExplanationBox from '../components/ExplanationBox.svelte';
  import ProgressBar from '../components/ProgressBar.svelte';
  import { questions } from '../data/questions';
  import { filterByTheme } from '../game/themeFilter';
  import { tenQuestions } from '../game/modes/tenQuestions';
  import { endless } from '../game/modes/endless';
  import { makeLearnMode } from '../game/modes/learn';
  import { getAppState, setAppState, getViewContext, navigate } from '../lib/store.svelte';
  import { recordAnswer, recordRound } from '../storage/appState';
  import type { GameMode, Question, GameRunState } from '../game/types';
  import type { GameModeId } from '../storage/schema';

  const appState = $derived(getAppState());
  const ctx = $derived(getViewContext());
  const modeId: GameModeId = $derived((ctx.modeId ?? 'ten') as GameModeId);

  const pool: Question[] = $derived(filterByTheme(questions, appState.settings.themeFilter));

  const mode: GameMode = $derived.by(() => {
    if (modeId === 'ten') return tenQuestions;
    if (modeId === 'endless') return endless;
    return makeLearnMode(id => appState.perQuestion[id]);
  });

  let run = $state<GameRunState>({
    modeId,
    themeFilter: appState.settings.themeFilter,
    answeredIds: [],
    results: [],
    currentStreak: 0,
    bestStreakInRound: 0,
    startedAt: Date.now(),
  });
  let currentId = $state<string | null>(null);
  let revealed = $state(false);
  let pickedIndex = $state<number | null>(null);

  function pickNext() {
    revealed = false;
    pickedIndex = null;
    const next = mode.selectNext(pool, run);
    currentId = next;
    if (next === null) finishRound();
  }

  function finishRound() {
    const score = run.results.filter(r => r === 'correct').length;
    setAppState(recordRound(appState, {
      date: Date.now(),
      mode: modeId,
      themeFilter: appState.settings.themeFilter,
      score,
      total: run.results.length,
      bestStreakInRound: run.bestStreakInRound,
      answeredIds: run.answeredIds,
      results: run.results,
    }));
    navigate('result', { resultRoundIndex: getAppState().rounds.length - 1 });
  }

  function onPick(index: number, q: Question) {
    if (revealed) return;
    pickedIndex = index;
    revealed = true;
    const correct = index === q.correctIndex;
    const newStreak = correct ? run.currentStreak + 1 : 0;
    run = {
      ...run,
      answeredIds: [...run.answeredIds, q.id],
      results: [...run.results, correct ? 'correct' : 'wrong'],
      currentStreak: newStreak,
      bestStreakInRound: Math.max(run.bestStreakInRound, newStreak),
    };
    setAppState(recordAnswer(appState, q.id, correct));
  }

  function exitConfirm() {
    if (run.results.length === 0) { navigate('home'); return; }
    if (confirm('Runde wirklich beenden? Bisheriger Fortschritt wird verworfen.')) navigate('home');
  }

  const totalForBar = $derived(mode.totalQuestions(pool));
  const current = $derived(pool.find(q => q.id === currentId) ?? null);

  // Init on mount
  $effect(() => {
    if (currentId === null && run.results.length === 0) pickNext();
  });
</script>

{#if current}
  <header class="app-header quiz-header">
    <button class="back" onclick={exitConfirm} aria-label="Zurück">←</button>
    <div class="counter">
      {#if totalForBar !== undefined}
        Frage {run.results.length + 1} / {totalForBar}
      {:else}
        Frage {run.results.length + 1}
      {/if}
    </div>
    <div class="streak">🔥 {run.currentStreak}</div>
  </header>

  <div class="app-content">
    <ProgressBar current={run.results.length + (revealed ? 1 : 0)} total={totalForBar} />
    <QuestionCard question={current.question} />

    {#each current.options as opt, i}
      <AnswerOption
        letter={String.fromCharCode(65 + i)}
        text={opt}
        state={
          !revealed ? 'idle'
          : i === current.correctIndex ? 'correct'
          : i === pickedIndex ? 'wrong'
          : 'dim'
        }
        onclick={() => onPick(i, current)}
      />
    {/each}

    {#if revealed}
      <ExplanationBox wasCorrect={pickedIndex === current.correctIndex} text={current.explanation} />
      <button class="btn btn-primary" style="margin-top:12px;" onclick={pickNext}>Weiter →</button>
    {:else}
      <p class="hint">Tippe eine Antwort</p>
    {/if}
  </div>
{:else}
  <div class="app-content empty">
    <p>Keine Fragen im aktuellen Themen-Filter.</p>
    <button class="btn btn-secondary" onclick={() => navigate('home')}>Zurück</button>
  </div>
{/if}

<style>
  .quiz-header { display: flex; align-items: center; justify-content: space-between; }
  .back { background: none; border: none; font-size: 24px; color: var(--text); padding: 4px 8px; }
  .counter { font-size: 12px; color: var(--text-faint); font-weight: 700; }
  .streak { font-size: 13px; font-weight: 800; color: var(--warn); }
  .hint { text-align: center; font-size: 11px; color: var(--text-faint); margin-top: 12px; }
  .empty { text-align: center; padding-top: 32px; }
</style>
