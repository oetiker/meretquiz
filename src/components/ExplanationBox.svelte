<script lang="ts">
  let { wasCorrect, text }: { wasCorrect: boolean; text: string } = $props();
</script>

<div class="box">
  <div class="head">💡 {wasCorrect ? 'GUT GEMACHT' : 'ZUM MERKEN'}</div>
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
</style>
