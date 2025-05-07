// placement.js
import * as THREE from 'three';
import Module from '../../../engine/Module.js';
import { posFrom } from '../../../core/geometry.js';
import { refreshGraph } from '../ui/GraphView.js';
import { appState, setModules } from '../../../core/AppState.js';
import { connectToNeighbors } from '../../../utils/connectToNeighbors.js'; // 👈 helper
import History from '../../../core/History.js';

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

    // Add to graph and app state
    appState.graph.addModule(mod);
    appState.modules.set(mod.id, mod);

    // Connect to neighbors
    connectToNeighbors(mod, appState.modules, appState.graph);
    setModules(appState.modules);
    refreshGraph(appState.graph);

    History.push({
      label: 'Add voxel',
      undo: () => delVoxel({ object: mesh }),      // use internal helper
      redo: () => {
        // Re‑insert exactly the same module
        const again = new THREE.Mesh(cubeGeo, cubeMaterial.clone());
        again.position.copy(pos);
        scene.add(again);
        objects.push(again);
        const againMod = new Module(pos, again);
        again.__modId = againMod.id;
        appState.graph.addModule(againMod);
        appState.modules.set(againMod.id, againMod);
        setModules(appState.modules);
        refreshGraph(appState.graph);
      }
    });
    
  }

  function delVoxel(hit) {
    const mesh = hit.object;
    if (mesh === objects[0]) return;
  
    const modId = mesh.__modId;
    const mod = appState.modules.get(modId);
    if (!mod) return;
  
    // Remove from scene and object list
    scene.remove(mesh);
    objects.splice(objects.indexOf(mesh), 1);
  
    // Cleanup neighbor links
    Object.entries(mod.neighbors).forEach(([dir, nbrId]) => {
      if (!nbrId) return;
      const neighbor = appState.modules.get(nbrId);
      if (!neighbor) return;
  
      const opposite = {
        posX: 'negX', negX: 'posX',
        posY: 'negY', negY: 'posY',
        posZ: 'negZ', negZ: 'posZ'
      }[dir];
  
      if (opposite && neighbor.neighbors[opposite] === modId) {
        neighbor.neighbors[opposite] = null;
        delete neighbor.connectionType[opposite];
      }
    });
  
    // Remove from graph and app state
    appState.graph.removeModule(modId);  // NEW method you implement
    appState.modules.delete(modId);
    setModules(appState.modules);
    refreshGraph(appState.graph);
    History.push({
      label: 'Delete voxel',
      // hit is still valid here
      undo: () => addVoxel(hit),
      redo: () => delVoxel(hit)
    });
    
  }
  

  return { addVoxel, delVoxel };
}
