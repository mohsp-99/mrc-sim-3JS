// src/modes/free/index.js

import { navigate } from '../../router.js';

export function init() {
  alert('⚠️ Free Movement Mode is not yet implemented.');
  console.log('Free Movement Mode is not yet implemented.');
  navigate('home');
}

export function destroy() {
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.classList.remove('items-center', 'justify-center');
}
