// src/modes/free/ui/TrajectoryViewer.js
let root;
export const mountTrajectoryViewer = el => {
  root = el;
  root.textContent = '🗺️ Trajectory viewer (stub)';
};
export const unmountTrajectoryViewer = () => { root && (root.innerHTML = ''); };
