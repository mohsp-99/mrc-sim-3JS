/* ===========================================================================
 *  SelectionManager
 *  - Single-click select
 *  - Drag selected voxel(s) with 50-unit grid-snap
 *  - Delete / clear helpers
 *  - Can be enabled / disabled by Config-mode tools
 *  -------------------------------------------------------------------------*/

import * as THREE from 'three';
import bus        from '../core/EventBus.js';

export class SelectionManager {

  constructor(scene, graph) {
    this.scene   = scene;
    this.graph   = graph;                 // for future multi-select logic
    this._enabled = true;

    this.selected = new Set();            // THREE.Mesh instances
    this._dragging = false;

    // helpers reused during drag
    this._mouse     = new THREE.Vector2();
    this._raycaster = new THREE.Raycaster();
    this._plane     = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this._offset    = new THREE.Vector3();
  }

  /* ---------- public API ---------- */

  setEnabled(flag) { this._enabled = !!flag; }

  clear() {
    this.selected.forEach(m => this._setHighlight(m, false));
    this.selected.clear();
    bus.emit('selectionChanged', this.selected);
  }

  deleteSelection() {
    this.selected.forEach(m => {
      this.scene.remove(m);
      m.geometry.dispose();
      m.material.dispose();
      // also drop from connectivity graph if stored
      this.graph?.modules.delete(m.__modId);
    });
    this.selected.clear();
    bus.emit('selectionChanged', this.selected);
  }

  /** frame-loop update (currently no-op, placeholder for hover flash) */
  update(/* dt */) {}

  /**
   * Called by Config index.js when pointerdown occurs on scene.
   * @param {THREE.Intersection} hit
   * @param {PointerEvent}       ev
   */
  handlePointer(hit, ev) {
    if (!this._enabled) return;

    if (ev.button !== 0) return;          // LMB only

    const mesh = hit.object;

    // ── start drag immediately if already selected ──
    if (this.selected.has(mesh)) {
      this._startDrag(ev, mesh);
      return;
    }

    // ── single-select logic ──
    this.clear();
    this.selected.add(mesh);
    this._setHighlight(mesh, true);
    bus.emit('selectionChanged', this.selected);

    // allow drag right after click
    this._startDrag(ev, mesh);
  }

  dispose() { this.clear(); }

  /* ---------- internal ---------- */

  _startDrag(ev, mesh) {
    const dom = ev.target;               // renderer canvas
    const move = (moveEv) => this._onDrag(mesh, moveEv, dom);
    const up   = () => {
      dom.removeEventListener('pointermove', move);
      dom.removeEventListener('pointerup',   up);
      this._dragging = false;
    };
    dom.addEventListener('pointermove', move);
    dom.addEventListener('pointerup',   up);
    this._dragging = true;

    // compute initial offset between mesh center and hit point
    this._offset.copy(mesh.position).sub(ev.intersection?.point || mesh.position);
  }

  _onDrag(mesh, ev, dom) {
    if (!this._dragging) return;

    const rect = dom.getBoundingClientRect();
    this._mouse.x = ( (ev.clientX - rect.left) / rect.width  ) * 2 - 1;
    this._mouse.y = ( (ev.clientY - rect.top ) / rect.height ) * -2 + 1;

    this._raycaster.setFromCamera(this._mouse, this.scene.userData.camera);
    const intersect = this._raycaster.ray.intersectPlane(this._plane, new THREE.Vector3());
    if (!intersect) return;

    const newPos = intersect.add(this._offset)
                            .divideScalar(50).round()
                            .multiplyScalar(50)       // grid snap 50
                            .addScalar(25);

    // translate all selected meshes by delta
    const delta = new THREE.Vector3().subVectors(newPos, mesh.position);
    this.selected.forEach(m => m.position.add(delta));
  }

  _setHighlight(mesh, active) {
    if (!mesh.material) return;
    if (active) {
      mesh.material.emissive ??= new THREE.Color();
      mesh.material.emissive.setHex(0x8822ff);
    } else {
      mesh.material.emissive?.setHex(0x000000);
    }
  }
}

export default SelectionManager;
