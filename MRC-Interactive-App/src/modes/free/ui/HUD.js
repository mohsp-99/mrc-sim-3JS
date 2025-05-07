// src/modes/free/ui/HUD.js
let root = null;

export function mount(hud) {
  root = hud;
  root.innerHTML = `
    <button id="playBtn" class="px-2 bg-green-600 rounded">▶︎</button>
    <span id="statusTxt">paused</span>
  `;
}

export function unmount() {
  root?.remove();
  root = null;
}
