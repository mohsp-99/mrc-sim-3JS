/****************************************************************
 *  Render all modules from appState into the Three‑JS scene.   *
 ****************************************************************/
import * as THREE from 'three';
import SceneManager from '../../../core/SceneManager.js';
import { appState } from '../../../core/AppState.js';

let drawn = [];            // list of meshes we added this mount

export function mountModules() {
  const scene                 = SceneManager.getScene();
  if (!scene) return;

  const { cubeGeo, cubeMaterial } = SceneManager.getPrimitives();

  // draw every module as a cube
  for (const module of appState.modules.values()) {
    // reuse if already built (e.g. came from Config mode)
    let mesh = module.mesh;
    if (!mesh) {
      mesh = new THREE.Mesh(cubeGeo.clone(), cubeMaterial.clone());
      module.mesh = mesh;
    }
    mesh.position.copy(module.position);        // ensure correct pos
    scene.add(mesh);
    drawn.push(mesh);
  }
}

export function unmountModules() {
  const scene = SceneManager.getScene();
  if (!scene) return;
  drawn.forEach(m => scene.remove(m));
  drawn = [];
}
