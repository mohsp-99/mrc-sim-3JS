// Enhanced GraphView.js with visual & UX upgrades
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import cxtmenu from 'cytoscape-cxtmenu';
import popper from 'cytoscape-popper';
import { appState } from '../../../core/AppState.js'; // adjust path as needed

cytoscape.use(coseBilkent);
cytoscape.use(cxtmenu);
cytoscape.use(popper);

/** @type {cytoscape.Core} */
let cy = null;

/**
 * Initialize and mount the graph visualization.
 * @param {string|HTMLElement} target - DOM node or selector
 * @param {ModuleGraph} graph - graph data to render
 */
export function initGraph(target, graph) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;

  cy = cytoscape({
    container,
    elements: [],
    layout: {
      name: 'cose-bilkent',
      fit: true,
      padding: 10,
      animate: false,
    },
    style: [
      {
        selector: 'node',
        style: {
          label: 'data(label)',
          'background-color': '#3490dc',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#fff',
          'font-size': 10,
          'width': 'mapData(degree, 1, 5, 20, 50)',
          'height': 'mapData(degree, 1, 5, 20, 50)',
          'transition-property': 'width height background-color',
          'transition-duration': '300ms'
        }
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': '#888',
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#888',
        }
      },
      {
        selector: ':selected',
        style: {
          'background-color': 'orange',
          'line-color': 'orange',
          'target-arrow-color': 'orange',
          'transition-property': 'background-color, line-color',
          'transition-duration': '250ms'
        }
      }
    ]
  });

  // Context menu with proper deletion
  cy.cxtmenu({
    selector: 'node',
    commands: [
      {
        content: 'Inspect',
        select: (ele) => {
          const id = parseInt(ele.id(), 10);
          window.inspectModuleById?.(id);
        }
      },
      {
        content: 'Remove',
        select: (ele) => {
          const id = parseInt(ele.id(), 10);
          const mod = appState.modules.get(id);

          if (mod) {
            // Clean up neighbor links
            Object.entries(mod.neighbors).forEach(([dir, nbrId]) => {
              if (!nbrId) return;
              const neighbor = appState.modules.get(nbrId);
              if (!neighbor) return;

              const opposite = {
                posX: 'negX', negX: 'posX',
                posY: 'negY', negY: 'posY',
                posZ: 'negZ', negZ: 'posZ'
              }[dir];

              if (opposite && neighbor.neighbors[opposite] === id) {
                neighbor.neighbors[opposite] = null;
                delete neighbor.connectionType[opposite];
              }
            });

            // Remove from graph and app state
            appState.graph.removeModule(id);
            appState.modules.delete(id);
            refreshGraph(appState.graph);
          }
        }
      }
    ]
  });

  refreshGraph(graph);
}

/**
 * Regenerates the graph view based on the current graph data.
 * @param {ModuleGraph} graph
 */
export function refreshGraph(graph) {
  if (!cy) return;

  const seen = new Set();
  const elements = [];

  graph.modules.forEach((mod) => {
    const id = mod.id.toString();
    const degree = Object.values(mod.neighbors).filter(Boolean).length;
    seen.add(id);
    elements.push({
      data: {
        id,
        label: `#${mod.id}`,
        degree
      }
    });
  });

  graph.modules.forEach((mod) => {
    Object.entries(mod.neighbors).forEach(([dir, nbrId]) => {
      if (!nbrId) return;
      const eid = `${mod.id}-${nbrId}`;
      const reverse = `${nbrId}-${mod.id}`;
      if (!seen.has(eid) && !seen.has(reverse)) {
        seen.add(eid);
        elements.push({
          data: {
            id: eid,
            source: `${mod.id}`,
            target: `${nbrId}`,
            label: dir
          }
        });
      }
    });
  });

  cy.json({ elements });
  cy.layout({ name: 'cose-bilkent', animate: false }).run();
} 
