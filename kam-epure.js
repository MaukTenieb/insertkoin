/* Kamera, épure (21 nov. 2026). Habillage : kam-epure.css.
   Surface : cinq touches (caméra, annuler, valider, enregistrer, tiroir), la molette des familles, la bande des rendus.
   Sur l'image : glisser à l'horizontale change de rendu dans la famille, glisser à la verticale règle l'intensité,
   double toucher ouvre la planche contact ; l'appui maintenu garde son rôle (avant / après).
   Chaque touche de la bande appelle la touche d'origine : aucune fonction ne change de place dans le code. */
(function(){
  'use strict';
  var D=document,H=D.documentElement;
  function $(id){return D.getElementById(id);}
  function fr(){return H.lang==='fr';}
  function ok(){return typeof S!=='undefined'&&typeof visibleCards==='function'&&typeof pick==='function'&&typeof render==='function';}

  /* ---- son : un cran mécanique, très bas, au geste seulement ---- */
  var AC=null;
  function tick(f){try{if(H.classList.contains('fx-off'))return;AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    var t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.setValueAtTime(f||1900,t);o.frequency.exponentialRampToValueAtTime(380,t+.018);
    g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.0001,t+.03);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.035);}catch(e){}}

  /* ---- la bande ---- */
  var ICON={cam:'i-camera',undo:'i-undo',keep:'i-check',save:'i-save',more:'i-more'};
  var LAB={cam:['Camera','Caméra'],undo:['Undo','Annuler'],keep:['Keep','Valider'],save:['Save','Enregistrer'],more:['Drawer','Tiroir']};
  function key(k,cls){var b=D.createElement('button');b.type='button';b.dataset.kb=k;b.className='key'+(cls?' '+cls:'');/* matière : touche en caoutchouc du caméscope (borne-kam.css) */
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#'+ICON[k]+'"/></svg>';return b;}
  function label(b){var l=LAB[b.dataset.kb][fr()?1:0];b.setAttribute('aria-label',l);b.title=l;}
  function press(b){b.classList.add('kp');setTimeout(function(){b.classList.remove('kp');},90);tick(1500);}
  function bande(){
    var ins=$('inspector');if(!ins||ins.querySelector('.kam-bande'))return!!ins;
    var row=D.createElement('div');row.className='kam-bande';row.setAttribute('role','toolbar');
    var cam=key('cam'),undo=key('undo'),keep=key('keep'),save=key('save','kam-sv'),more=key('more');
    [cam,undo,keep,save,more].forEach(function(b){row.appendChild(b);label(b);});
    var srcCam=function(){return D.querySelector('#kSrc [data-k=cam]');};
    cam.onclick=function(){press(cam);var o=srcCam();if(o)o.click();};
    undo.onclick=function(){press(undo);var o=$('bUndo');if(o)o.click();};
    keep.onclick=function(){press(keep);var o=$('bKeep');if(o)o.click();};
    save.onclick=function(){press(save);var o=$('bSave');if(o)o.click();};
    more.onclick=function(){press(more);H.classList.toggle('kam-tiroir');more.setAttribute('aria-pressed',String(H.classList.contains('kam-tiroir')));};
    more.setAttribute('aria-pressed','false');
    /* reflets des états d'origine : caméra ouverte, touches inactives */
    function setA(el,k,v){if(el.getAttribute(k)!==v)el.setAttribute(k,v);}
    function sync(){var o=srcCam();setA(cam,'aria-pressed',String(!!o&&(o.getAttribute('aria-pressed')==='true'||o.classList.contains('on'))));
      [['bUndo',undo],['bKeep',keep],['bSave',save]].forEach(function(p){var o=$(p[0]),d=!!(o&&o.disabled);if(p[1].disabled!==d)p[1].disabled=d;});}
    var mo=new MutationObserver(sync);['kSrc','bUndo','bKeep','bSave'].forEach(function(id){var e=$(id);if(e)mo.observe(e,{subtree:true,attributes:true,attributeFilter:['aria-pressed','disabled','class']});});sync();
    ins.insertBefore(row,ins.firstChild);
    new MutationObserver(function(){[cam,undo,keep,save,more].forEach(label);}).observe(H,{attributes:true,attributeFilter:['lang']});
    return true;
  }

  /* ---- l'afficheur ---- */
  var osd=null,osdT=0;
  function curKey(){return S.cur?S.cur.id+(S.cur.pi>=0?'#'+S.cur.pi:''):'';}
  function show(withBar){
    var st=$('stage');if(!st)return;if(!osd||!osd.isConnected){osd=D.createElement('div');osd.className='kam-osd';osd.setAttribute('aria-hidden','true');st.appendChild(osd);}
    var L=visibleCards().filter(swipable),k=curKey(),i=-1;for(var j=0;j<L.length;j++)if(L[j].k===k){i=j;break;}
    var nm=(($('lbName')||{}).textContent||'').toUpperCase();
    var a=S.cur&&S.cur.amt!=null?S.cur.amt:1;
    osd.innerHTML='<span class="n">'+(i<0?'—':(i+1))+'/'+L.length+'</span> '+esc(nm)+(withBar?'<span class="bar" style="--a:'+Math.round(a*100)+'%"></span>':'');
    osd.classList.add('on');clearTimeout(osdT);osdT=setTimeout(function(){osd.classList.remove('on');},1400);
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  /* ---- gestes sur l'image ---- */
  function swipable(c){return c&&c.op&&c.op.kind!=='interactive'&&c.op.kind!=='capture'&&!c.op.session;}
  function live(){return (typeof CAM!=='undefined'&&CAM)||(typeof VM!=='undefined'&&VM)||S.session;}
  function step(dir){
    var L=visibleCards().filter(swipable);if(!L.length)return;var k=curKey(),i=-1;
    for(var j=0;j<L.length;j++)if(L[j].k===k){i=j;break;}
    var n=i<0?(dir>0?0:L.length-1):(i+dir+L.length)%L.length,c=L[n];
    pick(c);tick(2100);
    var b=$('grid')&&$('grid').querySelector('[data-k="'+(window.CSS&&CSS.escape?CSS.escape(c.k):c.k)+'"]');if(b&&b.scrollIntoView)b.scrollIntoView({block:'nearest',inline:'nearest'});
    show(false);
  }
  var amtT=0;
  function setAmt(a){if(!S.cur)return;a=Math.max(.05,Math.min(1,a));a=Math.round(a*20)/20;if(S.cur.amt===a||(S.cur.amt==null&&a===1))return;
    S.cur.amt=a===1?undefined:a;if(a===1)delete S.cur.amt;tick(900+a*1400);show(true);
    clearTimeout(amtT);amtT=setTimeout(function(){render();},16);}
  function gestes(){
    var st=$('stage');if(!st||st.dataset.kamG)return!!st;st.dataset.kamG='1';
    var p=null,lastTap=0;
    st.addEventListener('pointerdown',function(e){if(e.target.closest('button')||live())return;
      p={x:e.clientX,y:e.clientY,id:e.pointerId,mode:'',a0:S.cur&&S.cur.amt!=null?S.cur.amt:1,h:st.getBoundingClientRect().height||300,steps:0};},true);
    st.addEventListener('pointermove',function(e){if(!p||e.pointerId!==p.id)return;var dx=e.clientX-p.x,dy=e.clientY-p.y;
      if(!p.mode){if(Math.abs(dx)>18&&Math.abs(dx)>Math.abs(dy)*1.3)p.mode='h';else if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)*1.3&&S.cur)p.mode='v';
        if(p.mode){if(S.cmp){S.cmp=false;}try{st.setPointerCapture(e.pointerId);}catch(_){}}}
      if(p.mode==='h'){var s=Math.trunc(dx/70);while(p.steps<s){p.steps++;step(-1);}while(p.steps>s){p.steps--;step(1);}}
      else if(p.mode==='v'){setAmt(p.a0-dy/(p.h*.8));}
      if(p.mode)e.preventDefault();});
    function end(e){if(!p||e.pointerId!==p.id)return;var m=p.mode;p=null;
      if(m){if(S.cmp){S.cmp=false;}render();return;}
      var now=performance.now();if(e.type==='pointerup'&&now-lastTap<320){lastTap=0;planche(true);}else lastTap=now;}
    st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
    st.style.touchAction='none';
    return true;
  }

  /* ---- planche contact ---- */
  var pOpen=0;
  function planche(on){
    var g=$('grid'),fr_=D.querySelector('.ike-frame')||$('stage');if(!g||!fr_)return;
    if(on){if(H.classList.contains('kam-tiroir'))H.classList.remove('kam-tiroir');
      var r=fr_.getBoundingClientRect();H.classList.add('kam-planche');pOpen=performance.now();
      g.style.setProperty('left',r.left+'px','important');g.style.setProperty('top',r.top+'px','important');
      g.style.setProperty('width',r.width+'px','important');g.style.setProperty('height',r.height+'px','important');
      var cur=g.querySelector('[aria-pressed=true]');if(cur)cur.scrollIntoView({block:'center'});tick(700);}
    else{H.classList.remove('kam-planche');['left','top','width','height'].forEach(function(k){g.style.removeProperty(k);});}
  }
  D.addEventListener('click',function(e){if(!H.classList.contains('kam-planche')||performance.now()-pOpen<450)return;
    if(e.target.closest('#grid .frame')){setTimeout(function(){planche(false);show(false);},0);}
    else if(!e.target.closest('#grid'))planche(false);},true);
  D.addEventListener('keydown',function(e){if(e.key==='Escape'&&H.classList.contains('kam-planche'))planche(false);
    if(!ok()||live()||/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||''))return;
    if(e.key==='ArrowRight'){step(1);e.preventDefault();}else if(e.key==='ArrowLeft'){step(-1);e.preventDefault();}
    else if(e.key==='ArrowUp'&&S.cur){setAmt((S.cur.amt!=null?S.cur.amt:1)+.05);e.preventDefault();}
    else if(e.key==='ArrowDown'&&S.cur){setAmt((S.cur.amt!=null?S.cur.amt:1)-.05);e.preventDefault();}});
  addEventListener('resize',function(){if(H.classList.contains('kam-planche'))planche(true);});

  /* ---- mise en route ---- */
  var n=0;(function boot(){if(ok()&&bande()&&gestes()){H.classList.add('kam-epure');return;}if(++n<200)setTimeout(boot,50);})();
})();
