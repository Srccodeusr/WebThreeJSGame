import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const STREETS={
  xs:[-14,30,44,-44],
  zs:[-18,-6,18,32]
};

const seed=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
const PAL=[0xe8dcc0,0xd9b98a,0xc9d3c0,0xe0b6a8,0xb7bdc4,0xd7c98f,0xd6a47d];
function facades(rng,n){
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=32*n;return c;},a=mk(),b=mk(),x=a.getContext('2d'),y=b.getContext('2d');
  x.fillStyle='#f4efe4';x.fillRect(0,0,a.width,a.height);y.fillStyle='#000';y.fillRect(0,0,b.width,b.height);
  x.globalAlpha=.08;for(let i=0;i<300;i++){x.fillStyle=rng()<.5?'#000':'#fff';x.fillRect(rng()*a.width,rng()*a.height,3+rng()*10,6+rng()*30);}x.globalAlpha=1;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const px=i*32+5,py=j*32+6;
    x.fillStyle='#39434a';x.fillRect(px,py,22,19);x.fillStyle='#22282c';x.fillRect(px-2,py+20,26,3);
    if(rng()<.55){y.fillStyle=rng()<.5?'#ffd28a':'#fff1c9';y.fillRect(px,py,22,19);}
  }
  const t=c=>{const s=new THREE.CanvasTexture(c);s.colorSpace=THREE.SRGBColorSpace;s.wrapS=s.wrapT=THREE.RepeatWrapping;s.anisotropy=4;return s;};
  return[t(a),t(b)];
}
function roadTexture(){
  const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');
  x.fillStyle='#252729';x.fillRect(0,0,512,512);
  for(let i=0;i<4200;i++){const v=28+Math.random()*28;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*3,1+Math.random()*3);}
  x.globalAlpha=.18;x.strokeStyle='#d7d0bd';x.lineWidth=2;
  for(let i=0;i<24;i++){x.beginPath();x.moveTo(Math.random()*512,0);x.lineTo(Math.random()*512,512);x.stroke();}
  x.globalAlpha=1;
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(18,18);t.anisotropy=8;return t;
}
export function buildCity(scene){
  const rng=seed(42),[fm,fe]=facades(rng,4);
  const near=new THREE.MeshStandardMaterial({map:fm,emissiveMap:fe,emissive:0xffffff,emissiveIntensity:0,vertexColors:true,roughness:.92});
  const geos=[],tanks=[],acs=[],trees=[],poles=[];
  const isBuilding=(x,z)=>x>-5&&x<21.5&&z>-8&&z<18.5;
  for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){
    if(!i&&!j)continue;
    const w=12+rng()*5,d=12+rng()*5,fl=3+Math.floor(rng()*8),h=fl*3.2,cx=8+30*i+(rng()-.5)*4,cz=5+30*j+(rng()-.5)*4;
    if(Math.abs(cx-8)<27&&Math.abs(cz-5)<25)continue;
    const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv;
    for(let v=0;v<uv.count;v++){const f=v>>2;if(f===2||f===3)uv.setXY(v,0,0);else uv.setXY(v,uv.getX(v)*(f<2?d:w)/12.8,uv.getY(v)*h/12.8);}
    g.translate(cx,-9+h/2,cz);
    const col=new THREE.Color(PAL[Math.floor(rng()*PAL.length)]),n=g.attributes.position.count,ca=new Float32Array(n*3);
    for(let v=0;v<n;v++)ca.set([col.r,col.g,col.b],v*3);g.setAttribute('color',new THREE.BufferAttribute(ca,3));geos.push(g);
    if(rng()<.65)tanks.push([cx+(rng()-.5)*w*.5,-9+h+.6,cz+(rng()-.5)*d*.5]);
    for(let k=0;k<4;k++)if(rng()<.7)acs.push([cx+(rng()-.5)*(w-3),-9+3.2*(1+Math.floor(rng()*(fl-1)))+1,cz+(rng()<.5?1:-1)*(d/2+.2)]);
  }
  for(let n=0;n<80;n++){
    const axis=rng()<.5?'x':'z',st=axis==='x'?STREETS.zs[Math.floor(rng()*STREETS.zs.length)]:STREETS.xs[Math.floor(rng()*STREETS.xs.length)];
    const pos=-60+rng()*120, x=axis==='x'?pos:st+(rng()<.5?-4:4), z=axis==='x'?st+(rng()<.5?-4:4):pos;
    if(isBuilding(x,z))continue;
    trees.push([x,-9,z]);poles.push([x+(axis==='x'?0:2),-5,z+(axis==='x'?2:0)]);
  }
  const nm=new THREE.Mesh(mergeGeometries(geos),near);nm.castShadow=nm.receiveShadow=true;scene.add(nm);
  const inst=(g,m,l)=>{const o=new THREE.InstancedMesh(g,m,l.length),d=new THREE.Object3D();l.forEach((p,i)=>{d.position.set(...p);d.updateMatrix();o.setMatrixAt(i,d.matrix);});o.castShadow=true;scene.add(o);return o;};
  const std=(c,r=.9)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
  inst(new THREE.CylinderGeometry(.55,.55,1.1,10),std(0x1d2a3a,.7),tanks);
  inst(new THREE.BoxGeometry(.8,.55,.35),std(0xcfcfca,.6),acs);
  inst(new THREE.CylinderGeometry(.15,.2,3,6),std(0x4a3a2a),trees.map(p=>[p[0],p[1]+1.5,p[2]]));
  inst(new THREE.SphereGeometry(2,8,6),std(0x3f7a3a),trees.map(p=>[p[0],p[1]+4.2,p[2]]));
  inst(new THREE.CylinderGeometry(.1,.1,8,6),std(0x555555),poles);

  const roadMat=new THREE.MeshStandardMaterial({map:roadTexture(),roughness:.96,metalness:.02});
  const sidewalk=new THREE.MeshStandardMaterial({color:0x77736b,roughness:1});
  for(const x of STREETS.xs){
    const road=new THREE.Mesh(new THREE.PlaneGeometry(7,180).rotateX(-Math.PI/2),roadMat);road.position.set(x,-9.01,7);road.receiveShadow=true;scene.add(road);
    for(const side of [-1,1]){const sw=new THREE.Mesh(new THREE.BoxGeometry(1,.18,180),sidewalk);sw.position.set(x+side*4,-8.91,7);sw.receiveShadow=true;scene.add(sw);}
    const line=new THREE.Mesh(new THREE.PlaneGeometry(.12,180).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xe7ddbd,roughness:.7}));line.position.set(x,-8.97,7);scene.add(line);
  }
  for(const z of STREETS.zs){
    const road=new THREE.Mesh(new THREE.PlaneGeometry(180,7).rotateX(-Math.PI/2),roadMat);road.position.set(8,-9.005,z);road.receiveShadow=true;scene.add(road);
    for(const side of [-1,1]){const sw=new THREE.Mesh(new THREE.BoxGeometry(180,.18,1),sidewalk);sw.position.set(8,-8.91,z+side*4);sw.receiveShadow=true;scene.add(sw);}
    const line=new THREE.Mesh(new THREE.PlaneGeometry(180,.12).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xe7ddbd,roughness:.7}));line.position.set(8,-8.97,z);scene.add(line);
  }
  // Kolkata-style tram tracks on two main east-west corridors.
  const railMat=new THREE.MeshStandardMaterial({color:0x55565a,metalness:.75,roughness:.32});
  for(const z of [-6,18])for(const dx of [-1.15,1.15]){
    const rail=new THREE.Mesh(new THREE.BoxGeometry(180,.035,.07),railMat);rail.position.set(8,-8.91,z+dx);scene.add(rail);
  }

  let far=null,farMat=null,sky=null,farN=900,detail=1,night=0;
  function addFar(){
    const [m,e]=facades(rng,6);farMat=new THREE.MeshLambertMaterial({map:m,emissiveMap:e,emissive:0xffffff,emissiveIntensity:night*.6});
    far=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),farMat,farN);const d=new THREE.Object3D();
    for(let i=0;i<farN;i++){const r=130+rng()*360,a=rng()*6.283,h=15+rng()*rng()*60;d.position.set(8+r*Math.cos(a),-9+h/2,5+r*Math.sin(a));d.scale.set(12+rng()*14,h,12+rng()*14);d.updateMatrix();far.setMatrixAt(i,d.matrix);const g=.55+rng()*.4;far.setColorAt(i,new THREE.Color(g,g*.95,g*.85));}
    far.count=Math.floor(farN*detail);scene.add(far);
    const c=document.createElement('canvas');c.width=1024;c.height=128;const x=c.getContext('2d');x.fillStyle='#fff';
    for(let px=0;px<1024;px+=4+rng()*30){const w=8+rng()*30,h=20+rng()*90;x.fillRect(px,128-h,w,h);px+=w;}
    const t=new THREE.CanvasTexture(c);sky=new THREE.Mesh(new THREE.CylinderGeometry(560,560,90,48,1,true),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));sky.position.set(8,36,5);scene.add(sky);
  }
  return{addFar,setDetail(f){detail=f;if(far)far.count=Math.floor(farN*f);},setNight(n){night=n;near.emissiveIntensity=n*.9;if(farMat)farMat.emissiveIntensity=n*.6;},tint(c){if(sky)sky.material.color.copy(c).multiplyScalar(.8);}};
}
