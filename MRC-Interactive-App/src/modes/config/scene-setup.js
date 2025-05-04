// scene-setup.js
import SceneManager from '../../core/SceneManager.js';

export function setupScene(containerId = '#container') {
  const renderer = SceneManager.getRenderer?.();
  if (!SceneManager.getScene()) {
    SceneManager.init(containerId);
  } else if (renderer) {
    document.querySelector(containerId).appendChild(renderer.domElement);
  }

  return {
    scene: SceneManager.getScene(),
    objects: SceneManager.getObjects(),
    camera: SceneManager.getCamera(),
    controls: SceneManager.getControls(),
    primitives: SceneManager.getPrimitives(),
  };
}
