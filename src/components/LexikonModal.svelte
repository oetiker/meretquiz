<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    getLexikon,
    popEntry,
    closeLexikon,
  } from '../lib/store.svelte';
  import LexikonList from './LexikonList.svelte';
  import LexikonEntry from './LexikonEntry.svelte';

  const lex = $derived(getLexikon());
  const top = $derived(lex.stack[lex.stack.length - 1]);
  const canGoBack = $derived(lex.stack.length > 1);
  const title = $derived(lex.stack.length === 0 ? 'Lexikon' : 'Lexikon');

  function onKey(e: KeyboardEvent) {
    if (!lex.open) return;
    if (e.key === 'Escape') closeLexikon();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
  });
  onDestroy(() => {
    window.removeEventListener('keydown', onKey);
  });

  $effect(() => {
    if (lex.open) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  });
</script>

{#if lex.open}
  <div class="backdrop" onclick={closeLexikon} role="presentation"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label={title}>
    <header class="head">
      {#if canGoBack}
        <button class="nav" onclick={popEntry} aria-label="Zurück">←</button>
      {:else}
        <span class="nav-spacer"></span>
      {/if}
      <h1 class="title">{title}</h1>
      <button class="nav close" onclick={closeLexikon} aria-label="Schliessen">✕</button>
    </header>

    <div class="content">
      {#if top}
        <LexikonEntry ref={top} />
      {:else}
        <LexikonList />
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 9000;
  }
  .sheet {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    top: 5vh;
    background: var(--bg, #faf8f5);
    border-radius: 18px 18px 0 0;
    z-index: 9001;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -8px 24px rgba(0,0,0,0.18);
  }
  .head {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #e8e0f0;
  }
  .nav {
    background: none; border: none;
    font-size: 22px;
    width: 40px; height: 40px;
    color: var(--text);
  }
  .nav-spacer { width: 40px; }
  .title { flex: 1; text-align: center; font-size: 16px; font-weight: 900; margin: 0; }
  .content { flex: 1; overflow-y: auto; }
</style>
