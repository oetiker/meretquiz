<script lang="ts">
  import type { EntryRef, Figure, Story } from '../lexikon/types';
  import { getFigure, getStory, tokenizeBody } from '../lexikon/resolver';
  import {
    getAppState,
    toggleLexikonReadCurrent,
  } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';
  import LexikonLink from './LexikonLink.svelte';

  let { ref }: { ref: EntryRef } = $props();
  const state = $derived(getAppState());
  const read = $derived(isLexikonRead(state, ref));

  const figure = $derived<Figure | undefined>(
    ref.kind === 'figure' ? getFigure(ref.id) : undefined,
  );
  const story = $derived<Story | undefined>(
    ref.kind === 'story' ? getStory(ref.id) : undefined,
  );
  const title = $derived(figure?.name ?? story?.title ?? 'Unbekannt');
  const body = $derived(figure?.body ?? story?.body ?? '');
  const segments = $derived(tokenizeBody(body));

  const icon = $derived.by(() => {
    if (!figure) return '📜';
    switch (figure.kind) {
      case 'gottheit': return '⚡';
      case 'held':
      case 'heldin': return '🛡️';
      case 'monster': return '🐲';
      case 'titan': return '🗻';
      case 'nymphe': return '🌿';
      default: return '🧑';
    }
  });

  const subtitle = $derived.by(() => {
    if (!figure) return 'Mythos';
    const cat = figure.category;
    const pan =
      figure.pantheon === 'beide' ? 'griechisch & römisch' : figure.pantheon;
    return `${cat} · ${pan}`;
  });
</script>

<article class="entry">
  <header class="entry-head">
    <div class="icon" aria-hidden="true">{icon}</div>
    <h2 class="title">{title}</h2>
    <div class="subtitle">{subtitle}</div>
  </header>

  <div class="body">
    {#each segments as seg, i (i)}
      {#if seg.kind === 'text'}{seg.value}{:else}<LexikonLink target={seg.target} label={seg.label} />{/if}
    {/each}
  </div>

  <hr class="sep" />

  <button class="read-toggle" onclick={toggleLexikonReadCurrent}>
    {read ? '✓ Gelesen — Tippen zum Zurücksetzen' : '📖 Als gelesen markieren'}
  </button>
</article>

<style>
  .entry { padding: 16px; }
  .entry-head { margin-bottom: 12px; }
  .icon { font-size: 28px; margin-bottom: 4px; }
  .title { font-size: 22px; font-weight: 900; margin: 0; }
  .subtitle { font-size: 12px; color: var(--text-faint); letter-spacing: 0.5px; text-transform: lowercase; margin-top: 2px; }
  .body { font-size: 15px; line-height: 1.55; color: var(--text); white-space: pre-wrap; }
  .sep { margin: 18px 0 12px; border: 0; border-top: 1px solid #eee; }
  .read-toggle {
    display: block;
    width: 100%;
    padding: 10px 12px;
    background: #f6f2ff;
    border: 1px solid #e0d4ff;
    border-radius: 12px;
    font-weight: 700;
    color: var(--text);
  }
</style>
