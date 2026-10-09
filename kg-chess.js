
/*
 * Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna
 * Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related
 * material — including characters, names, symbols, rules, lore and texts, in any form or
 * medium — are the exclusive property of Korhogo™. The source code of this site is
 * published for reading, reflections, additions, requests, etc. - the lore, names, marks
 * and works remain the property of the author. No use for training artificial
 * intelligence. Contact: mauktenieb@gmail.com
 */

/* KG module "chess" -- FAUNA CHESS (panel #chess). Code copied verbatim from kofa.js (Korhogo). */

// \u2500\u2500 FAUNA CHESS\u2122 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
var chBoard,chTurn,chSel,chHints=[],chLastMove,chLog=[],chMode=null,chAiLv=2,chOver=false;
// Avatar piece names \u2014 randomised per game for variants
var chNames={
  w:{K:'Unkle Maukie',Q:'Aube',R1:'Honey Buzzard',R2:'Plague of Justinian',B1:"Ts\u2019ui P\xean",B2:'C7H5N3O6',G:'Grand Colonel'},
  b:{K:'dogXim',Q:'Maiden Call',R1:'Auvergne',R2:'Poisoned Well',B1:'H\xe1tra L\xf6v\xe9s',B2:'Silent Pact',M:'Malika'}
};
// Croisi\u00e8re Noire replaces one black rook, Naphta replaces Maiden Call 50/50
function randomiseAvatars(){
  // Naphta: random Dame blanche ou noire
  var naphtaSide=Math.random()<.5?'b':'w';
  if(naphtaSide==='b'){chNames.b.Q='Naphta';chNames.w.Q='Aube';}
  else{chNames.w.Q='Naphta';chNames.b.Q='Maiden Call';}
  // Croisi\u00e8re Noire: random Tour blanche ou noire
  var cnSide=Math.random()<.5?'b':'w';
  if(cnSide==='b'){
    if(Math.random()<.5)chNames.b.R1='Croisi\u00e8re Noire';
    else chNames.b.R2='Croisi\u00e8re Noire';
  } else {
    if(Math.random()<.5)chNames.w.R1='Croisi\u00e8re Noire';
    else chNames.w.R2='Croisi\u00e8re Noire';
  }
}
var WH={K:'\u2654',Q:'\u2655',R:'\u2656',B:'\u2657',G:'\u2295'},BL={K:'\u265a',Q:'\u265b',R:'\u265c',B:'\u265d',M:'\u2297'};
var chDeployMode='default';
function chPickDeploy(mode){
  chDeployMode=mode;
  var d=document.getElementById('ch-deploy-default');
  var r2=document.getElementById('ch-deploy-random');
  if(d)d.classList.toggle('on',mode==='default');
  if(r2)r2.classList.toggle('on',mode==='random');
}
window.chPickDeploy=chPickDeploy;
function openChess(){
  var ch=document.getElementById('chess');
  if(ch)ch.classList.add('open');
  chDeployMode='default';
  chOver=false;chInGame=false;
  var sel=document.getElementById('chess-sel');
  if(sel)sel.style.display='flex';
  var bd=document.getElementById('chess-board');if(bd)bd.style.visibility='hidden';
}
function closeChess(){
  chInGame=false;
  var _ch=document.getElementById('chess');if(_ch)_ch.classList.remove('open');
  var _cp=document.getElementById('crazy-panel');if(_cp)_cp.classList.remove('open');
  var _jp=document.getElementById('journal-panel');if(_jp)_jp.classList.remove('open');
  if(typeof crazyTimer!=='undefined'&&crazyTimer)clearTimeout(crazyTimer);
  if(typeof crazyHideTimer!=='undefined'&&crazyHideTimer)clearTimeout(crazyHideTimer);
  sndClose();
}
function chConfirmQuit(){closeChess();}
function chBakuBoom(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  _bakuGlitch(function(){closeChess();});
}
window.chBakuBoom=chBakuBoom;
function chDoQuit(){document.getElementById('chess-confirm').classList.remove('show');closeChess();}
function chCancelQuit(){document.getElementById('chess-confirm').classList.remove('show');sndClose();}
function chDoRestart(){document.getElementById('chess-confirm').classList.remove('show');chRestart();}
function chModeBack(){document.getElementById('chess-sel').style.display='flex';document.getElementById('chess-over').classList.remove('show');sndClose();}
function chRestart(){chInit();document.getElementById('chess-over').classList.remove('show');document.getElementById('chess-sel').style.display='none';chRender();chLogRender();}
function chInit(){
  chSeen={};chQuiet=0;
  randomiseAvatars();
  chBoard=[];for(var r=0;r<8;r++){chBoard[r]=[];for(var c=0;c<8;c++)chBoard[r][c]=null;}
  // White back rank (row 7): \u00b7 R B Q K B R \u00b7
  chBoard[7][1]={t:'R',col:'w',av:chNames.w.R1||'Honey Buzzard'};
  chBoard[7][2]={t:'B',col:'w',av:"Ts\u2019ui P\u00ean"};
  chBoard[7][3]={t:'Q',col:'w',av:chNames.w.Q||'Aube'};
  chBoard[7][4]={t:'K',col:'w',av:'Unkle Maukie'};
  chBoard[7][5]={t:'B',col:'w',av:'C7H5N3O6'};
  chBoard[7][6]={t:'R',col:'w',av:chNames.w.R2||'Plague of Justinian'};
  // Black back rank (row 0)
  chBoard[0][1]={t:'R',col:'b',av:chNames.b.R1};
  chBoard[0][2]={t:'B',col:'b',av:'H\u00e1tra L\u00f6v\u00e9s'};
  chBoard[0][3]={t:'Q',col:'b',av:chNames.b.Q};
  chBoard[0][4]={t:'K',col:'b',av:'dogXim'};
  chBoard[0][5]={t:'B',col:'b',av:'Silent Pact'};
  chBoard[0][6]={t:'R',col:'b',av:chNames.b.R2};
  var gcC=3,mkC=4;
  if(typeof chDeployMode!=='undefined'&&chDeployMode==='random'){
    var f3=[],f4=[];
    for(var ci2=0;ci2<8;ci2++){
      if(!chBoard[3][ci2])f3.push(ci2);
      if(!chBoard[4][ci2])f4.push(ci2);
    }
    if(f3.length)gcC=f3[Math.floor(Math.random()*f3.length)];
    if(f4.length)mkC=f4[Math.floor(Math.random()*f4.length)];
  }
  chBoard[3][gcC]={t:'G',col:'w',moved:false,av:'Grand Colonel'};
  chBoard[4][mkC]={t:'M',col:'b',moved:false,av:'Malika'};
}
function chIsSpec(p){return p&&(p.t==='G'||p.t==='M');}
function chCanCap(att,tgt){
  if(!tgt)return true;
  if(att.col===tgt.col)return false;
  if(chIsSpec(att)&&chIsSpec(tgt))return false;
  if(chIsSpec(tgt)&&!tgt.moved)return false;
  return true;
}
function chCopy(b){return b.map(function(row){return row.map(function(p){return p?{t:p.t,col:p.col,moved:p.moved,av:p.av}:null;});});}
function chRawMoves(r,c,board){
  var p=board[r][c];if(!p)return[];var moves=[];
  function tryAdd(nr,nc){if(nr<0||nr>=8||nc<0||nc>=8)return;var t=board[nr][nc];if(chCanCap(p,t))moves.push([nr,nc]);}
  function slide(dr,dc){for(var i=1;i<8;i++){var nr=r+dr*i,nc=c+dc*i;if(nr<0||nr>=8||nc<0||nc>=8)break;var t=board[nr][nc];if(t){if(chCanCap(p,t))moves.push([nr,nc]);break;}moves.push([nr,nc]);}}
  if(p.t==='K'||chIsSpec(p)){[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(function(d){tryAdd(r+d[0],c+d[1]);});}
  if(p.t==='R'){[[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){slide(d[0],d[1]);});}
  if(p.t==='B'){[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d){slide(d[0],d[1]);});}
  if(p.t==='Q'){[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d){slide(d[0],d[1]);});}
  return moves;
}
/* [IK] draws: the same position three times, or fifty moves each without a capture */
var chSeen={},chQuiet=0;
function chKey(board,turn){var k=turn;for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=board[r][c];k+=p?(p.col+p.t+(p.moved?'*':'')):'.';}return k;}
function chDraw(why){
  chOver=true;
  document.getElementById('chess-over-h').textContent='Draw';
  document.getElementById('chess-over-h').style.color='#c9a84c';
  document.getElementById('chess-over-p').textContent=why==='rep'?'\u2014 the same position, three times':'\u2014 fifty moves without a capture';
  document.getElementById('chess-over').classList.add('show');
  document.getElementById('chess-status').textContent='GAME OVER';
  chRender();
}
function chDoMove(r1,c1,r2,c2,board,sim){
  board=board||chBoard;var nb=chCopy(board);var p=nb[r1][c1];var cap=nb[r2][c2];
  nb[r2][c2]=p;nb[r1][c1]=null; // avatar name preserved in p.av
  if(chIsSpec(p))nb[r2][c2].moved=true;
  if(!sim){
    chBoard=nb;chLastMove=[r1,c1,r2,c2];
    chLog.push({col:chTurn,n:String.fromCharCode(97+c1)+(8-r1)+String.fromCharCode(97+c2)+(8-r2)});
    chLogRender();
    if(cap)beep(260,.12,.15,'sawtooth');else beep(hexFreq(chTurn==='w'?'#c9a84c':'#5566bb'),.06,.1);
    if(cap&&cap.t==='K'){
      chOver=true;var winner=chTurn==='w'?'White':'Black';
      document.getElementById('chess-over-h').textContent=winner;
      document.getElementById('chess-over-h').style.color=chTurn==='w'?'#c9a84c':'#8899ff';
      document.getElementById('chess-over-p').textContent='wins \u2014 King taken';
      document.getElementById('chess-over').classList.add('show');
      document.getElementById('chess-status').textContent='GAME OVER';
      sndWin();chRender();return nb;
    }
    chTurn=chTurn==='w'?'b':'w';
    chQuiet=cap?0:chQuiet+1;var pk=chKey(nb,chTurn);chSeen[pk]=(chSeen[pk]||0)+1;
    if(chSeen[pk]>=3){chDraw('rep');return nb;}
    if(chQuiet>=100){chDraw('fifty');return nb;}
    chRender();
    if(chMode==='ai'&&chTurn!==chPlayerColour&&!chOver){if(typeof chAiThink==='function')chAiThink();setTimeout(chAiMove,420);}
  }
  return nb;
}
function chSqClick(r,c){
  if(chOver)return;
  // In AI mode, only allow player's colour
  if(chMode==='ai'&&chTurn!==chPlayerColour)return;
  var p=chBoard[r][c];
  if(chSel){
    var isH=chHints&&chHints.some(function(h){return h&&h[0]===r&&h[1]===c;});
    if(isH){chDoMove(chSel[0],chSel[1],r,c);chSel=null;chHints=[];return;}
  }
  if(p&&p.col===chTurn){
    chSel=[r,c];chHints=chRawMoves(r,c,chBoard);beep(hexFreq('#c9a84c'),.05,.08);
    var av=getAvName(p);
    if(av) document.getElementById('chess-status').textContent=av.toUpperCase();
  }
  else{
    // Invalid tap \u2014 flash red on square
    if(!p||p.col!==chTurn){
      var sqs=document.getElementById('chess-board').children;
      var idx=r*8+c;
      if(sqs[idx]){
        sqs[idx].style.background='rgba(255,60,60,.4)';
        setTimeout(function(){if(sqs[idx])sqs[idx].style.background='';},280);
      }
      beep(180,.08,.08,'sawtooth');
    }
    chSel=null;chHints=[];
  }
  chRender();
}
function chRender(){
  var bd=document.getElementById('chess-board');bd.innerHTML='';
  var flip=(chMode==='ai'&&chPlayerColour==='b')||(chMode==='2p'&&false);
  for(var ri=0;ri<8;ri++){for(var ci=0;ci<8;ci++){
    var r=flip?(7-ri):ri;var c=flip?(7-ci):ci;
    var sq=document.createElement('div');sq.className='sq '+((r+c)%2===0?'light':'dark');
    var p=chBoard[r][c];
    if(chSel&&chSel[0]===r&&chSel[1]===c)sq.classList.add('sel');
    if(chHints&&chHints.some(function(h){return h&&h[0]===r&&h[1]===c;}))sq.classList.add('hint');
    if(chLastMove&&((chLastMove[0]===r&&chLastMove[1]===c)||(chLastMove[2]===r&&chLastMove[3]===c)))sq.classList.add('last');
    if(chIsSpec(p)&&!p.moved)sq.style.outline='2px solid '+(p.col==='w'?'rgba(201,168,76,.6)':'rgba(200,80,50,.6)');
    if(p){
      var pe=document.createElement('div');pe.className='piece '+p.col;
      pe.textContent=p.col==='w'?(WH[p.t]||'?'):(BL[p.t]||'?');
      // Couleur et halo selon camp
      if(p.col==='w'){
        pe.style.color='#c9a84c';
        pe.style.filter='drop-shadow(0 0 3px rgba(201,168,76,.6)) drop-shadow(0 0 7px rgba(201,168,76,.3))';
      } else {
        pe.style.color='#b87fff';
        pe.style.filter='drop-shadow(0 0 3px rgba(153,85,221,.6)) drop-shadow(0 0 7px rgba(153,85,221,.3))';
      }
      // Boost leger sur les pieces du joueur actif
      if(p.col===chTurn&&!chOver){
        if(p.col==='w') pe.style.filter='drop-shadow(0 0 5px rgba(255,220,80,.8)) drop-shadow(0 0 12px rgba(201,168,76,.5))';
        else pe.style.filter='drop-shadow(0 0 5px rgba(216,180,255,.8)) drop-shadow(0 0 12px rgba(153,85,221,.5))';
      }
      // Avatar name as tooltip
      var avName=getAvName(p);
      if(avName){pe.title=avName;pe.setAttribute('data-av',avName);}
      sq.appendChild(pe);
    }
    (function(row,col){sq.addEventListener('click',function(){chSqClick(row,col);});sq.addEventListener('touchend',function(e){e.preventDefault();chSqClick(row,col);},{passive:false});})(r,c);
    bd.appendChild(sq);
  }}
  if(!chOver){var turn=chTurn==='w'?'WHITE':'BLACK';document.getElementById('chess-status').textContent=turn+"'S TURN";}
  var _cpw=document.getElementById('cp-w');
  var _cpb=document.getElementById('cp-b');
  if(_cpw){_cpw.classList.toggle('active',chTurn==='w');
    _cpw.style.color=chTurn==='w'?'#c9a84c':'rgba(255,255,255,.35)';}
  if(_cpb){_cpb.classList.toggle('active',chTurn==='b');
    _cpb.style.color=chTurn==='b'?'#b87fff':'rgba(255,255,255,.35)';}
}
function chLogRender(){var el=document.getElementById('chess-log');el.innerHTML='';chLog.slice(-20).forEach(function(m){var s=document.createElement('span');s.className='cm '+m.col;s.textContent=m.n;el.appendChild(s);});el.scrollLeft=el.scrollWidth;}
// AI
var PV={K:10000,Q:900,R:500,B:330,G:400,M:400};
// Get avatar name for a piece (for tooltips + last move display)
var chRookCount={w:0,b:0},chBishCount={w:0,b:0};
function getAvName(p){
  if(!p)return '';
  // Use the avatar name stored on the piece itself
  if(p.av) return p.av;
  // Fallback for pieces without av (shouldn't happen)
  if(p.t==='K') return chNames[p.col]&&chNames[p.col].K||'';
  if(p.t==='Q') return chNames[p.col]&&chNames[p.col].Q||'';
  if(p.t==='G') return 'Grand Colonel';
  if(p.t==='M') return 'Malika';
  return '';
}

function chEval(board){var s=0;for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=board[r][c];if(!p)continue;var v=PV[p.t]||0;if(chIsSpec(p)&&p.moved)v-=50;var cd=Math.abs(c-3.5)+Math.abs(r-3.5);s+=(p.col==='w'?1:-1)*(v+(4-cd)*3);}return s;}
function chAllMoves(col,board){var moves=[];for(var r=0;r<8;r++)for(var c=0;c<8;c++){if(board&&board[r]&&board[r][c]&&board[r][c].col===col){var ms=chRawMoves(r,c,board);if(ms)ms.forEach(function(m){if(m&&m.length>=2)moves.push([r,c,m[0],m[1]]);});}}return moves;}
/* [IK] captures first (most valuable victim): alpha-beta then prunes far more */
function chOrder(moves,board){return moves.map(function(m){var t=board[m[2]][m[3]];return [t?(PV[t.t]||0):0,m];}).sort(function(x,y){return y[0]-x[0];}).map(function(x){return x[1];});}
function chMM(board,depth,a,b,max){
  if(depth===0)return chEval(board);
  var hasW=false,hasB=false;
  for(var ri=0;ri<8;ri++)for(var ci=0;ci<8;ci++){var pi=board[ri][ci];if(pi&&pi.t==='K'){if(pi.col==='w')hasW=true;else hasB=true;}}
  if(!hasW)return -99999;if(!hasB)return 99999;
  var col=max?'w':'b',moves=chOrder(chAllMoves(col,board),board);
  if(!moves.length)return max?-9999:9999;
  var best=max?-Infinity:Infinity;
  for(var i=0;i<moves.length;i++){
    var m=moves[i];
    if(!m||m.length<4)continue;
    var nb=chDoMove(m[0],m[1],m[2],m[3],chCopy(board),true);
    var v=chMM(nb,depth-1,a,b,!max);
    if(max){if(v>best)best=v;if(v>a)a=v;}
    else{if(v<best)best=v;if(v<b)b=v;}
    if(b<=a)break;
  }
  return best;
}
function chAiThink(){
  var bd=document.getElementById('chess-board');
  if(!bd)return;
  var phase=0;
  bd.style.transition='box-shadow 0.3s';
  window._chThinkIv=setInterval(function(){
    phase+=0.12;
    // Board pulse dore
    var al=(0.3+0.25*Math.sin(phase)).toFixed(2);
    var bl=(8+6*Math.sin(phase)).toFixed(0);
    if(bd)bd.style.boxShadow='0 0 '+bl+'px 2px rgba(201,168,76,'+al+')';
    // Pieces IA (noires) : halo violet qui pulse
    var aiPieces=bd.querySelectorAll('.piece.black');
    var vi=(0.4+0.35*Math.sin(phase+1)).toFixed(2);
    var vb=(10+8*Math.sin(phase+1)).toFixed(0);
    for(var pi=0;pi<aiPieces.length;pi++){
      aiPieces[pi].style.textShadow='0 0 2px #fff,0 0 '+vb+'px #d8b4ff,0 0 '+(+vb+8)+'px #9955dd,0 0 '+(+vb+20)+'px rgba(119,51,187,'+vi+')';
    }
  },60);
}
function chAiDone(){
  if(window._chThinkIv){clearInterval(window._chThinkIv);window._chThinkIv=null;}
  var bd=document.getElementById('chess-board');
  if(bd){
    bd.style.boxShadow='';bd.style.transition='';
    // Restaurer text-shadow par defaut
    var aiPieces=bd.querySelectorAll('.piece.black');
    for(var pi=0;pi<aiPieces.length;pi++){
      aiPieces[pi].style.textShadow='';
    }
  }
}

function chKeremaMove(){
  if(typeof kkClick==='function')try{kkClick();}catch(_e){}
  if(chOver||chMode!=='ai')return;
  if(chTurn!==chPlayerColour)return;
  var moves=chAllMoves(chPlayerColour,chBoard);
  if(!moves||!moves.length)return;
  var playerMax=(chPlayerColour==='w');
  var best=playerMax?-Infinity:Infinity;
  var bm=moves[Math.floor(Math.random()*moves.length)];
  for(var i=0;i<moves.length;i++){
    var mv=moves[i];if(!mv)continue;
    var nb=chDoMove(mv[0],mv[1],mv[2],mv[3],chCopy(chBoard),true);
    var sc=chMM(nb,chAiLv,-Infinity,Infinity,!playerMax);
    if(playerMax?sc>best:sc<best){best=sc;bm=mv;}
  }
  if(bm) chDoMove(bm[0],bm[1],bm[2],bm[3]);
}
window.chKeremaMove=chKeremaMove;

function chAiMove(){
  if(typeof chAiDone==='function')chAiDone();
  if(chOver)return;
  var aiC=(chPlayerColour==='w'?'b':'w');
  if(chTurn!==aiC)return;
  var moves=chAllMoves(aiC,chBoard);
  if(!moves||!moves.length)return;
  var aiMax=(aiC==='w');
  var best=aiMax?-Infinity:Infinity;
  // equal moves: a random one, not always the top-left piece
  for(var si=moves.length-1;si>0;si--){var sj=Math.floor(Math.random()*(si+1));var st=moves[si];moves[si]=moves[sj];moves[sj]=st;}
  moves=chOrder(moves,chBoard);
  var bm=moves[0];
  for(var i=0;i<moves.length;i++){
    var m=moves[i];if(!m)continue;
    var nb=chDoMove(m[0],m[1],m[2],m[3],chCopy(chBoard),true);
    var v=aiMax?chMM(nb,chAiLv,best,Infinity,false):chMM(nb,chAiLv,-Infinity,best,true);
    if(chSeen[chKey(nb,aiMax?'b':'w')]&&(aiMax?v>0:v<0))v+=aiMax?-60:60;
    if(aiMax?v>best:v<best){best=v;bm=m;}
  }
  if(bm){
    chDoMove(bm[0],bm[1],bm[2],bm[3]);
    // chDoMove already switches chTurn and calls setTimeout(chAiMove)
    // Show AI move badge
    var badge=document.getElementById('chess-ai-badge');
    if(badge){
      var cols='abcdefgh';
      badge.textContent=(aiC==='w'?'White':'Black')+': '+cols[bm[3]]+(8-bm[2]);
      badge.style.opacity='1';
      setTimeout(function(){badge.style.opacity='0';},2500);
    }
  }
}
var crazyTimer=null, crazyHideTimer=null;
var chPlayerColour='w'; // which side human plays
function chPickColour(col){
  chPlayerColour=col;
  var w=document.getElementById('ch-col-w'), b=document.getElementById('ch-col-b');
  if(w)w.classList.toggle('chosen',col==='w');
  if(b)b.classList.toggle('chosen',col==='b');
  if(typeof sndBtn==='function')sndBtn();
}

function chStart(mode,lv){
  chSeen={};chQuiet=0;sndBtn();chMode=mode;chAiLv=Math.max(1,Math.min(lv||2,3));
  if(chMode==='ai') chPlayerColour=Math.random()<0.5?'w':'b';
  else chPlayerColour='w';
  chInit();
  var _cs=document.getElementById('chess-sel');if(_cs)_cs.style.display='none';
  var _co=document.getElementById('chess-over');if(_co)_co.classList.remove('show');
  var _bd=document.getElementById('chess-board');if(_bd)_bd.style.visibility='';
  chTurn='w';chInGame=true;
  chRender();chLogRender();
  if(chMode==='ai'&&chPlayerColour==='b'){
    if(typeof chAiThink==='function')chAiThink();
    setTimeout(chAiMove,200);
  }
}
function showCrazyInChess(){
  if(chOver)return;
  var panel=document.getElementById('crazy-panel');
  if(panel)panel.classList.add('open');
  // Auto-hide after 10s if not interacted with
  if(crazyHideTimer)clearTimeout(crazyHideTimer);
  crazyHideTimer=setTimeout(function(){
    // Only hide if not actively using it (journal not open)
    if(!document.getElementById('journal-panel').classList.contains('open')){
      panel.classList.remove('open');
    }
  }, 10000);
}
function closeCrazyChess(){
  if(crazyHideTimer)clearTimeout(crazyHideTimer);
  document.getElementById('crazy-panel').classList.remove('open');
  sndClose();
}

// INIT
chInit();
try{window.chCancelQuit=chCancelQuit;}catch(e){}
try{window.chConfirmQuit=chConfirmQuit;}catch(e){}
try{window.chDoQuit=chDoQuit;}catch(e){}
try{window.chDoRestart=chDoRestart;}catch(e){}
try{window.chModeBack=chModeBack;}catch(e){}
try{window.chPickColour=chPickColour;}catch(e){}
try{window.chRestart=chRestart;}catch(e){}
try{window.chStart=chStart;}catch(e){}
try{window.closeChess=closeChess;}catch(e){}
try{window.closeCrazyChess=closeCrazyChess;}catch(e){}


// === Ensure all game launchers are global for data-action delegation ===
try{
  window.openChess=openChess;
}catch(e){}
