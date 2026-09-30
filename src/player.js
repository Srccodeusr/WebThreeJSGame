import * as THREE from 'three';
import {input} from './input.js';
const R=.3,STEP=.36;
// Axis-separated AABB collision with step-up (stairs) and simple gravity.
export class Player{
  constructor(camera,colliders,cfg){this.cam=camera;this.cs=colliders;this.cfg=cfg;this.p=new THREE.Vector3(5.2,0,3.3);this.v=new THREE.Vector3();
    this.yaw=Math.PI/2;this.pitch=0;this.eye=1.6;this.bob=0;this.st=0;this.ground=true;this.onStep=null;}
  blocked(x,z,y,h){for(const c of this.cs){if(c.on===false)continue;
    if(x+R>c.x0&&x-R<c.x1&&z+R>c.z0&&z-R<c.z1&&c.y1>y+STEP&&c.y0<y+h)return true;}return false;}
  groundAt(x,z,y){let g=0;const r=R*.6;for(const c of this.cs){if(c.on===false)continue;
    if(x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1&&c.y1<=y+STEP&&c.y1>g)g=c.y1;}return g;}
  update(dt){
    const k=input,p=this.p,cfg=this.cfg;
    this.yaw-=k.lookX;this.pitch=THREE.MathUtils.clamp(this.pitch-k.lookY*(cfg.invertY?-1:1),-Math.PI/2+.1,Math.PI/2-.1);k.lookX=k.lookY=0;
    const sp=k.crouch?1.5:k.sprint?5.4:3.1,s=Math.sin(this.yaw),c=Math.cos(this.yaw),a=Math.min(1,dt*10),h=k.crouch?1.2:1.7;
    this.v.x+=((-s*k.moveY+c*k.moveX)*sp-this.v.x)*a;this.v.z+=((-c*k.moveY-s*k.moveX)*sp-this.v.z)*a;
    const nx=p.x+this.v.x*dt;if(!this.blocked(nx,p.z,p.y,h))p.x=nx;else this.v.x=0;
    const nz=p.z+this.v.z*dt;if(!this.blocked(p.x,nz,p.y,h))p.z=nz;else this.v.z=0;
    const g=this.groundAt(p.x,p.z,p.y);
    if(k.jump&&this.ground){this.v.y=4.3;navigator.vibrate&&cfg.vibrate&&navigator.vibrate(20);}
    this.v.y-=12*dt;p.y+=this.v.y*dt;
    if(this.v.y>0&&this.blocked(p.x,p.z,p.y,h)){p.y-=this.v.y*dt;this.v.y=0;}
    if(p.y<=g){p.y=g;this.v.y=0;this.ground=true;}else this.ground=false;
    const hs=Math.hypot(this.v.x,this.v.z);this.eye+=((h-.1)-this.eye)*Math.min(1,dt*10);
    if(this.ground)this.bob+=hs*dt*2.2;
    const n=Math.floor(this.bob/Math.PI);if(n!==this.st){this.st=n;if(this.ground&&hs>.5)this.onStep?.();}
    this.cam.position.set(p.x,p.y+this.eye+Math.sin(this.bob)*.02*Math.min(1,hs/3),p.z);
    this.cam.rotation.set(this.pitch,this.yaw,0,'YXZ');
  }
}
