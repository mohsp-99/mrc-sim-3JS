// GraphView.js
import cytoscape from 'cytoscape';

/** @type {cytoscape.Core} */
let cy = null;

/**
 * Mount and initialize the graph view.
 * @param {string|HTMLElement} target - DOM element or selector.
 * @param {ModuleGraph} graph - Graph data structure to visualize.
 */
export function initGraph(target, graph) {
  cy = cytoscape({
    container: typeof target === 'string' ? document.querySelector(target) : target,
    style: cytoscape.stylesheet()
      .selector('node')
      .style({
        content: 'data(id)',
        'background-color': '#3490dc',
        'text-valign': 'center',
        color: '#fff',
        'font-size': 10,
      })
      .selector('edge')
      .style({
        width: 2,
        'line-color': '#999',
      }),
    layout: {
      name: 'grid',
      fit: true,
      padding: 10,
    }
  });

  refreshGraph(graph);
}

/**
 * Redraw the Cytoscape graph from scratch.
 * @param {ModuleGraph} graph
 */
export function refreshGraph(graph) {
  if (!cy) return;

  const elements = [];

  for (const [id, mod] of graph.modules) {
    elements.push({ data: { id: id.toString() } });

    for (const [dir, neighborId] of Object.entries(mod.neighbors)) {
      if (id < neighborId) {
        elements.push({ data: { source: id.toString(), target: neighborId.toString() } });
      }
    }
  }

  cy.elements().remove();
  cy.add(elements);
  cy.layout({ name: 'preset' }).run();
}
