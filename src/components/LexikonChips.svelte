<script lang="ts">
  import type { Question } from '../game/types';
  import { getFigure, getStory } from '../lexikon/resolver';
  import { getAppState, openEntry } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';

  let { question }: { question: Question } = $props();
  const state = $derived(getAppState());

  const figureChips = $derived(
    (question.figureIds ?? [])
      .map(id => getFigure(id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
  );

  const storyChip = $derived(
    question.storyId ? getStory(question.storyId) : undefined
  );

  const show = $derived(figureChips.length > 0 || storyChip !== undefined);
</script>

{#if show}
  <div class="chips">
    <div class="lbl">Mehr erfahren:</div>
    <div class="row">
      {#each figureChips as fig (fig.id)}
        {@const read = isLexikonRead(state, { kind: 'figure', id: fig.id })}
        <button class="chip" onclick={() => openEntry({ kind: 'figure', id: fig.id })}>
          {#if read}<span class="check">✓</span>{/if}<span class="ico">🧑</span> {fig.name}
        </button>
      {/each}
      {#if storyChip}
        {@const read = isLexikonRead(state, { kind: 'story', id: storyChip.id })}
        <button class="chip story" onclick={() => openEntry({ kind: 'story', id: storyChip.id })}>
          {#if read}<span class="check">✓</span>{/if}<span class="ico">📜</span> {storyChip.title}
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .chips { margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(184, 134, 11, 0.3); }
  .lbl { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #b8860b; margin-bottom: 6px; text-transform: uppercase; }
  .row { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px; font-weight: 700;
    color: var(--text);
    box-shadow: var(--card-shadow);
    cursor: pointer;
  }
  .chip.story { border-color: #ffd28a; background: #fff8e8; }
  .check { color: var(--accent, #6b3fb8); }
  .ico { font-size: 13px; }
</style>
