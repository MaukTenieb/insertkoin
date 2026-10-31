/* Borne Insert Koin — les blocs aimantés.
   Chaque bloc du meuble se saisit à la souris (appuyer puis glisser) ou au doigt (appui long), se déplace,
   s'aimante aux bords et aux axes des autres blocs, se colle contre eux, et revient à sa place s'il en passe près.
   Ramené près de sa place, le bloc s'y recolle. Positions gardées pour chaque skin, dans ce navigateur. */
(function(){
  var root=document.documentElement;
  var SEL=[
    ['plante','.b-pot'],['camera','.b-cam'],['fronton','.bar .brand'],['son','.bar .dock:first-of-type'],['hp','.bar .dock:last-of-type'],
    ['burrows','.b-land'],['lore','.b-lore'],['koins','.b-bezelfoot #koins'],['boom','.b-bezelfoot .b-boom'],
    ['boutons','.b-row2 .menu'],['manette','.b-panel .cabinets > .b-stick'],['plaque','.b-plate .b-badge'],['fente','.b-slot'],['molettes','.b-knobs']
  ];
  var MAG=14,HOME=40,LONG=260;
  var blocks=[],drag=null,suppress=0;
  function skin(){return root.dataset.skin||'bois';}
  function key(){return 'borne.aimant.'+skin();}
  function load(){try{return JSON.parse(localStorage.getItem(key())||'{}')||{};}catch(e){return {};}}
  function save(){var o={};blocks.forEach(function(b){if(b.dx||b.dy)o[b.id]=[Math.round(b.dx),Math.round(b.dy)];});try{localStorage.setItem(key(),JSON.stringify(o));}catch(e){}}
  function put(b,x,y,anim){b.dx=x;b.dy=y;b.el.classList.toggle('b-moved',!!(x||y));
    clearTimeout(b.tt);b.el.style.transition=anim?'translate .32s cubic-bezier(.2,1.5,.4,1),scale .25s':'';if(anim)b.tt=setTimeout(function(){b.el.style.transition='';},400);b.el.style.translate=(x||y)?(x+'px '+y+'px'):'';}
  function collect(){
    var keys=[].slice.call(document.querySelectorAll('.b-panel .cabinets > .cab'));
    var list=SEL.map(function(s){return [s[0],document.querySelector(s[1])];});
    keys.forEach(function(k,i){list.push(['touche'+(i+1),k]);});
    var saved=load(),seen={};
    blocks=list.filter(function(x){return x[1]&&!seen[x[0]]&&(seen[x[0]]=1);}).map(function(x){
      var b={id:x[0],el:x[1],dx:0,dy:0};x[1].classList.add('b-mag');var s=saved[x[0]];if(s)put(b,s[0],s[1],false);return b;});
    var lost=false;blocks.forEach(function(b){if((b.dx||b.dy)&&!inside(b)){put(b,0,0,false);lost=true;}});if(lost)save();
  }
  /* un bloc doit rester sur le meuble, aux deux tiers au moins : sinon il revient à sa place */
  function inside(b){var w=document.querySelector('.wrap');if(!w||!b.el.offsetParent)return true;var W=w.getBoundingClientRect(),r=b.el.getBoundingClientRect();if(!r.width)return true;
    var ix=Math.max(0,Math.min(r.right,W.right)-Math.max(r.left,W.left)),iy=Math.max(0,Math.min(r.bottom,W.bottom)-Math.max(r.top,W.top));return ix*iy>=r.width*r.height*.66;}
  function of(t){for(var i=0;i<blocks.length;i++)if(blocks[i].el===t||blocks[i].el.contains(t))return blocks[i];return null;}
  /* l'aimant : bords contre bords, bords alignés, axes alignés ; et la place d'origine */
  function snap(b,x,y){
    var r=b.el.getBoundingClientRect(),w=r.width,h=r.height,l0=r.left-b.dx,t0=r.top-b.dy,L=l0+x,T=t0+y,bx=null,by=null,dbx=MAG+1,dby=MAG+1;
    if(Math.hypot(x,y)<HOME)return [0,0,true];
    blocks.forEach(function(o){if(o===b||!o.el.offsetParent)return;var q=o.el.getBoundingClientRect();if(!q.width)return;
      [[q.left,0],[q.right,0],[q.left,w],[q.right,w],[q.left+q.width/2,w/2]].forEach(function(c){var d=Math.abs(L+c[1]-c[0]);if(d<dbx){dbx=d;bx=c[0]-c[1]-l0;}});
      [[q.top,0],[q.bottom,0],[q.top,h],[q.bottom,h],[q.top+q.height/2,h/2]].forEach(function(c){var d=Math.abs(T+c[1]-c[0]);if(d<dby){dby=d;by=c[0]-c[1]-t0;}});
    });
    return [bx!=null?bx:x,by!=null?by:y,false];
  }
  function grab(b,e){drag.on=true;try{window.__borneSon&&window.__borneSon.suck();}catch(_){}b.el.classList.add('b-held');root.classList.add('b-holding');
    try{b.el.setPointerCapture(e.pointerId);}catch(_){}
    if(navigator.vibrate)try{navigator.vibrate(12);}catch(_){}}
  function down(e){if(e.button>0||drag)return;var b=of(e.target);if(!b)return;
    if(b.id==='manette'){var rr=b.el.getBoundingClientRect();if(e.clientY<rr.top+rr.height*.74)return;}
    drag={b:b,id:e.pointerId,x:e.clientX,y:e.clientY,dx:b.dx,dy:b.dy,on:false,touch:true,t:0};
    if(drag.touch)drag.t=setTimeout(function(){if(drag&&!drag.on&&!drag.moved)grab(b,e);},LONG);}
  function move(e){if(!drag||e.pointerId!==drag.id)return;var mx=e.clientX-drag.x,my=e.clientY-drag.y;
    if(!drag.on){if(Math.hypot(mx,my)>8){if(drag.touch){drag.moved=true;clearTimeout(drag.t);drag=null;return;}grab(drag.b,e);}else return;}
    e.preventDefault();var s=snap(drag.b,drag.dx+mx,drag.dy+my);put(drag.b,s[0],s[1],false);drag.b.el.classList.toggle('b-docked',s[2]);}
  function up(e){if(!drag||e.pointerId!==drag.id)return;clearTimeout(drag.t);var d=drag;drag=null;
    if(!d.on)return;suppress=Date.now();d.b.el.classList.remove('b-held','b-docked');root.classList.remove('b-holding');
    var s=snap(d.b,d.b.dx,d.b.dy);put(d.b,s[0],s[1],false);if(!inside(d.b))s=[0,0];put(d.b,s[0],s[1],true);save();try{window.__borneSon&&setTimeout(window.__borneSon.clack,120);}catch(_){}}
  document.addEventListener('pointerdown',down,true);
  document.addEventListener('pointermove',move,{capture:true,passive:false});
  document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
  document.addEventListener('touchmove',function(e){if(drag&&drag.on)e.preventDefault();},{capture:true,passive:false});
  document.addEventListener('contextmenu',function(e){if(drag||Date.now()-suppress<600){if(of(e.target))e.preventDefault();}},true);
  document.addEventListener('click',function(e){if(Date.now()-suppress<350&&of(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);
  /* MIX : les compartiments s'empilent au hasard, de travers, les uns sur les autres ; puis chacun retrouve sa place */
  window.__borneMix=function(on){var vw=innerWidth,vh=innerHeight;blocks.forEach(function(b,i){if(!b.el.offsetParent)return;
      if(!on){var sv=load()[b.id]||[0,0];put(b,sv[0],sv[1],true);return;}var r=b.el.getBoundingClientRect(),l0=r.left-b.dx,t0=r.top-b.dy;
      var x=(Math.random()*.7+.15)*vw-r.width/2-l0,y=(scrollY?0:0)+(Math.random()*.7+.15)*vh-r.height/2-t0;
      setTimeout(function(){put(b,Math.round(x),Math.round(y),true);b.el.style.rotate=((Math.random()*2-1)*9).toFixed(1)+'deg';b.el.style.zIndex=40+Math.floor(Math.random()*30);try{window.__borneSon&&window.__borneSon.clack();}catch(e){}},i*45);});
    if(!on)blocks.forEach(function(b){b.el.style.rotate='';b.el.style.zIndex='';});};
  /* Lore se tourne : deux doigts qui pivotent dessus, ou la molette de la souris au-dessus ; l'angle reste dans ce navigateur */
  (function(){var lore=null,P={},a0=null,r0=0;
    function el(){return lore||(lore=document.querySelector('.b-lore'));}
    function rot(){var e=el();return e?parseFloat(getComputedStyle(e).getPropertyValue('--lr'))||0:0;}
    function set(v){var e=el();if(!e)return;v=Math.max(-180,Math.min(180,v));e.style.setProperty('--lr',v.toFixed(1)+'deg');try{localStorage.setItem('borne.lore.rot',v.toFixed(1));}catch(_){}}
    function ang(){var k=Object.keys(P);if(k.length<2)return null;var a=P[k[0]],b=P[k[1]];return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;}
    document.addEventListener('pointerdown',function(e){var l=el();if(!l||!l.contains(e.target))return;P[e.pointerId]={x:e.clientX,y:e.clientY};if(Object.keys(P).length===2){a0=ang();r0=rot();if(drag){clearTimeout(drag.t);drag=null;}e.preventDefault();e.stopImmediatePropagation();}},true);
    document.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]={x:e.clientX,y:e.clientY};if(a0!=null){var a=ang();if(a!=null){set(r0+a-a0);e.preventDefault();}}},{capture:true,passive:false});
    function up(e){if(P[e.pointerId]){delete P[e.pointerId];if(Object.keys(P).length<2){if(a0!=null){suppress=Date.now();try{window.__borneSon&&window.__borneSon.tick();}catch(_){}}a0=null;}}}
    document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
    document.addEventListener('wheel',function(e){var l=el();if(!l||!l.contains(e.target)||!(e.shiftKey||e.altKey))return;e.preventDefault();set(rot()+(e.deltaY>0?6:-6));},{passive:false});
    setTimeout(function(){try{var v=localStorage.getItem('borne.lore.rot');if(v!=null&&el())el().style.setProperty('--lr',v+'deg');}catch(_){}},1500);})();

  /* un autre skin, d'autres places */
  new MutationObserver(function(){var saved=load();blocks.forEach(function(b){var s=saved[b.id]||[0,0];put(b,s[0],s[1],true);});}).observe(root,{attributes:true,attributeFilter:['data-skin']});
  function start(){collect();}
  if(document.readyState==='complete')setTimeout(start,700);else addEventListener('load',function(){setTimeout(start,700);});
})();
