// src/core/History.js – robust undo/redo for voxel operations

import { appState, setModules } from './AppState.js';
import { refreshGraph } from '../modes/config/ui/GraphView.js';
import { connectToNeighbors } from '../utils/connectToNeighbors.js';
import bus from './EventBus.js';

/**
 * Command‑pattern history. Each command is `{ label, undo(), redo() }`.
 */
class HistoryManager {
  constructor(limit = 100) {
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
    this._replaying = false; // guard while executing undo/redo
  }

  push(cmd) {
    if (this._replaying) return; // ignore pushes during replay
    if (!cmd || typeof cmd.undo !== 'function' || typeof cmd.redo !== 'function') {
      throw new Error('History.push expects an object with undo and redo fns');
    }

    this.undoStack.push(cmd);
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack.length = 0; // clear future branch
    bus.emit('historyChanged', this);
  }

  undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    this._replaying = true;
    cmd.undo();
    this._replaying = false;
    this.redoStack.push(cmd);
    bus.emit('historyChanged', this);
  }

  redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    this._replaying = true;
    cmd.redo();
    this._replaying = false;
    this.undoStack.push(cmd);
    bus.emit('historyChanged', this);
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
}

// Singleton instance used by the app
const History = new HistoryManager();
export default History; // 🔑 keep default for existing imports

// Named export for optional direct use
export { History as history, HistoryManager };

/* ──────────────────────────────────────────────────────────────────────
   Command builders – create history commands that preserve module IDs
   and neighbour links across undo/redo cycles.
   Usage: history.push(makeAddCommand({ module, mesh, scene, objects }))
   ------------------------------------------------------------------- */

export function makeAddCommand({ module, mesh, scene, objects }) {
  return {
    label: 'Add voxel',
    undo: () => removeModule(module, mesh, scene, objects),
    redo: () => addExistingModule(module, mesh, scene, objects)
  };
}

export function makeDeleteCommand({ module, mesh, scene, objects }) {
  return {
    label: 'Delete voxel',
    undo: () => addExistingModule(module, mesh, scene, objects),
    redo: () => removeModule(module, mesh, scene, objects)
  };
}

/* ───────────────────────── helpers ───────────────────────── */

function addExistingModule(mod, mesh, scene, objects) {
  if (appState.modules.has(mod.id)) return; // already exists

  scene.add(mesh);
  objects.push(mesh);
  mesh.__modId = mod.id;
  mesh.position.copy(mod.position);

  appState.modules.set(mod.id, mod);
  appState.graph.addModule(mod);

  connectToNeighbors(mod, appState.modules, appState.graph);

  setModules(appState.modules);
  refreshGraph(appState.graph);
}

function removeModule(mod, mesh, scene, objects) {
  // Detach neighbour links
  Object.entries(mod.neighbors).forEach(([dir, nbrId]) => {
    if (!nbrId) return;
    const neighbour = appState.modules.get(nbrId);
    if (!neighbour) return;

    const opposite = {
      posX: 'negX', negX: 'posX',
      posY: 'negY', negY: 'posY',
      posZ: 'negZ', negZ: 'posZ'
    }[dir];

    if (opposite && neighbour.neighbors[opposite] === mod.id) {
      neighbour.neighbors[opposite] = null;
      delete neighbour.connectionType[opposite];
    }
  });

  if (mesh.parent) mesh.parent.remove(mesh);
  const idx = objects.indexOf(mesh);
  if (idx !== -1) objects.splice(idx, 1);

  if (typeof appState.graph.removeModule === 'function') {
    appState.graph.removeModule(mod.id);
  } else if (appState.graph.modules) {
    appState.graph.modules.delete(mod.id);
  }

  appState.modules.delete(mod.id);

  setModules(appState.modules);
  refreshGraph(appState.graph);
}