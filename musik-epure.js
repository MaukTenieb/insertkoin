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
  }
  var mo=new MutationObserver(scan);
  function scan(){var m=D.getElementById('mz');if(m&&m.querySelector('.mzbar')){setup(m);mo.disconnect();}}/* relecture : l'observateur s'arrête une fois Musik habillé (il coûtait un appel à chaque changement du site) */
  mo.observe(D.documentElement,{childList:true,subtree:true});scan();
})();
