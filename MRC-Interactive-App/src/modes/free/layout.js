// -------------------------------------------------------------
//  src/modes/free/layout.js
// -------------------------------------------------------------
/**
 * Builds the Free‑Move DOM tree under #root and returns
 * references to the key dynamic areas so other modules
 * (scene setup, HUD, tab system, …) can mount into them.
 *
 * @returns {{
*   canvasBox: HTMLElement,
*   tabContent: HTMLElement,
*   playbackPanel: HTMLElement,
*   modulePanel: HTMLElement,
*   trajectoryViewer: HTMLElement,
*   staticAnalysis: HTMLElement,
*   warningLog: HTMLElement
* }}
*/
export function buildLayout() {
 //------------------------------------------------------------------
 // 1.  Inject the one‑off style block (if it isn’t there already)
 //------------------------------------------------------------------
 const styleId = 'free-move-layout-styles';
 if (!document.getElementById(styleId)) {
   const style = document.createElement('style');
   style.id = styleId;
   style.textContent = `
   /* --- Global --- */
   body       { margin: 0; font-family: 'Segoe UI', sans-serif; background: #1e1e1e; color: #ddd; }
   .header    {
     background: #252526;
     color: #ffffff;
     padding: 10px 20px;
     text-align: center;
     font-size: 1.2rem;
     font-weight: 500;
     box-shadow: 0 1px 4px rgba(0,0,0,0.6);
   }
 
   .main-container {
     display: grid;
     grid-template-columns: 3fr 1fr;
     grid-template-rows: 2fr auto 1fr;
     gap: 10px;
     height: calc(100vh - 64px);
     
     padding: 25px;
     background: #1e1e1e;
   }
 
   .main-3d-view {
     grid-column: 1 / 2;
     grid-row: 1 / 2;
     background: #2d2d30;
     border: 2px solid #333;
     border-radius: 8px;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 20px;
     color: #bbb;
   }
 
   .tabs-panel {
     grid-column: 2 / 3;
     grid-row: 1 / 3;
     display: flex;
     flex-direction: column;
     background: #2d2d30;
     border: 1px solid #3c3c3c;
     border-radius: 8px;
     overflow: hidden;
   }
 
   .tab-buttons {
     display: flex;
     align-items: flex-end;
     background: #252526;
     height: 36px;
     padding: 0 8px;
     border-bottom: 1px solid #333;
   }
 
   .tab-button {
     padding: 6px 12px;
     margin-right: 6px;
     background: #2d2d30;
     color: #ccc;
     border: none;
     border-top-left-radius: 6px;
     border-top-right-radius: 6px;
     font-size: 13px;
     cursor: pointer;
     transition: background 0.2s, color 0.2s;
   }
 
   .tab-button:hover {
     background: #3c3c3c;
     color: #fff;
   }
 
   .tab-button.active {
     background: #1e1e1e;
     color: #ffffff;
     border-top: 2px solid #569CD6;
   }
 
   .tab-content {
     flex: 1;
     background: #1e1e1e;
     padding: 10px;
     border-radius: 0 0 6px 6px;
     overflow-y: auto;
     color: #ccc;
   }
 
   .playback-panel {
     grid-column: 1 / 2;
     grid-row: 2 / 3;
     background: #2d2d30;
     border: 1px solid #3c3c3c;
     border-radius: 8px;
     height: 60px;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 16px;
     color: #ccc;
   }
 
   .bottom-panels-left {
     grid-column: 1 / 2;
     grid-row: 3 / 4;
     display: flex;
     gap: 10px;
   }
 
   .bottom-panels-right {
     grid-column: 2 / 3;
     grid-row: 3 / 4;
     display: flex;
     flex-direction: column;
     gap: 10px;
   }
 
   .module-panel,
   .trajectory-viewer,
   .static-analysis,
   .warning-log {
     flex: 1;
     background: #2d2d30;
     border: 1px solid #3c3c3c;
     border-radius: 8px;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 16px;
     color: #bbb;
   }
 
   .module-panel:hover,
   .trajectory-viewer:hover,
   .static-analysis:hover,
   .warning-log:hover {
     background: #3a3a3a;
   }
 `;
 
   document.head.appendChild(style);
 }

 //------------------------------------------------------------------
 // 2.  Build the structure
 //------------------------------------------------------------------
 const root = document.getElementById('root');
 root.innerHTML = '';           // wipe whatever was there
 root.className = 'flex-1 w-full overflow-hidden';           // (remove Tailwind flex classes from config)

 /* ---------- header ---------- */
 const header = document.createElement('div');
 header.className = 'header';
 header.textContent = 'FreeMove';
 root.appendChild(header);

 /* ---------- main grid ---------- */
 const grid = document.createElement('div');
 grid.className = 'main-container';
 root.appendChild(grid);

 // 3‑D / THREE.js viewport
 const canvasBox = document.createElement('div');
 canvasBox.className = 'main-3d-view';
 // Placeholder text – will be cleared when SceneManager mounts the renderer
 canvasBox.textContent = 'three JS';
 grid.appendChild(canvasBox);

 // Right‑hand tab stack
 const tabsPanel = document.createElement('div');
 tabsPanel.className = 'tabs-panel';
 grid.appendChild(tabsPanel);

 const tabBtns = document.createElement('div');
 tabBtns.className = 'tab-buttons';
 tabBtns.innerHTML = `
   <button class="tab-button" data-tab="history">history</button>
   <button class="tab-button" data-tab="graph">graph</button>
   <button class="tab-button" data-tab="live">live stats</button>
 `;
 tabsPanel.appendChild(tabBtns);

 const tabContent = document.createElement('div');
 tabContent.className = 'tab-content';
 tabContent.textContent = 'tabs';
 tabsPanel.appendChild(tabContent);

 // Playback bar
 const playbackPanel = document.createElement('div');
 playbackPanel.className = 'playback-panel';
 playbackPanel.textContent = 'playback panel';
 grid.appendChild(playbackPanel);

 // Bottom‑left dual panels
 const bottomLeft = document.createElement('div');
 bottomLeft.className = 'bottom-panels-left';
 grid.appendChild(bottomLeft);

 const modulePanel = document.createElement('div');
 modulePanel.className = 'module-panel';
 modulePanel.textContent = 'module action panel';
 bottomLeft.appendChild(modulePanel);

 const trajectoryViewer = document.createElement('div');
 trajectoryViewer.className = 'trajectory-viewer';
 trajectoryViewer.textContent = 'trajectory viewer';
 bottomLeft.appendChild(trajectoryViewer);

 // Bottom‑right stack
 const bottomRight = document.createElement('div');
 bottomRight.className = 'bottom-panels-right';
 grid.appendChild(bottomRight);

 const staticAnalysis = document.createElement('div');
 staticAnalysis.className = 'static-analysis';
 staticAnalysis.textContent = 'static analysis';
 bottomRight.appendChild(staticAnalysis);

 const warningLog = document.createElement('div');
 warningLog.className = 'warning-log';
 warningLog.textContent = 'warning log';
 bottomRight.appendChild(warningLog);

 //------------------------------------------------------------------
 // 3.  Export the regions we’ll hook into elsewhere
 //------------------------------------------------------------------
 return {
   canvasBox,
   tabContent,
   playbackPanel,
   modulePanel,
   trajectoryViewer,
   staticAnalysis,
   warningLog
 };
}
