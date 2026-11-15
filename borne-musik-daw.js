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
 ['tribute-to-miles-davis-1','Tribute to Miles Davis'],['tribute-to-miles-davis-2','Tribute to Miles Davis'],['libri-carolini-1','Libri Carolini'],['libri-carolini-2','Libri Carolini'],['carthago-our-times-1','Carthago, Our Times'],['carthago-our-times-2','Carthago, Our Times'],
 ['dogxim-entering-1','Entering the Dogxim'],['dogxim-entering-2','Entering the Dogxim'],['c7h5n3o6-arts-all-about-1','Art\'s All About Dealing with Evil'],['c7h5n3o6-bayou-1','Anthropobots Fuck You in the Bayou'],['tsui-pen-jardin-1','El jard\u00edn de senderos que se bifurcan'],['tsui-pen-jardin-2','El jard\u00edn de senderos que se bifurcan'],['auvergne-court-complexe-1','Court Complexe'],['auvergne-court-complexe-2','Court Complexe'],
 ['scambug-1','ScamBug'],['scambug-2','ScamBug'],['nix-1','Nix'],['african-alien-1','African-Alien'],
 ['mt-mauk-tenieb-ropes-tribute-to-1','Ropes (Tribute to Seb \'\u00c5ngstrom\' F. aka GDZ)'],['mt-mauk-tenieb-mugwump-1','Mugwump'],['mt-mauk-tenieb-antonin-artaud-j-1','Antonin Artaud (J\'ai appris hier - To Have Done with the Judgement of God)'],['mt-mauk-tenieb-le-monde-come-1','Le Monde C\u00f4me'],['mt-mauk-tenieb-tribute-to-sgm-t-1','Tribute to SGM & The Book of Knots'],['mt-mauk-tenieb-shia-34-live-mix-1','SHIA-34'],['mt-mauk-tenieb-free-wolf-in-da-1','Free Wolf in da Muthafuckin\' Sheepfold'],['mt-mauk-tenieb-az-melochondria-1','AZ !=! M\u00e8lochondria'],['mt-mauk-tenieb-arabic-illbient-1','Arabic Illbient'],['mt-mauk-tenieb-jean-misere-pari-1','Jean Mis\u00e8re (Paris Commune of Interzone)'],['mt-mauk-tenieb-christianophilia-1','Christianophilia v.2'],['mt-mauk-tenieb-vanquished-of-th-1','Vanquished of the History'],['mt-mauk-tenieb-s.-warfare-live-1','S. Warfare'],['mt-mauk-tenieb-teknosok-live-mi-1','Tekn\u0151s\u00f6k']];
var BRN=[['bell-1','Bell'],['coin-1','Koin'],['clack-1','Clack'],['buzz-1','Buzz'],['relay-7','Relay'],['twang-2','Twang'],['knock-4','Knock'],['neon-2','Neon']];
/* 13 nov. 2026 (Mauk Tenieb, RELAIS § 28, réponses « 1c, 2a et b, 3b, 4b ») : la Scène à la Loops Stage, les sons de chaque Mask, la platine vidéo.
   MASKS : les 18 Masks ; STAT : leur stature en mètres (toise du vidéoclub, kave/motel-run.js) ; KIT : les coupes de leurs sorties, par alias (snd/SOURCES.md). */
var MASKS=['aube','auvergne','c7h5n3o6','cadaver_synod','croisiere_noire','dogxim','grand_colonel','hatra_loves','honey_buzzard','maiden_call','malika','naphta','plague_of_justinian','poisoned_well','silent_pact','truce','tsui_pen','unkle_maukie'];
var STAT={aube:1.68,auvergne:1.78,c7h5n3o6:1.98,cadaver_synod:1.88,croisiere_noire:1.6,dogxim:1.55,grand_colonel:1.8,hatra_loves:1.8,honey_buzzard:1.98,maiden_call:1.65,malika:1.68,naphta:1.72,plague_of_justinian:1.92,poisoned_well:1.35,silent_pact:1.98,truce:1.75,tsui_pen:1.68,unkle_maukie:1.78};
/* 15 nov. 2026, 2 h 54 (Mauk Tenieb : « prends au hasard les morceaux sur Internet Archive du catalogue Korhogo […] s'il en manque : Mauk Tenieb pour combler ») : les alias présents sur Internet Archive gardent leurs sorties ; les autres Masks tirent deux coupes de Mauk Tenieb au hasard (tirage fixé) */
var KIT={dogxim:['dogxim-entering-1','dogxim-entering-2'],c7h5n3o6:['c7h5n3o6-arts-all-about-1','c7h5n3o6-bayou-1'],tsui_pen:['tsui-pen-jardin-1','tsui-pen-jardin-2'],auvergne:['auvergne-court-complexe-1','auvergne-court-complexe-2'],
 aube:['mt-mauk-tenieb-free-wolf-in-da-1','mantrajazzininterzone-2'],
 cadaver_synod:['furia-1-1','furia-1-2'],
 croisiere_noire:['cassette-zero2','interzone-men-at-work-2'],
 grand_colonel:['mt-mauk-tenieb-arabic-illbient-1','mt-mauk-tenieb-teknosok-live-mi-1'],
 hatra_loves:['mt-mauk-tenieb-antonin-artaud-j-1','mt-mauk-tenieb-christianophilia-1'],
 honey_buzzard:['libri-carolini-2','der-golem-2'],
 maiden_call:['interzone-men-at-work-1','mt-mauk-tenieb-jean-misere-pari-1'],
 malika:['libri-carolini-1','mt-mauk-tenieb-az-melochondria-1'],
 naphta:['carthago-our-times-1','mt-mauk-tenieb-tribute-to-sgm-t-1'],
 plague_of_justinian:['mantrajazzininterzone-1','mt-mauk-tenieb-le-monde-come-1'],
 poisoned_well:['20k368-2','scambug-1'],
 silent_pact:['20k368-1','scambug-2'],
 truce:['der-golem-1','african-alien-1'],
 unkle_maukie:['mt-mauk-tenieb-shia-34-live-mix-1','mt-mauk-tenieb-mugwump-1']};
function mslug(n){var k=String(n||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();for(var i=0;i<MASKS.length;i++)if(MASKS[i].replace(/_/g,'')===k)return MASKS[i];return ''}
var MAXS=64,NP=4;
/* 15 nov. 2026, 16 h 40 (Mauk Tenieb) : 15, 17, 19 ou 21 pas, tirés au hasard à chaque ouverture ; des mesures impaires, jamais carrées */var LENS=[15,17,19,21];
/* 20 h 18 : la Console a autant d'emplacements que la grille a de pas — 15, 17, 19 ou 21, au même tirage */
var S={view:'grid',slots:[],ns:0,pick:null,n:LENS[Math.floor(Math.random()*4)],pat:0,chain:false,bpm:96,swing:0,play:false,step:0,next:0,timer:0,sel:0,ch:[],lib:[],echoT:.375,echoF:.38,verb:.5,drive:0,master:.85,tt:null,kit:-1};
var BUF={},AC=null,G=null;
/* 13 nov. 2026 (critique Impeccable, contraste) : lettres de la bande Dymo noires sur bande claire, blanches sur bande sombre */
function tink(h){var m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));if(!m)return '#fff';var v=parseInt(m[1],16),f=function(x){x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)},L=.2126*f(v>>16&255)+.7152*f(v>>8&255)+.0722*f(v&255);return L>.22?'#15110b':'#fff'}
function base(){try{if(window.KG&&KG.base)return String(KG.base).replace(/kg-$/,'');}catch(e){}return '';}
function ac(){AC=window._bbAC;if(!AC){try{AC=window._bbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==='suspended')try{AC.resume();}catch(e){}return AC;}
function $(s,r){return (r||document).querySelector(s)}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function z64(){return new Uint8Array(MAXS)}

/* ---------- les voix ---------- */
/* 15 nov. 2026, 22 h 30 (banc d'essai) : une piste ajoutée prend aussi une figurine, le Mask le moins présent ; son socle garde la couleur de son son */
function freeMask(){var n={};MASKS.forEach(function(m){n[m]=0});S.ch.forEach(function(c){if(c.mask in n)n[c.mask]++});return MASKS.slice().sort(function(a,b){return n[a]-n[b]})[0]}
function newCh(o){if(!('mask' in o))o.mask=freeMask();var c={id:'c'+Math.random().toString(36).slice(2,8),name:'',color:'#c9a84c',kind:'syn',voice:'kick',root:0,src:null,buf:null,
  vol:.8,pan:0,tune:0,cut:1,res:0,drv:0,echo:0,verb:0,mute:false,steps:[],mel:[]};for(var k in o)c[k]=o[k];
  for(var p=0;p<NP;p++){if(!c.steps[p])c.steps[p]=z64();if(!c.mel[p])c.mel[p]=new Int8Array(MAXS)}return c}
function seed(){
  if(typeof window.bbBuildTracks==='function')try{window.bbBuildTracks();}catch(e){}
  var T=(window._bbTracks||[]).filter(function(t){return t.voice!=='diktat'}).slice(0,18),SE=window.BB_SEEDS||[];
  S.ch=T.map(function(t,i){var c=newCh({name:t.name,color:t.color,kind:'syn',voice:t.voice,root:t.root||0,mask:mslug(t.name)});
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
/* saturation compensée (15 nov. 2026, banc d'essai) : plus on pousse, plus le grain monte, le volume reste à peu près le même ; sans cela un kit montait de 38 dB et tout devenait un mur */
function curve(d){var n=1024,a=new Float32Array(n),k=d*60,c=Math.pow(1+k,-.62);for(var i=0;i<n;i++){var x=i*2/n-1;a[i]=k?(1+k)*x/(1+k*Math.abs(x))*Math.max(c,.08)*(1+.6*Math.min(1,k/4)):x}return a}
function ir(c,size){var len=Math.floor(c.sampleRate*(.6+size*3.2)),b=c.createBuffer(2,len,c.sampleRate);for(var ch=0;ch<2;ch++){var d=b.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4+ (1-size)*3)}return b}
function graph(c){if(c.__mz)return c.__mz;var g={c:c,strip:{}};
  g.out=c.createGain();g.out.gain.value=S.master;g.comp=c.createDynamicsCompressor();g.comp.threshold.value=-14;g.comp.ratio.value=3;g.comp.attack.value=.005;g.comp.release.value=.2;
  g.sat=c.createWaveShaper();g.sat.curve=curve(S.drive*.5);g.sat.oversample='2x';
  /* garde finale : linéaire jusqu'à 0,7, puis genou doux vers 1 ; les kits les plus durs saturent en analogique au lieu d'écrêter en numérique */g.lim=c.createWaveShaper();g.lim.curve=(function(){var n=2048,a=new Float32Array(n);for(var i=0;i<n;i++){var x=(i*2/n-1)*4,y=Math.abs(x);a[i]=Math.sign(x)*(y<.7?y:.7+.3*Math.tanh((y-.7)/.3))}return a})();g.lim.oversample='2x';var pre=c.createGain();pre.gain.value=.25;g.out.connect(g.sat);g.sat.connect(g.comp);g.comp.connect(pre);pre.connect(g.lim);g.lim.connect(c.destination);
  g.dly=c.createDelay(2);g.dly.delayTime.value=S.echoT;g.fb=c.createGain();g.fb.gain.value=S.echoF;g.dlf=c.createBiquadFilter();g.dlf.type='lowpass';g.dlf.frequency.value=3200;
  g.dIn=c.createGain();g.dIn.connect(g.dly);g.dly.connect(g.dlf);g.dlf.connect(g.fb);g.fb.connect(g.dly);g.dlf.connect(g.out);
  g.rev=c.createConvolver();g.rev.buffer=ir(c,S.verb);g.rIn=c.createGain();g.rIn.connect(g.rev);g.rev.connect(g.out);
  /* effets échantillon par échantillon (musik-fx.js) */g.wl=false;try{c.audioWorklet&&c.audioWorklet.addModule(base()+'musik-fx.js').then(function(){if(g.wl)return;g.wl=true;S.ch.forEach(function(ch){if(ch.fx&&g.strip[ch.id])fxSet(g,ch)})}).catch(function(){})}catch(e){}
  c.__mz=g;return g}
function strip(g,ch){var s=g.strip[ch.id];if(s)return s;var c=g.c;s={};
  s.inp=c.createGain();s.f=c.createBiquadFilter();s.f.type='lowpass';s.sh=c.createWaveShaper();s.v=c.createGain();
  s.p=c.createStereoPanner?c.createStereoPanner():c.createGain();s.e=c.createGain();s.r=c.createGain();
  s.fxIn=c.createGain();s.fxOut=c.createGain();s.inp.connect(s.f);s.f.connect(s.sh);s.sh.connect(s.fxIn);s.fxIn.connect(s.fxOut);s.fxOut.connect(s.v);s.v.connect(s.p);s.p.connect(g.out);s.v.connect(s.e);s.e.connect(g.dIn);s.v.connect(s.r);s.r.connect(g.rIn);
  g.strip[ch.id]=s;apply(g,ch);if(ch.fx)fxSet(g,ch);return s}
/* 15 nov. 2026, 20 h 29 (Mauk Tenieb : « tous les effets FruityLoops. Ou les meilleurs. Les plus forts, les plus insolites et singuliers ») : un effet par piste, choisi en pictogramme, dosé par la molette FX.
   GROSS (Gross Beat), CRUSH (Bitcrusher), GRAIN (Granulizer), REVS (tranches à l'envers), RING (modulation en anneau) : musik-fx.js ;
   VOWEL (filtre de voyelles, à la Vocodex), FLANGE (Flanger), PHASE (Phaser) : nœuds du navigateur */
var FXL=['','gross','crush','grain','revs','ring','vowel','flange','phase','oct','tape','fdbk','metal'];
var VOW=[[800,1150,2900],[400,1600,2700],[350,2200,2900],[450,800,2830],[325,700,2530]];
function fxSet(g,ch){var s=g.strip[ch.id];if(!s)return;var c=g.c;try{s.fxIn.disconnect()}catch(e){}if(s.fxN&&s.fxN.stop)try{s.fxN.stop()}catch(e){}s.fxN=null;
  var k=ch.fx||'';if(!k){s.fxIn.connect(s.fxOut);return}
  if(['gross','crush','grain','revs','ring','oct','tape','fdbk','metal'].indexOf(k)>=0){if(!g.wl){s.fxIn.connect(s.fxOut);return}
    /* un seul processeur par piste, réutilisé d'un effet à l'autre : changer d'effet n'en crée pas un nouveau qui tournerait à vide */var n=s.wln;if(!n){n=s.wln=new AudioWorkletNode(c,'mz-fx',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{mode:k}})}n.port.postMessage({mode:k});s.fxIn.connect(n);n.connect(s.fxOut);s.fxN={k:k,n:n,stop:function(){try{n.disconnect()}catch(e){}n.port.postMessage({mode:'off'})}}}
  else if(k==='vowel'){var dry=c.createGain(),fl=VOW[0].map(function(){var b=c.createBiquadFilter();b.type='bandpass';b.Q.value=9;s.fxIn.connect(b);var a=c.createGain();a.gain.value=2.4;b.connect(a);a.connect(s.fxOut);return b});
    var lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.35;lg.gain.value=0;lfo.connect(lg);fl.forEach(function(b){lg.connect(b.detune)});lfo.start();
    s.fxIn.connect(dry);dry.connect(s.fxOut);s.fxN={k:k,fl:fl,dry:dry,lg:lg,stop:function(){try{lfo.stop()}catch(e){}fl.forEach(function(b){try{b.disconnect()}catch(e){}});try{dry.disconnect()}catch(e){}}}}
  else{var d=c.createDelay(.05),fb=c.createGain(),wet=c.createGain(),dr=c.createGain(),lf=c.createOscillator(),dp=c.createGain(),ap=[];
    if(k==='flange'){d.delayTime.value=.004;lf.frequency.value=.22;dp.gain.value=.003;lf.connect(dp);dp.connect(d.delayTime);s.fxIn.connect(d);d.connect(fb);fb.connect(d);d.connect(wet)}
    else{var last=s.fxIn;for(var i=0;i<6;i++){var a=c.createBiquadFilter();a.type='allpass';a.frequency.value=700;a.Q.value=.7;last.connect(a);last=a;ap.push(a)}lf.frequency.value=.3;dp.gain.value=600;lf.connect(dp);ap.forEach(function(a){dp.connect(a.frequency)});/* une boucle Web Audio sans retard se tait : 3 ms de retard dans le retour du phaser (audit Ponytail) */var pd=c.createDelay(.01);pd.delayTime.value=.003;last.connect(fb);fb.connect(pd);pd.connect(ap[0]);ap.push(pd);last.connect(wet)}
    lf.start();s.fxIn.connect(dr);dr.connect(s.fxOut);wet.connect(s.fxOut);s.fxN={k:k,fb:fb,wet:wet,dr:dr,dp:dp,stop:function(){try{lf.stop()}catch(e){}[d,fb,wet,dr].concat(ap).forEach(function(x){try{x.disconnect()}catch(e){}})}}}
  fxAmt(g,ch)}
function fxAmt(g,ch){var s=g.strip[ch.id];if(!s||!s.fxN)return;var a=ch.fxa==null?.5:ch.fxa,t=g.c.currentTime,N=s.fxN;
  if(N.n){var P=N.n.parameters;P.get('amt').setValueAtTime(a,t);P.get('step').setValueAtTime(stepDur(),t)}
  else if(N.k==='vowel'){var v=a*(VOW.length-1),i=Math.min(VOW.length-2,Math.floor(v)),f=v-i;N.fl.forEach(function(b,j){b.frequency.setTargetAtTime(VOW[i][j]*(1-f)+VOW[i+1][j]*f,t,.05)});N.dry.gain.setTargetAtTime(.25,t,.05);N.lg.gain.setTargetAtTime(120+a*500,t,.1)}
  else{N.fb.gain.setTargetAtTime(N.k==='flange'?a*.88:a*.7,t,.05);N.wet.gain.setTargetAtTime(.75,t,.05);N.dr.gain.setTargetAtTime(.75,t,.05);if(N.k==='flange')N.dp.gain.setTargetAtTime(.0005+a*.0035,t,.05)}}
var FXI={'':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 17 17 7" stroke="currentColor" stroke-width="2"/></svg>',
 gross:'<svg viewBox="0 0 24 24"><path d="M3 18V8h3v10M8 18v-6h3v6M13 18V5h3v13M18 18v-8h3v8" fill="currentColor"/></svg>',
 crush:'<svg viewBox="0 0 24 24"><path d="M3 16h4v-4h4V8h4v4h4v4h2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="miter"/></svg>',
 grain:'<svg viewBox="0 0 24 24"><circle cx="5" cy="7" r="1.8" fill="currentColor"/><circle cx="11" cy="13" r="2.4" fill="currentColor"/><circle cx="18" cy="6" r="1.4" fill="currentColor"/><circle cx="16" cy="17" r="2" fill="currentColor"/><circle cx="7" cy="18" r="1.2" fill="currentColor"/></svg>',
 revs:'<svg viewBox="0 0 24 24"><path d="M20 7H8l3-3M20 7v0M4 17h12l-3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 ring:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
 vowel:'<svg viewBox="0 0 24 24"><path d="M4 9c3-4 13-4 16 0-2 7-14 7-16 0z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11h8" stroke="currentColor" stroke-width="2"/></svg>',
 flange:'<svg viewBox="0 0 24 24"><path d="M2 12c3-6 5 6 8 0s5 6 8 0 3-3 4-2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 16c3-6 5 6 8 0s5 6 8 0" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"/></svg>',
 phase:'<svg viewBox="0 0 24 24"><path d="M3 12c2-7 4-7 6 0s4 7 6 0 4-7 6 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18" stroke="currentColor" stroke-width="1" opacity=".5"/></svg>',
 oct:'<svg viewBox="0 0 24 24"><path d="M3 8c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0 3 3 4.5 0" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 17V13h9v4h9v-4" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
 tape:'<svg viewBox="0 0 24 24"><circle cx="7" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 18h16M7 14l-3 4M17 14l3 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
 fdbk:'<svg viewBox="0 0 24 24"><path d="M12 12a2 2 0 1 1 2 2 4 4 0 1 1-4-4 6 6 0 1 1 6 6 8 8 0 0 1-8-8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
 metal:'<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9l10 2M7 13l8 3M9 16l6-6" stroke="currentColor" stroke-width="1.3"/><circle cx="6.5" cy="7" r=".9" fill="currentColor"/><circle cx="17.5" cy="17" r=".9" fill="currentColor"/></svg>'};
/* 15 nov. 2026, 21 h 38 (Mauk Tenieb : « indiquer tribute to. Ou rien : des lettres grecques ») : six kits d'effets tirés de ce que les artistes de power electronics disent utiliser ; chaque kit pose un effet par piste, en tournant dans sa liste, avec la saturation et l'écho du maître. Un second appui rend les réglages d'avant. */
var KITS=[{l:'\u0391',t:'Whitehouse',fx:['ring','fdbk','crush'],a:.75,drv:0.45,echo:.08,verb:0,m:{drive:.25,echoF:.3}},
 {l:'\u0392',t:'Sutcliffe J\u00fcgend',fx:['tape','gross','vowel'],a:.6,drv:.3,echo:.25,verb:.3,m:{drive:.12,echoF:.55}},
 {l:'\u0393',t:'Merzbow',fx:['metal','fdbk','crush','grain'],a:.85,drv:0.55,echo:.05,verb:.1,m:{drive:.3,echoF:.35}},
 {l:'\u0394',t:'Atrax Morgue',fx:['tape','crush','oct'],a:.55,drv:0.35,echo:.2,verb:.15,m:{drive:.15,echoF:.5}},
 {l:'\u0395',t:'Prurient',fx:['fdbk','oct','metal'],a:.8,drv:0.5,echo:.1,verb:.2,m:{drive:.22,echoF:.4}},
 {l:'\u0396',t:'Pharmakon',fx:['metal','vowel','tape','oct'],a:.65,drv:0.4,echo:.15,verb:.35,m:{drive:.18,echoF:.45}}];
function kitSet(i){var g=AC&&AC.__mz,K=['fx','fxa','drv','echo','verb'];
  if(S.kit===i||i<0){if(S.kitBak){S.ch.forEach(function(c){var b=S.kitBak.ch[c.id];if(b)K.forEach(function(k){c[k]=b[k]})});S.drive=S.kitBak.drive;S.echoF=S.kitBak.echoF}S.kit=-1;S.kitBak=null}
  else{if(S.kitBak)S.ch.forEach(function(c){if(!S.kitBak.ch[c.id]){var o={};K.forEach(function(k){o[k]=c[k]});S.kitBak.ch[c.id]=o}});if(!S.kitBak){var B={};S.ch.forEach(function(c){B[c.id]={};K.forEach(function(k){B[c.id][k]=c[k]})});S.kitBak={ch:B,drive:S.drive,echoF:S.echoF}}
    var k=KITS[i];S.kit=i;S.ch.forEach(function(c,j){c.fx=k.fx[j%k.fx.length];c.fxa=k.a;c.drv=k.drv;c.echo=k.echo;c.verb=k.verb});S.drive=k.m.drive;S.echoF=k.m.echoF}
  if(g){S.ch.forEach(function(c){apply(g,c);fxSet(g,c)});masterApply(g)}var M=$('#mz-mst',ROOT);if(M){M.__k=0;M.innerHTML=''}strips()}
function fxRow(c){var r=el('div','mzfx');FXL.forEach(function(k){var b=el('button',null,FXI[k]);b.type='button';b.dataset.fx=k;b.setAttribute('aria-label',k?k.toUpperCase():(FR?'Sans effet':'No effect'));b.title=b.getAttribute('aria-label');b.classList.toggle('on',(c.fx||'')===k);
  b.onclick=function(){c.fx=k;if(c.fxa==null)c.fxa=.5;[].forEach.call(r.children,function(x){x.classList.toggle('on',x===b)});if(AC&&AC.__mz&&AC.__mz.strip[c.id])fxSet(AC.__mz,c)};r.appendChild(b)});return r}
function apply(g,ch){var s=g.strip[ch.id];if(!s)return;var t=g.c.currentTime;
  s.f.frequency.setTargetAtTime(60*Math.pow(2,ch.cut*8.4),t,.02);s.f.Q.setTargetAtTime(.5+ch.res*22,t,.02);s.sh.curve=ch.drv>.01?curve(ch.drv):null;
  s.v.gain.setTargetAtTime(ch.mute?0:ch.vol*ch.vol*1.2,t,.02);if(s.p.pan)s.p.pan.setTargetAtTime(ch.pan,t,.02);s.e.gain.setTargetAtTime(ch.echo*.9,t,.02);s.r.gain.setTargetAtTime(ch.verb*1.1,t,.02)}
function masterApply(g){var t=g.c.currentTime;/* un kit pose saturation et effets sur toutes les pistes : le maître baisse d'autant, la garde finale sature sans faire un mur */g.out.gain.setTargetAtTime(S.master*(S.kit>=0?.6:1),t,.03);g.dly.delayTime.setTargetAtTime(S.echoT,t,.05);g.fb.gain.setTargetAtTime(S.echoF,t,.03);g.sat.curve=curve(S.drive*.5)}
var verbT=0;function verbLater(){clearTimeout(verbT);verbT=setTimeout(function(){if(AC&&AC.__mz)AC.__mz.rev.buffer=ir(AC,S.verb)},250)}

function hit(c,ch,step,time,p){if(ch.kind==='img'||ch.kind==='vid'){if(c===AC)setTimeout(function(){vshow(ch)},Math.max(0,(time-c.currentTime)*1000));return}var g=graph(c),s=strip(g,ch);
  if(ch.kind==='smp'){var b=ch.buf;if(!b)return;var src=c.createBufferSource(),e=c.createGain(),rate=Math.pow(2,(ch.tune+(ch.mel[p]?ch.mel[p][step]:0))/12),len=Math.min(b.duration/rate,6);
    src.buffer=b;src.playbackRate.value=rate;e.gain.setValueAtTime(0,time);e.gain.linearRampToValueAtTime(1,time+.004);e.gain.setValueAtTime(1,time+Math.max(.01,len-.03));e.gain.linearRampToValueAtTime(0,time+len);
    /* une piste, une voix : le coup suivant coupe le précédent (15 nov. 2026, 22 h 52) */if(ch.__e&&ch.__e.context===c){try{var gp=ch.__e.gain;gp.cancelAndHoldAtTime?gp.cancelAndHoldAtTime(time):gp.cancelScheduledValues(time);ch.__e.gain.setTargetAtTime(0,time,.008);ch.__src.stop(time+.06)}catch(x){}}if(c===AC){ch.__e=e;ch.__src=src}
    src.connect(e);e.connect(s.inp);src.start(time);src.stop(time+len+.02);return}
  if(typeof window.bbVoice!=='function')return;
  var keepT=window._bbTracks,keepB=c.__ikBus,keepS=window._bbStep,tr={name:ch.name,voice:ch.voice,root:(ch.root||0)+ch.tune+(ch.mel[p]?ch.mel[p][step]:0),pitch:null,steps:[1,1,1,1,1,1,1,1]};
  try{window._bbTracks=[tr];c.__ikBus=s.inp;window._bbStep=0;window.bbVoice(c,0,time)}catch(e){}finally{window._bbTracks=keepT;c.__ikBus=keepB;window._bbStep=keepS}}

/* ---------- l'horloge ---------- */
function stepDur(){return 60/S.bpm/4}
function tick(){if(!S.play||!AC)return;var ct=AC.currentTime,d=stepDur();if(S.next<ct-.05)S.next=ct+.02;
  while(S.next<ct+.12){var st=S.step,p=S.pat,at=S.next+(st%2?S.swing*d*.6:0),sol=S.ch.some(function(c){return c.solo});
    S.ch.forEach(function(ch){if(ch.steps[p][st]&&!ch.mute&&(!sol||ch.solo)&&live(ch)){hit(AC,ch,st,at,p);if(ch.mask)figHop(ch.mask,(at-ct)*1000)}});
    if(S.view==='stage')conStep(st,at,Math.max(0,(at-ct)*1000),sol);
    (function(st,p,ms){setTimeout(function(){if(S.play)cursor(st,p)},ms)})(st,p,Math.max(0,(at-ct)*1000));
    S.step++;if(S.step>=S.n){S.step=0;if(S.chain){S.pat=(S.pat+1)%NP;setTimeout(function(){paintPat();rack()},Math.max(0,(S.next+d-ct)*1000))}}S.next+=d}
  S.timer=setTimeout(tick,25)}
/* 15 nov. 2026 (RELAIS § 29) : en vue Console, les Masks jouent seulement depuis leurs emplacements ; les autres voix (Kamescope, fichiers) jouent toujours */
function live(ch){return S.view!=='stage'||!ch.mask}
function play(on){S.play=on;clearTimeout(S.timer);if(on){if(!ac())return;S.step=0;S.next=AC.currentTime+.06;tick()}else cursor(-1);var b=$('#mz-play');if(b){b.classList.toggle('on',on);b.innerHTML=on?IC.stop:IC.play}}

/* ---------- les samples ---------- */
function load(it){if(it.buf)return Promise.resolve(it.buf);if(BUF[it.url])return Promise.resolve(it.buf=BUF[it.url]);var c=ac();if(!c)return Promise.reject();
  return fetch(base()+it.url).then(function(r){return r.arrayBuffer()}).then(function(b){return new Promise(function(ok,ko){c.decodeAudioData(b,ok,ko)})}).then(function(b){BUF[it.url]=b;it.buf=b;return b})}
function clipBuf(clip){var c=ac();if(!c)return null;var b=c.createBuffer(1,clip.data.length,clip.sr);b.getChannelData(0).set(clip.data);return b}
function audition(b){var c=ac();if(!c||!b)return;var s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=.8;s.connect(g);g.connect(graph(c).out);s.start();setTimeout(function(){try{s.stop()}catch(e){}},2500)}
var VIMG=['room-puck-1.webp','room-puck-2.webp','room-puck-3.webp','room-puck-4.webp','room-puck-5.webp','room-puck-6.webp','kave/a/vc/vc-01-salle.webp','kave/a/vc/vc-02-rayon.webp','kave/a/vc/vc-03-comptoir.webp','kave/a/att-01.webp','kave/a/att-02.webp','kave/a/att-05.webp','kave/a/att-09.webp','kave/a/att-14.webp','kave/a/att-19.webp','kave/a/att-23.webp','kave/a/att-27.webp'],
 VVID=[['clip-interzone-is-internet','Interzone is Internet','clip'],['clip-mola-golem','Der Golem, Mola Golem','clip'],['clip-bayou','Anthropobots Fuck You in the Bayou','clip'],['clip-jardin','El jard\u00edn de senderos que se bifurcan','clip'],['clip-court-complexe','Court Complexe','clip'],['demo-korong','Korong!'],['demo-fi','FaunInvaders'],['demo-chess','Fauna Chess'],['demo-c4','Konnect4'],['demo-hang','Akasztófa'],['demo-c4-v1','Konnect4 v1'],['demo-hang-v1','Akasztófa v1']];
function visLib(){var M=MASKS;
 return VIMG.map(function(u){var n=u.split('/').pop().replace(/\.webp$/,'').replace(/^room-puck-/,'Room ').replace(/^vc-0\d-/,'Kave ').replace(/^att-/,'Motel ');return {id:'i:'+u,name:n,url:u,col:'#c9b6ff',kind:'img'}})
  .concat(M.map(function(m){return {id:'i:b-'+m,name:m.replace(/_/g,' '),url:'kave/a/b-'+m+'.webp',col:'#c9b6ff',kind:'img'}}))
  .concat(VVID.map(function(v){return {id:'v:'+v[0],name:v[1],url:'kave/a/tv/'+(v[2]||'demo')+'/'+v[0]+'.mp4',col:'#8fe3d4',kind:'vid'}}))}
function buildLib(){libK();S.lib=visLib().concat(ALB.map(function(a){return {id:'a:'+a[0],name:a[1]+' \u00b7 '+a[0].slice(-1),url:'snd/pads/'+a[0]+'.mp3',col:'#ffa726'}}).concat(BRN.map(function(a){return {id:'b:'+a[0],name:a[1],url:'snd/'+a[0]+'.mp3',col:'#4fc3f7'}})));
}
function libV(){if(window.__borneVid)window.__borneVid.all().then(function(L){S.lib=S.lib.filter(function(x){if(x.id.slice(0,3)!=='kv:')return true;if(x!==TT.vit)try{URL.revokeObjectURL(x.file)}catch(e){}return false});L.slice(0,12).reverse().forEach(function(c){S.lib.unshift({id:'kv:'+c.id,name:c.name,col:'#ff3b2f',kind:'vid',file:URL.createObjectURL(c.blob)})});libDraw()})}
function libK(){libV();if(window.__borneDiktat)window.__borneDiktat.all().then(function(L){S.lib=S.lib.filter(function(x){return x.id.slice(0,2)!=='k:'});L.slice(0,5).reverse().forEach(function(c){var it={id:'k:'+c.id,name:c.name,col:'#ff3b2f',clip:c};it.buf=clipBuf(c);S.lib.unshift(it);
      if(!S.ch.some(function(x){return x.src===it.id}))S.ch.push(newCh({name:c.name,color:'#ff3b2f',kind:'smp',src:it.id,buf:it.buf,vol:.75}))});libDraw();rack()})}
function media(it){if(it.media)return Promise.resolve(it.media);return new Promise(function(ok,ko){var m;if(it.kind==='vid'){m=document.createElement('video');m.muted=true;m.loop=true;m.playsInline=true;m.preload='auto';m.crossOrigin='anonymous';m.oncanplay=function(){m.oncanplay=null;ok(it.media=m)};m.onerror=ko}else{if(!it.file&&window.ikTableaux&&/room-puck-\d/.test(it.url)){/* chambres : portraits de la Fauna au hasard dans les cadres */ikTableaux(base()+it.url).then(function(c){c.naturalWidth=c.width;c.naturalHeight=c.height;ok(it.media=c)},ko);return}m=new Image();m.onload=function(){ok(it.media=m)};m.onerror=ko}m.src=it.file||base()+it.url})}
/* un son arrivé en retard ne remplace pas un choix plus récent (audit Ponytail) */function loadInto(ch,it){ch.want=it.id;if(it.kind==='img'||it.kind==='vid'){media(it).then(function(m){if(ch.want!==it.id)return;ch.kind=it.kind;ch.media=m;ch.buf=null;ch.src=it.id;ch.name=it.name;ch.color=it.col;rack();strips();vshow(ch)}).catch(function(){});return}
 load(it).then(function(b){if(ch.want!==it.id||S.ch.indexOf(ch)<0)return;ch.kind='smp';ch.buf=b;ch.src=it.id;ch.name=it.name;if(ch.color==='#c9a84c'||!ch.color)ch.color=it.col;rack();strips();ttLoad(it);audition(b)}).catch(function(){})}
function fileInto(ch,f){if(/^(image|video)\//.test(f.type)){var it={id:'f:'+f.name+Date.now(),name:f.name.replace(/\.[^.]+$/,'').slice(0,24),col:/^video/.test(f.type)?'#8fe3d4':'#c9b6ff',kind:/^video/.test(f.type)?'vid':'img',file:URL.createObjectURL(f)};S.lib.unshift(it);libDraw();if(!ch){ch=newCh({color:it.col});S.ch.push(ch)}loadInto(ch,it);return}
 var c=ac();if(!c)return;f.arrayBuffer().then(function(a){return new Promise(function(ok,ko){c.decodeAudioData(a,ok,ko)})}).then(function(b){var it={id:'f:'+f.name+Date.now(),name:f.name.replace(/\.[^.]+$/,'').slice(0,24),col:'#b9d84a',buf:b};S.lib.unshift(it);libDraw();
  if(!ch){ch=newCh({color:it.col});S.ch.push(ch)}loadInto(ch,it)}).catch(function(){})}

/* ---------- l'interface ---------- */
var IC={play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',stop:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" fill="currentColor"/></svg>',
 dice:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.4" fill="currentColor"/><circle cx="15" cy="15" r="1.4" fill="currentColor"/><circle cx="15" cy="9" r="1.4" fill="currentColor"/><circle cx="9" cy="15" r="1.4" fill="currentColor"/></svg>',
 clear:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 chain:'<svg viewBox="0 0 24 24"><rect x="3" y="9" width="9" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="12" y="9" width="9" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
 kave:'<svg viewBox="0 0 24 24"><path d="M12 3.5v12M7 11l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 20.2h8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
 add:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 grid:'<svg viewBox="0 0 24 24"><g fill="currentColor"><rect x="3" y="4" width="4" height="4" rx=".6"/><rect x="10" y="4" width="4" height="4" rx=".6"/><rect x="17" y="4" width="4" height="4" rx=".6"/><rect x="3" y="10" width="4" height="4" rx=".6" opacity=".45"/><rect x="10" y="10" width="4" height="4" rx=".6"/><rect x="17" y="10" width="4" height="4" rx=".6" opacity=".45"/><rect x="3" y="16" width="4" height="4" rx=".6"/><rect x="10" y="16" width="4" height="4" rx=".6" opacity=".45"/><rect x="17" y="16" width="4" height="4" rx=".6"/></g></svg>',
 stage:'<svg viewBox="0 0 24 24"><path d="M2.5 13.5 5 9h14l2.5 4.5v4H2.5z" fill="currentColor" opacity=".35"/><path d="M2.5 13.5h19v4h-19z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><g fill="currentColor"><rect x="5" y="14.6" width="2.4" height="1.8" rx=".4"/><rect x="9" y="14.6" width="2.4" height="1.8" rx=".4"/><rect x="12.6" y="14.6" width="2.4" height="1.8" rx=".4"/><rect x="16.6" y="14.6" width="2.4" height="1.8" rx=".4"/><circle cx="10.2" cy="5.6" r="1.8"/><path d="M8.4 12.4c.2-2.4 1-3.5 1.8-3.5s1.6 1.1 1.8 3.5z"/></g></svg>',
 syn:'<svg viewBox="0 0 24 24"><path d="M3 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 disc:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/></svg>',
 bell:'<svg viewBox="0 0 24 24"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 20.5h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 cam:'<svg viewBox="0 0 24 24"><rect x="3" y="7" width="13" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 11 5-3v8l-5-3z" fill="currentColor"/><circle cx="7" cy="10" r="1.2" fill="#c8302a"/></svg>',
 open:'<svg viewBox="0 0 24 24"><path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H10l2 2h6.5A1.5 1.5 0 0 1 20 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'};
var CSS=`
#bb-panel.mz-on>*:not(#mz):not(.kb-foot){display:none!important}
html #kg-root #bb-panel.mz-on.mz-on.mz-on.mz-on{display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:6px!important;padding:8px!important;overflow:hidden!important;grid-template-columns:none!important}
#mz .mzmain{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,300px);gap:6px;min-height:0}
#mz .mzside{display:flex;flex-direction:column;gap:6px;min-height:0}
#mz .mzscr{display:block;width:100%;aspect-ratio:16/9;height:auto;border-radius:3px;background:#080706;box-shadow:inset 0 0 0 1px #000,0 0 0 1px rgba(255,255,255,.05)}
#mz .mzttbox{align-items:center;flex:1;justify-content:center}/* 15 nov. 2026 (critique Impeccable, P1 : la platine coupée à 1366 et 1280) : la platine se règle sur la hauteur libre, pitch, 33, 45 et envers toujours visibles */#mz:not([data-v="tt"]) .mzside{min-height:0;overflow:hidden}#mz:not([data-v="tt"]) .mzttbox{min-height:0;justify-content:flex-start}#mz:not([data-v="tt"]) .mzttrow{flex:1 1 0;min-height:0}#mz:not([data-v="tt"]) .mztt{width:auto;height:100%;max-height:210px;max-width:calc(100% - 32px);min-height:0}#mz:not([data-v="tt"]) .mzpitch{height:100%;max-height:140px;min-height:0}/* l'entrée du poste de mix : une touche à deux disques sur la platine (critique Impeccable, P6) */#mz .mzmixgo{flex:none;width:32px;height:28px;border:0;border-radius:3px;display:grid;place-items:center;background:linear-gradient(#3b332a,#262019);color:var(--ink);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 1px 2px rgba(0,0,0,.7);cursor:pointer}#mz .mzmixgo svg{width:20px;height:20px}/* voyant de coupure : zone de toucher agrandie (critique Impeccable, P7) */#mz .mzled{position:relative}#mz .mzled::before{content:"";position:absolute;inset:-8px -6px}
#mz .mzlibh{display:flex;align-items:center;gap:6px}#mz #mz-kind button{display:grid;place-items:center;min-width:38px}#mz #mz-kind svg{width:18px;height:18px}
#mz{--pl:#17130e;--pl2:#221c14;--ink:#efe3cf;--dim:#b3a994;--amb:var(--pal-accent,#f2a93b);--led:#c8302a;flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:6px;color:var(--ink);font:500 11px/1 "DM Mono",monospace;letter-spacing:.08em;user-select:none;-webkit-user-select:none}
#mz button{font:inherit;color:inherit;cursor:pointer}
#mz .mzbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;background:linear-gradient(#2a2219,#17120c);border-radius:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 0 1px #000}
#mz .mzbt{display:grid;place-items:center;min-width:40px;height:40px;padding:0 8px;border:0;border-radius:4px;background:linear-gradient(#3a3027,#1d1812);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 3px rgba(0,0,0,.65);color:var(--ink)}
#mz .mzbt:active{transform:translateY(1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 1px 1px rgba(0,0,0,.7)}
#mz button:focus-visible,#mz .mzkn:focus-visible{outline:2px solid var(--amb);outline-offset:2px}
#mz ::-webkit-scrollbar{width:8px;height:8px}#mz ::-webkit-scrollbar-thumb{background:#4a3e31;border-radius:4px}#mz ::-webkit-scrollbar-track{background:transparent}#mz *{scrollbar-color:#4a3e31 transparent}
#mz .mzbt svg{width:20px;height:20px}#mz .mzbt.on{background:var(--amb);color:#1a1006}#mz #mz-play.on{background:linear-gradient(#d8443a,#a3241c);color:#fff}
#mz .mzseg{display:flex;padding:3px;gap:2px;border-radius:4px;background:#0a0806;box-shadow:inset 0 0 0 1px #000}
#mz .mzseg button{min-width:30px;height:34px;border:0;border-radius:3px;background:none;color:var(--dim);font-weight:700}
#mz .mzseg button.on{background:var(--amb);color:#1a1006}
#mz .mzlcd{min-width:58px;height:34px;display:grid;place-items:center;padding:0 6px;background:#0b1208;color:#9ad86a;border-radius:3px;box-shadow:inset 0 0 0 1px #000,inset 0 0 12px rgba(154,216,106,.15);font:400 15px/1 "Press Start 2P",monospace;text-shadow:0 0 6px rgba(154,216,106,.6)}
#mz .mzsp{flex:1}
#mz .mzrack{overflow:auto;background:var(--pl);border-radius:6px;box-shadow:inset 0 0 0 1px #000;padding:4px;overscroll-behavior:contain}
#mz .mzrow{display:flex;align-items:center;gap:4px;height:26px;margin-bottom:3px;min-width:max-content}
#mz .mzrow.sel .mznm{box-shadow:inset 0 0 0 1px var(--amb)}
#mz .mzled{flex:none;width:9px!important;height:9px!important;min-height:0!important;min-width:0!important;padding:0!important;margin:0 3px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 35%,#b9f5a8,#5bd15b 55%,#2e8a2e);box-shadow:0 0 3px #5bd15b,inset 0 -1px 2px rgba(0,0,0,.5)}
#mz .mzled.off{background:radial-gradient(circle at 35% 35%,#555,#1c1c1c);box-shadow:inset 0 -1px 2px rgba(0,0,0,.6)}
#mz .mznm{flex:none;width:126px;height:24px;display:flex;align-items:center;gap:6px;padding:0 6px;border:0;border-radius:3px;background:linear-gradient(#3b332a,#262019);text-align:left;overflow:hidden;white-space:nowrap}
#mz .mznm i{flex:none;width:8px;height:8px;border-radius:2px;background:var(--c);box-shadow:inset 0 -1px 0 rgba(0,0,0,.35)}#mz .mznm span{overflow:hidden;text-overflow:ellipsis}
#mz .mznm:is(.smp,.img,.vid) span::before{content:"";display:inline-block;width:11px;height:11px;margin-right:5px;vertical-align:-1px;background:var(--c);-webkit-mask:var(--ki) center/contain no-repeat;mask:var(--ki) center/contain no-repeat}
#mz .mznm.smp{--ki:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 12h2l2-6 3 12 3-15 3 15 2-6h3' fill='none' stroke='black' stroke-width='2.4' stroke-linejoin='round'/%3E%3C/svg%3E")}
#mz .mznm.img{--ki:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='5' width='18' height='14' rx='1.5' fill='none' stroke='black' stroke-width='2.4'/%3E%3Cpath d='m5 17 5-5 3 3 2-2 4 4' fill='none' stroke='black' stroke-width='2.2'/%3E%3C/svg%3E")}
#mz .mznm.vid{--ki:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='5' width='18' height='14' rx='1.5' fill='none' stroke='black' stroke-width='2.4'/%3E%3Cpath d='m10 9 5 3-5 3z' fill='black'/%3E%3C/svg%3E")}
#mz .mzrow.drop .mznm,#mz .mzadd.drop{box-shadow:0 0 0 2px var(--amb)!important}
#mz .mzstp{display:flex;gap:2px;flex:1 1 auto;min-width:0}
#mz .mzs{flex:1 0 18px;height:24px;border-radius:3px;background:#3a3129;box-shadow:inset 0 -2px 0 rgba(0,0,0,.35);touch-action:none}
#mz .mzs.b{background:#4a2a24}
#mz .mzs.g{margin-left:4px}
#mz .mzs.on{background:var(--c);box-shadow:inset 0 -2px 0 rgba(0,0,0,.3),0 0 6px var(--c)}
#mz .mzs.cur{outline:1px solid rgba(255,255,255,.7);outline-offset:-1px}
#mz .mzadd{display:flex;align-items:center;gap:8px;height:30px;padding:0 10px;margin-top:4px;border:1px dashed #5a4c3c;border-radius:4px;background:none;color:var(--dim);width:max-content}
#mz .mzadd svg{width:16px;height:16px}
#mz .mzdeck{display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:6px;align-items:stretch}
#mz .mzbox{background:url(${base()}kave/a/mix/screw.webp) left 5px top 5px/11px 11px no-repeat,url(${base()}kave/a/mix/screw.webp) right 5px top 5px/11px 11px no-repeat,url(${base()}kave/a/mix/screw.webp) left 5px bottom 5px/11px 11px no-repeat,url(${base()}kave/a/mix/screw.webp) right 5px bottom 5px/11px 11px no-repeat,linear-gradient(rgba(10,8,6,.42),rgba(10,8,6,.42)),url(${base()}kave/a/mix/plate.webp) center/cover,#141210;border-radius:3px;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),inset 0 -1px 0 rgba(0,0,0,.6),0 0 0 1px #000,0 3px 8px rgba(0,0,0,.6);padding:6px 20px;display:flex;flex-direction:column;gap:4px;min-width:0}
#mz .mzbox h4{margin:0;font:700 11px/1 "DM Mono",monospace;letter-spacing:.2em;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mz .mzbox h4 b{color:var(--c,var(--amb))}
#mz .mzkns{display:flex;flex-wrap:wrap;gap:4px 6px}#mz .mzfx{display:flex;flex-wrap:wrap;gap:3px;margin:2px 0 6px}#mz .mzfx button{width:30px!important;height:26px!important;min-width:0!important;min-height:0!important;padding:0!important;display:grid;place-items:center;border:0;border-radius:3px;background:linear-gradient(#3b332a,#262019);color:#cfc3ad;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 1px 2px rgba(0,0,0,.7)}#mz .mzfx button svg{width:17px;height:17px}#mz .mzfx button.on{background:linear-gradient(#ffb547,#e08a12);color:#1a0e00}@media (max-width:760px),(orientation:portrait),(pointer:coarse){#mz .mzfx button{width:44px!important;height:44px!important}}
#mz .mzfw{display:flex;align-items:center;justify-content:center;width:34px;height:84px;background:#1a1612;border-radius:3px;box-shadow:inset 0 1px 3px rgba(0,0,0,.8)}#mz .mzfad{writing-mode:vertical-lr;direction:rtl;width:24px;height:76px;margin:0;accent-color:#d9cfb4}
#mz .mzvu{display:flex;gap:2px;margin-top:4px}#mz .mzvu i{flex:1;height:6px;border-radius:1px;background:#2a241e}#mz .mzvu i.g{background:#5bd15b;box-shadow:0 0 3px #5bd15b}#mz .mzvu i.a{background:#f2a93b;box-shadow:0 0 3px #f2a93b}#mz .mzvu i.r{background:#c8302a;box-shadow:0 0 3px #c8302a}
#mz .mzkn{display:flex;flex-direction:column;align-items:center;gap:3px;width:48px;touch-action:none;cursor:ns-resize}
#mz .mzkn svg{width:44px;height:44px;display:block}#mz .mzkn small{display:block;line-height:0;color:#c9bfa9;opacity:.85;filter:drop-shadow(0 1px 0 rgba(0,0,0,.9))}#mz .mzkn small svg{width:15px;height:15px}#mz .mzkn svg image{filter:drop-shadow(0 1px 1px #000)}
#mz .mzlib{display:flex;flex-wrap:wrap;gap:4px;overflow:auto;max-height:96px;align-content:flex-start}
#mz .mzlb{flex:none;width:118px;height:44px;padding:0 8px;border:0;border-radius:4px;color:#2b2620;font-weight:700;font-size:11px;background:linear-gradient(#e9e1cc,#d9cfb4) padding-box;border:5px solid #2a231c;border-width:6px 6px 14px;background-clip:padding-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 1px 2px rgba(0,0,0,.6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;touch-action:pan-y;display:flex;align-items:center;gap:6px}
#mz .mzlb::before{content:"";flex:none;width:6px;height:18px;border-radius:2px;background:var(--c)}
#mz .mzlb{position:relative}#mz .mzlb>span{display:block;flex:1;min-width:0;overflow:hidden;white-space:nowrap}#mz .mzlb::after{content:"";position:absolute;left:50%;bottom:-11px;width:34px;height:7px;margin-left:-17px;border-radius:4px;background:radial-gradient(circle at 20% 50%,#0d0b09 2px,transparent 3px),radial-gradient(circle at 80% 50%,#0d0b09 2px,transparent 3px),#3a3129}
#mz .mzlib{max-height:118px;gap:6px}
#mz .mzttrow{display:flex;align-items:center;gap:10px;width:100%;justify-content:center}#mz .mzttbox{min-height:0}#mz .mzttbox .mzttrow{flex:1 1 0;min-height:0}@media (min-width:761px) and (orientation:landscape){#mz .mzttrow .mzttctl{flex-direction:column;gap:4px!important}#mz .mzttrow .mzttctl .mzseg{flex-direction:column}#mz .mzttrow .mzttctl button{height:25px!important;min-height:0!important;min-width:34px}#mz .mzttrow .mzttctl .mzseg{padding:2px}#mz .mztt{max-width:calc(100% - 90px)}}#mz .mztt{height:100%;width:auto;max-width:calc(100% - 34px);aspect-ratio:1;touch-action:none;cursor:grab}
#mz .mzpitch{writing-mode:vertical-lr;direction:rtl;width:22px;height:140px;accent-color:var(--amb)}
#mz #mz-rpm button{min-width:44px}
.mzghost{position:fixed;z-index:2147483600;pointer-events:none;padding:6px 9px;border-radius:3px;background:var(--amb);color:#1a1006;font:700 11px/1 "DM Mono",monospace}
/* 13 nov. 2026 (décision de Mauk Tenieb : pas de façade TR-808) : le rack devient l'écran d'un séquenceur des années 1980 (Fairlight CMI, Page R) — verre noir bombé, phosphore vert, trame ; chaque voix garde la couleur de son Mask sur une étiquette Dymo en relief */
#mz .mzrack{background:radial-gradient(ellipse at 50% 45%,#07160b 0%,#020804 70%,#010402 100%)!important;border:10px solid #2a2724;border-radius:14px/18px;box-shadow:inset 0 0 40px rgba(0,0,0,.9),inset 0 0 2px rgba(120,255,150,.25),0 2px 0 #3a3632,0 6px 14px rgba(0,0,0,.6)!important;position:relative}
#mz .mzrack::after{content:"";position:sticky;display:block;pointer-events:none;left:0;bottom:0;height:0}
#mz .mzrack{background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 1px,transparent 1px 3px),radial-gradient(ellipse at 50% 45%,#07160b 0%,#020804 70%,#010402 100%)!important}
#mz .mzs{background:transparent!important;box-shadow:inset 0 0 0 1px rgba(110,255,140,.16)!important;border-radius:1px!important}
#mz .mzs.b{box-shadow:inset 0 0 0 1px rgba(110,255,140,.28)!important}
#mz .mzs.on{background:#7dff95!important;box-shadow:0 0 4px rgba(125,255,149,.65),inset 0 0 0 1px #c9ffd3!important}
#mz .mzs.cur{outline:0!important;box-shadow:inset 0 0 0 1px #c9ffd3,0 0 3px rgba(201,255,211,.5)!important}
#mz .mzs.on.cur{background:#e4ffe9!important}
#mz .mznm{height:17px!important;min-height:0!important;max-height:17px!important;align-self:center;font-size:11px!important;background:var(--c)!important;color:#fff!important;border-radius:2px!important;font-weight:700!important;letter-spacing:.12em!important;text-transform:uppercase;text-shadow:0 -1px 0 rgba(0,0,0,.45),0 1px 0 rgba(255,255,255,.25)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -1px 0 rgba(0,0,0,.35),0 1px 1px rgba(0,0,0,.6)!important;filter:saturate(.75) brightness(.8)}
#mz .mznm i{display:none}
#mz .mzrow.sel .mznm{filter:none;outline:1px solid #7dff95;outline-offset:1px}
#mz .mzled{background:radial-gradient(circle at 35% 35%,#d7ffdf,#3fd65a 55%,#145a22)!important}
#mz .mzadd{border-color:rgba(110,255,140,.35)!important;color:#7dff95!important}
@media (max-width:760px),(orientation:portrait){#mz{grid-template-rows:auto auto auto;overflow:auto}#mz .mzmain{grid-template-columns:1fr;min-height:auto}#mz .mzdeck,#mz .mzbar{min-height:auto}#mz .mzrack{height:42vh;max-height:none}#mz .mzside{flex-direction:row}#mz .mzscrbox{flex:1.6}#mz .mzttbox{flex:1}#mz .mzdeck{grid-template-columns:1fr}#mz .mznm{width:44px;padding:0;justify-content:center}#mz .mznm span{display:none}#mz .mznm i{width:14px;height:14px;border-radius:3px}#mz .mzrow{height:42px;margin-bottom:4px}#mz .mzs{height:40px;flex:1 0 30px}#mz .mzs.g{margin-left:0}#mz .mzbar{gap:4px;padding:5px}#mz .mzbar .mzbt{min-width:40px}#mz #mz-tk .mzkn{width:40px}#mz #mz-tk .mzkn svg{width:34px;height:34px}#mz .mztt{width:min(40vw,260px);height:auto}#mz .mzside{flex-direction:row;align-items:center}#mz .mzscrbox{flex:1.4;min-width:0}#mz .mzttbox{flex:1;min-width:0}}
.mznm span{color:var(--ti,#fff)!important;text-shadow:none!important}#mz .mznm span,#mz .mzlb span{overflow:hidden;text-overflow:clip}#mz .mzbar :is(button,.mzbt){min-width:32px;min-height:32px}@media (max-width:700px),(orientation:portrait){#mz .mzbar :is(button,.mzbt){min-width:40px;min-height:40px}#mz .mzs{min-height:36px}#mz .mzled{position:relative}#mz .mzled::after{content:"";position:absolute;inset:-10px}}#mz .mzscr:empty,#mz-scr{background:#050505 repeating-linear-gradient(0deg,rgba(80,255,120,.05) 0 1px,transparent 1px 3px)}@keyframes mztp{0%,15%{transform:translateX(0)}85%,100%{transform:translateX(var(--dx))}}#mz .tp{display:inline-block;animation:mztp var(--tt,5s) ease-in-out infinite alternate}#mz #mz-pg{display:none;align-items:center}#mz #mz-pg button{min-width:40px}#mz .mzpgl{min-width:42px;text-align:center;color:var(--ink);font-size:11px}
@media (orientation:landscape) and (max-height:520px){#mz{overflow:auto;grid-template-rows:auto auto auto}#mz .mzrack{max-height:70vh}}
/* 15 nov. 2026 (RELAIS § 29) : la Console. En haut, le bac des figurines (portraits détourés, à leur stature) ; en bas, la console épaisse en bakélite, ses emplacements creusés, une diode par emplacement ; la diode du moment joué s'allume ; tous les quatre emplacements, un repère de temps */
#mz .mzmain>.mzrack,#mz .mzmain>.mzstage{grid-column:1;grid-row:1}
#mz .mzstage{position:relative;display:flex;flex-direction:column;overflow:hidden;min-height:0;border-radius:6px;background:radial-gradient(ellipse 80% 60% at 50% 0%,#2a2119,#0b0908 70%);box-shadow:inset 0 0 0 1px #000;--hr:120px;--cols:8;--rowh:80px;--fh:60px;--rh:100px;contain:layout paint}
#mz .mzstage[hidden]{display:none}
#mz .mzres{flex:none;height:var(--hr);display:flex;align-items:flex-end;gap:2px;padding:0 8px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;touch-action:pan-x;background:linear-gradient(transparent 70%,rgba(0,0,0,.55));overscroll-behavior-x:contain}
#mz .mzres::-webkit-scrollbar{display:none}
#mz .mzstage button.mzfig,#mz .mzstage button.mzslot{min-width:0;min-height:0}
#mz .mzfig{flex:none;height:var(--rh);aspect-ratio:233/260;padding:0;border:0;background:none;cursor:grab;display:flex;align-items:flex-end;justify-content:center;-webkit-tap-highlight-color:transparent;transition:filter .25s ease,transform .25s ease}
#mz .mzfig img{display:block;height:calc(100% * var(--k));width:auto;max-width:none;object-fit:contain;pointer-events:none;-webkit-user-drag:none;user-select:none}
#mz .mzfig.in{filter:brightness(.62) saturate(.7)}
#mz .mzfig.pick{transform:translateY(-6%);filter:drop-shadow(0 0 6px #ffa726) brightness(1.08)}
#mz .mzfig:focus-visible,#mz .mzslot:focus-visible{outline:2px solid var(--amb,#ffa726);outline-offset:2px}
#mz .mzconw{flex:1;min-height:0;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:0 8px 12px}
#mz .mzcon{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));grid-auto-rows:var(--rowh)}
#mz .mzslot{position:relative;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:none}
#mz .mzslot::before{content:"";position:absolute;left:0;right:0;bottom:6%;height:40%;background:linear-gradient(180deg,#6a5240 0%,#46352a 10%,#2e221a 16%,#241a13 60%,#170f0a 100%);box-shadow:inset 0 1px 0 rgba(255,232,200,.25),0 7px 0 #100a06,0 9px 0 #050302,0 13px 10px rgba(0,0,0,.55)}
#mz .mzslot:nth-child(4n+1)::after{content:"";position:absolute;left:0;bottom:12%;height:28%;width:1px;background:rgba(255,232,200,.16);z-index:1}
#mz .mzslot:first-child::after{display:none}
#mz .mzhole{position:absolute;left:14%;right:14%;bottom:24%;height:13%;border-radius:50%;background:radial-gradient(ellipse at 50% 30%,#000 40%,#1a110b);box-shadow:inset 0 3px 4px #000,0 1px 0 rgba(255,232,200,.22);z-index:1}
#mz .mzslot img{position:absolute;left:50%;bottom:28%;transform:translateX(-50%);z-index:2;height:calc(var(--fh) * var(--k));width:auto;max-width:none;filter:drop-shadow(0 3px 2px rgba(0,0,0,.75));clip-path:inset(0 0 3% 0)}
#mz .mzdi{position:absolute;bottom:12%;left:50%;width:7px;height:7px;margin-left:-3.5px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#5a1d16,#2a0c09);box-shadow:inset 0 0 0 1px #000;z-index:2}
#mz .mzslot.hd .mzdi{background:radial-gradient(circle at 35% 35%,#ffd1a8,#ff3b1f 55%,#8c1407);box-shadow:0 0 8px 2px rgba(255,70,30,.75)}
#mz .mzslot.over .mzhole{box-shadow:inset 0 3px 4px #000,0 0 0 2px #ffa726}
#mz .mzstage.arm .mzslot:not(.full) .mzhole{box-shadow:inset 0 3px 4px #000,0 0 0 1px rgba(255,167,38,.75)}
#mz .mzns{display:flex}#mz .mzrack .mzrow{height:var(--mzrh,42px)!important;margin-bottom:2px!important}#mz .mzrack .mzfh{width:calc(var(--mzrh,42px) - 2px)!important;height:calc(var(--mzrh,42px) - 2px)!important}#mz .mzrack .mzs{height:calc(var(--mzrh,42px) - 4px)!important;min-height:0!important}#mz .mzrack .mzadd{height:var(--mzrh,42px)!important;min-height:0!important}#mz:not([data-v="stage"]) #mz-ns{display:none}@media (orientation:landscape) and (max-height:520px){#mz[data-v="stage"] :is(#mz-len,#mz-pg,#mz-chain){display:none!important}#mz[data-v="stage"] .mzmain{grid-template-columns:minmax(0,1fr)}#mz[data-v="stage"] .mzmain>.mzside{display:none}}
#mz .mzns button{min-width:40px}
#mz .mzres .mzfig{margin-right:calc(var(--rh) * -.24)}
.mzfgh{position:fixed;left:0;top:0;z-index:2147483000;pointer-events:none;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 8px 10px rgba(0,0,0,.8)) brightness(1.08)}
/* 15 nov. 2026 (RELAIS § 29) : la vue Platine. Le vrai 33 tours prend la place de la grille, grand au doigt ; l'écran garde l'image scratchée à côté (au-dessus, en portrait) */
#mz[data-v="tt"] .mzmain>.mzside{grid-column:1/-1;grid-row:1;flex-direction:row;align-items:stretch}
#mz[data-v="tt"] .mzscrbox{flex:1 1 0;min-width:0;overflow:hidden}
#mz[data-v="tt"] .mzscr{object-fit:contain}
#mz[data-v="tt"] .mzttbox{flex:1.2 1 0;min-width:0;display:flex;flex-direction:column}
#mz[data-v="tt"] .mzttrow{display:flex;align-items:center;justify-content:center;gap:8px;flex:1;min-height:0}
#mz[data-v="tt"] .mztt{width:min(100%,58vh);height:auto;aspect-ratio:1}
#mz[data-v="tt"] :is(#mz-pat,#mz-chain,#mz-len,#mz-pg,#mz-dice,#mz-clr){display:none!important}
#mz[data-v="tt"] .mzttrow{width:100%}
#mz[data-v="tt"]:not(.vid) .mzscrbox{display:none}
@media (max-width:760px),(orientation:portrait){#mz[data-v="tt"] .mzmain>.mzside{flex-direction:column}#mz[data-v="tt"] .mzscrbox{flex:none}#mz[data-v="tt"] .mzscr{width:100%;height:min(18vh,40vw);aspect-ratio:auto;object-fit:contain}#mz[data-v="tt"] .mzttbox{flex:1 1 auto}#mz[data-v="tt"] .mztt{width:min(calc(100% - 34px),56vh)}#mz[data-v="tt"] .mzpitch{height:min(60vw,40vh)}}
#mz .mzfh{flex:none;width:24px;height:24px;border-radius:3px;object-fit:cover;object-position:50% 0;background:#0b0908;box-shadow:inset 0 0 0 1px #000,0 0 0 1px rgba(125,255,149,.25);cursor:pointer}
#mz #mz-src svg{width:16px;height:16px}#mz #mz-src button{display:grid;place-items:center;min-width:30px}#mz #mz-view button{display:grid;place-items:center;min-width:38px}#mz #mz-view svg{width:18px;height:18px}
@media (orientation:landscape) and (max-height:520px){#mz .mzmain{min-height:auto}#mz .mzmain>.mzstage,#mz .mzmain>.mzrack{height:70vh;align-self:start}}
@media (max-width:760px),(orientation:portrait){#mz .mzstage{height:46vh}#mz .mzrow.fh .mznm{display:none}#mz .mzfh{width:40px;height:40px}}

/* 15 nov. 2026, 22 h 40 (juge Impeccable C) : barre du haut et Console en tôle de rack comme les panneaux ; touches allumées par voyant et glyphe rétroéclairé, à la place des aplats moutarde ; étiquette de piste en ruban gaufré ; glissière de pitch à capuchon métal */
#mz .mzbar,#mz .mzstage{background:url(${base()}kave/a/mix/screw.webp) left 5px top 5px/11px 11px no-repeat,url(${base()}kave/a/mix/screw.webp) right 5px top 5px/11px 11px no-repeat,url(${base()}kave/a/mix/screw.webp) left 5px bottom 5px/11px 11px no-repeat,url(${base()}kave/a/mix/screw.webp) right 5px bottom 5px/11px 11px no-repeat,linear-gradient(rgba(10,8,6,.42),rgba(10,8,6,.42)),url(${base()}kave/a/mix/plate.webp) center/cover,#141210;border-radius:3px;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),inset 0 -1px 0 rgba(0,0,0,.6),0 0 0 1px #000,0 3px 8px rgba(0,0,0,.6)}
#mz .mzbar{padding:6px 22px}
#mz .mzrack{border-color:#100f0d!important;border-radius:4px!important}
#mz .mzseg button,#mz .mzfx button,#mz .mzbt{position:relative}
#mz .mzbt.on,#mz .mzseg button.on,#mz .mzfx button.on{background:linear-gradient(#2c251e,#15110d)!important;color:#ffc061!important;text-shadow:0 0 6px rgba(255,160,40,.85);box-shadow:inset 0 0 0 1px #000,inset 0 0 12px rgba(255,150,40,.22)!important}
#mz .mzbt.on>svg,#mz .mzseg button.on>svg,#mz .mzfx button.on>svg{filter:drop-shadow(0 0 4px rgba(255,160,40,.9))}
#mz .mzbt.on::after,#mz .mzseg button.on::after,#mz .mzfx button.on::after{content:"";position:absolute;top:3px;right:3px;width:4px;height:4px;border-radius:50%;background:#ffd08a;box-shadow:0 0 5px 1px #ff9f1c;pointer-events:none}
#mz #mz-play.on{background:linear-gradient(#d8443a,#a3241c)!important;color:#fff!important;text-shadow:none}#mz #mz-play.on::after{display:none}
#mz .mzbox h4 b{display:inline-block;padding:2px 7px;background:linear-gradient(#1b1b1b,#0b0b0b);color:#e9e4d8!important;font:700 11px/1.2 "DM Mono",monospace;letter-spacing:.14em;text-transform:uppercase;border-radius:2px;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 1px 2px #000}
#mz .mzpitch{-webkit-appearance:none;appearance:none;background:linear-gradient(90deg,transparent 9px,#0c0a08 9px,#0c0a08 13px,transparent 13px)}
#mz .mzpitch::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:30px;border:0;background:url(${base()}kave/a/mix/cap-v.webp) center/100% 100% no-repeat;filter:drop-shadow(0 2px 2px rgba(0,0,0,.7))}
#mz .mzpitch::-moz-range-thumb{width:22px;height:30px;border:0;border-radius:0;background:url(${base()}kave/a/mix/cap-v.webp) center/100% 100% no-repeat}
#mz .mztt{filter:drop-shadow(0 4px 6px rgba(0,0,0,.75))}
#mz .mzlib{-webkit-mask-image:linear-gradient(#000 calc(100% - 18px),transparent);mask-image:linear-gradient(#000 calc(100% - 18px),transparent)}

/* 15 nov. 2026, 22 h 17 (« regarde tout ce qui ne va pas ») : téléphone debout — les huit pas de la page tiennent dans la largeur ; la platine tient dans l'écran, ses touches passent dessous ; barre du haut resserrée */
@media (max-width:760px),(orientation:portrait){#mz .mzrow{min-width:0}#mz .mzs{flex:1 1 0!important;min-width:0}#mz .mzttrow{flex-wrap:wrap}#mz .mzttrow .mzttctl{flex:1 1 100%}#mz .mztt{height:auto!important;width:min(calc(100% - 44px),56vh)!important;max-width:none}#mz .mzbar{padding:6px 12px}}
/* téléphone couché : barre du haut sur une seule rangée, platine à la hauteur de l'écran */
@media (orientation:landscape) and (max-height:500px){#mz .mzbar{flex-wrap:nowrap;gap:3px;padding:4px 10px}#mz .mzbar .mzbt,#mz .mzbar .mzseg button{min-width:30px!important;height:32px;padding:0 4px}#mz .mzbar .mzsp{display:none}#mz #mz-tk .mzkn{width:34px}#mz #mz-tk .mzkn svg{width:30px;height:30px}#mz #mz-tk .mzkn small{display:none}#mz[data-v="tt"] .mztt{height:auto!important;width:auto!important;max-height:calc(100vh - 230px);max-width:100%}#mz .mzdeck{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}#mz .mzlibbox{grid-column:1/-1}}

/* 15 nov. 2026, 23 h 04 (Mauk Tenieb) : plus de voyants verts à côté des personnages ; chaque ligne de pas prend la couleur de son personnage ; une piste coupée s'éteint */
#mz .mzled{display:none!important}
#mz .mzs{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 32%,transparent)!important}
#mz .mzs.on{background:var(--c)!important;box-shadow:0 0 5px color-mix(in srgb,var(--c) 70%,transparent),inset 0 0 0 1px rgba(255,255,255,.28)!important}
#mz .mzs.cur{box-shadow:inset 0 0 0 1px rgba(255,255,255,.75)!important}
#mz .mzs.on.cur{background:color-mix(in srgb,var(--c) 55%,#fff)!important}
#mz .mzrow.mute .mzs.on{background:color-mix(in srgb,var(--c) 22%,#000)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 30%,transparent)!important}#mz .mzrow.mute .mzfc{opacity:.35;filter:grayscale(1)}

/* 15 nov. 2026, 23 h 10 (juge Impeccable D) */
#mz .mzrack{padding-top:6px!important}
#mz #mz-src{display:inline-flex;width:auto;align-self:flex-start}
#mz .mzfx{display:grid!important;grid-template-columns:repeat(13,minmax(0,1fr));gap:3px}#mz .mzfx button{width:auto!important}
#mz .mzkns{display:grid!important;grid-template-columns:repeat(var(--kn,9),minmax(0,1fr));gap:4px 2px}#mz #mz-mst .mzkns{--kn:5}#mz .mzkn{width:auto}
@media (max-width:760px),(orientation:portrait),(pointer:coarse){#mz .mzfx{grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}#mz .mzbox{padding-left:12px;padding-right:12px}#mz .mzkn svg{width:min(44px,100%);height:auto;aspect-ratio:1}}
#mz .mzlib{max-height:100px!important;scroll-snap-type:y mandatory;-webkit-mask-image:none;mask-image:none}#mz .mzlib>*{scroll-snap-align:start}
#mz .mzres{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 46px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 46px),transparent)}
#mz .mzfig.in{filter:brightness(.45) saturate(.4)!important}
@keyframes mzpop{0%{transform:translateY(-55%) scale(1.6);opacity:.2}100%{transform:none;opacity:1}}#mz .mzslot.pop canvas{animation:mzpop .28s cubic-bezier(.2,.8,.2,1) both;transform-origin:50% 100%}
#mz #mz-strip h4 b canvas.mzfc{position:static;display:inline-block;width:34px;height:24px;vertical-align:middle}
#mz .mzconw{overflow-x:auto;overflow-y:hidden;scrollbar-width:none}#mz .mzconw::-webkit-scrollbar{display:none}#mz .mzcon>.mzslot{flex:0 0 var(--sw)!important}
`;
/* 15 nov. 2026, 22 h 01 : molettes photographiées (bouton cannelé tiré du rack de Mauk Tenieb, 21 h 09), étiquettes gravées en pictogrammes ; le nom reste pour les lecteurs d'écran et l'infobulle */
var KP=(function(){var S='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="',E='" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';return{
 VOL:S+'M4 9h4l5-4v14l-5-4H4zM16 9c1.5 1.7 1.5 4.3 0 6M19 6.5c3 3 3 8 0 11'+E,PAN:S+'M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4'+E,TUNE:S+'M9 18V5l10-2v13M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z'+E,
 CUT:S+'M2 8h11c3 0 4 3 5 6l3 6'+E,RES:S+'M2 15h8c2 0 2.5-10 4-10s2 10 4 10h4'+E,DRIVE:S+'M2 12l3-6h5l4 12h5l3-6'+E,
 ECHO:S+'M4 18V6M10 18V9M15 18v-6M19 18v-3'+E,VERB:S+'M5 19a7 7 0 0 1 0-14M9 16a4 4 0 0 1 0-8M13 13a1 1 0 0 1 0-2M15 4l5 4M15 20l5-4'+E,
 FX:S+'M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19'+E,TIME:S+'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2'+E,
 FDBK:S+'M17 3l3 3-3 3M20 6H9a5 5 0 0 0 0 10h1M7 21l-3-3 3-3M4 18h11a5 5 0 0 0 0-10h-1'+E,SIZE:S+'M9 9h6v6H9zM3 3l4 4M3 3h3M3 3v3M21 3l-4 4M21 3h-3M21 3v3M3 21l4-4M3 21h3M3 21v-3M21 21l-4-4M21 21h-3M21 21v-3'+E,
 TEMPO:S+'M8 21h8l-3-17h-2zM12 14l6-8M7 21h10'+E,SWING:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="12" r="4" fill="currentColor"/><circle cx="18" cy="12" r="2" fill="currentColor"/></svg>'}})();
function knob(lbl,get,set,def,col){var k=el('div','mzkn');k.innerHTML='<svg viewBox="0 0 40 40"></svg><small>'+(KP[lbl]||lbl)+'</small>';k.title=lbl;var sv=k.firstChild;
  function draw(){var v=get(),a=-135+v*270,ticks='';for(var i=0;i<=10;i++){var t=(-135+i*27)*Math.PI/180;ticks+='<line x1="'+(20+Math.sin(t)*17)+'" y1="'+(20-Math.cos(t)*17)+'" x2="'+(20+Math.sin(t)*19)+'" y2="'+(20-Math.cos(t)*19)+'" stroke="#8d8577" stroke-width="1"/>'}
    var r=a*Math.PI/180;sv.innerHTML=ticks+'<circle cx="20" cy="22" r="14.5" fill="#000" opacity=".55"/><image href="'+base()+'kave/a/mix/knob.webp" x="5" y="5" width="30" height="30"/>'+
      /* la photo reste fixe sous sa lumière ; seul le repère gravé tourne */'<line x1="'+(20+Math.sin(r)*4.5).toFixed(2)+'" y1="'+(20.6-Math.cos(r)*4.5).toFixed(2)+'" x2="'+(20+Math.sin(r)*10.5).toFixed(2)+'" y2="'+(20.6-Math.cos(r)*10.5).toFixed(2)+'" stroke="#000" stroke-width="2.6" stroke-linecap="round" opacity=".7"/><line x1="'+(20+Math.sin(r)*4.5).toFixed(2)+'" y1="'+(20-Math.cos(r)*4.5).toFixed(2)+'" x2="'+(20+Math.sin(r)*10.5).toFixed(2)+'" y2="'+(20-Math.cos(r)*10.5).toFixed(2)+'" stroke="#e9dcc0" stroke-width="1.5" stroke-linecap="round"/>'+
      '<circle cx="'+(20+Math.sin(r)*18).toFixed(2)+'" cy="'+(20-Math.cos(r)*18).toFixed(2)+'" r="1.7" fill="'+(col||'#ffa726')+'"/>'}
  draw();var y0=0,v0=0;k.addEventListener('pointerdown',function(e){e.preventDefault();k.setPointerCapture(e.pointerId);y0=e.clientY;v0=get()});
  k.addEventListener('pointermove',function(e){if(!k.hasPointerCapture(e.pointerId))return;set(Math.max(0,Math.min(1,v0+(y0-e.clientY)/(e.shiftKey?600:160))));draw()});
  k.addEventListener('wheel',function(e){e.preventDefault();set(Math.max(0,Math.min(1,get()-Math.sign(e.deltaY)*.03)));draw()},{passive:false});
  k.addEventListener('dblclick',function(){set(def);draw()});k.setAttribute('role','slider');k.setAttribute('aria-label',lbl);k.__draw=draw;return k}

var ROOT=null;
function mount(){var p=document.getElementById('bb-panel');if(!p)return false;if(ROOT&&p.contains(ROOT))return true;
  if(!document.getElementById('mz-css')){var st=el('style');st.id='mz-css';st.textContent=CSS;document.head.appendChild(st)}
  if(!S.ch.length){seed();buildLib();defSrc()}
  ROOT=el('div');ROOT.id='mz';ROOT.innerHTML='<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="mzk" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#5a5148"/><stop offset=".6" stop-color="#2a241f"/><stop offset="1" stop-color="#0d0b09"/></radialGradient></defs></svg>'+
   '<div class="mzbar"><button class="mzbt" id="mz-play" type="button"></button><div class="mzseg" id="mz-view"></div><button class="mzbt" id="mz-dice" type="button"></button><button class="mzbt" id="mz-clr" type="button"></button><button class="mzbt" id="mz-rst" type="button"></button>'+
   '<div class="mzseg" id="mz-pat"></div><button class="mzbt" id="mz-chain" type="button"></button><div class="mzseg" id="mz-len"></div><div class="mzseg" id="mz-pg"></div><span class="mzlcd" id="mz-bpm"></span><span id="mz-tk"></span><span class="mzsp"></span>'+
   '<button class="mzbt" id="mz-file" type="button"></button><button class="mzbt" id="mz-kave" type="button"></button></div>'+
   '<div class="mzmain"><div class="mzrack" id="mz-rack"></div><div class="mzstage" id="mz-stg" hidden></div><div class="mzside"><div class="mzbox mzscrbox"><h4 id="mz-scrh" aria-label="'+(FR?'\u00c9cran':'Screen')+'"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 20h6M12 16v4" stroke="currentColor" stroke-width="2"/></svg></h4><canvas class="mzscr" id="mz-scr" width="640" height="360"></canvas></div><div class="mzbox mzttbox" id="mz-ttb"><h4 id="mz-tth" aria-label="'+(FR?'Platine':'Turntable')+'" title="'+(FR?'Platine':'Turntable')+'"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="11" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="11" cy="12" r="2" fill="currentColor"/><path d="M21 3v9l-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></h4><div class="mzttrow"><canvas class="mztt" id="mz-tt" width="720" height="720"></canvas><input type="range" class="mzpitch" id="mz-pitch" min="-8" max="8" step="0.1" value="0"></div><div class="mzttctl" style="display:flex;gap:6px;align-items:center;justify-content:center"><div class="mzseg" id="mz-rpm"><button type="button" class="on">33</button><button type="button">45</button><button type="button" id="mz-rev" aria-pressed="false"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.4-5.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" transform="matrix(-1 0 0 1 24 0)"/><path d="M4 3v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><button type="button" class="mzmixgo" id="mz-mixgo" aria-label="Mix" title="Mix"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="7" cy="12" r="1.2" fill="currentColor"/><circle cx="17" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="12" r="1.2" fill="currentColor"/></svg></button></div></div></div></div>'+
   '<div class="mzdeck"><div class="mzbox" id="mz-strip"></div><div class="mzbox" id="mz-mst"></div><div class="mzbox mzlibbox"><div class="mzlibh"><div class="mzseg" id="mz-kind"></div></div><div class="mzlib" id="mz-lib"></div></div></div>';
  /* 15 nov. 2026, 22 h 01 : 33, 45, envers et mix en colonne à droite de la platine ; le plateau prend toute la hauteur de sa case */var tr=$('.mzttrow',ROOT),tc=$('.mzttctl',ROOT);if(tr&&tc)tr.appendChild(tc);
  p.insertBefore(ROOT,p.querySelector('.kb-foot'));p.classList.add('mz-on');
  var L=FR?{play:'Lecture',dice:'Tirer un motif',clr:'Vider le motif',chain:'Enchaîner A B C D',file:'Charger un son du disque',kave:'Kave : rendre en WAV',add:'Glisser un son ici',tempo:'TEMPO',swing:'SWING'}:{play:'Play',dice:'Roll a pattern',clr:'Clear the pattern',chain:'Chain A B C D',file:'Load a sound from disk',kave:'Kave: render to WAV',add:'Drop a sound here',tempo:'TEMPO',swing:'SWING'};S.L=L;
  [['mz-play','play'],['mz-dice','dice'],['mz-clr','clear'],['mz-chain','chain'],['mz-file','open'],['mz-kave','kave']].forEach(function(a){var b=$('#'+a[0],ROOT);b.innerHTML=IC[a[1]];var k=a[0].slice(3);b.setAttribute('aria-label',L[k]||k);b.title=L[k]||k});
  $('#mz-play',ROOT).onclick=function(){play(!S.play)};$('#mz-dice',ROOT).onclick=function(){dice(S.pat);rack()};
  $('#mz-clr',ROOT).onclick=function(){S.ch.forEach(function(c){c.steps[S.pat].fill(0)});rack()};
  $('#mz-chain',ROOT).onclick=function(){S.chain=!S.chain;this.classList.toggle('on',S.chain)};
  $('#mz-file',ROOT).onclick=function(){var i=el('input');i.type='file';i.accept='audio/*,image/*,video/*';i.onchange=function(){if(i.files[0])fileInto(null,i.files[0])};i.click()};
  $('#mz-kave',ROOT).onclick=kave;var rb=$('#mz-rst',ROOT);rb.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 3v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';rb.setAttribute('aria-label',FR?'Tout remettre \u00e0 z\u00e9ro':'Reset all');rb.title=rb.getAttribute('aria-label');rb.onclick=resetAll;
  /* 15 nov. 2026, 22 h 52 : quitter l'écran Musik (autre point de la borne, autre lieu) coupe la lecture, la platine et le poste de mix */if(!window.__mzLeave)window.__mzLeave=setInterval(function(){if(!ROOT)return;var d=document.querySelector('.b-dots .b-dot.on'),away=!ROOT.isConnected||!ROOT.getClientRects().length||(d&&d.title!=='MUSIK');if(!away)return;if(S.play)play(false);if(TT.motor||TT.src)ttStop();var mb=ROOT.querySelector('.mzmix .mxback');if(mb)mb.click()},400);
  var vw=$('#mz-view',ROOT),VL=FR?{grid:'Grille',stage:'Console',tt:'Platine'}:{grid:'Grid',stage:'Console',tt:'Turntable'};['grid','stage','tt'].forEach(function(k){var b=el('button',null,IC[k==='tt'?'disc':k]);b.type='button';b.dataset.v=k;b.setAttribute('aria-label',VL[k]);b.title=VL[k];b.onclick=function(){view(k)};vw.appendChild(b)});
  var pt=$('#mz-pat',ROOT);'ABCD'.split('').forEach(function(x,i){var b=el('button',null,x);b.type='button';b.onclick=function(){S.pat=i;paintPat();rack()};pt.appendChild(b)});
  var ln=$('#mz-len',ROOT);LENS.forEach(function(n){var b=el('button',null,String(n));b.type='button';b.onclick=function(){S.n=n;if(S.step>=n)S.step=0;paintLen();rack();if(STG.con)conSize(n)};ln.appendChild(b)});
  var pgb=$('#mz-pg',ROOT);[-1,1].forEach(function(d){var b=el('button',null,'<svg viewBox="0 0 24 24" width="18" height="18"><path d="'+(d<0?'M15 5 8 12l7 7':'M9 5l7 7-7 7')+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');b.type='button';b.setAttribute('aria-label',d<0?'\u2190':'\u2192');b.onclick=function(){S.page=Math.max(0,Math.min(Math.ceil(S.n/8)-1,(S.page||0)+d));rack()};pgb.appendChild(b)});var pgl=el('span','mzpgl');pgb.insertBefore(pgl,pgb.lastChild);
  var tk=$('#mz-tk',ROOT);tk.style.display='flex';tk.style.gap='4px';
  tk.appendChild(knob(L.tempo,function(){return (S.bpm-60)/120},function(v){S.bpm=Math.round(60+v*120);/* GROSS et REVS suivent le tempo */if(AC&&AC.__mz)S.ch.forEach(function(ch){if(ch.fx)fxAmt(AC.__mz,ch)});$('#mz-bpm',ROOT).textContent=S.bpm},(96-60)/120));
  tk.appendChild(knob(L.swing,function(){return S.swing},function(v){S.swing=v},0));
  var KI={son:'<svg viewBox="0 0 24 24"><path d="M3 12h2l2-6 3 12 3-15 3 15 2-6h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>',img:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4.5 17 5-5.5 3.5 3.5 2.5-2.5 4 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',vid:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>'},KL=FR?{son:'Sons',img:'Images',vid:'Vid\u00e9os'}:{son:'Sounds',img:'Images',vid:'Videos'};
  var kd=$('#mz-kind',ROOT);['son','img','vid'].forEach(function(k){var b=el('button',null,KI[k]);b.type='button';b.dataset.k=k;b.setAttribute('aria-label',KL[k]);b.title=KL[k];b.onclick=function(){S.kind=k;[].forEach.call(kd.children,function(x){x.classList.toggle('on',x===b)});libDraw()};if(k===(S.kind||'son'))b.classList.add('on');kd.appendChild(b)});
  VIS.cv=$('#mz-scr',ROOT);vdraw();
  $('#mz-bpm',ROOT).textContent=S.bpm;play(S.play);paintPat();paintLen();rack();strips();libDraw();ttInit();stageInit();view(S.view);
  if(!ROOT.__ro){ROOT.__ro=1;ROOT.addEventListener('dragover',function(e){e.preventDefault()});ROOT.addEventListener('drop',function(e){e.preventDefault();var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(!f||!/^(audio|image|video)\//.test(f.type))return;var r=e.target.closest&&e.target.closest('.mzrow');fileInto(r?S.ch[+r.dataset.i]:null,f)})}
  return true}
function paintPat(){if(!ROOT)return;[].forEach.call($('#mz-pat',ROOT).children,function(b,i){b.classList.toggle('on',i===S.pat)})}
function paintLen(){if(!ROOT)return;[].forEach.call($('#mz-len',ROOT).children,function(b){b.classList.toggle('on',+b.textContent===S.n)})}
function narrow(){return matchMedia('(max-width:760px)').matches}
function rack(){if(!ROOT)return;var pg=$('#mz-pg',ROOT);if(pg)pg.style.display=narrow()?'flex':'none';var s0=narrow()?Math.min(S.page||0,Math.ceil(S.n/8)-1)*8:0,s1=narrow()?Math.min(S.n,s0+8):S.n,R=$('#mz-rack',ROOT),sc=R.scrollTop,sl=R.scrollLeft,h='';
  S.ch.forEach(function(c,i){h+='<div class="mzrow'+(i===S.sel?' sel':'')+(c.mute?' mute':'')+'" data-i="'+i+'" style="--c:'+c.color+';--ti:'+tink(c.color)+'"><button type="button" class="mzled'+(c.mute?' off':'')+'" data-m="'+i+'" aria-label="mute"></button>'+(c.mask?'<button type="button" class="mznm mzfg" data-n="'+i+'" aria-label="'+String(c.name).replace(/"/g,'&quot;')+'"><canvas class="mzfc bust" data-mask="'+c.mask+'"></canvas></button>':'<button type="button" class="mznm'+(c.kind!=='syn'?' '+c.kind:'')+'" data-n="'+i+'"><i></i><span>'+String(c.name).replace(/</g,'&lt;')+'</span></button>')+'<div class="mzstp">';
    for(var s=s0;s<s1;s++)h+='<div class="mzs'+((s>>2)%2?' b':'')+(s%16===0&&s>s0?' g':'')+(c.steps[S.pat][s]?' on':'')+'" data-s="'+s+'"></div>';h+='</div></div>'});
  h+='<button type="button" class="mzadd" id="mz-add" aria-label="'+S.L.add+'" title="'+S.L.add+'">'+IC.add+'</button>';R.innerHTML=h;R.scrollTop=sc;R.scrollLeft=sl;FIG.lastAll=0;if(S.ch.some(function(c){return c.mask})){figCss();figLoad().then(figRun)}/* 15 nov. 2026, 10 h 17 (Mauk Tenieb : « y'a que deux pistes ») : les 18 pistes tiennent dans la grille, hauteur de rangée calculée sur la place disponible (18 à 42 px), sans défilement à l'arrivée *//* 15 nov. 2026 : la place d'une rangée de plus en tête, pour la tête de la première figurine ; rangées de 11 px au moins sur ordinateur, 34 px au doigt, la figurine fait deux rangées de haut */var nr=S.ch.length+1,ih=R.clientHeight-14;if(ih>60)R.style.setProperty('--mzrh',Math.max(narrow()?34:11,Math.min(42,Math.floor(ih/nr)-2))+'px');var pl=$('.mzpgl',ROOT);if(pl)pl.textContent=(s0+1)+'-'+s1;
  if(!R.__ev){R.__ev=1;var paint=null;
    R.addEventListener('pointerdown',function(e){S.touchT=performance.now();var t=e.target,row=t.closest('.mzrow');
      if(t.closest('.mzled')){var c=S.ch[+t.closest('.mzled').dataset.m];c.mute=!c.mute;if(AC&&AC.__mz)apply(AC.__mz,c);rack();return}
      if(t.closest('.mznm,.mzfh')){/* deux touches rapides sur un personnage le coupent ou le rétablissent (les voyants verts ont disparu) */var ni=+t.closest('.mznm,.mzfh').dataset.n,nw=performance.now();if(R.__lt&&R.__lt.i===ni&&nw-R.__lt.t<450){var cm=S.ch[ni];cm.mute=!cm.mute;if(AC&&AC.__mz)apply(AC.__mz,cm);R.__lt=null;rack();return}R.__lt={i:ni,t:nw};S.sel=ni;var c2=S.ch[S.sel];rack();strips();if(c2.kind==='img'||c2.kind==='vid'){vshow(c2);if(c2.kind==='vid'){var vi=S.lib.filter(function(x){return x.id===c2.src})[0];if(vi)ttVid(vi)}}else if(c2.kind==='smp'&&c2.buf){TT.vid=null;audition(c2.buf);ttLoad({name:c2.name,buf:c2.buf})}else if(ac())hit(AC,c2,0,AC.currentTime+.01,S.pat);return}
      if(t.classList.contains('mzs')&&row){e.preventDefault();var ci=+row.dataset.i,si=+t.dataset.s,ch=S.ch[ci];paint=ch.steps[S.pat][si]?0:1;ch.steps[S.pat][si]=paint;t.classList.toggle('on',!!paint);
        if(paint&&ac())hit(AC,ch,si,AC.currentTime+.01,S.pat);R.setPointerCapture(e.pointerId);R.__ci=ci}});
    R.addEventListener('pointermove',function(e){if(paint===null)return;var t=document.elementFromPoint(e.clientX,e.clientY);if(!t||!t.classList||!t.classList.contains('mzs'))return;var row=t.closest('.mzrow');if(!row||+row.dataset.i!==R.__ci)return;
      var ch=S.ch[R.__ci],si=+t.dataset.s;if(ch.steps[S.pat][si]!==paint){ch.steps[S.pat][si]=paint;t.classList.toggle('on',!!paint)}});
    var end=function(){paint=null};R.addEventListener('pointerup',end);R.addEventListener('pointercancel',end);
    R.addEventListener('contextmenu',function(e){if(e.target.classList.contains('mzs'))e.preventDefault()})}}
/* changement de page au téléphone : les cases existantes reçoivent leurs nouveaux pas, sans reconstruire la grille ni les figurines (audit Ponytail) */
function rePage(){var R=$('#mz-rack',ROOT),s0=Math.min(S.page||0,Math.ceil(S.n/8)-1)*8,s1=Math.min(S.n,s0+8),rows=R.querySelectorAll('.mzrow');if(!rows.length||rows[0].querySelectorAll('.mzs').length!==s1-s0)return rack();
  [].forEach.call(rows,function(r){var c=S.ch[+r.dataset.i];if(!c)return;[].forEach.call(r.querySelectorAll('.mzs'),function(x,k){var st=s0+k;x.dataset.s=st;x.className='mzs'+((st>>2)%2?' b':'')+(c.steps[S.pat][st]?' on':'')})});var pl=$('.mzpgl',ROOT);if(pl)pl.textContent=(s0+1)+'-'+s1}
function cursor(st,p){if(!ROOT)return;var R=$('#mz-rack',ROOT);if(p!=null&&p!==S.pat)return;/* la page suit la tête de lecture, sauf pendant les quatre secondes qui suivent un doigt posé sur la grille : la page éditée reste sous le doigt */if(st>=0&&narrow()&&S.play&&Math.floor(st/8)!==(S.page||0)&&performance.now()-(S.touchT||0)>4000){S.page=Math.floor(st/8);rePage()}[].forEach.call(R.querySelectorAll('.mzs.cur'),function(x){x.classList.remove('cur')});if(st<0)return;[].forEach.call(R.querySelectorAll('.mzs[data-s="'+st+'"]'),function(x){x.classList.add('cur')})}
function strips(){if(!ROOT)return;var c=S.ch[S.sel]||S.ch[0];if(!c)return;var B=$('#mz-strip',ROOT);B.style.setProperty('--c',c.color);B.innerHTML='<h4 title="'+String(c.name).replace(/"/g,'&quot;')+'"><b>'+(c.mask?'<canvas class="mzfc bust" data-mask="'+c.mask+'"></canvas>':String(c.name).replace(/</g,'&lt;'))+'</b></h4>';if(c.mask){figCss();figLoad().then(figRun)}if(c.mask)B.appendChild(srcSeg(c));var K=el('div','mzkns');
  var up=function(){if(AC&&AC.__mz)apply(AC.__mz,c)};
  [['VOL','vol',.8],['PAN','pan',.5,function(v){c.pan=v*2-1},function(){return (c.pan+1)/2}],['TUNE','tune',.5,function(v){c.tune=Math.round(v*24-12)},function(){return (c.tune+12)/24}],['CUT','cut',1],['RES','res',0],['DRIVE','drv',0],['ECHO','echo',0],['VERB','verb',0],['FX','fxa',.5,function(v){c.fxa=v;if(AC&&AC.__mz)fxAmt(AC.__mz,c)},function(){return c.fxa==null?.5:c.fxa}]].forEach(function(a){
    var get=a[4]||function(){return c[a[1]]},set=a[3]||function(v){c[a[1]]=v};K.appendChild(knob(a[0],get,function(v){set(v);up()},a[2],c.color))});B.appendChild(fxRow(c));B.appendChild(K);
  var M=$('#mz-mst',ROOT);if(!M.__k){M.__k=1;M.innerHTML='<h4 aria-label="'+(FR?'Ma\u00eetre':'Master')+'" title="'+(FR?'Ma\u00eetre':'Master')+'"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 3v18M12 3v18M19 3v18" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="13" width="4" height="3" fill="currentColor"/><rect x="10" y="6" width="4" height="3" fill="currentColor"/><rect x="17" y="10" width="4" height="3" fill="currentColor"/></svg></h4>';var KS=el('div','mzseg mzkit');KITS.forEach(function(k,i){var b=el('button',null,k.l);b.type='button';b.title='Tribute to '+k.t;b.setAttribute('aria-label',b.title);b.classList.toggle('on',S.kit===i);b.onclick=function(){kitSet(i)};KS.appendChild(b)});M.appendChild(KS);var K2=el('div','mzkns'),mu=function(){if(AC&&AC.__mz)masterApply(AC.__mz)};
    [['TIME',function(){return (S.echoT-.06)/.94},function(v){S.echoT=.06+v*.94},.33],['FDBK',function(){return S.echoF/.9},function(v){S.echoF=v*.9},.42],['SIZE',function(){return S.verb},function(v){S.verb=v;verbLater()},.5],['DRIVE',function(){return S.drive},function(v){S.drive=v},0]].forEach(function(a){
      K2.appendChild(knob(a[0],a[1],function(v){a[2](v);mu()},a[3]))});var FW=el('div','mzfw'),FD=el('input','mzfad');FD.type='range';FD.min=0;FD.max=1;FD.step=.01;FD.value=S.master;FD.setAttribute('aria-label',FR?'Volume ma\u00eetre':'Master volume');FD.oninput=function(){S.master=+FD.value;mu()};FW.appendChild(FD);K2.appendChild(FW);M.appendChild(K2);var VU=el('div','mzvu');for(var q=0;q<12;q++)VU.appendChild(el('i'));M.appendChild(VU);vuLoop(VU)}}
function vuLoop(VU){var buf=new Float32Array(1024),L=VU.children;(function f(){if(!document.body.contains(VU))return;if(!ROOT||!ROOT.getClientRects().length){setTimeout(f,500);return}requestAnimationFrame(f);var g=AC&&AC.__mz;if(!g)return;if(!g.an){g.an=AC.createAnalyser();g.an.fftSize=1024;g.comp.connect(g.an)}g.an.getFloatTimeDomainData(buf);var m=0;for(var i=0;i<buf.length;i++)m+=buf[i]*buf[i];var db=20*Math.log10(Math.sqrt(m/buf.length)+1e-6),n=Math.round(Math.max(0,Math.min(12,(db+42)/3.4)));for(var j=0;j<12;j++)L[j].className=j<n?(j>=10?'r':j>=7?'a':'g'):''})()}
function libDraw(){if(!ROOT)return;var Lb=$('#mz-lib',ROOT),K=S.kind||'son';Lb.innerHTML='';S.lib.filter(function(it){return (it.kind||'son')===K}).forEach(function(it){var b=el('button','mzlb');b.type='button';/* 15 nov. 2026 (critique Impeccable, P2) : le nom trop long défile en téléprompteur (règle du 10 nov.) */var sp=el('span');sp.textContent=it.name;b.appendChild(sp);b.title=it.name;b.style.setProperty('--c',it.col);
  /* au doigt : un glissé immédiat fait défiler la bibliothèque ; un appui tenu un quart de seconde prend le son (audit Ponytail) */
  b.addEventListener('pointerdown',function(e){var touch=e.pointerType==='touch',armed=!touch,dead=false,ht=0,x0=e.clientX,y0=e.clientY,gh=null,over=null;if(!touch){e.preventDefault();b.setPointerCapture(e.pointerId)}else ht=setTimeout(function(){armed=true;try{b.setPointerCapture(e.pointerId)}catch(x){}},220);
    function tm(ev){if(armed)ev.preventDefault()}b.addEventListener('touchmove',tm,{passive:false});
    function mv(ev){if(dead)return;if(!armed){if(Math.hypot(ev.clientX-x0,ev.clientY-y0)>8){dead=true;clearTimeout(ht)}return}if(!gh&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>8){gh=el('div','mzghost',it.name);document.body.appendChild(gh)}if(!gh)return;gh.style.left=ev.clientX+8+'px';gh.style.top=ev.clientY+8+'px';
      var t=document.elementFromPoint(ev.clientX,ev.clientY),r=t&&t.closest?(t.closest('#mz .mzrow')||t.closest('#mz-add')||t.closest('#mz-tt')):null;if(over!==r){if(over)over.classList.remove('drop');over=r;if(r)r.classList.add('drop')}}
    function up(ev){clearTimeout(ht);b.removeEventListener('pointermove',mv);b.removeEventListener('pointerup',up);b.removeEventListener('pointercancel',up);b.removeEventListener('touchmove',tm);if(over)over.classList.remove('drop');
      if(dead||(ev&&ev.type==='pointercancel')){if(gh)gh.remove();return}
      if(!gh){if(it.kind==='vid'){ttVid(it);return}if(it.kind){media(it).then(function(m){vshow({media:m,kind:it.kind,vol:1,pan:0,tune:0,cut:1,res:0,drv:0,echo:0,verb:0})}).catch(function(){});return}load(it).then(function(bf){audition(bf);ttLoad(it)}).catch(function(){});return}gh.remove();if(!over)return;
      if(over.id==='mz-tt'){if(it.kind==='vid')ttVid(it);else if(!it.kind)load(it).then(function(){ttLoad(it)});return}
      if(over.id==='mz-add'){var ch=newCh({color:it.col});S.ch.push(ch);S.sel=S.ch.length-1;loadInto(ch,it);return}
      S.sel=+over.dataset.i;loadInto(S.ch[S.sel],it)}
    b.addEventListener('pointermove',mv);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up)});
  Lb.appendChild(b)})}

/* ---------- l'écran de montage : chaque pas allumé d'une rangée image ou vidéo coupe vers elle ; ses potards la travaillent (VOL opacité, PAN décalage, TUNE teinte, CUT netteté, RES contraste, DRIVE saturation, ECHO traînées, VERB halo) ---------- */
var VIS={layers:[],cv:null};
function vshow(ch){if(!ch.media)return;var now=performance.now();VIS.layers.forEach(function(l){if(!l.out)l.out=now});VIS.layers=VIS.layers.filter(function(l){return now-l.out<600&&l.ch!==ch});VIS.layers.push({ch:ch,t:now});
 if(ch.kind==='vid'&&!ch.tt){try{ch.media.currentTime=0;var pr=ch.media.play();if(pr&&pr.catch)pr.catch(function(){})}catch(e){}}}
function vdraw(){var cv=VIS.cv;if(!cv||!document.body.contains(cv))return;if(!ROOT||!ROOT.getClientRects().length){setTimeout(vdraw,500);return}requestAnimationFrame(vdraw);var g=cv.getContext('2d'),W=cv.width,H=cv.height,now=performance.now(),top=VIS.layers[VIS.layers.length-1],tr=top?top.ch.echo:0;
 g.globalCompositeOperation='source-over';g.filter='none';g.globalAlpha=1;g.fillStyle='rgba(8,7,6,'+(1-tr*.9)+')';g.fillRect(0,0,W,H);
 VIS.layers.forEach(function(l){var ch=l.ch,m=ch.media,mw=m.videoWidth||m.naturalWidth,mh=m.videoHeight||m.naturalHeight;if(!mw)return;var a=ch.mute?0:ch.vol;if(l.out)a*=Math.max(0,1-(now-l.out)/600);if(a<=.01)return;
  var k=Math.max(W/mw,H/mh)*(1+ch.verb*.08),w=mw*k,h=mh*k,x=(W-w)/2+ch.pan*W*.25,y=(H-h)/2;
  g.filter='blur('+((1-ch.cut)*10).toFixed(1)+'px) contrast('+(1+ch.res*1.6).toFixed(2)+') saturate('+(1+ch.drv*2.5).toFixed(2)+') hue-rotate('+(ch.tune*15)+'deg)';g.globalAlpha=a;g.drawImage(m,x,y,w,h);
  if(ch.verb>.02){g.filter='blur(14px) brightness(1.4)';g.globalCompositeOperation='screen';g.globalAlpha=a*ch.verb*.7;g.drawImage(m,x,y,w,h);g.globalCompositeOperation='source-over'}});
 g.filter='none';g.globalAlpha=1;if(!VIS.layers.length){g.fillStyle='rgba(120,255,150,.05)';for(var i=0;i<H;i+=3)g.fillRect(0,i,W,1);
   /* 15 nov. 2026, 22 h 01 : sans image, l'écran trace le son qui sort, en oscilloscope à phosphore vert */var G=AC&&AC.__mz;if(G&&G.an){var b=VIS.ob||(VIS.ob=new Float32Array(G.an.fftSize));G.an.getFloatTimeDomainData(b);var z=0;for(var q=1;q<b.length/2;q++)if(b[q-1]<=0&&b[q]>0){z=q;break}var n=b.length/2;
    g.strokeStyle='rgba(140,255,160,.95)';g.lineWidth=Math.max(1.5,H/140);g.shadowColor='rgba(80,255,120,.8)';g.shadowBlur=H/30;g.beginPath();for(var j=0;j<n;j++){var x=j/(n-1)*W,y=H/2-Math.max(-1,Math.min(1,b[z+j]*1.6))*H*.42;j?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.shadowBlur=0}else{g.strokeStyle='rgba(140,255,160,.45)';g.lineWidth=Math.max(1.2,H/180);g.shadowColor='rgba(80,255,120,.6)';g.shadowBlur=H/40;g.beginPath();g.moveTo(0,H/2);g.lineTo(W,H/2);g.stroke();g.shadowBlur=0}}}
/* ---------- la platine : le disque tourne à 33 tours ; le saisir, c'est scratcher ---------- */
function ttImg(u){var im=new Image();im.src=base()+u;return im}var TTI={deck:ttImg('a-tt-platine.webp'),disc:ttImg('a-tt-disque.webp'),arm:ttImg('a-tt-bras.webp')};
var TT={rpm:33,pitch:0,ang:0,pos:0,buf:null,rev:null,name:'',hold:false,src:null,t0:0,last:0,lastA:0,motor:false};
function ttLoad(it){if(!it||!it.buf)return;if(!it.vid){TT.vid=null;TT.vit=null;if(ROOT)ROOT.classList.remove('vid')}TT.buf=it.buf;TT.name=it.name;var c=ac();if(!c)return;var b=it.buf,r=c.createBuffer(b.numberOfChannels,b.length,b.sampleRate);for(var k=0;k<b.numberOfChannels;k++){var d=b.getChannelData(k),o=r.getChannelData(k);for(var i=0;i<d.length;i++)o[i]=d[d.length-1-i]}TT.rev=r;if(!it.vid)TT.pos=0;
  var h=$('#mz-tth',ROOT);if(h)h.textContent=it.name.toUpperCase()}
function ttStop(){if(TT.src){try{TT.src.stop()}catch(e){}TT.src=null}TT.motor=false}
function ttGrain(rate,dur){var c=ac();if(!c||!TT.buf)return;var fwd=rate>=0,b=fwd?TT.buf:TT.rev,len=TT.buf.duration,off=fwd?TT.pos:len-TT.pos;if(off<0||off>=len)return;
  var s=c.createBufferSource(),g=c.createGain(),t=c.currentTime,r=Math.max(.05,Math.min(4,Math.abs(rate)));s.buffer=b;s.playbackRate.value=r;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.004);g.gain.setValueAtTime(.9,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.012);
  s.connect(g);g.connect(graph(c).out);s.start(t,off,Math.min(len-off,r*(dur+.02)));}
function ttRate(){return (TT.rpm===45?45/33:1)*(1+TT.pitch/100)}
function ttInit(){var cv=$('#mz-tt',ROOT);if(!cv||cv.__ev)return;cv.__ev=1;var c2=cv.getContext('2d'),REV=1.8;
  var pi=$('#mz-pitch',ROOT);pi.setAttribute('aria-label','Pitch');pi.oninput=function(){TT.pitch=+pi.value;if(TT.src)TT.src.playbackRate.value=ttRate()};
  /* 13 nov. 2026 (Mauk Tenieb) : la platine lit aussi à l'envers ; tenue, elle sert de molette précise aux vidéos du montage (un tour = une seconde) */var RV=$('#mz-rev',ROOT);RV.setAttribute('aria-label',FR?'Lecture à l\'envers':'Reverse');RV.title=RV.getAttribute('aria-label');RV.onclick=function(){TT.back=!TT.back;RV.classList.toggle('on',TT.back);RV.setAttribute('aria-pressed',String(TT.back));if(TT.src||TT.motor){ttStop();TT.motorStart&&TT.motorStart()}};
  [].forEach.call($('#mz-rpm',ROOT).children,function(b){if(b===RV)return;b.onclick=function(){TT.rpm=+b.textContent;[].forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b)});if(TT.src)TT.src.playbackRate.value=ttRate()}});
  function draw(){if(!ROOT||!document.body.contains(cv))return;if(!ROOT.getClientRects().length||!cv.getClientRects().length){setTimeout(draw,500);return}requestAnimationFrame(draw);var now=performance.now();
    if(TT.motor&&!TT.hold){var dt=(now-TT.last)/1000,rr=ttRate()*(TT.back?-1:1),LL=ttLen();TT.last=now;TT.ang+=dt*rr/REV*Math.PI*2;TT.pos+=dt*rr;if(LL&&(TT.pos>=LL||TT.pos<=0)){if(!TT.vid&&LL<30)TT.pos=((TT.pos%LL)+LL)%LL;else{TT.pos=Math.max(0,Math.min(LL,TT.pos));ttStop()}}}
    ttSync();
    /* 13 nov. 2026 (Mauk Tenieb) : la vraie platine photographiée (a-tt-platine.webp), le disque (a-tt-disque.webp) qui tourne sur le plateau, le bras (a-tt-bras.webp) qui se pose au sillon pendant la lecture et suit la place dans le sample */
    var W=cv.width,k=W/1024;c2.clearRect(0,0,W,W);if(TTI.deck.complete&&TTI.deck.naturalWidth)c2.drawImage(TTI.deck,0,0,W,W);else{c2.fillStyle='#2b2620';c2.fillRect(0,0,W,W)}
    c2.save();c2.translate(396.5*k,485.5*k);c2.rotate(TT.ang);var dr=255*k;if(TTI.disc.complete&&TTI.disc.naturalWidth)c2.drawImage(TTI.disc,-dr,-dr,dr*2,dr*2);
    if(TT.buf||TT.vid){c2.fillStyle=TT.vid?'rgba(143,227,212,.85)':'rgba(200,36,58,.85)';c2.beginPath();c2.arc(0,0,dr*.3,0,7);c2.fill();c2.fillStyle='#0e0d0c';c2.beginPath();c2.arc(0,0,3*k*2,0,7);c2.fill()}c2.restore();
    var on=(TT.buf||TT.vid)&&(TT.hold||TT.motor),pr=ttLen()?Math.max(0,Math.min(1,TT.pos/ttLen())):0,tg=on?(26+14*pr)*Math.PI/180:0;TT.arm=(TT.arm||0)+(tg-(TT.arm||0))*.12;
    if(TTI.arm.complete&&TTI.arm.naturalWidth){c2.save();c2.translate(785*k,330*k);c2.rotate(TT.arm);c2.drawImage(TTI.arm,(687-785)*k,(348-330)*k,TTI.arm.naturalWidth*k,TTI.arm.naturalHeight*k);c2.restore()}}
  draw();
  var ang=function(e){var r=cv.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height*485.5/1024,e.clientX-r.left-r.width*396.5/1024)};
  cv.addEventListener('pointerdown',function(e){e.preventDefault();cv.setPointerCapture(e.pointerId);TT.was=TT.motor||!!TT.src;TT.mvd=0;ttStop();TT.hold=true;TT.lastA=ang(e);TT.last=performance.now();cv.style.cursor='grabbing'});
  cv.addEventListener('pointermove',function(e){if(!TT.hold)return;var a=ang(e),d=a-TT.lastA;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;TT.mvd+=Math.abs(d);var now=performance.now(),dt=Math.max(.008,(now-TT.last)/1000);
    TT.lastA=a;TT.last=now;TT.ang+=d;var dp=d/(Math.PI*2)*REV;if(Math.abs(dp)>1e-4){ttGrain(dp/dt,dt);var LL=ttLen();TT.pos=Math.max(0,LL?Math.min(LL-.01,TT.pos+dp):0)}});
  TT.motorStart=function(){var c=ac();TT.last=performance.now();if(!c||!TT.buf){TT.motor=!!TT.vid;return}var s=c.createBufferSource();s.buffer=TT.back?TT.rev:TT.buf;/* coupe courte : sillon fermé, en boucle */s.loop=!TT.vid&&TT.buf.duration<30;s.playbackRate.value=ttRate();s.connect(graph(c).out);var L=TT.buf.duration,off=TT.back?Math.max(0,Math.min(L-.01,L-TT.pos)):Math.min(TT.pos,L-.01);s.start(c.currentTime,off);TT.src=s;TT.motor=true;s.onended=function(){if(TT.src===s){TT.src=null;TT.motor=false}}};
  /* un toucher sans geste met en marche ou arrête le plateau ; après un scratch, il repart seulement s'il tournait (audit Ponytail) */var rel=function(){if(!TT.hold)return;TT.hold=false;cv.style.cursor='';if(TT.mvd<.15?!TT.was:TT.was)TT.motorStart()};
  cv.addEventListener('pointerup',rel);cv.addEventListener('pointercancel',rel);cv.setAttribute('aria-label',FR?'Platine : saisir le disque pour scratcher':'Turntable: grab the record to scratch');
  /* 15 nov. 2026, 20 h 25 (Mauk Tenieb) : un double-clic sur le disque ouvre le poste de mix, deux platines son et vidéo (borne-musik-mix.js) */cv.addEventListener('dblclick',function(e){e.preventDefault();ttStop();TT.hold=false;openMix()});var mg=$('#mz-mixgo',ROOT);if(mg)mg.onclick=function(){ttStop();TT.hold=false;openMix()};
  /* au doigt, deux tapes rapprochées valent un double-clic */var tap0=0,tx0=0,ty0=0;cv.addEventListener('pointerup',function(e){if(e.pointerType==='mouse')return;var n=performance.now();if(n-tap0<320&&Math.hypot(e.clientX-tx0,e.clientY-ty0)<24){tap0=0;ttStop();TT.hold=false;openMix()}else{tap0=n;tx0=e.clientX;ty0=e.clientY}})}
function openMix(){if(!ROOT)return;var go=function(){window.MusikMix.open(ROOT,{ac:ac,graph:graph,lib:function(){return S.lib},load:load,base:base,FR:FR})};if(window.MusikMix)return go();var x=document.createElement('script');x.src=base()+'borne-musik-mix.js';x.onload=go;document.head.appendChild(x)}

/* 13 nov. 2026 (RELAIS § 28, 4b) : la platine vidéo. Un clip, une démo ou un enregistrement de KamOrhogo se pose sur le disque ; la place du disque mène ensemble l'image (currentTime) et le son (grain), en avant et en arrière ; l'image passe dans l'écran de Musik */
function ttLen(){return TT.buf?TT.buf.duration:(TT.vid&&isFinite(TT.vid.duration)?TT.vid.duration:0)}
function ttSync(){var v=TT.vid;if(!v||!v.duration||v.readyState<1)return;var w=Math.max(0,Math.min(v.duration-.04,TT.pos));
  try{if(TT.motor&&!TT.hold&&!TT.back){v.playbackRate=Math.max(.0625,Math.min(4,ttRate()));if(v.paused){var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}if(Math.abs(v.currentTime-w)>.25&&!v.seeking)v.currentTime=w}
  else{if(!v.paused)v.pause();if(Math.abs(v.currentTime-w)>.02&&!v.seeking)v.currentTime=w}}catch(e){}}
function ttVid(it){var u=it.file||base()+it.url,v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';if(!it.file)v.crossOrigin='anonymous';v.src=u;
  ttStop();if(TT.vid){try{TT.vid.pause();TT.vid.removeAttribute('src');TT.vid.load()}catch(e){}}TT.vit=it;TT.vid=v;if(ROOT)ROOT.classList.add('vid');TT.buf=null;TT.rev=null;TT.pos=0;TT.name=it.name;var h=ROOT&&$('#mz-tth',ROOT);if(h)h.textContent=String(it.name).toUpperCase();
  v.addEventListener('loadeddata',function(){if(TT.vid===v)vshow({media:v,kind:'vid',tt:1,vol:1,pan:0,tune:0,cut:1,res:0,drv:0,echo:0,verb:0})},{once:true});
  var c=ac();if(!c)return;fetch(u).then(function(r){return r.arrayBuffer()}).then(function(a){return new Promise(function(ok,ko){c.decodeAudioData(a,ok,ko)})}).then(function(b){if(TT.vit===it)ttLoad({name:it.name,buf:b,vid:1})}).catch(function(){})}

/* ---------- la Console (RELAIS § 29, ordre de Mauk Tenieb du 15 nov. 2026, 2 h 49) : une console épaisse à 8 ou 16 emplacements, chacun un moment de la boucle ; une figurine enfoncée dans un emplacement y joue le leitmotiv de son Mask (sa première coupe) ; au-dessus, le bac des 18 figurines, chacune à sa stature (toise du vidéoclub) ; toucher une figurine puis un emplacement l'enfonce, la glisser aussi ; toucher une figurine enfoncée la retire ---------- */
var STG={el:null,res:null,con:null},ASP=233/260;
function masks(){return S.ch.filter(function(c){return c.mask})}
function chById(id){for(var i=0;i<S.ch.length;i++)if(S.ch[i].id===id)return S.ch[i];return null}
/* le bac suit les pistes : une piste ajoutée y entre avec sa figurine (banc d'essai du 15 nov. 2026) */
function resBuild(){if(!STG.res)return;var M=masks();if(STG.res.children.length===M.length&&[].every.call(STG.res.children,function(b,i){return b.__c===M[i]}))return;STG.res.innerHTML='';M.forEach(function(c){var b=el('button','mzfig',figImg(c));b.type='button';b.setAttribute('aria-label',c.name);b.title=c.name;b.__c=c;STG.res.appendChild(b)});if(STG.con)conPaint()}
function view(k){if(k==='stage')resBuild();S.view=k;if(!ROOT)return;var st=$('#mz-stg',ROOT),R=$('#mz-rack',ROOT);if(!st)return;ROOT.dataset.v=k;st.hidden=k!=='stage';R.style.display=k==='grid'?'':'none';
  [].forEach.call($('#mz-view',ROOT).children,function(b){var on=b.dataset.v===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});if(k==='stage')conLayout();else if(k==='grid')rack();
  /* la platine n'est jamais vide : le son de la voix choisie, sinon une coupe des albums */if(k==='tt'&&!TT.buf&&!TT.vid){var c=S.ch[S.sel],it=c&&c.kind==='smp'&&c.src?libItem(c.src):c&&c.mask?kitOf(c)[0]:null;it=it||S.lib.filter(function(x){return x.id.slice(0,2)==='a:'})[0];if(it&&ac())load(it).then(function(b){if(!TT.buf&&!TT.vid)ttLoad({name:it.name,buf:b})}).catch(function(){})}}
/* le leitmotiv : la première coupe du Mask (KIT), chargée à la première pose ; un Mask déjà réglé sur une coupe garde la sienne */
function leit(c){if(c.kind==='smp'&&c.buf)return;var it=kitOf(c)[0];if(!it)return;load(it).then(function(b){if(c.kind==='smp'&&c.buf)return;c.kind='smp';c.buf=b;c.src=it.id;if(ROOT)strips()}).catch(function(){})}
function conSet(j,id){if(j<0||j>=S.ns)return;S.slots[j]=id||'';if(id){var c=chById(id);if(c){leit(c);if(!S.play&&ac())play(true)}}conPaint();/* la figurine posée descend dans l'œillet (continuité) */if(id&&STG.con&&STG.con.children[j])STG.con.children[j].classList.add('pop')}
function conSize(n){if(n===S.ns)return;var o=S.slots,m=[];for(var q=0;q<n;q++)m[q]=o[q]||'';S.slots=m;S.ns=n;conBuild()}
function conStep(st,at,ms,sol){/* un emplacement par pas */if(st>=S.ns)return;var j=st,c=chById(S.slots[j]);if(c&&!c.mute&&(!sol||c.solo))hit(AC,c,st,at,S.pat);
  setTimeout(function(){if(!STG.con||!S.play)return;[].forEach.call(STG.con.querySelectorAll('.mzslot'),function(x,i){x.classList.toggle('hd',i===j)});var im=c&&STG.con.children[j]&&STG.con.children[j].querySelector('img,canvas');if(c&&c.mask)figHop(c.mask,0);
    if(im&&im.animate)im.animate([{transform:'translateY(0)'},{transform:'translateY(-7%)'},{transform:'translateY(0)'}],{duration:180,easing:'ease-out'})},ms)}
/* 15 nov. 2026 (Mauk Tenieb : « non pas les noms, qui sont verbeux, mais les figurines 3D de Skoporhogo ») : les Masks de Musik sont les corps 3D de SkopoRhogo (skopo-figs.js, tiré de skoporhogo.html), rendus en pixels par un seul moteur three.js partagé ; chaque figurine garde sa stature, se balance au repos et saute quand sa piste joue */
var FIG={st:0,p:null,R:null,sc:null,cam:null,m:{},hmax:1,hop:{},raf:0,last:0,lastAll:0,w:0,h:0};
function figLoad(){if(FIG.p)return FIG.p;FIG.p=new Promise(function(ok){function add(u,cb){var x=document.createElement('script');x.src=base()+u;x.onload=cb;x.onerror=function(){ok(false)};document.head.appendChild(x)}
  (window.THREE?function(c){c()}:function(c){add('three.min.js',c)})(function(){window.SkopoFigs?ok(true):add('skopo-figs.js',function(){ok(!!window.SkopoFigs)})})});return FIG.p}
function figInit(){if(FIG.R)return true;var T=window.THREE;if(!T||!window.SkopoFigs)return false;
  try{FIG.R=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true})}catch(e){return false}
  FIG.R.setPixelRatio(1);FIG.R.setClearColor(0,0);FIG.sc=new T.Scene();FIG.sc.add(new T.AmbientLight(0xffffff,.36));var dl=new T.DirectionalLight(0xfff1dc,1.05);dl.position.set(-1.2,2,2.4);FIG.sc.add(dl);var rl=new T.DirectionalLight(0x9fd8ff,.28);rl.position.set(1.5,1,-2);FIG.sc.add(rl);
  FIG.cam=new T.OrthographicCamera(-1,1,1,-1,.1,40);FIG.cam.position.set(0,0,12);
  MASKS.forEach(function(k){var o=SkopoFigs.build(k);if(!o)return;var b=new T.Box3().setFromObject(o.g);o.h=b.max.y-b.min.y;o.y0=b.min.y;FIG.m[k]=o;if(o.h>FIG.hmax)FIG.hmax=o.h});
  return true}
function figHop(k,ms){if(!k)return;setTimeout(function(){FIG.hop[k]=performance.now()},Math.max(0,ms||0));figRun()}
function figRun(){if(!FIG.raf)FIG.raf=requestAnimationFrame(figFrame)}
function figFrame(now){FIG.raf=0;if(!ROOT||!ROOT.isConnected||!ROOT.getClientRects().length)return;/* Musik caché : la boucle s'arrête, rack() la relance */var L=ROOT.querySelectorAll('canvas.mzfc');if(!L.length)return;
  if(!figInit()){figLoad().then(function(ok){if(ok)figRun()});return}
  var busy=S.play||Object.keys(FIG.hop).some(function(k){return now-FIG.hop[k]<260});
  if(now-FIG.last<(busy?33:90)){figRun();return}FIG.last=now;var T=window.THREE,t=now/1000,R=FIG.R;
  /* économie : le balancement se redessine 11 fois par seconde, seules les figurines qui sautent suivent le tempo */var all=now-FIG.lastAll>=90;if(all)FIG.lastAll=now;
  [].forEach.call(L,function(cv,i){var k=cv.dataset.mask,o=FIG.m[k];if(!o)return;var hp=FIG.hop[k]?Math.max(0,1-(now-FIG.hop[k])/260):0;if(!all&&!hp&&!cv.__hp)return;cv.__hp=hp>0;
    if(!cv.offsetParent)return;/* net sur écran dense : le rendu suit la densité de pixels (deux au plus) */var dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(8,Math.round(cv.clientWidth*dpr)),h=Math.max(8,Math.round(cv.clientHeight*dpr));if(cv.width!==w)cv.width=w;if(cv.height!==h)cv.height=h;
    var j=Math.sin(hp*Math.PI),f=o.figs[0];
    /* en relief : vue d'un peu au-dessus, trois quarts qui pivotent lentement */o.g.rotation.x=.3;o.g.rotation.y=-.5+Math.sin(t*.55+i*1.7)*.62;o.g.position.y=-o.y0+j*o.h*.12;
    if(f&&f.arms&&f.arms.length>1){f.arms[0].rotation.z=-j*1.9;f.arms[1].rotation.z=j*1.9;f.arms[0].rotation.x=f.arms[1].rotation.x=0}
    if(f&&f.legs)f.legs.forEach(function(l,n){l.rotation.x=j*(n?-.5:.5)});
    for(var q=0;q<o.figs.length;q++)if(o.figs[q].fx)try{o.figs[q].fx(t,{moving:hp>0})}catch(e){}
    /* stature : le plus grand des Masks remplit la hauteur, les autres gardent leur taille relative */var bust=cv.classList.contains('bust'),vh=bust?FIG.hmax*.42:FIG.hmax*1.1,vw=vh*w/h,top=bust?o.h+vh*.1:vh*.97;
    FIG.cam.left=-vw/2;FIG.cam.right=vw/2;FIG.cam.top=top;FIG.cam.bottom=top-vh;FIG.cam.updateProjectionMatrix();
    FIG.sc.add(o.g);if(FIG.w!==w||FIG.h!==h){R.setSize(w,h,false);FIG.w=w;FIG.h=h}R.render(FIG.sc,FIG.cam);FIG.sc.remove(o.g);
    var x=cv.getContext('2d');x.clearRect(0,0,w,h);x.drawImage(R.domElement,0,0)});
  figRun()}
function figCss(){if(document.getElementById('mz-fig-css'))return;var st=document.createElement('style');st.id='mz-fig-css';st.textContent=
  /* 15 nov. 2026, 23 h 10 (juge Impeccable D) : dans la grille, une figurine par rangée, en buste à l'échelle commune, alignée sur sa ligne de pas ; socle à la couleur de la piste */
  '#mz .mzrack .mzrow{position:relative}'+
  '#mz .mzrack .mznm.mzfg{flex:none;position:relative;width:calc(var(--mzrh,42px) * 1.7)!important;max-width:none!important;height:100%!important;max-height:none!important;padding:0!important;background:none!important;box-shadow:none!important;filter:none!important;overflow:visible!important;z-index:2;cursor:pointer}'+
  '#mz .mzrack .mznm.mzfg canvas{position:absolute;bottom:2px;left:0;width:calc(var(--mzrh,42px) * 1.7);height:calc(var(--mzrh,42px) * 1.25);pointer-events:none;filter:drop-shadow(0 2px 1px rgba(0,0,0,.7))}'+
  '#mz .mzrack .mznm.mzfg::after{content:"";position:absolute;left:2px;right:2px;bottom:0;height:2px;border-radius:1px;background:var(--c);box-shadow:0 1px 0 #000}'+
  '#mz .mzrack .mzrow.sel .mznm.mzfg{outline:none!important}#mz .mzrack .mzrow.sel .mznm.mzfg::after{height:4px;background:var(--amb,#ffa726)}#mz .mzrack .mzrow.sel .mznm.mzfg canvas{filter:drop-shadow(0 0 2px var(--amb,#ffa726)) drop-shadow(0 2px 1px rgba(0,0,0,.7))}#mz .mzrack .mzrow.sel .mznm.mzfg{box-shadow:none!important}'+
  '#mz .mzrack .mzrow.mute .mznm.mzfg canvas{opacity:.35;filter:grayscale(1)}'+
  '#mz .mznm.mzfg:focus-visible{outline:2px solid var(--amb,#ffa726);outline-offset:1px}'+
  '/* 15 nov. 2026 : la Console en vrai banc de noyer à œillets de laiton (image Midjourney de Mauk Tenieb, 21 h 09) ; un emplacement = une case du banc photographié, répétée 15 à 21 fois ; la figurine se pose dans l’œillet, le voyant s’allume au pas joué */'+
  '#mz .mzcon>.mzslot::before{left:0;right:0;bottom:0;height:calc(var(--sw,60px) * 1.878);background:url('+base()+'kave/a/mix/slot.webp) center bottom/100% 100% no-repeat;box-shadow:none;border-radius:0;filter:brightness(.78) saturate(.9)}#mz .mzcon>.mzslot::after{display:none}'+
  '#mz .mzcon>.mzslot:first-child::before,#mz .mzcon>.mzslot.cs::before{box-shadow:inset 3px 0 0 #8c6a2c,inset 4px 0 0 #2a1a0c}#mz .mzcon>.mzslot:last-child::before,#mz .mzcon>.mzslot.ce::before{box-shadow:inset -3px 0 0 #8c6a2c,inset -4px 0 0 #2a1a0c}'+
  '#mz .mzcon .mzhole{left:24%;right:24%;bottom:calc(var(--sw,60px) * 1.878 * .675 - var(--sw,60px) * .1);height:calc(var(--sw,60px) * .2);background:none;box-shadow:none}'+
  '#mz .mzcon .mzslot.over .mzhole,#mz .mzstage.arm .mzcon .mzslot:not(.full) .mzhole{box-shadow:0 0 0 2px #ffa726,0 0 10px rgba(255,167,38,.6)}'+
  '#mz .mzcon .mzdi{left:45%;bottom:calc(var(--sw,60px) * 1.878 * .272 - 4px);width:8px;height:8px;margin-left:-4px;background:none;box-shadow:none}#mz .mzcon .mzslot.hd .mzdi{background:radial-gradient(circle at 35% 35%,#ffe1c0,#ff3b1f 55%,#8c1407);box-shadow:0 0 10px 3px rgba(255,70,30,.85)}'+
  '#mz .mzcon .mzslot canvas.mzfc{bottom:calc(var(--sw,60px) * 1.878 * .675 - 2px)}'+
  '#mz .mzcon{display:flex!important;flex-wrap:wrap;justify-content:center;align-content:flex-end}#mz .mzcon>.mzslot{flex:0 0 calc(100% / var(--cols));height:var(--rowh)}'+
  '#mz canvas.mzfc{display:block}#mz .mzfig canvas.mzfc{height:calc(100% * var(--k));width:auto;aspect-ratio:3/5;pointer-events:none}'+
  '#mz .mzslot canvas.mzfc{position:absolute;left:50%;bottom:28%;transform:translateX(-50%);z-index:2;height:calc(var(--fh) * var(--k));width:auto;aspect-ratio:3/5;filter:drop-shadow(0 3px 2px rgba(0,0,0,.75))}';
  document.head.appendChild(st)}
function figImg(c){figCss();figLoad().then(figRun);return '<canvas class="mzfc" data-mask="'+c.mask+'" style="--k:'+(STAT[c.mask]/1.98).toFixed(3)+'"></canvas>'}
function stageInit(){var st=$('#mz-stg',ROOT);if(!st||st.__ev)return;st.__ev=1;STG.el=st;
  S.ns=S.n;for(var i=0;i<S.ns;i++)S.slots[i]=S.slots[i]||'';
  st.innerHTML='<div class="mzres" id="mz-res"></div><div class="mzconw"><div class="mzcon" id="mz-con"></div></div>';
  STG.res=$('#mz-res',st);STG.con=$('#mz-con',st);
  /* 15 nov. 2026 (contrôle externe) : à la souris, la molette fait défiler le bac des figurines de gauche à droite */STG.res.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&STG.res.scrollWidth>STG.res.clientWidth){e.preventDefault();STG.res.scrollLeft+=e.deltaY}},{passive:false});
  resBuild();
  conBuild();conEv(st);if(window.ResizeObserver)new ResizeObserver(function(){conLayout()}).observe(st)}
function conBuild(){var C=STG.con;if(!C)return;C.innerHTML='';for(var i=0;i<S.ns;i++){var d=el('button','mzslot');d.type='button';d.dataset.j=i;C.appendChild(d)}
  conPaint();conLayout()}
function conPaint(){var C=STG.con;if(!C)return;[].forEach.call(C.children,function(d,i){var c=chById(S.slots[i]);d.innerHTML='<i class="mzdi"></i><span class="mzhole"></span>'+(c?figImg(c):'');d.classList.toggle('full',!!c);d.setAttribute('aria-label',(i+1)+(c?' · '+c.name:''));d.title=c?c.name:''});
  [].forEach.call(STG.res.children,function(b){b.classList.toggle('pick',S.pick===b.__c.id);b.classList.toggle('in',S.slots.indexOf(b.__c.id)>=0)});STG.el.classList.toggle('arm',!!S.pick)}
/* géométrie : tout part de la taille du plateau ; 16 emplacements passent sur deux rangées de 8 quand un emplacement tomberait sous 46 px ; la figurine enfoncée prend la hauteur que laisse sa rangée, à sa stature */
function stageFit(st){var mz=ROOT,pv=st.style.height;st.style.height='';var nat=st.getBoundingClientRect().height,m=mz.getBoundingClientRect(),r=st.getBoundingClientRect(),av=Math.floor(mz.clientHeight-(r.top-m.top+mz.scrollTop)-6);
  var h=av>=120&&av<nat-1?av+'px':'';if(h!==pv||st.style.height!==h)st.style.height=h}
function conLayout(){var st=STG.el;if(!st||st.hidden)return;stageFit(st);var W=st.clientWidth,H=st.clientHeight;if(!W||!H)return;
  /* 15 nov. 2026 (critique Impeccable, P1 : « bande noire morte » entre le bac et la console) : la rangée prend la hauteur de sa figurine, le reste revient au bac */
  var hr=Math.round(H*.27),hc=H-hr-10,best=null,one=narrow()||(W-16)/S.ns>=34,swm=Math.max(40,(W-16)/S.ns);/* le banc reste d'une seule rangée ; au téléphone il défile de côté, cases de 40 px au moins (juge Impeccable D) */((one)?[S.ns]:[Math.ceil(S.ns/2),Math.ceil(S.ns/3)]).forEach(function(cols){var rows=Math.ceil(S.ns/cols),rowH=hc/rows,sw=one?swm:(W-16)/cols,fh=Math.min(rowH*.8,sw/ASP*1.35);if(!best||fh>best.fh*1.06)best={cols:cols,rows:rows,rowH:rowH,fh:fh}});
  var rh2=Math.min(best.rowH,best.fh/.78);hr=Math.max(hr,Math.round(Math.min(H*.66,H-10-best.rows*rh2)));best.rowH=rh2;
  st.style.setProperty('--hr',hr+'px');st.style.setProperty('--cols',best.cols);st.style.setProperty('--rowh',best.rowH.toFixed(1)+'px');
  var swv=one?swm:(W-16)/best.cols;st.style.setProperty('--fh',best.fh.toFixed(1)+'px');st.style.setProperty('--sw',swv.toFixed(1)+'px');if(STG.con)STG.con.style.width=one&&swm*S.ns>W-16?(swm*S.ns)+'px':'';st.style.setProperty('--rh',Math.min(hr*.92,H*.42).toFixed(1)+'px')}
/* le doigt : toucher, ou glisser une figurine du bac (ou d'un emplacement) vers un emplacement ; lâchée hors de la console, une figurine enfoncée revient au bac */
function conEv(st){var G=null;
  function slotAt(x,y){var e=document.elementFromPoint(x,y);e=e&&e.closest&&e.closest('.mzslot');return e&&STG.con.contains(e)?+e.dataset.j:-1}
  st.addEventListener('pointerdown',function(e){if(e.button>0)return;var f=e.target.closest('.mzfig'),sl=e.target.closest('.mzslot');if(!f&&!(sl&&sl.classList.contains('full')))return;
    var id=f?f.__c.id:S.slots[+sl.dataset.j],from=f?-1:+sl.dataset.j,x0=e.clientX,y0=e.clientY,mv=false,src=(f||sl).querySelector('img,canvas');
    function m(ev){if(!mv){var dx=ev.clientX-x0,dy=ev.clientY-y0;if(Math.hypot(dx,dy)<8)return;if(f&&Math.abs(dx)>Math.abs(dy)*1.2)return;mv=true;
        var r=src.getBoundingClientRect();G=el('img','mzfgh');G.src=src.src||(src.toDataURL?src.toDataURL():'');G.style.width=r.width+'px';G.style.height=r.height+'px';document.body.appendChild(G);G.__dx=x0-r.left;G.__dy=y0-r.top;if(from>=0){S.slots[from]='';conPaint()}}
      G.style.transform='translate('+(ev.clientX-G.__dx)+'px,'+(ev.clientY-G.__dy)+'px)';var j=slotAt(ev.clientX,ev.clientY);[].forEach.call(STG.con.children,function(d,i){d.classList.toggle('over',i===j)})}
    function u(ev){removeEventListener('pointermove',m);removeEventListener('pointerup',u);removeEventListener('pointercancel',u);
      if(G){G.remove();G=null}[].forEach.call(STG.con.children,function(d){d.classList.remove('over')});
      if(ev.type==='pointercancel'){if(mv&&from>=0)conSet(from,id);return}
      if(mv){var j=slotAt(ev.clientX,ev.clientY);if(j>=0)conSet(j,id);else conPaint();return}
      if(f){S.pick=S.pick===id?null:id;conPaint()}else if(S.pick){conSet(from,S.pick)}else conSet(from,'')}
    addEventListener('pointermove',m);addEventListener('pointerup',u);addEventListener('pointercancel',u)});
  st.addEventListener('click',function(e){var fg=e.target.closest('.mzfig');if(fg&&e.detail===0){S.pick=S.pick===fg.__c.id?null:fg.__c.id;conPaint();return}var sl=e.target.closest('.mzslot');if(sl&&sl.classList.contains('full')&&e.detail===0){conSet(+sl.dataset.j,S.pick||'');return}if(!sl||sl.classList.contains('full'))return;if(e.detail===0&&!S.pick)return;if(S.pick)conSet(+sl.dataset.j,S.pick)})}

/* ---------- les sons d'un Mask (RELAIS § 28, 2a et b) : son synthé, puis les coupes des sorties de son alias ; un Mask sans sortie propre prend deux sons de la borne et le dernier son de KamOrhogo ---------- */
function libItem(id){return S.lib.filter(function(x){return x.id===id})[0]}
/* 15 nov. 2026, 22 h 52 (Mauk Tenieb : les personnages « jouent des sons autres que ceux des samples par défaut ») : chaque Mask joue d'office le premier sample de son kit ; le synthé reste au choix dans la tranche */
function defSrc(){S.ch.forEach(function(c){if(!c.mask||c.kind!=='syn')return;var it=kitOf(c)[0];if(!it)return;c.kind='smp';c.src=it.id;c.vol=.7;load(it).then(function(b){if(c.src===it.id&&S.ch.indexOf(c)>=0)c.buf=b}).catch(function(){})})}
/* remise à zéro : pistes, sons par défaut, motifs, kits, Console, tempo et maître d'origine */
function resetAll(){play(false);ttStop();var g=AC&&AC.__mz;if(g)Object.keys(g.strip).forEach(function(id){var st=g.strip[id];try{if(st.fxN)st.fxN.stop();if(st.wln){st.wln.disconnect();st.wln.port.postMessage({mode:'kill'})}st.v.disconnect();st.p.disconnect()}catch(e){}delete g.strip[id]});
  S.kit=-1;S.kitBak=null;S.ch=[];S.pat=0;S.chain=false;S.bpm=96;S.swing=0;S.sel=0;S.page=0;S.echoT=.375;S.echoF=.38;S.verb=.5;S.drive=0;S.master=.85;S.pick=null;S.slots=S.slots.map(function(){return ''});
  seed();try{libK()}catch(e){}defSrc();if(g){masterApply(g);verbLater()}if(!ROOT)return;var M=$('#mz-mst',ROOT);if(M){M.__k=0;M.innerHTML=''}var tk=$('#mz-tk',ROOT);if(tk)[].forEach.call(tk.querySelectorAll('.mzkn'),function(k){k.__draw&&k.__draw()});
  $('#mz-bpm',ROOT).textContent=S.bpm;$('#mz-chain',ROOT).classList.remove('on');paintPat();paintLen();rack();strips();resBuild();if(STG.con)conPaint()}
function kitOf(c){var L=(KIT[c.mask]||[]).map(function(k){return libItem('a:'+k)}).filter(Boolean);
  if(!L.length){var i=MASKS.indexOf(c.mask);L=[libItem('b:'+BRN[(i*2)%BRN.length][0]),libItem('b:'+BRN[(i*2+1)%BRN.length][0])].filter(Boolean);var k=S.lib.filter(function(x){return x.id.slice(0,2)==='k:'})[0];if(k)L.push(k)}return L}
function srcSeg(c){var g=el('div','mzseg');g.id='mz-src';
  [{ic:IC.syn,nm:FR?'Synthé':'Synth',it:null}].concat(kitOf(c).map(function(it){var p=it.id.slice(0,2);return {ic:p==='a:'?IC.disc:p==='k:'?IC.cam:IC.bell,nm:it.name,it:it}})).forEach(function(o){
    var b=el('button',null,o.ic);b.type='button';b.setAttribute('aria-label',o.nm);b.title=o.nm;if(o.it?(c.kind==='smp'&&c.src===o.it.id):c.kind==='syn')b.classList.add('on');b.onclick=function(){setSrc(c,o.it)};g.appendChild(b)});return g}
function setSrc(c,it){if(!it){c.want=null;c.kind='syn';c.buf=null;c.src=null;rack();strips();if(ac())hit(AC,c,0,AC.currentTime+.01,S.pat);return}
  c.want=it.id;var go=function(b){if(c.want!==it.id||S.ch.indexOf(c)<0)return;c.kind='smp';c.buf=b;c.src=it.id;rack();strips();ttLoad(it);audition(b)};if(it.buf)go(it.buf);else load(it).then(go).catch(function(){})}

/* ---------- KAVE : le motif (ou l'enchaînement A B C D) en WAV stéréo ---------- */
function kaveVid(pats){var c=ac();if(!c||!VIS.cv||!window.MediaRecorder)return;var g=graph(c),dst=c.createMediaStreamDestination();g.lim.connect(dst);
 var st=VIS.cv.captureStream(30);dst.stream.getAudioTracks().forEach(function(t){st.addTrack(t)});var mt=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].filter(function(x){return MediaRecorder.isTypeSupported(x)})[0]||'';
 var rec=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:4e6}:{}),ch=[];rec.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};
 rec.onstop=function(){try{g.lim.disconnect(dst)}catch(e){}var ty=(rec.mimeType||'video/webm').split(';')[0],u=URL.createObjectURL(new Blob(ch,{type:ty})),x=el('a');x.href=u;x.download=window.ikName?ikName('musik',ty.indexOf('mp4')>0?'mp4':'webm'):'musik.webm';document.body.appendChild(x);x.click();setTimeout(function(){x.remove();URL.revokeObjectURL(u)},4000);$('#mz-kave',ROOT).classList.remove('on')};
 var keep=S.chain;S.chain=pats.length>1;S.pat=pats[0];paintPat();rack();play(false);$('#mz-kave',ROOT).classList.add('on');rec.start(250);play(true);
 setTimeout(function(){play(false);S.chain=keep;setTimeout(function(){rec.stop()},400)},pats.length*S.n*stepDur()*1000+300)}
function kave(){var pats=S.chain?[0,1,2,3]:[S.pat];if(S.ch.some(function(ch){return (ch.kind==='img'||ch.kind==='vid')&&pats.some(function(p){return ch.steps[p].slice(0,S.n).some(Boolean)})}))return kaveVid(pats);var d=stepDur(),SR=44100,len=pats.length*S.n*d+3,c=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,Math.ceil(SR*len),SR);
  /* le moteur d'effets se charge avant le rendu : le fichier sonne comme ce qu'on entend ; en vue Console, les figurines des cases jouent (audit Ponytail) */
  var wl=c.audioWorklet?c.audioWorklet.addModule(base()+'musik-fx.js').then(function(){return true},function(){return false}):Promise.resolve(false);
  wl.then(function(ok){var g=graph(c);g.wl=ok;masterApply(g);S.ch.forEach(function(ch){strip(g,ch)});var sol=S.ch.some(function(x){return x.solo}),t=.05;
  pats.forEach(function(p){for(var s=0;s<S.n;s++){var at=t+(s%2?S.swing*d*.6:0);S.ch.forEach(function(ch){if(ch.steps[p][s]&&!ch.mute&&(!sol||ch.solo)&&live(ch))hit(c,ch,s,at,p)});if(S.view==='stage'&&s<S.ns){var cc=chById(S.slots[s]);if(cc&&!cc.mute)hit(c,cc,s,at,p)}t+=d}});
  return c.startRendering()}).then(function(r){var n=r.length,L=r.getChannelData(0),R=r.getChannelData(1),v=new DataView(new ArrayBuffer(44+n*4)),w=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
    w(0,'RIFF');v.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,SR,true);v.setUint32(28,SR*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*4,true);
    for(var i=0,o=44;i<n;i++,o+=4){var a=Math.max(-1,Math.min(1,L[i])),b=Math.max(-1,Math.min(1,R[i]));v.setInt16(o,a<0?a*32768:a*32767,true);v.setInt16(o+2,b<0?b*32768:b*32767,true)}
    var u=URL.createObjectURL(new Blob([v],{type:'audio/wav'})),x=el('a');x.href=u;x.download=window.ikName?ikName('musik','wav'):'musik.wav';document.body.appendChild(x);x.click();setTimeout(function(){x.remove();URL.revokeObjectURL(u)},4000)}).catch(function(){})}

/* ---------- branchement : Musik s'ouvre sur la station ---------- */
function hook(){if(typeof window.beatboxOpen!=='function'){setTimeout(hook,600);return}if(window.beatboxOpen.__mz)return;
  var open=window.beatboxOpen,close=window.beatboxClose;
  window.beatboxOpen=function(){var r=open.apply(this,arguments);try{if(typeof window.bbStop==='function')window.bbStop();ac();mount()}catch(e){}return r};window.beatboxOpen.__mz=1;
  window.beatboxClose=function(){play(false);ttStop();return close.apply(this,arguments)};
  var p=document.getElementById('bb-panel');if(p&&p.style.display!=='none'&&p.getClientRects().length){ac();mount()}}
addEventListener('resize',function(){clearTimeout(window.__mzr);window.__mzr=setTimeout(function(){if(S.view==='stage')conLayout();else if(S.view!=='tt')rack()},200)});
window.__mz={S:S,mount:mount,play:play,kave:kave,view:view,conSet:conSet,ttVid:ttVid,TT:TT,apply:apply,fxSet:fxSet,masterApply:masterApply,kitSet:kitSet};
/* 15 nov. 2026 : Musik se monte aussi dans une fenêtre de KorhogOS (la borne y tourne dans un cadre) ; avant, le garde « window.top » laissait l'ancienne boîte à rythmes à l'écran */
{hook();addEventListener('borne-diktat',function(){if(S.ch.length)libK()});addEventListener('borne-vid',function(){if(S.ch.length)libV()})}
})();

/* 13 nov. 2026 (critique Impeccable ; règle de Mauk Tenieb du 10 nov.) : un nom trop long pour sa bande Dymo défile sur place */
(function(){function tp(){var R=document.getElementById('mz');if(!R)return;[].forEach.call(R.querySelectorAll('.mznm span,.mzlb span,.mzlb b'),function(e){if(e.querySelector('.tp'))return;var w=e.scrollWidth-e.clientWidth;if(w>3&&e.firstChild&&e.firstChild.nodeType===3){var t=document.createElement('span');t.className='tp';t.textContent=e.textContent;t.style.setProperty('--dx',-(w+6)+'px');t.style.setProperty('--tt',Math.max(3,w/14)+'s');e.textContent='';e.appendChild(t)}})}
 var mo=null;function hook(){var R=document.getElementById('mz');setTimeout(hook,2000);if(!R||(mo&&mo.R===R))return;if(mo)mo.disconnect();tp();mo=new MutationObserver(function(){clearTimeout(hook.t);hook.t=setTimeout(tp,120)});mo.R=R;mo.observe(R,{childList:true,subtree:true})}hook();})();
