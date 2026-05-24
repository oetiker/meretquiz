<script lang="ts">
  import type { Totals } from '../storage/schema';

  let { totals }: { totals: Totals } = $props();

  const percentRight = $derived(() => {
    const total = totals.correctTotal + totals.wrongTotal;
    if (total === 0) return 0;
    return Math.round((totals.correctTotal / total) * 100);
  });
</script>

<div class="card stats">
  <div class="cell">
    <div class="num">{totals.gamesPlayed}</div>
    <div class="lbl">Gespielt</div>
  </div>
  <div class="cell">
    <div class="num green">{percentRight()}%</div>
    <div class="lbl">Richtig</div>
  </div>
  <div class="cell">
    <div class="num orange">🔥 {totals.bestStreakAllTime}</div>
    <div class="lbl">Best-Streak</div>
  </div>
</div>

<style>
  .stats { display: flex; justify-content: space-around; text-align: center; padding: 14px; }
  .num { font-size: 20px; font-weight: 900; color: var(--primary-from); }
  .num.green { color: var(--success); }
  .num.orange { color: var(--warn); }
  .lbl { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
</style>
