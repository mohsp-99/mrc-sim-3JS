// src/modes/config/index.js
import { buildLayout } from './layout.js';
import { setupScene } from './scene-setup.js';
import { setupInteractions } from './interaction.js';
import { setupToolListeners, setupAutosave } from './tools.js';

import * as THREE from 'three';
import SelectionManager from '../../ui/SelectionManager.js';
import { mount as mountToolBar, unmount as unmountToolBar, highlight as highlightTool } from '../../ui/ToolBar.js';
import { mount as mountModuleBar, unmount as unmountModuleBar } from '../../ui/ModuleBar.js';
import SceneManager from '../../core/SceneManager.js';
import { initGraph } from '../../graph/GraphView.js';
import ModuleGraph from '../../engine/ModuleGraph.js';
import toolState, { Tool } from './ToolState.js';
import bus from '../../core/EventBus.js';
import  { appState, setMode } from '../../core/AppState.js';
import { posFrom } from '../../core/geometry.js';
import Module  from '../../engine/Module.js';
import { refreshGraph } from '../../graph/GraphView.js';

let toolLsnr, keyLsnr, moveLsnr, downLsnr, autosaveId;

export function init() {
  const { canvasBox } = buildLayout();
  const { scene, objects, camera, controls, primitives } = setupScene();
  const { cubeGeo, cubeMaterial } = primitives;
  scene.userData.camera = camera;



  appState.selectionMgr = new SelectionManager(scene, appState.graph);
  SceneManager.setOnFrame(dt => appState.selectionMgr.update(dt));

  function addVoxel(hit) {
    const pos = posFrom(hit);
    if (objects.some(o => o.position.equals(pos))) return;
  
    const mesh = new THREE.Mesh(cubeGeo, cubeMaterial.clone());
    mesh.position.copy(pos);
    scene.add(mesh);
    objects.push(mesh);
  
    const mod = new Module(pos, mesh);
    mesh.__modId = mod.id;
  
    appState.graph.addModule(mod);
    refreshGraph(appState.graph);
  }
  
  function delVoxel(hit) {
    const mesh = hit.object;
    if (mesh === objects[0]) return;
  
    scene.remove(mesh);
    objects.splice(objects.indexOf(mesh), 1);
  
    appState.graph.modules.delete(mesh.__modId);
    refreshGraph(appState.graph);
  }
  

  const dom = SceneManager.getRenderer().domElement;
  const handlers = setupInteractions(dom, objects, camera, {
    rollOverMesh: primitives.rollOverMesh,
    graph: appState.graph,
    selectionMgr: appState.selectionMgr,
    addVoxel,
    delVoxel
  });

  moveLsnr = handlers.moveLsnr;
  downLsnr = handlers.downLsnr;
  keyLsnr  = handlers.keyLsnr;

  toolLsnr = setupToolListeners(controls, primitives.rollOverMesh, appState.selectionMgr, highlightTool, toolState);
  autosaveId = setupAutosave(camera);
  
  // Reuse AppState.graph and AppState.selectionMgr
  mountToolBar(canvasBox);
  mountModuleBar(document.getElementById('moduleBarHost'));
  initGraph('#cy', appState.graph);

  setMode('config');
}

export function destroy() {
  bus.off('toolChanged', toolLsnr);
  document.removeEventListener('keydown', keyLsnr);

  const dom = SceneManager.getRenderer().domElement;
  dom.removeEventListener('pointermove', moveLsnr);
  dom.removeEventListener('pointerdown', downLsnr);

  clearInterval(autosaveId);
  unmountToolBar();
  unmountModuleBar();

  const root = document.getElementById('root');
  root.innerHTML = '';
  root.classList.remove('items-center', 'justify-center');
}