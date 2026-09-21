const SRC = '/vendor/unicornStudio-2.2.14.umd.js';
let loading = null;

/**
 * Loads the v2 UnicornStudio runtime into a private scope instead of
 * `window.UnicornStudio`.
 *
 * The hero background scene only renders correctly on the v1 runtime that
 * `useUnicornStudio` puts on the window, while the voice scene needs v2 for
 * `scene.setVariables()`. Both bundles are UMD and claim the same global, so
 * v2 is evaluated with its own `exports` object: the UMD wrapper takes the
 * CommonJS branch and never touches the window. Resolves to the v2 API
 * (`addScene`, `destroy`, ...). The request and evaluation happen once per page.
 */
export function loadUnicornStudioV2() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('UnicornStudio needs a browser'));
  }
  if (loading) return loading;

  loading = fetch(SRC)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${SRC}: ${response.status}`);
      return response.text();
    })
    .then((source) => {
      const module = { exports: {} };
      new Function('exports', 'module', source)(module.exports, module);
      if (typeof module.exports.addScene !== 'function') {
        throw new Error('UnicornStudio v2 did not expose addScene()');
      }
      return module.exports;
    })
    .catch((error) => {
      loading = null;
      throw error;
    });

  return loading;
}
