// src/modes/config/state/setupTools.js

import ToolState, { Tool } from '../ToolState.js';
import bus from '../../../core/EventBus.js';

/**
 * Subscribes to tool changes and turns on/off
 * the 3D controls, roll-over mesh, and selection logic.
 */
export function setupToolListeners(controls, rollOverMesh, selectionMgr) {
  function toolChanged(tool) {
    // First, disable everything
    rollOverMesh.visible    = false;
    selectionMgr.setEnabled(false);
    controls.enabled        = false;

    // Then enable only the one feature we want
    switch (tool) {
      case Tool.ADD:
        rollOverMesh.visible = true;
        break;

      case Tool.DELETE:
        // delete uses pointerdown only—no UI cursor
        break;

      case Tool.SELECT:
        selectionMgr.setEnabled(true);
        break;

      case Tool.PAN:
        controls.enabled = true;
        break;
    }
  }

  // Listen + fire initial state
  bus.on('toolChanged', toolChanged);
  toolChanged(ToolState.current);

  return toolChanged;
}

/** Start an autosave timer and return its ID */
export function setupAutosave(camera) {
  return setInterval(() => {
    const { x, y, z } = camera.position;
    localStorage.setItem('configCamera', JSON.stringify({ x, y, z }));
  }, 5000);
}

/** Clear the autosave timer */
export function stopAutosave(id) {
  clearInterval(id);
}
