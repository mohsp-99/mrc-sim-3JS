// src/core/ResourceLoader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const _cache = new Map();

/**
 * Loads a .glb model and returns its first geometry.
 * Falls back to a BoxGeometry(size) if the file is missing or invalid.
 *
 * @param {string} url  relative to /public (default: models/voxel.glb)
 * @param {number} size cube edge length for fallback geom (default: 50)
 * @returns {Promise<THREE.BufferGeometry>}
 */
export function loadVoxelGeometry(
  url = 'models/custom_cube.glb',
  size = 50
) {
  if (_cache.has(url)) return Promise.resolve(_cache.get(url));

  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load(
      url,
      (gltf) => {
        let geom = null;
        gltf.scene.traverse((child) => {
          if (geom) return;
          if (child.isMesh) geom = child.geometry.clone();
        });
        if (!geom) geom = new THREE.BoxGeometry(size, size, size);
        _cache.set(url, geom);
        resolve(geom);
      },
      undefined,                    // onProgress – unused
      () => {
        // onError → fallback cube
        console.warn(`Failed to load ${url}, falling back to BoxGeometry`);
        const geom = new THREE.BoxGeometry(size, size, size);
        _cache.set(url, geom);
        resolve(geom);
      }
    );
  });
}
