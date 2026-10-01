import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {STREETS} from './city.js';
import {paint} from './textures.js';
const SHIRT=[0xc0392b,0xe6b800,0x2e7d5b,0x2e5fa8,0xf2efe6,0xb0428f,0xe07a2f,0x6a4c93,0x1f6f78,0xd9d2c0],SKIN=[0x8d5a3b,0xa9714b,0x6f4630,0xc08a62,0x7b4e34],LEG=[0x222a3a,0x3a3a3a,0x4a3b2a,0x1d2b45,0x5a5648,0x2b3a2e];
// Articulated figure: 2 legs, torso, 2 arms, head+hair. ~1.77 m tall, faces +z. Pivots at hip/shoulder for swing.
const leg=()=>new THREE.CylinderGeometry(.075,.06,.88,8).translate(0,-.44,0),arm=()=>new THREE.CylinderGeometry(.045,.04,.62,6).translate(0,-.31,0);
const GEO=[leg(),leg(),new THREE.CapsuleGeometry(.16,.34,4,10).scale(1.15,1,.7).translate(0,1.2,0),arm(),arm(),
  mergeGeometries([paint(new THREE.SphereGeometry(.11,12,10).scale(1,1.15,1),0xffffff),paint(new THREE.SphereGeometry(.118,12,8,0,6.283,0,1.55).scale(1,1.1,1.05).translate(0,.025,-.01),0x1a1410)]).translate(0,1.64,0)];
const OFF=[[-.09,.9,0,1],[.09,.9,0,-1],[0,0,0,0],[-.23,1.42,0,-1],[.23,1.42,0,1],[0,0,0,0]];
export function buildPeople(scene,hallGroup,chairs,mobile,audio,b={x0:1,x1:13,z0:1,z1:9}){
  let s=99;const rnd=()=>((s=(s*16807)%2147483647)/2147483647),pick=a=>a[Math.floor(rnd()*a.length)],rp=()=>({x:b.x0+rnd()*(b.x1-b.x0),z:b.z0+rnd()*(b.z1-b.z0)});
  const hall=[],street=[],NH=mobile?14:28,N=mobile?22:46;
  for(let i=0;i<NH;i++)hall.push({...rp(),y:0,k:.92+rnd()*.14,walk:i<NH*.4,speed:.6+rnd()*.4,ph:rnd()*6,yaw:rnd()*6.28,tg:rp()});
  for(let i=0;i<N;i++){const axis=rnd()<.5?'z':'x',st=axis==='z'?pick(STREETS.xs):pick(STREETS.zs),dir=rnd()<.5?1:-1;
    street.push({axis,st:st+(rnd()<.5?-4.25:4.25),dir,pos:-65+rnd()*130,y:-8.82,k:.92+rnd()*.14,speed:.8+rnd()*.9,ph:rnd()*6,walk:true,yaw:axis==='z'?(dir>0?0:Math.PI):dir*Math.PI/2});}
  const make=(list,parent)=>{const ms=GEO.map((g,k)=>{const o=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({roughness:.8,vertexColors:k===5}),list.length);o.frustumCulled=false;o.castShadow=true;parent.add(o);return o;});
    list.forEach((p,i)=>{const L=pick(LEG),S=pick(SHIRT),K=pick(SKIN);[L,L,S,S,S,K].forEach((c,k)=>ms[k].setColorAt(i,new THREE.Color(c)));});return{ms,list,count:list.length};};
  const H=make(hall,hallGroup),S=make(street,scene),root=new THREE.Matrix4(),lc=new THREE.Matrix4(),o=new THREE.Matrix4(),q=new THREE.Quaternion(),qa=new THREE.Quaternion(),V=new THREE.Vector3(),SC=new THREE.Vector3(),AX=new THREE.Vector3(1,0,0),AY=new THREE.Vector3(0,1,0);
  let t=0,foot=0;
  const put=(set,i,p)=>{const ph=t*p.speed*5+p.ph,sl=p.walk?Math.sin(ph)*.55:0,sa=p.walk?sl:Math.sin(t*2.1+p.ph)*.3,bob=p.walk?Math.abs(Math.cos(ph))*.025:Math.sin(t*1.3+p.ph)*.004;
    q.setFromAxisAngle(AY,p.yaw);root.compose(V.set(p.x,p.y+bob,p.z),q,SC.set(p.k,p.k,p.k));
    for(let n=0;n<6;n++){const[x,y,z,g]=OFF[n];qa.setFromAxisAngle(AX,(n===3||n===4?sa:sl)*g);lc.compose(V.set(x,y,z),qa,SC.set(1,1,1));o.multiplyMatrices(root,lc);set.ms[n].setMatrixAt(i,o);}};
  return{setDetail(f){S.count=Math.floor(street.length*(.45+.55*f));},update(dt){t+=dt;
    for(const p of hall){if(!p.walk)continue;const dx=p.tg.x-p.x,dz=p.tg.z-p.z,d=Math.hypot(dx,dz);if(d<.3)p.tg=rp();else{p.x+=dx/d*p.speed*dt;p.z+=dz/d*p.speed*dt;p.yaw=Math.atan2(dx,dz);}}
    for(const p of street){p.pos+=p.dir*p.speed*dt;if(p.pos>70)p.pos=-70;if(p.pos<-70)p.pos=70;p.x=p.axis==='z'?p.st:p.pos;p.z=p.axis==='z'?p.pos:p.st;}
    for(const set of [H,S]){for(let i=0;i<set.count;i++)put(set,i,set.list[i]);for(const m of set.ms){m.count=set.count;m.instanceMatrix.needsUpdate=true;}}
    foot+=dt;if(audio&&foot>.7){foot=0;if(H.list.some(p=>p.walk))audio.walk();}}};
}
