import * as THREE from 'three';
const T=[
  {sky:0xa9c7dc,sun:0xffd9a8,si:2.2,p:[-25,18,-20],h:.9,night:0},
  {sky:0x8fc0e8,sun:0xfff2dc,si:3,p:[15,40,-10],h:1.1,night:0},
  {sky:0xe08a4a,sun:0xff8a3a,si:2,p:[-35,6,10],h:.6,night:.4},
  {sky:0x0b1226,sun:0x5570aa,si:.25,p:[10,30,10],h:.3,night:1}];
function makeRain(scene,n){
  const g=new THREE.BufferGeometry(),a=new Float32Array(n*3);
  for(let i=0;i<n;i++)a.set([(Math.random()-.5)*40,Math.random()*20,(Math.random()-.5)*40],i*3);
  g.setAttribute('position',new THREE.BufferAttribute(a,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({color:0xaaccee,size:.06,transparent:true,opacity:.6,depthWrite:false}));
  p.visible=false;p.frustumCulled=false;scene.add(p);
  return{obj:p,update(dt,c){if(!p.visible)return;const q=g.attributes.position.array;for(let i=1;i<q.length;i+=3){q[i]-=16*dt;if(q[i]<0)q[i]+=20;}
    g.attributes.position.needsUpdate=true;p.position.set(c.x,c.y-6,c.z);}};
}
export function makeLighting(scene,rainCount=1500){
  const hemi=new THREE.HemisphereLight(0xffffff,0x554a3e,1),sun=new THREE.DirectionalLight(0xffffff,3),sc=sun.shadow.camera;
  sun.target.position.set(7,0,5);sc.left=sc.bottom=-26;sc.right=sc.top=26;sc.near=1;sc.far=140;sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
  scene.add(hemi,sun,sun.target);scene.fog=new THREE.Fog(0,30,480);
  const rain=makeRain(scene,rainCount);
  function setTime(i,r){
    const t=T[i],c=new THREE.Color(t.sky);if(r)c.lerp(new THREE.Color(0x666b70),.6);
    sun.color.set(t.sun);sun.intensity=t.si*(r?.5:1);sun.position.set(7+t.p[0],t.p[1],5+t.p[2]);
    hemi.intensity=t.h*(r?.8:1);hemi.color.copy(c).lerp(new THREE.Color(0xffffff),.5);
    scene.background=c;scene.fog.color.copy(c);return t.night;
  }
  return{sun,rain,setTime,update:(dt,pos)=>rain.update(dt,pos)};
}
