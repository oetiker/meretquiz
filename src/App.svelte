<script lang="ts">
  let count = $state(0);
</script>

<main>
  <h1>Meret's Mythologie — scaffold OK</h1>
  <button onclick={() => count++}>Clicked {count}</button>
</main>

<style>
  main { padding: 2rem; font-family: system-ui, sans-serif; }
</style>
