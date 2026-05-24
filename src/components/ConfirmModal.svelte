<script lang="ts">
  let {
    open,
    title,
    message,
    confirmLabel = 'OK',
    cancelLabel = 'Abbrechen',
    danger = false,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') onCancel();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="overlay"
    onclick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    role="presentation"
  >
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" tabindex="-1">
      <h3 id="confirm-title">{title}</h3>
      <p>{message}</p>
      <div class="btn-stack">
        <button class="btn btn-primary" class:danger onclick={onConfirm}>{confirmLabel}</button>
        <button class="btn btn-secondary" onclick={onCancel}>{cancelLabel}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(45, 27, 78, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 100;
    animation: fade 0.15s ease-out;
  }
  .modal {
    background: var(--card-bg);
    border-radius: var(--radius-card);
    padding: 20px 18px;
    max-width: 360px;
    width: 100%;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
    animation: pop 0.18s ease-out;
  }
  h3 {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 900;
    color: var(--text);
  }
  p {
    margin: 0 0 16px;
    font-size: 14px;
    line-height: 1.45;
    color: var(--text-muted);
  }
  .btn.danger {
    background: linear-gradient(135deg, var(--error), #dc2626);
    box-shadow: 0 3px 0 #991b1b;
  }
  @keyframes fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pop {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
</style>
