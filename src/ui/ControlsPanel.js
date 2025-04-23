/* ControlsPanel.js
   Handles ALL browser-side UI: build-mode voxel editing, move-mode selection,
   colour picking, save/clear buttons, and public helpers to toggle listeners.
*/
import * as THREE from 'three';
import {
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
} from 'three';
import { Modes, getMode } from '../core/appState.js';
import { DIRECTIONS } from '../engine/CollisionManager.js';

// ---------- module-scope state ----------
let scene, camera, objects, cubeGeo, cubeMaterial, rollOverMesh;
const pointer   = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let isShiftDown        = false;
let currentColor       = '#1e90ff';
let buildListenersOn   = false;
let moveListenersOn    = false;

let modulesRef   = null;   // injected from main.js when entering MOVE mode
let validatorRef = null;
let selectionMgr = null;   // injected from main.js

// ---------- helper: add crisp black edges ----------
function addEdges(mesh) {
  const edgeGeo = new EdgesGeometry(mesh.geometry);
  const edgeMat = new LineBasicMaterial({ color: 0x000000 });
  const wire    = new LineSegments(edgeGeo, edgeMat);
  wire.scale.setScalar(1.002);               // tiny inflate → visible edges
  mesh.add(wire);
}

// ---------- BUILD-mode pointer handlers ----------
function onPointerMove(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects, false);
  if (intersects.length) {
    const intersect = intersects[0];
    rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
    rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
  }
}

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects, false);
  if (!intersects.length) return;
  const intersect = intersects[0];

  if (isShiftDown) {
    // delete (never remove the ground-plane at objects[0])
    if (intersect.object !== objects[0]) {
      scene.remove(intersect.object);
      objects.splice(objects.indexOf(intersect.object), 1);
    }
  } else {
    // add voxel
    const voxel = new THREE.Mesh(cubeGeo, cubeMaterial.clone());
    voxel.position.copy(intersect.point).add(intersect.face.normal);
    voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

    addEdges(voxel);            // NEW: crisp outline
    scene.add(voxel);
    objects.push(voxel);
  }
}

// ---------- MOVE-mode handlers ----------
function selectHandler(event) {
  if (getMode() !== Modes.MOVE) return;

  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(objects.slice(1), false)[0];
  if (!hit) { selectionMgr.clear(); return; }

  const mod = modulesRef.find((m) => m.mesh === hit.object);
  selectionMgr.set(mod);
}

function onKeyMove(event) {
  if (getMode() !== Modes.MOVE) return;

  const dir =
    event.code === 'ArrowUp'    ? DIRECTIONS.posZ :
    event.code === 'ArrowDown'  ? DIRECTIONS.negZ :
    event.code === 'ArrowLeft'  ? DIRECTIONS.negX :
    event.code === 'ArrowRight' ? DIRECTIONS.posX : null;

  if (!dir || !selectionMgr.selected) return;

  const arrSel = [selectionMgr.selected];
  const { valid, reason } = validatorRef.validate(arrSel, dir);
  if (!valid) { console.warn('Move blocked:', reason); return; }

  arrSel.forEach((m) => m.translate(dir));
  validatorRef.collisionMgr.applyMove(arrSel, dir);
}

// ---------- public API ----------

export function setupUI(
  _scene, _camera, _objects,
  _cubeGeo, _cubeMaterial, _rollOverMesh,
) {
  scene          = _scene;
  camera         = _camera;
  objects        = _objects;
  cubeGeo        = _cubeGeo;
  cubeMaterial   = _cubeMaterial;
  rollOverMesh   = _rollOverMesh;

  // global key listeners for shift
  document.addEventListener('keydown', (e) => { if (e.shiftKey) isShiftDown = true; });
  document.addEventListener('keyup',   (e) => { if (!e.shiftKey) isShiftDown = false; });

  // colour picker
  const picker = document.getElementById('colorSelector');
  picker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    rollOverMesh.material.color.set(currentColor);
    cubeMaterial.color.set(currentColor);
  });

  // clear & save buttons
  document.getElementById('clear').addEventListener('click', () => {
    while (objects.length > 1) {
      const m = objects.pop();
      scene.remove(m);
    }
  });

  document.getElementById('save').addEventListener('click', () => {
    const data = objects.slice(1).map((m) => ({
      position: { x: m.position.x, y: m.position.y, z: m.position.z },
      color: m.material.color.getHex(),
    }));
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url, download: 'voxel-model.json',
    });
    a.click(); URL.revokeObjectURL(url);
  });

  syncColorPickerState();   // initial state
}

// called from main.js after state toggle
export function syncColorPickerState() {
  const picker = document.getElementById('colorSelector');
  picker.disabled = getMode() === Modes.MOVE;
}

// inject the global SelectionManager instance
export function setSelectionManager(sm) { selectionMgr = sm; }

// ----- build-mode toggle -----
export function enableConfigUI() {
  if (buildListenersOn) return;
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerdown', onPointerDown);
  buildListenersOn = true;
}

export function disableConfigUI() {
  if (!buildListenersOn) return;
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerdown', onPointerDown);
  buildListenersOn = false;
}

// ----- move-mode toggle -----
export function enableMoveUI(modules, validator) {
  if (moveListenersOn) return;
  modulesRef   = modules;
  validatorRef = validator;

  document.addEventListener('pointerdown', selectHandler);
  document.addEventListener('keydown', onKeyMove);
  moveListenersOn = true;
}

export function disableMoveUI() {
  if (!moveListenersOn) return;
  document.removeEventListener('pointerdown', selectHandler);
  document.removeEventListener('keydown', onKeyMove);
  moveListenersOn = false;
}
