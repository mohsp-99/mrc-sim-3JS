import { buildLayout } from './layout.js';
import { setupScene } from './state/setupScene.js';
import { setupInteractions } from './state/setupInteractions.js';
import { setupToolListeners, setupAutosave, stopAutosave } from './state/setupTools.js';
import { mount as mountToolBar, unmount as unmountToolBar } from './ui/ToolBar.js';
import { mount as mountModuleBar, unmount as unmountModuleBar } from './ui/ModuleBar.js';
import { initGraph } from './ui/GraphView.js';
import { createPlacementHandlers } from './logic/placement.js';
import SelectionManager from './logic/SelectionManager.js';

import SceneManager from '../../core/SceneManager.js';
import { setMode, appState } from '../../core/AppState.js';
import { modeState } from './state/modeState.js';
import bus from '../../core/EventBus.js';

export function init() {
  const { canvasBox } = buildLayout();
  const { scene, objects, camera, controls, primitives } = setupScene(canvasBox);
  scene.userData.camera = camera;

  const selectionMgr = new SelectionManager(scene, appState.graph);
  SceneManager.setOnFrame(dt => selectionMgr.update(dt));

  const { addVoxel, delVoxel } = createPlacementHandlers(scene, objects, primitives.cubeGeo, primitives.cubeMaterial);

  const dom = SceneManager.getRenderer().domElement;
  const handlers = setupInteractions(dom, objects, camera, {
    rollOverMesh: primitives.rollOverMesh,
    graph: appState.graph,
    selectionMgr: selectionMgr,
    addVoxel,
    delVoxel
  });

  modeState.moveLsnr = handlers.moveLsnr;
  modeState.downLsnr = handlers.downLsnr;
  modeState.keyLsnr  = handlers.keyLsnr;

  modeState.toolLsnr = setupToolListeners(controls, primitives.rollOverMesh, selectionMgr);
  modeState.autosaveId = setupAutosave(camera);

  mountToolBar(canvasBox);
  mountModuleBar(document.getElementById('moduleBarHost'));
  initGraph('#cy', appState.graph);

  setMode('config');
}

export function destroy() {
  bus.off('toolChanged', modeState.toolLsnr);
  document.removeEventListener('keydown', modeState.keyLsnr);

  const dom = SceneManager.getRenderer().domElement;
  dom.removeEventListener('pointermove', modeState.moveLsnr);
  dom.removeEventListener('pointerdown', modeState.downLsnr);

  stopAutosave(modeState.autosaveId);
  unmountToolBar();
  unmountModuleBar();

  const root = document.getElementById('root');
  root.innerHTML = '';
  root.classList.remove('items-center', 'justify-center');
}
