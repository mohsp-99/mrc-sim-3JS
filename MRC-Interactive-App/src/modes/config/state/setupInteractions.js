// setupInteractions.js
import toolState, { Tool } from '../ToolState.js';
import bus from '../../../core/EventBus.js';
import * as THREE from 'three';
import { posFrom } from '../../../core/geometry.js';

const _mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function setupInteractions(dom, objects, camera, {
  rollOverMesh,
  graph,
  selectionMgr,
  addVoxel,
  delVoxel
}) {
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const intersection = new THREE.Vector3();
  const planeNormal = new THREE.Vector3(0, 1, 0);

  let isCtrlDown = false;

  const moveLsnr = ev => {
    if (toolState.current !== Tool.ADD) return;
  
    // update normalized mouse coords
    updateMouse(ev);
    raycaster.setFromCamera(_mouse, camera);
  
    // always hit the ground-plane first
    const hit = raycaster.intersectObjects(objects, false)[0];
    if (hit) {
      // snap to grid exactly the same way as addVoxel does
      rollOverMesh.position.copy(posFrom(hit));
      rollOverMesh.visible = true;
    } else {
      rollOverMesh.visible = false;
    }
  };
  
  

const downLsnr = (ev) => {
  updateMouse(ev);
  raycaster.setFromCamera(_mouse, camera);
  const hits = raycaster.intersectObjects(objects);
  if (hits.length === 0) return;

  console.log('Selected tool:', toolState.current);  // ✅ DEBUG
  const hit = hits[0];

  switch (toolState.current) {
    case Tool.ADD: addVoxel(hit); break;
    case Tool.DELETE: delVoxel(hit); break;
    case Tool.SELECT: selectionMgr.handlePointer(hit, ev); break;
  }
};


  const keyLsnr = (ev) => {
    isCtrlDown = ev.ctrlKey || ev.metaKey;

    // Delete selection with Delete key
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (toolState.current === Tool.Select) {
        selectionMgr.deleteSelection();
      }
    }
  };

  dom.addEventListener('pointermove', moveLsnr);
  dom.addEventListener('pointerdown', downLsnr);
  document.addEventListener('keydown', keyLsnr);

  return { moveLsnr, downLsnr, keyLsnr };
}

function updateMouse(ev) {
  const rect = ev.currentTarget.getBoundingClientRect();
  _mouse.x = ((ev.clientX - rect.left)  / rect.width)  * 2 - 1;
  _mouse.y = ((ev.clientY - rect.top)   / rect.height) * -2 + 1;
}