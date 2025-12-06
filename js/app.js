const file = document.getElementById("virus-file");
const ctx = document.getElementById("context-menu");

let lastClick = 0;

file.addEventListener("click",()=>{
  let now = Date.now();
  if(now-lastClick<300){
    start();
  }
  lastClick=now;
});

file.addEventListener("contextmenu",(e)=>{
  e.preventDefault();
  ctx.style.left=e.pageX+"px";
  ctx.style.top=e.pageY+"px";
  ctx.classList.remove("hidden");
});

document.addEventListener("click",()=>ctx.classList.add("hidden"));

ctx.addEventListener("click",(e)=>{
  if(e.target.dataset.action==="open"){
    start();
  }
});

let launched=false;
function start(){
  if(launched) return;
  launched=true;
  document.getElementById("hint").style.display="none";
  document.getElementById("task-status").textContent="INFECTED";
  startVirus();
}
