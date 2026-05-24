<script lang="ts">
  let {
    wasCorrect,
    text,
    wrongPickNote = null,
  }: { wasCorrect: boolean; text: string; wrongPickNote?: string | null } = $props();
</script>

<div class="box">
  <div class="head">💡 {wasCorrect ? 'GUT GEMACHT' : 'ZUM MERKEN'}</div>
  {#if wrongPickNote}
    <div class="body wrong-note">Deine Antwort: {wrongPickNote}</div>
  {/if}
  <div class="body">{text}</div>
</div>

<style>
  .box {
    background: var(--warn-bg);
    border-radius: var(--radius-option);
    padding: 12px 14px;
    margin-top: 10px;
    border-left: 3px solid var(--warn-edge);
    color: #5a3e00;
  }
  .head { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #b8860b; margin-bottom: 4px; }
  .body { font-size: 13px; line-height: 1.45; }
  .wrong-note { margin-bottom: 6px; font-style: italic; color: #7c2d2d; }
</style>
