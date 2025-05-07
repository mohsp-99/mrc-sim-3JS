// src/modes/free/ui/WarningLog.js
let root;
export const mountWarningLog = el => {
  root = el;
  root.textContent = '⚠️ Warnings (stub)';
};
export const unmountWarningLog = () => { root && (root.innerHTML = ''); };
