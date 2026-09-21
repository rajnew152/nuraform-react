import { useEffect } from 'react';

const SRC = '/vendor/unicornStudio.umd.js';
let loading = null;

function loadScript() {
  if (window.UnicornStudio) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SRC;
    script.onload = resolve;
    script.onerror = reject;
    (document.head || document.body).appendChild(script);
  });

  return loading;
}

/**
 * Boots the UnicornStudio runtime that renders the animated WebGL gradient
 * behind the hero. The vendor bundle scans the DOM for `[data-us-project]` and
 * marks what it has already picked up with `data-us-initialized`, so calling
 * init() again after a remount is safe.
 */
export function useUnicornStudio() {
  useEffect(() => {
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !window.UnicornStudio) return;
        window.UnicornStudio.init?.();
        window.UnicornStudio.isInitialized = true;
      })
      .catch(() => {
        /* Offline or blocked: the hero keeps its solid #ff633e fallback. */
      });

    return () => {
      cancelled = true;
    };
  }, []);
}
