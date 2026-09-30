import * as THREE from 'three';
// Apartment (x0..14, z0..10, y0..3), balcony (north), stairwell (east), roof (y3.2) and rooftop bathroom. Units: metres.
const G=new THREE.BoxGeometry(1,1,1),CG=new THREE.CylinderGeometry(1,1,1,16),SG=new THREE.SphereGeometry(1,12,8),SP=new THREE.PlaneGeometry(1,1);
let s0=7;const rnd=()=>(s0=(s0*16807)%2147483647)/2147483647;
const cv=(s,f)=>{const c=document.createElement('canvas');c.width=c.height=s;f(c.getContext('2d'),s);const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;};
const spk=(x,s,n,cols,r,a)=>{x.globalAlpha=a;for(let i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.fillRect(rnd()*s,rnd()*s,r*(.5+rnd()),r*(.5+rnd()));}x.globalAlpha=1;};
const M=(c,r=.8,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,...o});

export function buildWorld(scene){
  const worldChildren=new Set(scene.children);
  const colliders=[],hit=[],tg=[],fans=[],lights=[],groups={},rooms=[];
  // [name,x0,z0,x1,z1,level] level 0 apartment, 1 roof, 2 both
  for(const [n,x0,z0,x1,z1,l] of [['living',0,0,7,5,0],['dining',7,0,14,5,0],['kitchen',10,5,14,10,0],['b1',0,5,4.5,10,0],['bath',4.5,5,6.5,10,0],
    ['b2',6.5,5,10,10,0],['balcony',0,-2,7,0,0],['stairs',14,0,16.4,12,2],['roof',-1,-2,14,12,1],['rbath',9,6,11.6,8.6,1]]){
    const g=new THREE.Group();scene.add(g);groups[n]=g;rooms.push({g,x0,z0,x1,z1,l});}
  const shell=new THREE.Group();scene.add(shell);let cur=groups.living;const at=n=>{cur=groups[n];};

  const terr=cv(256,(x,s)=>{x.fillStyle='#cdbb9d';x.fillRect(0,0,s,s);spk(x,s,900,['#f2e8d3','#8a7860','#a3927a','#d8a37a','#fff'],5,.7);});
  const concT=cv(256,(x,s)=>{x.fillStyle='#8e8b85';x.fillRect(0,0,s,s);spk(x,s,1200,['#a29f98','#6f6c66','#9a968e'],4,.5);spk(x,s,25,['#5a564e'],30,.08);});
  const paintT=cv(256,(x,s)=>{x.fillStyle='#fff';x.fillRect(0,0,s,s);spk(x,s,250,['#c9c0a8','#fff8e6'],14,.12);});
  const tileT=cv(128,(x,s)=>{x.fillStyle='#e9e6dc';x.fillRect(0,0,s,s);x.strokeStyle='#aaa6a0';x.lineWidth=3;x.strokeRect(0,0,s,s);spk(x,s,60,['#d4d0c4'],6,.3);});
  const stainT=cv(64,(x,s)=>{const g=x.createRadialGradient(s/2,s/2,2,s/2,s/2,s/2);g.addColorStop(0,'rgba(60,45,30,.9)');g.addColorStop(1,'rgba(60,45,30,0)');x.fillStyle=g;x.fillRect(0,0,s,s);});
  const mats={floor:M(0xffffff,.35,{map:terr}),tile:M(0xffffff,.3,{map:tileT}),conc:M(0xffffff,.95,{map:concT}),paint:M(0xe3d5ae,.92,{map:paintT}),
    ceil:M(0xf0ece0,.95,{map:paintT}),body:M(0xb8a686,.95,{map:paintT}),wood:M(0x7a5230,.55),dwood:M(0x4a2f1c,.6),fabric:M(0x7c2f2f,1),fabric2:M(0xd9a441,1),
    bedding:M(0x9db8c9,1),white:M(0xeeeeea,.5),black:M(0x151515,.4),metal:M(0x60666a,.45,{metalness:.8}),plastic:M(0xd9d9d2,.5),
    glass:M(0x9fc0c8,.1,{transparent:true,opacity:.28,depthWrite:false}),green:M(0x3f7a3a,.9),tank:M(0x1d2a3a,.7),pipe:M(0x7d7f80,.6,{metalness:.5}),
    red:M(0xb23a24,.6),bucket:M(0x2e63b5,.5),pot:M(0xa8552e,.9),brass:M(0xc9a13a,.3,{metalness:1}),frame:M(0x8a5a3c,.7),
    water:M(0x8fc7ff,.1,{transparent:true,opacity:.55}),fridge:M(0xd8dde0,.35),mirror:M(0xcfe0e6,.05,{metalness:.9}),
    stain:M(0x4a3a2a,1,{transparent:true,opacity:.22,map:stainT,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false}),dish:M(0xdddddd,.5,{side:THREE.DoubleSide})};

  const K=(x0,x1,y0,y1,z0,z1)=>colliders.push({x0,x1,y0,y1,z0,z1});
  const B=(m,x,y,z,w,h,d,col,p=cur)=>{const o=new THREE.Mesh(G,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);
    if(col)K(x-w/2,x+w/2,y-h/2,y+h/2,z-d/2,z+d/2);return o;};
  const Cy=(m,x,y,z,r,h,col,p=cur)=>{const o=new THREE.Mesh(CG,m);o.scale.set(r,h,r);o.position.set(x,y,z);o.castShadow=true;p.add(o);
    if(col)K(x-r,x+r,y-h/2,y+h/2,z-r,z+r);return o;};
  const P=(m,x0,z0,x1,z1,y,s=2,p=shell)=>{const g=new THREE.PlaneGeometry(x1-x0,z1-z0).rotateX(-Math.PI/2),u=g.attributes.uv;
    for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*(x1-x0)/s,u.getY(i)*(z1-z0)/s);const o=new THREE.Mesh(g,m);o.position.set((x0+x1)/2,y,(z0+z1)/2);o.receiveShadow=true;p.add(o);};
  const inst=(g,m,l,p=cur)=>{const o=new THREE.InstancedMesh(g,m,l.length),d=new THREE.Object3D();
    l.forEach((a,i)=>{d.position.set(a[0],a[1],a[2]);d.scale.set(a[3],a[4],a[5]);d.updateMatrix();o.setMatrixAt(i,d.matrix);});o.castShadow=true;p.add(o);};
  const plants=(l,y)=>{inst(CG,mats.pot,l.map(([x,z])=>[x,y+.2,z,.2,.4,.2]));inst(SG,mats.green,l.map(([x,z])=>[x,y+.65,z,.32,.3,.32]));};

  // interaction helpers
  const hinge=(pv,mesh,max,label,c)=>{const o={pv,cur:0,t:0,max,label,use(){o.t=o.t?0:1;if(c)c.on=!o.t;}};mesh.userData.it=o;hit.push(mesh);tg.push(o);};
  const L=(x,y,z)=>{const l=new THREE.PointLight(0xffe2b0,14,11,1.6);l.position.set(x,y,z);l.visible=false;scene.add(l);lights.push(l);return l;};
  const SW=(x,y,z,l,ry=0)=>{const s=B(mats.white,x,y,z,.08,.12,.03,0,shell);s.rotation.y=ry;s.userData.it={label:'Light switch',use(){l.visible=!l.visible;}};hit.push(s);};
  const tap=(x,y,z)=>{const t=Cy(mats.metal,x,y,z,.025,.2,0),w=Cy(mats.water,x,y-.3,z,.012,.5,0);w.visible=false;
    t.userData.it={label:'Water tap',use(){w.visible=!w.visible;}};hit.push(t);};
  const fan=(x,z)=>{const g=new THREE.Group();g.position.set(x,2.85,z);Cy(mats.metal,0,0,0,.1,.08,0,g);
    for(let i=0;i<3;i++){const a=i*2.094,b=new THREE.Mesh(G,mats.white);b.scale.set(.6,.015,.12);b.position.set(Math.cos(a)*.35,0,-Math.sin(a)*.35);b.rotation.y=a;g.add(b);}cur.add(g);fans.push(g);};
  const chair=(x,z,ry=0,y=0,m=mats.plastic)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;cur.add(g);
    B(m,0,.45,0,.42,.05,.42,0,g);B(m,0,.7,-.2,.42,.5,.05,0,g);for(const dx of [-.18,.18])for(const dz of [-.18,.18])B(m,dx,.22,dz,.04,.44,.04,0,g);
    K(x-.22,x+.22,y,y+.9,z-.22,z+.22);};
  const pipe=(x,y,z,l,rx,rz)=>{const o=new THREE.Mesh(CG,mats.pipe);o.scale.set(.05,l,.05);o.position.set(x,y,z);o.rotation.set(rx,0,rz);cur.add(o);};
  const stain=(x,y,z,s,ry)=>{const o=new THREE.Mesh(SP,mats.stain);o.scale.set(s,s*1.6,1);o.position.set(x,y,z);o.rotation.y=ry;shell.add(o);};

  function door(ax,f,a,b,yb){
    const w=b-a,pv=new THREE.Group(),x=ax==='x',l=new THREE.Mesh(G,mats.wood);
    pv.position.set(x?a:f,yb,x?f:a);l.scale.set(x?w-.04:.05,2.05,x?.05:w-.04);l.position.set(x?w/2:0,1.025,x?0:w/2);l.castShadow=true;pv.add(l);shell.add(pv);
    const c={x0:x?a:f-.04,x1:x?b:f+.04,z0:x?f-.04:a,z1:x?f+.04:b,y0:yb,y1:yb+2.05};colliders.push(c);hinge(pv,l,Math.PI/2*1.05,'Open / close door',c);
  }
  // wall along axis ax ('x': runs along x at z=f), openings: {a,b,door|glass|(pass),y0,y1}
  function W(ax,f,a0,a1,ops=[],yb=0,H=3,m=mats.paint,t=.15){
    const seg=(s,e,y0,y1)=>{if(e-s<.01||y1-y0<.01)return;const c=(s+e)/2,l=e-s,y=yb+(y0+y1)/2;ax==='x'?B(m,c,y,f,l,y1-y0,t,1,shell):B(m,f,y,c,t,y1-y0,l,1,shell);};
    let c=a0;
    for(const o of [...ops].sort((p,q)=>p.a-q.a)){
      const y0=o.y0??0,y1=o.y1??2.1,mid=(o.a+o.b)/2,l=o.b-o.a;seg(c,o.a,0,H);seg(o.a,o.b,0,y0);seg(o.a,o.b,y1,H);
      if(o.door)door(ax,f,o.a,o.b,yb);
      else if(o.glass){const g=ax==='x'?B(mats.glass,mid,yb+(y0+y1)/2,f,l,y1-y0,.03,1,shell):B(mats.glass,f,yb+(y0+y1)/2,mid,.03,y1-y0,l,1,shell);g.castShadow=false;}
      c=o.b;
    }
    seg(c,a1,0,H);
  }
  const win=(a,b,y0=.9,y1=2.2)=>({a,b,y0,y1,glass:1});

  // ---- structure ----
  P(mats.floor,0,0,14,10,.005,1.5);P(mats.tile,4.5,5,6.5,10,.01,.6);P(mats.tile,10,5,14,10,.01,.6);P(mats.conc,0,-2,7,0,.005,2);
  B(mats.conc,3.5,-.15,-1,7,.3,2,0,shell);B(mats.body,8.2,-4.65,4,16.4,8.7,12,0,shell);
  B(mats.ceil,6.5,3.05,5,15,.1,14,0,shell);B(mats.conc,6.5,3.15,5,15,.1,14,1,shell);B(mats.conc,15.2,3.1,11,2.4,.2,2,1,shell);
  W('x',0,0,14,[win(1,3.2),{a:5,b:6.1,door:1},win(8,10.5),win(11.5,13)]);
  W('x',10,0,14,[win(2,3.5),win(7.5,9.5),{a:5.2,b:5.9,y0:1.9,y1:2.4,glass:1}]);
  W('z',0,0,10,[win(6.8,8.2)]);W('z',14,0,10,[{a:.8,b:1.8,door:1},win(7,8.5,1.1,2.1)]);
  W('x',5,0,14,[{a:1,b:1.9,door:1},{a:5,b:5.9,door:1},{a:7.5,b:8.4,door:1},{a:11,b:12.1}]);
  W('z',4.5,5,10);W('z',6.5,5,10);W('z',10,5,10);
  // stairwell (east): 20 steps, 0.16 rise / 0.37 tread, landing to roof
  at('stairs');P(mats.conc,14,0,16.4,2.6,.01,2,cur);
  for(let i=0;i<20;i++){const top=.16*(i+1);B(mats.conc,15.2,top/2,2.6+i*.37+.185,2.2,top,.37,1);}
  B(mats.paint,16.35,2.2,6,.1,4.4,12,1,shell);B(mats.paint,15.2,2.2,-.05,2.5,4.4,.1,1,shell);
  // roof parapets
  B(mats.conc,14,3.65,4,.12,.9,12,1,shell);B(mats.conc,-1,3.65,5,.12,.9,14,1,shell);B(mats.conc,6.5,3.65,-2,15,.9,.12,1,shell);B(mats.conc,7.7,3.65,12,17.4,.9,.12,1,shell);

  // ---- living + dining ----
  at('living');const lLiv=L(3.5,2.6,2.5);
  B(mats.fabric,3.3,.25,2.5,.9,.5,2.2,1);B(mats.fabric,3.75,.65,2.5,.2,.6,2.2,0);B(mats.dwood,1.9,.2,2.5,.9,.4,.6,1);
  B(mats.dwood,.3,.25,2.5,.5,.5,1.6,1);B(mats.black,.15,.85,2.5,.05,.55,1,0);
  B(mats.wood,.2,1.2,4.6,.3,.03,.5,0);Cy(mats.brass,.2,1.28,4.6,.04,.1,0);B(mats.red,.14,1.6,4.6,.02,.5,.4,0);
  B(mats.fabric2,2.1,1.55,.2,1.9,2.1,.05,0);B(mats.frame,3.5,1.8,4.92,.9,.6,.03,0);B(mats.white,4.2,.3,.09,.08,.08,.03,0,shell);
  SW(4.8,1.2,.09,lLiv);fan(3,2.5);
  at('dining');const lDin=L(10.5,2.6,2.6);
  B(mats.wood,10.5,.78,2.6,1.6,.05,.9,0);B(mats.wood,10.5,.38,2.6,.15,.74,.7,0);K(9.7,11.3,0,.8,2.15,3.05);
  chair(10.5,1.85,0,0,mats.wood);chair(10.5,3.35,Math.PI,0,mats.wood);chair(9.55,2.6,Math.PI/2,0,mats.wood);chair(11.45,2.6,-Math.PI/2,0,mats.wood);
  for(const x of [10.2,10.8])Cy(mats.white,x,.81,2.6,.12,.02,0);Cy(mats.green,10.5,.93,2.5,.04,.25,0);Cy(mats.bucket,10.7,.9,2.9,.05,.2,0);
  B(mats.fabric2,9.25,1.55,.2,2.7,2.1,.05,0);fan(10.5,2.6);SW(10.6,1.2,4.91,lDin);

  // ---- kitchen ----
  at('kitchen');const lKit=L(12,2.6,7.5);
  B(mats.wood,12,.45,9.65,3.6,.9,.6,1);B(mats.white,12,.92,9.65,3.7,.04,.65,0);B(mats.metal,11.2,.945,9.65,.6,.03,.4,0);tap(11.2,1.15,9.85);
  B(mats.black,13,.96,9.65,.55,.06,.5,0);Cy(mats.metal,12.85,.99,9.6,.07,.02,0);Cy(mats.metal,13.15,.99,9.6,.07,.02,0);
  B(mats.tile,12,1.45,9.93,3.7,.9,.03,0);B(mats.dwood,12,2.0,9.75,3.6,.7,.35,0);
  B(mats.fridge,13.4,.85,5.6,.7,1.7,.7,1);
  {const pv=new THREE.Group(),lf=new THREE.Mesh(G,mats.fridge);pv.position.set(13.05,0,5.97);lf.scale.set(.7,1.65,.05);lf.position.set(.35,.85,0);pv.add(lf);cur.add(pv);hinge(pv,lf,-1.9,'Open / close fridge');}
  Cy(mats.red,10.5,.3,9.3,.17,.6,1);B(mats.white,13.92,2.2,7.9,.04,.4,.4,0);
  for(const x of [10.6,12.3,12.8])B(mats.plastic,x,1.02,9.6,.15,.15,.15,0);
  SW(11.6,1.2,5.09,lKit);
  // ---- bedroom 1 ----
  at('b1');const lB1=L(2.2,2.6,7.5);
  B(mats.wood,1.1,.25,8.5,1.5,.5,2,1);B(mats.bedding,1.1,.58,8.6,1.4,.16,1.8,0);for(const x of [.8,1.4])B(mats.white,x,.72,7.8,.5,.1,.3,0);
  B(mats.dwood,4.2,1,7.5,.55,2,1.6,1);B(mats.wood,3,.75,9.6,1.2,.04,.6,1);chair(3,8.9,0,0,mats.wood);
  B(mats.fabric2,2.75,1.55,9.85,1.8,2.1,.05,0);B(mats.frame,.08,1.7,6.2,.03,.6,.45,0,shell);fan(2.2,7.5);SW(2.3,1.2,5.09,lB1);
  // ---- bedroom 2 ----
  at('b2');const lB2=L(8.2,2.6,7.5);
  B(mats.wood,8.3,.25,8.3,1.5,.5,2,1);B(mats.bedding,8.3,.58,8.4,1.4,.16,1.8,0);for(const x of [8,8.6])B(mats.white,x,.72,7.6,.5,.1,.3,0);
  B(mats.dwood,6.85,1,6.4,.5,2,1.4,1);B(mats.wood,9.3,.75,9.6,1.2,.04,.6,1);chair(9.3,8.9,0,0,mats.wood);
  B(mats.fabric2,8.5,1.55,9.85,2.1,2.1,.05,0);fan(8.2,7.5);SW(8.7,1.2,5.09,lB2);
  // ---- bathroom (Indian style) ----
  at('bath');const lBa=L(5.5,2.6,7.5);
  B(mats.white,5.6,.03,9,.5,.06,.7,0);Cy(mats.black,5.6,.065,9,.12,.01,0);B(mats.white,5.6,1.7,9.9,.5,.4,.15,0);
  B(mats.white,4.75,.85,7.5,.35,.15,.55,1);B(mats.white,4.75,.4,7.5,.15,.8,.15,1);B(mats.mirror,4.58,1.4,7.5,.02,.6,.5,0);tap(4.75,1.0,7.5);
  Cy(mats.metal,6.4,1.6,6.5,.02,1.8,0);B(mats.metal,6.3,2.5,6.5,.15,.03,.15,0);Cy(mats.bucket,6.05,.15,6.9,.16,.3,1);Cy(mats.bucket,5.7,.06,6.4,.07,.12,0);
  B(mats.tile,4.58,1,7.5,.02,2,4.9,0);B(mats.tile,6.42,1,7.5,.02,2,4.9,0);B(mats.black,5.5,.012,7.5,.25,.005,.25,0);B(mats.fabric2,6.4,1.5,8.6,.02,.7,.4,0);
  for(const z of [7.9,8.1,8.3])Cy(mats.white,4.62,1,z,.03,.16,0);SW(6.15,1.2,4.91,lBa);
  // ---- balcony ----
  at('balcony');L(3,2.6,-1);
  {const b=[];for(let x=0;x<=7;x+=.11)b.push([x,.55,-2,.02,1.1,.02]);for(let z=-2;z<=0;z+=.11){b.push([0,.55,z,.02,1.1,.02]);b.push([7,.55,z,.02,1.1,.02]);}inst(G,mats.metal,b);}
  B(mats.metal,3.5,1.1,-2,7,.04,.04,0);B(mats.metal,0,1.1,-1,.04,.04,2,0);B(mats.metal,7,1.1,-1,.04,.04,2,0);
  K(0,7,0,1.1,-2.05,-1.95);K(-.05,.05,0,1.1,-2,0);K(6.95,7.05,0,1.1,-2,0);
  chair(1.5,-1,Math.PI);B(mats.white,6.3,.4,-1.5,.8,.6,.3,1);plants([[.6,-1.5],[1.2,-1.6],[6.5,-.6]],0);
  for(const x of [3,4.6])B(mats.metal,x,.8,-1,.03,1.6,.03,0);B(mats.metal,3.8,1.6,-1,1.6,.03,.03,0);K(2.95,4.65,0,1.7,-1.05,-.95);
  for(const [x,m] of [[3.3,mats.fabric2],[3.8,mats.bedding],[4.2,mats.red],[3.55,mats.white]])B(m,x,1.25,-1,.35,.6,.03,0);
  // ---- roof ----
  at('roof');
  for(const z of [3,6.5]){B(mats.conc,2.5,3.6,z,1.8,.8,1.8,1);Cy(mats.tank,2.5,4.65,z,.8,1.3,1);}
  pipe(2.5,4.2,4.75,3.5,Math.PI/2,0);pipe(7,3.27,1,10,0,Math.PI/2);Cy(mats.pipe,3.5,3.7,3,.05,1,0);
  Cy(mats.metal,12.5,4.2,1.5,.03,2,0);{const d=new THREE.Mesh(new THREE.SphereGeometry(.45,12,6,0,Math.PI*2,0,1),mats.dish);d.position.set(12.5,5.2,1.5);d.rotation.x=-1;d.castShadow=true;cur.add(d);}
  for(const x of [3,8])Cy(mats.metal,x,4.1,10.6,.03,1.8,1);B(mats.white,5.5,4.85,10.6,5,.01,.01,0);
  for(let i=0;i<6;i++)B(i%2?mats.fabric2:mats.bedding,3.6+i*.7,4.5,10.6,.4,.6,.02,0);
  plants([[4,10],[6,11.3],[12,4],[12.6,5],[-.3,8]],3.2);chair(6,2.2,.6,3.2);chair(7.2,2.6,-.5,3.2);B(mats.metal,8.85,4.6,7.9,.1,.5,.4,0);
  B(mats.conc,10.3,5.85,7.3,2.8,.1,2.8,0);
  W('x',6,9,11.6,[],3.2,2.6,mats.conc);W('x',8.6,9,11.6,[],3.2,2.6,mats.conc);W('z',9,6,8.6,[{a:6.6,b:7.5,door:1}],3.2,2.6,mats.conc);
  W('z',11.6,6,8.6,[{a:7,b:7.8,y0:1.9,y1:2.35,glass:1}],3.2,2.6,mats.conc);
  at('rbath');const lRb=L(10.3,5.6,7.3);P(mats.tile,9,6,11.6,8.6,3.21,.6,cur);
  B(mats.white,11.2,3.4,6.7,.4,.4,.5,1);B(mats.white,11.35,3.75,6.7,.15,.35,.35,0);B(mats.white,10,4.05,8.3,.4,.15,.3,1);tap(10,4.2,8.3);
  Cy(mats.metal,10.6,4.6,8.45,.02,2.2,0);Cy(mats.bucket,9.5,3.35,8.2,.15,.3,1);Cy(mats.bucket,9.7,3.26,7.6,.07,.12,0);SW(9.1,4.4,8,lRb,Math.PI/2);
  // Bengali apartment details: family-sized dining setup, clothes drying rack and lived-in balcony.
  at('living');
  B(mats.wood,5.1,.78,2.55,4.2,.06,1.15,0); // long reunion table
  for(const x of [3.5,4.2,4.9,5.6]) chair(x,1.7,0,0,mats.wood);
  for(const x of [3.5,4.2,4.9,5.6]) chair(x,3.4,Math.PI,0,mats.wood);
  for(let i=0;i<7;i++){B(i%2?mats.red:mats.fabric2,.6+i*.9,1.35,-1.02,.55,.55,.035,0);B(mats.white,.6+i*.9,1.63,-1.02,.5,.035,.03,0);}
  at('balcony');
  B(mats.metal,3.5,.92,-1.25,6.2,.035,.035,0);B(mats.metal,3.5,1.48,-1.25,6.2,.035,.035,0);
  for(let i=0;i<8;i++)B(i%3===0?mats.red:i%3===1?mats.white:mats.fabric2,.7+i*.72,1.2,-1.25,.58,.42,.025,0);
  // weathering
  stain(10,4.6,8.69,1.4,0);stain(10,4.4,5.92,1,Math.PI);stain(16.24,2.5,5,1.4,-Math.PI/2);stain(2,2.2,4.92,1,Math.PI);stain(.08,2.3,1,1.1,Math.PI/2);

  // Enlarge the whole apartment while keeping its centre aligned with the neighbourhood.
  // Geometry, lights, interaction targets, room visibility and collision volumes are transformed together.
  const SCALE_XZ=1.62,SCALE_Y=1.22,CX=7,CZ=5;
  for(const o of scene.children){
    if(worldChildren.has(o))continue;
    o.position.x=CX+(o.position.x-CX)*SCALE_XZ;
    o.position.z=CZ+(o.position.z-CZ)*SCALE_XZ;
    o.position.y*=SCALE_Y;
    o.scale.x*=SCALE_XZ;o.scale.z*=SCALE_XZ;o.scale.y*=SCALE_Y;
  }
  for(const c of colliders){
    c.x0=CX+(c.x0-CX)*SCALE_XZ;c.x1=CX+(c.x1-CX)*SCALE_XZ;
    c.z0=CZ+(c.z0-CZ)*SCALE_XZ;c.z1=CZ+(c.z1-CZ)*SCALE_XZ;
    c.y0*=SCALE_Y;c.y1*=SCALE_Y;
  }
  for(const r of rooms){
    r.x0=CX+(r.x0-CX)*SCALE_XZ;r.x1=CX+(r.x1-CX)*SCALE_XZ;
    r.z0=CZ+(r.z0-CZ)*SCALE_XZ;r.z1=CZ+(r.z1-CZ)*SCALE_XZ;
  }
  const hall=groups.living;
  return{colliders,hit,mats,hall,scale:{xz:SCALE_XZ,y:SCALE_Y},
    setNight(n){lights.forEach(l=>{l.visible=n>.35;});},
    update(dt,p){
      for(const o of tg){o.cur+=(o.t-o.cur)*Math.min(1,dt*6);o.pv.rotation.y=o.cur*o.max;}
      for(const f of fans)f.rotation.y+=dt*4;
      const lvl=p.y>2.8?1:0;
      for(const r of rooms){const dx=Math.max(r.x0-p.x,0,p.x-r.x1),dz=Math.max(r.z0-p.z,0,p.z-r.z1);r.g.visible=(r.l===2||r.l===lvl)&&dx*dx+dz*dz<81;}
    }};
}
