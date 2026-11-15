/* musik-fx.js — effets de Musik qui demandent un calcul échantillon par échantillon (AudioWorklet).
   15 nov. 2026, 20 h 29 (Mauk Tenieb : « tous les effets FruityLoops. Ou les meilleurs. Les plus forts, les plus insolites et singuliers ») :
   GROSS  bégaie et coupe le son en rythme, comme Gross Beat ;
   CRUSH  réduit bits et fréquence d'échantillonnage, comme Fruity Bitcrusher ;
   GRAIN  émiette la dernière seconde en grains, comme Fruity Granulizer ;
   REVS   rejoue chaque tranche du tempo à l'envers ;
   RING   module le son par une sinusoïde, de la cloche au métal.
   Paramètres : amt (0 à 1), step (durée d'un pas, en s). */
class MzFx extends AudioWorkletProcessor{
  static get parameterDescriptors(){return [{name:'amt',defaultValue:.5,minValue:0,maxValue:1,automationRate:'k-rate'},{name:'step',defaultValue:.156,minValue:.02,maxValue:2,automationRate:'k-rate'}]}
  constructor(o){super();this.mode=(o&&o.processorOptions&&o.processorOptions.mode)||'crush';this.port.onmessage=e=>{if(e.data&&e.data.mode)this.mode=e.data.mode};
    this.N=sampleRate*2|0;this.buf=[new Float32Array(this.N),new Float32Array(this.N)];this.w=0;this.n=0;this.hold=[0,0];this.ph=0;this.seed=1234567;
    this.gr=[];for(let i=0;i<24;i++)this.gr.push({on:false,pos:0,len:1,t:0,rate:1});}
  rnd(){let s=this.seed;s^=s<<13;s^=s>>>17;s^=s<<5;this.seed=s>>>0;return this.seed/4294967296}
  process(inputs,outputs,P){const inp=inputs[0],out=outputs[0];if(!out||!out.length)return true;const L=out[0].length,ch=out.length,amt=P.amt[0],step=P.step[0],sr=sampleRate,N=this.N;
    for(let i=0;i<L;i++){
      for(let c=0;c<ch;c++){const x=inp&&inp[c]?inp[c][i]:(inp&&inp[0]?inp[0][i]:0);this.buf[c%2][this.w]=x}
      const t=this.n,w=this.w;let y0=0,y1=0;
      switch(this.mode){
        case 'crush':{const ds=1+Math.floor(amt*amt*40),bits=Math.max(2,16-amt*13),q=Math.pow(2,bits-1);
          if(t%ds===0)for(let c=0;c<2;c++)this.hold[c]=Math.round(this.buf[c][w]*q)/q;y0=this.hold[0];y1=this.hold[1];break}
        case 'gross':{/* un segment de 4 pas ; on en rejoue le début à une cadence de 1/2, 1/4 ou 1/8 de pas selon la dose, et une porte coupe la fin de chaque répétition */
          const seg=Math.max(64,Math.round(step*4*sr)),pos=t%seg,div=amt<.34?2:amt<.67?4:8,rep=Math.max(32,Math.round(step*sr/div*2)),inRep=pos%rep;
          const back=(w-pos+inRep+N)%N,gate=inRep<rep*(1-amt*.55)?1:0,env=Math.min(1,inRep/64)*Math.min(1,(rep-inRep)/64);
          y0=this.buf[0][back]*gate*env;y1=this.buf[1][back]*gate*env;break}
        case 'revs':{const sl=Math.max(64,Math.round(step*sr*(amt<.5?1:2))),p=t%sl,src=(w-p-(sl-p)+N)%N,k=(src+(sl-p))%N,env=Math.min(1,p/48)*Math.min(1,(sl-p)/48);
          y0=this.buf[0][(w-2*p+N)%N]*env;y1=this.buf[1][(w-2*p+N)%N]*env;break}
        case 'ring':{const f=30*Math.pow(66,amt);this.ph+=f/sr;if(this.ph>1)this.ph-=1;const m=Math.sin(this.ph*6.2831853);y0=this.buf[0][w]*m;y1=this.buf[1][w]*m;break}
        case 'grain':{/* nouveaux grains à une densité qui monte avec la dose ; chacun relit un éclat de la dernière seconde, parfois à l'envers ou transposé */
          if(this.rnd()<(4+amt*60)/sr){const g=this.gr.find(q=>!q.on);if(g){g.on=true;g.len=Math.round(sr*(.02+this.rnd()*.12));g.t=0;g.pos=(w-Math.round(this.rnd()*sr*.9)-g.len+N)%N;
            const r=this.rnd();g.rate=r<.2?-1:r<.35?2:r<.5?.5:1}}
          for(const g of this.gr){if(!g.on)continue;const k=g.t/g.len,e=Math.sin(Math.PI*k),idx=(g.pos+Math.floor(g.t*g.rate)+N*4)%N;y0+=this.buf[0][idx]*e*.6;y1+=this.buf[1][idx]*e*.6;if(++g.t>=g.len)g.on=false}
          const dry=1-amt;y0+=this.buf[0][w]*dry;y1+=this.buf[1][w]*dry;break}
        default:y0=this.buf[0][w];y1=this.buf[1][w]}
      out[0][i]=y0;if(ch>1)out[1][i]=y1;
      this.w=(w+1)%N;this.n++}
    return true}}
registerProcessor('mz-fx',MzFx);
