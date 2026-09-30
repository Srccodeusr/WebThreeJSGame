export class AudioManager{
  ctx=null;master=null;traffic=null;
  start(){
    if(this.ctx){this.ctx.resume?.();return;}
    try{
      const c=this.ctx=new (window.AudioContext||window.webkitAudioContext)(),g=c.createGain();g.gain.value=.12;g.connect(c.destination);this.master=g;
      const o=c.createOscillator(),og=c.createGain();o.type='triangle';o.frequency.value=55;og.gain.value=.025;o.connect(og).connect(g);o.start();
    }catch(e){console.warn('Audio unavailable',e);}
  }
  tone(f,d,v=.12,type='sine'){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g).connect(this.master||c.destination);o.start();o.stop(c.currentTime+d);}
  step(){this.tone(70+Math.random()*25,.07,.11,'triangle');}
  walk(){this.tone(95,.055,.035,'triangle');}
  click(){this.tone(900,.05,.12);}
  horn(type=0){this.tone(type===2?180:310,.18,.09,'sawtooth');setTimeout(()=>this.tone(type===2?140:240,.12,.055,'sawtooth'),90);}
  tram(){this.tone(520,.35,.07,'sine');}
  bell(){this.tone(740,.12,.05,'sine');}
}
