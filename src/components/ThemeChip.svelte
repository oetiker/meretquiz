<script lang="ts">
  import type { ThemeFilter } from '../storage/schema';
  import { themeLabel } from '../game/themeFilter';

  let { filter, onclick }: { filter: ThemeFilter; onclick: () => void } = $props();
</script>

<button class="chip" {onclick} aria-label="Themen-Filter wechseln">
  <span class="lbl">Themen</span>
  <span class="value">{themeLabel(filter)}</span>
  <span class="arrow">▼</span>
</button>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: var(--radius-chip);
    padding: 8px 14px;
    font-weight: 700;
    color: var(--text);
    box-shadow: var(--card-shadow);
    min-height: var(--touch-min);
  }
  .lbl { font-size: 11px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 1px; }
  .value { font-size: 14px; }
  .arrow { font-size: 10px; color: var(--text-muted); }
</style>
