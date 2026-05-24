import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages serves under https://<user>.github.io/meretquiz/
// In dev we want '/' so links work locally.
const base = process.env.GITHUB_PAGES === 'true' ? '/meretquiz/' : '/';

export default defineConfig({
  base,
  plugins: [svelte()],
});
