import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Layered city: near blocks (one merged mesh), far blocks (one InstancedMesh), skyline card. Deterministic seed.
const seed=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296,Y0=-9;
const PAL=[0xe8dcc0,0xd9b98a,0xc9d3c0,0xe0b6a8,0xb7bdc4,0xd7c98f];
function facades(rng,n){
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=32*n;return c;},a=mk(),b=mk(),x=a.getContext('2d'),y=b.getContext('2d');
  x.fillStyle='#f4efe4';x.fillRect(0,0,a.width,a.height);y.fillStyle='#000';y.fillRect(0,0,b.width,b.height);
  x.globalAlpha=.08;for(let i=0;i<300;i++){x.fillStyle=rng()<.5?'#000':'#fff';x.fillRect(rng()*a.width,rng()*a.height,3+rng()*10,6+rng()*30);}x.globalAlpha=1;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const px=i*32+6,py=j*32+8;x.fillStyle='#39434a';x.fillRect(px,py,20,17);x.fillStyle='#22282c';x.fillRect(px-2,py+18,24,3);
    if(rng()<.45){y.fillStyle=rng()<.5?'#ffd28a':'#fff1c9';y.fillRect(px,py,20,17);}}
  const t=c=>{const s=new THREE.CanvasTexture(c);s.colorSpace=THREE.SRGBColorSpace;s.wrapS=s.wrapT=THREE.RepeatWrapping;s.anisotropy=4;return s;};
  return[t(a),t(b)];
}
export function buildCity(scene){
  const rng=seed(42),[fm,fe]=facades(rng,4);
  const near=new THREE.MeshStandardMaterial({map:fm,emissiveMap:fe,emissive:0xffffff,emissiveIntensity:0,vertexColors:true,roughness:.92});
  const geos=[],tanks=[],acs=[],cars=[],trees=[],poles=[];
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){
    if(!i&&!j)continue;
    const w=12+rng()*5,d=12+rng()*5,fl=3+Math.floor(rng()*8),h=fl*3.2,cx=8+22*i+(rng()-.5)*2,cz=5+22*j+(rng()-.5)*2;
    const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv;
    for(let v=0;v<uv.count;v++){const f=v>>2;if(f===2||f===3)uv.setXY(v,0,0);else uv.setXY(v,uv.getX(v)*(f<2?d:w)/12.8,uv.getY(v)*h/12.8);}
    g.translate(cx,Y0+h/2,cz);
    const col=new THREE.Color(PAL[Math.floor(rng()*PAL.length)]),n=g.attributes.position.count,ca=new Float32Array(n*3);
    for(let v=0;v<n;v++)ca.set([col.r,col.g,col.b],v*3);g.setAttribute('color',new THREE.BufferAttribute(ca,3));geos.push(g);
    if(rng()<.65)tanks.push([cx+(rng()-.5)*w*.5,Y0+h+.6,cz+(rng()-.5)*d*.5]);
    for(let k=0;k<4;k++)if(rng()<.7)acs.push([cx+(rng()-.5)*(w-3),Y0+3.2*(1+Math.floor(rng()*(fl-1)))+1,cz+(rng()<.5?1:-1)*(d/2+.2)]);
  }
  for(let n=0;n<45;n++){const i=Math.floor(rng()*7)-3,j=Math.floor(rng()*7)-3,sx=8+22*i+11;
    cars.push([sx+(rng()<.5?-1.8:1.8),Y0+.7,5+22*j+(rng()-.5)*18]);
    trees.push([sx+(rng()<.5?-3.8:3.8),Y0,5+22*j+(rng()-.5)*18]);poles.push([sx+(rng()<.5?-4.5:4.5),Y0+4,5+22*j+(rng()-.5)*18]);}
  const nm=new THREE.Mesh(mergeGeometries(geos),near);nm.castShadow=nm.receiveShadow=true;scene.add(nm);
  const inst=(g,m,l,colors)=>{const o=new THREE.InstancedMesh(g,m,l.length),d=new THREE.Object3D();
    l.forEach((p,i)=>{d.position.set(...p);d.updateMatrix();o.setMatrixAt(i,d.matrix);if(colors)o.setColorAt(i,new THREE.Color(colors[i%colors.length]));});o.castShadow=true;scene.add(o);return o;};
  const std=(c,r=.9)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
  inst(new THREE.CylinderGeometry(.55,.55,1.1,10),std(0x1d2a3a,.7),tanks);
  inst(new THREE.BoxGeometry(.8,.55,.35),std(0xcfcfca,.6),acs);
  inst(new THREE.BoxGeometry(1.8,1.3,4.2),std(0xffffff,.5),cars,[0xd8d8d0,0x8a1f1f,0x1d2a4a,0xe6c229,0x555555]);
  inst(new THREE.CylinderGeometry(.15,.2,3,6),std(0x4a3a2a),trees.map(p=>[p[0],p[1]+1.5,p[2]]));
  inst(new THREE.SphereGeometry(2,8,6),std(0x3f7a3a),trees.map(p=>[p[0],p[1]+4.2,p[2]]));
  inst(new THREE.CylinderGeometry(.1,.1,8,6),std(0x555555),poles);
  const st=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400).rotateX(-Math.PI/2),std(0x37383a,1));st.position.y=Y0-.02;st.receiveShadow=true;scene.add(st);

  let far=null,farMat=null,sky=null,farN=900,detail=1,night=0;
  function addFar(){
    const [m,e]=facades(rng,6);farMat=new THREE.MeshLambertMaterial({map:m,emissiveMap:e,emissive:0xffffff,emissiveIntensity:night*.6});
    far=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),farMat,farN);const d=new THREE.Object3D();
    for(let i=0;i<farN;i++){const r=110+rng()*350,a=rng()*6.283,h=15+rng()*rng()*60;
      d.position.set(8+r*Math.cos(a),Y0+h/2,5+r*Math.sin(a));d.scale.set(12+rng()*14,h,12+rng()*14);d.updateMatrix();far.setMatrixAt(i,d.matrix);
      const g=.55+rng()*.4;far.setColorAt(i,new THREE.Color(g,g*.95,g*.85));}
    far.count=Math.floor(farN*detail);scene.add(far);
    const c=document.createElement('canvas');c.width=1024;c.height=128;const x=c.getContext('2d');x.fillStyle='#fff';
    for(let px=0;px<1024;px+=4+rng()*30){const w=8+rng()*30,h=20+rng()*90;x.fillRect(px,128-h,w,h);px+=w;}
    const t=new THREE.CanvasTexture(c);
    sky=new THREE.Mesh(new THREE.CylinderGeometry(560,560,90,48,1,true),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));
    sky.position.set(8,Y0+45,5);scene.add(sky);
  }
  return{addFar,
    setDetail(f){detail=f;if(far)far.count=Math.floor(farN*f);},
    setNight(n){night=n;near.emissiveIntensity=n*.9;if(farMat)farMat.emissiveIntensity=n*.6;},
    tint(c){if(sky)sky.material.color.copy(c).multiplyScalar(.8);}};
}
