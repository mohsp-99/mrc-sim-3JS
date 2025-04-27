// Blinking selection helper — call update(dt) every animation frame.
import * as THREE from 'three';

export class SelectionManager {
  constructor(scene) {
    this.scene = scene;
    this.selected = null;
    this._blink   = false;
    this._timer   = 0;
  }

  set(module) {
    if (this.selected === module) return;
    this.clear();
    this.selected = module;
    if (module) {
      const mat = module.mesh.material;
      module.mesh.userData._origEmissive = mat.emissive.getHex();
      mat.emissive.setHex(0x0077ff);    // base colour
    }
  }

  clear() {
    if (!this.selected) return;
    const mat = this.selected.mesh.material;
    mat.emissive.setHex(this.selected.mesh.userData._origEmissive || 0x000000);
    delete this.selected.mesh.userData._origEmissive;
    this.selected = null;
  }

  // delta in seconds
  update(dt) {
    if (!this.selected) return;
    this._timer += dt;
    if (this._timer >= 0.4) {
      this._timer = 0;
      this._blink = !this._blink;
      const mat = this.selected.mesh.material;
      mat.emissive.setHex(this._blink ? 0xffff00 : 0x0077ff);
    }
  }
}
