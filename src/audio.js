// Fully procedural audio: traffic bed, tyre hiss, reunion chatter, horns, crows, footsteps. Indoor/outdoor muffling.
export class AudioManager{
  ctx=null;master=null;bus=null;crowdLvl=0;ind=false;
  noise(sec,brown){const c=this.ctx,b=c.createBuffer(1,c.sampleRate*sec,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;l=(l+.02*w)/1.02;d[i]=brown?l*3.5:w;}return b;}
  loop(buf,type,f,q,g,dest=this.bus){const c=this.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),gn=c.createGain();s.buffer=buf;s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=q;gn.gain.value=g;s.connect(fl).connect(gn).connect(dest);s.start();return{fl,gn};}
  start(){
    if(this.ctx){this.ctx.resume?.();return;}
    try{
      const c=this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      this.master=c.createGain();this.master.gain.value=.55;this.bus=c.createBiquadFilter();this.bus.type='lowpass';this.bus.frequency.value=12000;this.bus.connect(this.master).connect(c.destination);
      const br=this.noise(3,true);this.wh=this.noise(2,false);
      this.rumble=this.loop(br,'lowpass',380,.7,.3);this.hiss=this.loop(this.wh,'bandpass',2400,.6,0);this.crowd=this.loop(this.wh,'bandpass',700,1.2,0,this.master);
      setInterval(()=>{const t=c.currentTime;this.crowd.gn.gain.setTargetAtTime(this.crowdLvl*(.3+Math.random()),t,.07);this.crowd.fl.frequency.setTargetAtTime(450+Math.random()*800,t,.1);},150);
      setInterval(()=>{if(!this.ind&&Math.random()<.5)this.crow();},9000);
    }catch(e){console.warn('Audio unavailable',e);}
  }
  // Called each frame: indoor flag + distance to nearest vehicle (m).
  env(ind,near){if(!this.ctx)return;this.ind=ind;const t=this.ctx.currentTime,n=Math.max(0,1-near/40);
    this.bus.frequency.setTargetAtTime(ind?900:12000,t,.25);this.rumble.gn.gain.setTargetAtTime((ind?.12:.28)+n*(ind?.08:.3),t,.3);
    this.hiss.gn.gain.setTargetAtTime(Math.max(0,1-near/18)*(ind?.01:.06),t,.15);this.crowdLvl=ind?.14:.03;}
  tone(f,d,v=.12,type='sine',dest){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g).connect(dest||this.master||c.destination);o.start();o.stop(c.currentTime+d);}
  burst(f,d,v,type='lowpass'){const c=this.ctx;if(!c||!this.wh)return;const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=this.wh;fl.type=type;fl.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);s.connect(fl).connect(g).connect(this.master);s.start(c.currentTime,Math.random());s.stop(c.currentTime+d);}
  step(){this.burst(350+Math.random()*180,.11,.6);}
  walk(){this.burst(300,.08,.08);}
  click(){this.tone(900,.05,.12);}
  horn(type=0,dist=10){const v=.2/(1+dist/8),f=type===2?170:type===1?560:380;this.tone(f,.35,v,'sawtooth',this.bus);this.tone(f*1.26,.35,v*.8,'sawtooth',this.bus);if(type===1)setTimeout(()=>this.tone(f,.2,v,'sawtooth',this.bus),380);}
  crow(){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type='sawtooth';o.frequency.setValueAtTime(650,t);o.frequency.exponentialRampToValueAtTime(380,t+.28);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g).connect(this.bus);o.start(t);o.stop(t+.3);}
  tram(){this.tone(520,.35,.07,'sine',this.bus);}
  bell(){this.tone(740,.12,.05,'sine',this.bus);}
}
