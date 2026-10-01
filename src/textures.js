import * as THREE from 'three';
export const mk=(s,f)=>{const c=document.createElement('canvas');c.width=c.height=s;f&&f(c.getContext('2d'),s);return c;};
export const tex=(c,srgb)=>{const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;};
export const lcg=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
export const paint=(g,c)=>{const k=new THREE.Color(c),n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([k.r,k.g,k.b],i*3);g.setAttribute('color',new THREE.BufferAttribute(a,3));return g;};
// Height canvas (red channel) -> tangent-space normal map texture.
export function normalFrom(h,k=3){const s=h.width,d=h.getContext('2d').getImageData(0,0,s,s).data,g=(i,j)=>d[(((j+s)%s)*s+((i+s)%s))*4]/255,c=mk(s),x=c.getContext('2d'),o=x.createImageData(s,s);
  for(let j=0;j<s;j++)for(let i=0;i<s;i++){const a=(g(i-1,j)-g(i+1,j))*k,b=(g(i,j+1)-g(i,j-1))*k,l=Math.hypot(a,b,1),p=(j*s+i)*4;o.data[p]=(a/l*.5+.5)*255;o.data[p+1]=(b/l*.5+.5)*255;o.data[p+2]=(.5/l+.5)*255;o.data[p+3]=255;}
  x.putImageData(o,0,0);return tex(c);}
export function boxUV(g,w,h,d,s=3){const u=g.attributes.uv,z=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let i=0;i<u.count;i++){const f=i>>2;u.setXY(i,u.getX(i)*z[f][0]/s,u.getY(i)*z[f][1]/s);}}
const dots=(x,s,n,r,lo,hi,sz)=>{for(let i=0;i<n;i++){const v=lo+r()*(hi-lo);x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(r()*s,r()*s,1+r()*sz,1+r()*sz);}};
export function asphalt(){const r=lcg(5);
  const H=mk(512,(x,s)=>{x.fillStyle='#777';x.fillRect(0,0,s,s);dots(x,s,14000,r,60,200,3);});
  const C=mk(512,(x,s)=>{x.fillStyle='#2b2c2e';x.fillRect(0,0,s,s);dots(x,s,9000,r,22,70,3);x.globalAlpha=.14;x.strokeStyle='#000';x.lineWidth=3;
    for(let i=0;i<7;i++){x.beginPath();x.moveTo(r()*s,0);x.bezierCurveTo(r()*s,s/3,r()*s,s*.6,r()*s,s);x.stroke();}
    x.globalAlpha=.07;x.fillStyle='#000';for(let i=0;i<10;i++)x.fillRect(r()*s,0,14+r()*20,s);});
  return{map:tex(C,1),normalMap:normalFrom(H,2.5)};}
export function pave(){const r=lcg(9),grid=(x,s,c)=>{x.fillStyle=c;for(let i=0;i<=s;i+=64){x.fillRect(i-2,0,4,s);x.fillRect(0,i-2,s,4);}};
  const H=mk(256,(x,s)=>{x.fillStyle='#bbb';x.fillRect(0,0,s,s);dots(x,s,2500,r,150,210,2);grid(x,s,'#222');});
  const C=mk(256,(x,s)=>{x.fillStyle='#8f8b82';x.fillRect(0,0,s,s);dots(x,s,2500,r,100,170,2);grid(x,s,'#4a4741');});
  return{map:tex(C,1),normalMap:normalFrom(H,3)};}
export const zebra=()=>tex(mk(128,(x,s)=>{x.fillStyle='#e8e6dc';for(let i=0;i<4;i++)x.fillRect(i*32+6,0,20,s);}),1);
export const dash=()=>tex(mk(128,(x,s)=>{x.fillStyle='#e9d98a';x.fillRect(0,0,s,s/2);}),1);
// Plaster facade with recessed framed windows, sills, weathering streaks. Returns [colour, emissive, normal].
export function facade(n,r,c=128){const S=c*n,A=mk(S),B=mk(S),E=mk(S),a=A.getContext('2d'),b=B.getContext('2d'),e=E.getContext('2d'),f=c/128;
  a.fillStyle='#f1ece0';a.fillRect(0,0,S,S);b.fillStyle='#b4b4b4';b.fillRect(0,0,S,S);e.fillStyle='#000';e.fillRect(0,0,S,S);
  a.globalAlpha=.07;for(let i=0;i<600;i++){a.fillStyle=r()<.5?'#000':'#fff';a.fillRect(r()*S,r()*S,2+r()*12,10+r()*70);}
  a.fillStyle='#4a3a2a';for(let i=0;i<40;i++)a.fillRect(r()*S,r()*S,3+r()*5,30+r()*80);a.globalAlpha=1;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=i*c+28*f,y=j*c+24*f,w=72*f,h=70*f;
    a.fillStyle='#d6cfbd';a.fillRect(x-6*f,y-6*f,w+12*f,h+12*f);
    const g=a.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#6b8799');g.addColorStop(.5,'#2f3f4b');g.addColorStop(1,'#1a232b');a.fillStyle=g;a.fillRect(x,y,w,h);
    a.fillStyle='#e6e1d4';a.fillRect(x+w/2-2*f,y,4*f,h);a.fillRect(x,y+h*.42,w,4*f);
    a.fillStyle='#8c8678';a.fillRect(x-10*f,y+h+6*f,w+20*f,7*f);a.fillStyle='rgba(55,40,28,.22)';a.fillRect(x+2*f,y+h+13*f,w-4*f,22*f);
    b.fillStyle='#2a2a2a';b.fillRect(x,y,w,h);b.fillStyle='#e0e0e0';b.fillRect(x-10*f,y+h+6*f,w+20*f,7*f);b.fillRect(x-6*f,y-6*f,w+12*f,3*f);
    if(r()<.55){e.fillStyle=r()<.5?'#ffd28a':'#fff1c9';e.fillRect(x,y,w,h);}}
  return[tex(A,1),tex(E,1),normalFrom(B,3)];}
