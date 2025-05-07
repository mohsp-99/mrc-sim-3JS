// src/modes/free/ui/PlaybackPanel.js
let root;
export const mountPlayback = el => {
  root = el;
  root.innerHTML = '<button>⏵︎</button> <span>00:00</span>';
};
export const unmountPlayback = () => { root && (root.innerHTML = ''); };
