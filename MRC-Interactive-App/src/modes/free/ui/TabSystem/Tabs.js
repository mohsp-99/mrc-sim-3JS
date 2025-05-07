/****************************************************************
 *  src/modes/free/ui/TabSystem/Tabs.js
 *  Simple tab multiplexer – shows one of three sub‑tabs at a time
 ****************************************************************/

import { mount as mountHistory, unmount as unmountHistory } from './HistoryTab.js';
import { mount as mountGraph,   unmount as unmountGraph   } from './GraphTab.js';
import { mount as mountLive,    unmount as unmountLive    } from './LiveStatsTab.js';

let containers = {};      // { history|graph|live : HTMLElement }
let current    = null;    // currently‑visible tab name
let btnLsnrs   = [];      // [{ btn, lsnr }]
let buttons    = [];      // cached <button> elements

/** Mounts the tab strip into the given .tab-content element */
export function mountTabs(tabContentEl) {
  // ------------------------------------------------------------
  // 1.  Create one inner div per tab and mount sub‑modules there
  // ------------------------------------------------------------
  ['history', 'graph', 'live'].forEach(name => {
    const div = document.createElement('div');
    Object.assign(div.style, {
      width: '100%',
      height: '100%',
      display: 'none'
    });
    tabContentEl.appendChild(div);
    containers[name] = div;
  });

  mountHistory(containers.history);
  mountGraph(containers.graph);
  mountLive(containers.live);

  // ------------------------------------------------------------
  // 2.  Hook up the buttons declared in layout.js (data‑tab attr)
  // ------------------------------------------------------------
  buttons = [...tabContentEl.parentElement.querySelectorAll('[data-tab]')];
  buttons.forEach(btn => {
    const name = btn.getAttribute('data-tab');   // history / graph / live
    const lsnr = () => switchTo(name);
    btn.addEventListener('click', lsnr);
    btnLsnrs.push({ btn, lsnr });
  });

  // ------------------------------------------------------------
  // 3.  Default tab
  // ------------------------------------------------------------
  switchTo('history');
}

/** Switch to the requested tab name */
function switchTo(name) {
  if (current === name) return;

  // hide old
  if (current) containers[current].style.display = 'none';

  // show new
  containers[name].style.display = 'block';

  // update button UI (VS‑Code style)
  buttons.forEach(btn =>
    btn.classList.toggle('active', btn.getAttribute('data-tab') === name)
  );

  current = name;
}

/** Detach listeners and unmount everything */
export function unmountTabs() {
  // remove listeners
  btnLsnrs.forEach(({ btn, lsnr }) => btn.removeEventListener('click', lsnr));
  btnLsnrs = [];
  buttons  = [];

  // unmount children
  unmountHistory();
  unmountGraph();
  unmountLive();

  // remove containers
  Object.values(containers).forEach(el => el.remove());
  containers = {};
  current = null;
}
