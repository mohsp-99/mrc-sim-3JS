/**
 * Adds a bottom toolbar with export, undo/redo, select all, and clear canvas buttons
 * @param {HTMLElement} container - The parent container
 */
function addBottomToolbar(container) {
  // Create the toolbar container
  const toolbar = document.createElement('div');
  toolbar.className = 'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex bg-gray-800 rounded-lg shadow-lg overflow-hidden';
  toolbar.style.zIndex = '50';
  
  // ────────────────────────────────
  // Export Section
  // ────────────────────────────────
  const exportSection = createToolbarSection('bg-purple-600');
  
  const exportButton = createToolbarButton('Export', '#fff', 'bg-purple-700');
  exportButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Export
  `;
  exportSection.appendChild(exportButton);
  toolbar.appendChild(exportSection);
  
  // ────────────────────────────────
  // History Section (Undo/Redo)
  // ────────────────────────────────
  const historySection = createToolbarSection('bg-blue-600');
  
  const undoButton = createToolbarButton('Undo', '#fff', 'bg-blue-700');
  undoButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a4 4 0 0 1 4 4v2M3 10l6 6m-6-6l6-6" />
    </svg>
  `;
  historySection.appendChild(undoButton);
  
  const redoButton = createToolbarButton('Redo', '#fff', 'bg-blue-700');
  redoButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a4 4 0 0 0-4 4v2M21 10l-6 6m6-6l-6-6" />
    </svg>
  `;
  historySection.appendChild(redoButton);
  toolbar.appendChild(historySection);
  
  // ────────────────────────────────
  // Selection Section
  // ────────────────────────────────
  const selectionSection = createToolbarSection('bg-green-600');
  
  const selectAllButton = createToolbarButton('Select All', '#fff', 'bg-green-700');
  selectAllButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  `;
  selectionSection.appendChild(selectAllButton);
  toolbar.appendChild(selectionSection);
  
  // ────────────────────────────────
  // Clear Section
  // ────────────────────────────────
  const clearSection = createToolbarSection('bg-red-600');
  
  const clearButton = createToolbarButton('Clear Canvas', '#fff', 'bg-red-700');
  clearButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    Clear
  `;
  clearSection.appendChild(clearButton);
  toolbar.appendChild(clearSection);
  
  // Add the toolbar to the container
  container.appendChild(toolbar);
}

/**
 * Creates a section for the toolbar with the specified background color
 * @param {string} bgColorClass - The background color class
 * @returns {HTMLElement} The section element
 */
function createToolbarSection(bgColorClass) {
  const section = document.createElement('div');
  section.className = `flex ${bgColorClass} border-r border-gray-700 last:border-r-0`;
  return section;
}

/**
 * Creates a button for the toolbar with the specified label and colors
 * @param {string} label - The button label for accessibility
 * @param {string} textColor - The text color
 * @param {string} hoverBgColor - The hover background color class
 * @returns {HTMLElement} The button element
 */
function createToolbarButton(label, textColor, hoverBgColor) {
  const button = document.createElement('button');
  button.className = `flex items-center justify-center px-3 py-2 transition-colors hover:${hoverBgColor} text-sm font-medium`;
  button.style.color = textColor;
  button.setAttribute('aria-label', label);
  button.title = label;
  return button;
}export function buildLayout() {
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.classList.add('h-screen', 'w-screen', 'overflow-hidden');

  const wrap = document.createElement('div');
  wrap.className = 'flex h-full w-full relative';

  // LEFT: 3D Canvas
  const canvasBox = document.createElement('div');
  canvasBox.id = 'container';
  canvasBox.className = 'relative bg-gray-900 overflow-hidden';
  canvasBox.style.minWidth = '300px'; // Minimum width for canvas
  canvasBox.style.flex = '1 1 auto'; // Allow flex grow and shrink
  wrap.appendChild(canvasBox);

  // HORIZONTAL RESIZER: Between Canvas and Right Panel
  const horizontalResizer = createResizer('horizontal');
  wrap.appendChild(horizontalResizer);

  // RIGHT: Graph + Resizer + ModuleBar
  const rightPanel = document.createElement('div');
  rightPanel.className = 'flex flex-col border-l border-gray-600 bg-gray-100';
  rightPanel.style.width = '320px'; // Default width
  rightPanel.style.minWidth = '200px'; // Minimum width for right panel
  rightPanel.style.maxWidth = '500px'; // Maximum width for right panel
  rightPanel.style.flex = '0 0 auto'; // Don't allow flex grow or shrink

  // Graph View
  const cyDiv = document.createElement('div');
  cyDiv.id = 'cy';
  cyDiv.style.flexGrow = 1;
  cyDiv.style.minHeight = '100px';
  cyDiv.className = 'w-full bg-white border-b border-gray-300';
  rightPanel.appendChild(cyDiv);

  // VERTICAL RESIZER: Between Graph and Module Bar
  const verticalResizer = createResizer('vertical');
  rightPanel.appendChild(verticalResizer);

  // Module Bar
  const moduleBarHost = document.createElement('div');
  moduleBarHost.id = 'moduleBarHost';
  moduleBarHost.style.flexGrow = 1;
  moduleBarHost.style.minHeight = '100px';
  moduleBarHost.className = 'w-full bg-gray-50';
  rightPanel.appendChild(moduleBarHost);

  wrap.appendChild(rightPanel);
  root.appendChild(wrap);
  
  // ────────────────────────────────
  // Bottom Toolbar
  // ────────────────────────────────
  addBottomToolbar(wrap);

  // ────────────────────────────────
  // Resizing Logic
  // ────────────────────────────────
  
  // Vertical resizer (between Graph and Module Bar)
  setupVerticalResizing(verticalResizer, cyDiv, moduleBarHost, rightPanel);
  
  // Horizontal resizer (between Canvas and Right Panel)
  setupHorizontalResizing(horizontalResizer, canvasBox, rightPanel, wrap);

  // Handle window resizing
  window.addEventListener('resize', () => {
    handleWindowResize(canvasBox, rightPanel, wrap);
  });

  // Initial layout adjustment
  handleWindowResize(canvasBox, rightPanel, wrap);

  return { canvasBox };
}

/**
 * Creates a resizer element with the specified orientation
 * @param {string} orientation - 'horizontal' or 'vertical'
 * @returns {HTMLElement} The resizer element
 */
function createResizer(orientation) {
  const resizer = document.createElement('div');
  
  if (orientation === 'horizontal') {
    resizer.className = 'w-2 h-full cursor-col-resize bg-gray-400 hover:bg-gray-500 active:bg-gray-600';
  } else {
    resizer.className = 'w-full h-2 cursor-row-resize bg-gray-400 hover:bg-gray-500 active:bg-gray-600';
  }
  
  resizer.style.userSelect = 'none';
  resizer.style.zIndex = '10';
  
  return resizer;
}

/**
 * Sets up vertical resizing between two elements
 * @param {HTMLElement} resizer - The resizer element
 * @param {HTMLElement} topElement - The element above the resizer
 * @param {HTMLElement} bottomElement - The element below the resizer
 * @param {HTMLElement} container - The container element
 */
function setupVerticalResizing(resizer, topElement, bottomElement, container) {
  let isDragging = false;

  resizer.addEventListener('mousedown', (e) => {
    isDragging = true;
    document.body.style.cursor = 'row-resize';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const containerRect = container.getBoundingClientRect();
    const offsetY = e.clientY - containerRect.top;

    // Clamp values to avoid collapsing
    const minHeight = 100; // Minimum height for both elements
    const maxHeight = containerRect.height - minHeight - resizer.offsetHeight;
    
    const topHeight = Math.max(minHeight, Math.min(offsetY, maxHeight));
    const bottomHeight = containerRect.height - topHeight - resizer.offsetHeight;

    topElement.style.flex = 'none';
    bottomElement.style.flex = 'none';
    topElement.style.height = `${topHeight}px`;
    bottomElement.style.height = `${bottomHeight}px`;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = '';
    }
  });
}

/**
 * Sets up horizontal resizing between two elements
 * @param {HTMLElement} resizer - The resizer element
 * @param {HTMLElement} leftElement - The element to the left of the resizer
 * @param {HTMLElement} rightElement - The element to the right of the resizer
 * @param {HTMLElement} container - The container element
 */
function setupHorizontalResizing(resizer, leftElement, rightElement, container) {
  let isDragging = false;
  let startX;
  let startRightWidth;

  resizer.addEventListener('mousedown', (e) => {
    isDragging = true;
    document.body.style.cursor = 'col-resize';
    
    // Store the initial position and panel width
    startX = e.clientX;
    startRightWidth = parseInt(rightElement.offsetWidth);
    
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    // Calculate how far the mouse has moved
    const delta = e.clientX - startX;
    
    // Calculate the new right panel width
    let newRightWidth = startRightWidth - delta;
    
    // Get the constraints
    const minLeftWidth = parseInt(leftElement.style.minWidth) || 300;
    const minRightWidth = parseInt(rightElement.style.minWidth) || 200;
    const maxRightWidth = parseInt(rightElement.style.maxWidth) || 500;
    
    // Apply constraints to the right panel
    newRightWidth = Math.max(minRightWidth, Math.min(newRightWidth, maxRightWidth));
    
    // Calculate container width
    const containerWidth = container.offsetWidth;
    
    // Calculate left panel width based on right panel width
    const newLeftWidth = containerWidth - newRightWidth - resizer.offsetWidth;
    
    // Only apply if left panel width is valid
    if (newLeftWidth >= minLeftWidth) {
      rightElement.style.flex = '0 0 auto';
      rightElement.style.width = `${newRightWidth}px`;
      
      // Left panel takes remaining space
      leftElement.style.flex = '1 1 auto';
      leftElement.style.width = 'auto';
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = '';
    }
  });
}

/**
 * Handles window resize events to ensure panels maintain proper dimensions
 * @param {HTMLElement} leftElement - The left panel (canvas)
 * @param {HTMLElement} rightElement - The right panel
 * @param {HTMLElement} container - The container element
 */
function handleWindowResize(leftElement, rightElement, container) {
  const containerWidth = container.offsetWidth;
  const rightWidth = parseInt(rightElement.offsetWidth);
  const minLeftWidth = parseInt(leftElement.style.minWidth) || 300;
  const minRightWidth = parseInt(rightElement.style.minWidth) || 200;
  
  // Check if window is too small to accommodate both minimum widths
  if (containerWidth < minLeftWidth + minRightWidth + 2) {
    // Set minimum widths for both panels
    rightElement.style.width = `${minRightWidth}px`;
    leftElement.style.width = `${containerWidth - minRightWidth - 2}px`;
  } else {
    // Make sure right panel doesn't exceed its constraints
    const currentRightWidth = Math.min(rightWidth, containerWidth - minLeftWidth - 2);
    
    if (currentRightWidth < minRightWidth) {
      rightElement.style.width = `${minRightWidth}px`;
    } else {
      rightElement.style.width = `${currentRightWidth}px`;
    }
  }
}