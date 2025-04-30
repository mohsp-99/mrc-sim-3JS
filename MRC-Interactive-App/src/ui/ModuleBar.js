// src/ui/ModuleBar.js
/**
 * Very thin placeholder for the per-voxel edit tools.
 * Real widgets will be added in later sprint days.
 */

let root = null;

export function mount(parent = document.body) {
  root = document.createElement('div');
  root.id = 'moduleBar';
  root.style.cssText = `
    width: 100%;
    padding: 6px 10px;
    background:#f3f3f3;
    border-top:1px solid #ccc;
    font: 12px/16px sans-serif;
  `;
  root.innerText = 'Module Bar – select a voxel to edit…';
  parent.appendChild(root);
}

export function unmount() {
  root?.remove();
  root = null;
}

export function setText(txt) {
  if (root) root.innerText = txt;
}
