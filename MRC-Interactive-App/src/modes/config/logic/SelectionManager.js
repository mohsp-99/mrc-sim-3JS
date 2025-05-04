// SelectionManager.js (config-specific)
import * as THREE from 'three';
import bus from '../../../core/EventBus.js';

export class SelectionManager {
  constructor(scene, graph) {
    this.scene = scene;
    this.graph = graph;

    this._enabled = true;
    this._dragging = false;
    this.selected = new Set();

    this._mouse = new THREE.Vector2();
    this._raycaster = new THREE.Raycaster();
    this._plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this._offset = new THREE.Vector3();
  }

  setEnabled(flag) {
    this._enabled = !!flag;
  }

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
      this.graph?.modules.delete(m.__modId);
    });
    this.selected.clear();
    bus.emit('selectionChanged', this.selected);
  }

  update() {
    // Future hover logic or flash effect
  }

  handlePointer(hit, ev) {
    if (!this._enabled || ev.button !== 0) return;

    const mesh = hit.object;

    if (this.selected.has(mesh)) {
      this._startDrag(ev, mesh);
      return;
    }

    if (ev.ctrlKey) {
      if (this.selected.has(mesh)) {
        this._setHighlight(mesh, false);
        this.selected.delete(mesh);
      } else {
        this._setHighlight(mesh, true);
        this.selected.add(mesh);
      }
    } else {
      this.clear();
      this.selected.add(mesh);
      this._setHighlight(mesh, true);
    }

    bus.emit('selectionChanged', this.selected);
    this._startDrag(ev, mesh);
  }

  dispose() {
    this.clear();
  }

  _startDrag(ev, mesh) {
    const dom = ev.target;
    const move = (moveEv) => this._onDrag(mesh, moveEv, dom);
    const up = () => {
      dom.removeEventListener('pointermove', move);
      dom.removeEventListener('pointerup', up);
      this._dragging = false;
    };

    dom.addEventListener('pointermove', move);
    dom.addEventListener('pointerup', up);
    this._dragging = true;

    this._offset.copy(mesh.position).sub(ev.intersection?.point || mesh.position);
  }

  _onDrag(mesh, ev, dom) {
    if (!this._dragging) return;

    const rect = dom.getBoundingClientRect();
    this._mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = ((ev.clientY - rect.top) / rect.height) * -2 + 1;

    this._raycaster.setFromCamera(this._mouse, this.scene.userData.camera);
    const intersect = this._raycaster.ray.intersectPlane(this._plane, new THREE.Vector3());
    if (!intersect) return;

    const newPos = intersect.add(this._offset)
      .divideScalar(50).round().multiplyScalar(50).addScalar(25);

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
