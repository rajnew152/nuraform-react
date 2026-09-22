// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// /*
//  * Production builds are served from GitHub Pages at /betterpitch/. Vite already
//  * prefixes public-dir URLs in index.html and CSS with `base`, but not the
//  * '/assets/…', '/vendor/…' and '/fonts/…' string literals in the components, so
//  * this rewrites those too. Dev keeps serving from the root.
//  */
// const PAGES_BASE = '/betterpitch/';

// const prefixPublicPaths = (base) => ({
//   name: 'prefix-public-paths',
//   enforce: 'pre',
//   transform(code, id) {
//     if (base === '/' || id.includes('node_modules') || !/\.(jsx?|tsx?)$/.test(id)) return null;
//     return code.replace(/(['"`])\/(assets|vendor|fonts)\//g, `$1${base}$2/`);
//   },
// });

// export default defineConfig(({ command }) => {
//   const base = command === 'build' ? PAGES_BASE : '/';

//   return {
//     base,
//     plugins: [react(), prefixPublicPaths(base)],
//     server: { port: 5173, open: false },
//     build: { assetsInlineLimit: 0 },
//   };
// });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    assetsInlineLimit: 0,
  },
});