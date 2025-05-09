// src/core/SceneManager.js   ✅ drop-in replacement
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadVoxelGeometry } from './ResourceLoader.js';

/* ────────────────────────────────────────────────────────────
 *  Private singleton state
 * ──────────────────────────────────────────────────────────── */
let _scene, _camera, _renderer, _controls;
let _plane;                                 // the invisible ray-cast plane
const _objects = [];                        // intersectable meshes (plane first)

let _cubeGeo, _cubeMaterial, _rollOverMesh; // primitives requested by UI
let _onFrame = () => {};                    // external hook (dt seconds)

/* ────────────────────────────────────────────────────────────
 *  Bootstrap once
 * ──────────────────────────────────────────────────────────── */
function init(container = '#container', onFrame) {
  if (_scene) {
    console.warn('SceneManager.init() called twice – ignoring');
    return;
  }

  // --- mount element
  const mount =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;
  if (!mount) throw new Error('SceneManager: container not found');

  // --- scene
  _scene = new THREE.Scene();
  _scene.background = new THREE.Color(0xf0f0f0);

  // --- camera
  _camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10_000
  );
  _camera.position.set(500, 800, 1_300);
  _camera.lookAt(0, 0, 0);

  // --- renderer
  _renderer = new THREE.WebGLRenderer({ antialias: true });
  _renderer.setPixelRatio(window.devicePixelRatio);
  _renderer.setSize(window.innerWidth, window.innerHeight);
  mount.appendChild(_renderer.domElement);

  // --- orbit controls
  _controls = new OrbitControls(_camera, _renderer.domElement);
  _controls.enableDamping = true;
  _controls.dampingFactor = 0.12;

  // --- helpers (grid)
  _scene.add(new THREE.GridHelper(1_000, 20));

  // --- invisible plane for ray-casting (index 0 in _objects)
  const planeGeo = new THREE.PlaneGeometry(1_000, 1_000);
  planeGeo.rotateX(-Math.PI / 2);
  _plane = new THREE.Mesh(
    planeGeo,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  _scene.add(_plane);
  _objects.push(_plane);

  // --- cube primitives requested by UI layer
  const CUBE_SIZE = 50;
  _cubeGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  _cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x1e90ff });

  const rollOverMat = new THREE.MeshBasicMaterial({
    color: 0x1e90ff,
    opacity: 0.5,
    transparent: true
  });
  _rollOverMesh = new THREE.Mesh(_cubeGeo.clone(), rollOverMat);
  _scene.add(_rollOverMesh);

  // load real voxel geometry (if available) and swap in-place
  loadVoxelGeometry().then((geom) => {
    _cubeGeo.dispose();
    _cubeGeo       = geom;
    _rollOverMesh.geometry.dispose();
    _rollOverMesh.geometry = _cubeGeo.clone();
  });

  // --- lights
  _scene.add(new THREE.AmbientLight(0x606060));
  const dir = new THREE.DirectionalLight(0xffffff);
  dir.position.set(1, 0.75, 0.5).normalize();
  _scene.add(dir);

  // --- resize
  window.addEventListener('resize', () => {
    _camera.aspect = window.innerWidth / window.innerHeight;
    _camera.updateProjectionMatrix();
    _renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- external per-frame callback
  if (typeof onFrame === 'function') _onFrame = onFrame;

  // --- main loop
  let prev = performance.now();
  (function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    _onFrame((now - prev) / 1_000); // dt in seconds
    prev = now;

    _controls.update();
    _renderer.render(_scene, _camera);
  })();
}

/* ────────────────────────────────────────────────────────────
 *  Public helpers
 * ──────────────────────────────────────────────────────────── */
function addMesh(mesh, trackForRaycast = true) {
  _scene.add(mesh);
  if (trackForRaycast) _objects.push(mesh);
  return mesh;
}

const getScene      = () => _scene;
const getCamera     = () => _camera;
const getRenderer   = () => _renderer;
const getControls   = () => _controls;
const getObjects    = () => _objects;
const getPrimitives = () => ({ cubeGeo: _cubeGeo, cubeMaterial: _cubeMaterial, rollOverMesh: _rollOverMesh });
const setOnFrame    = (cb) => { if (typeof cb === 'function') _onFrame = cb; };

/* ────────────────────────────────────────────────────────────
 *  Export facade
 * ──────────────────────────────────────────────────────────── */
function dispose() {
  _renderer?.dispose();
  _scene?.clear();
  _objects.length = 0;
  _onFrame = () => {};
  _camera = _controls = _renderer = _scene = null;
}

export const SceneManager = {
  init,
  addMesh,
  setOnFrame,
  getScene,
  getCamera,
  getRenderer,
  getControls,
  getObjects,
  getPrimitives,
  dispose
};


export default SceneManager;
