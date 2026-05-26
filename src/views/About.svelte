<script lang="ts">
  import { navigate } from '../lib/store.svelte';
  import { hasInstallPrompt, isInstalled, isIos, triggerInstall } from '../lib/pwaInstall.svelte';

  const installed = $derived(isInstalled());
  const canPrompt = $derived(hasInstallPrompt());
  const ios = $derived(isIos());
</script>

<header class="app-header about-head">
  <button class="back" onclick={() => navigate('home')} aria-label="Zurück">←</button>
  <h2>Über</h2>
  <div class="spacer"></div>
</header>

<div class="app-content">
  <div class="card hero">
    <img class="hero-icon" src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="" width="80" height="80" />
    <h3>Meret's Mythologie</h3>
    <p class="tagline">Quiz zur griechisch-römischen Götter- und Göttinnenwelt.</p>
  </div>

  <div class="card">
    <div class="label-small">Autor</div>
    <p class="author">Tobias Oetiker</p>
    <p class="email"><a href="mailto:tobi@oetiker.ch">tobi@oetiker.ch</a></p>
  </div>

  <div class="card">
    <div class="label-small">Open Source</div>
    <p>Diese App ist freie Software unter der MIT-Lizenz. Quellcode, Fragen und Lexikon-Einträge sind öffentlich — Pull Requests willkommen.</p>
    <a class="btn btn-secondary link-btn" href="https://github.com/oetiker/meretquiz" target="_blank" rel="noopener noreferrer">Quellcode auf GitHub →</a>
  </div>

  <div class="card">
    <div class="label-small">Auf dem Handy installieren</div>
    {#if installed}
      <p class="ok">✓ Die App ist bereits installiert.</p>
    {:else if canPrompt}
      <p>Installiere die App auf deinem Home-Bildschirm — sie startet dann wie eine native App und läuft auch offline.</p>
      <button class="btn btn-primary install-btn" onclick={triggerInstall}>Auf Home-Bildschirm installieren</button>
    {:else if ios}
      <p>So fügst du die App zum Home-Bildschirm hinzu:</p>
      <ol class="steps">
        <li>Tippe unten in Safari auf <strong>Teilen</strong> <span class="hint">(Kästchen mit Pfeil nach oben)</span></li>
        <li>Wähle <strong>Zum Home-Bildschirm</strong></li>
        <li>Tippe oben rechts auf <strong>Hinzufügen</strong></li>
      </ol>
      <p class="hint-block">Tipp: Funktioniert nur in <strong>Safari</strong>, nicht in Chrome auf dem iPhone.</p>
    {:else}
      <p>Im Browser-Menü (⋮ oder ⋯) findest du den Eintrag <em>App installieren</em> oder <em>Zum Home-Bildschirm hinzufügen</em>.</p>
      <p class="hint-block">Tipp: Am besten klappt das in Chrome, Edge oder Samsung Internet.</p>
    {/if}
  </div>

  <p class="footer-note">© Tobias Oetiker, 2026 · MIT</p>
</div>

<style>
  .about-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .back { background: none; border: none; font-size: 24px; color: var(--text); padding: 4px 8px; }
  .spacer { width: 40px; }
  h2 { margin: 0; font-size: 18px; font-weight: 900; }

  .hero { text-align: center; padding: 20px 16px; }
  .hero-icon {
    display: block;
    width: 80px; height: 80px;
    margin: 0 auto 8px;
    border-radius: 18px;
    box-shadow: 0 3px 0 var(--primary-shadow);
  }
  h3 { margin: 6px 0 4px; font-size: 18px; font-weight: 900; }
  .tagline { margin: 0; color: var(--text-muted); font-size: 13px; }

  .author { margin: 6px 0 2px; font-weight: 800; font-size: 15px; }
  .email { margin: 0; font-size: 14px; }
  .email a { color: var(--primary-from); text-decoration: none; font-weight: 700; }
  .email a:hover { text-decoration: underline; }

  p { margin: 6px 0; font-size: 14px; line-height: 1.45; color: var(--text); }
  .label-small + p { margin-top: 8px; }

  .link-btn {
    display: inline-block;
    width: auto;
    padding: 10px 16px;
    margin-top: 10px;
    text-decoration: none;
  }
  .install-btn { margin-top: 10px; }

  .steps { margin: 8px 0 0; padding-left: 20px; font-size: 14px; line-height: 1.6; }
  .steps li { margin-bottom: 4px; }
  .hint { color: var(--text-muted); font-size: 12px; }
  .hint-block { color: var(--text-muted); font-size: 12px; margin-top: 8px; }

  .ok { color: var(--success); font-weight: 700; }

  .footer-note { text-align: center; color: var(--text-faint); font-size: 11px; margin-top: 16px; }
</style>
