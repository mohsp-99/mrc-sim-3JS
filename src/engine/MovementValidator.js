// src/engine/MovementValidator.js
import * as THREE from 'three';
import { CollisionManager } from './CollisionManager.js';

const UNIT = 50;

/** Utility to make key from Vector3 */
function key(v) {
  return `${v.x},${v.y},${v.z}`;
}

/**
 * Validates a potential move of a group of modules against all six constraints:
 *   a) selection connectivity
 *   b) system connectivity before & after move
 *   c) workspace boundary check
 *   d) collision / swap handling
 *   e) persistent‑face constraint       (placeholder: always passes)
 *   f) rail‑wagon constraint            (placeholder: always passes)
 */
export class MovementValidator {
  /**
   * @param {Module[]} modules  – ALL modules in the scene
   * @param {{min:THREE.Vector3,max:THREE.Vector3}} bounds – workspace cuboid
   */
  constructor(modules, bounds) {
    this.modules = modules;
    this.bounds = bounds;
    this.collisionMgr = new CollisionManager(modules);
    // Pre‑compute neighbor adjacency map for connectivity checks
    this._adjacency = this._buildAdjacencyGraph(modules);
  }

  // ------------- Public -------------
  /**
   * @param {Module[]} selection – selected modules to move
   * @param {THREE.Vector3} dir  – grid delta (one of ±UNIT on single axis)
   * @returns {{valid:boolean, reason?:string}}
   */
  validate(selection, dir) {
    // a. selection connectivity
    if (!this._isSubgraphConnected(selection)) {
      return { valid: false, reason: 'Selected modules are not connected (constraint a)' };
    }

    // c. boundary check (simple)
    if (!this._withinBounds(selection, dir)) {
      return { valid: false, reason: 'Move exceeds workspace bounds (constraint c)' };
    }

    // d. collision check
    if (this.collisionMgr.willCollide(selection, dir)) {
      return { valid: false, reason: 'Collision with other modules (constraint d)' };
    }

    // b. system connectivity after move (simulate)
    if (!this._systemConnectedPostMove(selection, dir)) {
      return { valid: false, reason: 'System would split (constraint b)' };
    }

    // e. persistent face (placeholder – not enforced yet)
    // f. rail‑wagon (placeholder – not enforced yet)

    return { valid: true };
  }

  // ------------- Connectivity helpers -------------
  /** Build adjacency map keyed by module id → Set<neighbor id> */
  _buildAdjacencyGraph(modules) {
    const map = new Map();
    const deltas = [
      new THREE.Vector3(UNIT, 0, 0),
      new THREE.Vector3(-UNIT, 0, 0),
      new THREE.Vector3(0, UNIT, 0),
      new THREE.Vector3(0, -UNIT, 0),
      new THREE.Vector3(0, 0, UNIT),
      new THREE.Vector3(0, 0, -UNIT),
    ];
    for (const m of modules) {
      const set = new Set();
      for (const d of deltas) {
        const k = key(m.position.clone().add(d));
        const neighborId = modules.find((x) => x.key === k)?.id;
        if (neighborId !== undefined) set.add(neighborId);
      }
      map.set(m.id, set);
    }
    return map;
  }

  /** BFS to check connectivity within the selection */
  _isSubgraphConnected(selection) {
    if (selection.length === 0) return true;
    const ids = new Set(selection.map((m) => m.id));
    const stack = [selection[0].id];
    const visited = new Set();
    while (stack.length) {
      const id = stack.pop();
      visited.add(id);
      for (const n of this._adjacency.get(id) || []) {
        if (ids.has(n) && !visited.has(n)) stack.push(n);
      }
    }
    return visited.size === ids.size;
  }

  /** Check the workspace boundary for each selected module */
  _withinBounds(selection, dir) {
    for (const m of selection) {
      const target = m.position.clone().add(dir);
      if (
        target.x < this.bounds.min.x ||
        target.x > this.bounds.max.x ||
        target.y < this.bounds.min.y ||
        target.y > this.bounds.max.y ||
        target.z < this.bounds.min.z ||
        target.z > this.bounds.max.z
      ) {
        return false;
      }
    }
    return true;
  }

  /** Simulate move and check if the overall graph remains connected */
  _systemConnectedPostMove(selection, dir) {
    // Build new set of keys after move for selected modules
    const movedKeys = new Set(selection.map((m) => key(m.position.clone().add(dir))));

    // Use DFS across all modules to ensure connectivity
    const allIds = new Set(this.modules.map((m) => m.id));
    const idToKey = new Map(this.modules.map((m) => [m.id, m.key]));

    // Pick a start node: any module (moved or not)
    const startId = this.modules[0].id;
    const stack = [startId];
    const visited = new Set();

    // Local helper to test neighbor existence after move
    const hasModuleAt = (k) => {
      // If a moved module would occupy k
      if (movedKeys.has(k)) return true;
      // Else look up original occupancy
      return Array.from(idToKey.values()).includes(k);
    };

    const deltas = [
      new THREE.Vector3(UNIT, 0, 0),
      new THREE.Vector3(-UNIT, 0, 0),
      new THREE.Vector3(0, UNIT, 0),
      new THREE.Vector3(0, -UNIT, 0),
      new THREE.Vector3(0, 0, UNIT),
      new THREE.Vector3(0, 0, -UNIT),
    ];

    while (stack.length) {
      const id = stack.pop();
      visited.add(id);
      const baseKey = idToKey.get(id);
      // If this module is moving, substitute future key
      const inSel = selection.some((m) => m.id === id);
      const origin = inSel ? key(this.modules.find((m) => m.id === id).position.clone().add(dir)) : baseKey;

      const [x, y, z] = origin.split(',').map(Number);
      const originVec = new THREE.Vector3(x, y, z);
      for (const d of deltas) {
        const k = key(originVec.clone().add(d));
        if (!hasModuleAt(k)) continue;
        const neighborId = this.modules.find((m) => {
          const tgtKey = inSel && movedKeys.has(k) && selection.some((sel) => sel.key === k)
            ? m.id
            : m.key === k;
          return tgtKey;
        })?.id;
        if (neighborId && !visited.has(neighborId)) stack.push(neighborId);
      }
    }
    return visited.size === allIds.size;
  }
}
