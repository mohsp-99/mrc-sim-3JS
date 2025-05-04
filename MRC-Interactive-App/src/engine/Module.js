import * as THREE from 'three';

export const DIR = Object.freeze({
  POS_X: 'posX', NEG_X: 'negX',
  POS_Y: 'posY', NEG_Y: 'negY',
  POS_Z: 'posZ', NEG_Z: 'negZ'
});

/** One voxel‑sized robot module */
export default class Module {
  static _nextId = 1;

  /**
   * @param {THREE.Vector3} position  grid‑aligned world position
   * @param {THREE.Mesh=}   mesh      reference to mesh in scene (optional)
   */
  constructor(position, mesh = null) {
    this.id       = Module._nextId++;
    this.position = position.clone();
    this.mesh     = mesh;

    /* ---------- new physical / logical fields ---------- */
    this.color    = '#1e90ff';   // default UI colour swatch
    this.pinned   = false;       // fixed support for statics
    this.mass     = 1.0;         // kg, default
    this.metadata = {};          // free‑form user data

    /* ---------- neighbours & connections ---------- */
    this.neighbors = {
      posX:null, negX:null, posY:null, negY:null, posZ:null, negZ:null
    };
    /** per‑face connection info: { type, mode, strength } */
    this.connectionType = {};

    this._key = Module.keyFrom(position);
  }

  /* ---------- helpers ---------- */
  static keyFrom(v) { return `${v.x},${v.y},${v.z}`; }
  get key() { return this._key; }

  translate(delta) {
    this.position.add(delta);
    this._key = Module.keyFrom(this.position);
    this.mesh?.position.copy(this.position);
  }

  /** Store neighbour reference & connection meta */
  setNeighbor(dir, moduleId, {
    type = 'rigid',             // 'rigid' | 'hinge' | 'rail-wagon'
    mode = undefined,           // 'rail' | 'wagon' | undefined
    strength = undefined        // Newtons, optional
  } = {}) {
    this.neighbors[dir] = moduleId;
    this.connectionType[dir] = { type, mode, strength };
  }
}
