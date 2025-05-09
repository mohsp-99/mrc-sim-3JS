/****************************************************************
 *  Free‑move mode bootstrap                                    *
 ****************************************************************/
import { buildLayout } from './layout.js';

import { setupScene } from './state/setupScene.js';
import { setupInteractions } from './state/setupInteractions.js';
import { modeState } from './state/modeState.js';

import { mountTabs,        unmountTabs        } from './ui/TabSystem/Tabs.js';
import { mountPlayback,    unmountPlayback    } from './ui/PlaybackPanel.js';
import { mountModulePanel, unmountModulePanel } from './ui/ModulePanel.js';
import { mountTrajectoryViewer,
         unmountTrajectoryViewer             } from './ui/TrajectoryViewer.js';
import { mountStaticAnalysis,
         unmountStaticAnalysis               } from './ui/StaticAnalysis.js';
import { mountWarningLog, unmountWarningLog   } from './ui/WarningLog.js';

import SceneManager from '../../core/SceneManager.js';
import { setMode } from '../../core/AppState.js';

import { mountModules,  unmountModules }        from './logic/ModuleRenderer.js';

import { mountHomeButton, unmountHomeButton } from '@/modes/free/ui/HomeButton.js';

export function init() {
  /* ---------- layout ---------- */
  const regions = buildLayout();          // returns refs to all panels

  /* ---------- 3‑D scene ---------- */
  const { camera, controls } = setupScene(regions.canvasBox);
  mountModules();
  /* ---------- interactions ---------- */
  const { keyListener } = setupInteractions(camera, controls);
  modeState.keyLsnr = keyListener;

  /* ---------- UI widgets ---------- */
  mountTabs(regions.tabContent);
  mountPlayback(regions.playbackPanel);
  mountModulePanel(regions.modulePanel);
  mountTrajectoryViewer(regions.trajectoryViewer);
  mountStaticAnalysis(regions.staticAnalysis);
  mountWarningLog(regions.warningLog);
  mountHomeButton();

  /* ---------- book‑keeping ---------- */
  setMode('free');
  console.log('[Free‑move] initialised');
}

export function destroy() {
  /* remove listeners */
  document.removeEventListener('keydown', modeState.keyLsnr);

  /* unmount UI */
  unmountTabs();
  unmountPlayback();
  unmountModulePanel();
  unmountTrajectoryViewer();
  unmountStaticAnalysis();
  unmountWarningLog();
  unmountModules();
  unmountHomeButton();

  modeState.resizeObs?.disconnect();
  window.removeEventListener('resize', modeState.winResize);

  /* clear DOM */
  const root = document.getElementById('root');
  root.innerHTML = '';
  root.className = '';
  SceneManager.dispose?.();             // optional – if you added dispose()
  console.log('[Free‑move] destroyed');
}
