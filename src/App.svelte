<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import Home from './views/Home.svelte';
  import ThemePicker from './views/ThemePicker.svelte';
  import Quiz from './views/Quiz.svelte';
  import Result from './views/Result.svelte';
  import { hydrate, getView } from './lib/store.svelte';

  onMount(() => hydrate());
  const view = $derived(getView());
</script>

{#if view === 'home'}
  <Home />
{:else if view === 'themePicker'}
  <ThemePicker />
{:else if view === 'quiz'}
  <Quiz />
{:else if view === 'result'}
  <Result />
{:else}
  <p style="padding:1rem;">View "{view}" not built yet.</p>
{/if}
