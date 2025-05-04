// src/modes/goal/index.js

import { navigate } from "../../router";

export function init() {
    alert('⚠️ Goal-Based Movement Mode is not yet implemented.');
    navigate('home');
  }
  
  export function destroy() {
    const root = document.getElementById('root');
    root.innerHTML = '';
    root.classList.remove('items-center', 'justify-center');
  }
  