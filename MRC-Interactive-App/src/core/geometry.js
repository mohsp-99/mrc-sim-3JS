// geometry.js
import * as THREE from 'three';

export function posFrom(hit) {
  return hit.point.clone()
    .add(hit.face.normal)
    .divideScalar(50).floor()
    .multiplyScalar(50).addScalar(25);
}
