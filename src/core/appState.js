// src/core/appState.js
export const Modes = Object.freeze({ CONFIG: 'config', MOVE: 'move' });

let currentMode = Modes.CONFIG;
export const getMode = () => currentMode;
export const setMode = (m) => { currentMode = m };
