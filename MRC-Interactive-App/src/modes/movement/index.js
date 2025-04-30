import { navigate } from '../../router.js';

export function init() {
  document.getElementById('backToConfig')
          .addEventListener('click', () => navigate('config'));
}

export function destroy() {
  document.getElementById('backToConfig')
          .removeEventListener('click', () => navigate('config'));
}
