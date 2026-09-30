import * as THREE from 'three';
export const Q={LOW:{pr:1,sh:0,city:.3},MEDIUM:{pr:1.25,sh:1024,city:.55},HIGH:{pr:1.75,sh:2048,city:.8},ULTRA:{pr:2.5,sh:4096,city:1}};
export function applyQuality(name,{renderer,sun,city},mobile){
  const q=Q[name]||Q.MEDIUM;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?Math.min(q.pr,1.5):q.pr));renderer.setSize(innerWidth,innerHeight);
  const s=mobile?Math.min(q.sh,1024):q.sh;sun.castShadow=s>0;
  if(s&&sun.shadow.mapSize.x!==s){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(s,s);}
  city.setDetail(mobile?q.city*.6:q.city);
}
// F1 UI, F2 wireframe, F3 stats, F4 colliders. Remove this class for production.
export class Debug{
  constructor(renderer,scene,colliders,hud,el){
    Object.assign(this,{renderer,scene,el,hud,f:0,t:0,wire:false,col:null,cs:colliders});
    addEventListener('keydown',e=>{
      if(e.code==='F1'){e.preventDefault();hud.classList.toggle('hidden');}
      if(e.code==='F2'){e.preventDefault();this.wire=!this.wire;scene.traverse(o=>{if(o.material)o.material.wireframe=this.wire;});}
      if(e.code==='F3'){e.preventDefault();el.classList.toggle('hidden');}
      if(e.code==='F4'){e.preventDefault();this.toggleCol();}});
  }
  toggleCol(){
    if(!this.col){this.col=new THREE.Group();for(const c of this.cs)this.col.add(new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(c.x0,c.y0,c.z0),new THREE.Vector3(c.x1,c.y1,c.z1)),0xff3030));this.scene.add(this.col);}
    else this.col.visible=!this.col.visible;
  }
  tick(dt){
    this.f++;this.t+=dt;if(this.t<.5)return;
    if(!this.el.classList.contains('hidden')){
      let v=0;this.scene.traverse(o=>{if(o.isMesh&&o.visible){let p=o.parent,ok=true;while(p){if(!p.visible){ok=false;break;}p=p.parent;}if(ok)v++;}});
      const i=this.renderer.info;
      this.el.textContent=`FPS ${Math.round(this.f/this.t)}\nFrame ${(this.t/this.f*1000).toFixed(1)} ms\nDraw calls ${i.render.calls}\nTriangles ${i.render.triangles}\nTextures ${i.memory.textures}\nVisible meshes ${v}`;
    }
    this.f=0;this.t=0;
  }
}
