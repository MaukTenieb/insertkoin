
/*
 * Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna
 * Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related
 * material — including characters, names, symbols, rules, lore and texts, in any form or
 * medium — are the exclusive property of Korhogo™. The source code of this site is
 * published for reading, reflections, additions, requests, etc. - the lore, names, marks
 * and works remain the property of the author. No use for training artificial
 * intelligence. Contact: mauktenieb@gmail.com
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
/* [IK] a fair shuffle (Fisher-Yates) */
function mShuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
/* [IK] the whole deck fits the frame: as many columns as it takes for every card to be seen at once */
function mFit(){
  var board=document.getElementById('m-board');if(!board||!mCards.length)return;
  var W=board.clientWidth-16,H=board.clientHeight-16,N=mCards.length,gap=6,best=null;
  if(W<=0||H<=0)return;
  for(var c=3;c<=12;c++){var w=(W-gap*(c-1))/c,h=w/.72,rows=Math.ceil(N/c);var hh=(H-gap*(rows-1))/rows;var s=Math.min(w,hh*.72);if(!best||s>best.s)best={c:c,s:s};}
  board.style.gridTemplateColumns='repeat('+best.c+','+Math.floor(best.s)+'px)';
  board.style.justifyContent='center';board.style.gap=gap+'px';
}
window.addEventListener('resize',function(){var g=document.getElementById('m-game');if(g&&!g.classList.contains('hidden'))mFit();});
function mStart(n){
  sndBtn();mLastPairs=n;mPairs=n;mMoves=0;mMatched=0;mFlipped=[];mCanFlip=true;mElapsed=0;
  document.getElementById('m-pairs').textContent='0/'+n;
  document.getElementById('m-moves').textContent='0';
  document.getElementById('m-time').textContent='0:00';
  clearInterval(mTimer);mTimer=setInterval(function(){mElapsed++;document.getElementById('m-time').textContent=mFmt(mElapsed);},1000);
  var pool=mShuffle(MF.slice()).slice(0,n);
  var deck=[];pool.forEach(function(f){deck.push({f:f,id:f.name});deck.push({f:f,id:f.name});});
  mShuffle(deck);mCards=deck;
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
  setTimeout(mFit,0);
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
