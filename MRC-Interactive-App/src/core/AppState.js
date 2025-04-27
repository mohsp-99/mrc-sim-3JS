// src/core/AppState.js   ← overwrite this file
import bus from './EventBus.js';   // 👈 use the shared event bus

/* ------------------------------------------------------------------
 *  Public constants
 * ------------------------------------------------------------------*/
export const Modes = Object.freeze({
  CONFIG: 'config',
  MOVE  : 'move'
});

/* ------------------------------------------------------------------
 *  Private implementation – encapsulated finite-state machine
 * ------------------------------------------------------------------*/
class AppState {
  #mode = Modes.CONFIG;

  /* ----- query ----- */
  get mode() { return this.#mode; }

  /* ----- transition ----- */
  setMode(next) {
    if (next === this.#mode) return;  // ignore redundant changes
    this.#mode = next;
    bus.emit('mode', this.#mode);     // broadcast change
  }
}

const instance = new AppState();

/* ------------------------------------------------------------------
 *  Back-compat layer – old API stays functional
 * ------------------------------------------------------------------*/
export const getMode = () => instance.mode;
export const setMode = (m) => instance.setMode(m);

/* ------------------------------------------------------------------
 *  Exports
 * ------------------------------------------------------------------*/
export { bus };          // optional: direct access to EventBus
export default instance; // preferred singleton interface
