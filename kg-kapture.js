
/*
 * Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna
 * Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related
 * material — including characters, names, symbols, rules, lore and texts, in any form or
 * medium — are the exclusive property of Korhogo™. The source code of this site is
 * published for reading, reflections, additions, requests, etc. - the lore, names, marks
 * and works remain the property of the author. No use for training artificial
 * intelligence. Contact: mauktenieb@gmail.com
 */

/* KG module "kapture" -- KAPTURE v3 recorder (#kapture-overlay, #kapture-btn). Code copied verbatim from kofa.js (Korhogo). */

// ============================================================
// KAPTURE v3 -- cam/mic real or generative, single WebM output
// ============================================================

var KAPTURE_URLS=[
  'https://en.wikipedia.org/wiki/Branobel',
  'https://en.wikipedia.org/wiki/Croisiere_Noire',
  'https://en.wikipedia.org/wiki/Senufo_people',
  'https://en.wikipedia.org/wiki/Early_life_of_Joseph_Stalin',
  'https://en.wikipedia.org/wiki/Seven_Sisters_(oil_companies)',
  'https://en.wikipedia.org/wiki/Ateshgah_of_Baku',
  'https://en.wikipedia.org/wiki/Dialectic',
  'https://en.wikipedia.org/wiki/Eastern_Front_(World_War_II)'
];

function kapturePickUrl(){
  return KAPTURE_URLS[Math.floor(Math.random()*KAPTURE_URLS.length)];
}

function kapturePositionBtn(){
  var btn=document.getElementById('kapture-btn');
  if(!btn) return;
  var W=window.innerWidth,H=window.innerHeight;
  var bw=btn.offsetWidth||80,bh=btn.offsetHeight||38;
  var pad=18;
  var corners=[
    {bottom:pad,right:pad,top:'auto',left:'auto'},
    {bottom:pad,left:pad,top:'auto',right:'auto'},
    {top:pad,right:pad,bottom:'auto',left:'auto'},
    {top:pad,left:pad,bottom:'auto',right:'auto'}
  ];
  var fixed=Array.prototype.slice.call(document.querySelectorAll('button,a,[role="button"]')).filter(function(el){
    if(el===btn) return false;
    var s=window.getComputedStyle(el);
    return s.position==='fixed'||s.position==='sticky';
  });
  function overlaps(corner){
    var bx=corner.right!=='auto'?W-corner.right-bw:corner.left;
    var by=corner.bottom!=='auto'?H-corner.bottom-bh:corner.top;
    for(var i=0;i<fixed.length;i++){
      var r=fixed[i].getBoundingClientRect();
      if(r.width===0&&r.height===0) continue;
      if(bx<r.right+pad&&bx+bw>r.left-pad&&by<r.bottom+pad&&by+bh>r.top-pad) return true;
    }
    return false;
  }
  for(var ci=0;ci<corners.length;ci++){
    if(!overlaps(corners[ci])){
      var c=corners[ci];
      btn.style.bottom=c.bottom!=='auto'?c.bottom+'px':'';
      btn.style.top=c.top!=='auto'?c.top+'px':'';
      btn.style.right=c.right!=='auto'?c.right+'px':'';
      btn.style.left=c.left!=='auto'?c.left+'px':'';
      return;
    }
  }
  btn.style.bottom=(pad+bh+8)+'px';btn.style.right=pad+'px';
}

function getKaptureMotto(){
  try{
    if(typeof kkOrder!=='undefined'&&typeof kkIdx!=='undefined'&&typeof FAUNA!=='undefined'&&typeof FP!=='undefined'){
      var m=FAUNA[kkOrder[kkIdx]];
      if(m){var fp=FP[m.name]||{};var mo=fp.motto||m.motto||'';if(mo) return mo;}
    }
  }catch(e){}
  try{var el=document.getElementById('prof-motto');if(el&&el.textContent) return el.textContent;}catch(e){}
  return '';
}

function getKaptureMaskData(){
  try{
    if(typeof kkOrder!=='undefined'&&typeof FAUNA!=='undefined'&&typeof FP!=='undefined'){
      var m=FAUNA[kkOrder[kkIdx]];
      if(m){var fp=FP[m.name]||{};return {name:m.name,stats:fp.stats||m.stats||{},motto:fp.motto||m.motto||'',pow:fp.pow||m.pow||'',powers:fp.powers||'',c:m.c||'#c9a84c'};}
    }
  }catch(e){}
  // No active mask: use random
  if(!_kaptureRandMask) _kaptureRandMask=kaptureRandomMask();
  var rm=_kaptureRandMask;
  if(rm){
    var rfp=(typeof FP!=='undefined'&&FP[rm.name])?FP[rm.name]:{};
    return {name:rm.name,stats:rfp.stats||rm.stats||{},motto:rfp.motto||rm.motto||'',pow:rfp.pow||rm.pow||'',powers:rfp.powers||'',c:rm.c||'#c9a84c'};
  }
  return {name:'',stats:{},motto:'',c:'#c9a84c'};
}

/* [IK] the clip's signature: a thin band in the Mask's colour along the bottom edge, which survives any compression
   (the old near-invisible URL text and the 14.5 kHz tone did not survive it) */
function kaptureSign(ctx,CW,CH,color){
  try{var h=Math.max(3,Math.round(CH*0.006));ctx.save();ctx.globalAlpha=1;ctx.fillStyle=color||'#c9a84c';ctx.fillRect(0,CH-h,CW,h);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,CH-h-1,CW,1);ctx.restore();}catch(e){}
}
function kaptureStegText(ctx,url,CW,CH){
  try{
    ctx.save();
    ctx.font='4px monospace';
    ctx.fillStyle='rgba(255,255,255,0.02)';
    ctx.globalAlpha=1;
    var x=4,y=CH-6;
    while(x<CW){ctx.fillText(url,x,y);x+=ctx.measureText(url).width+6;}
    ctx.restore();
  }catch(e){}
}

function kaptureStegAudio(audioCtx,dest,url){
  var F0=14500,F1=15200,baudRate=80,bitDur=1/baudRate;
  var bits=[];
  for(var i=0;i<url.length&&bits.length<80;i++){
    var c=url.charCodeAt(i);
    for(var b=7;b>=0;b--) bits.push((c>>b)&1);
  }
  var now=audioCtx.currentTime+0.2;
  var osc=audioCtx.createOscillator();
  osc.type='sine';osc.frequency.setValueAtTime(F0,now);
  for(var bi=0;bi<bits.length;bi++) osc.frequency.setValueAtTime(bits[bi]?F1:F0,now+bi*bitDur);
  var gn=audioCtx.createGain();gn.gain.value=0.018;
  osc.connect(gn);gn.connect(dest);
  osc.start(now);osc.stop(now+bits.length*bitDur+0.2);
}

function kaptureShowMicHint(){
  var feed=document.getElementById('kk-feed');
  if(feed){
    var e=document.createElement('div');e.className='kk-kerema kk-flash';
    e.innerHTML=KK_HDR+kkKBody('Open kam! Open mik!');
    feed.appendChild(e);feed.scrollTop=feed.scrollHeight;
    setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},3500);
  }
}

var _kpState=null;

var _kapWantKam=false, _kapWantMik=false;

function kaptureToggle(which){
  if(which==='kam'){
    _kapWantKam=!_kapWantKam;
    var b=document.getElementById('kap-btn-kam');
    if(b) b.className='kap-toggle'+(_kapWantKam?' on':'');
  } else {
    _kapWantMik=!_kapWantMik;
    var b2=document.getElementById('kap-btn-mik');
    if(b2) b2.className='kap-toggle'+(_kapWantMik?' on':'');
  }
}

function kaptureGo(){
  try{var _pAC=new(window.AudioContext||window.webkitAudioContext)();_pAC.resume().then(function(){_pAC.close();}).catch(function(){});}catch(_pAE){}
  // Hide choose, show rec
  var ch=document.getElementById('kapture-choose');
  var rec=document.getElementById('kapture-rec');
  if(ch) ch.style.display='none';
  if(rec) rec.style.display='block';
  kaptureRun(_kapWantKam, _kapWantMik);
}

function kaptureNope(){
  try{var _pAC2=new(window.AudioContext||window.webkitAudioContext)();_pAC2.resume().then(function(){_pAC2.close();}).catch(function(){});}catch(_pAE){}
  // Generative only -- no permissions
  var ch=document.getElementById('kapture-choose');
  var rec=document.getElementById('kapture-rec');
  if(ch) ch.style.display='none';
  if(rec) rec.style.display='block';
  kaptureRun(false, false);
}

function kaptureStart(){
  _kaptureRandMask=null;
  // Tirer la faction aleatoire et l'afficher
  var _facs=['Divisionists!','Liquefactionists!','Senders!','Factualists!'];
  var _fac=_facs[Math.floor(Math.random()*_facs.length)];
  var _sub=document.getElementById('kapture-choose-sub');
  if(_sub)_sub.textContent='Join the '+_fac;
  kaptureShowMicHint();
  // Reset toggles
  _kapWantKam=false;_kapWantMik=false;
  var bk=document.getElementById('kap-btn-kam');
  var bm=document.getElementById('kap-btn-mik');
  if(bk) bk.className='kap-toggle';
  if(bm) bm.className='kap-toggle';
  var overlay=document.getElementById('kapture-overlay');
  var ch=document.getElementById('kapture-choose');
  var rec=document.getElementById('kapture-rec');
  var doneEl=document.getElementById('kapture-done');
  if(overlay) overlay.style.display='block';
  if(ch){ch.style.display='flex';}
  if(rec) rec.style.display='none';
  if(doneEl) doneEl.style.display='none';
  document.getElementById('kapture-btn').classList.add('recording');
}

function kaptureRun(wantKam,wantMik){
  var btn=document.getElementById('kapture-btn');
  var canvas=document.getElementById('kapture-canvas');
  var timerEl=document.getElementById('kapture-timer');
  var doneEl=document.getElementById('kapture-done');
  var dlEl=document.getElementById('kapture-dl');
  if(!canvas) return;

  var color=getKaptureColor();
  var rgb=hexToRgbKp(color);
  var maskData=getKaptureMaskData();
  kaptureInitPowerFlash(maskData);
  var W=window.innerWidth,H=window.innerHeight;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  var ctx=canvas.getContext('2d');
  var CW=canvas.width,CH=canvas.height;

  if(!checkRecordingSupport()) return;
  var canAudio=!!(window.AudioContext||window.webkitAudioContext);
  var canRecord=!!(window.MediaRecorder&&canvas.captureStream);
  var audioCtx=null,dest=null;

  if(canAudio){
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    dest=audioCtx.createMediaStreamDestination();
    audioCtx.resume().then(function(){}).catch(function(){});
  }

  _kpState={micStream:null,camStream:null,frameId:null,recorder:null,audioCtx:audioCtx};

  // Glitch bus
  var glitchBus=null;
  if(audioCtx){
    glitchBus=audioCtx.createGain();glitchBus.gain.value=1;
    var busWs=audioCtx.createWaveShaper();
    var bits=4,norm=Math.pow(2,bits-1);
    var wsCurve=new Float32Array(256);
    for(var wi=0;wi<256;wi++){var wx=wi*2/255-1;wsCurve[wi]=Math.round(wx*norm)/norm;}
    busWs.curve=wsCurve;
    var stutterGain=audioCtx.createGain();
    stutterGain.gain.setValueAtTime(1,audioCtx.currentTime);
    for(var si=0;si<30;si++){
      var st=audioCtx.currentTime+0.1+Math.random()*5;
      stutterGain.gain.setValueAtTime(Math.random()<0.28?0.001:0.3+Math.random()*1.2,st);
    }
    // Ring modulator
    var ringOsc=audioCtx.createOscillator();
    ringOsc.frequency.value=colorToFreq(color)*0.5;
    var ringGain=audioCtx.createGain();ringGain.gain.value=0.22;
    ringOsc.connect(ringGain);ringOsc.start();
    _kpState.ringOsc=ringOsc;
    glitchBus.connect(busWs);busWs.connect(stutterGain);
    stutterGain.connect(ringGain);ringGain.connect(dest);
    // Steg audio
  }

  // ---- AUDIO SYNTHESIS (always present, mixed under mic if available) ----
  function buildSyntheticAudio(vol){
    if(!audioCtx||!glitchBus) return;
    var motto=maskData.motto||getKaptureMotto()||'Korhogo';
    var baseFreq=colorToFreq(color);
    var now=audioCtx.currentTime+0.05;

    // 1. Drone: two detuned saws on the mask's base frequency
    var drone1=audioCtx.createOscillator();
    var drone2=audioCtx.createOscillator();
    drone1.type='sawtooth';drone1.frequency.value=baseFreq;
    drone2.type='sawtooth';drone2.frequency.value=baseFreq*1.007;
    var droneFilter=audioCtx.createBiquadFilter();
    droneFilter.type='lowpass';droneFilter.frequency.value=600+Math.random()*400;droneFilter.Q.value=8;
    var droneGain=audioCtx.createGain();
    droneGain.gain.setValueAtTime(0,now);
    droneGain.gain.linearRampToValueAtTime(vol*0.3,now+0.4);
    droneGain.gain.setValueAtTime(vol*0.3,now+4.5);
    droneGain.gain.linearRampToValueAtTime(0,now+5);
    drone1.connect(droneFilter);drone2.connect(droneFilter);
    droneFilter.connect(droneGain);droneGain.connect(glitchBus);
    drone1.start(now);drone2.start(now);
    drone1.stop(now+5.2);drone2.stop(now+5.2);

    // 2. Harmonic series: overtones of baseFreq, fading in/out
    var harmonics=[2,3,5,7,11];
    for(var hi=0;hi<harmonics.length;hi++){
      (function(hm){
        var ho=audioCtx.createOscillator();
        ho.type='sine';ho.frequency.value=baseFreq*hm;
        var hg=audioCtx.createGain();
        var onset=now+Math.random()*2;
        hg.gain.setValueAtTime(0,onset);
        hg.gain.linearRampToValueAtTime(vol*(0.04+Math.random()*0.06),onset+0.3+Math.random()*0.5);
        hg.gain.linearRampToValueAtTime(0,onset+1+Math.random()*2);
        ho.connect(hg);hg.connect(glitchBus);
        ho.start(onset);ho.stop(onset+3);
      })(harmonics[hi]);
    }

    // 3. Robot voice: motto syllabified
    var sylCount=Math.max(motto.replace(/[^aeiouyAEIOUY]+/g,' ').trim().split(' ').filter(function(s){return s.length>0;}).length,4);
    var sylDur=Math.min(4.4,sylCount*0.22+0.5);
    var sylStep=sylDur/sylCount;
    var o1=audioCtx.createOscillator(),o2=audioCtx.createOscillator(),o3=audioCtx.createOscillator();
    o1.type='sawtooth';o1.frequency.value=baseFreq*1.5;
    o2.type='sawtooth';o2.frequency.value=baseFreq*1.51;
    o3.type='square';o3.frequency.value=baseFreq*0.75;
    var f1=audioCtx.createBiquadFilter();f1.type='bandpass';f1.frequency.value=800;f1.Q.value=3;
    var f2=audioCtx.createBiquadFilter();f2.type='bandpass';f2.frequency.value=1400;f2.Q.value=3.5;
    var f3=audioCtx.createBiquadFilter();f3.type='bandpass';f3.frequency.value=2600;f3.Q.value=5;
    var voiceAmp=audioCtx.createGain();voiceAmp.gain.setValueAtTime(0,now);
    for(var vi=0;vi<sylCount;vi++){
      var vt=now+vi*sylStep;
      voiceAmp.gain.setValueAtTime(0.001,vt);
      voiceAmp.gain.linearRampToValueAtTime(vol*(0.15+Math.random()*0.12),vt+sylStep*0.25);
      voiceAmp.gain.setValueAtTime(vol*0.08,vt+sylStep*0.55);
      voiceAmp.gain.linearRampToValueAtTime(0.001,vt+sylStep*0.9);
    }
    voiceAmp.gain.setValueAtTime(0,now+sylDur);
    // Pitch glitch
    for(var pi=0;pi<6;pi++) o1.frequency.setValueAtTime(baseFreq*(0.5+Math.random()*2.5),now+Math.random()*sylDur);
    var lfo=audioCtx.createOscillator();lfo.frequency.value=1.2+Math.random()*0.8;
    var lfoG=audioCtx.createGain();lfoG.gain.value=baseFreq*0.08;
    lfo.connect(lfoG);lfoG.connect(o1.frequency);lfoG.connect(o2.frequency);
    o1.connect(f1);o2.connect(f1);o3.connect(f2);o1.connect(f2);o2.connect(f3);
    f1.connect(voiceAmp);f2.connect(voiceAmp);f3.connect(voiceAmp);
    voiceAmp.connect(glitchBus);
    lfo.start(now);o1.start(now);o2.start(now);o3.start(now);
    lfo.stop(now+sylDur+0.1);o1.stop(now+sylDur+0.1);o2.stop(now+sylDur+0.1);o3.stop(now+sylDur+0.1);

    // 4. Rhythmic clicks / impacts
    var sRate=audioCtx.sampleRate;
    var clickBuf=audioCtx.createBuffer(1,Math.round(sRate*5),sRate);
    var cd=clickBuf.getChannelData(0);
    for(var ci=0;ci<cd.length;ci++){
      cd[ci]=(Math.random()*2-1)*0.025;
      if(Math.random()<0.0012) cd[ci]+=(Math.random()*2-1)*(0.4+Math.random()*0.5);
      // Periodic low rumble
      cd[ci]+=Math.sin(ci*0.0018)*0.018*Math.sin(ci*0.00007);
    }
    var cSrc=audioCtx.createBufferSource();cSrc.buffer=clickBuf;
    var cGain=audioCtx.createGain();cGain.gain.value=vol*0.5;
    cSrc.connect(cGain);cGain.connect(glitchBus);cSrc.start(now);

    // TTS
    if(motto){
      try{
        window.speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(motto);
        if(typeof _enVoice!=='undefined'&&_enVoice) u.voice=_enVoice;
        u.lang='en-GB';u.rate=0.75;u.pitch=0.68;u.volume=0.8;
        window.speechSynthesis.speak(u);
      }catch(e){}
    }
  }

  // ---- GENERATIVE VISUAL ----
  var camVideo=null;
  var genPhase=0;
  var stats=maskData.stats||{};
  var statKeys=['STR','DEX','INT','WIS','CHA','CON'];
  var mottoWords=(maskData.motto||getKaptureMotto()||'Korhogo').split(/\s+/);
  var maskName=maskData.name||'MASK';

  function drawGenerative(t){
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    // Deep background
    ctx.fillStyle='rgba(4,3,2,0.88)';
    ctx.fillRect(0,0,CW,CH);

    // Concentric rings derived from stats
    var sk2=['STR','DEX','INT','WIS','CHA','CON'];
    for(var ri=0;ri<sk2.length;ri++){
      var sv=(stats[sk2[ri]]||5)/10;
      var radius=(0.08+sv*0.28)*Math.min(CW,CH)*(0.8+0.2*Math.sin(t*0.7+ri));
      var cx2=CW*0.5+Math.sin(t*0.3+ri*1.1)*CW*0.04;
      var cy2=CH*0.5+Math.cos(t*0.25+ri*0.9)*CH*0.04;
      ctx.beginPath();
      ctx.arc(cx2,cy2,radius,0,Math.PI*2);
      ctx.strokeStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(0.04+sv*0.08)+')';
      ctx.lineWidth=1+sv*2;
      ctx.stroke();
    }

    // Vertical stat bars pulsing
    var barW=Math.floor(CW/8);
    for(var bi=0;bi<sk2.length;bi++){
      var bv=(stats[sk2[bi]]||5)/10;
      var pulse=0.7+0.3*Math.sin(t*1.4+bi*0.8);
      var bh=CH*bv*pulse*0.6;
      var bx=CW*0.1+bi*(CW*0.14);
      ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(0.06+bv*0.12)+')';
      ctx.fillRect(Math.round(bx),CH-Math.round(bh),Math.max(2,barW-4),Math.round(bh));
    }

    // Mask name fragmenting
    ctx.font='bold '+Math.round(CW*0.07)+'px "Bebas Neue",sans-serif';
    ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.08)';
    var nx=CW*0.5+(Math.sin(t*2.1)*CW*0.02);
    var ny=CH*0.5+(Math.cos(t*1.7)*CH*0.02);
    ctx.textAlign='left';

    // Motto words drifting
    ctx.font=Math.round(CW*0.022)+'px "DM Mono",monospace';
    for(var wi=0;wi<Math.min(mottoWords.length,8);wi++){
      var wx=((wi/mottoWords.length)*CW*1.4-CW*0.1+t*18*(1+wi*0.1))%CW;
      var wy=CH*0.2+wi*(CH*0.08)+Math.sin(t*0.9+wi)*CH*0.02;
      ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.09)';
      ctx.fillText(mottoWords[wi],Math.round(wx),Math.round(wy));
    }

    ctx.restore();
  }

  function drawCam(){
    if(camVideo&&camVideo.readyState>=2){
      ctx.save();ctx.setTransform(1,0,0,1,0,0);
      // Mirror horizontally for selfie feel
      ctx.scale(-1,1);ctx.drawImage(camVideo,-CW,0,CW,CH);
      ctx.setTransform(1,0,0,1,0,0);
      ctx.restore();
    } else {
      drawGenerative(Date.now()/1000);
    }
  }

  // Extract short power names from fp.powers string
function kaptureExtractPowers(powersStr){
  if(!powersStr) return [];
  // Format: "Powers: Name1, Name2, Name3. Description..."
  var m=powersStr.match(/Powers:\s*([^.]+)\./);
  if(!m) return [];
  return m[1].split(',').map(function(s){return s.trim();}).filter(function(s){return s.length>0&&s.length<30;});
}

// Flash power names on canvas during glitch
var _kpFlashPowers=[];
var _kpFlashTimer=0;
var _kpFlashInterval=18; // frames between flashes
var _kpFlashCurrent=null;
var _kpFlashAlpha=0;
var _kpFlashFading=false;

function kaptureInitPowerFlash(maskDataObj){
  var fp=(typeof FP!=='undefined'&&maskDataObj&&FP[maskDataObj.name])?FP[maskDataObj.name]:{};
  var _raw=kaptureExtractPowers(fp.powers||'');
  _kpFlashPowers=_raw.length?_raw.sort(function(){return Math.random()-0.5;}):[];
  _kpFlashTimer=0;
  _kpFlashCurrent=null;
  _kpFlashAlpha=0;
  _kpFlashFading=false;
}

function kapturePowerFlashDraw(ctx,W,H,frame){
  if(!_kpFlashPowers||!_kpFlashPowers.length) return;
  _kpFlashTimer++;
  // New flash
  if(_kpFlashTimer>=_kpFlashInterval&&!_kpFlashCurrent){
    if(Math.random()<0.35){
      _kpFlashCurrent=_kpFlashPowers[Math.floor(Math.random()*_kpFlashPowers.length)];
      _kpFlashAlpha=0;
      _kpFlashFading=false;
      _kpFlashTimer=0;
      _kpFlashInterval=25+Math.floor(Math.random()*40);
    } else {
      _kpFlashTimer=0;
    }
  }
  if(!_kpFlashCurrent) return;
  // Fade in
  if(!_kpFlashFading) _kpFlashAlpha=Math.min(1,_kpFlashAlpha+0.12);
  else _kpFlashAlpha=Math.max(0,_kpFlashAlpha-0.14);
  if(_kpFlashAlpha>=1) _kpFlashFading=true;
  if(_kpFlashAlpha<=0){_kpFlashCurrent=null;return;}
  // Draw
  var fontSize=Math.round(W*0.055);
  ctx.save();
  ctx.font='bold '+fontSize+'px "DM Mono",monospace';
  ctx.globalAlpha=_kpFlashAlpha*0.55;
  ctx.fillStyle='#ffffff';
  var x=Math.round(W*0.08+Math.random()*W*0.3);
  var y=Math.round(H*0.2+Math.random()*H*0.55);
  // Slight random offset per frame for glitch feel
  x+=Math.round((Math.random()-0.5)*8);
  ctx.fillText(_kpFlashCurrent.toUpperCase(),x,y);
  // Shadow/echo
  ctx.globalAlpha=_kpFlashAlpha*0.2;
  ctx.fillStyle='#000';
  ctx.fillText(_kpFlashCurrent.toUpperCase(),x+2,y+2);
  ctx.globalAlpha=1;
  ctx.restore();
}

// Power-biased glitch weights from mask pow string
function kaptureGlitchWeights(pow){
  // defaults: [channelSplit, waveWarp, pixelSort, smear, zoomGlitch, barrel]
  var w=[1,1,1,1,1,1];
  if(!pow) return w;
  var p=pow.toLowerCase();
  // Rot/decay/miasma/haze -> pixel sort + smear dominant
  if(/rot|decay|miasma|haze|entrop|corrosi/.test(p)){w=[0.6,1.2,2.5,2.0,0.4,0.8];}
  // Crush/slash/shot/swarm -> brutal slices + zoom glitch
  else if(/crush|slash|shot|swarm|relentless|fury|iron|grind/.test(p)){w=[1.2,0.4,0.5,0.4,2.8,0.6];}
  // Shroud/whisper/lure/shadow -> subtle channel split + echo
  else if(/shroud|whisper|lure|shadow|veil|cloak|silent|psychic/.test(p)){w=[2.2,0.8,0.6,2.5,0.3,0.5];}
  // Resonance/equilibrium/hymn -> wave + barrel
  else if(/resonance|equilibrium|hymn|balance|channel|earth/.test(p)){w=[0.5,2.8,0.6,0.8,0.4,2.2];}
  // Smoulder/blaze/inferno/dawn/fire -> flash heavy + noise + channel split warm
  else if(/smoulder|blaze|inferno|dawn|ignite|fiery|burn|primal/.test(p)){w=[1.8,0.6,0.5,0.4,1.2,0.8];}
  // Verdict/mark/judgement -> cold sharp rectilinear
  else if(/verdict|mark|judgement|guilty|scales|weigh/.test(p)){w=[1.5,0.5,1.8,0.4,1.5,0.3];}
  return w;
}

function applyGlitch(){
  var _pow=maskData&&maskData.pow?maskData.pow:'';
  var _pw=kaptureGlitchWeights(_pow);
  var chromInt=(_pw[0]+_pw[2])*0.5;
  var sliceInt=(_pw[1]+_pw[4])*0.5;
  var tintInt=(_pw[5]+_pw[3])*0.5;

  // 1. Chromatic aberration
  var shift=Math.floor(Math.sin(Date.now()/90)*(8*chromInt)+Math.random()*(6*chromInt)+2);
  try{
    var id=ctx.getImageData(0,0,CW,CH);
    var d=id.data;
    var sy=Math.floor((Math.random()-0.5)*4*chromInt);
    for(var y=0;y<CH;y++){
      for(var x=0;x<CW;x++){
        var base=(y*CW+x)*4;
        var rS=(Math.min(CH-1,y+sy)*CW+Math.min(CW-1,x+shift))*4;
        var bS=(Math.max(0,y-sy)*CW+Math.max(0,x-shift))*4;
        d[base]=d[rS];d[base+2]=d[bS+2];
      }
    }
    ctx.putImageData(id,0,0);
  }catch(e){}

  // 2. Horizontal slices
  var numSlices=Math.floor(2+sliceInt*10);
  for(var s=0;s<numSlices;s++){
    if(Math.random()<0.3+sliceInt*0.25){
      var slY=Math.floor(Math.random()*CH);
      var slH=Math.floor(Math.random()*(8+sliceInt*20)+2);
      var slDx=Math.floor((Math.random()*2-1)*CW*(0.06+sliceInt*0.18));
      if(slDx!==0&&slY+slH<CH){
        try{var sl=ctx.getImageData(0,slY,CW,slH);ctx.putImageData(sl,slDx,slY);}catch(ex){}
      }
    }
  }

  // 3. Color tint pulsed
  var tintAlpha=0.08+tintInt*0.1+Math.sin(Date.now()*0.004)*0.04;
  ctx.globalAlpha=Math.max(0.05,Math.min(0.25,tintAlpha));
  ctx.fillStyle='rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
  ctx.fillRect(0,0,CW,CH);
  ctx.globalAlpha=1;

  // Scanlines
  for(var scl=0;scl<CH;scl+=4){
    ctx.fillStyle='rgba(0,0,0,0.08)';ctx.fillRect(0,scl,CW,1);
  }

  // Rare flash
  if(Math.random()<0.025){
    ctx.globalAlpha=0.28;
    ctx.fillStyle='rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
    ctx.fillRect(0,0,CW,CH);ctx.globalAlpha=1;
  }
}


function drawGenerative(t){
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='rgba(4,3,2,0.88)';
  ctx.fillRect(0,0,CW,CH);
  var sk2=['STR','DEX','INT','WIS','CHA','CON'];
  var stats=maskData.stats||{};
  for(var ri=0;ri<sk2.length;ri++){
    var sv=(stats[sk2[ri]]||5)/10;
    var radius=(0.08+sv*0.28)*Math.min(CW,CH)*(0.8+0.2*Math.sin(t*0.7+ri));
    var cx2=CW*0.5+Math.sin(t*0.3+ri*1.1)*CW*0.04;
    var cy2=CH*0.5+Math.cos(t*0.25+ri*0.9)*CH*0.04;
    ctx.beginPath();ctx.arc(cx2,cy2,radius,0,Math.PI*2);
    ctx.strokeStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(0.04+sv*0.08)+')';
    ctx.lineWidth=1+sv*2;ctx.stroke();
  }
  var barW=Math.floor(CW/8);
  for(var bi=0;bi<sk2.length;bi++){
    var bv=(stats[sk2[bi]]||5)/10;
    var pulse=0.7+0.3*Math.sin(t*1.4+bi*0.8);
    var bh=CH*bv*pulse*0.6;
    var bx=CW*0.1+bi*(CW*0.14);
    ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(0.06+bv*0.12)+')';
    ctx.fillRect(Math.round(bx),CH-Math.round(bh),Math.max(2,barW-4),Math.round(bh));
  }
  var mottoWords=(maskData.motto||'').split(/\s+/);
  var maskName=maskData.name||'';
  ctx.font='bold '+Math.round(CW*0.07)+'px "Bebas Neue",sans-serif';
  ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.08)';
  ctx.textAlign='left';
  ctx.font=Math.round(CW*0.022)+'px "DM Mono",monospace';
  for(var wi=0;wi<Math.min(mottoWords.length,8);wi++){
    var wx=((wi/mottoWords.length)*CW*1.4-CW*0.1+t*18*(1+wi*0.1))%CW;
    var wy=CH*0.2+wi*(CH*0.08)+Math.sin(t*0.9+wi)*CH*0.02;
    ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.09)';
    ctx.fillText(mottoWords[wi],Math.round(wx),Math.round(wy));
  }
  ctx.restore();
}

function drawCam(){
  if(camVideo&&camVideo.readyState>=2){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(-1,1);ctx.drawImage(camVideo,-CW,0,CW,CH);
    ctx.setTransform(1,0,0,1,0,0);ctx.restore();
  } else {drawGenerative(Date.now()/1000);}
}

function drawFrame(){
  if(camVideo) drawCam(); else drawGenerative(Date.now()/1000);
  applyGlitch();
  kapturePowerFlashDraw(ctx,W,H,0);
  kaptureSign(ctx,CW,CH,color);
  _kpState.frameId=requestAnimationFrame(drawFrame);
}

function doFinish(){
  if(!_kpState) return;                       /* fermé entre-temps : rien à finir */
  try{window.speechSynthesis.cancel();}catch(e){}
  if(_kpState.micStream) _kpState.micStream.getTracks().forEach(function(t){t.stop();});
  if(_kpState.camStream) _kpState.camStream.getTracks().forEach(function(t){t.stop();});
  try{if(_kpState.ringOsc)_kpState.ringOsc.stop();}catch(ex){}
  if(_kpState.frameId) cancelAnimationFrame(_kpState.frameId);
  try{if(audioCtx)audioCtx.close();}catch(ex){}
  doneEl.style.display='flex';
  btn.classList.remove('recording');
}

function checkRecordingSupport(){
  if(!(window.MediaRecorder&&HTMLCanvasElement.prototype.captureStream)){
    var feed=document.getElementById('kk-feed');
    var doneEl2=document.getElementById('kapture-done');
    var btn2=document.getElementById('kapture-btn');
    var overlay=document.getElementById('kapture-overlay');
    if(overlay) overlay.style.display='none';
    if(btn2) btn2.classList.remove('recording');
    if(feed&&typeof KK_HDR!=='undefined'){
      var e=document.createElement('div');e.className='kk-kerema';
      e.innerHTML=KK_HDR+kkKBody('Video capture not supported on this device. The Kerema sees you anyway.');
      feed.appendChild(e);feed.scrollTop=feed.scrollHeight;
    }
    return false;
  }
  return true;
}

function startRecording(){
  if(!canRecord){doFinish();return;}
  var canvasStream=canvas.captureStream(25);
  var combined=new MediaStream();
  canvasStream.getVideoTracks().forEach(function(t){combined.addTrack(t);});
  if(dest) dest.stream.getAudioTracks().forEach(function(t){combined.addTrack(t);});
  var chunks=[];
  var mimeType='';
  var mimes=['video/webm;codecs=vp8,opus','video/webm;codecs=vp9,opus','video/webm','video/mp4'];
  for(var mi=0;mi<mimes.length;mi++){
    try{if(MediaRecorder.isTypeSupported(mimes[mi])){mimeType=mimes[mi];break;}}catch(e){}
  }
  var rec;
  try{rec=new MediaRecorder(combined,mimeType?{mimeType:mimeType,audioBitsPerSecond:128000}:{audioBitsPerSecond:128000});}
  catch(e){try{rec=new MediaRecorder(combined);}catch(e2){doFinish();return;}}
  rec.ondataavailable=function(e){if(e.data&&e.data.size>0) chunks.push(e.data);};
  rec.onstop=function(){
    var type=mimeType||'video/webm';
    var blob=new Blob(chunks,{type:type});
    var ext=type.indexOf('mp4')>=0?'mp4':'webm';
    var repDate='';
    try{if(typeof kkRepublicanDate==='function') repDate='-'+kkRepublicanDate().replace(/\s+/g,'-');}catch(_rd){}
    var fname=window.ikName?ikName('kapture',ext):'kapture'+repDate+'.'+ext;
    var blobUrl=URL.createObjectURL(blob);
    var tmpA=document.createElement('a');
    tmpA.href=blobUrl;tmpA.setAttribute('download',fname);
    tmpA.style.display='none';document.body.appendChild(tmpA);tmpA.click();
    setTimeout(function(){document.body.removeChild(tmpA);URL.revokeObjectURL(blobUrl);},2000);
    dlEl.style.display='none';
    doFinish();
  };
  _kpState.recorder=rec;
  rec.start(80);
}

function runTimer(){
  var secs=5;timerEl.textContent=secs;
  var iv=setInterval(function(){
    secs--;
    if(secs<=0){
      clearInterval(iv);timerEl.textContent='';
      try{window.speechSynthesis.cancel();}catch(e){}
      if(_kpState&&_kpState.recorder&&_kpState.recorder.state==='recording') _kpState.recorder.stop();
      else doFinish();
    } else {timerEl.textContent=secs;}
  },1000);
}

function launch(){
  /* un seul temps d'attente : le souffle « Say Branobel. », puis l'enregistrement
     (le seul compte restant est celui de la prise elle-même, dans runTimer). */
  drawFrame();
  var prepLabel=document.getElementById('kapture-label');
  var maskName=maskData&&maskData.name?maskData.name.toUpperCase():'';
  timerEl.textContent='';
  if(prepLabel) prepLabel.textContent='Say Branobel.';
  setTimeout(function(){
    if(!_kpState) return;                     /* fermé pendant le souffle : stop net */
    if(prepLabel) prepLabel.textContent=maskName;
    startRecording();
    runTimer();
    drawFrame();
  },900);
}

var camDone=false,micDone=false;
function checkLaunch(){if(camDone&&micDone) launch();}

if(wantKam&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:W},height:{ideal:H}},audio:false})
    .then(function(cs){
      _kpState.camStream=cs;
      var v=document.createElement('video');
      v.srcObject=cs;v.muted=true;v.playsInline=true;
      v.play().catch(function(){});
      v.onloadedmetadata=function(){camVideo=v;};
      camDone=true;checkLaunch();
    }).catch(function(){camDone=true;checkLaunch();});
} else {camDone=true;}

if(wantMik&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
  navigator.mediaDevices.getUserMedia({audio:true,video:false})
    .then(function(ms){
      _kpState.micStream=ms;
      if(audioCtx&&glitchBus){
        var micSrc=audioCtx.createMediaStreamSource(ms);
        micSrc.connect(glitchBus);
      }
      buildSyntheticAudio(0.22);
      setTimeout(function(){micDone=true;checkLaunch();},150);
    }).catch(function(){
      buildSyntheticAudio(0.85);
      micDone=true;checkLaunch();
    });
} else {
  if(!wantMik) buildSyntheticAudio(0.85);
  micDone=true;
}
checkLaunch();
}

function kaptureClose(){
  if(_kpState){
    try{if(_kpState.recorder&&_kpState.recorder.state==='recording')_kpState.recorder.stop();}catch(e){}
    try{if(_kpState.frameId)cancelAnimationFrame(_kpState.frameId);}catch(e){}
    try{if(_kpState.micStream)_kpState.micStream.getTracks().forEach(function(t){t.stop();});}catch(e){}
    try{if(_kpState.camStream)_kpState.camStream.getTracks().forEach(function(t){t.stop();});}catch(e){}
    try{if(_kpState.ringOsc)_kpState.ringOsc.stop();}catch(e){}
    try{if(_kpState.audioCtx)_kpState.audioCtx.close();}catch(e){}
    _kpState=null;
  }
  var overlay=document.getElementById('kapture-overlay');
  var doneEl=document.getElementById('kapture-done');
  var btn=document.getElementById('kapture-btn');
  if(overlay)overlay.style.display='none';
  if(doneEl)doneEl.style.display='none';
  if(btn)btn.classList.remove('recording');
}

window.kaptureStart=kaptureStart;
window.kaptureRun=kaptureRun;
window.kaptureToggle=kaptureToggle;
window.kaptureGo=kaptureGo;
window.kaptureNope=kaptureNope;
window.kaptureClose=kaptureClose;
window.kapturePositionBtn=kapturePositionBtn;
window.kaptureShowMicHint=kaptureShowMicHint;
window.kaptureMakeDraggable=kaptureMakeDraggable;

function kaptureMakeDraggable(){
  var btn=document.getElementById('kapture-btn');
  if(!btn) return;
  var dragging=false,hasMoved=false,ox=0,oy=0,bx=0,by=0;
  function getPos(e){
    if(e.touches) return{x:e.touches[0].clientX,y:e.touches[0].clientY};
    return{x:e.clientX,y:e.clientY};
  }
  function onDown(e){
    var p=getPos(e);dragging=true;hasMoved=false;
    ox=p.x;oy=p.y;
    var r=btn.getBoundingClientRect();bx=r.left;by=r.top;
    btn.style.cursor='grabbing';
    btn.style.right='auto';btn.style.bottom='auto';
    btn.style.left=bx+'px';btn.style.top=by+'px';
    e.preventDefault();
  }
  function onMove(e){
    if(!dragging) return;
    var p=getPos(e);
    var dx=p.x-ox,dy=p.y-oy;
    if(Math.abs(dx)>3||Math.abs(dy)>3) hasMoved=true;
    var nx=Math.max(0,Math.min(window.innerWidth-btn.offsetWidth,bx+dx));
    var ny=Math.max(0,Math.min(window.innerHeight-btn.offsetHeight,by+dy));
    btn.style.left=nx+'px';btn.style.top=ny+'px';
    e.preventDefault();
  }
  function onUp(e){
    if(!dragging) return;
    dragging=false;btn.style.cursor='grab';
    if(!hasMoved){if(typeof kaptureStart==='function') kaptureStart();}
  }
  btn.addEventListener('mousedown',onDown,{passive:false});
  btn.addEventListener('touchstart',onDown,{passive:false});
  document.addEventListener('mousemove',onMove,{passive:false});
  document.addEventListener('touchmove',onMove,{passive:false});
  document.addEventListener('mouseup',onUp);
  document.addEventListener('touchend',onUp);
}

try{setTimeout(kapturePositionBtn,800);}catch(e){}
try{setTimeout(kaptureMakeDraggable,900);}catch(e){}
try{window.addEventListener('resize',function(){setTimeout(kapturePositionBtn,200);});}catch(e){}
