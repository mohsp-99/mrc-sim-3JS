// ModuleBar.js
import bus from '../../../core/EventBus.js';

let container, listEl;

export function mount(host) {
  container = document.createElement('div');
  container.className = 'p-3 text-sm text-gray-800 space-y-2';

  const title = document.createElement('div');
  title.className = 'font-semibold text-gray-700';
  title.innerText = 'Selected Modules';

  listEl = document.createElement('div');
  listEl.className = 'text-xs text-gray-600';

  container.appendChild(title);
  container.appendChild(listEl);
  host.appendChild(container);

  // Subscribe to selection changes
  bus.on('selectionChanged', updateList);
}

export function unmount() {
  bus.off('selectionChanged', updateList);
  container?.remove();
  container = null;
}

function updateList(selectedSet) {
  listEl.innerHTML = '';
  if (!selectedSet || selectedSet.size === 0) {
    listEl.innerText = '(none)';
    return;
  }

  [...selectedSet].forEach(mesh => {
    const div = document.createElement('div');
    div.innerText = `Module ID: ${mesh.__modId ?? '(unknown)'}`;
    listEl.appendChild(div);
  });
}
