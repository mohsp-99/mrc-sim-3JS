/* =====================================================================
 *  Config Mode  – canvas + sidebar built dynamically
 * =================================================================== */

import SceneManager               from '../../core/SceneManager.js';
import bus                        from '../../core/EventBus.js';
import toolState, { Tool }        from './ToolState.js';

import { mount as mountToolBar,   unmount as unmountToolBar,
         highlight as highlightTool }      from '../../ui/ToolBar.js';
import { mount as mountModuleBar, unmount as unmountModuleBar }
       from '../../ui/ModuleBar.js';

import { initGraph, refreshGraph } from '../../graph/GraphView.js';

import Module                     from '../../engine/Module.js';
import ModuleGraph                from '../../engine/ModuleGraph.js';
import SelectionManager           from '../../ui/SelectionManager.js';
import appState, { Modes }        from '../../core/AppState.js';

import * as THREE from 'three';

/* ───────── Handles to clean up ─────────────────────────── */
let graph, selectionMgr, toolLsnr;
let keyLsnr, moveLsnr, downLsnr;
let autosaveId;

/* =================================================================== */
export function init() {
  /* ── clear & un-center root ───────────────────────────── */
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.classList.remove('items-center', 'justify-center');

  /* ── build layout (canvas + sidebar) ─────────────────── */
  const wrap = document.createElement('div');
  wrap.className = 'flex w-full h-full';

  const canvasBox = document.createElement('div');
  canvasBox.id = 'container';
  canvasBox.className =
    'basis-2/3 min-w-[300px] relative bg-gray-900';   // ← ~66% width
  
  const sidebar = document.createElement('aside');
  sidebar.className =
    'basis-1/3 min-w-[260px] flex flex-col border-l border-gray-300 bg-white';
  
  const divider = document.createElement('div');
  divider.className = 'w-1 bg-gray-300 cursor-col-resize';

  let isDragging = false;
  divider.addEventListener('pointerdown', () => { isDragging = true; });

  document.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const wrapRect = wrap.getBoundingClientRect();
    const newCanvasWidth = e.clientX - wrapRect.left;
    const min = 260, max = wrapRect.width - 260;            // keep both min-sizes
    const clamped = Math.min(Math.max(newCanvasWidth, min), max);
    canvasBox.style.flexBasis = `${clamped}px`;
    sidebar .style.flexBasis = `${wrapRect.width - clamped}px`;
  });

  document.addEventListener('pointerup', () => { isDragging = false; });

  sidebar.innerHTML = `
      <header class="px-3 py-2 bg-gray-100 border-b border-gray-300
                     text-sm font-semibold">Connectivity Graph</header>
      <div id="cy" class="flex-1"></div>
      <div id="moduleBar"></div>`;

    wrap.append(canvasBox, divider, sidebar);
    root.appendChild(wrap);

  /* ── initialise Three scene once ─────────────────────── */
  /* ---- initialise or re-attach Three.js ---- */
  // ── attach or bootstrap Three.js canvas ─────────────
  const renderer = SceneManager.getRenderer?.();
  if (!SceneManager.getScene()) {
    // first time: init creates renderer && appends to '#container'
    SceneManager.init('#container');
  } else if (renderer) {
    // subsequent times: move existing canvas into the new container
    container.appendChild(renderer.domElement);
  }


  const scene      = SceneManager.getScene();
  const objects    = SceneManager.getObjects();
  const camera     = SceneManager.getCamera();
  const controls   = SceneManager.getControls();
  const { cubeGeo, cubeMaterial, rollOverMesh } = SceneManager.getPrimitives();

  /* ── connectivity graph & panels ─────────────────────── */
  graph = new ModuleGraph();
  initGraph('#cy', graph);
  mountToolBar(canvasBox);
  mountModuleBar(sidebar.querySelector('#moduleBar'));

  /* ── selection manager ───────────────────────────────── */
  selectionMgr = new SelectionManager(scene, graph);
  SceneManager.setOnFrame(dt => selectionMgr.update(dt));

  /* ── keyboard shortcuts ──────────────────────────────── */
  keyLsnr = (e) => {
    const map = { '1':'pan','p':'pan','2':'add','a':'add',
                  '3':'select','s':'select','4':'delete','d':'delete'};
    const key = map[e.key.toLowerCase()];
    if (key) toolState.set(Tool[key.toUpperCase()]);
    if (e.key === 'Escape') selectionMgr.clear();
    if (e.key === 'Delete' || e.key === 'Backspace')
      selectionMgr.deleteSelection();
  };
  document.addEventListener('keydown', keyLsnr);

  /* ── pointer interaction ─────────────────────────────── */
  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
  const dom = SceneManager.getRenderer().domElement;

  const posFrom = (hit) => hit.point.clone()
      .add(hit.face.normal).divideScalar(50).floor()
      .multiplyScalar(50).addScalar(25);

  moveLsnr = ev => {
    if (![Tool.ADD, Tool.DELETE].includes(toolState.current)) return;
    updateMouse(ev);
    const hit = raycaster.intersectObjects(objects,false)[0];
    if (!hit) return;
    rollOverMesh.position.copy(posFrom(hit));
  };

  downLsnr = ev => {
    if (ev.button) return;
    updateMouse(ev);
    const hit = raycaster.intersectObjects(objects,false)[0];
    if (!hit) return;
    if (toolState.current === Tool.ADD)    addVoxel(hit);
    if (toolState.current === Tool.DELETE) delVoxel(hit);
    if (toolState.current === Tool.SELECT) selectionMgr.handlePointer(hit, ev, dom);
  };

  dom.addEventListener('pointermove', moveLsnr);
  dom.addEventListener('pointerdown', downLsnr);

  function updateMouse(ev){
    const r = dom.getBoundingClientRect();
    mouse.x = ((ev.clientX - r.left)/r.width)*2-1;
    mouse.y = ((ev.clientY - r.top) /r.height)*-2+1;
    raycaster.setFromCamera(mouse,camera);
  }

  function addVoxel(hit){
    const pos = posFrom(hit);
    if (objects.some(o=>o.position.equals(pos))) return;
    const mesh = new THREE.Mesh(cubeGeo, cubeMaterial.clone());
    mesh.position.copy(pos); scene.add(mesh); objects.push(mesh);
    const mod = new Module(pos, mesh); mesh.__modId = mod.id;
    graph.addModule(mod); refreshGraph(graph);
  }

  function delVoxel(hit){
    const mesh = hit.object; if(mesh===objects[0]) return;
    scene.remove(mesh); objects.splice(objects.indexOf(mesh),1);
    graph.modules.delete(mesh.__modId); refreshGraph(graph);
  }

  /* ── tool-change highlight & control state ────────────── */
  toolLsnr = (t) => {
    highlightTool(t);
    controls.enabled     = (t === Tool.PAN);
    rollOverMesh.visible = [Tool.ADD, Tool.DELETE].includes(t);
    selectionMgr.setEnabled(t === Tool.SELECT);
  };
  bus.on('toolChanged', toolLsnr);
  toolLsnr(toolState.current);

  /* ── persist camera every 10 s ───────────────────────── */
  autosaveId = setInterval(() => {
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const look = dir.add(camera.position);
    sessionStorage.setItem('mrc.lastCam',
      JSON.stringify({pos:camera.position,look}));
  }, 10_000);

  appState.setMode(Modes.CONFIG);
}

/* =================================================================== */
export function destroy() {
  bus.off?.('toolChanged', toolLsnr);
  document.removeEventListener('keydown', keyLsnr);

  const dom = SceneManager.getRenderer().domElement;
  dom.removeEventListener('pointermove', moveLsnr);
  dom.removeEventListener('pointerdown', downLsnr);

  clearInterval(autosaveId);
  unmountToolBar();
  unmountModuleBar();

   /* leave #root for next mode: empty & no centering */
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.classList.remove('items-center', 'justify-center');
}
