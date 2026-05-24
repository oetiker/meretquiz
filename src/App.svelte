<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import Home from './views/Home.svelte';
  import { hydrate, getView } from './lib/store.svelte';

  onMount(() => hydrate());
  const view = $derived(getView());
</script>

{#if view === 'home'}
  <Home />
{:else}
  <p style="padding:1rem;">View "{view}" not built yet.</p>
{/if}
