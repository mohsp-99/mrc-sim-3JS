// src/modes/free/ui/StaticAnalysis.js
let root;
export const mountStaticAnalysis = el => {
  root = el;
  root.textContent = '🔬 Static analysis (stub)';
};
export const unmountStaticAnalysis = () => { root && (root.innerHTML = ''); };
