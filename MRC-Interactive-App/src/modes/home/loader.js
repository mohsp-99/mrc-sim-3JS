import { navigate } from '../../router.js';
import { showGoalFileDialog, showFileDialog } from './dialog.js';
import { validateConfig } from './schema.js';
import { appState } from '../../core/AppState.js';
import Module from '../../engine/Module.js';
import ModuleGraph from '../../engine/ModuleGraph.js';
import * as THREE from 'three';

export async function loadFreeMode() {
  try {
    const [file] = await showFileDialog('Choose a configuration file to start Free Mode');
    const text = await file.text();
    const config = tryParseJSON(text, file.name);

    validateConfig(config);
    applyToAppState(config);
    navigate('free');

  } catch (err) {
    if (!err.message?.includes('cancelled') && !err.message?.includes('closed')) {
      alert(`⚠️ Failed to load configuration: ${err.message}`);
    }
  }
}

export async function loadGoalMode() {
  try {
    const [startFile, goalFile] = await showGoalFileDialog();

    const start = tryParseJSON(await startFile.text(), startFile.name);
    const goal = tryParseJSON(await goalFile.text(), goalFile.name);

    validateConfig(start);
    validateConfig(goal);

    // Apply START config
    const modMap = new Map();
    const graph = new ModuleGraph();

    for (const mod of start.modules) {
      const pos = new THREE.Vector3(mod.position.x, mod.position.y, mod.position.z);
      const module = new Module(pos, null);
      module.id = mod.id;
      Module._nextId = Math.max(Module._nextId, module.id + 1);
      graph.addModule(module);
      modMap.set(module.id, module);
    }

    if (Array.isArray(start.connections)) {
      for (const conn of start.connections) {
        const a = modMap.get(conn.from);
        const b = modMap.get(conn.to);
        if (a && b) {
          graph.connect(a, b, conn.dir, {
            type: conn.type,
            mode: conn.mode,
            strength: conn.strength
          });
        }
      }
    }

    appState.modules = modMap;
    appState.graph = graph;

    // Apply GOAL config
    const goalModules = goal.modules.map(mod => {
      const pos = new THREE.Vector3(mod.position.x, mod.position.y, mod.position.z);
      const module = new Module(pos, null);
      module.id = mod.id;
      return module;
    });

    appState.goal = goalModules;

    navigate('goal');

  } catch (err) {
    if (!err.message?.includes('cancelled') && !err.message?.includes('closed')) {
      alert(`⚠️ Failed to load goal configs: ${err.message}`);
    }
  }
}

// ----------------- Helpers -----------------

function tryParseJSON(text, fileName) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`"${fileName}" is not valid JSON.`);
  }
}

function applyToAppState(cfg) {
  const modMap = new Map();
  const graph = new ModuleGraph();

  for (const mod of cfg.modules) {
    const pos = new THREE.Vector3(mod.position.x, mod.position.y, mod.position.z);
    const module = new Module(pos, null);
    module.id = mod.id;
    Module._nextId = Math.max(Module._nextId, module.id + 1);
    graph.addModule(module);
    modMap.set(module.id, module);
  }

  if (Array.isArray(cfg.connections)) {
    for (const conn of cfg.connections) {
      const a = modMap.get(conn.from);
      const b = modMap.get(conn.to);
      if (a && b) {
        graph.connect(a, b, conn.dir, {
          type: conn.type,
          mode: conn.mode,
          strength: conn.strength
        });
      }
    }
  }

  appState.modules = modMap;
  appState.graph = graph;
}
