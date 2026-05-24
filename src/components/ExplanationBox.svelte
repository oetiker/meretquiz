<script lang="ts">
  import type { Question } from '../game/types';
  import LexikonChips from './LexikonChips.svelte';

  let {
    question,
    wasCorrect,
    wrongPickNote = null,
  }: { question: Question; wasCorrect: boolean; wrongPickNote?: string | null } = $props();
</script>

<div class="box">
  <div class="head">💡 {wasCorrect ? 'GUT GEMACHT' : 'ZUM MERKEN'}</div>
  <div class="body">{question.explanation}</div>
  {#if wrongPickNote}
    <div class="body wrong-note">Zu deiner Antwort: {wrongPickNote}</div>
  {/if}
  <LexikonChips {question} />
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
  .wrong-note { margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(184, 134, 11, 0.3); font-style: italic; color: #7c2d2d; }
</style>
