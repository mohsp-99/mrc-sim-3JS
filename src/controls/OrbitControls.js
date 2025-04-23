// src/controls/OrbitControls.js
import { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Initializes and returns OrbitControls with basic damping.
 */
export function setupControls(camera, renderer) {
  const controls = new ThreeOrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  return controls;
}
