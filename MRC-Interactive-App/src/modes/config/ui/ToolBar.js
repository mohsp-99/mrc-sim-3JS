// ToolBar.js
import ToolState, { Tool } from '../ToolState.js';
import bus from '../../../core/EventBus.js';

let container;

export function mount(parent) {
  container = document.createElement('div');
  container.className = 'absolute top-4 left-4 z-10 bg-white rounded shadow p-2 flex gap-4';

  const tools = [
    { tool: Tool.ADD,    label: '➕', title: 'Add (1)' },
    { tool: Tool.DELETE, label: '❌', title: 'Delete (2)' },
    { tool: Tool.SELECT, label: '🖱️', title: 'Select (3)' },
    { tool: Tool.PAN,    label: '🖐️', title: 'Pan (4)' },
  ];

  for (const { tool, label, title } of tools) {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.title = title;
    btn.className = 'w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-lg';
    btn.onclick = () => {
      ToolState.set(tool); // ✅ use the set() method
      highlight(tool);
    };
    container.appendChild(btn);
  }

  highlight(ToolState.current); // highlight initial tool
  parent.appendChild(container);

  bus.on('toolChanged', highlight);
}

export function unmount() {
  container?.remove();
  container = null;
}

export function highlight(activeTool) {
  if (!container) return;

  const buttons = [...container.children];
  const toolList = [Tool.ADD, Tool.DELETE, Tool.SELECT, Tool.PAN];

  buttons.forEach((btn, i) => {
    const isActive = toolList[i] === activeTool;
    btn.classList.toggle('bg-blue-500', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('bg-gray-200', !isActive);
    btn.classList.toggle('text-gray-900', !isActive);
  });
}


