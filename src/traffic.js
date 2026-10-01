import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {STREETS} from './city.js';
import {paint} from './textures.js';
// Vertex colours: white = body paint (tinted per instance), darker = glass/tyres/lights. Models face +z, wheel bottoms at y=0.
const bx=(w,h,d,x,y,z,c)=>paint(new THREE.BoxGeometry(w,h,d).translate(x,y,z),c),wh=(r,w,x,y,z)=>paint(new THREE.CylinderGeometry(r,r,w,12).rotateZ(Math.PI/2).translate(x,y,z),0x0c0c0c);
const car=()=>mergeGeometries([bx(1.72,.6,3.9,0,.62,0,0xffffff),bx(1.5,.5,2,0,1.16,-.15,0x16202a),bx(1.52,.06,1.7,0,1.44,-.15,0xffffff),bx(1.74,.12,.1,0,.55,1.95,0xdddddd),
  bx(.4,.12,.05,-.55,.78,1.96,0xfff3c0),bx(.4,.12,.05,.55,.78,1.96,0xfff3c0),bx(.4,.12,.05,-.55,.78,-1.96,0xb01010),bx(.4,.12,.05,.55,.78,-1.96,0xb01010),
  ...[[-.88,1.2],[.88,1.2],[-.88,-1.2],[.88,-1.2]].map(([x,z])=>wh(.33,.24,x,.33,z))]);
const bus=()=>mergeGeometries([bx(2.5,2.3,9,0,1.65,0,0xffffff),bx(2.54,.85,8.4,0,2.15,0,0x16202a),bx(2.52,.1,9.02,0,1.05,0,0xcccccc),bx(.5,.2,.05,-.8,.9,4.52,0xfff3c0),bx(.5,.2,.05,.8,.9,4.52,0xfff3c0),
  ...[[-1.2,3],[1.2,3],[-1.2,-2.6],[1.2,-2.6]].map(([x,z])=>wh(.5,.3,x,.5,z))]);
const bike=()=>mergeGeometries([wh(.3,.08,0,.3,.7),wh(.3,.08,0,.3,-.7),bx(.18,.35,1.1,0,.55,0,0xffffff),bx(.3,.5,.3,0,1.0,-.1,0x2f5f7a),paint(new THREE.SphereGeometry(.13,8,6).translate(0,1.4,-.1),0x6b4630)]);
const COL=[[0xf0c33b,0xf0c33b,0xf0c33b,0xd8d8d0,0x9b2b24,0x243b62,0x2f6b49,0xeee7d3],[0xd8d8d0,0x9b2b24,0x243b62,0x222222],[0x2b5fa8,0xd8d8d0,0xb23a24]];
export function buildTraffic(scene,mobile,audio){
  let s=17;const rnd=()=>((s=(s*16807)%2147483647)/2147483647),N=mobile?36:70,cnt=[Math.round(N*.62),Math.round(N*.25),Math.max(3,Math.round(N*.13))];
  const mat=()=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.35}),meshes=[car(),bike(),bus()].map((g,i)=>{const m=new THREE.InstancedMesh(g,mat(),cnt[i]);m.frustumCulled=false;m.castShadow=true;scene.add(m);return m;});
  const veh=[],all=[...STREETS.xs.map(f=>({axis:'z',f})),...STREETS.zs.map(f=>({axis:'x',f}))],D=new THREE.Object3D();let night=0;
  cnt.forEach((n,type)=>{for(let i=0;i<n;i++){const st=all[Math.floor(rnd()*all.length)],dir=rnd()<.5?1:-1,c=COL[type];
    meshes[type].setColorAt(i,new THREE.Color(c[Math.floor(rnd()*c.length)]));
    veh.push({st,type,i,dir,pos:-70+rnd()*140,v:type===2?5+rnd()*3:type===1?4+rnd()*4:7+rnd()*6,horn:rnd()*6});}});
  return{setNight(n){night=n;},
    update(dt,cam){let near=99;
      for(const v of veh){v.pos+=v.dir*v.v*dt;if(v.pos>78)v.pos=-78;if(v.pos<-78)v.pos=78;
        const z=v.st.axis==='z',side=(z?1:-1)*v.dir*1.7;// drive on the left
        const x=z?v.st.f+side:v.pos,zz=z?v.pos:v.st.f+side;
        D.position.set(x,-9,zz);D.rotation.y=z?(v.dir>0?0:Math.PI):v.dir*Math.PI/2;D.updateMatrix();meshes[v.type].setMatrixAt(v.i,D.matrix);
        const d=Math.hypot(x-cam.x,zz-cam.z,(cam.y+9)*.5);if(d<near)near=d;
        v.horn-=dt;if(audio&&v.horn<=0&&d<40&&rnd()<.01){audio.horn(v.type,d);v.horn=4+rnd()*8;}}
      meshes.forEach(m=>m.instanceMatrix.needsUpdate=true);return{near};}};
}
