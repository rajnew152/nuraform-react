import { createRoot } from 'react-dom/client';
import App from './App';

/*
 * Rendered without StrictMode on purpose: ScrollSmoother installs a single
 * global scroll proxy and pinned ScrollTriggers measure layout on creation, so
 * the deliberate double-mount would create and tear down the whole scroll rig
 * on every load. The original site has exactly one instance; so does this.
 */
createRoot(document.getElementById('root')).render(<App />);
