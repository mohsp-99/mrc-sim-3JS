// src/engine/ModuleGraph.js
import { DIR } from './Module.js';

/**
 * Connectivity graph for modules, backed by Union-Find.
 * addModule() ➜ standalone component (size 1)
 * connect(a,b) ➜ merges the two sets; sizes auto-increase
 */
export default class ModuleGraph {
  constructor() {
    this.modules = new Map();   // id -> Module    
    this.parent  = new Map();   // Union-Find parent
    this.size    = new Map();   // root id -> component size
  }

  /* ---------- Union-Find helpers ---------- */
  _find(id) {
    let p = this.parent.get(id);
    if (p !== id) {
      p = this._find(p);
      this.parent.set(id, p);
    }
    return p;
  }
  _union(aId, bId) {
    let ra = this._find(aId);
    let rb = this._find(bId);
    if (ra === rb) return;
    // union by size
    if (this.size.get(ra) < this.size.get(rb)) [ra, rb] = [rb, ra];
    this.parent.set(rb, ra);
    this.size.set(ra, this.size.get(ra) + this.size.get(rb));
  }

  /* ---------- Public API ---------- */
  /** Inserts a new module as a singleton component. */
  addModule(module) {
    if (this.modules.has(module.id)) return;
    this.modules.set(module.id, module);
    this.parent.set(module.id, module.id);
    this.size.set(module.id, 1);
  }

  /**
   * Record a bidirectional connection a<–>b.
   * @param {Module} a
   * @param {Module} b
   * @param {string} dirFromAtoB one of DIR.*
   * @param {string} type        e.g. "rigid" | "hinge"
   */
  connect(a, b, dirFromAtoB, type = 'rigid') {
    // update neighbour metadata on both modules
    a.setNeighbor(dirFromAtoB, b.id, type);

    // opposite direction for module b
    const opposite = {
      [DIR.POS_X]: DIR.NEG_X, [DIR.NEG_X]: DIR.POS_X,
      [DIR.POS_Y]: DIR.NEG_Y, [DIR.NEG_Y]: DIR.POS_Y,
      [DIR.POS_Z]: DIR.NEG_Z, [DIR.NEG_Z]: DIR.POS_Z
    }[dirFromAtoB];
    b.setNeighbor(opposite, a.id, type);

    // merge components
    this._union(a.id, b.id);
  }

  /** Component size that module id belongs to. */
  componentSize(id) {
    const root = this._find(id);
    return this.size.get(root) ?? 0;
  }

  /** Quick helper: are a & b currently connected (same component)? */
  sameComponent(idA, idB) {
    return this._find(idA) === this._find(idB);
  }

  removeModule(id) {
    this.modules.delete(id);
    this.parent.delete(id);
    this.size.delete(id);
  
    // Optional: rebuild components if needed
    // (only if you're doing component analysis like connected clusters)
  }
  
}
