// tools.js
import bus from '../../core/EventBus.js';
import { Tool } from './ToolState.js';
import * as THREE from 'three';

export function setupToolListeners(controls, rollOverMesh, selectionMgr, highlightTool, toolState) {
  const toolLsnr = t => {
    highlightTool(t);
    controls.enabled     = (t === Tool.PAN);
    rollOverMesh.visible = [Tool.ADD, Tool.DELETE].includes(t);
    selectionMgr.setEnabled(t === Tool.SELECT);
  };
  bus.on('toolChanged', toolLsnr);
  toolLsnr(toolState.current);
  return toolLsnr;
}

export function setupAutosave(camera) {
  return setInterval(() => {
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const look = dir.add(camera.position);
    sessionStorage.setItem('mrc.lastCam', JSON.stringify({pos:camera.position,look}));
  }, 10000);
}
