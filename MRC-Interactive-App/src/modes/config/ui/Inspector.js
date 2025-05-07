// inspector.js
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { appState } from '../../../core/AppState.js';

let editor = null;
let currentModuleId = null;

/**
 * Mounts the JSONEditor to inspect and edit a module.
 */
export function initInspector() {
  const container = document.getElementById('moduleBarHost');
  if (!container) throw new Error('Inspector mount point #moduleBarHost not found');

  const options = {
    mode: 'tree',
    search: true,
    onChangeJSON: (updated) => {
      if (!currentModuleId || !updated) return;
      const mod = appState.modules.get(currentModuleId);
      if (!mod) return;

      // Update editable fields
      if (Array.isArray(updated.position)) mod.position.set(...updated.position);
      if (typeof updated.color === 'string') mod.color = updated.color;
      if (typeof updated.pinned === 'boolean') mod.pinned = updated.pinned;
      if (typeof updated.mass === 'number') mod.mass = updated.mass;
      if (typeof updated.metadata === 'object') mod.metadata = structuredClone(updated.metadata);

      // Also update mesh position if exists
      mod.mesh?.position.copy(mod.position);
    }
  };

  editor = new JSONEditor(container, options);

  // Also allow GraphView to trigger inspection
  window.inspectModuleById = (id) => {
    const mod = appState.modules.get(id);
    if (mod) inspectModule(mod);
  };
}

/**
 * Update the inspector to show a module's full state.
 * @param {Module} mod - The selected module object
 */
export function inspectModule(mod) {
  if (!editor || !mod) return;
  currentModuleId = mod.id;
  editor.set(structuredClone(serializeModule(mod)));
}

/**
 * Clears the current editor state.
 */
export function clearInspector() {
  if (editor) editor.clear();
  currentModuleId = null;
}

/**
 * Custom serializer to convert Module class to clean object
 */
function serializeModule(mod) {
  return {
    id: mod.id,
    name: mod.position.toArray(),
    type: mod.connectionType ? 'rigid' : 'none',
    position: mod.position.toArray(),
    color: mod.color,
    pinned: mod.pinned,
    mass: mod.mass,
    neighbors: mod.neighbors,
    metadata: mod.metadata,
    connectionType: mod.connectionType
  };
}
