// src/modes/free/state/setupInteractions.js
import bus from '@/core/EventBus.js';

export function setupInteractions(camera, controls) {
  function keyListener(e) {
    if (e.code === 'Space') {
      bus.emit('free/playToggle');       // handled elsewhere later
    }
    if (e.code === 'KeyR') {
      controls.reset();
    }
  }
  document.addEventListener('keydown', keyListener);
  return { keyListener };
}
