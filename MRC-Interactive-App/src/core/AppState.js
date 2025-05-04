// src/core/AppState.js

import ModuleGraph from '../engine/ModuleGraph.js';
import bus from './EventBus.js';
import SelectionManager from '../ui/SelectionManager.js';

export const appState = {
  // -------- Current app mode --------
  mode        : 'home',

  // -------- Core structural data --------
  modules     : new Map(),           // id → Module
  graph       : new ModuleGraph(),   // Module connectivity

  // -------- Motion planning --------
  trajectories: new Map(),           // id → [{ t, position }]
  goal        : [],                  // Array of Module instances

  // -------- View/UI state --------
  viewState   : null,                // { position, lookAt }
  selection   : new Set()            // Set of selected module IDs
};

// -------- Setters that emit events --------

export function setMode(newMode) {
  appState.mode = newMode;
  bus.emit('modeChanged', newMode);
}

export function setModules(modMap) {
  appState.modules = modMap;
  bus.emit('modulesUpdated', modMap);
}

export function setGoal(goalArray) {
  appState.goal = goalArray;
  bus.emit('goalUpdated', goalArray);
}

export function setSelection(selSet) {
  appState.selection = selSet;
  bus.emit('selectionChanged', selSet);
}

export function pushTrajectory(id, keyframe) {
  if (!appState.trajectories.has(id)) appState.trajectories.set(id, []);
  appState.trajectories.get(id).push(keyframe);
  bus.emit('trajectoryUpdated', { id, keyframe });
}
