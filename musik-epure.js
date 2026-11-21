/* Musik, épure (21 nov. 2026). Habillage : musik-epure.css. La touche ⋯ ouvre le tiroir ; rien n'est retiré. */
(function(){
  'use strict';
  var D=document;
  function setup(m){
    if(m.dataset.mzEpure)return;var bar=m.querySelector('.mzbar');if(!bar)return;m.dataset.mzEpure='1';m.classList.add('mz-epure');
    var b=D.createElement('button');b.type='button';b.className='mzbt mz-more';b.setAttribute('aria-pressed','false');
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>';
    var lab=function(){var l=D.documentElement.lang==='fr'?'Tiroir':'Drawer';b.setAttribute('aria-label',l);b.title=l;};lab();
    b.onclick=function(){var on=m.classList.toggle('mz-tiroir');b.setAttribute('aria-pressed',String(on));try{dispatchEvent(new Event('resize'));}catch(_){}};
    var f=D.getElementById('mz-file');bar.insertBefore(b,f||null);
    /* test réel : une touche à curseurs de console ouvre la tranche de la piste choisie (volume, effets) sous la grille */
    var mx=D.createElement('button');mx.type='button';mx.className='mzbt mz-mixb';mx.setAttribute('aria-pressed','false');
    mx.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 3v18M12 3v18M18 3v18"/><rect x="3.5" y="13" width="5" height="3" rx=".8" fill="currentColor"/><rect x="9.5" y="7" width="5" height="3" rx=".8" fill="currentColor"/><rect x="15.5" y="11" width="5" height="3" rx=".8" fill="currentColor"/></svg>';
    var ml=function(){var l=D.documentElement.lang==='fr'?'Mixage':'Mix';mx.setAttribute('aria-label',l);mx.title=l;};ml();
    mx.onclick=function(){var on=m.classList.toggle('mz-mix');mx.setAttribute('aria-pressed',String(on));try{dispatchEvent(new Event('resize'));}catch(_){}};
    bar.insertBefore(mx,b);
    /* test réel : le clic droit sur une figurine coupe ou rend sa piste (même effet que le double-clic) */
    m.addEventListener('contextmenu',function(e){var f=e.target.closest('.mzfg');if(!f)return;e.preventDefault();e.stopPropagation();for(var i=0;i<2;i++)f.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,clientX:e.clientX,clientY:e.clientY,pointerType:'mouse',button:0}));},true);
    /* test réel : l'afficheur 96 règle le tempo (il renvoie ses gestes à la molette du tempo) */
    var lcd=D.getElementById('mz-bpm');
    function tk(){var t=D.getElementById('mz-tk');return t&&t.querySelector('.mzkn');}
    function nudge(n){var k=tk();if(!k)return;for(var i=0;i<Math.abs(n);i++)k.dispatchEvent(new WheelEvent('wheel',{deltaY:n>0?-1:1,bubbles:true,cancelable:true}));}
    if(lcd){lcd.title=D.documentElement.lang==='fr'?'Tempo':'Tempo';
      lcd.addEventListener('wheel',function(e){e.preventDefault();nudge(e.deltaY<0?1:-1);},{passive:false});
      var y0=null;lcd.addEventListener('pointerdown',function(e){y0=e.clientY;try{lcd.setPointerCapture(e.pointerId);}catch(_){}});
      lcd.addEventListener('pointermove',function(e){if(y0===null)return;var d=Math.trunc((y0-e.clientY)/6);if(d){nudge(d);y0-=d*6;}});
      lcd.addEventListener('pointerup',function(){y0=null;});lcd.addEventListener('pointercancel',function(){y0=null;});}
  }
  var mo=new MutationObserver(scan);
  function scan(){var m=D.getElementById('mz');if(m&&m.querySelector('.mzbar')){setup(m);mo.disconnect();}}/* relecture : l'observateur s'arrête une fois Musik habillé (il coûtait un appel à chaque changement du site) */
  mo.observe(D.documentElement,{childList:true,subtree:true});scan();

  /* infobulles (test réel, 22 nov.) : chaque picto de ce programme montre son nom au survol, tiré de son aria-label */
  (function(){function tt(root){if(!root)return;[].forEach.call(root.querySelectorAll('button[aria-label]:not([title]),[role=button][aria-label]:not([title])'),function(b){b.title=b.getAttribute('aria-label');});}
    var R='#mz';var go=function(){var r=typeof R==='string'?document.querySelector(R):R;if(r)tt(r);};go();setInterval(go,1500);})();
})();
