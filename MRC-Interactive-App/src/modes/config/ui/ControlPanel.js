// controlPanel.js
import toolState, { Tool } from '../ToolState.js';
import { appState } from '../../../core/AppState.js';
import bus from '../../../core/EventBus.js';
import History from '@/core/History.js';

let root = null;

export function mountControlPanel() {
  // Access buttons by ID
  const undoButton = document.getElementById('undoBtn');
  const redoButton = document.getElementById('redoBtn');
  const selectAllButton = document.getElementById('selectAllBtn');
  const clearButton = document.getElementById('clearBtn');

  if (!undoButton || !redoButton || !selectAllButton || !clearButton) {
    throw new Error('One or more control panel buttons are missing in layout.');
  }

  // Apply hover styling to all buttons
  const allButtons = [undoButton, redoButton, selectAllButton, clearButton];
  allButtons.forEach(btn => {
    btn.classList.add('hover:scale-105', 'transition-transform');
  });

  // Add functionality
  undoButton.onclick = () => History.undo();
  redoButton.onclick = () => History.redo();

  selectAllButton.onclick = () => {
    const allMeshes = [...appState.modules.values()].map(m => m.mesh).filter(Boolean);
    const selection = new Set(allMeshes);
    bus.emit('selectionChanged', selection);
    bus.emit('highlightChanged', selection); // ensure they are highlighted
  };

  clearButton.onclick = () => {
    bus.emit('selectionChanged', new Set());
    bus.emit('highlightChanged', new Set());
  };

 // keep buttons in sync
  const syncButtons = (h=History) => {
    undoButton.disabled = !h.canUndo();
    redoButton.disabled = !h.canRedo();
    undoButton.classList.toggle('opacity-50', !h.canUndo());
    redoButton.classList.toggle('opacity-50', !h.canRedo());
  };
  syncButtons();
  bus.on('historyChanged', syncButtons);
  // Disable (not hide) select/clear outside SELECT mode
  bus.on('toolChanged', (tool) => {
    const isSelect = tool === Tool.SELECT;
    selectAllButton.disabled = !isSelect;
    clearButton.disabled = !isSelect;
    selectAllButton.classList.toggle('opacity-50', !isSelect);
    clearButton.classList.toggle('opacity-50', !isSelect);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'z') undoButton.click();
    if (e.altKey && e.key === 'y') redoButton.click();
    if (e.altKey && e.key === 'a') selectAllButton.click();
    if (e.altKey && e.key === 'c') clearButton.click();
  });
}

export function unmountControlPanel() {
  root?.remove();
  root = null;
}