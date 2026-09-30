import * as THREE from 'three';
import {input,initInput,buzz} from './input.js';
import {Player} from './player.js';
import {buildWorld} from './world.js';
import {buildCity} from './city.js';
import {buildPeople} from './people.js';
import {buildTraffic} from './traffic.js';
import {makeLighting} from './lighting.js';
import {initUI,cfg} from './ui.js';
import {Debug,applyQuality} from './performance.js';
import {AudioManager} from './audio.js';

const $=id=>document.getElementById(id),canvas=$('c'),mobile=input.isTouch;
const bar=(p,t)=>{$('lbar').style.width=p+'%';$('lpct').textContent=p+'%';if(t)$('ltxt').textContent=t;};
const yieldFrame=()=>new Promise(r=>setTimeout(r,16));
addEventListener('error',e=>{$('ltxt').textContent='Error: '+e.message;});
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance'});}
catch(e){$('ltxt').textContent='WebGL is not available in this browser.';throw e;}
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(72,1,.05,900),audio=new AudioManager(),ray=new THREE.Raycaster();ray.far=2.6;
let world,city,people,traffic,lit,player,ui,dbg,playing=false,target=null;

function syncTouch(){
  $('touch').classList.toggle('hidden',!(mobile&&cfg.showControls&&playing));$('bCrouch').classList.toggle('hidden',!cfg.crouchBtn);
  $('hud').classList.toggle('hidden',!playing&&!dbg?.el.textContent);
}
function setTime(){const n=lit.setTime(cfg.time,cfg.rain);lit.rain.obj.visible=cfg.rain;world.setNight(n);city.setNight(n);city.tint(scene.background);traffic?.setNight(n);}
const quality=()=>applyQuality(cfg.quality,{renderer,sun:lit.sun,city},mobile);
function onChange(k){if(k==='quality')quality();else if(k==='time'||k==='rain')setTime();else syncTouch();}
function play(){audio.start();playing=true;ui.hide();$('hud').classList.remove('hidden');if(!mobile)canvas.requestPointerLock?.();syncTouch();}
function pause(){playing=false;ui.show(true);syncTouch();}
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&playing&&!mobile)pause();});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

(async()=>{
  bar(5,'Player & input');initInput(cfg);ui=initUI({onPlay:play,onChange});$('bMenu').onclick=pause;await yieldFrame();
  lit=makeLighting(scene,mobile?700:1800);bar(15,'Large Bengali apartment');await yieldFrame();
  world=buildWorld(scene);player=new Player(camera,world.colliders,cfg);player.p.set(4.2,0,2.25);player.onStep=()=>audio.step();bar(48,'Roads, trams & neighbourhood');await yieldFrame();
  city=buildCity(scene);bar(67,'People & family gathering');await yieldFrame();
  people=buildPeople(scene,world.hall,[],mobile,audio);traffic=buildTraffic(scene,mobile,audio);bar(82,'Traffic & city ambience');await yieldFrame();
  city.addFar();dbg=new Debug(renderer,scene,world.colliders,$('hud'),$('dbg'));
  quality();setTime();dispatchEvent(new Event('resize'));bar(100,'Ready');await yieldFrame();
  $('loading').classList.add('hidden');ui.show(false);animate();
})().catch(e=>{console.error(e);$('ltxt').textContent='Failed to start: '+e.message;});

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);input.poll();
  if(playing){
    player.update(dt);ray.setFromCamera(new THREE.Vector2(0,0),camera);
    const h=ray.intersectObjects(world.hit,false)[0];target=h?h.object.userData.it:null;
    $('prompt').textContent='Press E — '+(target?.label||'');$('prompt').classList.toggle('hidden',!target);$('bE').classList.toggle('hidden',!(target&&mobile));
    if(input.interact){input.interact=false;if(target){target.use();audio.click();buzz(cfg);}}
  }else input.interact=false;
  world.update(dt,player.p);people?.update(dt);traffic?.update(dt,camera.position);lit.update(dt,camera.position);
  renderer.render(scene,camera);dbg?.tick(dt);
}
