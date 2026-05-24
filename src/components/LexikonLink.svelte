<script lang="ts">
  import type { EntryRef } from '../lexikon/types';
  import { getAppState, pushEntry } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';

  let { target, label }: { target: EntryRef; label: string } = $props();
  const state = $derived(getAppState());
  const read = $derived(isLexikonRead(state, target));
</script>

<button class="link" onclick={() => pushEntry(target)}>
  {#if read}<span class="check" aria-label="schon gelesen">✓</span>{/if}<span class="label">{label}</span>
</button>

<style>
  .link {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent, #6b3fb8);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }
  .check { font-size: 0.85em; opacity: 0.7; margin-right: 2px; }

</style>
