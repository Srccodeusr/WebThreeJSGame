import * as THREE from 'three';
import {STREETS} from './city.js';

export function buildTraffic(scene,mobile,audio){
  let s=17;const rnd=()=>((s=(s*16807)%2147483647)/2147483647);
  const N=mobile?28:58, vehicles=[], dummy=new THREE.Object3D(), groups=[];
  const carGeo=new THREE.BoxGeometry(1.7,1.0,3.7), bikeGeo=new THREE.CylinderGeometry(.22,.22,1.25,8), busGeo=new THREE.BoxGeometry(2.5,2.1,8);
  const mats=[0xd8d8d0,0x9b2b24,0x243b62,0xf0c33b,0x2f6b49,0xeee7d3];
  const meshes=[
    new THREE.InstancedMesh(carGeo,new THREE.MeshStandardMaterial({roughness:.48,metalness:.15}),Math.ceil(N*.7)),
    new THREE.InstancedMesh(bikeGeo,new THREE.MeshStandardMaterial({roughness:.6,metalness:.3}),Math.ceil(N*.2)),
    new THREE.InstancedMesh(busGeo,new THREE.MeshStandardMaterial({roughness:.58,metalness:.12}),Math.ceil(N*.1))
  ];
  meshes.forEach(m=>{m.frustumCulled=false;m.castShadow=true;scene.add(m);});
  let ci=0,bi=0,busi=0;
  const lanes=[];
  for(const x of STREETS.xs) lanes.push({axis:'z',fixed:x,offset:-1.6},{axis:'z',fixed:x,offset:1.6});
  for(const z of STREETS.zs) lanes.push({axis:'x',fixed:z,offset:-1.6},{axis:'x',fixed:z,offset:1.6});
  for(let i=0;i<N;i++){
    const lane=lanes[Math.floor(rnd()*lanes.length)],type=rnd()<.7?0:rnd()<.78?1:2,dir=rnd()<.5?1:-1;
    vehicles.push({lane,type,dir,pos:-70+rnd()*140,v: type===2?5+rnd()*3: type===1?4+rnd()*5:7+rnd()*7,lastHorn:0});
  }
  let night=0;
  function resetCounts(){ci=bi=busi=0;}
  return{
    setDetail(f){const c=Math.max(8,Math.floor(N*(.5+.5*f)));vehicles.length=Math.min(vehicles.length,c);},
    setNight(n){night=n;},
    update(dt,cam){
      resetCounts();
      for(const v of vehicles){
        v.pos+=v.dir*v.v*dt;
        if(v.pos>75)v.pos=-75;if(v.pos<-75)v.pos=75;
        const x=v.lane.axis==='z'?v.lane.fixed+v.lane.offset:v.pos;
        const z=v.lane.axis==='z'?v.pos:v.lane.fixed+v.lane.offset;
        const y=-8.1+(v.type===2?1.05:.55);
        dummy.position.set(x,y,z);dummy.rotation.y=v.lane.axis==='x'?Math.PI/2:0;
        dummy.scale.set(v.type===1?.72:1,v.type===2?1.05:1,v.type===2?1.15:1);
        dummy.updateMatrix();
        const m=meshes[v.type];const idx=v.type===0?ci++:v.type===1?bi++:busi++;
        if(idx<m.count){m.setMatrixAt(idx,dummy.matrix);m.setColorAt(idx,new THREE.Color(mats[Math.floor((v.pos+75)%mats.length)]));}
        if(audio&&v.lastHorn<=0&&Math.hypot(x-cam.x,z-cam.z)<18&&rnd()<.002){audio.horn(v.type);v.lastHorn=3+rnd()*5;}else v.lastHorn-=dt;
      }
      meshes.forEach(m=>{m.instanceMatrix.needsUpdate=true;m.count=Math.min(m.count,m===meshes[0]?ci:m===meshes[1]?bi:busi);});
      return {near:0};
    }
  };
}
