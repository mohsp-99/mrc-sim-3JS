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
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.className = '';
}
