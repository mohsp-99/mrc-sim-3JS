import { appState } from '@/core/AppState.js';

/**
 * Build export JSON object following the config schema.
 * Traverses each module’s neighbours instead of a non‑existent
 * graph.connections map.
 */
function buildExportJSON() {
    // ---- modules ----
    const modules = [...appState.modules.values()].map(m => ({
      id: m.id,
      position: { x: m.position.x, y: m.position.y, z: m.position.z },
      //  add other fields (color, pinned …) here if desired
    }));

    // ---- connections (dedup with id ordering) ----
    const connections = [];
    for (const mod of appState.modules.values()) {
      for (const [dir, nbrId] of Object.entries(mod.neighbors)) {
        if (!nbrId) continue;
        if (mod.id > nbrId) continue;               // keep each edge once
  
        const meta = mod.connectionType[dir] ?? {};
        connections.push({
          from: mod.id,
          to: nbrId,
          dir,
          type:     meta.type     ?? 'rigid',
          mode:     meta.mode     ?? undefined,
          strength: meta.strength ?? undefined
        });
      }
    }
  
    return { modules, connections };
  }
  

/**
 * Trigger file download using a Blob and a download link.
 */
export function exportConfig() {
  try {
    const data = buildExportJSON();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `mrc_config_${date}.json`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('❌ Failed to export config:\n' + err.message);
  }
}
