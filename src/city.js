import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {facade,asphalt,pave,zebra,dash,boxUV,paint,lcg} from './textures.js';
// Streets sit well outside the (enlarged) apartment block so nothing overlaps roads.
export const STREETS={xs:[-62,-26,44,80],zs:[-62,-28,34,70]};
const PAL=[0xe8dcc0,0xd9b98a,0xc9d3c0,0xe0b6a8,0xb7bdc4,0xd7c98f,0xd6a47d];
function treeGeo(){
  const j=g=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),f=1+.16*Math.sin(x*3.1+y*2.3)*Math.cos(z*2.7+y);p.setXYZ(i,x*f,y*f,z*f);}g.computeVertexNormals();return g;};
  const parts=[paint(new THREE.CylinderGeometry(.12,.22,3.4,7).translate(0,1.7,0),0x4a3626)];
  [[0,4.3,0,2,0x3a6b2e],[.9,3.7,.5,1.4,0x4b8238],[-.9,3.9,-.5,1.5,0x2f5d28],[0,5.5,.2,1.3,0x5a9442],[.3,4,-1,1.2,0x3f7a35]]
    .forEach(([x,y,z,r,c])=>parts.push(paint(j(new THREE.SphereGeometry(r,10,8)).translate(x,y,z),c)));
  return mergeGeometries(parts);}
export function buildCity(scene){
  const rng=lcg(42),[fm,fe,fn]=facade(4,rng),X=STREETS.xs,Z=STREETS.zs;
  const near=new THREE.MeshStandardMaterial({map:fm,emissiveMap:fe,normalMap:fn,emissive:0xffffff,emissiveIntensity:0,vertexColors:true,roughness:.88});
  const geos=[],tanks=[],acs=[];
  for(let a=0;a<3;a++)for(let b=0;b<3;b++){if(a===1&&b===1)continue; // centre block holds the apartment
    const x0=X[a]+6.5,x1=X[a+1]-6.5,z0=Z[b]+6.5,z1=Z[b+1]-6.5;
    for(let cx=x0;cx<x1-6;cx+=15)for(let cz=z0;cz<z1-6;cz+=15){
      const w=Math.min(12.5+rng()*2,x1-cx),d=Math.min(12.5+rng()*2,z1-cz),fl=3+Math.floor(rng()*8),h=fl*3.2,px=cx+w/2,pz=cz+d/2;
      const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv;
      for(let v=0;v<uv.count;v++){const f=v>>2;if(f===2||f===3)uv.setXY(v,0,0);else uv.setXY(v,uv.getX(v)*(f<2?d:w)/12.8,uv.getY(v)*h/12.8);}
      g.translate(px,-9+h/2,pz);geos.push(paint(g,PAL[Math.floor(rng()*PAL.length)]));
      if(rng()<.65)tanks.push([px+(rng()-.5)*w*.5,-9+h+.55,pz+(rng()-.5)*d*.5]);
      for(let k=0;k<4;k++)if(rng()<.7)acs.push([px+(rng()-.5)*(w-3),-9+3.2*(1+Math.floor(rng()*(fl-1)))+1,pz+(rng()<.5?1:-1)*(d/2+.2)]);
    }}
  const nm=new THREE.Mesh(mergeGeometries(geos),near);nm.castShadow=nm.receiveShadow=true;scene.add(nm);
  const inst=(g,m,l,sh=true)=>{const o=new THREE.InstancedMesh(g,m,l.length),d=new THREE.Object3D();l.forEach((p,i)=>{d.position.set(p[0],p[1],p[2]);d.scale.setScalar(p[3]||1);d.rotation.y=p[4]||0;d.updateMatrix();o.setMatrixAt(i,d.matrix);});o.castShadow=sh;o.receiveShadow=true;scene.add(o);return o;};
  const std=(c,r=.9,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  inst(new THREE.CylinderGeometry(.55,.55,1.1,12),std(0x1d2a3a,.6,.3),tanks);inst(new THREE.BoxGeometry(.8,.55,.35),std(0xcfcfca,.6),acs);
  // Trees: evenly spaced along sidewalks, never in intersections or buildings.
  const trees=[],poles=[];
  const line=(axis,st,lo,hi)=>{for(let p=lo;p<hi;p+=9){const cross=axis==='z'?Z:X;if(cross.some(c=>Math.abs(p-c)<8))continue;
    for(const s of [-1,1]){const q=p+rng()*2,x=axis==='z'?st+s*4.25:q,z=axis==='z'?q:st+s*4.25;if(rng()<.85)trees.push([x,-8.82,z,.8+rng()*.5,rng()*6.28]);}}
    for(let p=lo+4;p<hi;p+=27){const cross=axis==='z'?Z:X;if(cross.some(c=>Math.abs(p-c)<8))continue;const s=rng()<.5?-1:1;
      poles.push([axis==='z'?st+s*4.4:p,-8.82,axis==='z'?p:st+s*4.4,1,axis==='z'?(s>0?Math.PI:0):s*Math.PI/2]);}};
  for(const x of X)line('z',x,-66,74);for(const z of Z)line('x',z,-66,84);
  const tm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});inst(treeGeo(),tm,trees);
  const lamp=mergeGeometries([paint(new THREE.CylinderGeometry(.07,.1,7,8).translate(0,3.5,0),0x3b3f44),paint(new THREE.BoxGeometry(1.5,.08,.08).translate(.7,7,0),0x3b3f44)]);
  inst(lamp,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.6}),poles);
  const lampM=new THREE.MeshStandardMaterial({color:0xfff2d0,emissive:0xffd9a0,emissiveIntensity:0}),lampH=new THREE.BoxGeometry(.55,.1,.28).translate(1.35,6.92,0);
  inst(lampH,lampM,poles,false);
  // Roads: asphalt with normal map, dashed centre line, kerbed paved footpaths, zebra crossings.
  const as=asphalt(),pv=pave(),roadMat=new THREE.MeshStandardMaterial({...as,roughness:.92}),paveMat=new THREE.MeshStandardMaterial({...pv,roughness:.85}),
    dashMat=new THREE.MeshStandardMaterial({map:dash(),transparent:true,alphaTest:.5,roughness:.6}),zebMat=new THREE.MeshStandardMaterial({map:zebra(),transparent:true,alphaTest:.5,roughness:.6});
  const plane=(w,d,m,x,y,z,ry=0,rep=8)=>{const g=new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*w/rep,u.getY(i)*d/rep);
    const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.y=ry;o.receiveShadow=true;scene.add(o);};
  plane(900,900,std(0x6b665c,1),8,-9.08,5,0,8);
  for(const r of [...X.map(f=>({a:'z',f,len:148,c:4})),...Z.map(f=>({a:'x',f,len:158,c:9}))]){
    const x=r.a==='z'?r.f:r.c,z=r.a==='z'?r.c:r.f,ry=r.a==='z'?0:Math.PI/2,y=r.a==='z'?-9:-8.995;
    plane(7,r.len,roadMat,x,y,z,ry);plane(.18,r.len,dashMat,x,-8.985,z,ry,7);
    for(const s of [-1,1]){const g=new THREE.BoxGeometry(1.5,.18,r.len);boxUV(g,1.5,.18,r.len,3);const m=new THREE.Mesh(g,paveMat);
      m.position.set(x+(r.a==='z'?s*4.25:0),-8.91,z+(r.a==='x'?s*4.25:0));m.rotation.y=ry;m.receiveShadow=true;scene.add(m);}
  }
  const zg=new THREE.PlaneGeometry(7,2.4).rotateX(-Math.PI/2),zu=zg.attributes.uv;for(let i=0;i<zu.count;i++)zu.setX(i,zu.getX(i)*3);
  const zb=[];for(const x of X)for(const z of Z)for(const s of [-1,1]){zb.push([x,-8.975,z+s*5.2,1,0]);zb.push([x+s*5.2,-8.975,z,1,Math.PI/2]);}
  inst(zg,zebMat,zb,false);
  // Kolkata-style tram rails along two east-west corridors.
  const railMat=new THREE.MeshStandardMaterial({color:0x6a6b70,metalness:.85,roughness:.3});
  for(const z of [Z[1],Z[2]])for(const dx of [-1.15,1.15]){const rail=new THREE.Mesh(new THREE.BoxGeometry(158,.04,.08),railMat);rail.position.set(9,-8.97,z+dx);scene.add(rail);}

  let far=null,farMat=null,sky=null,farN=900,detail=1,night=0;
  function addFar(){
    const [m,e]=facade(6,rng,64);farMat=new THREE.MeshLambertMaterial({map:m,emissiveMap:e,emissive:0xffffff,emissiveIntensity:night*.6});
    far=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),farMat,farN);const d=new THREE.Object3D();
    for(let i=0;i<farN;i++){const r=140+rng()*360,a=rng()*6.283,h=15+rng()*rng()*60;d.position.set(8+r*Math.cos(a),-9+h/2,5+r*Math.sin(a));d.scale.set(12+rng()*14,h,12+rng()*14);d.updateMatrix();far.setMatrixAt(i,d.matrix);const g=.55+rng()*.4;far.setColorAt(i,new THREE.Color(g,g*.95,g*.85));}
    far.count=Math.floor(farN*detail);scene.add(far);
    const c=document.createElement('canvas');c.width=1024;c.height=128;const x=c.getContext('2d');x.fillStyle='#fff';
    for(let px=0;px<1024;px+=4+rng()*30){const w=8+rng()*30,h=20+rng()*90;x.fillRect(px,128-h,w,h);px+=w;}
    const t=new THREE.CanvasTexture(c);sky=new THREE.Mesh(new THREE.CylinderGeometry(560,560,90,48,1,true),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));sky.position.set(8,36,5);scene.add(sky);
  }
  return{addFar,setDetail(f){detail=f;if(far)far.count=Math.floor(farN*f);},setNight(n){night=n;near.emissiveIntensity=n*.9;lampM.emissiveIntensity=n*4;if(farMat)farMat.emissiveIntensity=n*.6;},tint(c){if(sky)sky.material.color.copy(c).multiplyScalar(.8);}};
}
