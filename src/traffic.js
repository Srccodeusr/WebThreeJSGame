import * as THREE from 'three';
import {STREETS} from './city.js';
// One InstancedMesh of moving vehicles. Left-hand traffic, per-lane car following so queues form.
const Y0=-9,LIM=100,LANE=1,COLORS=[0xd8d8d0,0x8a1f1f,0x1d2a4a,0x555555,0xf2f2f2,0x2e5b3a];
export function buildTraffic(scene,mobile){
  let s=5;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const xs=[...STREETS.xs].sort((a,b)=>Math.abs(a-8)-Math.abs(b-8)).slice(0,5),zs=[...STREETS.zs].sort((a,b)=>Math.abs(a-5)-Math.abs(b-5)).slice(0,5);
  const N=mobile?36:70,cars=[],col=new THREE.Color();
  const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1.8,1.3,4.2),new THREE.MeshStandardMaterial({roughness:.5,emissive:0xffd9a0,emissiveIntensity:0}),N);
  mesh.frustumCulled=false;mesh.castShadow=true;scene.add(mesh);
  for(let i=0;i<N;i++){
    const axis=rnd()<.5?'z':'x',dir=rnd()<.5?1:-1,st=axis==='z'?xs[Math.floor(rnd()*xs.length)]:zs[Math.floor(rnd()*zs.length)];
    const r=rnd(),type=r<.4?0:r<.7?1:r<.85?2:3,sc=[[1,1,1],[1,1,1],[1.35,1.7,2.6],[.75,.95,.6]][type],c0=axis==='z'?5:8;
    cars.push({axis,key:axis+st+dir,fixed:st+(axis==='z'?dir:-dir)*LANE,dir,c0,pos:c0+(rnd()*2-1)*LIM,v0:4+rnd()*5,v:0,sc,y:Y0+1.3*sc[1]/2,hl:2.1*sc[2]});
    mesh.setColorAt(i,col.set(type===1?0xe6c229:type===2?(rnd()<.5?0xb32020:0x2e5fa8):type===3?0x2e8b57:COLORS[Math.floor(rnd()*COLORS.length)]));
  }
  const D=new THREE.Object3D();let count=N;
  return{
    setDetail(f){count=Math.floor(N*(.4+.6*Math.min(1,f)));mesh.count=count;},
    setNight(n){mesh.material.emissiveIntensity=n*.5;},
    update(dt,cam){
      let near=0,closest=999;
      for(let i=0;i<count;i++){
        const c=cars[i];let tv=c.v0;
        for(let j=0;j<count;j++){const o=cars[j];if(o===c||o.key!==c.key)continue;const gap=(o.pos-c.pos)*c.dir;if(gap<=0)continue;
          const free=gap-c.hl-o.hl;if(free<12)tv=Math.min(tv,Math.max(0,(free-2)*1.2));}
        c.v+=(tv-c.v)*Math.min(1,dt*1.5);c.pos+=c.dir*c.v*dt;if((c.pos-c.c0)*c.dir>LIM)c.pos-=2*LIM*c.dir;
        const x=c.axis==='z'?c.fixed:c.pos,z=c.axis==='z'?c.pos:c.fixed;
        D.position.set(x,c.y,z);D.rotation.y=c.axis==='x'?Math.PI/2:0;D.scale.set(c.sc[0],c.sc[1],c.sc[2]);D.updateMatrix();mesh.setMatrixAt(i,D.matrix);
        const d=Math.hypot(x-cam.x,c.y-cam.y,z-cam.z);near+=Math.max(0,1-d/60);if(d<closest)closest=d;
      }
      mesh.instanceMatrix.needsUpdate=true;return{near,closest};
    }};
}
