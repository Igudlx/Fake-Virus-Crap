// js/app.js
// Sets up the desktop interactions and wires the virus launcher.

import { startVirus } from './virus.js';

(function(){
  // Basic DOM shortcuts
  const virusFile = document.getElementById('virus-file');
  const ctx = document.getElementById('context-menu');
  const spawnArea = document.getElementById('spawn-area');

  // Double-click to open
  let lastClick = 0;
  virusFile.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClick < 300) {
      // double click detected
      launch();
    }
    lastClick = now;
  });

  // keyboard open (Enter)
  virusFile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') launch();
  });

  // Right click show custom menu
  virusFile.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ctx.style.left = `${e.pageX}px`;
    ctx.style.top = `${e.pageY}px`;
    ctx.classList.remove('hidden');
    document.addEventListener('click', hideCtxOnce);
  });

  function hideCtxOnce() {
    ctx.classList.add('hidden');
    document.removeEventListener('click', hideCtxOnce);
  }

  // context menu actions
  ctx.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (!action) return;
    ctx.classList.add('hidden');
    if (action === 'open') launch();
    if (action === 'properties') alert('File: virus.exe\nType: Application\nSize: 1337 KB\nCreated: 2077-10-10');
  });

  // Launch function that calls the virus module
  let launched = false;
  function launch(){
    if (launched) return;
    launched = true;
    document.getElementById('hint').classList.add('hidden');
    // update status
    document.getElementById('status').textContent = 'Infected';
    // run the virus simulation
    startVirus({
      overlaySelector: '#virus-overlay',
      spawnAreaSelector: '#spawn-area',
      desktopSelector: '#desktop-area'
    });
  }

  // small accessibility: Enter when focused
  virusFile.setAttribute('role','button');
})();
