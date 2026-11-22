/* TVCR, épure (21 nov. 2026). Habillage : tvcr-epure.css. Chaque geste appelle une touche d'origine du magnétoscope. */
(function(){
  'use strict';
  var D=document;
  function fr(){return D.documentElement.lang==='fr';}
  function q(r,s){return r.querySelector(s);}
  function tracks(r){return [].slice.call(r.querySelectorAll('[data-vhs-tracklist] button'));}
  function cur(r){var t=tracks(r);for(var i=0;i<t.length;i++)if(t[i].getAttribute('aria-current')==='true')return i;return -1;}
  var osdT=0;
  function osd(r,txt){var sc=q(r,'.vhs-screen');if(!sc)return;var o=q(sc,'.tv-osd');if(!o){o=D.createElement('div');o.className='tv-osd';o.setAttribute('aria-hidden','true');sc.appendChild(o);}
    o.innerHTML=txt;o.classList.add('on');clearTimeout(osdT);osdT=setTimeout(function(){o.classList.remove('on');},1400);}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function zap(r,dir){var t=tracks(r);if(!t.length)return;var i=cur(r),n=i<0?0:(i+dir+t.length)%t.length;t[n].click();
    var nm=(t[n].textContent||'').replace(/\s+/g,' ').trim().replace(/^\d+[.)]\s*/,'');osd(r,'<b>'+(n+1)+'/'+t.length+'</b> '+esc(nm.toUpperCase()));}
  function action(r,a){var b=q(r,'[data-vhs-action="'+a+'"]');if(b)b.click();}
  function setup(r){
    if(r.dataset.tvEpure)return;r.dataset.tvEpure='1';r.classList.add('tv-epure');
    /* tiroir */
    var act=q(r,'.vhs-shelf-actions');
    if(act){var m=D.createElement('button');m.type='button';m.className='vhs-tape vhs-tape-all tv-more';m.setAttribute('aria-pressed','false');
      m.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>';
      var lab=function(){var l=fr()?'Tiroir':'Drawer';m.setAttribute('aria-label',l);m.title=l;};lab();
      new MutationObserver(lab).observe(D.documentElement,{attributes:true,attributeFilter:['lang']});
      m.onclick=function(){var on=r.classList.toggle('tv-tiroir');m.setAttribute('aria-pressed',String(on));};
      act.appendChild(m);
      /* régression corrigée (22 nov.) : la touche REC du magnétoscope ouvre le tiroir et donne la main à la barre d'enregistrement d'une chaîne YouTube */
      var rk=q(r,'[data-vhs-action="rec"]');if(rk)rk.addEventListener('click',function(){r.classList.add('tv-tiroir');m.setAttribute('aria-pressed','true');},true);
      var lo=q(r,'[data-vhs-find-open]');if(lo)lo.addEventListener('click',function(){r.classList.add('tv-tiroir');m.setAttribute('aria-pressed','true');},true);}
    /* jugement externe : un morceau sans titre (« ... » dans les données) prend un titre de repli */
    var tl=q(r,'[data-vhs-tracklist]');
    if(tl){var fix=function(){[].forEach.call(tl.querySelectorAll('button'),function(b){var t=(b.textContent||'').trim(),m=/^(\d+)\.\s*(\.{2,}|…|—|-)?\s*$/.exec(t);
        if(m){var nn=('0'+m[1]).slice(-2);b.textContent=m[1]+'. '+(fr()?'PISTE ':'TRACK ')+nn;}});};
      new MutationObserver(fix).observe(tl,{childList:true,subtree:true,characterData:true});fix();}
    /* test réel : changer de cassette efface la recherche en cours (sinon la liste paraît vide) */
    var row=q(r,'[data-vhs-shelf-row]');
    if(row)row.addEventListener('click',function(e){if(!e.target.closest('.vhs-tape'))return;var fi=q(r,'[data-vhs-find-input]');if(fi&&fi.value){fi.value='';fi.dispatchEvent(new Event('input',{bubbles:true}));}},true);
    /* troisième test réel : les mots imprimés sur la photo (TRACKING, FINE) trompent ; une plaquette à picto recouvre chacun et dit la vraie fonction */
    [['random','<path d="M4 7h3l10 10h3M4 17h3l3-3M14 10l3-3h3M18 5l2 2-2 2M18 15l2 2-2 2"/>'],['fine','<path d="M5 6l8 6-8 6zM15 6v12M19 6v12"/>']].forEach(function(x){
      var k=q(r,'[data-vhs-action="'+x[0]+'"]');if(!k||k.querySelector('.tv-pk'))return;var e=D.createElement('span');e.className='tv-pk';e.setAttribute('aria-hidden','true');
      e.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+x[1]+'</svg>';k.appendChild(e);});
    /* 22 nov. : les noms imprimés au-dessus des touches font 3 px ; chaque capuchon reçoit le picto de sa fonction */
    [['power','<path d="M12 3v8M7 6.5a7 7 0 1 0 10 0"/>'],['eject','<path d="M5 14l7-8 7 8zM5 18h14"/>'],['prev','<path d="M11 6l-7 6 7 6zM20 6l-7 6 7 6z"/>'],
     ['play','<path d="M7 5l12 7-12 7z"/>'],['next','<path d="M4 6l7 6-7 6zM13 6l7 6-7 6z"/>'],['stop','<path d="M6 6h12v12H6z"/>'],['pause','<path d="M8 5v14M16 5v14"/>'],
     ['rec','<circle cx="12" cy="12" r="6" fill="#c62a1f" stroke="#c62a1f"/>']].forEach(function(x){
      var k=q(r,'.vhs-face [data-vhs-action="'+x[0]+'"]');if(!k||k.querySelector('.tv-cap'))return;var e=D.createElement('span');e.className='tv-cap';e.setAttribute('aria-hidden','true');
      e.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+x[1]+'</svg>';k.appendChild(e);});
    /* état du magnétoscope incrusté à l'écran (OSD d'époque) */
    var scr=q(r,'.vhs-screen'),st=q(r,'[data-vhs-osd-state]');
    if(scr&&st){var et=D.createElement('div');et.className='tv-etat';et.setAttribute('aria-hidden','true');scr.appendChild(et);
      var ETn={play:'▶ PLAY',pause:'❚❚ PAUSE',stop:'■ STOP',rec:'● REC',ff:'▶▶',rew:'◀◀'};
      var upd=function(){var x=(st.textContent||'').trim(),k=x.toLowerCase();var lbl=ETn[k]||x.toUpperCase();et.textContent=lbl;
        clearTimeout(et._t);et.style.opacity='1';if(k==='play')et._t=setTimeout(function(){et.style.opacity='0';},2200);};
      et.style.transition='opacity .4s';new MutationObserver(upd).observe(st,{childList:true,characterData:true,subtree:true});upd();}
    /* façade du téléviseur : l'écran noir de la photo (x 251-879, y 147-611 sur 1312 x 816) se cale sur l'écran commun */
    var facade=function(){var frm=q(r,':scope>.ike-frame'),scn=q(r,'.vhs-screen');if(!frm||!scn||!window.ResizeObserver||r.dataset.tvFac)return!!r.dataset.tvFac;r.dataset.tvFac='1';
      var fit=function(){var a=frm.getBoundingClientRect(),b=scn.getBoundingClientRect();if(!b.width)return;
        /* verre du tube sur la photo : x 251-881, y 140-619 ; l'écran prend exactement la place du verre */
        var kx=b.width/631,ky=b.height/480,ox=b.left-a.left,oy=b.top-a.top;
        frm.style.setProperty('--tv-w',(1312*kx)+'px');frm.style.setProperty('--tv-h',(816*ky)+'px');
        frm.style.setProperty('--tv-x',(ox-251*kx)+'px');frm.style.setProperty('--tv-y',(oy-140*ky)+'px');r.classList.add('tv-facade');};
      new ResizeObserver(fit).observe(scn);new ResizeObserver(fit).observe(frm);fit();return true;};
    (function tf(n){if(!facade()&&n<200)setTimeout(function(){tf(n+1);},100);})(0);
    /* jugement externe : la liste descend jusqu'au bas du cadre de l'écran (paysage) */
    var lst=q(r,'[data-vhs-tracklist]');
    if(lst&&window.ResizeObserver){var fitL=function(){var frm=q(r,':scope>.ike-frame'),cat=q(r,'.vhs-catalogue'),sh=q(r,'.vhs-shell'),h;
        /* téléphone couché : la liste remplit la deuxième page du catalogue, sous la recherche */
        if(cat&&innerHeight<=520&&innerWidth>innerHeight){var fd=q(r,'.vhs-find');h=Math.round(cat.clientHeight-(fd?fd.offsetHeight+10:0));
          if(h>60){lst.style.setProperty('height',h+'px','important');lst.style.setProperty('max-height',h+'px','important');lst.style.setProperty('flex','0 0 auto','important');lst.style.setProperty('min-height',h+'px','important');}return;}
        /* téléphone debout : la liste descend jusqu'au bas de la colonne visible */
        if(sh&&innerWidth<700&&innerWidth<innerHeight){h=Math.round(sh.getBoundingClientRect().bottom-lst.getBoundingClientRect().top+sh.scrollTop-4);
          if(h>60){lst.style.setProperty('height',h+'px','important');lst.style.setProperty('max-height',h+'px','important');}return;}
        if(!frm||innerWidth<700||innerWidth<innerHeight){lst.style.removeProperty('height');lst.style.removeProperty('max-height');return;}
        h=Math.round(frm.getBoundingClientRect().bottom-lst.getBoundingClientRect().top);if(h>80){lst.style.setProperty('height',h+'px','important');lst.style.setProperty('max-height',h+'px','important');}};
      new ResizeObserver(fitL).observe(r);setTimeout(fitL,600);setTimeout(fitL,2500);new MutationObserver(function(){setTimeout(fitL,60);}).observe(r,{attributes:true,attributeFilter:['class']});}
    /* étagère : la photo des cassettes suit la hauteur réelle de sa rangée (cassettes entières, étiquettes lisibles) */
    var row=q(r,'.vhs-shelf-row');
    if(row&&window.ResizeObserver){var fitS=function(){var h=row.clientHeight;if(h<30)return;var sw=h*1600/327;
        row.style.setProperty('--sw',sw+'px','important');[].forEach.call(row.querySelectorAll('.vhs-shelf-page'),function(pg){pg.style.setProperty('--sw',sw+'px','important');});
        if(!row._tvS){row._tvS=1;var f=row.querySelector('.vhs-spine');if(f)row.scrollLeft=Math.max(0,f.offsetLeft-8);}
        [].forEach.call(row.querySelectorAll('.vhs-spine-line'),function(l){var bx=l.parentElement;if(!bx||!bx.clientHeight)return;l.classList.remove('vhs-spine-tp');var d=l.scrollHeight-bx.clientHeight;
          if(d>2){l.style.setProperty('--tpy',(-d-6)+'px');l.style.setProperty('--tpt',Math.max(3,(d+6)/22)+'s');l.classList.add('vhs-spine-tp');}});};
      new ResizeObserver(fitS).observe(row);new MutationObserver(function(){row._tvS=0;setTimeout(fitS,50);}).observe(row,{childList:true});
      setTimeout(fitS,300);setTimeout(fitS,1500);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(fitS);}
    /* test réel du 22 nov. : une recherche sans résultat laissait la liste vide sans un signe */
    var fi0=q(r,'[data-vhs-find-input]'),tl0=q(r,'[data-vhs-tracklist]');
    if(fi0&&tl0){var vide=function(){var n=[].filter.call(tl0.querySelectorAll('button'),function(b){return b.offsetParent!==null;}).length;tl0.classList.toggle('tv-vide',!!fi0.value.trim()&&!n);};
      fi0.addEventListener('input',function(){setTimeout(vide,80);});new MutationObserver(function(){setTimeout(vide,80);}).observe(tl0,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style','class']});}
    /* 22 nov. : au doigt, la façade reste entière ; un premier toucher la grossit autour du doigt (touches de plus de 40 px), le geste suivant agit, retour à 3 s */
    var dk=q(r,'.vhs-deck');
    if(dk&&window.matchMedia&&matchMedia('(pointer:coarse)').matches){var zT=0,zAt=0,unz=function(){dk.classList.remove('tv-zoom');r.classList.remove('tv-zoomed');};
      dk.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')return;clearTimeout(zT);zT=setTimeout(unz,3000);
        if(dk.classList.contains('tv-zoom'))return;var b=dk.getBoundingClientRect();
        dk.style.transformOrigin=Math.round(e.clientX-b.left)+'px '+Math.round(e.clientY-b.top)+'px';dk.classList.add('tv-zoom');r.classList.add('tv-zoomed');zAt=performance.now();
        e.preventDefault();e.stopPropagation();},true);
      dk.addEventListener('click',function(e){if(performance.now()-zAt<350){e.preventDefault();e.stopPropagation();}},true);
      D.addEventListener('pointerdown',function(e){if(dk.classList.contains('tv-zoom')&&!dk.contains(e.target)){clearTimeout(zT);unz();}},true);}
    /* 22 nov. : à la souris, loupe ancrée au point d'entrée du curseur : la touche visée reste sous le curseur, ses voisines s'écartent */
    if(dk&&window.matchMedia&&matchMedia('(pointer:fine)').matches){var hT=0;
      dk.addEventListener('pointerenter',function(e){if(e.pointerType!=='mouse')return;clearTimeout(hT);if(!dk.classList.contains('tv-loupe'))dk._b0=dk.getBoundingClientRect();var b=dk._b0;
        dk.style.transformOrigin=Math.round(e.clientX-b.left)+'px '+Math.round(e.clientY-b.top)+'px';dk.classList.add('tv-loupe');r.classList.add('tv-zoomed');});
      var raf=0;dk.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'||!dk.classList.contains('tv-loupe'))return;var cx=e.clientX,cy=e.clientY;cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){
        /* l'ancre suit le curseur, en coordonnées de la façade non agrandie : le point visé ne bouge jamais */
        var b=dk._b0||dk.getBoundingClientRect();var ux=cx-b.left,uy=cy-b.top;dk.style.transformOrigin=Math.round(ux)+'px '+Math.round(uy)+'px';});});
      dk.addEventListener('pointerleave',function(e){if(e.pointerType!=='mouse')return;hT=setTimeout(function(){dk.classList.remove('tv-loupe');r.classList.remove('tv-zoomed');},250);});}
    /* gestes sur l'écran */
    var sc=q(r,'.vhs-screen');if(!sc)return;
    var g=D.createElement('div');g.className='tv-geste';g.setAttribute('aria-hidden','true');sc.appendChild(g);
    var p=null;
    g.addEventListener('pointerdown',function(e){p={x:e.clientX,y:e.clientY,id:e.pointerId,t:performance.now(),moved:false};try{g.setPointerCapture(e.pointerId);}catch(_){}});
    g.addEventListener('pointermove',function(e){if(!p||e.pointerId!==p.id)return;if(Math.abs(e.clientX-p.x)>14||Math.abs(e.clientY-p.y)>14)p.moved=true;});
    function end(e){if(!p||e.pointerId!==p.id)return;var dx=e.clientX-p.x,dy=e.clientY-p.y,dt=performance.now()-p.t;var was=p;p=null;
      if(e.type==='pointercancel')return;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){zap(r,dx<0?1:-1);return;}
      if(!was.moved&&dt<500){action(r,'play');}}
    g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end);
  }
  var mo=new MutationObserver(scan);
  function scan(){var r=D.getElementById('vhs');if(r&&q(r,'.vhs-screen')&&q(r,'.vhs-shelf-actions')){setup(r);mo.disconnect();}}
  mo.observe(D.documentElement,{childList:true,subtree:true});scan();

  /* infobulles (test réel, 22 nov.) : chaque picto de ce programme montre son nom au survol, tiré de son aria-label */
  (function(){function tt(root){if(!root)return;[].forEach.call(root.querySelectorAll('button[aria-label]:not([title]),[role=button][aria-label]:not([title])'),function(b){b.title=b.getAttribute('aria-label');});}
    var R='#vhs';var go=function(){var r=typeof R==='string'?document.querySelector(R):R;if(r)tt(r);};go();setInterval(go,1500);})();
})();
