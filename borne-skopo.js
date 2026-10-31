/* SkopoRhogo dans la borne : la chambre suit l'heure du visiteur, à la minute exacte.
   À l'ouverture, la journée a déjà eu lieu : la simulation rejoue les heures écoulées depuis le matin (la veille au soir, la nuit).
   Ensuite, l'emploi du temps suit l'horloge réelle ; la marche et les gestes vont à vitesse naturelle.
   ?attract=1 : l'écran de la borne au repos. Glisser déplace, molette et pincement zooment, les boutons − et ＋ aussi ;
   un appui sur un Mask ouvre sa fiche dans un coin ; ⤢ ouvre SkopoRhogo en grand. */
(function(){
  var attract=/[?&]attract=1/.test(location.search);
  if(attract){var st=document.createElement('style');
    st.textContent='header,aside{display:none!important}main{display:block!important;margin:0!important;padding:0!important}'
      +'#stage{position:fixed!important;inset:0!important;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#000}body{margin:0;overflow:hidden;background:#000}'
      +'#view{border:0!important;box-shadow:none!important;outline:0!important;flex:none!important;max-width:none!important;max-height:none!important;cursor:grab}'
      +'#card{position:fixed!important;right:10px;top:10px;z-index:20;width:min(300px,46vw);background:rgba(10,9,8,.86)!important;backdrop-filter:blur(3px);font-size:13px}'
      +'#card #hint{display:none!important}#card #cbody{grid-template-columns:72px 1fr!important}#card #pcv{width:72px!important;height:72px!important}#card #cname{font-size:20px!important}'
      +'#zoom{position:fixed!important;left:10px;bottom:10px;z-index:20;display:flex!important;gap:6px}html body #zoom button,html body .b-open{width:34px!important;height:34px!important;min-width:0!important;min-height:0!important;padding:0!important;border-radius:50%!important;border:1px solid rgba(255,224,138,.35)!important;background:rgba(10,9,8,.55)!important;box-shadow:none!important;color:rgba(255,224,138,.85)!important;font:16px/1 monospace!important;cursor:pointer;opacity:.8;text-shadow:none!important}html body #zoom button:hover,html body .b-open:hover{opacity:1}html body #zoom button::after,html body .b-open::after{content:"";position:absolute;inset:-5px}html body #zoom button,html body .b-open{position:relative}@media (pointer:coarse),(max-width:520px){html body #zoom{display:none!important}html body .b-open{left:10px!important;top:10px!important;bottom:auto!important}}'
      +'html body .b-open{position:fixed!important;left:92px;bottom:10px;z-index:20}';
    document.head.appendChild(st);}
  function nowMin(){var d=new Date();return d.getHours()*60+d.getMinutes()+d.getSeconds()/60;}
  /* minutes du jeu : jour 1 à 00:00 = 0 ; le jour courant est le jour 2 */
  function target(){return 1440+nowMin();}
  function catchUp(to){var R=window.__room;if(!R)return;var g=to-R.tMin;if(g<=0)return;g=Math.min(g,26*60);
    /* rattrapage : la marche reprend le pas du jeu le temps de rejouer les heures */
    var w=window.__walk;window.__walk=1;while(g>0){var s=Math.min(g,.2);R.step(s);g-=s;}window.__walk=w;}
  function cover(){if(!attract)return;var v=document.getElementById('view');if(!v)return;var k=Math.max(innerWidth/800,innerHeight/500);
    v.style.setProperty('width',Math.ceil(800*k)+'px','important');v.style.setProperty('height',Math.ceil(500*k)+'px','important');}
  function init(){var R=window.__room;if(!R||!R.SPEEDS)return setTimeout(init,80);
    var m=nowMin();R.tMin=m>=390?1440+390:18*60;catchUp(target());try{R.updateRoster&&R.updateRoster();}catch(e){}
    /* l'horloge à la minute exacte ; la marche et les gestes à vitesse naturelle (×60 sur le temps du jeu) */
    R.SPEEDS[1]=1/60;window.__walk=60;R.setSpeed(1);
    setInterval(function(){/* recalage sur l'heure réelle à ×1 seulement : pause, ×4, ×15 et ×60 gardent leur temps (audit UI de SkopoRhogo, S1) */
      var on=[].findIndex.call(document.querySelectorAll('#speeds button'),function(b){return b.classList.contains('on');});if(on!==1)return;
      var d=R.tMin-target();if(d>.5)R.tMin=target();else if(d<-.5)catchUp(target());},5000);
    /* chaque bouton dit ce qu'il fait (S12) */
    [].forEach.call(document.querySelectorAll('#speeds button'),function(b,i){var t=i===0?'PAUSE':b.textContent+(i===1?' · DIRECT':'');b.title=t;b.setAttribute('aria-label',t);});
    if(attract){if(R.VIEW&&R.applyView){R.VIEW.z=innerWidth<400?1.25:1;R.applyView();/* la chambre entière dans l’écran, la date sur le noir (S13) ; au téléphone, les Masks gardent leur taille */}
      var zm=document.getElementById('zoom');if(zm)document.body.appendChild(zm);
      var cd=document.getElementById('card');if(cd)document.body.appendChild(cd);
      var op=document.createElement('button');op.className='b-open';op.type='button';op.textContent='⤢';op.setAttribute('aria-label','SkopoRhogo');
      op.onclick=function(){try{parent.postMessage({borne:'open'},'*');}catch(_){}};document.body.appendChild(op);}
    pinch(R);
    if(!attract){var st2=document.createElement('style');st2.textContent='header button,aside button,#zoom button{min-height:44px;min-width:44px}';document.head.appendChild(st2);}
    cover();addEventListener('resize',function(){setTimeout(cover,0);});setTimeout(cover,300);setTimeout(cover,1500);}
  /* pincement à deux doigts : la loupe suit les doigts */
  function pinch(R){var v=document.getElementById('view'),P={},d0=0;if(!v||!R.zoomAt)return;
    v.addEventListener('pointerdown',function(e){P[e.pointerId]=[e.clientX,e.clientY];var k=Object.keys(P);if(k.length===2){var a=P[k[0]],b=P[k[1]];d0=Math.hypot(a[0]-b[0],a[1]-b[1]);}});
    v.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]=[e.clientX,e.clientY];var k=Object.keys(P);if(k.length!==2||!d0)return;
      var a=P[k[0]],b=P[k[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]),r=v.getBoundingClientRect(),mx=((a[0]+b[0])/2-r.left)/r.width*2-1,my=-(((a[1]+b[1])/2-r.top)/r.height*2-1);
      if(Math.abs(d/d0-1)>.04){R.zoomAt(d/d0,mx,my);d0=d;}});
    ['pointerup','pointercancel'].forEach(function(t){v.addEventListener(t,function(e){delete P[e.pointerId];if(Object.keys(P).length<2)d0=0;});});}
  /* endormie, la chambre cesse de se dessiner : une image toutes les 2 s au lieu de 60 par seconde ; les programmes gardent toute la machine */
  var RAF=window.requestAnimationFrame.bind(window),asleep=false;
  /* à l'accueil, la chambre se dessine à 30 images par seconde au plus : la borne garde sa fluidité autour */
  var ATTR=/attract=1/.test(location.search);
  window.requestAnimationFrame=function(cb){if(asleep)return setTimeout(function(){RAF(cb);},2000);if(!ATTR)return RAF(cb);return RAF(function(t){if(t-(cb._t||0)<30){window.requestAnimationFrame(cb);return;}cb._t=t;cb(t);});};
  addEventListener('message',function(e){var R=window.__room,d=e.data||{};if(!R||!d.borne)return;
    if(d.borne==='sleep'){asleep=true;R.setSpeed(0);}else if(d.borne==='wake'){asleep=false;catchUp(target());try{R.updateRoster&&R.updateRoster();}catch(e){}window.__walk=60;R.setSpeed(1);}});
  /* programme ouvert (audit UI, S3 et S4) : la fiche du Mask choisi vient à l'écran ; la date et l'heure de la borne s'affichent dans la barre */
  if(!attract){
    document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.row'))setTimeout(function(){var c=document.getElementById('card');if(c&&c.getClientRects().length){var q=c.getBoundingClientRect();if(q.top<0||q.bottom>innerHeight)c.scrollIntoView({block:'nearest',behavior:'smooth'});}},60);});
    (function clock(){var h=document.querySelector('header');if(!h){setTimeout(clock,300);return;}var k=document.createElement('span');k.id='skclock';
      k.style.cssText='margin-left:auto;font:400 13px/1 "DM Mono",monospace;letter-spacing:.08em;text-transform:uppercase;opacity:.8;white-space:nowrap';
      var lang=h.querySelector('#lang');if(lang)h.insertBefore(k,lang);else h.appendChild(k);
      function tick(){var t='';try{var b=parent.document.querySelector('.b-date b');t=b?b.textContent:'';}catch(e){}k.textContent=t;}tick();setInterval(tick,1000);})();
  }
  /* la couleur moyenne de l'image, lue juste après le rendu (le tampon WebGL s'efface ensuite) : la borne en éclaire le meuble */
  (function(){var cv=document.createElement('canvas');cv.width=cv.height=8;var cx=cv.getContext('2d',{willReadFrequently:true}),last=0,RAF0=window.requestAnimationFrame;
    function smp(){var v=document.getElementById('view');if(!v||!v.width)return;try{cx.drawImage(v,0,0,8,8);var p=cx.getImageData(0,0,8,8).data,r=0,g=0,b=0;for(var i=0;i<p.length;i+=4){r+=p[i];g+=p[i+1];b+=p[i+2];}window.__scr=[r/64,g/64,b/64];}catch(e){}}
    window.requestAnimationFrame=function(cb){return RAF0(function(t){cb(t);if(t-last>450){last=t;smp();}});};})();
  if(document.readyState==='complete')init();else addEventListener('load',init);
})();
