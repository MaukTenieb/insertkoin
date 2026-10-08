/*
 * =============================================================================
 * COPYRIGHT NOTICE AND INTELLECTUAL PROPERTY DECLARATION
 * =============================================================================
 *
 * Copyright © 2024 Mauk Tenieb & Korhogo.
 * ALL RIGHTS RESERVED.
 *
 * The games loaded by this file (Fauna Chess, Erratic, Faunarratics, Katabatik,
 * Kapture) are the exclusive intellectual property of Mauk Tenieb. See the full
 * COPYRIGHT NOTICE reproduced at the top of every file in this folder.
 *
 * For licensing inquiries, permissions, or commercial arrangements, contact:
 * mauktenieb@gmail.com
 * =============================================================================
 */

/* KG -- lazy loader for the Korhogo games.
 *
 *   KG.open(name)  -> Promise   name: 'chess' | 'erratic' | 'faunarratics' | 'katabatik' | 'kapture'
 *                               Loads (once) kg/core.* + the game's files, injects the panel markup,
 *                               then calls the original entry point. Resolves with the name.
 *   KG.onclose     = null       Set to function(name){...}; called once when the game's own close /
 *                               back button has closed its panel(s).
 *   KG.onwin       = null       [KG] Set to function(name,detail){...}; called once per win:
 *                               'chess'     player beats the AI (takes the King)      detail {winner,level,moves}
 *                               'erratic'   all pairs found (original mWin)           detail {pairs,moves,time}
 *                               'katabatik' player wins Connect 4                    detail {game:'c4',ctx}
 *                               (Sampler / Hangman / Mastermind have no win hook; the original Beat Box never fired.)
 *   KG.isOpen(name)             true while a game opened with KG.open is on screen.
 *   KG.stats                    bytes fetched per file (for diagnostics).
 *
 * Markup goes into #kg-root if the page has one, otherwise at the end of <body>, inside
 * <div class="kg-layer"> (fixed, 0x0, z-index 1000: above the host page, below the full-screen
 * BakuBoom flashes which the original code appends to <body> with z-index 99999).
 */
(function(){
  if(window.KG&&window.KG.__kg)return;
  var cur=document.currentScript;
  var BASE=((cur&&cur.src)?cur.src.replace(/[^\/?#]*([?#].*)?$/,''):'')+'kg-';
  var FONTS='https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap';
  var FACES=["00-honey-buzzard.jpg","01-c7h5n3o6.jpg","02-silent-pact.jpg","03-poisoned-well.jpg","04-hatra-loves.jpg","05-plague-of-justinian.jpg","06-maiden-call.jpg","07-truce.jpg","08-ts-ui-pen.jpg","09-aube.jpg","10-grand-colonel.jpg","11-malika.jpg","12-auvergne.jpg","13-cadaver-synod.jpg","14-croisiere-noire.jpg","15-naphta.jpg","16-unkle-maukie.jpg","17-dogxim.jpg"];

  // module = one css + one html fragment + one js file, loaded in this order
  var MODS={
    core:{faces:false},
    katabatik:{faces:false},
    chess:{faces:false},
    erratic:{faces:true},
    faunarratics:{faces:true},
    kapture:{faces:false},
    vhs:{faces:false}
  };
  // game -> modules (after core), entry point, panels whose visibility defines "open"
  var GAMES={
    chess:       {mods:['chess'],             roots:['chess'],                          entry:function(){window.openChess();}},
    erratic:     {mods:['erratic'],           roots:['mem'],                            entry:function(){window.openMem();}},
    faunarratics:{mods:['faunarratics'],      roots:['konklave-panel'],                 entry:function(){window.openFaunarratics();}},
    katabatik:   {mods:['katabatik'],         roots:['c4-panel','bb-panel','hang-panel','mm-panel'], entry:function(){window.chRandomMask();}},
    // what a click on #kapture-btn does in the original (mousedown+mouseup without drag -> kaptureStart)
    kapture:     {mods:['kapture'],           roots:['kapture-overlay'],                entry:function(){window.kaptureStart();}},
    // VHS deck: library + recorder warm up in the background, the deck opens on the scrapes
    vhs:         {mods:['vhs'],               roots:['vhs'],                            entry:function(){window.kgVhsOpen();}}
  };

  var KG={__kg:1,onclose:null,onwin:null,base:BASE,games:Object.keys(GAMES),stats:{}};
  var cache={};           // url -> promise
  var modDone={};         // module -> promise
  var sessions={};        // game -> {seen,timer,t0}
  var layer=null;

  function note(url,bytes){KG.stats[url.replace(BASE,'')]=bytes;}
  function fetchText(url){
    if(!cache[url])cache[url]=fetch(url,{credentials:'same-origin'}).then(function(r){
      if(!r.ok)throw new Error('KG: '+r.status+' '+url);return r.text();
    }).then(function(t){note(url,new Blob([t]).size);return t;});
    return cache[url];
  }
  function loadCss(url){
    if(!cache[url])cache[url]=new Promise(function(res,rej){
      var l=document.createElement('link');l.rel='stylesheet';l.href=url;l.setAttribute('data-kg','');
      l.onload=function(){res();};l.onerror=function(){rej(new Error('KG: css '+url));};
      document.head.appendChild(l);
    }).then(function(){sizeOf(url);});
    return cache[url];
  }
  function loadJs(url){
    if(!cache[url])cache[url]=new Promise(function(res,rej){
      var s=document.createElement('script');s.src=url;s.async=false;s.setAttribute('data-kg','');
      s.onload=function(){res();};s.onerror=function(){rej(new Error('KG: js '+url));};
      document.body.appendChild(s);
    }).then(function(){sizeOf(url);});
    return cache[url];
  }
  function sizeOf(url){
    try{var e=performance.getEntriesByName(url);if(e&&e.length){var x=e[e.length-1];note(url,x.encodedBodySize||x.transferSize||0);}}catch(_e){}
  }
  function ensureLayer(){
    if(layer&&layer.isConnected)return layer;
    layer=document.querySelector('.kg-layer');
    if(!layer){
      layer=document.createElement('div');layer.className='kg-layer';
      if(KG.zIndex)layer.style.zIndex=String(KG.zIndex);
      (document.getElementById('kg-root')||document.body).appendChild(layer);
    }
    return layer;
  }
  function ensureFonts(){
    var links=document.querySelectorAll('link[href*="fonts.googleapis.com"]'),all='';
    for(var i=0;i<links.length;i++)all+=links[i].href;
    if(all.indexOf('Bebas+Neue')<0||all.indexOf('DM+Mono')<0||all.indexOf('Archivo')<0){
      var l=document.createElement('link');l.rel='stylesheet';l.href=FONTS;l.setAttribute('data-kg','');document.head.appendChild(l);
    }
  }
  function inject(html){
    var t=document.createElement('template');t.innerHTML=html;
    ensureLayer().appendChild(t.content);
  }
  /* [IK] the 18 portraits come in one file: kg-faces.json = [base64, ...] in FACES order */
  function loadFaces(){
    if(!cache.__faces)cache.__faces=fetch(BASE+'faces.json').then(function(r){if(!r.ok)throw new Error('KG: '+r.status+' faces');return r.text();}).then(function(t){
      note(BASE+'faces.json',t.length);var arr=JSON.parse(t);
      if(typeof FAUNA!=='undefined')arr.forEach(function(b64,i){if(FAUNA[i])FAUNA[i].face=b64;});});
    return cache.__faces;
  }
  // css + html fetched in parallel, html injected before the js runs (some module code looks up
  // its elements at load time), faces attached before the js runs (erratic builds MF from FAUNA)
  function loadMod(m){
    if(modDone[m])return modDone[m];
    var css=loadCss(BASE+m+'.css'),html=fetchText(BASE+m+'.html');
    modDone[m]=Promise.all([css,html]).then(function(r){
      inject(r[1]);
      return MODS[m].faces?loadFaces():null;
    }).then(function(){return loadJs(BASE+m+'.js');}).then(function(){if(HOOKS[m])HOOKS[m]();});
    return modDone[m];
  }

  // ---------------------------------------------------------------------------------------------
  // [KG] Win hooks: the original functions are wrapped from outside, game logic is untouched.
  // (Global function declarations are window properties, so the games' own internal calls and
  //  setTimeout(fn) references go through the wrappers.)
  function win(name,detail){
    if(typeof KG.onwin==='function'){try{KG.onwin(name,detail);}catch(e){setTimeout(function(){throw e;});}}
  }
  var HOOKS={
    chess:function(){
      // [IK] the original never clears the game-over flag when a new game starts from the menu: a second game froze
      var st=window.chStart;if(typeof st==='function'&&!st.__ik){window.chStart=function(){window.chOver=false;return st.apply(this,arguments);};window.chStart.__ik=1;}
      // chDoMove sets chOver when a King is taken; the side that just moved (chTurn) wins.
      var orig=window.chDoMove;
      window.chDoMove=function(r1,c1,r2,c2,board,sim){
        var was=chOver,mover=chTurn;
        var res=orig.apply(this,arguments);
        if(!sim&&!was&&chOver&&chMode==='ai'&&mover===chPlayerColour)
          win('chess',{winner:mover==='w'?'White':'Black',level:chAiLv,moves:chLog.length});
        return res;
      };
    },
    erratic:function(){
      var orig=window.mWin;
      window.mWin=function(){var res=orig.apply(this,arguments);win('erratic',{pairs:mPairs,moves:mMoves,time:mElapsed});return res;};
    },
    katabatik:function(){
      // [KG] i18n: Connect 4 canvas texts ('your turn', 'thinking\u2026', '\u2026 WINS', 'DRAW');
      // redraw on language change via the game's own mousemove handler (off-board -> no hover)
      if(window.KGI18N&&window.KGI18N.wrapCanvas)window.KGI18N.wrapCanvas(document.getElementById('c4-canvas'),function(cv){
        try{cv.dispatchEvent(new MouseEvent('mousemove',{clientX:-9999,clientY:-9999}));}catch(e){}
      });
      // Connect 4: the game state is private to c4Init(); the player's win is the only
      // '<NAME> WINS' banner drawn synchronously inside a click/tap on the canvas (drop(), turn 1);
      // the AI's win is drawn from a timer (aiMove).
      var cv=document.getElementById('c4-canvas');if(!cv)return;
      var c2d=cv.getContext('2d'),inTap=false,c4Won=false;
      var oC4=window.c4Open;
      window.c4Open=function(){c4Won=false;return oC4.apply(this,arguments);};
      var oRefresh=window.c4Refresh;
      if(oRefresh)window.c4Refresh=function(){c4Won=false;return oRefresh.apply(this,arguments);};
      ['click','touchend'].forEach(function(t){
        cv.parentNode.addEventListener(t,function(e){if(e.target===cv){inTap=true;setTimeout(function(){inTap=false;},0);}},true);
      });
      var oFill=c2d.fillText;
      c2d.fillText=function(txt){
        if(inTap&&!c4Won&&/ WINS$/.test(String(txt))){c4Won=true;win('katabatik',{game:'c4',ctx:typeof _c4Ctx!=='undefined'?_c4Ctx:''});}
        return oFill.apply(this,arguments);
      };
    },
    vhs:function(){
      // The library module (kg-vhs-library.js) ships the KGI18N bridge and
      // reads CHANNEL.SCRAPE in the background; the recorder wires the shelf.
      if(window.KGVHSLibrary&&typeof window.KGVHSLibrary.ready==='function')window.KGVHSLibrary.ready();
    }
  };
  // ---------------------------------------------------------------------------------------------

  function visible(el){
    if(!el||!el.isConnected)return false;
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)===0)return false;
    var r=el.getBoundingClientRect();
    return r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<window.innerHeight-1&&r.left<window.innerWidth-1;
  }
  function anyVisible(name){
    var ids=GAMES[name].roots;
    for(var i=0;i<ids.length;i++)if(visible(document.getElementById(ids[i])))return true;
    return false;
  }
  function refreshLayerClasses(){
    var l=ensureLayer(),on=false;
    Object.keys(GAMES).forEach(function(g){var o=!!sessions[g];l.classList.toggle('kg-open-'+g,o);if(o)on=true;});
    l.classList.toggle('kg-on',on);
  }
  function endSession(name){
    var s=sessions[name];if(!s)return;
    clearInterval(s.timer);delete sessions[name];refreshLayerClasses();
    /* [IK] Kapture: couper cam/micro/enregistreur même quand la fermeture vient d'ailleurs
       (BACK de l'arcade, KG.close, disparition du panneau) — l'overlay seul se cache sinon. */
    if(name==='kapture'&&window.kaptureClose){try{window.kaptureClose();}catch(e){}}
    if(typeof KG.onclose==='function'){try{KG.onclose(name);}catch(e){setTimeout(function(){throw e;});}}
  }
  function watch(name){
    if(sessions[name])clearInterval(sessions[name].timer);
    var s=sessions[name]={seen:false,hidden:0,t0:Date.now()};
    refreshLayerClasses();
    s.timer=setInterval(function(){
      if(anyVisible(name)){s.seen=true;s.hidden=0;return;}
      if(!s.seen){if(Date.now()-s.t0>5000){console.warn('KG: '+name+' panel never became visible');endSession(name);}return;}
      if(++s.hidden>=2)endSession(name);  // hidden on two consecutive checks (~300 ms)
    },150);
  }

  KG.open=function(name){
    var g=GAMES[name];
    if(!g)return Promise.reject(new Error('KG: unknown game "'+name+'"'));
    ensureLayer();ensureFonts();
    var chain=loadMod('core');
    g.mods.forEach(function(m){chain=chain.then(function(){return loadMod(m);});});
    return chain.then(function(){
      g.roots.forEach(function(id){if(forced[id]){var el=document.getElementById(id);if(el)el.style.display='';delete forced[id];}});
      watch(name);
      g.entry();
      return name;
    });
  };
  KG.isOpen=function(name){return !!sessions[name];};
  /* [IK] close from the host page (BACK / BAKU BOOM of Insert Koin): hide the game's panels the way their own close buttons leave them */
  var forced={};
  KG.close=function(name){
    var names=name?[name]:Object.keys(sessions);
    names.forEach(function(n){var g=GAMES[n];if(!g)return;
      g.roots.forEach(function(id){var el=document.getElementById(id);if(!el)return;el.classList.remove('open');if(visible(el)){el.style.display='none';forced[id]=1;}});
      document.body.style.overflow='';
      var s=sessions[n];if(s){clearInterval(s.timer);delete sessions[n];}
      /* [IK] Kapture: voir endSession — BACK de l'arcade ne doit rien laisser tourner */
      if(n==='kapture'&&window.kaptureClose){try{window.kaptureClose();}catch(e){}}});
    refreshLayerClasses();
  };
  window.KG=KG;
})();
