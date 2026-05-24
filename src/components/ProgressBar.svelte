<script lang="ts">
  let { current, total }: { current: number; total: number | undefined } = $props();
  const pct = $derived(total ? Math.min(100, Math.round((current / total) * 100)) : 0);
</script>

<div class="track">
  {#if total}
    <div class="fill" style="width: {pct}%;"></div>
  {:else}
    <div class="fill open" style="width: 100%;"></div>
  {/if}
</div>

<style>
  .track { height: 6px; background: #e8def5; border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
  .fill { height: 100%; background: linear-gradient(90deg, var(--primary-from), var(--primary-to)); border-radius: 3px; transition: width 0.3s ease; }
  .fill.open { background: linear-gradient(90deg, var(--warn), var(--primary-from)); opacity: 0.4; }
</style>
