// src/core/scene.js
import * as THREE from 'three';

/**
 * Sets up the Three.js scene, grid helper, invisible plane for intersections,
 * rollover mesh for preview, and default cube geometry/material.
 * Returns an object with all elements needed elsewhere.
 */
export function setupScene() {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Grid helper (20×20, 50‑unit spacing → 1000×1000 workspace)
  const gridHelper = new THREE.GridHelper(1000, 20);
  scene.add(gridHelper);

  // Default cube size
  const CUBE_SIZE = 50;

  // Rollover (preview) cube
  const rollOverGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  const rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0x1e90ff,
    opacity: 0.5,
    transparent: true,
  });
  const rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  scene.add(rollOverMesh);

  // Actual cube (voxel) geometry + material (cloned per‑voxel later)
  const cubeGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x1e90ff });

  // Invisible plane used for ray‑cast intersection when adding/removing voxels
  const planeGeo = new THREE.PlaneGeometry(1000, 1000);
  planeGeo.rotateX(-Math.PI / 2);
  const plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(plane);

  // Ambient & directional lights
  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  // Objects array: start with the plane (index 0)
  const objects = [plane];

  return {
    scene,
    objects,
    plane,
    cubeGeo,
    cubeMaterial,
    rollOverMesh,
    CUBE_SIZE,
  };
}
