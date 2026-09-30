import * as THREE from 'three';
import {STREETS} from './city.js';
// Simple instanced people (legs + torso + head): family in the hall (seated, standing, wandering) and pedestrians on the streets.
const Y0=-9,LIM=100;
const SHIRT=[0xc0392b,0xe6b800,0x2e7d5b,0x2e5fa8,0xf2efe6,0xb0428f,0xe07a2f,0x6a4c93,0x1f8a8a],SKIN=[0x8d5a3b,0xa9714b,0x6f4630,0xc08a62,0x54362a],LEG=[0x222a3a,0x3a3a3a,0x4a3b2a,0x1d2b45,0xd9d3c4];
const NODES=[[-2,2.2],[-2,5],[-2,7.8],[-9,5],[-13.8,5]],EDGES=[[1],[0,2,3],[1],[1,4],[3]]; // walkable aisle graph in the hall
export function buildPeople(scene,hallGroup,chairs,mobile){
  let s=99;const rnd=()=>(s=(s*16807)%2147483647)/2147483647,pick=a=>a[Math.floor(rnd()*a.length)],kid=()=>rnd()<.15?.75:1;
  const hall=[],street=[];
  for(const c of [...chairs].sort(()=>rnd()-.5).slice(0,mobile?14:24))hall.push({x:c.x,z:c.z,y:0,k:kid(),seated:true});
  for(const [x,z] of [[-3.6,3.2],[-3.1,3.8],[-.9,3],[-1,7],[-3.5,6.8],[-.8,7.6],[-14.4,5.2],[-14.2,4.7]])hall.push({x,z,y:0,k:kid()});
  for(let i=0;i<(mobile?5:9);i++){const n=Math.floor(rnd()*NODES.length);hall.push({x:NODES[n][0],z:NODES[n][1],y:0,k:kid(),walk:1,speed:.9+rnd()*.5,ph:rnd()*6,n,to:pick(EDGES[n]),wait:rnd()*3});}
  for(let i=0;i<(mobile?26:50);i++){const z=rnd()<.5,st=z?pick(STREETS.xs):pick(STREETS.zs),c0=z?5:8;
    street.push({axis:z?'z':'x',st:st+(rnd()<.5?2.4:-2.4),dir:rnd()<.5?1:-1,c0,pos:c0+(rnd()*2-1)*LIM,x:0,z:0,y:Y0,k:kid(),walk:1,speed:1+rnd()*.6,ph:rnd()*6});}
  const geo=[new THREE.CylinderGeometry(.11,.1,1,8),new THREE.CylinderGeometry(.2,.22,1,8),new THREE.SphereGeometry(1,8,6)],cl=new THREE.Color();
  const make=(list,parent)=>{
    const ms=geo.map(g=>{const o=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial(),list.length);o.frustumCulled=false;o.castShadow=true;parent.add(o);return o;});
    list.forEach((p,i)=>{ms[0].setColorAt(i,cl.set(pick(LEG)));ms[1].setColorAt(i,cl.set(pick(SHIRT)));ms[2].setColorAt(i,cl.set(pick(SKIN)));});
    return{ms,list,count:list.length};};
  const H=make(hall,hallGroup),S=make(street,scene),D=new THREE.Object3D();let t=0;
  const put=(set,i,p)=>{
    const k=p.k,lh=(p.seated?.45:.8)*k,w=p.walk?Math.abs(Math.sin(t*p.speed*4+p.ph))*.04:0,[l,b,h]=set.ms;
    D.position.set(p.x,p.y+lh/2+w,p.z);D.scale.set(k,lh,k);D.updateMatrix();l.setMatrixAt(i,D.matrix);
    D.position.y=p.y+lh+.325*k+w;D.scale.set(k,.65*k,k);D.updateMatrix();b.setMatrixAt(i,D.matrix);
    D.position.y=p.y+lh+.78*k+w;D.scale.set(.13*k,.13*k,.13*k);D.updateMatrix();h.setMatrixAt(i,D.matrix);};
  return{
    setDetail(f){S.count=Math.floor(street.length*(.3+.7*Math.min(1,f)));},
    update(dt){
      t+=dt;
      for(const p of hall)if(p.walk){
        if(p.wait>0){p.wait-=dt;continue;}
        const tx=NODES[p.to][0],tz=NODES[p.to][1],dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),st=p.speed*dt;
        if(d<=st){p.x=tx;p.z=tz;p.n=p.to;p.to=pick(EDGES[p.n]);p.wait=rnd()*3;}else{p.x+=dx/d*st;p.z+=dz/d*st;}
      }
      for(const p of street){p.pos+=p.dir*p.speed*dt;if((p.pos-p.c0)*p.dir>LIM)p.pos-=2*LIM*p.dir;p.x=p.axis==='z'?p.st:p.pos;p.z=p.axis==='z'?p.pos:p.st;}
      for(const set of [H,S]){for(let i=0;i<set.count;i++)put(set,i,set.list[i]);for(const m of set.ms){m.count=set.count;m.instanceMatrix.needsUpdate=true;}}
    }};
}
