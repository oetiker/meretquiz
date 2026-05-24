<script lang="ts">
  import { figures } from '../data/figures';
  import { stories } from '../data/stories';
  import type { FigureCategory } from '../lexikon/types';
  import { getAppState, pushEntry } from '../lib/store.svelte';
  import { isLexikonRead } from '../storage/appState';

  const appState = $derived(getAppState());

  const FIG_SECTIONS: { id: FigureCategory; label: string }[] = [
    { id: 'olymp',    label: 'Olymp' },
    { id: 'helden',   label: 'Held:innen' },
    { id: 'monster',  label: 'Monster' },
    { id: 'titanen',  label: 'Titanen' },
    { id: 'sonstige', label: 'Sonstige' },
  ];

  const figureSections = $derived(
    FIG_SECTIONS.map(s => ({
      ...s,
      items: figures
        .filter(f => f.category === s.id)
        .sort((a, b) => a.name.localeCompare(b.name, 'de-CH')),
    })).filter(s => s.items.length > 0),
  );

  const storiesSorted = $derived(
    [...stories].sort((a, b) => a.title.localeCompare(b.title, 'de-CH')),
  );

  let openSections = $state<Record<string, boolean>>({ olymp: true, mythen: false });

  function toggle(key: string) {
    openSections = { ...openSections, [key]: !openSections[key] };
  }
</script>

<div class="list">
  {#each figureSections as section}
    {@const readCount = section.items.filter(f =>
      isLexikonRead(appState, { kind: 'figure', id: f.id })
    ).length}
    <div class="section">
      <button class="head" onclick={() => toggle(section.id)} aria-expanded={openSections[section.id] ?? false}>
        <span class="caret">{openSections[section.id] ? '▼' : '▶'}</span>
        <span class="lbl">{section.label}</span>
        <span class="cnt">{readCount} / {section.items.length}</span>
      </button>
      {#if openSections[section.id]}
        <ul class="items">
          {#each section.items as fig}
            <li>
              <button class="item" onclick={() => pushEntry({ kind: 'figure', id: fig.id })}>
                {#if isLexikonRead(appState, { kind: 'figure', id: fig.id })}<span class="check">✓</span>{:else}<span class="dot">·</span>{/if}
                {fig.name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/each}

  {#if storiesSorted.length > 0}
    {@const storiesRead = storiesSorted.filter(s =>
      isLexikonRead(appState, { kind: 'story', id: s.id })
    ).length}
    <div class="section">
      <button class="head" onclick={() => toggle('mythen')} aria-expanded={openSections.mythen ?? false}>
        <span class="caret">{openSections.mythen ? '▼' : '▶'}</span>
        <span class="lbl">Mythen</span>
        <span class="cnt">{storiesRead} / {storiesSorted.length}</span>
      </button>
      {#if openSections.mythen}
        <ul class="items">
          {#each storiesSorted as st}
            <li>
              <button class="item" onclick={() => pushEntry({ kind: 'story', id: st.id })}>
                {#if isLexikonRead(appState, { kind: 'story', id: st.id })}<span class="check">✓</span>{:else}<span class="dot">·</span>{/if}
                {st.title}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  {#if figureSections.length === 0 && storiesSorted.length === 0}
    <div class="empty">Lexikon noch leer — Inhalte kommen bald.</div>
  {/if}
</div>

<style>
  .list { padding: 12px; }
  .section { margin-bottom: 8px; }
  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: white;
    border: 1px solid #e0d4ff;
    border-radius: 12px;
    font-weight: 800;
    color: var(--text);
    text-align: left;
  }
  .caret { font-size: 10px; color: var(--text-faint); width: 12px; }
  .lbl { flex: 1; }
  .cnt { font-size: 12px; font-weight: 700; color: var(--text-faint); }
  .items { list-style: none; padding: 6px 0 6px 22px; margin: 0; }
  .item {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 8px 6px;
    font: inherit;
    color: var(--text);
  }
  .check { color: var(--accent, #6b3fb8); margin-right: 6px; }
  .dot { color: var(--text-faint); margin-right: 6px; }
  .empty { padding: 24px 12px; color: var(--text-faint); text-align: center; }
</style>
