// modes/free/state/setupScene.js
import SceneManager from '../../../core/SceneManager.js';
import { modeState } from './modeState.js';

/**
 * Ensures the Three.js canvas lives inside the given container and
 * resizes with it. Works whether the scene was first created here
 * or in another mode.
 */
export function setupScene(containerEl) {
  // 1.  If this is the *first* mode to use SceneManager, create it.
  if (!SceneManager.getScene()) {
    SceneManager.init(containerEl);          // will append the canvas
  } else {
    // Otherwise move the existing canvas into our container.
    const renderer = SceneManager.getRenderer();
    const dom      = renderer.domElement;

    // remove any placeholder text we left in layout.js
    containerEl.textContent = '';

    if (dom.parentElement !== containerEl) {
      dom.parentElement?.removeChild(dom);
      containerEl.appendChild(dom);
    }
    dom.style.width  = '100%';
    dom.style.height = '100%';

    // update camera & renderer sizes to match this panel
    const fit = () => {
      const w = containerEl.clientWidth;
      const h = containerEl.clientHeight || 1;    // avoid 0/0
      renderer.setSize(w, h);
      const cam = SceneManager.getCamera();
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    fit();

    // watch for panel resizes
    const obs = new ResizeObserver(fit);
    obs.observe(containerEl);
    modeState.resizeObs = obs;

    // ALSO override SceneManager’s window‑wide resize effect
    window.addEventListener('resize', fit);
    modeState.winResize = fit;
  }

  return {
    scene      : SceneManager.getScene(),
    camera     : SceneManager.getCamera(),
    controls   : SceneManager.getControls(),
    objects    : SceneManager.getObjects(),
    primitives : SceneManager.getPrimitives()
  };
}
