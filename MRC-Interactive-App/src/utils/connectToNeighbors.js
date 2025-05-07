// src/utils/connectToNeighbors.js
import * as THREE from 'three';
import { DIR } from '../engine/Module.js';  // Adjust path if needed

const offsets = {
  [DIR.POS_X]: new THREE.Vector3(50, 0, 0),
  [DIR.NEG_X]: new THREE.Vector3(-50, 0, 0),
  [DIR.POS_Y]: new THREE.Vector3(0, 50, 0),
  [DIR.NEG_Y]: new THREE.Vector3(0, -50, 0),
  [DIR.POS_Z]: new THREE.Vector3(0, 0, 50),
  [DIR.NEG_Z]: new THREE.Vector3(0, 0, -50)
};

/**
 * Given a module, find all adjacent modules and connect them.
 * Updates both the module and its neighbors.
 * @param {Module} mod 
 * @param {Map<number, Module>} allModules - ID → Module
 * @param {ModuleGraph} graph 
 */
export function connectToNeighbors(mod, allModules, graph) {
  const pos = mod.position;
  for (const [dir, offset] of Object.entries(offsets)) {
    const neighborPos = pos.clone().add(offset);
    for (const other of allModules.values()) {
      if (other.position.equals(neighborPos)) {
        graph.connect(mod, other, dir, 'rigid');
        break;  // only one module per position
      }
    }
  }
}
