/mrc-visualizer/
│
├── public/                # Static assets (icons, textures, etc.)
│
├── src/
│   ├── core/              # Core setup (scene, camera, renderer, loop)
│   │   ├── scene.js
│   │   ├── camera.js
│   │   ├── renderer.js
│   │   └── loop.js
│   │
│   ├── controls/          # OrbitControls and any interaction logic
│   │   └── orbitControls.js
│   │
│   ├── modules/           # Robot modules: voxel shapes, connections, etc.
│   │   ├── Module.js
│   │   └── ModuleFactory.js
│   │
│   ├── ui/                # Buttons, color selectors, UI handlers
│   │   ├── ControlsPanel.js
│   │   └── ColorPicker.js
│   │
│   ├── utils/             # Utility functions (e.g., JSON export, grid snapping)
│   │   └── utils.js
│   │
│   ├── data/              # Saved scene configurations
│   │   └── exampleConfig.json
│   │
│   └── main.js            # Entry point that ties everything together
│
├── index.html
└── package.json
