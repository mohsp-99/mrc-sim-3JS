// src/router.js

import { appState, setMode } from './core/AppState.js';

// Define route loaders
const routes = {
  home   : () => import('./modes/home/index.js'),
  config : () => import('./modes/config/index.js'),
  free   : () => import('./modes/free/index.js'),   // free motion
  goal   : () => import('./modes/goal/index.js')    // goal-based motion
};

let active = null;

export async function navigate(mode = 'home') {
  // Fallback if mode is invalid
  if (!routes[mode]) mode = 'home';

  // Unmount previous mode (if any)
  if (active?.destroy) active.destroy();

  // Dynamically load and initialize the new mode
  const module = await routes[mode]();
  active = module;
  module.init?.();

  // Update URL
  history.replaceState({}, '', `#${mode === 'home' ? '' : mode}`);

  // Update app state and notify listeners
  setMode(mode);            // updates appState.mode + emits modeChanged
  console.log(`Navigated to ${mode} mode`);
}

// Listen to hash changes in URL
window.addEventListener('hashchange', () =>
  navigate(location.hash.slice(1))
);

// First load
navigate(location.hash.slice(1) || 'home');
