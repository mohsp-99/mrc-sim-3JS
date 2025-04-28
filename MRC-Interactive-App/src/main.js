// -------------------------------------------------------------
//  core imports   ⬅️  OLD utilities removed, SceneManager added
// -------------------------------------------------------------
import SceneManager       from './core/SceneManager.js';

// ---------- UI layer ----------
import {
  setupUI,
  enableConfigUI,
  disableConfigUI,
  enableMoveUI,
  disableMoveUI,
  syncColorPickerState,
  setSelectionManager,
} from './ui/ControlsPanel.js';

// ---------- state & engine ----------
import appState, { Modes, setMode, getMode } from './core/AppState.js';
import { loadState, saveState } from './core/Storage.js';
import { SelectionManager }        from './ui/SelectionManager.js';
import Module                      from './engine/Module.js';
import { MovementValidator }       from './engine/MovementValidator.js';

import * as THREE from 'three';

// ---------- workspace bounds ----------
const BOUNDS = {
  min: new THREE.Vector3(-500, 0, -500),
  max: new THREE.Vector3( 500, 500,  500),
};

// -------------------------------------------------------------
//  core scene setup  ⬅️  SINGLE call boots everything
// -------------------------------------------------------------
SceneManager.init('#container');              // starts renderer + loop

// pull the bits old code expects
const   scene     = SceneManager.getScene();
const   objects   = SceneManager.getObjects();
const { cubeGeo, cubeMaterial, rollOverMesh } = SceneManager.getPrimitives();

const   camera    = SceneManager.getCamera();
const   renderer  = SceneManager.getRenderer();
const   controls  = SceneManager.getControls();

// --- RESTORE last mode and camera if saved ---
const saved = loadState();
if (saved) {
  // --- restore camera pose ---
  const { pos, look } = saved.camera || {};
  if (pos && look) {
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(look.x, look.y, look.z);
  }

  // --- restore app mode ---
  if (saved.mode && Object.values(Modes).includes(saved.mode)) {
    appState.setMode(saved.mode);
  }
}

// ---------- UI & build-mode bootstrapping ----------
setupUI(scene, camera, objects, cubeGeo, cubeMaterial, rollOverMesh);
enableConfigUI();                     // default mode: CONFIG

// ---------- selection manager ----------
const selectionMgr = new SelectionManager(scene);
setSelectionManager(selectionMgr);

// ---------- containers ----------
const modules   = [];   // engine Modules
let   validator = null; // MovementValidator instance

// ---------- DOM handles ----------
const toggleBtn = document.getElementById('toggleMode');
const editBtn   = document.getElementById('editBtn');
editBtn.disabled = true;              // only active in MOVE

// ---------- mode toggle ----------
toggleBtn.addEventListener('click', () => {
  if (getMode() === Modes.CONFIG) {
    // ---- CONFIG → MOVE ----
    toggleBtn.textContent = 'Back to Config';
    setMode(Modes.MOVE);
    syncColorPickerState();

    // Build modules list from current voxels (skip plane at index 0)
    modules.length = 0;
    objects.slice(1).forEach((mesh) =>
      modules.push(new Module(mesh.position.clone(), mesh)),
    );

    validator = new MovementValidator(modules, BOUNDS);

    disableConfigUI();
    enableMoveUI(modules, validator);

    editBtn.disabled = false;
  } else {
    // ---- MOVE → CONFIG ----
    toggleBtn.textContent = 'Start Movement';
    setMode(Modes.CONFIG);
    syncColorPickerState();

    disableMoveUI();
    enableConfigUI();
    selectionMgr.clear();

    editBtn.disabled = true;
  }
});

// -------------------------------------------------------------
//  main render hook  ⬅️  SceneManager already has the loop; we
//                      just plug our per-frame callback into it
// -------------------------------------------------------------
SceneManager.setOnFrame((dt) => selectionMgr.update(dt));

// --- AUTOSAVE every 10 seconds ---
setInterval(() => {
  saveState({
    mode: appState.mode,
    camera: {
      pos: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
      look: (() => {
        const target = new THREE.Vector3(0, 0, 0);
        camera.getWorldDirection(target);
        target.add(camera.position);
        return { x: target.x, y: target.y, z: target.z };
      })()
    }
  });
}, 10_000); // every 10 seconds
