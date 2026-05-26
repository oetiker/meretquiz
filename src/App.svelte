<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import Home from './views/Home.svelte';
  import ThemePicker from './views/ThemePicker.svelte';
  import Quiz from './views/Quiz.svelte';
  import Result from './views/Result.svelte';
  import Stats from './views/Stats.svelte';
  import About from './views/About.svelte';
  import LexikonModal from './components/LexikonModal.svelte';
  import { hydrate, getView } from './lib/store.svelte';
  import { initPwaInstall } from './lib/pwaInstall.svelte';

  initPwaInstall();
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
{:else if view === 'stats'}
  <Stats />
{:else if view === 'about'}
  <About />
{/if}

<LexikonModal />
