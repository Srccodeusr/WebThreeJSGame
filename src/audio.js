// Synthesised placeholder audio (no asset files). Starts only after a user gesture.
export class AudioManager{
  ctx=null;
  start(){
    if(this.ctx)return;
    try{
      const c=this.ctx=new (window.AudioContext||window.webkitAudioContext)(),n=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=n.getChannelData(0);let l=0;
      for(let i=0;i<d.length;i++){l=l*.98+(Math.random()*2-1)*.02;d[i]=l*8;}
      const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=n;s.loop=true;f.type='lowpass';f.frequency.value=600;g.gain.value=.12;
      s.connect(f).connect(g).connect(c.destination);s.start();
    }catch(e){console.warn('Audio unavailable',e);}
  }
  tone(f,d,v){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+d);}
  step(){this.tone(60+Math.random()*30,.08,.15);}
  click(){this.tone(900,.05,.2);}
}
