// src/core/renderer.js
import * as THREE from 'three';

/**
 * Creates a WebGLRenderer, attaches it to the #container div, and handles resize events.
 * Returns the renderer instance.
 */
export function setupRenderer() {
  const container = document.getElementById('container');
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Keep the renderer full‑screen on resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return renderer;
}
