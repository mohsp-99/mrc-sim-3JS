import bus from '../../core/EventBus.js';   // already exists

export const Tool = Object.freeze({
  PAN   : 'tool.pan',
  ADD   : 'tool.add',
  SELECT: 'tool.select',
  DELETE: 'tool.delete'
});

class ToolState {
  #current = Tool.PAN;

  get current() { return this.#current; }

  set(tool) {
    if (tool === this.#current) return;
    this.#current = tool;
    bus.emit('toolChanged', tool);          // everybody listens
  }
}

export default new ToolState();
