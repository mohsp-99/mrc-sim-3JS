// src/modes/free/ui/ModulePanel.js
let root;
export const mountModulePanel = el => {
  root = el;
  root.textContent = '🛠️ Module actions (stub)';
};
export const unmountModulePanel = () => { root && (root.innerHTML = ''); };
