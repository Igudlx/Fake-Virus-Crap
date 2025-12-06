// js/virus.js

function startVirus(opts = {}) {

export function startVirus(opts = {}) {
  const overlay = document.querySelector(opts.overlaySelector || '#virus-overlay');
  const spawnArea = document.querySelector(opts.spawnAreaSelector || '#spawn-area');
  const desktop = document.querySelector(opts.desktopSelector || '#desktop-area');

  // high-level state
  const state = {
    intervals: [],
    timeouts: [],
    running: true,
    audioCtx: null,
    masterGain: null,
  };

  // Make overlay block pointer events (so site becomes "unstoppable")
  overlay.style.pointerEvents = 'auto';
  overlay.classList.remove('hidden');

  // Add corrupt visual overlay
  const corrupt = document.createElement('div');
  corrupt.className = 'corrupt-overlay';
  corrupt.style.mixBlendMode = 'difference';
  document.body.appendChild(corrupt);

  // Start audio chaos (synth pulses)
  startAudio();
  // Start visual effects
  startGlitches();
  spawnPeriodicWindows();
  spawnIconsAndRain();
  startCursorInsanity();
  startBSODTimer();
  startGibberishStream();
  floodTheDesktop();

  // visually distort the desktop gradually
  state.intervals.push(setInterval(()=> {
    document.body.style.filter = `hue-rotate(${Math.random()*360}deg) contrast(${1+Math.random()*1.6})`;
  }, 800));

  // play occasional scream-ish beep sequences
  state.intervals.push(setInterval(()=> {
    toneSequence([200,340,560,120], [120,80,60,140]);
  }, 9500));

  // utility: track intervals/timeouts for cleanup on refresh (not needed; page refresh clears)
  function addInterval(id){ state.intervals.push(id) }
  function addTimeout(id){ state.timeouts.push(id) }

  // --- AUDIO FUNCTIONS ---
  function startAudio(){
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      state.audioCtx = ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      gain.connect(ctx.destination);
      state.masterGain = gain;

      // low rumble oscillator cluster
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 55;
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.value = 110;
      const gain1 = ctx.createGain(); gain1.gain.value = 0.02;
      osc1.connect(gain1); osc2.connect(gain1); gain1.connect(gain);
      osc1.start(); osc2.start();

      // add periodic high-pitched stutters
      state.intervals.push(setInterval(()=> {
        const o = ctx.createOscillator();
        o.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
        o.frequency.value = 600 + Math.random()*2400;
        const g = ctx.createGain();
        g.gain.value = 0.06;
        o.connect(g); g.connect(gain);
        o.start();
        setTimeout(()=>{ o.stop(); o.disconnect(); }, 180 + Math.random()*600);
      }, 700 + Math.random()*1400));
    } catch (e) {
      // audio not available: ignore
      console.warn('Audio failed:', e);
    }
  }

  function tone(freq, duration=200, volume=0.06) {
    if (!state.audioCtx) return;
    const ctx = state.audioCtx;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = volume;
    o.connect(g); g.connect(state.masterGain);
    o.start();
    setTimeout(()=>{ o.stop(); o.disconnect(); }, duration);
  }

  function toneSequence(freqs, durs) {
    let t=0;
    for (let i=0;i<freqs.length;i++){
      setTimeout(()=> tone(freqs[i], durs[i]||120, 0.08), t);
      t += (durs[i]||120);
    }
  }

  // --- GLITCHES & VISUAL EFFECTS ---
  function startGlitches(){
    // periodically add random CSS transforms
    addInterval(setInterval(()=> {
      const el = document.body;
      el.style.transform = `translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*10}px) rotate(${(Math.random()-0.5)*2}deg)`;
      setTimeout(()=> el.style.transform = '', 220);
    }, 250));

    // color invert flashes
    addInterval(setInterval(()=> {
      document.documentElement.style.filter = Math.random()>0.6 ? 'invert(1) hue-rotate(180deg)' : '';
    }, 800));
  }

  // spawn chaotic windows
  function spawnPeriodicWindows(){
    addInterval(setInterval(()=> {
      spawnVirusWindow();
    }, 1200));
    // spawn some immediately
    for (let i=0;i<3;i++) spawnVirusWindow();
  }

  function spawnVirusWindow(){
    const w = document.createElement('div');
    w.className = 'virus-window glitch';
    const x = Math.random()*(window.innerWidth-320);
    const y = Math.random()*(window.innerHeight-180);
    w.style.left = `${x}px`;
    w.style.top = `${y}px`;
    w.style.zIndex = 900 + Math.floor(Math.random()*1000);

    // content: random 'error' gibberish and fake stack traces
    const header = document.createElement('div');
    header.textContent = 'Error: process terminated unexpectedly';
    header.style.fontWeight = '700';
    header.style.marginBottom = '6px';
    header.style.color = '#ff7b7b';

    const body = document.createElement('div');
    body.className = 'gib';
    body.textContent = makeGibberishBlock();

    w.appendChild(header);
    w.appendChild(body);

    // clicking a window creates a ripple of more windows
    w.addEventListener('click', ()=> {
      for (let i=0;i<4;i++){
        setTimeout(spawnVirusWindow, i*80);
      }
      tone(450 + Math.random()*600, 120, 0.06);
    });

    spawnArea.appendChild(w);

    // animate / drift
    const drift = setInterval(()=> {
      if (!document.body.contains(w)) { clearInterval(drift); return; }
      w.style.left = `${parseFloat(w.style.left.replace('px','')) + (Math.random()-0.5)*10}px`;
      w.style.top = `${parseFloat(w.style.top.replace('px','')) + (Math.random()-0.5)*6}px`;
    }, 200);
    addInterval(drift);

    // auto remove occasionally (but spawn keeps coming)
    setTimeout(()=> {
      if (w.parentNode) w.parentNode.removeChild(w);
    }, 10000 + Math.random()*15000);
  }

  // --- BSOD (fake Blue Screen) ---
  function startBSODTimer(){
    // trigger a BSOD after a short random interval, then occasionally
    const t = setTimeout(()=> {
      triggerBSOD();
      // occasionally come back
      addInterval(setInterval(()=> {
        if (Math.random() > 0.6) triggerBSOD();
      }, 25000 + Math.random()*30000));
    }, 5000 + Math.random()*6000);
    addTimeout(t);
  }

  function triggerBSOD(){
    // create bsod element
    const bs = document.createElement('div');
    bs.className = 'bsod';
    bs.innerHTML = `<h1>:(</h1><p>Your system ran into a problem and needs to restart.<br/>Error code: VIRUS_SIM_0xDEADBEEF<br/>Collecting crash dump... 0% complete</p>`;
    document.body.appendChild(bs);
    toneSequence([120,90,70], [200,200,400]);

    // after some seconds, simulate "reboot" by removing BSOD and adding heavy distortion
    setTimeout(()=> {
      bs.querySelector('p').textContent = 'Dump complete. Restarting...';
      setTimeout(()=> {
        if (bs.parentNode) bs.parentNode.removeChild(bs);
        // flash full-screen scramble
        fullFlash();
      }, 2000 + Math.random()*1600);
    }, 2500 + Math.random()*5000);
  }

  function fullFlash(){
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = 0;
    flash.style.background = '#fff';
    flash.style.zIndex = 11000;
    flash.style.mixBlendMode = 'screen';
    document.body.appendChild(flash);
    setTimeout(()=> {
      document.body.removeChild(flash);
      // create temporary 'corruption noise' sprites
      for (let i=0;i<40;i++){
        const s = document.createElement('div');
        s.style.position='fixed';
        s.style.left = `${Math.random()*100}%`;
        s.style.top = `${Math.random()*100}%`;
        s.style.width = `${10+Math.random()*120}px`;
        s.style.height = `${2+Math.random()*12}px`;
        s.style.background = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${0.12+Math.random()*0.48})`;
        s.style.zIndex = 10900;
        s.style.transform = `rotate(${Math.random()*180}deg)`;
        document.body.appendChild(s);
        setTimeout(()=> s.remove(), 900 + Math.random()*2300);
      }
    }, 140 + Math.random()*120);
  }

  // --- Cursor effects ---
  function startCursorInsanity(){
    // Create a fake cursor that trails the real cursor and jitters
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = '0px';
    trail.style.top = '0px';
    trail.style.width = '22px';
    trail.style.height = '22px';
    trail.style.borderRadius = '50%';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = 12000;
    trail.style.background = 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.2))';
    document.body.appendChild(trail);

    window.addEventListener('mousemove', (e)=>{
      trail.style.left = `${e.clientX + (Math.random()-0.5)*12}px`;
      trail.style.top = `${e.clientY + (Math.random()-0.5)*12}px`;
    });

    // occasionally hide the native cursor
    document.body.style.cursor = 'none';
    addTimeout(setTimeout(()=> {
      // never restore automatically
    }, 1000));
  }

  // --- Desktop flood, icons and rain ---
  function spawnIconsAndRain(){
    addInterval(setInterval(()=> {
      const icon = document.createElement('div');
      icon.className = 'file-icon';
      icon.style.position = 'fixed';
      icon.style.left = `${Math.random()*92}%`;
      icon.style.top = `-${Math.random()*40 + 30}px`;
      icon.style.zIndex = 8000;
      icon.innerHTML = `<div class="icon-image">💥</div><div class="icon-label">file_${Math.floor(Math.random()*999)}.dat</div>`;
      document.body.appendChild(icon);
      // drop animation
      const fall = setInterval(()=> {
        const cur = parseFloat(icon.style.top.replace('px','')) || 0;
        icon.style.top = `${cur + 6 + Math.random()*18}px`;
        icon.style.left = `${parseFloat(icon.style.left) + (Math.random()-0.5)*3}%`;
        if (cur > window.innerHeight + 60) {
          icon.remove();
          clearInterval(fall);
        }
      }, 60);
      addInterval(fall);
      // small pop tone
      tone(220 + Math.random()*600, 80, 0.03);
    }, 120));
  }

  // --- Gibberish / console spam ---
  function startGibberishStream(){
    addInterval(setInterval(()=> {
      // create a quick text streak
      const t = document.createElement('div');
      t.className = 'gib';
      t.style.position = 'fixed';
      t.style.right = `${Math.random()*30 + 10}px`;
      t.style.top = `${Math.random()*80 + 10}px`;
      t.style.zIndex = 9000;
      t.style.background = 'rgba(0,0,0,0.3)';
      t.style.padding = '6px';
      t.style.borderRadius = '6px';
      t.textContent = makeGibberishBlock(4 + Math.floor(Math.random()*12));
      document.body.appendChild(t);
      setTimeout(()=> t.remove(), 3000 + Math.random()*4000);
      tone(480 + Math.random()*1200, 60, 0.03);
    }, 420));
  }

  // --- Flood desktop with 'deleted files' messages (visual only) ---
  function floodTheDesktop(){
    addInterval(setInterval(()=> {
      const f = document.createElement('div');
      f.className = 'virus-window';
      f.style.left = `${Math.random()*(window.innerWidth-260)}px`;
      f.style.top = `${Math.random()*(window.innerHeight-120)}px`;
      f.style.zIndex = 9500;
      f.innerHTML = `<div style="color:#ffb3b3;font-weight:700">Deleting: C:\\Users\\Public\\Documents\\${randomFilename()}</div>
                     <div class="gib">${makeGibberishBlock(2)}</div>`;
      spawnArea.appendChild(f);
      setTimeout(()=> f.remove(), 3000 + Math.random()*9000);
      tone(150 + Math.random()*600, 90, 0.05);
    }, 900));
  }

  // --- Helper: gibberish text generator ---
  function makeGibberishBlock(lines = 10){
    const pieces = [];
    for (let i=0;i<lines;i++){
      pieces.push(generateLine());
    }
    return pieces.join('\n');
  }

  function generateLine(){
    const parts = ['ERR','0x', 'segfault', 'stack', 'fatal', 'mem', 'corrupt', 'IO', 'nullref', 'panic', 'overflow', '🔥', '§', '|'];
    let s = '';
    const n = 6 + Math.floor(Math.random()*18);
    for (let i=0;i<n;i++){
      if (Math.random() > 0.7) s += parts[Math.floor(Math.random()*parts.length)] + (Math.random()>0.6 ? ' ' : '_');
      else s += randomHexChunk();
    }
    return s;
  }

  function randomHexChunk(){ return Math.floor(Math.random()*0xFFFF).toString(16).padStart(4,'0') }

  function randomFilename(){
    const ext = ['doc', 'dat', 'sys', 'dll', 'exe', 'tmp'];
    return `${['secret','passwords','config','wallet','notes'][Math.floor(Math.random()*5)]}_${Math.floor(Math.random()*9999)}.${ext[Math.floor(Math.random()*ext.length)]}`;
  }

  // --- Utility: create big text corruption in the center occasionally ---
  addInterval(setInterval(()=> {
    const c = document.createElement('div');
    c.style.position = 'fixed';
    c.style.left = '50%';
    c.style.top = '50%';
    c.style.transform = 'translate(-50%,-50%)';
    c.style.zIndex = 12000;
    c.style.fontSize = `${60 + Math.random()*120}px`;
    c.style.fontFamily = 'fantasy, monospace';
    c.style.pointerEvents = 'none';
    c.style.opacity = 0.9;
    c.textContent = ['SYSTEM FAILURE','CORRUPTION','VIRUS','0xDEAD'][Math.floor(Math.random()*4)];
    c.className = 'glitch';
    document.body.appendChild(c);
    setTimeout(()=> c.remove(), 1200 + Math.random()*2200);
    tone(160 + Math.random()*600, 120 + Math.random()*360, 0.12);
  }, 6500));

  // -------------------------------
  // NOTE: We purposely DO NOT provide a 'stop' function here. The point of the
  // simulation is that it keeps going until the page is refreshed or closed.
  // -------------------------------

  // small helper wrappers for tracking
  function addInterval(i){ state.intervals.push(i) }
  function addTimeout(i){ state.timeouts.push(i) }

  // Prevent developer tools accidental clicks by making overlay full transparent but on top.
  overlay.style.background = 'transparent';
  overlay.style.zIndex = 9997;
  overlay.style.pointerEvents = 'auto';

  console.log('Virus simulation started — refresh the page to stop.');

  // Helper functions used above are defined below (some duplicates kept for closure safety).
  function makeGibberishBlock(lines = 8){
    const res = [];
    for (let i=0;i<lines;i++){
      res.push(generateLine());
    }
    return res.join('\n');
  }
  function generateLine(){
    const parts = ['ERR','0x', 'segfault', 'stack', 'fatal', 'mem', 'corrupt', 'IO', 'nullref', 'panic', 'overflow', '🔥', '§', '|'];
    let s = '';
    const n = 6 + Math.floor(Math.random()*18);
    for (let i=0;i<n;i++){
      if (Math.random() > 0.7) s += parts[Math.floor(Math.random()*parts.length)] + (Math.random()>0.6 ? ' ' : '_');
      else s += randomHexChunk();
    }
    return s;
  }
  function randomHexChunk(){ return Math.floor(Math.random()*0xFFFF).toString(16).padStart(4,'0') }

  // expose nothing — simulation intentionally persistent
}
window.startVirus = startVirus;
