<script lang="ts">
  let {
    icon,
    title,
    subline,
    iconBg,
    onclick,
  }: { icon: string; title: string; subline: string; iconBg: string; onclick: () => void } = $props();
</script>

<button class="card mode" {onclick}>
  <div class="icon" style="background: {iconBg};">{icon}</div>
  <div class="text">
    <div class="title">{title}</div>
    <div class="sub">{subline}</div>
  </div>
  <div class="arrow">›</div>
</button>

<style>
  .mode {
    width: 100%;
    background: var(--card-bg);
    border: none;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: var(--card-shadow-strong);
    text-align: left;
    min-height: var(--touch-min);
  }
  .icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .text { flex: 1; }
  .title { font-weight: 800; font-size: 15px; }
  .sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .arrow { color: #c5b8e0; font-size: 18px; }
</style>
