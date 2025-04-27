// src/engine/CollisionManager.js
import * as THREE from 'three';

/** Grid unit size (must match scene cube size) */
const UNIT = 50;

/**
 * Maintains an occupancy map of module positions for fast collision queries.
 */
export class CollisionManager {
  /** @param {Module[]} modules */
  constructor(modules) {
    this.updateOccupancy(modules);
  }

  /** Build Map<key,id> of current module grid cells */
  updateOccupancy(modules) {
    this.occupancy = new Map();
    for (const m of modules) {
      this.occupancy.set(m.key, m.id);
    }
  }

  /** Return true if a cell is occupied (by ANY module) */
  isOccupied(vec3) {
    return this.occupancy.has(`${vec3.x},${vec3.y},${vec3.z}`);
  }

  /**
   * Checks whether moving `selection` by `dir` will produce a collision with non‑selected modules.
   * `dir` is a THREE.Vector3 grid delta.
   */
  willCollide(selection, dir) {
    for (const m of selection) {
      const target = m.position.clone().add(dir);
      const key = `${target.x},${target.y},${target.z}`;
      const occupant = this.occupancy.get(key);

      // Ignore cells that will be vacated by another selected module (swap handled later)
      if (
        occupant !== undefined &&
        !selection.some((s) => s.id === occupant)
      ) {
        return true; // hard collision
      }
    }
    return false;
  }

  /**
   * Placeholder for more advanced swap detection logic.
   * Currently always returns false (no swap handling yet).
   */
  isSwapMove(/*selection, dir*/) {
    // TODO: implement two‑module swap logic
    return false;
  }

  /** Apply successful move to occupancy map */
  applyMove(selection, dir) {
    // Remove old keys
    for (const m of selection) this.occupancy.delete(m.key);
    // Add new keys
    for (const m of selection) {
      const newPos = m.position.clone().add(dir);
      this.occupancy.set(`${newPos.x},${newPos.y},${newPos.z}`, m.id);
    }
  }
}

/** Convenience constants for movement deltas */
export const DIRECTIONS = {
  posX: new THREE.Vector3(UNIT, 0, 0),
  negX: new THREE.Vector3(-UNIT, 0, 0),
  posY: new THREE.Vector3(0, UNIT, 0),
  negY: new THREE.Vector3(0, -UNIT, 0),
  posZ: new THREE.Vector3(0, 0, UNIT),
  negZ: new THREE.Vector3(0, 0, -UNIT),
};
