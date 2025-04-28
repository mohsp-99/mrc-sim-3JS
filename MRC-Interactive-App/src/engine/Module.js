// src/engine/Module.js
import * as THREE from 'three';

export const DIR = Object.freeze({
  POS_X: 'posX',
  NEG_X: 'negX',
  POS_Y: 'posY',
  NEG_Y: 'negY',
  POS_Z: 'posZ',
  NEG_Z: 'negZ'
});

/** One voxel-sized robot module. */
export default class Module {
  static _nextId = 1;

  /**
   * @param {THREE.Vector3} position  grid-aligned world position
   * @param {THREE.Mesh=}   mesh      reference to mesh in scene
   */
  constructor(position, mesh = null) {
    this.id = Module._nextId++;
    this.position = position.clone();
    this.mesh = mesh;

    /** neighbour id or null per face */
    this.neighbors = {
      [DIR.POS_X]: null, [DIR.NEG_X]: null,
      [DIR.POS_Y]: null, [DIR.NEG_Y]: null,
      [DIR.POS_Z]: null, [DIR.NEG_Z]: null
    };

    /** connection meta per face (type, stiffness…) */
    this.connectionType = {};

    this._key = Module.keyFrom(position);
  }

  // ---------- API ----------
  /** Unique string "x,y,z" – handy for hash-maps */
  static keyFrom(v) { return `${v.x},${v.y},${v.z}`; }
  get key() { return this._key; }

  translate(delta) {
    this.position.add(delta);
    this._key = Module.keyFrom(this.position);
    if (this.mesh) this.mesh.position.copy(this.position);
  }

  setNeighbor(dir, moduleId, type = 'rigid') {
    this.neighbors[dir] = moduleId;
    this.connectionType[dir] = type;
  }
}
