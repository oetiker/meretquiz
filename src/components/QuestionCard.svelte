<script lang="ts">
  let { question }: { question: string } = $props();
</script>

<div class="card q">{question}</div>

<style>
  .q { font-size: clamp(15px, 4.5vw, 17px); font-weight: 800; text-align: center; line-height: 1.35; }
</style>
