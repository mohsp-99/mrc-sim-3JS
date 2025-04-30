// src/router.js
const routes = {
  home   : () => import('./modes/home/index.js'),
  config : () => import('./modes/config/index.js'),
  move   : () => import('./modes/movement/index.js')  // stub/unused for now
};

let active = null;

export async function navigate(mode = 'home') {
  mode = routes[mode] ? mode : 'home';

  if (active?.destroy) active.destroy();
  active = await routes[mode]();
  active.init();

  history.replaceState({}, '', `#${mode === 'home' ? '' : mode}`);
}

window.addEventListener('hashchange', () =>
  navigate(location.hash.slice(1))
);

// first load
navigate(location.hash.slice(1) || 'home');
