<script lang="ts">
  type State = 'idle' | 'correct' | 'wrong' | 'dim';
  let {
    letter,
    text,
    state = 'idle',
    onclick,
  }: { letter: string; text: string; state?: State; onclick: () => void } = $props();
</script>

<button class="opt {state}" {onclick} disabled={state !== 'idle'}>
  <span class="letter">{letter}</span>
  <span class="text">{text}{state === 'correct' ? ' ✓' : state === 'wrong' ? ' ✗' : ''}</span>
</button>

<style>
  .opt {
    width: 100%;
    background: white;
    border: none;
    border-radius: var(--radius-option);
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: var(--card-shadow-strong);
    text-align: left;
    min-height: var(--touch-min);
    color: var(--text);
  }
  .opt:not(:last-child) { margin-bottom: 8px; }
  .letter {
    width: 26px; height: 26px; border-radius: 8px; background: #f0eaff; color: var(--primary-from);
    display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; flex-shrink: 0;
  }
  .text { flex: 1; }
  .opt.correct { background: var(--success-bg); box-shadow: 0 2px 0 var(--success); }
  .opt.correct .letter { background: var(--success); color: white; }
  .opt.wrong { background: var(--error-bg); box-shadow: 0 2px 0 var(--error); }
  .opt.wrong .letter { background: var(--error); color: white; }
  .opt.dim { opacity: 0.5; }
</style>
