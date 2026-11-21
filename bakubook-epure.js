/* BakuBook, épure (21 nov. 2026) : les onglets des sources passent en pictogrammes ; le nom reste en infobulle et pour les lecteurs d'écran. */
(function(){
  'use strict';
  var S='fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  var P={
    stock:'<path d="M3 20.5h18"/><rect x="4" y="5" width="3.5" height="15.5" rx=".6"/><rect x="8.5" y="3.5" width="3.5" height="17" rx=".6"/><path d="M13.6 6.2l3.3-.9 3.6 14.6-3.3.9z"/>',
    file:'<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/><path d="M12 17.5v-6M9.5 14l2.5-2.5 2.5 2.5"/>',
    ia:'<path d="M3.5 9.5L12 4l8.5 5.5z"/><path d="M5.5 11.5v6.5M9.5 11.5v6.5M14.5 11.5v6.5M18.5 11.5v6.5"/><path d="M3.5 20.5h17"/>',
    gut:'<path d="M19.5 3.5C12 5 7.5 10 5.5 17.5"/><path d="M19.5 3.5c.5 6-3 10.5-10 11.5"/><path d="M4 20.5l1.5-3"/>',
    ws:'<path d="M7 5.5h11.5v12a2.5 2.5 0 0 1-2.5 2.5H6"/><path d="M7 5.5a2 2 0 1 0-4 0v1.5h4"/><path d="M6 20a2.5 2.5 0 0 0 2.5-2.5V16H3.5v1.5A2.5 2.5 0 0 0 6 20"/><path d="M10 9.5h6M10 12.5h6"/>',
    kd:'<rect x="5.5" y="3.5" width="13" height="17" rx="1.2"/><path d="M8.5 3.5v17"/><path d="M15 3.5v6l-1.5-1.2L12 9.5v-6"/>'
  };
  function go(){var ok=0;Object.keys(P).forEach(function(k){var b=document.querySelector('.tabs [data-p='+k+']');if(!b)return;
      if(b.querySelector('svg.pk')){ok++;return;}var t=(b.textContent||b.dataset.nm||'').trim();if(!t)return;
      b.dataset.nm=t;b.setAttribute('aria-label',t);b.title=t;b.innerHTML='<svg class="pk" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" '+S+'>'+P[k]+'</svg>';ok++;});
    return ok===6;}
  var st=document.createElement('style');st.textContent='.tabs button:has(svg.pk){display:flex;align-items:center;justify-content:center;min-width:48px;padding:8px 13px}.tabs button svg.pk{display:block}';
  document.head.appendChild(st);
  var n=0;(function t(){if(!go()&&++n<100)setTimeout(t,50);})();

  /* jugement externe : les touches dorées de la barre de lecture passent au même trait que les onglets */
  var B={tpages:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    loupe:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/><path d="M8 10.5h5M10.5 8v5"/>',
    prev:'<path d="M16 5L8 12l8 7z" fill="currentColor"/>',next:'<path d="M8 5l8 7-8 7z" fill="currentColor"/>'};
  function brass(){Object.keys(B).forEach(function(id){var b=document.getElementById(id);if(!b||b.querySelector('svg.pk'))return;
      b.innerHTML='<svg class="pk" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" '+S+'>'+B[id]+'</svg>';});
    [].forEach.call(document.querySelectorAll('form .brass[type=submit]'),function(b){if(b.querySelector('svg'))return;b.setAttribute('aria-label',b.getAttribute('aria-label')||'⌕');
      b.innerHTML='<svg class="pk" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" '+S+'><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>';});}
  brass();setTimeout(brass,500);
  /* test réel : chaque barre de recherche annonce sa source ; la loupe allumée se voit */
  function ph(){[['ia','Internet Archive'],['gut','Project Gutenberg'],['ws','Wikisource'],['kd','Korhogo Diary']].forEach(function(x){var i=document.querySelector('#p-'+x[0]+' input[type=search]');if(i&&!i.placeholder)i.placeholder=x[1]+' ⌕';});}
  ph();setTimeout(ph,800);
  st.textContent+='#loupe[aria-pressed=true]{box-shadow:0 0 0 2px #fff3c4,0 0 14px rgba(255,214,120,.9)!important;filter:brightness(1.15)}';
  st.textContent+='.brass svg.pk{display:block;margin:auto}';
  var tb=document.querySelector('.tabs');if(tb)new MutationObserver(function(){go();}).observe(tb,{childList:true,subtree:true,characterData:true});
})();
