
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

/* KG module "erratic" -- ERRATIC memory game (panel #mem). Code copied verbatim from kofa.js (Korhogo). */
const MF=FAUNA.map(function(f){return{name:f.name,c:f.c,face:f.face};});

// \u2500\u2500 MEMORY GAME \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
var mPairs=6,mMoves=0,mMatched=0,mCards=[],mFlipped=[],mCanFlip=true,mTimer=null,mElapsed=0,mLastPairs=6,mBests={};
try{var bs=localStorage.getItem('kf_mem');if(bs)mBests=JSON.parse(bs);}catch(e){}
function saveMBests(){try{localStorage.setItem('kf_mem',JSON.stringify(mBests));}catch(e){}}
function mFmt(s){return Math.floor(s/60)+':'+(s%60<10?'0':'')+s%60;}
function openMem(){var m=document.getElementById('mem');if(m)m.classList.add('open');try{showMScores();}catch(e){}}
function closeMem(){document.getElementById('mem').classList.remove('open');clearInterval(mTimer);sndClose();}
function mShow(id){document.querySelectorAll('.m-screen').forEach(function(s){s.classList.add('hidden');});document.getElementById(id).classList.remove('hidden');}
function mMenuBack(){
  clearInterval(mTimer);mTimer=null;
  mShow('m-title');showMScores();sndBtn();
}
function mResumeTimer(){
  if(mMatched<mPairs&&!mTimer){
    mTimer=setInterval(function(){mElapsed++;document.getElementById('m-time').textContent=mFmt(mElapsed);},1000);
  }
}
function mRestartSame(){mStart(mLastPairs);}
function showMScores(){
  var lines=[];[[6],[9],[12],[18]].forEach(function(x){var b=mBests[x[0]];if(b)lines.push(x[0]+' pairs: '+b.moves+' moves \u00b7 '+mFmt(b.time));});
  document.getElementById('m-scores').textContent=lines.length?'BEST: '+lines.join(' | '):'';
}
function mStart(n){
  sndBtn();mLastPairs=n;mPairs=n;mMoves=0;mMatched=0;mFlipped=[];mCanFlip=true;mElapsed=0;
  document.getElementById('m-pairs').textContent='0/'+n;
  document.getElementById('m-moves').textContent='0';
  document.getElementById('m-time').textContent='0:00';
  clearInterval(mTimer);mTimer=setInterval(function(){mElapsed++;document.getElementById('m-time').textContent=mFmt(mElapsed);},1000);
  var pool=MF.slice().sort(function(){return Math.random()-.5;}).slice(0,n);
  var deck=[];pool.forEach(function(f){deck.push({f:f,id:f.name});deck.push({f:f,id:f.name});});
  deck.sort(function(){return Math.random()-.5;});mCards=deck;
  var cols=n<=6?3:4;
  var board=document.getElementById('m-board');board.style.gridTemplateColumns='repeat('+cols+',1fr)';board.innerHTML='';
  deck.forEach(function(card,i){
    var el=document.createElement('div');el.className='card';
    el.innerHTML='<div class="card-in"><div class="card-b"><div class="card-b-logo">KORHOGO!<br>\u25c8</div></div><div class="card-f" style="color:'+card.f.c+'"><img src="data:image/jpeg;base64,'+card.f.face+'" alt=""><div class="card-f-info"><div class="card-f-name" style="color:'+card.f.c+'">'+card.f.name+'</div><div class="card-f-bar" style="background:'+card.f.c+'"></div></div></div></div>';
    var go=function(e){e.preventDefault();mFlip(el,i,card);};
    el.addEventListener('click',go);el.addEventListener('touchend',go,{passive:false});
    // Subtle row tint by position
    var row=Math.floor(i/cols);
    var tint=row%2===0?'rgba(201,168,76,.03)':'rgba(100,120,200,.03)';
    el.querySelector('.card-b').style.background='#0e0e0e';
    el.querySelector('.card-b').style.boxShadow='inset 0 0 0 1000px '+tint;
    board.appendChild(el);card.el=el;
  });
  mShow('m-game');
}
function mFlip(el,i,card){
  if(!mCanFlip||el.classList.contains('flipped')||el.classList.contains('matched'))return;
  beep(hexFreq(card.f.c),.06,.1);el.classList.add('flipped');mFlipped.push({el:el,card:card});
  if(mFlipped.length<2)return;
  mCanFlip=false;mMoves++;document.getElementById('m-moves').textContent=mMoves;
  var a=mFlipped[0],b=mFlipped[1];mFlipped=[];
  if(a.card.id===b.card.id){
    setTimeout(function(){
      a.el.classList.add('matched');b.el.classList.add('matched');
      sndClick(a.card.f.c);
      var fn=document.getElementById('m-flash-name');fn.textContent=a.card.f.name;fn.style.color=a.card.f.c;
      var fl=document.getElementById('m-flash');fl.classList.remove('show');void fl.offsetWidth;fl.classList.add('show');
      mMatched++;document.getElementById('m-pairs').textContent=mMatched+'/'+mPairs;
      mCanFlip=true;if(mMatched===mPairs)setTimeout(mWin,800);
    },200);
  } else {
    setTimeout(function(){
      a.el.classList.add('wrong');b.el.classList.add('wrong');beep(180,.18,.12,'sawtooth');
      setTimeout(function(){a.el.classList.remove('flipped','wrong');b.el.classList.remove('flipped','wrong');mCanFlip=true;},400);
    },600);
  }
}
function mWin(){
  clearInterval(mTimer);sndWin();
  var k=mPairs,b=mBests[k];
  if(!b||mMoves<b.moves||(mMoves===b.moves&&mElapsed<b.time)){mBests[k]={moves:mMoves,time:mElapsed};saveMBests();}
  document.getElementById('m-win-score').textContent=mMoves+' moves \u00b7 '+mFmt(mElapsed);
  mShow('m-win');
}
try{window.closeMem=closeMem;}catch(e){}
try{window.mMenuBack=mMenuBack;}catch(e){}
try{window.mRestartSame=mRestartSame;}catch(e){}
try{window.mStart=mStart;}catch(e){}


// === Ensure all game launchers are global for data-action delegation ===
try{
  window.openMem=openMem;
}catch(e){}
