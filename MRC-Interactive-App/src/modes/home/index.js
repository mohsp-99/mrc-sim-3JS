import { navigate } from '../../router.js';
import { buildHomeLayout } from './layout.js';
import { loadFreeMode, loadGoalMode } from './loader.js';

export function init() {
  buildHomeLayout(
    () => navigate('config'),
    loadFreeMode,
    loadGoalMode,
    'https://github.com/mohsp-99/mrc-sim-3JS.git'
  );
}

export function destroy() {
  const host = document.getElementById('root');
  host.innerHTML = '';
  host.classList.remove('items-center', 'justify-center');
}
