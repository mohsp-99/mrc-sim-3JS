// src/core/camera.js
import * as THREE from 'three';

/**
 * Creates and returns a PerspectiveCamera suitable for the 1000×1000 workspace.
 */
export function setupCamera() {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000,
  );
  camera.position.set(500, 800, 1300);
  camera.lookAt(0, 0, 0);
  return camera;
}
