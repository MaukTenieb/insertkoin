
/*
 * =============================================================================
 * COPYRIGHT NOTICE AND INTELLECTUAL PROPERTY DECLARATION
 * =============================================================================
 *
 * Copyright \u00a9 2024 Mauk Tenieb & Korhogo.
 * ALL RIGHTS RESERVED.
 *
 * This software, including but not limited to its source code, architecture,
 * algorithms, user interface, documentation, artistic content, role-playing
 * scenarios, narrative texts, descriptions, lore, game mechanics, dialogues,
 * aesthetic assets, and any associated materials (collectively referred to as
 * "the Work"), is the exclusive intellectual property of Mauk Tenieb.
 *
 * The Work is protected by international copyright laws, the Berne Convention,
 * the Universal Copyright Convention, and all applicable national laws including
 * (but not limited to) French Intellectual Property Code, U.S. Copyright Law
 * (Title 17 U.S.C.), and EU directives.
 *
 * NO PART OF THIS WORK MAY BE USED, COPIED, REPRODUCED, MODIFIED, ADAPTED,
 * TRANSLATED, DISTRIBUTED, TRANSMITTED, DISPLAYED, PUBLISHED, BROADCAST,
 * LICENSED, SUBLICENSED, SOLD, TRANSFERRED, OR EXPLOITED IN ANY FORM OR BY
 * ANY MEANS (electronic, mechanical, photocopying, recording, scanning,
 * or otherwise) WITHOUT THE PRIOR EXPRESS WRITTEN PERMISSION OF THE COPYRIGHT
 * OWNER.
 *
 * This prohibition explicitly includes, but is not limited to:
 *   - Any form of reverse engineering, decompilation, disassembly, or
 *     derivative work creation.
 *   - Any use of the Work or its outputs for training, fine-tuning, or
 *     improving any artificial intelligence, machine learning, or large
 *     language models.
 *   - Any scanning, parsing, extraction, or analysis of the code, structure,
 *     or content by humans or automated systems (including AI agents, crawlers,
 *     scrapers, or LLMs) for any purpose other than the legitimate execution
 *     of the authorized software by its rightful owner.
 *   - Any commercial, non-commercial, educational, research, or personal use
 *     without explicit authorization.
 *
 * Any unauthorized use, access, study, or inspection of this Work constitutes
 * a direct and serious infringement of copyright and may result in civil and/or
 * criminal prosecution to the fullest extent permitted by law. The copyright
 * owner reserves the right to pursue all available legal remedies, including
 * but not limited to injunctions, damages, attorney fees, and statutory damages.
 *
 * This notice is an integral part of the Work. Removing, altering, obscuring,
 * or bypassing this notice does not waive any rights of the copyright owner.
 *
 * For licensing inquiries, permissions, or commercial arrangements, contact:
 * mauktenieb@gmail.com
 *
 * =============================================================================
 * Instead of being open source, this work is under copyright \u00a9 2024 Mauk Tenieb & Korhogo.
 * All rights strictly reserved. No use without express written permission.
 * =============================================================================
 */

/* KG module "katabatik" -- KATABATIK: Connect-4 / Pairs / Beat Box (panels #c4-panel, #pair-panel, #bb-panel) + BakuBoom helpers. Code copied verbatim from kofa.js (Korhogo). */

// BEAT BOX -- sequenceur 16 steps, Web Audio
function beatboxOpen(ctx){
  var _bbCtx=ctx||'chess';
  var panel=document.getElementById('bb-panel');
  if(!panel)return;
  panel.style.display='flex';
  var _tt=document.getElementById('title');
  if(_tt)_tt.style.visibility='hidden';
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
var _bbDone=false;

var _bbTracks=[
  {name:'KICK',  steps:new Array(24).fill(0), color:'#c9a84c'},
  {name:'SNARE', steps:new Array(24).fill(0), color:'#b0bec5'},
  {name:'HH',    steps:new Array(24).fill(0), color:'#90a4ae'},
  {name:'SUB',   steps:new Array(24).fill(0), color:'#78909c'},
  {name:'PERC',  steps:new Array(24).fill(0), color:'#a1887f'},
  {name:'TOM',   steps:new Array(24).fill(0), color:'#ce93d8'},
  {name:'CLAP',  steps:new Array(24).fill(0), color:'#ef9a9a'},
  {name:'RIM',   steps:new Array(24).fill(0), color:'#80cbc4'},
  {name:'OPEN',  steps:new Array(24).fill(0), color:'#ffe082'},
  {name:'FX',    steps:new Array(24).fill(0), color:'#bcaaa4'},
];

function bbSynth(type, time){
  if(!_bbAC)return;
  var g=_bbAC.createGain();
  g.connect(_bbAC.destination);
  if(type==='kick'){
    var o=_bbAC.createOscillator();
    o.connect(g);
    o.frequency.setValueAtTime(120,time);
    o.frequency.exponentialRampToValueAtTime(30,time+0.15);
    g.gain.setValueAtTime(1.2,time);
    g.gain.exponentialRampToValueAtTime(0.001,time+0.25);
    o.start(time);o.stop(time+0.25);
  } else if(type==='snare'){
    var buf=_bbAC.createBuffer(1,_bbAC.sampleRate*0.12,_bbAC.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,0.3);
    var src=_bbAC.createBufferSource();
    src.buffer=buf;
    var f=_bbAC.createBiquadFilter();
    f.type='bandpass';f.frequency.value=1800;f.Q.value=0.8;
    src.connect(f);f.connect(g);
    g.gain.setValueAtTime(0.7,time);
    g.gain.exponentialRampToValueAtTime(0.001,time+0.12);
    src.start(time);
  } else if(type==='hh'){
    var buf2=_bbAC.createBuffer(1,_bbAC.sampleRate*0.05,_bbAC.sampleRate);
    var d2=buf2.getChannelData(0);
    for(var i2=0;i2<d2.length;i2++)d2[i2]=(Math.random()*2-1)*Math.pow(1-i2/d2.length,1.5);
    var src2=_bbAC.createBufferSource();
    src2.buffer=buf2;
    var f2=_bbAC.createBiquadFilter();
    f2.type='highpass';f2.frequency.value=6000;
    src2.connect(f2);f2.connect(g);
    g.gain.setValueAtTime(0.4,time);
    g.gain.exponentialRampToValueAtTime(0.001,time+0.05);
    src2.start(time);
  } else if(type==='sub'){
    var o2=_bbAC.createOscillator();
    o2.type='sine';
    o2.connect(g);
    o2.frequency.setValueAtTime(55,time);
    g.gain.setValueAtTime(0.8,time);
    g.gain.exponentialRampToValueAtTime(0.001,time+0.18);
    o2.start(time);o2.stop(time+0.18);
  } else if(type==='perc'){
    var o3=_bbAC.createOscillator();o3.type='triangle';o3.connect(g);
    o3.frequency.setValueAtTime(400,time);
    o3.frequency.exponentialRampToValueAtTime(80,time+0.08);
    g.gain.setValueAtTime(0.5,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.1);
    o3.start(time);o3.stop(time+0.1);
  } else if(type==='tom'){
    var ot=_bbAC.createOscillator();ot.type='sine';ot.connect(g);
    ot.frequency.setValueAtTime(180,time);ot.frequency.exponentialRampToValueAtTime(60,time+0.12);
    g.gain.setValueAtTime(0.7,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.18);
    ot.start(time);ot.stop(time+0.2);
  } else if(type==='clap'){
    var bc=_bbAC.createBuffer(1,Math.ceil(_bbAC.sampleRate*0.08),_bbAC.sampleRate);
    var dc=bc.getChannelData(0);
    for(var ic=0;ic<dc.length;ic++)dc[ic]=(Math.random()*2-1)*Math.exp(-ic/(_bbAC.sampleRate*0.025));
    var sc=_bbAC.createBufferSource();sc.buffer=bc;
    var fc=_bbAC.createBiquadFilter();fc.type='bandpass';fc.frequency.value=1200;fc.Q.value=0.5;
    sc.connect(fc);fc.connect(g);
    g.gain.setValueAtTime(0.8,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.1);
    sc.start(time);
  } else if(type==='rim'){
    var or2=_bbAC.createOscillator();or2.type='square';
    or2.frequency.setValueAtTime(1500,time);or2.connect(g);
    g.gain.setValueAtTime(0.3,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.04);
    or2.start(time);or2.stop(time+0.05);
  } else if(type==='open'){
    var boh=_bbAC.createBuffer(1,Math.ceil(_bbAC.sampleRate*0.3),_bbAC.sampleRate);
    var doh=boh.getChannelData(0);
    for(var ioh=0;ioh<doh.length;ioh++)doh[ioh]=(Math.random()*2-1)*Math.pow(1-ioh/doh.length,0.2);
    var soh=_bbAC.createBufferSource();soh.buffer=boh;
    var foh=_bbAC.createBiquadFilter();foh.type='highpass';foh.frequency.value=5000;
    soh.connect(foh);foh.connect(g);
    g.gain.setValueAtTime(0.5,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.3);
    soh.start(time);
  } else if(type==='fx'){
    var ofx=_bbAC.createOscillator();ofx.type='sawtooth';
    ofx.frequency.setValueAtTime(80+Math.random()*400,time);
    ofx.frequency.exponentialRampToValueAtTime(20,time+0.2);
    ofx.connect(g);g.gain.setValueAtTime(0.4,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.25);
    ofx.start(time);ofx.stop(time+0.28);
  }
}

var _bbTypes=['kick','snare','hh','sub','perc','tom','clap','rim','open','fx'];

function bbTick(){
  if(!_bbPlaying||!_bbAC||_bbAC.state==='suspended')return;
  var now=_bbAC.currentTime;
  _bbTracks.forEach(function(tr,ti){
    if(tr.steps[_bbStep])bbSynth(_bbTypes[ti],now);
  });
  bbRenderStep(_bbStep);
  _bbStep=(_bbStep+1)%24;
  var interval=60000/(_bbBPM*4);
  _bbSeqTimer=setTimeout(bbTick,interval);
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
  _bbTracks[track].steps[step]=_bbTracks[track].steps[step]?0:1;
  bbRender();
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
  var h='';
  _bbTracks.forEach(function(tr,ti){
    h+='<div class="bb-row">';
    h+='<div class="bb-label" style="color:'+tr.color+'">'+tr.name+'</div>';
    for(var s=0;s<24;s++){
      var grp=s%4===0?' bb-group-start':'';
      h+='<div class="bb-step'+grp+(tr.steps[s]?' bb-active':'')+'" data-action="bbToggleStep('+ti+','+s+')" ontouchend="event.preventDefault();bbToggleStep('+ti+','+s+');return false;"></div>';
    }
    h+='</div>';
  });
  grid.innerHTML=h;
}


function bbKave(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  var SR=44100;
  var stepDur=60/(_bbBPM*4); // duree d'un step en secondes (noires/4)
  var totalSteps=24;
  var totalDur=stepDur*totalSteps+0.5; // +0.5s de queue
  var offCtx=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,Math.ceil(SR*totalDur),SR);

  // Reproduire chaque piste via bbSynthOff
  _bbTracks.forEach(function(tr,ti){
    var type=_bbTypes[ti];
    if(!type)return;
    for(var s=0;s<tr.steps.length;s++){
      if(!tr.steps[s])continue;
      var t=s*stepDur;
      bbSynthOff(offCtx,type,t);
    }
  });

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
    a.href=url;a.download='katabatik.wav';
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},1000);
  }).catch(function(e){console.warn('bbKave render error',e);});
}
window.bbKave=bbKave;

// bbSynthOff : comme bbSynth mais sur un OfflineAudioContext
function bbSynthOff(oc,type,time){
  var g=oc.createGain();
  g.connect(oc.destination);
  if(type==='kick'){
    var o=oc.createOscillator();o.connect(g);
    o.frequency.setValueAtTime(120,time);
    o.frequency.exponentialRampToValueAtTime(30,time+0.15);
    g.gain.setValueAtTime(1.2,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.25);
    o.start(time);o.stop(time+0.25);
  } else if(type==='snare'){
    var buf=oc.createBuffer(1,Math.ceil(oc.sampleRate*0.12),oc.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,0.3);
    var src=oc.createBufferSource();src.buffer=buf;
    var f=oc.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=0.8;
    src.connect(f);f.connect(g);
    g.gain.setValueAtTime(0.7,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.12);
    src.start(time);
  } else if(type==='hh'){
    var buf2=oc.createBuffer(1,Math.ceil(oc.sampleRate*0.05),oc.sampleRate);
    var d2=buf2.getChannelData(0);
    for(var i2=0;i2<d2.length;i2++)d2[i2]=(Math.random()*2-1)*Math.pow(1-i2/d2.length,1.5);
    var src2=oc.createBufferSource();src2.buffer=buf2;
    var f2=oc.createBiquadFilter();f2.type='highpass';f2.frequency.value=6000;
    src2.connect(f2);f2.connect(g);
    g.gain.setValueAtTime(0.4,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.05);
    src2.start(time);
  } else if(type==='sub'){
    var o2=oc.createOscillator();o2.type='sine';o2.connect(g);
    o2.frequency.setValueAtTime(55,time);
    g.gain.setValueAtTime(0.8,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.18);
    o2.start(time);o2.stop(time+0.18);
  } else if(type==='perc'){
    var o3=oc.createOscillator();o3.type='triangle';o3.connect(g);
    o3.frequency.setValueAtTime(400,time);
    o3.frequency.exponentialRampToValueAtTime(80,time+0.08);
    g.gain.setValueAtTime(0.5,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.1);
    o3.start(time);o3.stop(time+0.1);
  } else if(type==='tom'){
    var ot=oc.createOscillator();ot.type='sine';ot.connect(g);
    ot.frequency.setValueAtTime(180,time);ot.frequency.exponentialRampToValueAtTime(60,time+0.12);
    g.gain.setValueAtTime(0.7,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.18);
    ot.start(time);ot.stop(time+0.2);
  } else if(type==='clap'){
    var bc=oc.createBuffer(1,Math.ceil(oc.sampleRate*0.08),oc.sampleRate);
    var dc=bc.getChannelData(0);
    for(var ic=0;ic<dc.length;ic++)dc[ic]=(Math.random()*2-1)*Math.exp(-ic/(oc.sampleRate*0.025));
    var sc=oc.createBufferSource();sc.buffer=bc;
    var fc=oc.createBiquadFilter();fc.type='bandpass';fc.frequency.value=1200;fc.Q.value=0.5;
    sc.connect(fc);fc.connect(g);
    g.gain.setValueAtTime(0.8,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.1);
    sc.start(time);
  } else if(type==='rim'){
    var or2=oc.createOscillator();or2.type='square';
    or2.frequency.setValueAtTime(1500,time);or2.connect(g);
    g.gain.setValueAtTime(0.3,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.04);
    or2.start(time);or2.stop(time+0.05);
  } else if(type==='open'){
    var boh=oc.createBuffer(1,Math.ceil(oc.sampleRate*0.3),oc.sampleRate);
    var doh=boh.getChannelData(0);
    for(var ioh=0;ioh<doh.length;ioh++)doh[ioh]=(Math.random()*2-1)*Math.pow(1-ioh/doh.length,0.2);
    var soh=oc.createBufferSource();soh.buffer=boh;
    var foh=oc.createBiquadFilter();foh.type='highpass';foh.frequency.value=5000;
    soh.connect(foh);foh.connect(g);
    g.gain.setValueAtTime(0.5,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.3);
    soh.start(time);
  } else if(type==='fx'){
    var ofx=oc.createOscillator();ofx.type='sawtooth';
    ofx.frequency.setValueAtTime(80+Math.random()*400,time);
    ofx.frequency.exponentialRampToValueAtTime(20,time+0.2);
    ofx.connect(g);g.gain.setValueAtTime(0.4,time);g.gain.exponentialRampToValueAtTime(0.001,time+0.25);
    ofx.start(time);ofx.stop(time+0.28);
  }
}
function bbRefresh(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  _bbTracks.forEach(function(tr){tr.steps=new Array(24).fill(0);});
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
  _bbDone=false;
  _bbStep=0;
  _bbBPM=90;
  _bbPlaying=false;
  if(_bbSeqTimer){clearTimeout(_bbSeqTimer);_bbSeqTimer=null;}
  // Pattern aleatoire de depart
  _bbTracks.forEach(function(tr,ti){
    tr.steps=new Array(24).fill(0);
    // Kick : 1, 9, 17, 25
    if(ti===0){tr.steps[0]=1;tr.steps[8]=1;tr.steps[16]=1;tr.steps[24]=1;}
    // Snare : 5, 13, 21, 29
    if(ti===1){tr.steps[4]=1;tr.steps[12]=1;tr.steps[20]=1;tr.steps[28]=1;}
    // HH : dense
    else if(ti===2){for(var s=0;s<32;s++)if(Math.random()<0.45)tr.steps[s]=1;}
    // Autres : pre-remplissage leger (~18%)
    else{for(var s2=0;s2<32;s2++)if(Math.random()<0.18)tr.steps[s2]=1;}
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
    ['c4-panel','pair-panel','og-panel'].forEach(function(id){
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
    ['c4-panel','pair-panel','og-panel'].forEach(function(id){
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


function pairInit(){
  var container=document.getElementById('pair-grid');
  var statusEl=document.getElementById('pair-status');
  if(!container||typeof FAUNA==='undefined'){if(container)container.innerHTML='';return;}
  var base=[];
  for(var i=0;i<FAUNA.length&&i<18;i++){
    var mask=FAUNA[i];
    var fp=(typeof FP!=='undefined'&&FP[mask.name])||{};
    var em=fp.emojis||'';
    var emoji=em.trim().split(/\s+/)[0]||String.fromCharCode(0x25CF);
    base.push({id:i,emoji:emoji,color:mask.c||'#c9a84c'});
  }
  var doubled=base.concat(base.map(function(c){return{id:c.id,emoji:c.emoji,color:c.color};}));
  for(var j=doubled.length-1;j>0;j--){
    var k=Math.floor(Math.random()*(j+1));
    var t=doubled[j];doubled[j]=doubled[k];doubled[k]=t;
  }
  var flipped=[],matched=[],locked=false,moves=0;
  function render(){
    container.style.display='grid';
    container.style.gridTemplateColumns='repeat(6,1fr)';
    container.style.gap='5px';
    container.style.width='100%';
    container.innerHTML='';
    for(var i2=0;i2<doubled.length;i2++){(function(idx){
      var card=doubled[idx];
      var isFlipped=flipped.indexOf(idx)>=0||matched.indexOf(card.id)>=0;
      var isMatched=matched.indexOf(card.id)>=0;
      var div=document.createElement('div');
      var rgb=hexToRgbKp(card.color);
      div.style.cssText='aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:4px;cursor:pointer;font-size:clamp(13px,3.8vw,19px);user-select:none;'+(isMatched?'background:rgba('+rgb.r+','+rgb.g+','+rgb.b+',.22);border:1px solid '+card.color+';':isFlipped?'background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.45);':'background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.16);');
      div.textContent=isFlipped?card.emoji:String.fromCharCode(0x25C6);
      if(!isMatched)div.style.color=isFlipped?'inherit':'rgba(201,168,76,.35)';
      div.addEventListener('click',function(){
        if(typeof kkClick==='function')try{kkClick();}catch(_ce){}
        if(locked||isMatched||flipped.indexOf(idx)>=0)return;
        flipped.push(idx);
        if(flipped.length===2){
          moves++;locked=true;
          var a=doubled[flipped[0]],b2=doubled[flipped[1]];
          if(a.id===b2.id){
            matched.push(a.id);flipped=[];locked=false;render();
            if(matched.length===18){
            if(statusEl)statusEl.textContent='Done!';
            setTimeout(function(){
              if(typeof _pairCtx!=='undefined'&&_pairCtx==='kk') bakuBoomToSynth(true);
              else bakuBoomToChessMenu();
            },1200);
          }
          } else {
            render();setTimeout(function(){flipped=[];locked=false;render();},800);
          }
        } else render();
        if(statusEl)statusEl.textContent=moves+' moves \u00b7 '+matched.length+'/18';
      });
      container.appendChild(div);
    })(i2);}
  }
  render();
  if(statusEl)statusEl.textContent='0 moves \u00b7 0/18';
}



function chRandomMask(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  var games=['c4','pair','bb'];
  var pick=games[Math.floor(Math.random()*games.length)];
  if(pick==='c4') c4Open('chess');
  else if(pick==='bb') beatboxOpen('chess');
  else pairOpen('chess');
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

// Paires contexte
var _pairCtx='chess';
function pairOpen(ctx){
  _pairCtx=ctx||'chess';
  var p=document.getElementById('pair-panel');
  if(!p)return;
  p.style.display='flex';
  var _tt=document.getElementById('title');
  if(_tt)_tt.style.visibility='hidden';
  pairInit();
}
function pairClose(){
  var p=document.getElementById('pair-panel');if(p)p.style.display='none';
}
window.pairOpen=pairOpen;window.pairClose=pairClose;

function c4Init(){
  var canvas=document.getElementById('c4-canvas');
  if(!canvas) return;
  var COLS=7,ROWS=6;
  var W=Math.min(window.innerWidth-32,360);
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

  var state={
    grid:grid,COLS:COLS,ROWS:ROWS,CW:CW,W:W,H:H,
    turn:1, over:false, winner:0,
    col1:col1, col2:col2,
    name1:_c4Name1, name2:_c4Name2,
    hover:-1, dropping:null, winLine:null
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
    } else {
      ctx.font=Math.round(CW*0.3)+'px "DM Mono",monospace';
      ctx.fillStyle='rgba(201,168,76,0.35)';
      ctx.fillText(state.turn===1?'your turn':'thinking\u2026',W/2,CW*0.72);
    }
    ctx.textAlign='left';
  }

  function drop(col){
    if(state.over||state.turn!==1) return;
    for(var r=ROWS-1;r>=0;r--){
      if(state.grid[r][col]===0){
        state.grid[r][col]=1;
        var win=checkWin(state.grid,r,col,1);
        if(win){state.over=true;state.winner=1;state.winLine=win;draw();return;}
        if(isFull()){state.over=true;draw();return;}
        state.turn=2;draw();
        setTimeout(aiMove,420);
        return;
      }
    }
  }

  function aiMove(){
    if(state.over) return;
    var best=pickBest();
    if(best<0) return;
    for(var r=ROWS-1;r>=0;r--){
      if(state.grid[r][best]===0){
        state.grid[r][best]=2;
        var win=checkWin(state.grid,r,best,2);
        if(win){state.over=true;state.winner=2;state.winLine=win;draw();return;}
        if(isFull()){state.over=true;draw();return;}
        state.turn=1;draw();
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
    var result=minimax(state.grid,7,-Infinity,Infinity,true);
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
      } else { c4Init(); }
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
