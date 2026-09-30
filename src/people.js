import * as THREE from 'three';
import {STREETS} from './city.js';
const SHIRT=[0xc0392b,0xe6b800,0x2e7d5b,0x2e5fa8,0xf2efe6,0xb0428f,0xe07a2f,0x6a4c93],SKIN=[0x8d5a3b,0xa9714b,0x6f4630,0xc08a62],LEG=[0x222a3a,0x3a3a3a,0x4a3b2a,0x1d2b45];
export function buildPeople(scene,hallGroup,chairs,mobile,audio){
  let s=99;const rnd=()=>((s=(s*16807)%2147483647)/2147483647),pick=a=>a[Math.floor(rnd()*a.length)];
  const hall=[],street=[],N=mobile?22:42;
  for(const c of chairs.slice(0,mobile?8:14))hall.push({x:c.x,z:c.z,y:0,k:.85+rnd()*.2,seated:true});
  for(let i=0;i<8;i++)hall.push({x:1+rnd()*9,z:1+rnd()*8,y:0,k:.85+rnd()*.2,walk:true,speed:.65+rnd()*.5,ph:rnd()*6});
  for(let i=0;i<N;i++){const axis=rnd()<.5?'z':'x',st=axis==='z'?pick(STREETS.xs):pick(STREETS.zs);street.push({axis,st:st+(rnd()<.5?-3.2:3.2),dir:rnd()<.5?1:-1,pos:-65+rnd()*130,k:.75+rnd()*.25,speed:.7+rnd()*1.1,ph:rnd()*6});}
  const geo=[new THREE.CylinderGeometry(.11,.1,1,7),new THREE.CylinderGeometry(.2,.22,1,7),new THREE.SphereGeometry(1,8,6)];
  const make=(list,parent)=>{const ms=geo.map(g=>{const o=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial(),list.length);o.frustumCulled=false;o.castShadow=true;parent.add(o);return o;});
    list.forEach((p,i)=>{ms[0].setColorAt(i,new THREE.Color(pick(LEG)));ms[1].setColorAt(i,new THREE.Color(pick(SHIRT)));ms[2].setColorAt(i,new THREE.Color(pick(SKIN)));});return{ms,list,count:list.length};};
  const H=make(hall,hallGroup),S=make(street,scene),D=new THREE.Object3D();let t=0,foot=0;
  const put=(set,i,p)=>{const k=p.k,lh=(p.seated?.45:.8)*k,w=p.walk?Math.abs(Math.sin(t*p.speed*4+p.ph))*.04:0;D.position.set(p.x,p.y+lh/2+w,p.z);D.scale.set(k,lh,k);D.updateMatrix();set.ms[0].setMatrixAt(i,D.matrix);D.position.y=p.y+lh+.325*k+w;D.scale.set(k,.65*k,k);D.updateMatrix();set.ms[1].setMatrixAt(i,D.matrix);D.position.y=p.y+lh+.78*k+w;D.scale.set(.13*k,.13*k,.13*k);D.updateMatrix();set.ms[2].setMatrixAt(i,D.matrix);};
  return{setDetail(f){S.count=Math.floor(street.length*(.45+.55*f));},update(dt){t+=dt;for(const p of hall)if(p.walk){p.x+=Math.cos(t+p.ph)*p.speed*dt*.25;p.z+=Math.sin(t*.7+p.ph)*p.speed*dt*.25;if(p.x<.4)p.x=.4;if(p.x>13.6)p.x=13.6;if(p.z<.4)p.z=.4;if(p.z>9.6)p.z=9.6;}
    for(const p of street){p.pos+=p.dir*p.speed*dt;if(p.pos>70)p.pos=-70;if(p.pos<-70)p.pos=70;p.x=p.axis==='z'?p.st:p.pos;p.z=p.axis==='z'?p.pos:p.st;}
    for(const set of [H,S]){for(let i=0;i<set.count;i++)put(set,i,set.list[i]);for(const m of set.ms){m.count=set.count;m.instanceMatrix.needsUpdate=true;}}
    foot+=dt;if(audio&&foot>1.8){foot=0;if(H.list.some(p=>p.walk))audio.walk();}}};
}
