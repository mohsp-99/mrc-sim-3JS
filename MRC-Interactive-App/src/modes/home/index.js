import { navigate } from '../../router.js';

let root;

export function init() {
  const host = document.getElementById('root');
  host.innerHTML = '';
  host.classList.add('items-center', 'justify-center');

  root = document.createElement('div');
  root.className = 'w-96 text-center space-y-6';

  root.innerHTML = `
    <h1 class="text-2xl font-bold">Welcome to MRC 3D Visualizer</h1>

    <button id="newBtn"
            class="w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-500">
      New Empty Scene
    </button>

    <div class="relative w-full">
      <input type="file" id="filePicker"
             class="absolute inset-0 opacity-0 cursor-pointer" />
      <button class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
        Load JSON Config
      </button>
    </div>
  `;
  host.appendChild(root);

  document.getElementById('newBtn').onclick = () => navigate('config');
  document.getElementById('filePicker').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => sessionStorage.setItem('mrc.pendingConfig', fr.result);
    fr.readAsText(f);
    navigate('config');
  };
}

export function destroy() {
  const host = document.getElementById('root');
  host.innerHTML = '';                       // ← remove all children
  host.classList.remove('items-center','justify-center');
}
