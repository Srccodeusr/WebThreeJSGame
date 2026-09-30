// Unified input state: desktop and touch both write here; the player only reads this.
export const input={moveX:0,moveY:0,lookX:0,lookY:0,jump:false,interact:false,sprint:false,crouch:false,poll:null,
  isTouch:'ontouchstart' in window||navigator.maxTouchPoints>0};
export const buzz=(cfg,ms=20)=>cfg.vibrate&&navigator.vibrate?.(ms);

export function initInput(cfg){
  const kb={},t={x:0,y:0,sprint:false,jump:false,crouch:false};
  addEventListener('keydown',e=>{kb[e.code]=true;if(!e.repeat&&e.code==='KeyE')input.interact=true;if(e.code==='Space')e.preventDefault();});
  addEventListener('keyup',e=>{kb[e.code]=false;});
  addEventListener('blur',()=>{for(const k in kb)kb[k]=false;});
  document.addEventListener('mousemove',e=>{if(document.pointerLockElement){input.lookX+=e.movementX*.0022*cfg.camSens;input.lookY+=e.movementY*.0022*cfg.camSens;}});
  input.poll=()=>{
    let x=(kb.KeyD?1:0)-(kb.KeyA?1:0)+t.x,y=(kb.KeyW?1:0)-(kb.KeyS?1:0)+t.y;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}
    input.moveX=x;input.moveY=y;input.sprint=!!(kb.ShiftLeft||kb.ShiftRight)||t.sprint;
    input.jump=!!kb.Space||t.jump;input.crouch=!!(kb.KeyC||kb.ControlLeft)||t.crouch;};
  if(!input.isTouch)return;
  const $=id=>document.getElementById(id);
  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('gesturestart',e=>e.preventDefault());
  const zone=$('stickZone'),base=$('stickBase'),knob=$('stickKnob');let sid=null,ox=0,oy=0;
  zone.onpointerdown=e=>{if(sid!==null)return;sid=e.pointerId;zone.setPointerCapture(sid);ox=e.clientX;oy=e.clientY;const s=cfg.stickSize;
    base.style.cssText=`left:${ox-s/2}px;top:${oy-s/2}px;width:${s}px;height:${s}px;opacity:1`;};
  zone.onpointermove=e=>{if(e.pointerId!==sid)return;const R=cfg.stickSize/2;let dx=e.clientX-ox,dy=e.clientY-oy;const d=Math.hypot(dx,dy),m=Math.min(d,R);
    if(d>0){dx*=m/d;dy*=m/d;}knob.style.transform=`translate(${dx}px,${dy}px)`;const r=m/R;
    if(r<.12){t.x=t.y=0;t.sprint=false;return;}
    const mag=Math.min(1,(r-.12)/.88*cfg.stickSens);t.x=dx/m*mag;t.y=-dy/m*mag;t.sprint=cfg.autoSprint&&r>.92;};
  zone.onpointerup=zone.onpointercancel=e=>{if(e.pointerId!==sid)return;sid=null;t.x=t.y=0;t.sprint=false;knob.style.transform='';base.style.cssText='';};
  const look=$('look');let lid=null,lx=0,ly=0;
  look.onpointerdown=e=>{if(lid!==null)return;lid=e.pointerId;look.setPointerCapture(lid);lx=e.clientX;ly=e.clientY;};
  look.onpointermove=e=>{if(e.pointerId!==lid)return;input.lookX+=(e.clientX-lx)*.0025*cfg.camSens;input.lookY+=(e.clientY-ly)*.0025*cfg.camSens;lx=e.clientX;ly=e.clientY;};
  look.onpointerup=look.onpointercancel=e=>{if(e.pointerId===lid)lid=null;};
  const hold=(id,on,off=()=>{})=>{const b=$(id);b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);on();};b.onpointerup=b.onpointercancel=off;};
  hold('bJump',()=>{t.jump=true;},()=>{t.jump=false;});
  hold('bE',()=>{input.interact=true;});
  hold('bCrouch',()=>{t.crouch=!t.crouch;$('bCrouch').style.background=t.crouch?'#fff6':'';});
}
