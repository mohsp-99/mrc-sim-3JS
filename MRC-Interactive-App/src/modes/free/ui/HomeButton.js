import { navigate } from '@/router.js';

let root = null;

export function mountHomeButton(parent = document.body) {
  root = document.createElement('button');
  root.textContent = '🏠 Home';
  root.className = `
    fixed top-2 left-2 z-50
    px-3 py-1 bg-gray-800 text-white rounded
    hover:bg-gray-700 transition
  `;
  root.onclick = () => navigate('home');
  parent.appendChild(root);
}

export function unmountHomeButton() {
  root?.remove();
  root = null;
}
