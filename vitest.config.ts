import { defineConfig } from 'vitest/config';

/**
 * NOTE: package.json test scripts prefix `NODE_OPTIONS=--no-experimental-webstorage`
 * to disable Node v25+'s built-in localStorage shim (which is broken without
 * --localstorage-file). Any new vitest script must also carry this flag.
 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['tests/**/*.test.ts'],
  },
});
