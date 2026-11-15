/* musik-fx.js — effets de Musik qui demandent un calcul échantillon par échantillon (AudioWorklet).
   15 nov. 2026, 20 h 29 (Mauk Tenieb : « tous les effets FruityLoops. Ou les meilleurs. Les plus forts, les plus insolites et singuliers ») :
   GROSS  bégaie et coupe le son en rythme, comme Gross Beat ;
   CRUSH  réduit bits et fréquence d'échantillonnage, comme Fruity Bitcrusher ;
   GRAIN  émiette la dernière seconde en grains, comme Fruity Granulizer ;
   REVS   rejoue chaque tranche du tempo à l'envers ;
   RING   module le son par une sinusoïde, de la cloche au métal ;
   OCT    ajoute une et deux octaves sous le son, en bascule analogique (à la Boss OC-2) ;
   TAPE   écho de bande : tête de lecture qui pleure et scintille, boucle saturée et assourdie ;
   FDBK   larsen réglable : boucle courte à gain variable, du bourdon au hurlement ;
   METAL  tôle, ressort, plaque : quatre résonateurs inharmoniques excités par le son.
   Paramètres : amt (0 à 1), step (durée d'un pas, en s). */
class MzFx extends AudioWorkletProcessor{
  static get parameterDescriptors(){return [{name:'amt',defaultValue:.5,minValue:0,maxValue:1,automationRate:'k-rate'},{name:'step',defaultValue:.156,minValue:.02,maxValue:2,automationRate:'k-rate'}]}
  constructor(o){super();this.mode=(o&&o.processorOptions&&o.processorOptions.mode)||'crush';this.t0=0;this.port.onmessage=e=>{if(e.data&&e.data.t0!=null)this.t0=e.data.t0;if(e.data&&e.data.mode&&e.data.mode!==this.mode){this.mode=e.data.mode;this.d.fill(0);this.cb.forEach(b=>b.fill(0));this.buf.forEach(b=>b.fill(0));this.lp=this.lp2=this.hp=this.env=0}};
    const N=this.N=sampleRate*2|0;this.buf=[new Float32Array(this.N),new Float32Array(this.N)];this.w=0;this.n=0;this.hold=[0,0];this.ph=0;this.seed=1234567;
    this.d=new Float32Array(N);this.dw=0;this.ff=1;this.ff2=1;this.prev=0;this.env=0;this.lp=0;this.lp2=0;this.hp=0;this.sl=0;this.wph=0;this.fph=0;this.dr=0;
    this.cl=[163.1,271.3,389.7,547.9].map(f=>Math.round(sampleRate/f));this.cb=this.cl.map(n=>new Float32Array(n+2));this.ci=[0,0,0,0];this.cz=[0,0,0,0];
    this.gr=[];for(let i=0;i<24;i++)this.gr.push({on:false,pos:0,len:1,t:0,rate:1});}
  rnd(){let s=this.seed;s^=s<<13;s^=s>>>17;s^=s<<5;this.seed=s>>>0;return this.seed/4294967296}
  process(inputs,outputs,P){const inp=inputs[0],out=outputs[0];if(!out||!out.length)return true;const L=out[0].length,ch=out.length,amt=P.amt[0],step=P.step[0],sr=sampleRate,N=this.N;if(this.mode==='kill')return false;if(this.mode==='off'){for(let c=0;c<ch;c++)out[c].fill(0);return true}
    for(let i=0;i<L;i++){
      for(let c=0;c<ch;c++){const x=inp&&inp[c]?inp[c][i]:(inp&&inp[0]?inp[0][i]:0);this.buf[c%2][this.w]=x}
      const t=Math.max(0,currentFrame+i-this.t0),w=this.w;let y0=0,y1=0;
      switch(this.mode){
        case 'crush':{const ds=1+Math.floor(amt*amt*40),bits=Math.max(2,16-amt*13),q=Math.pow(2,bits-1);
          if(t%ds===0)for(let c=0;c<2;c++)this.hold[c]=Math.round(this.buf[c][w]*q)/q;y0=this.hold[0];y1=this.hold[1];break}
        case 'gross':{/* un segment de 4 pas ; on en rejoue le début à une cadence de 1/2, 1/4 ou 1/8 de pas selon la dose, et une porte coupe la fin de chaque répétition */
          const seg=Math.min(N-1,Math.max(64,Math.round(step*4*sr))),pos=t%seg,div=amt<.34?2:amt<.67?4:8,rep=Math.max(32,Math.round(step*sr/div*2)),inRep=pos%rep;
          const back=(w-pos+inRep+N)%N,gate=inRep<rep*(1-amt*.55)?1:0,env=Math.min(1,inRep/64)*Math.min(1,(rep-inRep)/64);
          y0=this.buf[0][back]*gate*env;y1=this.buf[1][back]*gate*env;break}
        case 'revs':{const sl=Math.min(N>>1,Math.max(64,Math.round(step*sr*(amt<.5?1:2)))),p=t%sl,env=Math.min(1,p/48)*Math.min(1,(sl-p)/48);
          y0=this.buf[0][(w-2*p+N)%N]*env;y1=this.buf[1][(w-2*p+N)%N]*env;break}
        case 'ring':{const f=30*Math.pow(66,amt);this.ph+=f/sr;if(this.ph>1)this.ph-=1;const m=Math.sin(this.ph*6.2831853)*1.38;y0=this.buf[0][w]*m;y1=this.buf[1][w]*m;break}
        case 'grain':{/* nouveaux grains à une densité qui monte avec la dose ; chacun relit un éclat de la dernière seconde, parfois à l'envers ou transposé */
          if(this.rnd()<(4+amt*60)/sr){const g=this.gr.find(q=>!q.on);if(g){g.on=true;g.len=Math.round(sr*(.02+this.rnd()*.12));g.t=0;g.pos=(w-Math.round(this.rnd()*sr*.9)-g.len+N)%N;
            const r=this.rnd();g.rate=r<.2?-1:r<.35?2:r<.5?.5:1}}
          for(const g of this.gr){if(!g.on)continue;const k=g.t/g.len,e=Math.sin(Math.PI*k),idx=(g.pos+Math.floor(g.t*g.rate)+N*4)%N;y0+=this.buf[0][idx]*e*.75;y1+=this.buf[1][idx]*e*.75;if(++g.t>=g.len)g.on=false}
          const dry=1-amt;y0+=this.buf[0][w]*dry;y1+=this.buf[1][w]*dry;break}
        case 'oct':{const m=(this.buf[0][w]+this.buf[1][w])*.5;this.lp+=(m-this.lp)*.08;const a=Math.abs(m);this.env+=(a-this.env)*(a>this.env?.02:.0006);
          if(this.prev<=0&&this.lp>0){this.ff=-this.ff;if(this.ff>0)this.ff2=-this.ff2}this.prev=this.lp;
          this.lp2+=((this.ff*.7+this.ff2*Math.max(0,amt-.5))*this.env*1.5-this.lp2)*.12;const dry=1-amt*.55;y0=this.buf[0][w]*dry+this.lp2*amt;y1=this.buf[1][w]*dry+this.lp2*amt;break}
        case 'tape':{const m=(this.buf[0][w]+this.buf[1][w])*.5;this.wph+=.55/sr;this.fph+=6.8/sr;if(this.rnd()<.0005)this.dr=(this.rnd()-.5)*.004;this.sl+=(this.dr-this.sl)*.00005;
          const dt=Math.min(1.5,step*3)*sr*(1+.0035*Math.sin(this.wph*6.2831853)+.0007*Math.sin(this.fph*6.2831853)+this.sl),r=this.dw-dt,i0=Math.floor(r),f=r-i0,a0=this.d[(i0+N*2)%N],a1=this.d[(i0+1+N*2)%N],dl=a0+(a1-a0)*f;
          this.lp+=(dl-this.lp)*.3;this.d[this.dw]=Math.tanh((m+this.lp*(.35+amt*.6))*1.3)*.8;this.dw=(this.dw+1)%N;const wet=this.lp*(.55+amt*.45);y0=this.buf[0][w]*.85+wet;y1=this.buf[1][w]*.85+wet*.9;break}
        case 'fdbk':{const m=(this.buf[0][w]+this.buf[1][w])*.5;this.wph+=.07/sr;const dt=sr*(.0061+.0042*Math.sin(this.wph*6.2831853)),r=this.dw-dt,i0=Math.floor(r),f=r-i0,dl=this.d[(i0+N*2)%N]*(1-f)+this.d[(i0+1+N*2)%N]*f;
          this.lp+=(dl-this.lp)*.22;this.hp+=(this.lp-this.hp)*.004;const bp=this.lp-this.hp,v=Math.tanh(m*1.5+bp*(.3+amt*.75)*1.3);this.d[this.dw]=v;this.dw=(this.dw+1)%N;
          y0=this.buf[0][w]*(1-amt*.5)+v*(.25+amt*.5);y1=this.buf[1][w]*(1-amt*.5)+v*(.25+amt*.5);break}
        case 'metal':{const m=(this.buf[0][w]+this.buf[1][w])*.5,fb=.9+amt*.085;let sm=0,sd=0;
          for(let k=0;k<4;k++){const b=this.cb[k],n=this.cl[k],j=this.ci[k],o=b[j];this.cz[k]+=(o-this.cz[k])*.55;b[j]=m*.35+this.cz[k]*fb;this.ci[k]=(j+1)%n;sm+=o;sd+=k&1?-o:o}
          sm=Math.tanh(sm*.9);sd=Math.tanh(sd*.9);const mw=2.4*Math.sqrt(amt)*(1.15-.45*amt);y0=this.buf[0][w]*(1-amt*.6)+sm*mw;y1=this.buf[1][w]*(1-amt*.6)+sd*mw;break}
        default:y0=this.buf[0][w];y1=this.buf[1][w]}
      out[0][i]=y0;if(ch>1)out[1][i]=y1;
      this.w=(w+1)%N;this.n++}
    return true}}
registerProcessor('mz-fx',MzFx);
