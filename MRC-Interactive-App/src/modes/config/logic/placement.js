// placement.js
import * as THREE from 'three';
import Module from '../../../engine/Module.js';
import { posFrom } from '../../../core/geometry.js';
import { refreshGraph } from '../ui/GraphView.js';
import { appState } from '../../../core/AppState.js';

export function createPlacementHandlers(scene, objects, cubeGeo, cubeMaterial) {
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

  return { addVoxel, delVoxel };
}