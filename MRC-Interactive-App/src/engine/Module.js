// src/engine/Module.js
import * as THREE from 'three';

/**
 * Represents a single voxel module in the MRC system.
 * Stores its grid‑aligned position, neighbor map, and (optional) THREE.Mesh.
 */
export default class Module {
  /**
   * @param {THREE.Vector3} position  – grid‑aligned world position
   * @param {THREE.Mesh}     mesh      – reference to mesh in scene (optional)
   */
  constructor(position, mesh = null) {
    this.id = Module._nextId++;
    this.position = position.clone();
    this.mesh = mesh;

    // Neighbor metadata (null ⇒ no neighbor)
    this.neighbors = {
      posX: null,
      negX: null,
      posY: null,
      negY: null,
      posZ: null,
      negZ: null,
    };

    /**
     * Connection type for each neighbor (string placeholder, e.g. "rail-wagon").
     * Only defined if neighbor exists.
     */
    this.connectionType = {}; // key = direction string, value = type

    // Cached string key for fast lookup in occupancy maps
    this._key = this._makeKey(this.position);
  }

  // -------------------- Helpers --------------------
  /** String key such as "x,y,z" for Map usage */
  _makeKey(v) {
    return `${v.x},${v.y},${v.z}`;
  }

  /** Get unique key for current position */
  get key() {
    return this._key;
  }

  /** Move by grid‑aligned delta (does **not** update neighbor info) */
  translate(delta) {
    this.position.add(delta);
    this._key = this._makeKey(this.position);
    if (this.mesh) this.mesh.position.copy(this.position);
  }

  /** Update a neighbor reference & connection type */
  setNeighbor(direction, moduleId, type = 'rigid') {
    this.neighbors[direction] = moduleId;
    this.connectionType[direction] = type;
  }
}

Module._nextId = 1;
