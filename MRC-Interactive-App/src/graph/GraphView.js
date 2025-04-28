// src/graph/GraphView.js ---------------------------------------
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import cxtmenu from 'cytoscape-cxtmenu';

cytoscape.use(coseBilkent);
cytoscape.use(cxtmenu);

let cy = null;

/**
 * Bootstraps Cytoscape into a container.
 * @param {HTMLElement|string} mount  DOM node or CSS selector
 * @param {ModuleGraph}        graph  the live connectivity graph
 */
export function initGraph(mount = '#cy', graph) {
  const container =
    typeof mount === 'string' ? document.querySelector(mount) : mount;

  // ----------------------------------------------------------------
  // 1. convert ModuleGraph → Cytoscape elements
  // ----------------------------------------------------------------
  const elements = [];
  graph.modules.forEach((mod) => {
    elements.push({
      data: { id: `${mod.id}`, label: mod.id }
    });
  });
  graph.modules.forEach((mod) => {
    Object.values(mod.neighbors).forEach((nbrId) => {
      if (nbrId && mod.id < nbrId) {
        elements.push({
          data: { id: `${mod.id}-${nbrId}`, source: `${mod.id}`, target: `${nbrId}` }
        });
      }
    });
  });

  // ----------------------------------------------------------------
  // 2. initialise Cytoscape
  // ----------------------------------------------------------------
  cy = cytoscape({
    container,
    elements,
    layout: { name: 'cose-bilkent' },
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#1e90ff',
          'label': 'data(label)',
          'font-size': 8,
          'text-valign': 'center',
          'color': '#fff'
        }
      },
      {
        selector: 'edge',
        style: { width: 2, 'line-color': '#999' }
      },
      {
        selector: ':selected',
        style: { 'background-color': 'orange', 'line-color': 'orange' }
      }
    ]
  });

  // simple context menu
  cy.cxtmenu({
    selector: 'node',
    commands: [{ content: 'remove', select: (el) => cy.remove(el) }]
  });
}

/** Call whenever the ModuleGraph changes (add/remove/connect). */
export function refreshGraph(graph) {
  if (!cy) return;
  const existing = new Set(cy.nodes().map((n) => n.id()));
  const edges    = new Set(cy.edges().map((e) => e.id()));

  // add missing nodes
  graph.modules.forEach((m) => {
    if (!existing.has(`${m.id}`)) cy.add({ group: 'nodes', data: { id: `${m.id}`, label: m.id } });
  });

  // add missing edges
  graph.modules.forEach((m) => {
    Object.values(m.neighbors).forEach((nbrId) => {
      if (nbrId && m.id < nbrId) {
        const eid = `${m.id}-${nbrId}`;
        if (!edges.has(eid))
          cy.add({ group: 'edges', data: { id: eid, source: `${m.id}`, target: `${nbrId}` } });
      }
    });
  });

  cy.layout({ name: 'cose-bilkent', animate: false }).run();
}
