/*
 * Copyright © 2024 Mauk Tenieb & Korhogo. ALL RIGHTS RESERVED.
 * (See the full COPYRIGHT NOTICE at the top of kg/core.js.)
 *
 * [KG] i18n layer for the Korhogo games -- not part of the original kofa.js. The game code is untouched:
 * every text node / attribute (placeholder, title, aria-label, alt) inside the KG layer is swapped
 * after the games write it, through a MutationObserver; canvas texts go through a fillText wrapper.
 * The original English is remembered per node, so switching back restores it exactly.
 *
 * Language source: document.documentElement.lang ('fr' -> French, anything else -> English), observed
 * live with a MutationObserver. KG.setLang('fr'|'en') forces a language (it also works on hosts that
 * never touch <html lang>); a later change of <html lang> takes over again.
 */
(function(){
  if(window.KGI18N)return;
  var D=window.KG_I18N_FR||{exact:[],words:{}};
  var EX={};D.exact.forEach(function(p){EX[p[0]]=p[1];});
  var W=D.words||{};
  var lang='en',forced=null;

  function w(x){return W[x]!==undefined?W[x]:x;}
  // dynamic strings built by the game code: [regex, replacement function]
  var RULES=[
    [/^(White|Black)'S TURN$/,function(m){return m[1]==='White'?'AUX BLANCS':'AUX NOIRS';}],
    [/^Black: (.+)$/,function(m){return 'Noirs : '+m[1];}],
    [/^(\d+) moves · (\d+:\d\d)$/,function(m){return m[1]+' coups · '+m[2];}],
    [/^(\d+) moves · (\d+)\/18$/,function(m){return m[1]+' coups · '+m[2]+'/18';}],
    [/^BEST: (.*)$/,function(m){return 'RECORDS : '+m[1].replace(/(\d+) pairs: (\d+) moves · /g,'$1 paires : $2 coups · ');}],
    [/^(\d+) pairs$/,function(m){return m[1]+' paires';}],
    [/^(.+) WINS$/,function(m){return m[1]+' GAGNE';}],
    [/^Join the (.+)$/,function(m){return 'Rejoins les '+w(m[1]);}],
    [/^KONTEXT (\d+) ON 3$/,function(m){return 'KONTEXT '+m[1]+' SUR 3';}],
    [/^STORY (\d+) ON (\d+)$/,function(m){return 'HISTOIRE '+m[1]+' SUR '+m[2];}],
    [/^(\d+) LEFT$/,function(m){return m[1]+(m[1]==='1'?' RESTANT':' RESTANTS');}],
    [/^(\d+) MASKS PLAYED$/,function(m){return m[1]+' MASKS JOUÉS';}],
    [/^(\d+) Masks played\. The Kerema holds — for now\.$/,function(m){return m[1]+' Masks joués. Le Kerema tient — pour l\'instant.';}],
    [/^(\d+) cards$/,function(m){return m[1]+' cartes';}],
    [/^STORY (\d+) ·$/,function(m){return 'HISTOIRE '+m[1]+' ·';}],
    [/^(.*▸ )STORY (\d+)$/,function(m){return m[1]+'HISTOIRE '+m[2];}],
    [/^(\S+) ×$/,function(m){return W[m[1]]!==undefined?W[m[1]]+' ×':null;}],
    [/^┈┈ (.*) ┈┈$/,function(m){var t=EX[m[1]];return t?'┈┈ '+t+' ┈┈':null;}],
    [/^(Pick|Select|Choose|Steal) any (\w+) — visual or sound\.$/,function(m){return w(m[1])+" n'importe quel "+w(m[2])+' — visuel ou sonore.';}],
    [/^(Stay|Remain|Keep it) (.+)\.$/,function(m){return W[m[2]]!==undefined?w(m[1])+' '+W[m[2]]+'.':null;}],
    [/^Make it (.+)\.$/,function(m){return W[m[1]]!==undefined?'Rends-le '+W[m[1]]+'.':null;}],
    [/^Mini-Stories: (.*)$/,function(m){return 'Mini-récits : '+m[1];}]
  ];
  function tr(s){
    if(EX[s]!==undefined)return EX[s];
    for(var i=0;i<RULES.length;i++){var m=RULES[i][0].exec(s);if(m){var r=RULES[i][1](m);if(r!=null)return r;}}
    return null;
  }
  // composed lines (e.g. "faction · emojis — attributes"): translate the pieces
  function trSplit(s){
    var t=tr(s);if(t!=null)return t;
    if(W[s]!==undefined)return W[s];
    var seps=[' — ',' · '];
    for(var k=0;k<seps.length;k++){
      if(s.indexOf(seps[k])>=0){
        var parts=s.split(seps[k]),ch=false;
        for(var j=0;j<parts.length;j++){var p=W[parts[j]]!==undefined?W[parts[j]]:trSplit(parts[j]);if(p!==parts[j]){parts[j]=p;ch=true;}}
        return ch?parts.join(seps[k]):s;
      }
    }
    return s;
  }
  function T(s){
    if(lang!=='fr'||s==null)return s;
    var str=String(s),m=/^(\s*)([\s\S]*?)(\s*)$/.exec(str);
    if(!m[2]||!/[A-Za-z]/.test(m[2]))return str;
    return m[1]+trSplit(m[2])+m[3];
  }

  // ---------- DOM ----------
  var ATTRS=['placeholder','title','aria-label','alt'];
  var ORIG=new WeakMap(),SET=new WeakMap();
  function skip(n){var p=n.parentNode;return !p||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(p.nodeName);}
  function doText(n){
    if(skip(n))return;
    var cur=n.nodeValue;
    if(SET.get(n)!==cur)ORIG.set(n,cur);          // written by the game: this is the new original
    var o=ORIG.get(n),want=lang==='fr'?T(o):o;
    SET.set(n,want);
    if(want!==cur)n.nodeValue=want;
  }
  function doAttr(el,a){
    var v=el.getAttribute(a);if(v==null)return;
    var st=el.__kgA||(el.__kgA={}),r=st[a]||(st[a]={});
    if(r.set!==v)r.orig=v;
    var want=lang==='fr'?T(r.orig):r.orig;r.set=want;
    if(want!==v)el.setAttribute(a,want);
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===3){doText(root);return;}
    if(root.nodeType!==1&&root.nodeType!==11)return;
    if(root.nodeType===1)ATTRS.forEach(function(a){if(root.hasAttribute(a))doAttr(root,a);});
    var it=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT),n;
    while((n=it.nextNode())){
      if(n.nodeType===3)doText(n);
      else ATTRS.forEach(function(a){if(n.hasAttribute(a))doAttr(n,a);});
    }
  }
  var watched=[],mo=null;
  function onMut(list){
    list.forEach(function(r){
      if(r.type==='characterData')doText(r.target);
      else if(r.type==='attributes'){if(ATTRS.indexOf(r.attributeName)>=0)doAttr(r.target,r.attributeName);}
      else r.addedNodes.forEach(function(n){walk(n);});
    });
  }
  function watch(root){
    if(!root||watched.indexOf(root)>=0)return;
    watched.push(root);
    if(!mo)mo=new MutationObserver(onMut);
    mo.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
    walk(root);
  }
  // messages the original code appends straight to <body> (BakuBoom verdict overlay, z-index 99999)
  var bodyMo=new MutationObserver(function(list){
    list.forEach(function(r){r.addedNodes.forEach(function(n){
      if(n.nodeType===1&&/z-index:\s*99999/.test(n.getAttribute('style')||'')&&n.textContent.trim())watch(n);
    });});
  });
  function start(){if(document.body)bodyMo.observe(document.body,{childList:true});}

  // ---------- canvas ----------
  var canvases=[];
  function wrapCanvas(cv,redraw){
    if(!cv||cv.__kgI18n)return;cv.__kgI18n=1;
    var c=cv.getContext('2d'),of=c.fillText;
    c.fillText=function(t){var a=Array.prototype.slice.call(arguments);a[0]=T(t);return of.apply(this,a);};
    canvases.push({cv:cv,redraw:redraw});
  }

  // ---------- language ----------
  function detect(){return forced||((document.documentElement.getAttribute('lang')||'en').toLowerCase().indexOf('fr')===0?'fr':'en');}
  function refresh(){
    var l=detect();if(l===lang)return;lang=l;
    watched.forEach(function(r){if(r.isConnected!==false)walk(r);});
    canvases.forEach(function(x){try{x.redraw&&x.redraw(x.cv);}catch(e){}});
  }
  new MutationObserver(function(){forced=null;refresh();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  lang=detect();
  start();

  window.KGI18N={
    t:T,watch:watch,wrapCanvas:wrapCanvas,
    lang:function(){return lang;},
    setLang:function(l){forced=(l==='fr'?'fr':'en');refresh();},
    // konklave.txt download (kkBuildTxt): translate the section headers of the file
    txt:function(s){return lang==='fr'?String(s).split('\n').map(function(line){return line==='-- STORY --'?'-- HISTOIRE --':line;}).join('\n'):s;}
  };
})();
