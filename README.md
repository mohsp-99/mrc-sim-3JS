# MRC Visualizer 🧩

Interactive web-based tool for **building** and **simulating** modular-robot configurations (MRC).  
Current release ships two modes:

| Mode | What you can do |
|------|-----------------|
| **Config** | Paint voxels, drag to resize/colour, snap-reposition, edit JSON metadata, import/export `.scene.json`. |
| **Movement** | Select modules, step them under full physical/graph constraints, scrub timeline, undo/redo, watch live stats & warnings. |

> **Status:** active development – core architecture finished, Config & Movement feature-complete.  
> Future roadmap: Algorithm Visualize / Train modes (stubbed in repo).

---

## 🚀 Quick Start

```bash
# 1.  clone & install
git clone https://github.com/mohsp-99/mrc-sim-3JS.git
cd mrc-sim-3JS/MRC-Interactive-App
npm install

# 2.  start dev server (Vite)
npm run dev
# open http://localhost:5173
```
