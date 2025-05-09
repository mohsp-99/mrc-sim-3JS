import { buildLayout }                                          from '@/modes/config/layout.js';
import { setupScene }                                           from '@/modes/config/state/setupScene.js';
import { setupInteractions }                                    from '@/modes/config/state/setupInteractions.js';
import { setupToolListeners, setupAutosave, stopAutosave }      from '@/modes/config/state/setupTools.js';
import { mount as mountToolBar, unmount as unmountToolBar }     from '@/modes/config/ui/ToolBar.js';
import { mount as mountModuleBar, unmount as unmountModuleBar } from '@/modes/config/ui/ModuleBar.js';
import { initGraph }                                            from '@/modes/config/ui/GraphView.js';
import { createPlacementHandlers }                              from '@/modes/config/logic/placement.js';
import SelectionManager                                         from '@/modes/config/logic/SelectionManager.js';
import { modeState }                                            from '@/modes/config/state/modeState.js';
import { exportConfig }                                         from '@/modes/config/logic/exporter.js';
import { initInspector, inspectModule, clearInspector }         from '@/modes/config/ui/Inspector.js';
import { mountControlPanel, unmountControlPanel }               from '@/modes/config/ui/ControlPanel.js';
import { mountHomeButton, unmountHomeButton }                   from '@/modes/config/ui/HomeButton.js';

import SceneManager                                             from '@/core/SceneManager.js';
import { setMode, appState }                                    from '@/core/AppState.js';
import bus                                                      from '@/core/EventBus.js';



export function init() {
  const { canvasBox } = buildLayout();
  
  const { scene, objects, camera, controls, primitives } = setupScene(canvasBox);
  scene.userData.camera = camera;

  const selectionMgr = new SelectionManager(scene, appState.graph);
  SceneManager.setOnFrame(dt => selectionMgr.update(dt));
  bus.on('selectionChanged', (selection) => {
    selectionMgr.setSelection(selection); // ✅ updates visuals and internal state
  });
  
  const { addVoxel, delVoxel } = createPlacementHandlers(scene, objects, primitives.cubeGeo, primitives.cubeMaterial);

  const dom = SceneManager.getRenderer().domElement;
  const handlers = setupInteractions(dom, objects, camera, {
    rollOverMesh: primitives.rollOverMesh,
    graph: appState.graph,
    selectionMgr: selectionMgr,
    addVoxel,
    delVoxel
  });
  document.getElementById('exportBtn')?.addEventListener('click', exportConfig);

  modeState.moveLsnr = handlers.moveLsnr;
  modeState.downLsnr = handlers.downLsnr;
  modeState.keyLsnr  = handlers.keyLsnr;

  modeState.toolLsnr = setupToolListeners(controls, primitives.rollOverMesh, selectionMgr);
  modeState.autosaveId = setupAutosave(camera);

  mountHomeButton();
  mountToolBar(canvasBox);
  mountModuleBar(document.getElementById('moduleBarHost'));
  mountControlPanel(); // ensure layout is already built
  initGraph('#cy', appState.graph);

  initInspector();

  bus.on('selectionChanged', (selection) => {
    if (!selection || selection.size === 0) {
      clearInspector();
      return;
    }

    const mesh = Array.from(selection)[0];
    const mod = appState.modules.get(mesh.__modId);
    if (mod) inspectModule(mod);
  });
  setMode('config');
}

export function destroy() {
  bus.off('toolChanged', modeState.toolLsnr);
  bus.off('selectionChanged'); 
  document.removeEventListener('keydown', modeState.keyLsnr);

  const dom = SceneManager.getRenderer().domElement;
  dom.removeEventListener('pointermove', modeState.moveLsnr);
  dom.removeEventListener('pointerdown', modeState.downLsnr);

  SceneManager.dispose?.();

  stopAutosave(modeState.autosaveId);
  unmountToolBar();
  unmountModuleBar();
  unmountControlPanel();
  unmountHomeButton();

  Object.keys(modeState).forEach(k => modeState[k] = null);

  appState.modules.clear();
  appState.graph.modules.clear();


  const root = document.getElementById('root');
  root.innerHTML = '';
  root.className = '';
}
