// setupScene.js
import SceneManager from '../../../core/SceneManager.js';

/**
 * Initializes or reattaches the Three.js scene into the given container.
 * @param {HTMLElement} containerEl
 */
export function setupScene(containerEl) {
  const renderer = SceneManager.getRenderer?.();

  if (!SceneManager.getScene()) {
    SceneManager.init(containerEl);
  } else if (renderer && containerEl) {
    containerEl.appendChild(renderer.domElement);
  }

  return {
    scene: SceneManager.getScene(),
    objects: SceneManager.getObjects(),
    camera: SceneManager.getCamera(),
    controls: SceneManager.getControls(),
    primitives: SceneManager.getPrimitives(),
  };
}
