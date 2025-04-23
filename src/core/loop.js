// src/core/loop.js
/**
 * Starts the animation loop. Keeps the controls updated and renders each frame.
 * Accepts renderer, scene, camera, controls.
 */
export function startLoop(renderer, scene, camera, controls, onFrame = ()=>{}) {
  let prev = performance.now();
  function animate(){
    requestAnimationFrame(animate);
    const now = performance.now();
    onFrame((now-prev)/1000);   // delta seconds
    prev = now;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
