export function buildHomeLayout(onConfig, onFree, onGoal, docUrl) {
    const host = document.getElementById('root');
    host.innerHTML = '';
    host.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen');
  
    const root = document.createElement('div');
    root.className = 'w-96 text-center space-y-6';
  
    root.innerHTML = `
      <h1 class="text-2xl font-bold">Welcome to MRC 3D Visualizer</h1>
      <p class="text-sm text-gray-500">What do you want to do?</p>
  
      <button id="buildConfigBtn"
              class="w-full py-2 bg-green-600 text-white rounded hover:bg-green-500">
        Build a New Configuration
      </button>
  
      <button id="startMoveBtn"
              class="w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500">
        Start Free Movement
      </button>
  
      <button id="startGoalBtn"
              class="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-500">
        Reach a Goal Configuration
      </button>
  
      <a href="${docUrl}" target="_blank"
         class="block w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
        Documentation
      </a>
    `;
  
    host.appendChild(root);
  
    document.getElementById('buildConfigBtn').onclick = onConfig;
    document.getElementById('startMoveBtn').onclick = onFree;
    document.getElementById('startGoalBtn').onclick = onGoal;
  }
  