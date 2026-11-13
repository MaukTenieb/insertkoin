/* Musik, la station (13 nov. 2026, Mauk Tenieb : « un truc largement aussi bon que Fruity Loops, un vrai DAW », « 16 temps, ou plus »,
   « placer les samples dans les cases », « des effets au vieux potentiomètre, de synthétiseurs », « de quoi scratcher »).
   Le mzrack : une rangée par voix (les 18 Masks et leurs synthés, puis les sons du Kamescope), 16, 32 ou 64 pas, quatre motifs A B C D et leur enchaînement.
   Glisser un sample (album, borne, Kamescope, fichier du disque) sur une rangée la recharge ; sur la rangée vide, il ouvre une voix neuve.
   Chaque voix passe par sa tranche : volume, panoramique, accord, filtre (coupure, résonance), saturation, envois vers l'écho et la réverbération.
   La platine scratche le sample choisi. KAVE rend le motif (ou l'enchaînement) en WAV stéréo. Les voix des Masks restent celles de bbVoice (kg-katabatik.js). */
(function(){
'use strict';
var FR=(document.documentElement.lang||'').slice(0,2)==='fr'||(function(){try{return localStorage.getItem('ik.lang')==='fr'}catch(e){return false}})();
var ALB=[['20k368-1','Esiön'],['20k368-2','Esiön'],['cassette-zero1','Cassette Zero'],['cassette-zero2','Cassette Zero'],['interzone-men-at-work-1','Interzone Men at Work'],['interzone-men-at-work-2','Interzone Men at Work'],
 ['mantrajazzininterzone-1','Ritual Jazz in Interzone'],['mantrajazzininterzone-2','Ritual Jazz in Interzone'],['der-golem-1','Der Golem'],['der-golem-2','Der Golem'],['furia-1-1','Furia'],['furia-1-2','Furia'],
 ['tribute-to-miles-davis-1','Tribute to Miles Davis'],['tribute-to-miles-davis-2','Tribute to Miles Davis'],['libri-carolini-1','Libri Carolini'],['libri-carolini-2','Libri Carolini'],['carthago-our-times-1','Carthago, Our Times'],['carthago-our-times-2','Carthago, Our Times']];
var BRN=[['bell-1','Bell'],['coin-1','Koin'],['clack-1','Clack'],['buzz-1','Buzz'],['relay-7','Relay'],['twang-2','Twang'],['knock-4','Knock'],['neon-2','Neon']];
var MAXS=64,NP=4;
var S={n:16,pat:0,chain:false,bpm:96,swing:0,play:false,step:0,next:0,timer:0,sel:0,ch:[],lib:[],echoT:.375,echoF:.38,verb:.5,drive:0,master:.85,tt:null};
var BUF={},AC=null,G=null;
function base(){try{if(window.KG&&KG.base)return String(KG.base).replace(/kg-$/,'');}catch(e){}return '';}
function ac(){AC=window._bbAC;if(!AC){try{AC=window._bbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==='suspended')try{AC.resume();}catch(e){}return AC;}
function $(s,r){return (r||document).querySelector(s)}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function z64(){return new Uint8Array(MAXS)}

/* ---------- les voix ---------- */
function newCh(o){var c={id:'c'+Math.random().toString(36).slice(2,8),name:'',color:'#c9a84c',kind:'syn',voice:'kick',root:0,src:null,buf:null,
  vol:.8,pan:0,tune:0,cut:1,res:0,drv:0,echo:0,verb:0,mute:false,steps:[],mel:[]};for(var k in o)c[k]=o[k];
  for(var p=0;p<NP;p++){if(!c.steps[p])c.steps[p]=z64();if(!c.mel[p])c.mel[p]=new Int8Array(MAXS)}return c}
function seed(){
  if(typeof window.bbBuildTracks==='function')try{window.bbBuildTracks();}catch(e){}
  var T=(window._bbTracks||[]).filter(function(t){return t.voice!=='diktat'}).slice(0,18),SE=window.BB_SEEDS||[];
  S.ch=T.map(function(t,i){var c=newCh({name:t.name,color:t.color,kind:'syn',voice:t.voice,root:t.root||0});
    var s=SE[i]||[];for(var k=0;k<MAXS;k++)c.steps[0][k]=s[k%8]?1:0;return c});
  dice(1);dice(2);dice(3);
  var V={kick:.9,kick2:.85,sub:.75,bass:.75,snare:.75,hat:.55,shaker:.5,pad:.55,lead:.6};S.ch.forEach(function(c){c.vol=V[c.voice]||.7});
}
/* motif tiré pour B, C, D (et le dé) : la grosse caisse sur les temps, la caisse claire sur 2 et 4, les charlestons en croches, le reste épars */
var PENT=[0,3,5,7,10,12,15,17,19,22,24];
function dice(p){S.ch.forEach(function(c){var s=c.steps[p],m=c.mel[p],n=MAXS,v=c.voice,k;for(k=0;k<n;k++){s[k]=0;m[k]=0}
  for(k=0;k<n;k++){var q=k%16,r=Math.random();
    if(c.kind==='smp'){s[k]=(q===0&&r<.5)||(r<.06)?1:0;continue}
    if(v==='kick'||v==='kick2')s[k]=(q%4===0&&r<.9)||(q===10&&r<.35)?1:0;
    else if(v==='snare'||v==='clap')s[k]=(q===4||q===12)&&r<.92?1:(q===15&&r<.2?1:0);
    else if(v==='hat'||v==='shaker')s[k]=q%2===0?(r<.85?1:0):(r<.25?1:0);
    else if(v==='sub'||v==='pad')s[k]=q===0&&k%32===0?1:0;
    else s[k]=r<.07?1:0;
    if(s[k]&&/sub|bass|bass2|tom|bell|pluck|pad|stab|lead/.test(v))m[k]=PENT[Math.floor(Math.random()*6)]}})}

/* ---------- le son : une tranche par voix, deux bus d'effets, le maître ---------- */
function curve(d){var n=1024,a=new Float32Array(n),k=d*60;for(var i=0;i<n;i++){var x=i*2/n-1;a[i]=k?(1+k)*x/(1+k*Math.abs(x)):x}return a}
function ir(c,size){var len=Math.floor(c.sampleRate*(.6+size*3.2)),b=c.createBuffer(2,len,c.sampleRate);for(var ch=0;ch<2;ch++){var d=b.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4+ (1-size)*3)}return b}
function graph(c){if(c.__mz)return c.__mz;var g={c:c,strip:{}};
  g.out=c.createGain();g.out.gain.value=S.master;g.comp=c.createDynamicsCompressor();g.comp.threshold.value=-14;g.comp.ratio.value=3;g.comp.attack.value=.005;g.comp.release.value=.2;
  g.sat=c.createWaveShaper();g.sat.curve=curve(S.drive*.5);g.sat.oversample='2x';
  g.out.connect(g.sat);g.sat.connect(g.comp);g.comp.connect(c.destination);
  g.dly=c.createDelay(2);g.dly.delayTime.value=S.echoT;g.fb=c.createGain();g.fb.gain.value=S.echoF;g.dlf=c.createBiquadFilter();g.dlf.type='lowpass';g.dlf.frequency.value=3200;
  g.dIn=c.createGain();g.dIn.connect(g.dly);g.dly.connect(g.dlf);g.dlf.connect(g.fb);g.fb.connect(g.dly);g.dlf.connect(g.out);
  g.rev=c.createConvolver();g.rev.buffer=ir(c,S.verb);g.rIn=c.createGain();g.rIn.connect(g.rev);g.rev.connect(g.out);
  c.__mz=g;return g}
function strip(g,ch){var s=g.strip[ch.id];if(s)return s;var c=g.c;s={};
  s.inp=c.createGain();s.f=c.createBiquadFilter();s.f.type='lowpass';s.sh=c.createWaveShaper();s.v=c.createGain();
  s.p=c.createStereoPanner?c.createStereoPanner():c.createGain();s.e=c.createGain();s.r=c.createGain();
  s.inp.connect(s.f);s.f.connect(s.sh);s.sh.connect(s.v);s.v.connect(s.p);s.p.connect(g.out);s.v.connect(s.e);s.e.connect(g.dIn);s.v.connect(s.r);s.r.connect(g.rIn);
  g.strip[ch.id]=s;apply(g,ch);return s}
function apply(g,ch){var s=g.strip[ch.id];if(!s)return;var t=g.c.currentTime;
  s.f.frequency.setTargetAtTime(60*Math.pow(2,ch.cut*8.4),t,.02);s.f.Q.setTargetAtTime(.5+ch.res*22,t,.02);s.sh.curve=ch.drv>.01?curve(ch.drv):null;
  s.v.gain.setTargetAtTime(ch.mute?0:ch.vol*ch.vol*1.2,t,.02);if(s.p.pan)s.p.pan.setTargetAtTime(ch.pan,t,.02);s.e.gain.setTargetAtTime(ch.echo*.9,t,.02);s.r.gain.setTargetAtTime(ch.verb*1.1,t,.02)}
function masterApply(g){var t=g.c.currentTime;g.out.gain.setTargetAtTime(S.master,t,.03);g.dly.delayTime.setTargetAtTime(S.echoT,t,.05);g.fb.gain.setTargetAtTime(S.echoF,t,.03);g.sat.curve=curve(S.drive*.5)}
var verbT=0;function verbLater(){clearTimeout(verbT);verbT=setTimeout(function(){if(AC&&AC.__mz)AC.__mz.rev.buffer=ir(AC,S.verb)},250)}

function hit(c,ch,step,time,p){var g=graph(c),s=strip(g,ch);
  if(ch.kind==='smp'){var b=ch.buf;if(!b)return;var src=c.createBufferSource(),e=c.createGain(),rate=Math.pow(2,(ch.tune+(ch.mel[p]?ch.mel[p][step]:0))/12),len=Math.min(b.duration/rate,6);
    src.buffer=b;src.playbackRate.value=rate;e.gain.setValueAtTime(0,time);e.gain.linearRampToValueAtTime(1,time+.004);e.gain.setValueAtTime(1,time+Math.max(.01,len-.03));e.gain.linearRampToValueAtTime(0,time+len);
    src.connect(e);e.connect(s.inp);src.start(time);src.stop(time+len+.02);return}
  if(typeof window.bbVoice!=='function')return;
  var keepT=window._bbTracks,keepB=c.__ikBus,keepS=window._bbStep,tr={name:ch.name,voice:ch.voice,root:(ch.root||0)+ch.tune+(ch.mel[p]?ch.mel[p][step]:0),pitch:null,steps:[1,1,1,1,1,1,1,1]};
  try{window._bbTracks=[tr];c.__ikBus=s.inp;window._bbStep=0;window.bbVoice(c,0,time)}catch(e){}finally{window._bbTracks=keepT;c.__ikBus=keepB;window._bbStep=keepS}}

/* ---------- l'horloge ---------- */
function stepDur(){return 60/S.bpm/4}
function tick(){if(!S.play||!AC)return;var ct=AC.currentTime,d=stepDur();if(S.next<ct-.05)S.next=ct+.02;
  while(S.next<ct+.12){var st=S.step,p=S.pat,at=S.next+(st%2?S.swing*d*.6:0),sol=S.ch.some(function(c){return c.solo});
    S.ch.forEach(function(ch){if(ch.steps[p][st]&&!ch.mute&&(!sol||ch.solo))hit(AC,ch,st,at,p)});
    (function(st,p,ms){setTimeout(function(){if(S.play)cursor(st,p)},ms)})(st,p,Math.max(0,(at-ct)*1000));
    S.step++;if(S.step>=S.n){S.step=0;if(S.chain){S.pat=(S.pat+1)%NP;setTimeout(function(){paintPat();rack()},Math.max(0,(S.next+d-ct)*1000))}}S.next+=d}
  S.timer=setTimeout(tick,25)}
function play(on){S.play=on;clearTimeout(S.timer);if(on){if(!ac())return;S.step=0;S.next=AC.currentTime+.06;tick()}else cursor(-1);var b=$('#mz-play');if(b){b.classList.toggle('on',on);b.innerHTML=on?IC.stop:IC.play}}

/* ---------- les samples ---------- */
function load(it){if(it.buf)return Promise.resolve(it.buf);if(BUF[it.url])return Promise.resolve(it.buf=BUF[it.url]);var c=ac();if(!c)return Promise.reject();
  return fetch(base()+it.url).then(function(r){return r.arrayBuffer()}).then(function(b){return new Promise(function(ok,ko){c.decodeAudioData(b,ok,ko)})}).then(function(b){BUF[it.url]=b;it.buf=b;return b})}
function clipBuf(clip){var c=ac();if(!c)return null;var b=c.createBuffer(1,clip.data.length,clip.sr);b.getChannelData(0).set(clip.data);return b}
function audition(b){var c=ac();if(!c||!b)return;var s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=.8;s.connect(g);g.connect(graph(c).out);s.start();setTimeout(function(){try{s.stop()}catch(e){}},2500)}
function buildLib(){libK();S.lib=ALB.map(function(a){return {id:'a:'+a[0],name:a[1],url:'snd/pads/'+a[0]+'.mp3',col:'#ffa726'}}).concat(BRN.map(function(a){return {id:'b:'+a[0],name:a[1],url:'snd/'+a[0]+'.mp3',col:'#4fc3f7'}}));
}
function libK(){if(window.__borneDiktat)window.__borneDiktat.all().then(function(L){S.lib=S.lib.filter(function(x){return x.id.slice(0,2)!=='k:'});L.slice(0,5).reverse().forEach(function(c){var it={id:'k:'+c.id,name:c.name,col:'#ff3b2f',clip:c};it.buf=clipBuf(c);S.lib.unshift(it);
      if(!S.ch.some(function(x){return x.src===it.id}))S.ch.push(newCh({name:c.name,color:'#ff3b2f',kind:'smp',src:it.id,buf:it.buf,vol:.75}))});libDraw();rack()})}
function loadInto(ch,it){load(it).then(function(b){ch.kind='smp';ch.buf=b;ch.src=it.id;ch.name=it.name;if(ch.color==='#c9a84c'||!ch.color)ch.color=it.col;rack();strips();ttLoad(it);audition(b)}).catch(function(){})}
function fileInto(ch,f){var c=ac();if(!c)return;f.arrayBuffer().then(function(a){return new Promise(function(ok,ko){c.decodeAudioData(a,ok,ko)})}).then(function(b){var it={id:'f:'+f.name+Date.now(),name:f.name.replace(/\.[^.]+$/,'').slice(0,24),col:'#b9d84a',buf:b};S.lib.unshift(it);libDraw();
  if(!ch){ch=newCh({color:it.col});S.ch.push(ch)}loadInto(ch,it)}).catch(function(){})}

/* ---------- l'interface ---------- */
var IC={play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',stop:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" fill="currentColor"/></svg>',
 dice:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.4" fill="currentColor"/><circle cx="15" cy="15" r="1.4" fill="currentColor"/><circle cx="15" cy="9" r="1.4" fill="currentColor"/><circle cx="9" cy="15" r="1.4" fill="currentColor"/></svg>',
 clear:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 chain:'<svg viewBox="0 0 24 24"><rect x="3" y="9" width="9" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="12" y="9" width="9" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
 kave:'<svg viewBox="0 0 24 24"><path d="M12 3.5v12M7 11l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 20.2h8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
 mzadd:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 open:'<svg viewBox="0 0 24 24"><path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H10l2 2h6.5A1.5 1.5 0 0 1 20 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'};
var CSS=`
#bb-panel.mz-on>*:not(#mz):not(.kb-foot){display:none!important}
html #kg-root #bb-panel.mz-on.mz-on.mz-on.mz-on{display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:6px!important;padding:8px!important;overflow:hidden!important;grid-template-columns:none!important}
#mz{--pl:#17130e;--pl2:#221c14;--ink:#efe3cf;--dim:#8d8577;--amb:#ffa726;--led:#ff3b2f;flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:6px;color:var(--ink);font:500 10px/1 "DM Mono",monospace;letter-spacing:.08em;user-select:none;-webkit-user-select:none}
#mz button{font:inherit;color:inherit;cursor:pointer}
#mz .mzbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;background:linear-gradient(#2a2219,#17120c);border-radius:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 0 1px #000}
#mz .mzbt{display:grid;place-items:center;min-width:40px;height:40px;padding:0 8px;border:0;border-radius:4px;background:linear-gradient(#3a3027,#1d1812);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 0 #000;color:var(--ink)}
#mz .mzbt svg{width:20px;height:20px}#mz .mzbt.on{background:linear-gradient(#ffb547,#d27f12);color:#1a1006}#mz #mz-play.on{background:linear-gradient(#ff5a45,#b51d10);color:#fff}
#mz .mzseg{display:flex;padding:3px;gap:2px;border-radius:4px;background:#0a0806;box-shadow:inset 0 0 0 1px #000}
#mz .mzseg button{min-width:30px;height:34px;border:0;border-radius:3px;background:none;color:var(--dim);font-weight:700}
#mz .mzseg button.on{background:var(--amb);color:#1a1006}
#mz .mzlcd{min-width:58px;height:34px;display:grid;place-items:center;padding:0 6px;background:#0b1208;color:#9ad86a;border-radius:3px;box-shadow:inset 0 0 0 1px #000,inset 0 0 12px rgba(154,216,106,.15);font:400 15px/1 "Press Start 2P",monospace;text-shadow:0 0 6px rgba(154,216,106,.6)}
#mz .mzsp{flex:1}
#mz .mzrack{overflow:auto;background:var(--pl);border-radius:6px;box-shadow:inset 0 0 0 1px #000;padding:4px;overscroll-behavior:contain}
#mz .mzrow{display:flex;align-items:center;gap:4px;height:26px;margin-bottom:3px;min-width:max-content}
#mz .mzrow.sel .mznm{box-shadow:inset 0 0 0 1px var(--amb)}
#mz .mzled{flex:none;width:12px!important;height:12px!important;min-height:0!important;min-width:0!important;padding:0!important;margin:0 3px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 35%,#9ff58a,#2e9a22);box-shadow:0 0 3px #4cd23a,inset 0 -1px 2px rgba(0,0,0,.5)}
#mz .mzled.off{background:radial-gradient(circle at 35% 35%,#555,#1c1c1c);box-shadow:inset 0 -1px 2px rgba(0,0,0,.6)}
#mz .mznm{flex:none;width:126px;height:24px;display:flex;align-items:center;gap:6px;padding:0 6px;border:0;border-radius:3px;background:linear-gradient(#3b332a,#262019);text-align:left;overflow:hidden;white-space:nowrap}
#mz .mznm i{flex:none;width:4px;height:14px;border-radius:2px;background:var(--c)}#mz .mznm span{overflow:hidden;text-overflow:ellipsis}
#mz .mznm.smp span::before{content:"◖ ";color:var(--c)}
#mz .mzrow.drop .mznm,#mz .mzadd.drop{box-shadow:0 0 0 2px var(--amb)!important}
#mz .mzstp{display:flex;gap:2px;flex:1 1 auto;min-width:0}
#mz .mzs{flex:1 0 18px;max-width:46px;height:24px;border-radius:3px;background:#3a3129;box-shadow:inset 0 -2px 0 rgba(0,0,0,.35);touch-action:none}
#mz .mzs.b{background:#4a2a24}
#mz .mzs.g{margin-left:4px}
#mz .mzs.on{background:var(--c);box-shadow:inset 0 -2px 0 rgba(0,0,0,.3),0 0 6px var(--c)}
#mz .mzs.cur{outline:1px solid rgba(255,255,255,.7);outline-offset:-1px}
#mz .mzadd{display:flex;align-items:center;gap:8px;height:30px;padding:0 10px;margin-top:4px;border:1px dashed #5a4c3c;border-radius:4px;background:none;color:var(--dim);width:max-content}
#mz .mzadd svg{width:16px;height:16px}
#mz .mzdeck{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;gap:6px;align-items:stretch}
#mz .mzbox{background:linear-gradient(#2b241b,#18130d);border-radius:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 0 0 1px #000;padding:6px 8px;display:flex;flex-direction:column;gap:4px;min-width:0}
#mz .mzbox h4{margin:0;font:700 9px/1 "DM Mono",monospace;letter-spacing:.2em;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mz .mzbox h4 b{color:var(--c,var(--amb))}
#mz .mzkns{display:flex;flex-wrap:wrap;gap:4px 6px}
#mz .mzkn{display:flex;flex-direction:column;align-items:center;gap:2px;width:42px;touch-action:none;cursor:ns-resize}
#mz .mzkn svg{width:38px;height:38px;display:block}#mz .mzkn small{font-size:8px;letter-spacing:.14em;color:var(--dim)}
#mz .mzlib{display:flex;flex-wrap:wrap;gap:4px;overflow:auto;max-height:96px;align-content:flex-start}
#mz .mzlb{flex:none;max-width:120px;height:26px;padding:0 7px;border:0;border-radius:3px;background:linear-gradient(#3a3027,#1f1913);box-shadow:inset 3px 0 0 var(--c);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;touch-action:none}
#mz .mztt{width:112px;height:112px;touch-action:none;cursor:grab;border-radius:50%}
.mzghost{position:fixed;z-index:2147483600;pointer-events:none;padding:6px 9px;border-radius:3px;background:var(--amb);color:#1a1006;font:700 10px/1 "DM Mono",monospace}
@media (max-width:760px),(orientation:portrait){#mz .mzdeck{grid-template-columns:1fr 1fr}#mz .mzdeck .mzlibbox{grid-column:1/-1}#mz .mznm{width:96px}#mz .mztt{width:96px;height:96px}}
`;
function knob(lbl,get,set,def,col){var k=el('div','mzkn');k.innerHTML='<svg viewBox="0 0 40 40"></svg><small>'+lbl+'</small>';var sv=k.firstChild;
  function draw(){var v=get(),a=-135+v*270,ticks='';for(var i=0;i<=10;i++){var t=(-135+i*27)*Math.PI/180;ticks+='<line x1="'+(20+Math.sin(t)*17)+'" y1="'+(20-Math.cos(t)*17)+'" x2="'+(20+Math.sin(t)*19)+'" y2="'+(20-Math.cos(t)*19)+'" stroke="#8d8577" stroke-width="1"/>'}
    var r=a*Math.PI/180;sv.innerHTML=ticks+'<circle cx="20" cy="21" r="14" fill="#000" opacity=".5"/><circle cx="20" cy="20" r="14" fill="url(#mzk)"/><circle cx="20" cy="20" r="10.5" fill="#1a1612" stroke="#000" stroke-width=".8"/>'+
      '<line x1="'+(20+Math.sin(r)*3)+'" y1="'+(20-Math.cos(r)*3)+'" x2="'+(20+Math.sin(r)*12)+'" y2="'+(20-Math.cos(r)*12)+'" stroke="'+(col||'#efe3cf')+'" stroke-width="2.2" stroke-linecap="round"/>'}
  draw();var y0=0,v0=0;k.addEventListener('pointerdown',function(e){e.preventDefault();k.setPointerCapture(e.pointerId);y0=e.clientY;v0=get()});
  k.addEventListener('pointermove',function(e){if(!k.hasPointerCapture(e.pointerId))return;set(Math.max(0,Math.min(1,v0+(y0-e.clientY)/(e.shiftKey?600:160))));draw()});
  k.addEventListener('wheel',function(e){e.preventDefault();set(Math.max(0,Math.min(1,get()-Math.sign(e.deltaY)*.03)));draw()},{passive:false});
  k.addEventListener('dblclick',function(){set(def);draw()});k.setAttribute('role','slider');k.setAttribute('aria-label',lbl);k.__draw=draw;return k}

var ROOT=null;
function mount(){var p=document.getElementById('bb-panel');if(!p)return false;if(ROOT&&p.contains(ROOT))return true;
  if(!document.getElementById('mz-css')){var st=el('style');st.id='mz-css';st.textContent=CSS;document.head.appendChild(st)}
  if(!S.ch.length){seed();buildLib()}
  ROOT=el('div');ROOT.id='mz';ROOT.innerHTML='<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="mzk" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#5a5148"/><stop offset=".6" stop-color="#2a241f"/><stop offset="1" stop-color="#0d0b09"/></radialGradient></defs></svg>'+
   '<div class="mzbar"><button class="mzbt" id="mz-play" type="button"></button><button class="mzbt" id="mz-dice" type="button"></button><button class="mzbt" id="mz-clr" type="button"></button>'+
   '<div class="mzseg" id="mz-pat"></div><button class="mzbt" id="mz-chain" type="button"></button><div class="mzseg" id="mz-len"></div><span class="mzlcd" id="mz-bpm"></span><span id="mz-tk"></span><span class="mzsp"></span>'+
   '<button class="mzbt" id="mz-file" type="button"></button><button class="mzbt" id="mz-kave" type="button"></button></div>'+
   '<div class="mzrack" id="mz-rack"></div>'+
   '<div class="mzdeck"><div class="mzbox" id="mz-strip"></div><div class="mzbox" id="mz-mst"></div><div class="mzbox mzlibbox"><h4>SAMPLES</h4><div class="mzlib" id="mz-lib"></div></div><div class="mzbox" id="mz-ttb"><h4 id="mz-tth">PLATINE</h4><canvas class="mztt" id="mz-tt" width="224" height="224"></canvas></div></div>';
  p.insertBefore(ROOT,p.querySelector('.kb-foot'));p.classList.add('mz-on');
  var L=FR?{play:'Lecture',dice:'Tirer un motif',clr:'Vider le motif',chain:'Enchaîner A B C D',file:'Charger un son du disque',kave:'Kave : rendre en WAV',add:'Glisser un son ici',tempo:'TEMPO',swing:'SWING'}:{play:'Play',dice:'Roll a pattern',clr:'Clear the pattern',chain:'Chain A B C D',file:'Load a sound from disk',kave:'Kave: render to WAV',add:'Drop a sound here',tempo:'TEMPO',swing:'SWING'};S.L=L;
  [['mz-play','play'],['mz-dice','dice'],['mz-clr','clear'],['mz-chain','chain'],['mz-file','open'],['mz-kave','kave']].forEach(function(a){var b=$('#'+a[0],ROOT);b.innerHTML=IC[a[1]];var k=a[0].slice(3);b.setAttribute('aria-label',L[k]||k);b.title=L[k]||k});
  $('#mz-play',ROOT).onclick=function(){play(!S.play)};$('#mz-dice',ROOT).onclick=function(){dice(S.pat);rack()};
  $('#mz-clr',ROOT).onclick=function(){S.ch.forEach(function(c){c.steps[S.pat].fill(0)});rack()};
  $('#mz-chain',ROOT).onclick=function(){S.chain=!S.chain;this.classList.toggle('on',S.chain)};
  $('#mz-file',ROOT).onclick=function(){var i=el('input');i.type='file';i.accept='audio/*';i.onchange=function(){if(i.files[0])fileInto(null,i.files[0])};i.click()};
  $('#mz-kave',ROOT).onclick=kave;
  var pt=$('#mz-pat',ROOT);'ABCD'.split('').forEach(function(x,i){var b=el('button',null,x);b.type='button';b.onclick=function(){S.pat=i;paintPat();rack()};pt.appendChild(b)});
  var ln=$('#mz-len',ROOT);[16,32,64].forEach(function(n){var b=el('button',null,String(n));b.type='button';b.onclick=function(){S.n=n;if(S.step>=n)S.step=0;paintLen();rack()};ln.appendChild(b)});
  var tk=$('#mz-tk',ROOT);tk.style.display='flex';tk.style.gap='4px';
  tk.appendChild(knob(L.tempo,function(){return (S.bpm-60)/120},function(v){S.bpm=Math.round(60+v*120);$('#mz-bpm',ROOT).textContent=S.bpm},(96-60)/120));
  tk.appendChild(knob(L.swing,function(){return S.swing},function(v){S.swing=v},0));
  $('#mz-bpm',ROOT).textContent=S.bpm;play(S.play);paintPat();paintLen();rack();strips();libDraw();ttInit();
  if(!ROOT.__ro){ROOT.__ro=1;ROOT.addEventListener('dragover',function(e){e.preventDefault()});ROOT.addEventListener('drop',function(e){e.preventDefault();var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(!f||!/^audio\//.test(f.type))return;var r=e.target.closest&&e.target.closest('.mzrow');fileInto(r?S.ch[+r.dataset.i]:null,f)})}
  return true}
function paintPat(){if(!ROOT)return;[].forEach.call($('#mz-pat',ROOT).children,function(b,i){b.classList.toggle('on',i===S.pat)})}
function paintLen(){if(!ROOT)return;[].forEach.call($('#mz-len',ROOT).children,function(b){b.classList.toggle('on',+b.textContent===S.n)})}
function rack(){if(!ROOT)return;var R=$('#mz-rack',ROOT),sc=R.scrollTop,sl=R.scrollLeft,h='';
  S.ch.forEach(function(c,i){h+='<div class="mzrow'+(i===S.sel?' sel':'')+'" data-i="'+i+'" style="--c:'+c.color+'"><button type="button" class="mzled'+(c.mute?' off':'')+'" data-m="'+i+'" aria-label="mute"></button><button type="button" class="mznm'+(c.kind==='smp'?' smp':'')+'" data-n="'+i+'"><i></i><span>'+String(c.name).replace(/</g,'&lt;')+'</span></button><div class="mzstp">';
    for(var s=0;s<S.n;s++)h+='<div class="mzs'+((s>>2)%2?' b':'')+(s%16===0&&s?' g':'')+(c.steps[S.pat][s]?' on':'')+'" data-s="'+s+'"></div>';h+='</div></div>'});
  h+='<button type="button" class="mzadd" id="mz-add">'+IC.add+'<span>'+S.L.add+'</span></button>';R.innerHTML=h;R.scrollTop=sc;R.scrollLeft=sl;
  if(!R.__ev){R.__ev=1;var paint=null;
    R.addEventListener('pointerdown',function(e){var t=e.target,row=t.closest('.mzrow');
      if(t.closest('.mzled')){var c=S.ch[+t.closest('.mzled').dataset.m];c.mute=!c.mute;if(AC&&AC.__mz)apply(AC.__mz,c);rack();return}
      if(t.closest('.mznm')){S.sel=+t.closest('.mznm').dataset.n;var c2=S.ch[S.sel];rack();strips();if(c2.kind==='smp'&&c2.buf){audition(c2.buf);ttLoad({name:c2.name,buf:c2.buf})}else if(ac())hit(AC,c2,0,AC.currentTime+.01,S.pat);return}
      if(t.classList.contains('mzs')&&row){e.preventDefault();var ci=+row.dataset.i,si=+t.dataset.s,ch=S.ch[ci];paint=ch.steps[S.pat][si]?0:1;ch.steps[S.pat][si]=paint;t.classList.toggle('on',!!paint);
        if(paint&&ac())hit(AC,ch,si,AC.currentTime+.01,S.pat);R.setPointerCapture(e.pointerId);R.__ci=ci}});
    R.addEventListener('pointermove',function(e){if(paint===null)return;var t=document.elementFromPoint(e.clientX,e.clientY);if(!t||!t.classList||!t.classList.contains('mzs'))return;var row=t.closest('.mzrow');if(!row||+row.dataset.i!==R.__ci)return;
      var ch=S.ch[R.__ci],si=+t.dataset.s;if(ch.steps[S.pat][si]!==paint){ch.steps[S.pat][si]=paint;t.classList.toggle('on',!!paint)}});
    var end=function(){paint=null};R.addEventListener('pointerup',end);R.addEventListener('pointercancel',end);
    R.addEventListener('contextmenu',function(e){if(e.target.classList.contains('mzs'))e.preventDefault()})}}
function cursor(st,p){if(!ROOT)return;var R=$('#mz-rack',ROOT);if(p!=null&&p!==S.pat)return;[].forEach.call(R.querySelectorAll('.mzs.cur'),function(x){x.classList.remove('cur')});if(st<0)return;[].forEach.call(R.querySelectorAll('.mzs[data-s="'+st+'"]'),function(x){x.classList.add('cur')})}
function strips(){if(!ROOT)return;var c=S.ch[S.sel]||S.ch[0];if(!c)return;var B=$('#mz-strip',ROOT);B.style.setProperty('--c',c.color);B.innerHTML='<h4><b>'+String(c.name).replace(/</g,'&lt;')+'</b></h4>';var K=el('div','mzkns');
  var up=function(){if(AC&&AC.__mz)apply(AC.__mz,c)};
  [['VOL','vol',.8],['PAN','pan',.5,function(v){c.pan=v*2-1},function(){return (c.pan+1)/2}],['TUNE','tune',.5,function(v){c.tune=Math.round(v*24-12)},function(){return (c.tune+12)/24}],['CUT','cut',1],['RES','res',0],['DRIVE','drv',0],['ECHO','echo',0],['VERB','verb',0]].forEach(function(a){
    var get=a[4]||function(){return c[a[1]]},set=a[3]||function(v){c[a[1]]=v};K.appendChild(knob(a[0],get,function(v){set(v);up()},a[2],c.color))});B.appendChild(K);
  var M=$('#mz-mst',ROOT);if(!M.__k){M.__k=1;M.innerHTML='<h4>MASTER</h4>';var K2=el('div','mzkns'),mu=function(){if(AC&&AC.__mz)masterApply(AC.__mz)};
    [['TIME',function(){return (S.echoT-.06)/.94},function(v){S.echoT=.06+v*.94},.33],['FDBK',function(){return S.echoF/.9},function(v){S.echoF=v*.9},.42],['SIZE',function(){return S.verb},function(v){S.verb=v;verbLater()},.5],['DRIVE',function(){return S.drive},function(v){S.drive=v},0],['MAST',function(){return S.master},function(v){S.master=v},.85]].forEach(function(a){
      K2.appendChild(knob(a[0],a[1],function(v){a[2](v);mu()},a[3]))});M.appendChild(K2)}}
function libDraw(){if(!ROOT)return;var Lb=$('#mz-lib',ROOT);Lb.innerHTML='';S.lib.forEach(function(it){var b=el('button','mzlb');b.type='button';b.textContent=it.name;b.title=it.name;b.style.setProperty('--c',it.col);
  b.addEventListener('pointerdown',function(e){e.preventDefault();var x0=e.clientX,y0=e.clientY,gh=null,over=null;b.setPointerCapture(e.pointerId);
    function mv(ev){if(!gh&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>8){gh=el('div','mzghost',it.name);document.body.appendChild(gh)}if(!gh)return;gh.style.left=ev.clientX+8+'px';gh.style.top=ev.clientY+8+'px';
      var t=document.elementFromPoint(ev.clientX,ev.clientY),r=t&&t.closest?(t.closest('#mz .mzrow')||t.closest('#mz-add')||t.closest('#mz-tt')):null;if(over!==r){if(over)over.classList.remove('drop');over=r;if(r)r.classList.add('drop')}}
    function up(){b.removeEventListener('pointermove',mv);b.removeEventListener('pointerup',up);b.removeEventListener('pointercancel',up);if(over)over.classList.remove('drop');
      if(!gh){load(it).then(function(bf){audition(bf);ttLoad(it)}).catch(function(){});return}gh.remove();if(!over)return;
      if(over.id==='mz-tt'){load(it).then(function(){ttLoad(it)});return}
      if(over.id==='mz-add'){var ch=newCh({color:it.col});S.ch.push(ch);S.sel=S.ch.length-1;loadInto(ch,it);return}
      S.sel=+over.dataset.i;loadInto(S.ch[S.sel],it)}
    b.addEventListener('pointermove',mv);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up)});
  Lb.appendChild(b)})}

/* ---------- la platine : le disque tourne à 33 tours ; le saisir, c'est scratcher ---------- */
var TT={ang:0,pos:0,buf:null,rev:null,name:'',hold:false,src:null,t0:0,last:0,lastA:0,motor:false};
function ttLoad(it){if(!it||!it.buf)return;TT.buf=it.buf;TT.name=it.name;var c=ac();if(!c)return;var b=it.buf,r=c.createBuffer(b.numberOfChannels,b.length,b.sampleRate);for(var k=0;k<b.numberOfChannels;k++){var d=b.getChannelData(k),o=r.getChannelData(k);for(var i=0;i<d.length;i++)o[i]=d[d.length-1-i]}TT.rev=r;TT.pos=0;
  var h=$('#mz-tth',ROOT);if(h)h.textContent=it.name.toUpperCase()}
function ttStop(){if(TT.src){try{TT.src.stop()}catch(e){}TT.src=null}TT.motor=false}
function ttGrain(rate,dur){var c=ac();if(!c||!TT.buf)return;var fwd=rate>=0,b=fwd?TT.buf:TT.rev,len=TT.buf.duration,off=fwd?TT.pos:len-TT.pos;if(off<0||off>=len)return;
  var s=c.createBufferSource(),g=c.createGain(),t=c.currentTime,r=Math.max(.05,Math.min(4,Math.abs(rate)));s.buffer=b;s.playbackRate.value=r;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.004);g.gain.setValueAtTime(.9,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.012);
  s.connect(g);g.connect(graph(c).out);s.start(t,off,Math.min(len-off,r*(dur+.02)));}
function ttInit(){var cv=$('#mz-tt',ROOT);if(!cv||cv.__ev)return;cv.__ev=1;var c2=cv.getContext('2d'),REV=1.8;
  function draw(){if(!ROOT||!document.body.contains(cv))return;requestAnimationFrame(draw);var now=performance.now();
    if(TT.motor&&!TT.hold){var dt=(now-TT.last)/1000;TT.last=now;TT.ang+=dt/REV*Math.PI*2;TT.pos+=dt;if(TT.buf&&TT.pos>=TT.buf.duration)ttStop()}
    var W=cv.width,R=W/2;c2.clearRect(0,0,W,W);c2.save();c2.translate(R,R);
    c2.fillStyle='#0e0d0c';c2.beginPath();c2.arc(0,0,R-2,0,7);c2.fill();c2.strokeStyle='rgba(255,255,255,.05)';for(var i=0;i<14;i++){c2.beginPath();c2.arc(0,0,R-8-i*5,0,7);c2.stroke()}
    c2.rotate(TT.ang);c2.fillStyle=TT.buf?'#c8243a':'#3a3129';c2.beginPath();c2.arc(0,0,R*.36,0,7);c2.fill();c2.fillStyle='#efe3cf';c2.fillRect(-2,-R*.34,4,R*.16);
    c2.fillStyle='#0e0d0c';c2.beginPath();c2.arc(0,0,4,0,7);c2.fill();c2.restore();
    c2.strokeStyle='rgba(255,255,255,.12)';c2.lineWidth=2;c2.beginPath();c2.arc(R,R,R-2,0,7);c2.stroke()}
  draw();
  var ang=function(e){var r=cv.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)};
  cv.addEventListener('pointerdown',function(e){e.preventDefault();cv.setPointerCapture(e.pointerId);ttStop();TT.hold=true;TT.lastA=ang(e);TT.last=performance.now();cv.style.cursor='grabbing'});
  cv.addEventListener('pointermove',function(e){if(!TT.hold)return;var a=ang(e),d=a-TT.lastA;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;var now=performance.now(),dt=Math.max(.008,(now-TT.last)/1000);
    TT.lastA=a;TT.last=now;TT.ang+=d;var dp=d/(Math.PI*2)*REV;if(Math.abs(dp)>1e-4){ttGrain(dp/dt,dt);TT.pos=Math.max(0,TT.buf?Math.min(TT.buf.duration-.01,TT.pos+dp):0)}});
  var rel=function(){if(!TT.hold)return;TT.hold=false;cv.style.cursor='';var c=ac();if(!c||!TT.buf)return;var s=c.createBufferSource();s.buffer=TT.buf;s.connect(graph(c).out);var off=Math.min(TT.pos,TT.buf.duration-.01);s.start(c.currentTime,off);TT.src=s;TT.motor=true;TT.last=performance.now();s.onended=function(){if(TT.src===s){TT.src=null;TT.motor=false}}};
  cv.addEventListener('pointerup',rel);cv.addEventListener('pointercancel',rel);cv.setAttribute('aria-label',FR?'Platine : saisir le disque pour scratcher':'Turntable: grab the record to scratch')}

/* ---------- KAVE : le motif (ou l'enchaînement A B C D) en WAV stéréo ---------- */
function kave(){var pats=S.chain?[0,1,2,3]:[S.pat],d=stepDur(),SR=44100,len=pats.length*S.n*d+3,c=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,Math.ceil(SR*len),SR);
  var g=graph(c);masterApply(g);S.ch.forEach(function(ch){strip(g,ch)});var sol=S.ch.some(function(x){return x.solo}),t=.05;
  pats.forEach(function(p){for(var s=0;s<S.n;s++){var at=t+(s%2?S.swing*d*.6:0);S.ch.forEach(function(ch){if(ch.steps[p][s]&&!ch.mute&&(!sol||ch.solo))hit(c,ch,s,at,p)});t+=d}});
  c.startRendering().then(function(r){var n=r.length,L=r.getChannelData(0),R=r.getChannelData(1),v=new DataView(new ArrayBuffer(44+n*4)),w=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
    w(0,'RIFF');v.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,SR,true);v.setUint32(28,SR*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*4,true);
    for(var i=0,o=44;i<n;i++,o+=4){var a=Math.max(-1,Math.min(1,L[i])),b=Math.max(-1,Math.min(1,R[i]));v.setInt16(o,a<0?a*32768:a*32767,true);v.setInt16(o+2,b<0?b*32768:b*32767,true)}
    var u=URL.createObjectURL(new Blob([v],{type:'audio/wav'})),x=el('a');x.href=u;x.download=window.ikName?ikName('musik','wav'):'musik.wav';document.body.appendChild(x);x.click();setTimeout(function(){x.remove();URL.revokeObjectURL(u)},4000)}).catch(function(){})}

/* ---------- branchement : Musik s'ouvre sur la station ---------- */
function hook(){if(typeof window.beatboxOpen!=='function'){setTimeout(hook,600);return}if(window.beatboxOpen.__mz)return;
  var open=window.beatboxOpen,close=window.beatboxClose;
  window.beatboxOpen=function(){var r=open.apply(this,arguments);try{if(typeof window.bbStop==='function')window.bbStop();ac();mount()}catch(e){}return r};window.beatboxOpen.__mz=1;
  window.beatboxClose=function(){play(false);ttStop();return close.apply(this,arguments)};
  var p=document.getElementById('bb-panel');if(p&&p.style.display!=='none'&&p.getClientRects().length){ac();mount()}}
window.__mz={S:S,mount:mount,play:play,kave:kave};
if(window.top===window){hook();addEventListener('borne-diktat',function(){if(S.ch.length)libK()})}
})();
