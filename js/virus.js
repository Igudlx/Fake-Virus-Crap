function startVirus(){

  // SHAKE SCREEN
  setInterval(()=>{
    document.body.style.transform=`translate(${Math.random()*20-10}px,${Math.random()*20-10}px)`;
  },50);

  // INVERT COLORS
  setInterval(()=>{
    document.body.style.filter=Math.random()>.5?"invert(1)":"invert(0)";
  },300);

  // SPAWN ERROR WINDOWS
  setInterval(()=>{
    let w=document.createElement("div");
    w.className="virus-window glitch";
    w.style.left=Math.random()*(innerWidth-300)+"px";
    w.style.top=Math.random()*(innerHeight-160)+"px";
    w.innerText="ERROR 0x"+Math.floor(Math.random()*999999)+"\nDeleting System32...\nAccess Denied";
    document.getElementById("spawn-area").appendChild(w);
    setTimeout(()=>w.remove(),3000);
  },200);

  // RANDOM BSOD
  setInterval(()=>{
    if(Math.random()>.7){
      let b=document.createElement("div");
      b.className="bsod";
      b.innerHTML="<h1>:(</h1><p>Windows has encountered a fatal error</p>";
      document.body.appendChild(b);
      setTimeout(()=>b.remove(),3000);
    }
  },6000);

  // AUDIO BEEPS
  let ctx=new AudioContext();
  setInterval(()=>{
    let o=ctx.createOscillator();
    o.frequency.value=200+Math.random()*2000;
    o.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime+0.05);
  },300);

  // CURSOR CHAOS
  document.body.style.cursor="none";
}

window.startVirus=startVirus;
