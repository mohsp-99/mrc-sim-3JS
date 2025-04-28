// src/core/Storage.js

const KEY = 'mrc-visualizer-state';

/**
 * Load the last saved app state from localStorage.
 * Returns an object like { mode: 'config', camera: { pos: {x,y,z}, look: {x,y,z} } }
 * or null if no saved data.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Storage.loadState(): corrupted or missing', err);
    return null;
  }
}

/**
 * Save the current app state into localStorage.
 * @param {object} state { mode: 'config'|'move', camera: { pos: {x,y,z}, look: {x,y,z} } }
 */
export function saveState(state) {
  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(KEY, raw);
  } catch (err) {
    console.error('Storage.saveState(): failed', err);
  }
}
