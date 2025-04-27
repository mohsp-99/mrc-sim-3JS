```markdown
/project-root
│
├── public/                  # static assets served as-is
│   └── models/…             #   custom .glb, icons, logo, etc.
│
├── src/                     # all JavaScript / TS
│   ├── core/                # engine-agnostic singletons
│   │   ├── AppState.js      # global store + finite-state-machine (Config/Move)
│   │   ├── EventBus.js      # tiny pub/sub (mitt or custom 30 LOC)
│   │   ├── SceneManager.js  # THREE.Scene, camera, renderer, loop
│   │   ├── ResourceLoader.js# GLTF, textures, Dracos, caches
│   │   ├── History.js       # undo/redo & timeline for movements
│   │   └── Validator.js     # collision + connectivity rules
│   │
│   ├── engine/              # domain data structures
│   │   ├── Module.js        # voxel class (neighbors, metadata)
│   │   ├── ModuleGraph.js   # connectivity graph
│   │   └── Movement.js      # helper for translating modules
│   │
│   ├── modes/               # feature “islands” — EASY to add Algorithm later
│   │   ├── config/          # Config Mode only
│   │   │   ├── index.js     # enable()/disable(), UI wiring
│   │   │   ├── Brush.js     # drag-to-add logic
│   │   │   └── Panels/…     # palette, inspector, etc.
│   │   ├── movement/        # Movement Mode only
│   │   │   ├── index.js     # enable()/disable(), key bindings
│   │   │   ├── Playback.js  # timeline scrub bar
│   │   │   └── Stats.js     # live stats panel
│   │   └── algorithm/       # (empty stub folder) will hold visualize & train
│   │
│   ├── ui/                  # shared, mode-agnostic widgets
│   │   ├── Button.js
│   │   ├── Modal.js
│   │   └── JSONPanel.js
│   │
│   ├── utils/               # math, geometry, tiny helpers
│   └── main.js              # bootstrap + mode switcher
│
├── vite.config.js / webpack.config.js
└── package.json
```