import toolState, { Tool } from '../modes/config/ToolState.js';

const icons = {
  [Tool.PAN]   : '🤚',
  [Tool.ADD]   : '➕',
  [Tool.SELECT]: '🖱️',
  [Tool.DELETE]: '🗑️'
};

let root = null;

export function mount(parent) {
  root = document.createElement('div');
/* absolute → inside #container;  top-12 (≈ 48 px) keeps it clear of nav */
root.className = 
          'absolute top-24 left-2 flex flex-col space-y-1 p-1 bg-gray-800 text-white rounded';

Object.values(Tool).forEach(t => {
    const btn = document.createElement('button');
    btn.textContent = icons[t];
    btn.title = t.split('.')[1];
    btn.className =
      'w-8 h-8 text-lg hover:bg-teal-600 rounded focus:outline-none';
    btn.onclick = () => toolState.set(t);
    btn.dataset.tool = t;
    root.appendChild(btn);
  });
  parent.appendChild(root);
  highlight(Tool.PAN);
}

export function unmount() {
  root?.remove();
  root = null;
}

export function highlight(tool) {
  root?.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('bg-teal-600', btn.dataset.tool === tool);
  });
}
