// interaction.js
import * as THREE from 'three';
import toolState, { Tool } from './ToolState.js';

export function setupInteractions(dom, objects, camera, {
  rollOverMesh, graph, selectionMgr, addVoxel, delVoxel
}) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function updateMouse(ev) {
    const r = dom.getBoundingClientRect();
    mouse.x = ((ev.clientX - r.left)/r.width)*2 - 1;
    mouse.y = ((ev.clientY - r.top) /r.height)*-2 + 1;
    raycaster.setFromCamera(mouse, camera);
  }

  function posFrom(hit) {
    return hit.point.clone()
      .add(hit.face.normal).divideScalar(50).floor()
      .multiplyScalar(50).addScalar(25);
  }

  const moveLsnr = ev => {
    if (![Tool.ADD, Tool.DELETE].includes(toolState.current)) return;
    updateMouse(ev);
    const hit = raycaster.intersectObjects(objects, false)[0];
    if (hit) rollOverMesh.position.copy(posFrom(hit));
  };

  const downLsnr = ev => {
    if (ev.button) return;
    updateMouse(ev);
    const hit = raycaster.intersectObjects(objects, false)[0];
    if (!hit) return;
    if (Tool.ADD    === toolState.current) addVoxel(hit);
    if (Tool.DELETE === toolState.current) delVoxel(hit);
    if (Tool.SELECT === toolState.current) selectionMgr.handlePointer(hit, ev, dom);
  };

  dom.addEventListener('pointermove', moveLsnr);
  dom.addEventListener('pointerdown', downLsnr);

  const keyLsnr = (e) => {
    const map = { '1':'pan','p':'pan','2':'add','a':'add','3':'select','s':'select','4':'delete','d':'delete' };
    const key = map[e.key.toLowerCase()];
    if (key) toolState.set(Tool[key.toUpperCase()]);
    if (e.key === 'Escape') selectionMgr.clear();
    if (e.key === 'Delete' || e.key === 'Backspace') selectionMgr.deleteSelection();
  };
  document.addEventListener('keydown', keyLsnr);

  return { moveLsnr, downLsnr, keyLsnr };
}
