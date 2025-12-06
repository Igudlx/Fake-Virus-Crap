// js/app.js

const virusFile = document.getElementById('virus-file');
const ctx = document.getElementById('context-menu');

let lastClick = 0;

// ✅ DOUBLE CLICK FIX
virusFile.addEventListener('click', () => {
  const now = Date.now();
  if (now - lastClick < 300) {
    launchVirus();
  }
  lastClick = now;
});

// ✅ RIGHT CLICK OPEN FIX
virusFile.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  ctx.style.left = e.pageX + "px";
  ctx.style.top = e.pageY + "px";
  ctx.classList.remove('hidden');
});

document.addEventListener('click', () => {
  ctx.classList.add('hidden');
});

ctx.addEventListener('click', (e) => {
  if (e.target.dataset.action === "open") {
    launchVirus();
  }
});

let launched = false;

function launchVirus() {
  if (launched) return;
  launched = true;

  document.getElementById("hint").style.display = "none";
  document.getElementById("status").textContent = "INFECTED";

  // ✅ THIS IS THE ACTUAL VIRUS START
  startVirus({
    overlaySelector: "#virus-overlay",
    spawnAreaSelector: "#spawn-area",
    desktopSelector: "#desktop-area"
  });
}
