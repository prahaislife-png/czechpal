// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Supabase functions run on Deno and are checked with `deno check`; the icon generator runs
    // from its own scratch folder (see scripts/icons/build.mjs); the website hero is its own
    // Vite project (site/) built into docs/hero/.
    ignores: ['dist/*', 'supabase/functions/*', 'scripts/icons/*', 'site/*', 'docs/*'],
  },
]);
