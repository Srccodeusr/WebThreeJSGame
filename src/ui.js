import {input} from './input.js';
const KEY='kolkata-apartment-cfg';
const def={quality:input.isTouch?'LOW':'HIGH',time:1,rain:false,camSens:1,stickSens:1,stickSize:130,autoSprint:true,invertY:false,vibrate:true,showControls:true,crouchBtn:false};
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}');}catch{}
export const cfg={...def,...saved};
const t=input.isTouch;
const S=[['quality','Graphics'+(t?' (Mobile)':''),'sel',t?['LOW','MEDIUM','HIGH']:['LOW','MEDIUM','HIGH','ULTRA']],
  ['time','Time of day','sel',['Morning','Afternoon','Sunset','Night']],['rain','Rain','chk'],['camSens','Camera sensitivity','rng',.4,2.5,.05],['invertY','Invert Y','chk'],
  ...(t?[['stickSens','Joystick sensitivity','rng',.6,1.4,.05],['stickSize','Joystick size','rng',90,200,5],['autoSprint','Auto sprint','chk'],['vibrate','Vibration','chk'],
  ['showControls','Show mobile controls','chk'],['crouchBtn','Crouch button','chk']]:[])];

export function initUI({onPlay,onChange}){
  const $=id=>document.getElementById(id),menu=$('menu'),panel=$('panel');
  for(const [k,label,type,a,b,step] of S){
    const l=document.createElement('label');l.textContent=label;let i;
    if(type==='sel'){i=document.createElement('select');a.forEach((o,n)=>i.add(new Option(o,k==='time'?n:o)));i.value=cfg[k];}
    else{i=document.createElement('input');i.type=type==='chk'?'checkbox':'range';if(type==='rng'){i.min=a;i.max=b;i.step=step;i.value=cfg[k];}else i.checked=cfg[k];}
    i.onchange=i.oninput=()=>{cfg[k]=type==='chk'?i.checked:(k==='time'||type==='rng')?+i.value:i.value;
      try{localStorage.setItem(KEY,JSON.stringify(cfg));}catch{}onChange(k);};
    panel.append(l,i);
  }
  const mk=(txt,f)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=f;$('menuBtns').append(b);return b;};
  const play=mk('PLAY',onPlay);mk('SETTINGS',()=>panel.classList.toggle('hidden'));mk('EXIT',()=>{window.close();location.href='about:blank';});
  return{show(paused){menu.classList.remove('hidden');play.textContent=paused?'RESUME':'PLAY';},hide(){menu.classList.add('hidden');panel.classList.add('hidden');}};
}
