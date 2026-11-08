/* Borne Insert Koin — la vie électrique du meuble (Mauk Tenieb, 8 nov., 16 h 51 : « faire vivre les lumières internes de la machine, introduire des aléas »).
   Chaque processus sonore de borne-son.js (relais, néon, tube, timbre, monnayeur, rouleaux, minuterie, aimant, bois) allume son organe au même instant :
   le relais fait cligner un voyant, le néon brouille l'enseigne, la haute tension secoue l'image, le timbre lance un chenillard sur les touches,
   la pièce éclaire la fente, les rouleaux font battre le compteur de Koins.
   Sans son (FX coupés, page muette), une horloge à elle tire les mêmes événements. Aléas rares : une baisse de secteur qui ternit tout le meuble,
   une ampoule fatiguée qui reste faible une minute. Mouvement réduit : la lumière seule, zéro secousse. */
(function(){
  var R=document.documentElement,rnd=Math.random,last=0,calm=matchMedia('(prefers-reduced-motion:reduce)');
  var css=
  '@keyframes bv-relay{0%,100%{filter:none}18%{filter:brightness(1.9) saturate(1.3)}36%{filter:brightness(.7)}52%{filter:brightness(1.5)}}'+
  '@keyframes bv-neon{0%,100%{opacity:1}12%{opacity:.35}20%{opacity:1}31%{opacity:.5}38%{opacity:.95}55%{opacity:.25}63%{opacity:1}}'+
  '@keyframes bv-hv{0%,100%{filter:none;translate:0 0}30%{filter:brightness(1.35) contrast(1.15);translate:1px 0}55%{filter:brightness(.88);translate:-1px 0}}'+
  '@keyframes bv-hvc{0%,100%{filter:none}30%{filter:brightness(1.35) contrast(1.15)}55%{filter:brightness(.88)}}'+
  '@keyframes bv-chase{0%,100%{filter:none}40%{filter:brightness(1.75) saturate(1.25)}}'+
  '@keyframes bv-coin{0%,100%{filter:none}25%{filter:brightness(1.8) sepia(.4) saturate(1.6)}}'+
  '@keyframes bv-reel{0%,100%{opacity:1}25%,75%{opacity:.55}50%{opacity:1}}'+
  '@keyframes bv-creak{0%,100%{translate:0 0}35%{translate:.6px .3px}70%{translate:-.4px 0}}'+
  '@keyframes bv-brown{0%,100%{filter:none}20%{filter:brightness(.72) saturate(.85)}45%{filter:brightness(.9)}60%{filter:brightness(.66)}}'+
  'html.borne .bv-relay{animation:bv-relay .26s steps(4) 1}'+
  'html.borne .bv-neon{animation:bv-neon var(--bvd,.45s) steps(7) 1}'+
  'html.borne .bv-hv{animation:bv-hv .16s steps(3) 1}html.borne.bv-calm .bv-hv{animation-name:bv-hvc}'+
  'html.borne .bv-chase{animation:bv-chase .34s ease-out 1}'+
  'html.borne .bv-coin{animation:bv-coin .7s ease-out 1}'+
  'html.borne .bv-reel{animation:bv-reel .18s steps(2) 3}'+
  'html.borne:not(.bv-calm) .bv-creak{animation:bv-creak .3s steps(3) 1}'+
  'html.borne .bv-brown{animation:bv-brown 1.1s steps(6) 1}'+
  'html.borne .bv-tired{filter:brightness(.62) saturate(.8)!important;transition:filter 2s}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  function calmNow(){R.classList.toggle('bv-calm',calm.matches);}calmNow();try{calm.addEventListener('change',calmNow);}catch(e){}
  function home(){return !R.dataset.prog&&!document.hidden;}
  function seen(e){if(!e||!e.offsetWidth)return false;var r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
  function pulse(e,c,ms,d){if(!e||!seen(e))return;e.classList.remove(c);void e.offsetWidth;if(d)e.style.setProperty('--bvd',d+'s');e.classList.add(c);setTimeout(function(){e.classList.remove(c);},ms);}
  function q(s){return document.querySelector(s);}function qa(s){return [].slice.call(document.querySelectorAll(s));}
  function pick(a){return a[Math.floor(rnd()*a.length)];}
  var ORG={
    relay:function(){var L=qa('.b-row2 .menu a').filter(seen);if(!L.length)return;var n=rnd()<.55?1:2;for(var i=0;i<n;i++)(function(e,k){setTimeout(function(){pulse(e,'bv-relay',300);},k*80);})(pick(L),i);},
    neon:function(){pulse(q('.bar .brand'),'bv-neon',900,(.3+rnd()*.4).toFixed(2));},
    crt:function(){pulse(q('.b-screen'),'bv-hv',200);},
    bell:function(){qa('.cabinets .cab').forEach(function(e,i){setTimeout(function(){pulse(e,'bv-chase',380);},i*110);});},
    /* fente et compteur : seulement sur un vrai Koin (index.html, koinFx) */
    mag:function(){pulse(q('.b-dekonect'),'bv-relay',300);},
    creak:function(){pulse(q('.wrap'),'bv-creak',330);}
  };
  function organ(k){if(!home())return;last=Date.now();var f=ORG[k];if(f)try{f();}catch(e){}}
  document.addEventListener('borne:proc',function(e){organ(e.detail);});
  /* sans son : la même vie, sur l'horloge des processus au repos */
  var PROC={relay:[5,13],creak:[6,20],crt:[5,14],bell:[35,75],mag:[35,80],neon:[25,55]};
  Object.keys(PROC).forEach(function(k){var p=PROC[k];(function next(){setTimeout(function(){if(Date.now()-last>15000)organ(k);next();},1000*(p[0]+rnd()*(p[1]-p[0])));})();});
  /* aléas rares : la baisse de secteur (toutes les 2 à 6 min), l'ampoule fatiguée (toutes les 4 à 10 min, une minute) */
  (function brown(){setTimeout(function(){if(home()){pulse(q('.wrap'),'bv-brown',1150);try{document.dispatchEvent(new CustomEvent('borne:brownout'));}catch(e){}}brown();},1000*(120+rnd()*240));})();
  (function tired(){setTimeout(function(){if(home()){var L=qa('.b-row2 .menu a').concat(qa('.cabinets .cab')).filter(seen);var e=pick(L);if(e){e.classList.add('bv-tired');setTimeout(function(){e.classList.remove('bv-tired');pulse(e,'bv-relay',300);},40000+rnd()*40000);}}tired();},1000*(240+rnd()*360));})();
})();
