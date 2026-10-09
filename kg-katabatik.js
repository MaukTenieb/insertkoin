
/*
 * Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna
 * Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related
 * material — including characters, names, symbols, rules, lore and texts, in any form or
 * medium — are the exclusive property of Korhogo™. The source code of this site is
 * published for reading, reflections, additions, requests, etc. - the lore, names, marks
 * and works remain the property of the author. No use for training artificial
 * intelligence. Contact: mauktenieb@gmail.com
 */

/* KG module "katabatik" -- KATABATIK: hub + Connect-4 / Sampler / Hungarian Hangman / Mastermind (panels #c4-panel, #bb-panel, #hang-panel, #mm-panel) + BakuBoom helpers. Connect-4 and the BakuBoom helpers are copied verbatim from kofa.js (Korhogo); the Sampler, the Hangman and Mastermind are Insert Koin additions. The dormant Pairs panel was purged (memory lives in Erratik). */

// ============================================================
// KATABATIK hub -- four games under one roof; Connect 4 stays the entry point.
// ============================================================
function kbShow(which){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  ['c4-panel','bb-panel','hang-panel','mm-panel'].forEach(function(id){
    var p=document.getElementById(id);if(p)p.style.display='none';
  });
  var _tt=document.getElementById('title');
  if(_tt)_tt.style.visibility='hidden';
  kbTabs(which);
  if(which==='bb'){beatboxOpen(_bbCtxMode||'chess');return;}
  if(which==='hang'){
    var hp=document.getElementById('hang-panel');if(hp)hp.style.display='flex';
    hangMaybeNew();return;
  }
  if(which==='mm'){
    var mp=document.getElementById('mm-panel');if(mp)mp.style.display='flex';
    mmMaybeNew();return;
  }
  var c4=document.getElementById('c4-panel');
  if(c4)c4.style.display='flex';
}
window.kbShow=kbShow;
function kbTabs(which){
  var tabs=document.querySelectorAll('.kb-tab');
  tabs.forEach(function(t){
    var go=t.getAttribute('data-action')||'';
    t.className='kb-tab'+(go.indexOf("'"+which+"'")>=0?' on':'');
  });
}

// ============================================================
// SAMPLER v2 -- 18 tracks, one per Mask, 8 large steps, rewritten synthesis.
// beatboxOpen('kk') is still called by Faunarratics; 'chess' is the hub path.
// ============================================================
function beatboxOpen(ctx){
  var _bbCtx=ctx||'chess';
  var panel=document.getElementById('bb-panel');
  if(!panel)return;
  panel.style.display='flex';
  var _tt=document.getElementById('title');
  if(_tt)_tt.style.visibility='hidden';
  kbTabs('bb');
  // Creer AudioContext ici -- tap utilisateur direct
  if(!_bbAC){
    try{_bbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(_e){}
  }
  if(_bbAC&&_bbAC.state==='suspended')_bbAC.resume();
  bbInit(_bbCtx);
  // Kerema : Touched by a muse?
  if(_bbCtx==='kk'){
    var feed=document.getElementById('kk-feed');
    if(feed&&typeof KK_HDR!=='undefined'&&typeof kkKBody!=='undefined'){
      var ec=document.createElement('div');ec.className='kk-kerema';
      ec.innerHTML=KK_HDR+kkKBody('Touched by a muse?');
      feed.appendChild(ec);feed.scrollTop=feed.scrollHeight;
    }
  }
}
function beatboxClose(){
  var panel=document.getElementById('bb-panel');
  if(panel)panel.style.display='none';
  var _tt=document.getElementById('title');
  if(_tt)_tt.style.visibility='';
  bbStop();
}
window.beatboxOpen=beatboxOpen;
window.beatboxClose=beatboxClose;

var _bbAC=null, _bbSeqTimer=null, _bbStep=0, _bbPlaying=false;
var _bbBPM=90, _bbCtxMode='chess';
var _bbTracks=null;

// Voice + root (A minor pentatonic) per Mask, FAUNA order; curated default patterns.
var BB_VOICES=['kick','kick2','sub','bass','snare','tom','bell','clap','hat','pluck','rim','conga','pad','stab','bass2','lead','shaker','zap'];
var BB_ROOTS=[0,0,33,45,0,38,57,0,0,64,0,0,48,60,43,72,0,0];
var BB_SEEDS=[
  [1,0,0,0,1,0,0,0],[0,0,0,0,0,0,1,0],[1,0,0,0,0,0,0,0],[0,0,1,0,0,0,1,0],
  [0,0,1,0,0,0,1,0],[0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1],[0,0,0,0,0,0,1,0],
  [1,0,1,0,1,0,1,0],[0,1,0,0,0,1,0,1],[0,0,0,1,0,0,0,0],[0,1,0,0,0,0,1,0],
  [1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0],[1,0,0,1,0,0,0,0],[0,0,0,1,0,0,0,0],
  [0,1,0,1,0,1,0,1],[0,0,0,0,0,0,0,0]
];
var _PENT=[0,3,5,7,10,12,15,17,19,22,24];
function bbBuildTracks(){
  _bbTracks=[];
  /* [IK] tracks in the canonical order of the Fauna; each Mask keeps its own voice */
  var CANON=['Unkle Maukie','dogXim','C7H5N3O6','Naphta',"Ts'ui Pên",'Honey Buzzard','Hátra Lövés','Croisière Noire','Aube','Silent Pact','Maiden Call','Plague of Justinian','Poisoned Well','Cadaver Synod','Truce','Auvergne','Grand Colonel','Malika'];
  var key=function(n){return String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();};
  var ord=[];if(typeof FAUNA!=='undefined'){CANON.forEach(function(nm){for(var q=0;q<FAUNA.length;q++)if(key(FAUNA[q].name)===key(nm)){ord.push(q);break;}});}
  if(ord.length!==18){ord=[];for(var q2=0;q2<18;q2++)ord.push(q2);}
  for(var j=0;j<18;j++){
    var i=ord[j];
    var m=(typeof FAUNA!=='undefined'&&FAUNA[i])?FAUNA[i]:null;
    _bbTracks.push({
      name:m?m.name:'MASK '+(i+1),
      color:m?(m.c||'#c9a84c'):'#c9a84c',
      voice:BB_VOICES[i]||'rim',
      root:BB_ROOTS[i]||45,
      steps:BB_SEEDS[i].slice(),
      pitch:null,deg:0
    });
  }
}
function bbPitched(v){return v==='sub'||v==='bass'||v==='bass2'||v==='tom'||v==='bell'||v==='pluck'||v==='pad'||v==='stab'||v==='lead';}
function bbDicePitches(tr){
  if(!bbPitched(tr.voice)){tr.pitch=null;return;}
  tr.pitch=[];
  var d=tr.deg||0;
  for(var s=0;s<8;s++){
    d=Math.max(0,Math.min(_PENT.length-1,d+Math.floor(Math.random()*5)-2));
    tr.pitch.push(tr.root+_PENT[d]);
  }
  tr.deg=d;
}

// -- synthesis engine v2: one voice per Mask, soft and musical, context-agnostic --
// (the very same bbVoice renders live AND into the OfflineAudioContext of Kave)
function bbNoise(ac){
  if(!ac.__ikNoise){
    var b=ac.createBuffer(1,ac.sampleRate,ac.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    ac.__ikNoise=b;
  }
  return ac.__ikNoise;
}
function bbOut(ac){
  if(!ac.__ikBus){
    var c=ac.createDynamicsCompressor();
    c.threshold.value=-20;c.knee.value=18;c.ratio.value=4;c.attack.value=.004;c.release.value=.24;
    c.connect(ac.destination);
    ac.__ikBus=c;
  }
  return ac.__ikBus;
}
function bbFreq(m){return 440*Math.pow(2,(m-69)/12);}
function bbVoice(ac,vi,time){
  var tr=_bbTracks[vi],v=tr.voice,out=bbOut(ac);
  var midi=tr.pitch?tr.pitch[_bbStep%8]:tr.root,f=bbFreq(midi);
  var g=ac.createGain();g.connect(out);
  function env(peak,att,dec){
    g.gain.setValueAtTime(0,time);
    g.gain.linearRampToValueAtTime(peak,time+att);
    g.gain.exponentialRampToValueAtTime(.0008,time+att+dec);
  }
  function osc(type,freq,dest){
    var o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,time);
    o.connect(dest||g);o.start(time);return o;
  }
  function filt(type,fr,q){
    var fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=fr;if(q)fl.Q.value=q;
    fl.connect(g);return fl;
  }
  function nz(){var s=ac.createBufferSource();s.buffer=bbNoise(ac);s.loop=true;return s;}
  switch(v){
    case 'kick':{var o=osc('sine',115);o.frequency.exponentialRampToValueAtTime(36,time+.12);env(.9,.002,.3);o.stop(time+.32);break;}
    case 'kick2':{var o2=osc('sine',88);o2.frequency.exponentialRampToValueAtTime(30,time+.16);env(.72,.002,.4);o2.stop(time+.42);break;}
    case 'sub':{var o3=osc('sine',f);env(.5,.012,.55);o3.stop(time+.58);break;}
    case 'bass':{var lp=filt('lowpass',750,1);var o4=osc('triangle',f,lp);env(.55,.008,.4);o4.stop(time+.45);break;}
    case 'snare':{
      var nt=ac.createOscillator();nt.type='sine';nt.frequency.setValueAtTime(196,time);
      var ng=ac.createGain();ng.gain.setValueAtTime(.26,time);ng.gain.exponentialRampToValueAtTime(.0008,time+.09);
      nt.connect(ng);ng.connect(out);nt.start(time);nt.stop(time+.1);
      var bp=filt('bandpass',1900,.9);var ns=nz();ns.connect(bp);env(.4,.001,.18);ns.start(time);ns.stop(time+.2);break;}
    case 'tom':{var o5=osc('sine',f);o5.frequency.exponentialRampToValueAtTime(f*.45,time+.2);env(.5,.002,.24);o5.stop(time+.26);break;}
    case 'bell':{
      var o6=osc('sine',f);env(.2,.004,1.1);o6.stop(time+1.15);
      var g7=ac.createGain();g7.gain.setValueAtTime(0,time);g7.gain.linearRampToValueAtTime(.07,time+.004);
      g7.gain.exponentialRampToValueAtTime(.0008,time+.55);g7.connect(out);
      var o7=osc('sine',f*2.756,g7);o7.stop(time+.6);break;}
    case 'clap':{
      for(var ci=0;ci<3;ci++)(function(ct){
        var s=ac.createBufferSource();s.buffer=bbNoise(ac);s.loop=true;
        var bp2=ac.createBiquadFilter();bp2.type='bandpass';bp2.frequency.value=1150;bp2.Q.value=1;
        var cg=ac.createGain();cg.gain.setValueAtTime(0,ct);cg.gain.linearRampToValueAtTime(.38,ct+.002);
        cg.gain.exponentialRampToValueAtTime(.0008,ct+.09);
        s.connect(bp2);bp2.connect(cg);cg.connect(out);s.start(ct);s.stop(ct+.1);
      })(time+ci*.014);break;}
    case 'hat':{var hp=filt('highpass',7500);var ns2=nz();ns2.connect(hp);env(.24,.001,.05);ns2.start(time);ns2.stop(time+.06);break;}
    case 'rim':{var o8=osc('square',1100);env(.14,.001,.035);o8.stop(time+.04);break;}
    case 'conga':{var o9=osc('sine',330);o9.frequency.exponentialRampToValueAtTime(185,time+.13);env(.36,.002,.16);o9.stop(time+.18);break;}
    case 'pad':{
      var lp2=filt('lowpass',800,1);
      var pa=osc('sawtooth',f,lp2);pa.detune.value=-6;
      var pb=osc('sawtooth',f,lp2);pb.detune.value=6;
      g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(.1,time+.3);
      g.gain.setValueAtTime(.1,time+1.6);g.gain.linearRampToValueAtTime(0,time+2.5);
      pa.stop(time+2.6);pb.stop(time+2.6);break;}
    case 'stab':{
      var lp3=ac.createBiquadFilter();lp3.type='lowpass';lp3.frequency.value=1500;lp3.Q.value=1;lp3.connect(g);
      [0,7,12].forEach(function(iv){var o10=ac.createOscillator();o10.type='sawtooth';o10.frequency.setValueAtTime(bbFreq(midi+iv),time);o10.connect(lp3);o10.start(time);o10.stop(time+.24);});
      env(.13,.004,.2);break;}
    case 'bass2':{var lp4=filt('lowpass',520,1);var o11=osc('square',f,lp4);env(.3,.006,.32);o11.stop(time+.36);break;}
    case 'lead':{
      var o12=osc('triangle',f);var o13=osc('triangle',f);o13.detune.value=5;
      env(.2,.005,.3);o12.stop(time+.33);o13.stop(time+.33);break;}
    case 'shaker':{var bp3=filt('bandpass',5800,1.4);var ns3=nz();ns3.connect(bp3);env(.17,.002,.06);ns3.start(time);ns3.stop(time+.08);break;}
    case 'zap':{var lp5=filt('lowpass',900,1);var o14=osc('sawtooth',f*2,lp5);o14.frequency.exponentialRampToValueAtTime(f*.22,time+.18);env(.14,.003,.2);o14.stop(time+.22);break;}
  }
}

function bbTick(){
  if(!_bbPlaying||!_bbAC||_bbAC.state==='suspended')return;
  var now=_bbAC.currentTime+.02;
  _bbTracks.forEach(function(tr,ti){
    if(tr.steps[_bbStep])bbVoice(_bbAC,ti,now);
  });
  bbRenderStep(_bbStep);
  _bbStep=(_bbStep+1)%8;
  _bbSeqTimer=setTimeout(bbTick,60000/(_bbBPM*2));
}

function bbStop(){
  _bbPlaying=false;
  if(_bbSeqTimer){clearTimeout(_bbSeqTimer);_bbSeqTimer=null;}
  _bbStep=0;
}

function bbPlay(){
  if(!_bbAC)try{_bbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(_e){}
  if(_bbAC&&_bbAC.state==='suspended')_bbAC.resume();
  _bbPlaying=true;
  bbTick();
}

function bbToggleStep(track,step){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(!_bbTracks||!_bbTracks[track])return;
  var tr=_bbTracks[track];
  tr.steps[step]=tr.steps[step]?0:1;
  bbRender();
  // instant feedback: hear the step as soon as it is armed
  if(tr.steps[step]){
    if(!_bbAC){try{_bbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(_e){}}
    if(_bbAC){
      if(_bbAC.state==='suspended')_bbAC.resume();
      var keep=_bbStep;_bbStep=step;bbVoice(_bbAC,track,_bbAC.currentTime+.01);_bbStep=keep;
    }
  }
}
window.bbToggleStep=bbToggleStep;

function bbTogglePlay(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(_bbPlaying){
    bbStop();bbRenderStep(-1);
    var btn=document.getElementById('bb-play-btn');
    if(btn)btn.textContent='PLAY';
  } else {
    bbPlay();
    var btn2=document.getElementById('bb-play-btn');
    if(btn2)btn2.textContent='STOP';
  }
}
window.bbTogglePlay=bbTogglePlay;

function bbSetBPM(val){
  _bbBPM=Math.max(60,Math.min(180,parseInt(val)||90));
  var lbl=document.getElementById('bb-bpm-lbl');
  if(lbl)lbl.textContent=_bbBPM+' BPM';
}
window.bbSetBPM=bbSetBPM;

function bbRenderStep(cur){
  if(!_bbTracks)return;
  var rows=document.querySelectorAll('.bb-row');
  rows.forEach(function(row,ti){
    var cells=row.querySelectorAll('.bb-step');
    cells.forEach(function(cell,si){
      cell.classList.toggle('bb-active',!!_bbTracks[ti].steps[si]);
      cell.classList.toggle('bb-cursor',si===cur);
    });
  });
}

function bbRender(){
  var grid=document.getElementById('bb-grid');
  if(!grid)return;
  if(!_bbTracks)bbBuildTracks();
  var h='';
  _bbTracks.forEach(function(tr,ti){
    h+='<div class="bb-row">';
    h+='<div class="bb-label" style="color:'+tr.color+'">'+tr.name+'</div>';
    for(var s=0;s<8;s++){
      h+='<div class="bb-step'+(tr.steps[s]?' bb-active':'')+'" style="--mk:'+tr.color+'" data-action="bbToggleStep('+ti+','+s+')"></div>';
    }
    h+='</div>';
  });
  grid.innerHTML=h;
}


function bbKave(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(!_bbTracks)bbBuildTracks();
  var SR=44100;
  var stepDur=60/(_bbBPM*2); // duree d'un step (croches)
  var totalDur=stepDur*8+2.6; // + queue (pad, cloche)
  var offCtx=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,Math.ceil(SR*totalDur),SR);
  bbOut(offCtx);bbNoise(offCtx);
  for(var t=0;t<8;t++){
    for(var i=0;i<_bbTracks.length;i++){
      if(!_bbTracks[i].steps[t])continue;
      var keep=_bbStep;_bbStep=t;
      bbVoice(offCtx,i,t*stepDur+.05);
      _bbStep=keep;
    }
  }
  offCtx.startRendering().then(function(rendered){
    var ch=rendered.getChannelData(0);
    // Encode WAV PCM 16-bit mono
    var numSamples=ch.length;
    var buf=new ArrayBuffer(44+numSamples*2);
    var view=new DataView(buf);
    function str(off,s){for(var i=0;i<s.length;i++)view.setUint8(off+i,s.charCodeAt(i));}
    function u32(off,v){view.setUint32(off,v,true);}
    function u16(off,v){view.setUint16(off,v,true);}
    str(0,'RIFF');u32(4,36+numSamples*2);str(8,'WAVE');
    str(12,'fmt ');u32(16,16);u16(20,1);u16(22,1);
    u32(24,SR);u32(28,SR*2);u16(32,2);u16(34,16);
    str(36,'data');u32(40,numSamples*2);
    var off=44;
    for(var i=0;i<numSamples;i++){
      var s2=Math.max(-1,Math.min(1,ch[i]));
      view.setInt16(off,s2<0?s2*32768:s2*32767,true);
      off+=2;
    }
    var blob=new Blob([buf],{type:'audio/wav'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download=window.ikName?ikName('sampler','wav'):'katabatik.wav';
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},1000);
  }).catch(function(e){console.warn('bbKave render error',e);});
}
window.bbKave=bbKave;

function bbRefresh(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(!_bbTracks)bbBuildTracks();
  _bbTracks.forEach(function(tr){
    var v=tr.voice;
    if(v==='kick'||v==='kick2'){
      tr.steps=[1,0,0,0,0,0,0,0];
      if(Math.random()<.85)tr.steps[4]=1;
      if(Math.random()<.4)tr.steps[6]=1;
      if(Math.random()<.25)tr.steps[3]=1;
    } else if(v==='snare'||v==='clap'){
      tr.steps=[0,0,1,0,0,0,1,0];
      if(Math.random()<.3)tr.steps[7]=1;
    } else if(v==='hat'||v==='shaker'){
      tr.steps=[0,0,0,0,0,0,0,0];
      var mode=Math.floor(Math.random()*3);
      for(var s=0;s<8;s++)tr.steps[s]=(mode===0)?1:(mode===1?(s%2===0?1:0):(s%2===1?1:0));
    } else if(v==='rim'||v==='zap'){
      tr.steps=[0,0,0,0,0,0,0,0];
      if(Math.random()<.5)tr.steps[Math.floor(Math.random()*8)]=1;
    } else if(v==='sub'||v==='pad'){
      tr.steps=[1,0,0,0,0,0,0,0];
    } else {
      tr.steps=[0,0,0,0,0,0,0,0];
      var n=1+Math.floor(Math.random()*3);
      for(var k=0;k<n;k++)tr.steps[Math.floor(Math.random()*8)]=1;
      if(!tr.steps[0]&&Math.random()<.4)tr.steps[0]=1;
    }
    bbDicePitches(tr);
  });
  bbRender();
}
window.bbRefresh=bbRefresh;

function bbBakuBoom(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  bbStop();
  var _tt=document.getElementById('title');
  if(_tt)_tt.style.visibility='';
  if(_bbCtxMode==='kk'){
    // Injecter message Kerema dans kk-feed
    var feed=document.getElementById('kk-feed');
    if(feed&&typeof KK_HDR!=='undefined'&&typeof kkKBody!=='undefined'){
      // Aleatoire : Stay tuned. ou motto Unkle Maukie
      var ec=document.createElement('div');ec.className='kk-kerema';
      ec.innerHTML=KK_HDR+kkKBody('U gotta stay TUNEd...');
      feed.appendChild(ec);feed.scrollTop=feed.scrollHeight;
    }
    if(typeof _bakuGlitch==='function'){
      _bakuGlitch(function(){
        var panel=document.getElementById('bb-panel');
        if(panel)panel.style.display='none';
        if(typeof kkSynth==='function')kkSynth();
      });
    }
  } else {
    if(typeof _bakuGlitch==='function'){
      _bakuGlitch(function(){
        var panel=document.getElementById('bb-panel');
        if(panel)panel.style.display='none';
        if(typeof bakuBoomToChessMenu==='function') bakuBoomToChessMenu();
      });
    }
  }
}
window.bbBakuBoom=bbBakuBoom;

function bbInit(ctxMode){
  _bbCtxMode=ctxMode||'chess';
  _bbStep=0;
  _bbBPM=90;
  _bbPlaying=false;
  if(_bbSeqTimer){clearTimeout(_bbSeqTimer);_bbSeqTimer=null;}
  // Motifs curés de départ (musicaux), hauteurs pentatoniques tirées
  if(!_bbTracks)bbBuildTracks();
  _bbTracks.forEach(function(tr,i){
    tr.steps=BB_SEEDS[i].slice();
    tr.deg=0;
    bbDicePitches(tr);
  });
  bbRender();
  // Motto du Mask courant
  var mottoEl=document.getElementById('bb-motto');
  if(mottoEl){
    var _bbMask=null,_bbMotto='',_bbColor='#c9a84c';
    try{
      if(typeof FAUNA!=='undefined'&&FAUNA.length){
        _bbMask=FAUNA[Math.floor(Math.random()*FAUNA.length)];
        var _bbFP=(typeof FP!=='undefined'&&FP[_bbMask.name])?FP[_bbMask.name]:{};
        _bbMotto=_bbFP.motto||_bbMask.motto||'';
        _bbColor=_bbMask.c||'#c9a84c';
      }
    }catch(_e){}
    mottoEl.textContent=_bbMotto;
    mottoEl.style.color=_bbColor;
    // Voix du Mask
    if(_bbMotto&&typeof speakMotto==='function') speakMotto(_bbMotto);
  }
  var lbl=document.getElementById('bb-bpm-lbl');
  if(lbl)lbl.textContent=_bbBPM+' BPM';
  var btn=document.getElementById('bb-play-btn');
  if(btn)btn.textContent='PLAY';
}

// ============================================================
// CONNECT 4 -- triggered by Mask button in Fauna Chess
// ============================================================
var C4 = null;



function bakuBoomToChessMenu(){
  var feed=document.getElementById('kk-feed');
  if(feed&&typeof KK_HDR!=='undefined'){
    var el=document.createElement('div');el.className='kk-kerema';
    el.innerHTML=KK_HDR+'<span class="kk-kerema-body">(Dante was a Krew, btw.)</span>';
    feed.appendChild(el);feed.scrollTop=feed.scrollHeight;
  }
  _bakuGlitch(function(){
    ['c4-panel','bb-panel','hang-panel','mm-panel','og-panel'].forEach(function(id){
      var p=document.getElementById(id);if(p)p.style.display='none';
    });
    if(typeof OG!=='undefined'&&OG){try{OG.cleanup();}catch(_e){}OG=null;}
    var sel=document.getElementById('chess-sel');
    if(sel)sel.style.display='flex';
    chInGame=false;
    var _tt=document.getElementById('title');
    if(_tt)_tt.style.visibility='';
  });
}
window.bakuBoomToChessMenu=bakuBoomToChessMenu;

function bakuBoomToSynth(won){
  _bakuGlitch(function(){
    ['c4-panel','bb-panel','hang-panel','mm-panel','og-panel'].forEach(function(id){
      var p=document.getElementById(id);if(p)p.style.display='none';
    });
    if(typeof OG!=='undefined'&&OG){try{OG.cleanup();}catch(_e){}OG=null;}
    // Message Kerema sur fond noir
    var wm="U think u won? C'mon. Be serious. Sculpt the tale by urself \u2014 and make The Fauna fuckin\u2019 proud.";
    var lm="Oh, u lost. Pack ur tale by urself, honey bunny.";
    var msg=document.createElement('div');
    msg.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:32px;background:rgba(0,0,0,0.92);';
    msg.innerHTML='<div style="font-family:\'DM Mono\',monospace;font-size:13px;line-height:1.7;color:rgba(201,168,76,0.85);text-align:center;max-width:320px;letter-spacing:.04em;">'+(won?wm:lm)+'</div>';
    document.body.appendChild(msg);
    setTimeout(function(){
      msg.style.transition='opacity 0.6s';
      msg.style.opacity='0';
      setTimeout(function(){
        if(msg.parentNode)msg.parentNode.removeChild(msg);
        if(typeof kkSynth==='function')kkSynth();
      },600);
    },2800);
  });
}
window.bakuBoomToSynth=bakuBoomToSynth;

function branobelBoom(panelId,cb){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  var panel=document.getElementById(panelId);
  if(!panel){if(cb)cb();return;}
  var flash=document.createElement('div');
  flash.style.cssText='position:fixed;inset:0;z-index:99999;background:#fff;pointer-events:none;opacity:0;transition:opacity .05s;';
  document.body.appendChild(flash);
  setTimeout(function(){flash.style.opacity='1';},10);
  var shakes=0,shakeIv=setInterval(function(){
    var dx=(Math.random()-0.5)*18,dy=(Math.random()-0.5)*18;
    panel.style.transform='translate('+dx+'px,'+dy+'px)';
    flash.style.opacity=(Math.random()*0.7).toFixed(2);
    shakes++;
    if(shakes>22){
      clearInterval(shakeIv);panel.style.transform='';
      flash.style.background='#000';flash.style.transition='opacity 0.6s';flash.style.opacity='1';
      setTimeout(function(){
        panel.style.display='none';flash.style.opacity='0';
        setTimeout(function(){if(flash.parentNode)flash.parentNode.removeChild(flash);if(cb)cb();},600);
      },300);
    }
  },60);
}
window.branobelBoom=branobelBoom;






function chRandomMask(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  c4Open('chess');
}
window.chRandomMask=chRandomMask;
// BakuBoom depuis Katabasis pre-synth: rappeler kkSynth apres
var _kkBakuBoom_orig=null;
function kkBakuBoom(panelId){
  branobelBoom(panelId,function(){
    if(typeof kkSynth==='function')kkSynth();
  });
}
window.kkBakuBoom=kkBakuBoom;


function c4Refresh(){
  if(typeof kkClick==='function') try{kkClick();}catch(_e){}
  c4Init();
}
window.c4Open=c4Open;
window.c4Close=c4Close;
window.c4Refresh=c4Refresh;

// C4 contexte : 'chess' -> retour menu Chess, 'kk' -> synthese
var _c4Ctx='chess';
function c4Open(ctx){
  _c4Ctx=ctx||'chess';
  var p=document.getElementById('c4-panel');
  if(p)p.style.display='flex';
  var _tt=document.getElementById('title');
  if(_tt)_tt.style.visibility='hidden';
  c4Init();
}
function c4Close(){
  if(typeof C4!=='undefined'&&C4&&C4.raf){cancelAnimationFrame(C4.raf);C4=null;}
  var p=document.getElementById('c4-panel');if(p)p.style.display='none';
}
window.c4Open=c4Open;window.c4Close=c4Close;

function c4Init(){
  var canvas=document.getElementById('c4-canvas');
  if(!canvas) return;
  var COLS=7,ROWS=6;
  var W=Math.min(window.innerWidth-32,440);
  var CW=Math.floor(W/COLS);
  var H=CW*(ROWS+1);
  canvas.width=W; canvas.height=H;
  canvas.style.width=W+'px'; canvas.style.height=H+'px';

  // Pick two random Mask colors
  var col1='#c9a84c', col2='#d32f2f';
  if(typeof FAUNA!=='undefined'&&FAUNA.length>=2){
    var _c4Name1='Player',_c4Name2='Mask';
  var picks=[];
    while(picks.length<2){
      var r=Math.floor(Math.random()*FAUNA.length);
      if(picks.indexOf(r)<0) picks.push(r);
    }
    col1=FAUNA[picks[0]].c||col1;
    col2=FAUNA[picks[1]].c||col2;
    _c4Name1=FAUNA[picks[0]].name||'Player';
    _c4Name2=FAUNA[picks[1]].name||'Mask';
  }

  var grid=[];
  for(var r=0;r<ROWS;r++){grid.push([]);for(var c=0;c<COLS;c++)grid[r].push(0);}

  // Difficulty pick: shown until a level is clicked, then the board starts.
  var levelNames=['Beginner','Intermediate','Expert'];
  var levelDepths=[1,4,7];
  var levelIndex=1; // default: Intermediate

  var state={
    grid:grid,COLS:COLS,ROWS:ROWS,CW:CW,W:W,H:H,
    turn:1, over:false, winner:0,
    col1:col1, col2:col2,
    name1:_c4Name1, name2:_c4Name2,
    hover:-1, dropping:null, winLine:null,
    levelIndex:levelIndex, levelDepths:levelDepths, levelNames:levelNames,
    levelPicked:false
  };

  function hexToRgb(hex){
    hex=(hex||'#c9a84c').replace('#','');
    if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return{r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16)};
  }

  var ctx=canvas.getContext('2d');

  function draw(){
    ctx.fillStyle='#050302';
    ctx.fillRect(0,0,W,H);

    // Top row: drop indicator
    if(!state.over&&state.hover>=0){
      var dc=state.turn===1?col1:col2;
      var rgb=hexToRgb(dc);
      ctx.beginPath();
      ctx.arc(state.hover*CW+CW/2,CW/2,CW*0.36,0,Math.PI*2);
      ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.5)';
      ctx.fill();
    }

    // Board background
    ctx.fillStyle='rgba(201,168,76,0.08)';
    ctx.beginPath();
    ctx.roundRect(0,CW,W,CW*ROWS,6);
    ctx.fill();

    // Cells
    for(var r=0;r<ROWS;r++){
      for(var c=0;c<COLS;c++){
        var val=state.grid[r][c];
        var cx=c*CW+CW/2, cy=(r+1)*CW+CW/2;
        var rad=CW*0.38;

        // Hole background
        ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);
        ctx.fillStyle='rgba(0,0,0,0.55)';
        ctx.fill();

        if(val!==0){
          var col=val===1?col1:col2;
          var rgb2=hexToRgb(col);
          // Glow for win line
          var onWin=false;
          if(state.winLine){
            for(var wi=0;wi<state.winLine.length;wi++){
              if(state.winLine[wi][0]===r&&state.winLine[wi][1]===c){onWin=true;break;}
            }
          }
          var grd=ctx.createRadialGradient(cx-rad*0.2,cy-rad*0.2,rad*0.05,cx,cy,rad);
          var alpha=onWin?1:0.9;
          grd.addColorStop(0,'rgba('+Math.min(255,rgb2.r+60)+','+Math.min(255,rgb2.g+60)+','+Math.min(255,rgb2.b+60)+','+alpha+')');
          grd.addColorStop(1,'rgba('+rgb2.r+','+rgb2.g+','+rgb2.b+','+alpha+')');
          ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);
          ctx.fillStyle=grd;
          ctx.fill();
          if(onWin){
            ctx.shadowColor=col;ctx.shadowBlur=16;
            ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);
            ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
            ctx.shadowBlur=0;
          }
        }

        // Cell border
        ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);
        ctx.strokeStyle='rgba(201,168,76,0.12)';ctx.lineWidth=0.5;ctx.stroke();
      }
    }

    if(state.dropping){
      var dcl=state.dropping.p===1?col1:col2,drg=hexToRgb(dcl),fx=state.dropping.c*CW+CW/2,fy=state.dropping.y,frad=CW*0.38;
      var fg=ctx.createRadialGradient(fx-frad*0.2,fy-frad*0.2,frad*0.05,fx,fy,frad);
      fg.addColorStop(0,'rgba('+Math.min(255,drg.r+60)+','+Math.min(255,drg.g+60)+','+Math.min(255,drg.b+60)+',.95)');fg.addColorStop(1,'rgba('+drg.r+','+drg.g+','+drg.b+',.95)');
      ctx.beginPath();ctx.arc(fx,fy,frad,0,Math.PI*2);ctx.fillStyle=fg;ctx.fill();
    }
    // Level picker (before the first move of a fresh board)
    if(!state.levelPicked&&state.turn===1&&!state.over){
      var ln=function(s){if(window.KGI18N){var _t=window.KGI18N.t(s);return _t&&_t!==s?_t:s;}return s;};
      ctx.textAlign='center';
      ctx.font='bold '+Math.round(CW*0.42)+'px "Bebas Neue",sans-serif';
      ctx.fillStyle='rgba(201,168,76,.85)';
      ctx.fillText(ln('KATABATIK'),W/2,CW*0.5);
      ctx.font=Math.round(CW*0.26)+'px "DM Mono",monospace';
      ctx.fillStyle='rgba(201,168,76,.55)';
      var _li=state.hover>=0?(state.hover<2?0:(state.hover<5?1:2)):state.levelIndex;
      ctx.fillText(ln(state.levelNames[_li]),W/2,CW*0.78);
      ctx.textAlign='left';
    }

    // Status
    ctx.textAlign='center';
    if(state.over){
      if(state.winner){
        var wc=state.winner===1?col1:col2;
        var wrgb=hexToRgb(wc);
        ctx.font='bold '+Math.round(CW*0.55)+'px "Bebas Neue",sans-serif';
        ctx.fillStyle='rgba('+wrgb.r+','+wrgb.g+','+wrgb.b+',0.9)';
        ctx.fillText(state.winner===1?state.name1.toUpperCase()+' WINS':state.name2.toUpperCase()+' WINS',W/2,CW*0.72);
      } else {
        ctx.font='bold '+Math.round(CW*0.5)+'px "Bebas Neue",sans-serif';
        ctx.fillStyle='rgba(201,168,76,0.7)';
        ctx.fillText('DRAW',W/2,CW*0.72);
      }
    } else if(state.levelPicked||state.turn!==1){
      ctx.font=Math.round(CW*0.3)+'px "DM Mono",monospace';
      ctx.fillStyle='rgba(201,168,76,0.35)';
      var turnLine=state.turn===1?'your turn':'thinking\u2026';
      if(window.KGI18N){var _tr=window.KGI18N.t(turnLine);if(_tr&&_tr!==turnLine)turnLine=_tr;}
      ctx.fillText(turnLine,W/2,CW*0.72);
    }
    ctx.textAlign='left';
  }

  function drop(col){
    if(state.over||state.turn!==1) return;
    // Level strip: the top area picks the difficulty until the game starts.
    // Three labels over seven columns: 0-1 Beginner, 2-4 Intermediate, 5-6 Expert.
    if(!state.levelPicked){
      state.levelIndex=col<2?0:(col<5?1:2);
      state.levelPicked=true;
      draw();
      return;
    }
    if(state.dropping)return;
    for(var r=ROWS-1;r>=0;r--){
      if(state.grid[r][col]===0){
        fall(col,r,1,function(){
        state.grid[r][col]=1;
        var win=checkWin(state.grid,r,col,1);
        if(win){state.over=true;state.winner=1;state.winLine=win;draw();if(window.KG&&KG.win)KG.win('katabatik',{game:'c4'});return;}
        if(isFull()){state.over=true;draw();return;}
        state.turn=2;draw();
        setTimeout(aiMove,420);
        });
        return;
      }
    }
  }
  /* a disc falls down its column, bounces, settles — then the move counts */
  function fall(col,row,p,done){
    var y=CW/2,ty=(row+1)*CW+CW/2,vy=0,hit=0,last=performance.now();
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){kbSfx('clack',.6);done();return;}
    state.dropping={c:col,y:y,p:p};
    (function step(now){
      var dt=Math.min(.033,(now-last)/1000);last=now;
      vy+=CW*38*dt;y+=vy*dt;
      if(y>=ty){y=ty;if(hit===0){kbSfx('clack',Math.min(1,.45+row*.1));vy=-vy*.28;hit=1;}else if(hit===1&&Math.abs(vy)>CW*.6){kbSfx('clack',.25);vy=-vy*.25;hit=2;}else{state.dropping=null;draw();done();return;}}
      state.dropping.y=y;draw();requestAnimationFrame(step);
    })(last);
  }

  function aiMove(){
    if(state.over) return;
    var best=pickBest();
    if(best<0) return;
    for(var r=ROWS-1;r>=0;r--){
      if(state.grid[r][best]===0){
        (function(r){fall(best,r,2,function(){
        state.grid[r][best]=2;
        var win=checkWin(state.grid,r,best,2);
        if(win){state.over=true;state.winner=2;state.winLine=win;draw();return;}
        if(isFull()){state.over=true;draw();return;}
        state.turn=1;draw();
        });})(r);
        return;
      }
    }
  }

function scoreWindow(a,b,c,d,p){
    var cnt=0,empty=0,opp=0;
    [a,b,c,d].forEach(function(v){if(v===p)cnt++;else if(v===0)empty++;else opp++;});
    if(opp>0)return 0;
    if(cnt===4)return 1000;
    if(cnt===3&&empty===1)return 5;
    if(cnt===2&&empty===2)return 2;
    return 0;
  }
  function evalGrid(g,p){
    var score=0,op=p===1?2:1;
    var COL=COLS,ROW=ROWS;
    // Centre
    for(var r=0;r<ROW;r++)if(g[r][Math.floor(COL/2)]===p)score+=3;
    // Horizontal
    for(var r2=0;r2<ROW;r2++)for(var c2=0;c2<COL-3;c2++){
      var w=[g[r2][c2],g[r2][c2+1],g[r2][c2+2],g[r2][c2+3]];
      score+=scoreWindow(w[0],w[1],w[2],w[3],p);
      score-=scoreWindow(w[0],w[1],w[2],w[3],op);
    }
    // Vertical
    for(var r3=0;r3<ROW-3;r3++)for(var c3=0;c3<COL;c3++){
      var w2=[g[r3][c3],g[r3+1][c3],g[r3+2][c3],g[r3+3][c3]];
      score+=scoreWindow(w2[0],w2[1],w2[2],w2[3],p);
      score-=scoreWindow(w2[0],w2[1],w2[2],w2[3],op);
    }
    // Diag
    for(var r4=0;r4<ROW-3;r4++)for(var c4=0;c4<COL-3;c4++){
      var w3=[g[r4][c4],g[r4+1][c4+1],g[r4+2][c4+2],g[r4+3][c4+3]];
      score+=scoreWindow(w3[0],w3[1],w3[2],w3[3],p);
      score-=scoreWindow(w3[0],w3[1],w3[2],w3[3],op);
    }
    for(var r5=3;r5<ROW;r5++)for(var c5=0;c5<COL-3;c5++){
      var w4=[g[r5][c5],g[r5-1][c5+1],g[r5-2][c5+2],g[r5-3][c5+3]];
      score+=scoreWindow(w4[0],w4[1],w4[2],w4[3],p);
      score-=scoreWindow(w4[0],w4[1],w4[2],w4[3],op);
    }
    return score;
  }
  function mmCopy(g){return g.map(function(row){return row.slice();});}
  function mmDrop(g,col,p){
    for(var r=ROWS-1;r>=0;r--)if(g[r][col]===0){g[r][col]=p;return r;}
    return -1;
  }
  function mmWin(g,r,c,p){return checkWin(g,r,c,p);}
  function minimax(g,depth,alpha,beta,maximizing){
    // Terminal
    var validCols=[];
    for(var c=0;c<COLS;c++)if(g[0][c]===0)validCols.push(c);
    if(!validCols.length)return {score:0};
    if(depth===0)return {score:evalGrid(g,2)-evalGrid(g,1)};
    var order=[3,2,4,1,5,0,6];
    var cols=order.filter(function(c){return g[0][c]===0;});
    if(maximizing){
      var best2={score:-Infinity,col:cols[0]};
      for(var i=0;i<cols.length;i++){
        var col=cols[i];
        var gc=mmCopy(g);
        var row=mmDrop(gc,col,2);
        if(row>=0&&mmWin(gc,row,col,2)){if(depth>=1)return {score:100000,col:col};}
        var res=minimax(gc,depth-1,alpha,beta,false);
        if(res.score>best2.score){best2.score=res.score;best2.col=col;}
        alpha=Math.max(alpha,best2.score);
        if(alpha>=beta)break;
      }
      return best2;
    } else {
      var worst={score:Infinity,col:cols[0]};
      for(var i2=0;i2<cols.length;i2++){
        var col2=cols[i2];
        var gc2=mmCopy(g);
        var row2=mmDrop(gc2,col2,1);
        if(row2>=0&&mmWin(gc2,row2,col2,1)){if(depth>=1)return {score:-100000,col:col2};}
        var res2=minimax(gc2,depth-1,alpha,beta,true);
        if(res2.score<worst.score){worst.score=res2.score;worst.col=col2;}
        beta=Math.min(beta,worst.score);
        if(alpha>=beta)break;
      }
      return worst;
    }
  }
  function pickBest(){
    var depth=state.levelDepths[state.levelIndex]||4;
    var result=minimax(state.grid,depth,-Infinity,Infinity,true);
    return result.col>=0?result.col:-1;
  }

  function topRow(col){
    for(var r=ROWS-1;r>=0;r--){if(state.grid[r][col]===0)return r;}
    return -1;
  }

  function isFull(){
    for(var c=0;c<COLS;c++)if(topRow(c)>=0)return false;
    return true;
  }

  function checkWin(g,r,c,p){
    var dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(var d=0;d<dirs.length;d++){
      var dr=dirs[d][0],dc=dirs[d][1],line=[[r,c]];
      for(var s=1;s<4;s++){var nr=r+dr*s,nc=c+dc*s;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&g[nr][nc]===p)line.push([nr,nc]);else break;}
      for(var s2=1;s2<4;s2++){var nr2=r-dr*s2,nc2=c-dc*s2;if(nr2>=0&&nr2<ROWS&&nc2>=0&&nc2<COLS&&g[nr2][nc2]===p)line.push([nr2,nc2]);else break;}
      if(line.length>=4)return line;
    }
    return null;
  }

  // Input
  function getCol(clientX){
    var rect=canvas.getBoundingClientRect();
    var x=(clientX-rect.left)*(W/rect.width);
    return Math.floor(x/CW);
  }

  function onClick(e){
    if(typeof kkClick==='function') try{kkClick();}catch(_ce){}
    if(state.over){
      if(state.winner!==0){
        var won=(state.winner===1);
        setTimeout(function(){
          if(typeof _c4Ctx!=='undefined'&&_c4Ctx==='kk') bakuBoomToSynth(won);
          else bakuBoomToChessMenu();
        },1800);
      } else { kbSfx('rattle'); c4Init(); }
      return;
    }
    var col=getCol(e.clientX||e.touches[0].clientX);
    if(col>=0&&col<COLS) drop(col);
  }

  function onMove(e){
    var col=getCol(e.clientX||(e.touches&&e.touches[0]?e.touches[0].clientX:-999));
    state.hover=(col>=0&&col<COLS)?col:-1;
    if(!state.over) draw();
  }

  canvas.addEventListener('click',onClick);
  canvas.addEventListener('touchend',function(e){e.preventDefault();onClick(e.changedTouches[0]||e);},{passive:false});
  canvas.addEventListener('mousemove',onMove);
  canvas.addEventListener('touchmove',function(e){onMove(e);e.preventDefault();},{passive:false});

  if(C4) C4=null;
  C4={canvas:canvas};
  draw();
}

// ============================================================
// HANGMAN HONGROIS -- présidé par Plague of Justinian.
// Mots réels uniquement (noms, adjectifs, verbes à l'infinitif),
// embarqués hors ligne ; clavier = alphabet hongrois.
// ============================================================
function kbT(s){if(window.KGI18N){var t=window.KGI18N.t(s);if(t&&t!==s)return t;}return s;}
var HANG_WORDS={
  noun:['kalap','kút','tenger','madár','könyv','hajó','város','erdő','kard','korona','hajnal','hold','szív','vér'],
  adj:['gyors','szép','hideg','meleg','hosszú','rövid','sötét','világos','nehéz','könnyű','vörös','zöld','kék','fekete'],
  verb:['futni','enni','inni','aludni','olvasni','írni','énekelni','táncolni','mosni','főzni','látni','beszélni','gondolkodni','vinni']
};
var HANG_KEYS='AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ';
/* the keys sit as on a Hungarian keyboard (QWERTZ: Ö Ü Ó on the number row, Ő Ú and É Á Ű on the right, Í before Y) */
var HANG_ROWS=['ÖÜÓ','QWERTZUIOPŐÚ','ASDFGHJKLÉÁŰ','ÍYXCVBNM'];
/* a win brings a few lines: József Attila's own stanzas (Tiszta szívvel, 1925), or one work of Tarr, Krasznahorkai, Ligeti or Lukács */
var HANG_JA=[['Nincsen apám, se anyám,','se istenem, se hazám,','se bölcsőm, se szemfedőm,','se csókom, se szeretőm.'],
 ['Harmadnapja nem eszek,','se sokat, se keveset.','Húsz esztendőm hatalom,','húsz esztendőm eladom.'],
 ['Hogyha nem kell senkinek,','hát az ördög veszi meg.','Tiszta szívvel betörök,','ha kell, embert is ölök.'],
 ['Elfognak és felkötnek,','áldott földdel befödnek','s halált hozó fű terem','gyönyörűszép szívemen.']];
var HANG_GIFT=[
 {who:'Tarr Béla',k:{en:'film',fr:'film'},w:[['Kárhozat',1988],['Sátántangó',1994],['Werckmeister harmóniák',2000],['A torinói ló',2011]]},
 {who:'Krasznahorkai László',k:{en:'novel',fr:'roman'},w:[['Sátántangó',1985],['Az ellenállás melankóliája',1989],['Háború és háború',1999],['Báró Wenckheim hazatér',2016]]},
 {who:'Ligeti György',k:{en:'music',fr:'musique'},w:[['Atmosphères',1961],['Lux aeterna',1966],['Lontano',1967],['Le Grand Macabre',1978]]},
 {who:'Lukács György',k:{en:'essay',fr:'essai'},w:[['A lélek és a formák',1910],['Die Theorie des Romans',1916],['Geschichte und Klassenbewusstsein',1923]]}];
function hangGift(){
  var g=document.getElementById('hang-gift');if(!g)return;
  var lg=(document.documentElement.lang||'en')==='fr'?'fr':'en',pick=Math.floor(Math.random()*5),esc=function(t){return String(t).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});};
  if(pick===0){var i=Math.floor(Math.random()*3),st=HANG_JA.slice(i,i+2);
    g.innerHTML=st.map(function(v){return '<p>'+v.map(esc).join('<br>')+'</p>';}).join('')+'<cite>József Attila — Tiszta szívvel (1925)</cite>';}
  else{var a=HANG_GIFT[pick-1],w=a.w[Math.floor(Math.random()*a.w.length)];
    g.innerHTML='<p class="hang-work"><i>'+esc(w[0])+'</i></p><cite>'+esc(a.who)+' — '+a.k[lg]+', '+w[1]+'</cite>';}
  g.style.display='block';
}
window.hangGift=hangGift;
var HANG_MAX=6;
/* sens des mots, révélé à la fin de la partie — FR puis EN */
var HANG_TR={
 kalap:{fr:'chapeau',en:'hat'},kút:{fr:'puits',en:'well'},tenger:{fr:'mer',en:'sea'},madár:{fr:'oiseau',en:'bird'},
 könyv:{fr:'livre',en:'book'},hajó:{fr:'bateau',en:'ship'},város:{fr:'ville',en:'city'},erdő:{fr:'forêt',en:'forest'},
 kard:{fr:'épée',en:'sword'},korona:{fr:'couronne',en:'crown'},hajnal:{fr:'aube',en:'dawn'},hold:{fr:'lune',en:'moon'},
 szív:{fr:'cœur',en:'heart'},vér:{fr:'sang',en:'blood'},
 gyors:{fr:'rapide',en:'fast'},szép:{fr:'beau',en:'beautiful'},hideg:{fr:'froid',en:'cold'},meleg:{fr:'chaud',en:'warm'},
 hosszú:{fr:'long',en:'long'},rövid:{fr:'court',en:'short'},sötét:{fr:'sombre',en:'dark'},világos:{fr:'clair',en:'bright'},
 nehéz:{fr:'lourd',en:'heavy'},könnyű:{fr:'léger',en:'light'},vörös:{fr:'rouge',en:'red'},zöld:{fr:'vert',en:'green'},
 kék:{fr:'bleu',en:'blue'},fekete:{fr:'noir',en:'black'},
 futni:{fr:'courir',en:'to run'},enni:{fr:'manger',en:'to eat'},inni:{fr:'boire',en:'to drink'},aludni:{fr:'dormir',en:'to sleep'},
 olvasni:{fr:'lire',en:'to read'},írni:{fr:'écrire',en:'to write'},énekelni:{fr:'chanter',en:'to sing'},táncolni:{fr:'danser',en:'to dance'},
 mosni:{fr:'laver',en:'to wash'},főzni:{fr:'cuisiner',en:'to cook'},látni:{fr:'voir',en:'to see'},beszélni:{fr:'parler',en:'to speak'},
 gondolkodni:{fr:'penser',en:'to think'},vinni:{fr:'porter',en:'to carry'}};
var _hang=null;
function hangMaybeNew(){
  var panel=document.getElementById('hang-panel');if(!panel)return;
  panel.style.display='flex';
  var _tt=document.getElementById('title');if(_tt)_tt.style.visibility='hidden';
  if(!_hang||_hang.over)hangNew();else hangDraw();
}
function hangNew(){
  var cats=['noun','adj','verb'];
  var cat=cats[Math.floor(Math.random()*cats.length)];
  var list=HANG_WORDS[cat];
  var word=list[Math.floor(Math.random()*list.length)].toUpperCase();
  _hang={word:word,cat:cat,guessed:{},miss:0,over:false,won:false};
  _hangPartAt=0;
  var again=document.getElementById('hang-again');
  if(again)again.style.display='none';
  var gf=document.getElementById('hang-gift');if(gf){gf.style.display='none';gf.innerHTML='';}
  hangDraw();
}
function hangDraw(){
  if(!_hang)return;
  var wEl=document.getElementById('hang-word'),kEl=document.getElementById('hang-keys'),
      cEl=document.getElementById('hang-cat'),mEl=document.getElementById('hang-misses'),
      sEl=document.getElementById('hang-status');
  if(!wEl)return;
  var cats={noun:'NOUN',adj:'ADJECTIVE',verb:'VERB - INFINITIVE'};
  cEl.textContent=kbT(cats[_hang.cat]);
  var h='';
  for(var i=0;i<_hang.word.length;i++){
    var ch=_hang.word[i];
    h+='<span class="hang-cell'+(_hang.guessed[ch]?' hang-on':'')+'">'+(_hang.guessed[ch]?ch:'')+'</span>';
  }
  wEl.innerHTML=h;
  var m='';
  for(var j=0;j<HANG_MAX;j++)m+='<span class="hang-miss'+(j<_hang.miss?' hang-x':'')+'"></span>';
  mEl.innerHTML=m;
  if(kEl){
    var kh='';
    for(var r2=0;r2<HANG_ROWS.length;r2++){kh+='<div class="hang-row">';for(var k2=0;k2<HANG_ROWS[r2].length;k2++)(function(L){
      var used=_hang.guessed[L]!==undefined||_hang.over;
      kh+='<button class="hang-key'+(used?' hang-used':'')+'"'+(used?' disabled':'')+' data-action="hangGuess(\''+L+'\')">'+L+'</button>';
    })(HANG_ROWS[r2][k2]);kh+='</div>';}
    kEl.innerHTML=kh;
  }
  if(sEl){
    if(_hang.over)sEl.textContent=_hang.won?kbT('SOLVED'):kbT('THE WORD WAS')+' — '+_hang.word;
    else sEl.textContent=kbT('MISSES')+' '+_hang.miss+'/'+HANG_MAX;
  }
  var tEl=document.getElementById('hang-tr');
  if(tEl){
    if(_hang.over){
      var tr=HANG_TR[_hang.word.toLowerCase()];
      var lg=(document.documentElement.lang||'en')==='fr'?'fr':'en';
      tEl.textContent=tr?('« '+_hang.word+' » — '+(lg==='fr'?'sens : ':'meaning: ')+tr[lg]):'';
    } else tEl.textContent='';
  }
  hangFigKick();
}
function hangGuess(L){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(!_hang||_hang.over||_hang.guessed[L]!==undefined)return;
  _hang.guessed[L]=_hang.word.indexOf(L)>=0;
  if(!_hang.guessed[L]){_hang.miss++;_hangPartAt=Date.now();hangFall(L);}else kbSfx('tick',6);
  var done=true;
  for(var i=0;i<_hang.word.length;i++)if(!_hang.guessed[_hang.word[i]]){done=false;break;}
  if(done){
    _hang.over=true;_hang.won=true;if(window.KG&&KG.win)KG.win('katabatik',{game:'hang'});hangGift();
    var again=document.getElementById('hang-again');if(again)again.style.display='inline-block';
    hangArp(true);
  } else if(_hang.miss>=HANG_MAX){
    _hang.over=true;_hang.won=false;
    for(var w2=0;w2<_hang.word.length;w2++)_hang.guessed[_hang.word[w2]]=true;
    var again2=document.getElementById('hang-again');if(again2)again2.style.display='inline-block';
    hangArp(false);
  }
  hangDraw();
}
window.hangNew=hangNew;window.hangGuess=hangGuess;
function hangArp(win){
  try{
    /* [IK] one context for the hangman, kept: a new one per game ran out after a dozen games */
    var ac=hangArp.ac||(hangArp.ac=new(window.AudioContext||window.webkitAudioContext)());
    if(ac.state==='suspended'&&(!window.__ikFx||window.__ikFx.on()))try{ac.resume();}catch(_r){}
    var t0=ac.currentTime+.03;
    var seq=win?[440,554,659,880]:[220,208,196,185];
    seq.forEach(function(f,i){
      var o=ac.createOscillator();o.type='triangle';o.frequency.value=f;
      var g=ac.createGain();g.gain.setValueAtTime(0,t0+i*.11);
      g.gain.linearRampToValueAtTime(.06,t0+i*.11+.02);
      g.gain.exponentialRampToValueAtTime(.0008,t0+i*.11+.3);
      o.connect(g);g.connect(ac.destination);o.start(t0+i*.11);o.stop(t0+i*.11+.32);
    });
    /* the context is kept for the next game */
  }catch(_e){}
}

// ============================================================
// Figure du pendu : potence dorée ; la tête est le portrait de Plague
// of Justinian (sprite de l'arcade), le corps apparaît échec après échec,
// et l'ensemble se balance doucement à la corde. reduced-motion = statique.
// ============================================================
var _hangImg=null,_hangImgOk=false,_hangRaf=0,_hangPartAt=0;
function hangSpriteUrl(){
  var dir='';
  try{if(window.KG&&KG.base)dir=String(KG.base).replace(/kg-$/,'');}catch(_e){}
  return dir+'sprite-cadaver_synod.webp';
}
function hangLoadImg(){
  if(_hangImg)return;
  try{
    _hangImg=new Image();
    _hangImg.onload=function(){_hangImgOk=true;};
    _hangImg.src=hangSpriteUrl();
  }catch(_e){_hangImg=null;}
}
function hangFig(){
  var cv=document.getElementById('hang-cv');if(!cv)return;
  var ctx=cv.getContext('2d');if(!ctx)return;
  var W=cv.width,Hh=cv.height;
  ctx.clearRect(0,0,W,Hh);
  var gold='#c9a84c';
  ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=8;ctx.strokeStyle=gold;
  var sx=W*0.5,beamY=Hh*0.10;
  ctx.globalAlpha=.92;
  ctx.beginPath();
  ctx.moveTo(W*0.10,Hh*0.92);ctx.lineTo(W*0.34,Hh*0.92);ctx.lineTo(W*0.34,beamY);ctx.lineTo(sx,beamY);
  ctx.stroke();
  ctx.beginPath();ctx.moveTo(W*0.34,Hh*0.30);ctx.lineTo(W*0.44,beamY);ctx.stroke();
  ctx.globalAlpha=1;
  var miss=_hang?_hang.miss:0,over=_hang&&_hang.over,won=_hang&&_hang.won;
  var part=Math.min(miss,6);
  var lost=over&&!won;
  var red=false;try{red=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_e){}
  var t=Date.now()/1000;
  var ang=red?0:Math.sin(t*(lost?4.4:2.0))*(lost?0.11:0.012+0.015*part);
  var pop=Math.max(0,Math.min(1,(Date.now()-_hangPartAt)/320));
  ctx.save();
  ctx.translate(sx,beamY);ctx.rotate(ang);ctx.translate(-sx,-beamY);
  ctx.beginPath();ctx.moveTo(sx,beamY);ctx.lineTo(sx,beamY+34);ctx.stroke();
  if(part>=1){ctx.globalAlpha=part>1?1:pop;ctx.beginPath();ctx.arc(sx,beamY+44,9,0,6.2832);ctx.stroke();ctx.globalAlpha=1;}
  if(part>=2){
    var a2=part>2?1:pop;ctx.globalAlpha=a2;
    var hr=36,hy=beamY+88;
    ctx.save();
    ctx.beginPath();ctx.arc(sx,hy,hr,0,6.2832);ctx.closePath();ctx.clip();
    if(_hangImgOk&&_hangImg.complete&&_hangImg.naturalWidth){
      var iw=_hangImg.naturalWidth,ih=_hangImg.naturalHeight;
      var cols=iw>=ih*6?8:4,fw=iw/cols,fh=ih/(cols===8?1:2);
      ctx.drawImage(_hangImg,0,0,fw,fh,sx-hr*1.3,hy-hr*1.3,hr*2.6,hr*2.6);
    }else{ctx.fillStyle='#3b3128';ctx.fillRect(sx-hr,hy-hr,hr*2,hr*2);}
    ctx.restore();
    ctx.lineWidth=5;
    if(won&&over&&!red){ctx.shadowColor='#c9a84c';ctx.shadowBlur=16;}
    ctx.beginPath();ctx.arc(sx,hy,hr+4,0,6.2832);ctx.stroke();
    ctx.shadowBlur=0;ctx.lineWidth=8;ctx.globalAlpha=1;
  }
  if(part>=3){                                                                      /* cou, épaules, cage */
    var a3=part>3?1:pop;ctx.globalAlpha=a3;
    ctx.lineWidth=7;
    ctx.beginPath();ctx.moveTo(sx,beamY+124);ctx.lineTo(sx,beamY+138);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx-44,beamY+148);ctx.lineTo(sx+44,beamY+148);ctx.stroke();
    ctx.lineWidth=4;ctx.strokeStyle='#8a7434';
    ctx.beginPath();ctx.moveTo(sx,beamY+150);ctx.lineTo(sx,beamY+186);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx-30,beamY+158);ctx.quadraticCurveTo(sx,beamY+164,sx+30,beamY+158);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx-26,beamY+168);ctx.quadraticCurveTo(sx,beamY+174,sx+26,beamY+168);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx-22,beamY+178);ctx.quadraticCurveTo(sx,beamY+184,sx+22,beamY+178);ctx.stroke();
    ctx.strokeStyle=gold;ctx.lineWidth=7;
    ctx.beginPath();ctx.moveTo(sx-30,beamY+192);ctx.quadraticCurveTo(sx,beamY+206,sx+30,beamY+192);ctx.stroke();
    ctx.beginPath();ctx.arc(sx,beamY+210,26,0.35,Math.PI-0.35);ctx.stroke();
    ctx.globalAlpha=1;
  }
  if(part>=4){                                                                      /* bras articulés + mains */
    var a4=part>4?1:pop;ctx.globalAlpha=a4;
    ctx.lineWidth=7;
    ctx.beginPath();ctx.moveTo(sx-44,beamY+150);ctx.lineTo(sx-60,beamY+186);ctx.lineTo(sx-54,beamY+222);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+44,beamY+150);ctx.lineTo(sx+60,beamY+186);ctx.lineTo(sx+54,beamY+222);ctx.stroke();
    ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(sx-54,beamY+229,6,0,6.2832);ctx.stroke();
    ctx.beginPath();ctx.arc(sx+54,beamY+229,6,0,6.2832);ctx.stroke();
    ctx.globalAlpha=1;
  }
  if(part>=5){                                                                      /* jambes : hanche-genou-tibia */
    var a5=part>5?1:pop;ctx.globalAlpha=a5;
    ctx.lineWidth=7;
    ctx.beginPath();ctx.moveTo(sx-14,beamY+214);ctx.lineTo(sx-18,beamY+256);ctx.lineTo(sx-16,beamY+300);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+14,beamY+214);ctx.lineTo(sx+18,beamY+256);ctx.lineTo(sx+16,beamY+300);ctx.stroke();
    ctx.globalAlpha=1;
  }
  if(part>=6){                                                                      /* pieds qui pendent */
    var a6=part>=6?1:pop;ctx.globalAlpha=a6;
    ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(sx-16,beamY+300);ctx.lineTo(sx-22,beamY+312);ctx.lineTo(sx-12,beamY+314);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+16,beamY+300);ctx.lineTo(sx+22,beamY+312);ctx.lineTo(sx+12,beamY+314);ctx.stroke();
    ctx.globalAlpha=1;
  }
  ctx.restore();
}
function hangFigKick(){
  hangLoadImg();
  var step=function(){
    var hp=document.getElementById('hang-panel');
    if(!hp||hp.style.display==='none'||!hp.isConnected||!_hang){_hangRaf=0;return;}
    hangFig();
    _hangRaf=requestAnimationFrame(step);
  };
  if(!_hangRaf)_hangRaf=requestAnimationFrame(step);
}
window.hangFigKick=hangFigKick;

// ============================================================
// MASTERMIND -- 3 niveaux ; les pions portent les couleurs des Masks.
// ============================================================
var MM_COLORS=['#d32f2f','#4fc3f7','#66bb6a','#ffd54f','#ab47bc','#ff7043','#78909c','#f48fb1'];
var MM_LEVELS=[
  {slots:4,colors:6,rows:10,dup:false},
  {slots:4,colors:8,rows:10,dup:true},
  {slots:5,colors:8,rows:10,dup:true}
];
var _mm=null;
function mmMaybeNew(){
  var panel=document.getElementById('mm-panel');if(!panel)return;
  panel.style.display='flex';
  var _tt=document.getElementById('title');if(_tt)_tt.style.visibility='hidden';
  if(!_mm||_mm.over)mmNew(_mm?_mm.level:0);else mmDraw();
}
function mmNew(lv){
  var L=MM_LEVELS[lv||0];
  var secret=[];
  for(var s=0;s<L.slots;s++){
    var c;
    do{c=Math.floor(Math.random()*L.colors);}while(!L.dup&&secret.indexOf(c)>=0);
    secret.push(c);
  }
  _mm={level:lv||0,secret:secret,rows:[],cur:[],over:false,won:false};
  var tabs=document.querySelectorAll('.mm-lv');
  tabs.forEach(function(t,i){t.className='mm-lv'+(i===(lv||0)?' on':'');});
  mmDraw();
}
function mmLevel(lv){if(typeof kkClick==='function')try{kkClick();}catch(_e){}mmNew(lv);}
function mmScore(guess,secret){
  var ex=0,near=0,sc={},gc={};
  for(var i=0;i<secret.length;i++){
    if(guess[i]===secret[i])ex++;
    else{sc[secret[i]]=(sc[secret[i]]||0)+1;gc[guess[i]]=(gc[guess[i]]||0)+1;}
  }
  Object.keys(gc).forEach(function(k){if(sc[k])near+=Math.min(sc[k],gc[k]);});
  return{ex:ex,near:near};
}
function mmPegs(g,cur){
  var L=MM_LEVELS[_mm.level],h='';
  for(var i=0;i<L.slots;i++){
    if(g&&g[i]!==undefined){
      h+='<span class="mm-peg"'+(cur?' data-action="mmPop()"':'')+' style="background:'+MM_COLORS[g[i]]+'"></span>';
    } else {
      h+='<span class="mm-peg mm-empty"></span>';
    }
  }
  return h;
}
function mmFb(fb,L){
  var h='<span class="mm-fb">';
  if(fb){
    var no=L.slots-fb.ex-fb.near;
    h+='<b class="mm-ex" title="'+kbT('well placed')+'">'+fb.ex+'</b>';
    h+='<i class="mm-near" title="'+kbT('wrong spot')+'">'+fb.near+'</i>';
    h+='<s class="mm-no" title="'+kbT('absent')+'">'+no+'</s>';
    h+='<em>'+fb.ex+' '+kbT('well placed')+', '+fb.near+' '+kbT('wrong spot')+', '+no+' '+kbT('absent')+'</em>';
  }
  return h+'</span>';
}
function mmDraw(){
  if(!_mm)return;
  var L=MM_LEVELS[_mm.level];
  var bEl=document.getElementById('mm-board'),pEl=document.getElementById('mm-palette'),
      sEl=document.getElementById('mm-status'),okEl=document.getElementById('mm-ok');
  if(!bEl)return;
  var h='<div class="mm-legend"><b class="mm-ex"></b>'+kbT('well placed')+'<i class="mm-near"></i>'+kbT('wrong spot')+'<s class="mm-no"></s>'+kbT('absent')+'</div>';
  for(var r=0;r<_mm.rows.length;r++){
    h+='<div class="mm-row">'+mmPegs(_mm.rows[r].guess,false)+mmFb(_mm.rows[r].fb,L)+'</div>';
  }
  if(!_mm.over){
    h+='<div class="mm-row mm-cur">'+mmPegs(_mm.cur,true)+mmFb(null,L)+'</div>';
    var left=L.rows-_mm.rows.length-1;
    for(var e=0;e<left;e++)h+='<div class="mm-row">'+mmPegs(null,false)+mmFb(null,L)+'</div>';
  } else {
    h+='<div class="mm-row mm-cur">'+mmPegs(_mm.secret,false)+mmFb(null,L)+'</div>';
  }
  bEl.innerHTML=h;
  if(pEl){
    var ph='';
    if(!_mm.over){for(var c=0;c<L.colors;c++)ph+='<button class="mm-peg" style="background:'+MM_COLORS[c]+'" data-action="mmPick('+c+')"></button>';}
    pEl.innerHTML=ph;
  }
  if(sEl){
    if(_mm.over)sEl.textContent=_mm.won?kbT('CRACKED'):kbT('THE CODE');
    else sEl.textContent=kbT('TRY')+' '+(_mm.rows.length+1)+'/'+L.rows;
  }
  if(okEl)okEl.style.display=(!_mm.over&&_mm.cur.length===L.slots)?'inline-block':'none';
}
function mmPick(c){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(!_mm||_mm.over)return;
  var L=MM_LEVELS[_mm.level];
  if(_mm.cur.length>=L.slots)return;
  _mm.cur.push(c);
  mmDraw();
  kbSfx('tick',c);
  try{var ps=document.querySelectorAll('#mm-board .mm-cur .mm-peg:not(.mm-empty)'),pg=ps[ps.length-1];if(pg&&pg.animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches)pg.animate([{transform:'translateY(-26px) scale(.7)',opacity:.2},{transform:'translateY(2px) scale(1.06)',opacity:1,offset:.75},{transform:'none'}],{duration:220,easing:'cubic-bezier(.5,0,.9,.5)'});}catch(_e){}
}
function mmPop(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(!_mm||_mm.over)return;
  _mm.cur.pop();
  mmDraw();
}
function mmSubmit(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(!_mm||_mm.over)return;
  var L=MM_LEVELS[_mm.level];
  if(_mm.cur.length<L.slots)return;
  var fb=mmScore(_mm.cur,_mm.secret);
  _mm.rows.push({guess:_mm.cur.slice(),fb:fb});
  _mm.cur=[];
  if(fb.ex===L.slots){_mm.over=true;_mm.won=true;if(window.KG&&KG.win)KG.win('katabatik',{game:'mm'});}
  else if(_mm.rows.length>=L.rows){_mm.over=true;_mm.won=false;}
  mmDraw();
  for(var q=0;q<fb.ex+fb.near;q++)(function(q,hi){setTimeout(function(){kbSfx('tick',hi?10:2);},90+q*85);})(q,q<fb.ex);
}
window.mmNew=mmNew;window.mmLevel=mmLevel;window.mmPick=mmPick;window.mmPop=mmPop;window.mmSubmit=mmSubmit;

/* [IK] things fall in Katabatik: one small sound kit, one context (the site's FX switch reaches it) */
function kbSfx(kind,v){
  try{
    var ac=kbSfx.ac||(kbSfx.ac=new(window.AudioContext||window.webkitAudioContext)());
    if(ac.state==='suspended'&&(!window.__ikFx||window.__ikFx.on()))try{ac.resume();}catch(_r){}
    if(window.__ikFx&&!window.__ikFx.on())return;
    var t=ac.currentTime+.005,o,g,f,n,b,d,i;
    function noise(dur){var len=Math.ceil(ac.sampleRate*dur);if(!kbSfx.nb||kbSfx.nb.length<len){kbSfx.nb=ac.createBuffer(1,Math.ceil(ac.sampleRate*.6),ac.sampleRate);d=kbSfx.nb.getChannelData(0);for(i=0;i<d.length;i++)d[i]=Math.random()*2-1;}var s=ac.createBufferSource();s.buffer=kbSfx.nb;return s;}
    function env(node,peak,dur){var gg=ac.createGain();gg.gain.setValueAtTime(peak,t);gg.gain.exponentialRampToValueAtTime(.0004,t+dur);node.connect(gg);gg.connect(ac.destination);return gg;}
    v=v==null?1:v;
    if(kind==='clack'){ /* a disc lands in the column: plastic on plastic, deeper after a long fall */
      n=noise(.08);f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=1700+Math.random()*700;f.Q.value=3;n.connect(f);env(f,.22*v,.07);n.start(t);n.stop(t+.09);
      o=ac.createOscillator();o.type='triangle';o.frequency.setValueAtTime(180+Math.random()*40,t);o.frequency.exponentialRampToValueAtTime(90,t+.09);env(o,.12*v,.1);o.start(t);o.stop(t+.12);
    } else if(kind==='tick'){ /* a peg drops into its hole */
      o=ac.createOscillator();o.type='square';o.frequency.setValueAtTime(1400+(v||0)*90,t);o.frequency.exponentialRampToValueAtTime(700,t+.03);env(o,.04,.05);o.start(t);o.stop(t+.06);
      n=noise(.03);f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=3000;n.connect(f);env(f,.06,.03);n.start(t);n.stop(t+.04);
    } else if(kind==='thud'){ /* a letter falls off the keyboard and hits the floor */
      o=ac.createOscillator();o.type='sine';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(48,t+.18);env(o,.22,.22);o.start(t);o.stop(t+.24);
      n=noise(.12);f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=600;n.connect(f);env(f,.18,.12);n.start(t);n.stop(t+.13);
    } else if(kind==='rattle'){ /* the board is emptied */
      for(i=0;i<9;i++){(function(k){var tt=t+k*.035+Math.random()*.02;var nn=noise(.05),ff=ac.createBiquadFilter();ff.type='bandpass';ff.frequency.value=1500+Math.random()*1200;ff.Q.value=2.5;nn.connect(ff);var gg=ac.createGain();gg.gain.setValueAtTime(.12,tt);gg.gain.exponentialRampToValueAtTime(.0004,tt+.05);ff.connect(gg);gg.connect(ac.destination);nn.start(tt);nn.stop(tt+.06);})(i);}
    }
  }catch(_e){}
}
/* a wrong letter falls off the hangman's keyboard */
function hangFall(L){
  try{
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){kbSfx('thud');return;}
    var k=document.querySelector('[data-action="hangGuess(\''+L+'\')"]');if(!k)return;
    var r=k.getBoundingClientRect(),c=k.cloneNode(true);c.removeAttribute('data-action');c.disabled=true;
    c.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;margin:0;z-index:9999;pointer-events:none;border-color:rgba(211,47,47,.7);color:#e57373';
    (document.querySelector('.kg-layer')||document.body).appendChild(c);
    var fall=Math.max(160,innerHeight-r.top+40),rot=(Math.random()-.5)*160;
    var a=c.animate([{transform:'translate(0,0) rotate(0)'},{transform:'translate('+(Math.random()-.5)*40+'px,-14px) rotate('+rot*.1+'deg)',offset:.12},{transform:'translate('+(Math.random()-.5)*90+'px,'+fall+'px) rotate('+rot+'deg)',opacity:.85}],{duration:650+fall*.6,easing:'cubic-bezier(.45,0,.9,.55)',fill:'forwards'});
    setTimeout(function(){kbSfx('thud');},Math.min(900,420+fall*.35));
    a.onfinish=function(){c.remove();};
  }catch(_e){}
}

/* the hangman also answers the physical keyboard (a Hungarian one types Ő, Ű… directly) */
document.addEventListener('keydown',function(e){var p=document.getElementById('hang-panel');if(!p||p.style.display==='none'||!_hang||_hang.over||e.ctrlKey||e.metaKey||e.altKey)return;
  var L=String(e.key||'').toUpperCase();if(L.length===1&&HANG_KEYS.indexOf(L)>=0){e.preventDefault();hangGuess(L);}});
