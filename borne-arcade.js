/* Borne Insert Koin — l'écran d'arcade (DA.md). Chaque programme s'ouvre directement sur son propre écran ; au repos, l'écran montre SkopoRhogo en direct. */
/* la lumière : le tube de l'enseigne éclaire le haut du meuble, l'écran éclaire le panneau de commande dans la couleur du programme ; */
(function(){var root=document.documentElement;
  function mount(){var w=document.querySelector('.wrap'),bar=document.querySelector('.wrap .bar'),pan=document.querySelector('#home .b-panel'),g=document.querySelector('.b-glass');
    if(!w||!bar||!pan||!g){setTimeout(mount,600);return;}
    var m=document.createElement('div');m.className='b-mql';m.setAttribute('aria-hidden','true');w.appendChild(m);
    var s=document.createElement('div');s.className='b-spill';s.setAttribute('aria-hidden','true');pan.appendChild(s);
    function place(){var W=w.getBoundingClientRect(),B=bar.getBoundingClientRect(),L=document.querySelector('.b-land'),Lr=L?L.getBoundingClientRect():B;
      m.style.top=(B.top-W.top-10)+'px';m.style.height=(Math.max(B.bottom,Lr.bottom)-B.top+60)+'px';}
    place();addEventListener('resize',place);setInterval(place,2000);
    var INK={korong:'255,170,90',minitel:'120,240,150',vhs:'200,220,255',photo:'255,220,170',fauneye:'255,214,150',repos:'255,176,110',arcade:'255,190,120'};
    setInterval(function(){var h=root.dataset.habit||'repos',c=INK[h]||INK.arcade,dim=!!document.querySelector('.bar .brand.b-dim');
      s.style.setProperty('--sp',c);m.classList.toggle('b-off',dim);s.classList.toggle('b-hi',!!root.dataset.prog);},500);}
  mount();})();
/* la tranche peinte des flancs : la bande de rayures de chaque côté du meuble, en miroir, sur toute la hauteur */
(function(){function mount(){var w=document.querySelector('.wrap');if(!w){setTimeout(mount,600);return;}if(w.querySelector('.b-edgeart'))return;
  ['l','r'].forEach(function(s){var e=document.createElement('i');e.className='b-edgeart b-edgeart-'+s;e.setAttribute('aria-hidden','true');w.appendChild(e);});}
  mount();})();
/* l'aimant de Dekonect dessiné en fer à cheval rouge, pôles d'acier, reflet ; sans lignes de champ (Mauk Tenieb, 30 oct. : « toujours a minima ») */
(function(){function go(){var b=document.querySelector('.b-dekonect');if(!b){setTimeout(go,600);return;}if(b._art)return;b._art=1;
  b.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="bmg" x1="0" x2="1"><stop offset="0" stop-color="#7a1210"/><stop offset=".35" stop-color="#e0443a"/><stop offset=".6" stop-color="#c9302a"/><stop offset="1" stop-color="#6a0e0c"/></linearGradient><linearGradient id="bms" x1="0" x2="1"><stop offset="0" stop-color="#6a6e74"/><stop offset=".45" stop-color="#f2f4f6"/><stop offset="1" stop-color="#7a7e84"/></linearGradient></defs>'+
    '<path d="M8 6h9v15a3 3 0 0 0 6 0V6h9v15a12 12 0 0 1-24 0z" fill="url(#bmg)" stroke="#3a0806" stroke-width="1"/>'+
    '<rect x="8" y="3" width="9" height="6" rx="1" fill="url(#bms)" stroke="#2a2c2e" stroke-width=".8"/><rect x="23" y="3" width="9" height="6" rx="1" fill="url(#bms)" stroke="#2a2c2e" stroke-width=".8"/>'+
    '<path d="M11 13v8a9 9 0 0 0 4 7" fill="none" stroke="rgba(255,220,210,.5)" stroke-width="1.4" stroke-linecap="round"/></svg>';}
  go();})();
/* AUDIT 30 oct. — dans un programme, le fronton et le toit se replient pour laisser l'écran grand ; leurs commandes passent au pied de l'écran :
   le son (et sa diode), PL, Kapture et Burrows. Chaque touche du pied actionne la vraie commande du meuble. */
(function(){function go(){var foot=document.querySelector('.b-bezelfoot'),bell=document.querySelector('.b-bell'),pl=document.getElementById('export-pl'),kap=document.getElementById('kapture'),land=document.querySelector('.b-land');
  if(!foot||!bell){setTimeout(go,700);return;}if(foot.querySelector('.b-pfx'))return;
  var box=document.createElement('div');box.className='b-pfx';
  function mk(cls,html,label,fn){var b=document.createElement('button');b.type='button';b.className='b-px '+cls;b.innerHTML=html;b.setAttribute('aria-label',label);b.addEventListener('click',function(e){e.stopPropagation();fn();});box.appendChild(b);return b;}
  var sb=mk('b-px-son','','Motel Sound',function(){bell.click();sync();});
  if(pl)mk('b-px-pl','PL','Playlist',function(){pl.click();});
  if(kap)mk('b-px-kap','<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 7l1.6-2.4h4.8L16 7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>','Kapture',function(){kap.click();});
  function sync(){sb.innerHTML=bell.innerHTML;sb.classList.toggle('on',bell.classList.contains('on'));}
  new MutationObserver(sync).observe(bell,{attributes:true,childList:true,subtree:true});sync();
  var imm=foot.querySelector('.b-imm');foot.insertBefore(box,imm||null);}
  go();})();
/* Lore luit de temps en temps, au hasard */
(function(){function t(){var l=document.querySelector('.b-lore');if(l&&!document.hidden){l.classList.remove('b-shine');void l.offsetWidth;l.classList.add('b-shine');}setTimeout(t,9000+Math.random()*16000);}setTimeout(t,5000);})();

/* AUDIT 30 oct. — au clavier, à l'accueil : les flèches choisissent une touche du panneau, Entrée l'ouvre */
addEventListener('keydown',function(e){var r=document.documentElement;if(r.dataset.prog||e.altKey||e.ctrlKey||e.metaKey)return;var t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(!window.__borneMark||!window.__borneA)return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();window.__borneMark(1);}
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();window.__borneMark(-1);}
  else if(e.key==='Enter'&&document.querySelector('.b-panel .cab.b-sel')){e.preventDefault();window.__borneA();}});
/* la Koin se paie au premier geste de jeu dans l'écran (toucher, clic, touche du clavier) ; zapper d'un écran-titre à l'autre reste gratuit */
(function(){var pend=null,prog='';
  /* un toucher paie seulement sur un élément jouable (bouton, carte, case, table, canevas) ; un toucher dans le vide reste gratuit (audit du 30 oct., défaut 10) */
  function jouable(t,stop){for(var x=t;x&&x!==stop&&x.nodeType===1;x=x.parentElement){var n=x.tagName;if(/^(BUTTON|A|INPUT|SELECT|TEXTAREA|CANVAS|VIDEO|LABEL)$/.test(n)||x.hasAttribute('onclick')||x.onclick||x.getAttribute('role')==='button')return true;try{if(getComputedStyle(x).cursor==='pointer')return true;}catch(_){}}return false;}
  window.__bornePending=function(){return !!pend;};
  window.__bornePayLater=function(pay){window.__bornePay=pay;pend=pay;prog='';setTimeout(function(){prog=(window.__borneCur&&window.__borneCur())||'';},300);};
  function hit(e){if(!pend)return;var cur=(window.__borneCur&&window.__borneCur())||'';if(prog&&cur!==prog){pend=null;return;}
    if(e.type==='keydown'&&/^(Escape|PageUp|PageDown|Tab|Shift|Control|Alt|Meta)$/.test(e.key))return;
    var g=document.querySelector('.b-glass');if(e.type==='pointerdown'&&!(g&&(g.contains(e.target)||e.target.tagName==='IFRAME')))return;
    if(e.type==='pointerdown'&&e.target.tagName!=='IFRAME'&&!jouable(e.target,g))return;
    var p=pend;pend=null;window.__bornePaidAt=Date.now();try{p();}catch(_){}}
  document.addEventListener('pointerdown',hit,true);document.addEventListener('keydown',hit,true);
  setInterval(function(){if(!pend)return;var r=document.documentElement;if(!r.dataset.prog&&!r.hasAttribute('data-cam'))pend=null;else{var cur=(window.__borneCur&&window.__borneCur())||'';if(prog&&cur!==prog)pend=null;}},300);
  /* les gestes à l'intérieur des jeux en cadre comptent aussi */
  setInterval(function(){document.querySelectorAll('.b-glass iframe').forEach(function(f){try{var d=f.contentDocument;if(d&&!d._bpay){d._bpay=1;d.addEventListener('pointerdown',function(ev){if(pend&&jouable(ev.target,d.documentElement)){var p=pend;pend=null;try{p();}catch(_){}}},true);d.addEventListener('keydown',function(e){if(pend&&!/^(Escape|Tab)$/.test(e.key)){var p=pend;pend=null;try{p();}catch(_){}}},true);}}catch(_){}});},1000);})();


/* 30 oct., nuit — l'écran entier à l'arrivée sur ordinateur : la largeur de l'image se calcule sur la hauteur libre sous le fronton, mesurée ; le meuble garde sa largeur de borne */
(function(){
  var R=document.documentElement,busy=0,arrived=0;
  function home(){return innerWidth>700&&!R.hasAttribute('data-prog')&&R.getAttribute('data-mode')!=='device'&&R.getAttribute('data-habit')!=='fauneye'&&!R.classList.contains('b-immersion')}
  function px(e,p){return parseFloat(getComputedStyle(e)[p])||0}
  function fit(){
    /* pendant un mouvement de caméra, le meuble est agrandi : on ne mesure pas, on reprend à la fin */
    var cm=R.getAttribute('data-cam');if(cm==='in'||cm==='out')return;
    if(busy)return;busy=1;R.setAttribute('data-fitting','');
    try{
      if(!home()){R.removeAttribute('data-bfit');R.removeAttribute('data-bsmall');R.removeAttribute('data-bland');['--fitW','--wc','--bzs'].forEach(function(k){R.style.removeProperty(k)});return}
      var scr=document.querySelector('.b-bezel .b-screen'),foot=document.querySelector('.b-bezelfoot');if(!scr)return;
      /* 31 oct. — téléphone couché : une enseigne mince en haut, puis deux colonnes ; à gauche l'écran et son pied sur toute la hauteur libre, à droite le panneau sur la porte.
         La largeur de l'image se règle sur la hauteur mesurée entre l'enseigne et le bas de la fenêtre ; le meuble prend la largeur de la fenêtre. */
      if(matchMedia('(orientation:landscape) and (max-height:500px)').matches){
        var LW=innerWidth,LH=innerHeight,lw=Math.max(240,Math.min(900,LW-16)),lg=300,lmax=(lw-24-330)/1.16;
        R.setAttribute('data-bland','');R.setAttribute('data-bfit','');R.removeAttribute('data-bsmall');R.style.removeProperty('--bzs');R.style.setProperty('--wc',lw+'px');
        for(var j=0;j<4;j++){R.style.setProperty('--fitW',Math.round(lg)+'px');
          var lb=(foot||scr).getBoundingClientRect().bottom,ln=Math.max(200,Math.min(lmax,lg+(LH-10-lb)/.85));
          if(Math.abs(ln-lg)<1.5){lg=ln;break}lg=ln;}
        R.style.setProperty('--fitW',Math.round(lg)+'px');if(scrollY)scrollTo(0,0);arrived=1;try{window.__borneSeat&&window.__borneSeat();}catch(_){}return}
      if(R.hasAttribute('data-bland')){R.removeAttribute('data-bland');setTimeout(function(){try{window.__borneSeat&&window.__borneSeat();}catch(_){}},80);}
      var H=innerHeight,W=innerWidth,gw=640,wc;
      for(var i=0;i<3;i++){
        wc=Math.max(600,Math.min(W-32,Math.max(gw*1.357+150,Math.min(H*.98+30,gw*1.537+150))));
        R.style.setProperty('--fitW',Math.round(gw)+'px');R.style.setProperty('--wc',Math.round(wc)+'px');R.setAttribute('data-bfit','');
        var r=scr.getBoundingClientRect(),top=r.top+scrollY+px(scr,'borderTopWidth'),bot=px(scr,'borderBottomWidth'),fh=foot?foot.getBoundingClientRect().height+16:60;
        /* fenêtre basse : le toit (plante, caméra) peut passer au-dessus du cadre, l'enseigne reste visible ; l'écran y gagne sa hauteur */
        var rf=document.querySelector('.b-roof'),off=H<760&&rf?Math.max(0,rf.getBoundingClientRect().bottom+scrollY-10):0;
        var byH=(H-top+off-bot-fh-8)/.925,byW=(W-32-150)/(W<1000?1.2:1.357),ng=Math.max(Math.min(360,(H-72)/.925),Math.min(byH,byW,1100));
        if(Math.abs(ng-gw)<1.5){gw=ng;break}gw=ng;
      }
      /* le meuble garde une largeur de borne ; la vitre imprimée s'étire sur les côtés d'une fois et demie au plus */
      wc=Math.max(600,Math.min(W-32,Math.max(gw*1.357+150,Math.min(H*.98+30,gw*1.537+150))));
      R.style.setProperty('--fitW',Math.round(gw)+'px');R.style.setProperty('--wc',Math.round(wc)+'px');
      if(gw<500)R.setAttribute('data-bsmall','');else R.removeAttribute('data-bsmall');
      R.style.setProperty('--bzs',Math.max(0,Math.round((scr.clientWidth-gw)/2))+'px');
      /* fenêtre très basse : à l'arrivée, la page descend juste assez pour montrer l'écran entier et son pied */
      if(!arrived&&document.readyState==='complete'){arrived=1;var fb=foot?foot.getBoundingClientRect().bottom+scrollY:0;if(scrollY===0&&fb>H)scrollTo(0,Math.ceil(fb-H+6))}
    }finally{busy=0;requestAnimationFrame(function(){requestAnimationFrame(function(){R.removeAttribute('data-fitting');});});}
  }
  var t;function later(){clearTimeout(t);t=setTimeout(fit,60)}
  addEventListener('resize',later);window.__borneFit=fit;
  new MutationObserver(later).observe(R,{attributes:true,attributeFilter:['data-prog','data-mode','data-habit','data-skin','class']});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  /* le voile se lève quand les matières du meuble sont décodées (bois, métal, vitre imprimée, enseigne), 3 s au plus */
  function mats(){var U={};[].forEach.call(document.querySelectorAll('.b-roof, .b-roof *, .wrap, .wrap .bar, .wrap .bar *, .b-bezel, .b-bezel *, .b-butee, .b-land'),function(e){['backgroundImage','borderImageSource'].forEach(function(k){var v=getComputedStyle(e)[k]||'';v.replace(/url\(["']?([^"')]+)["']?\)/g,function(_,u){U[u]=1;});});
      try{var b=getComputedStyle(e,'::before').borderImageSource||'';b.replace(/url\(["']?([^"')]+)["']?\)/g,function(_,u){U[u]=1;});}catch(_){}});
    return Promise.race([Promise.all(Object.keys(U).slice(0,40).map(function(u){var i=new Image();i.src=u;return (i.decode?i.decode():Promise.resolve()).catch(function(){});})),new Promise(function(r){setTimeout(r,3000);})]);}
  function ready(){if(R.classList.contains('borne-ready'))return;fit();mats().then(function(){fit();requestAnimationFrame(function(){fit();requestAnimationFrame(function(){R.classList.add('borne-ready');});});});}
  addEventListener('load',function(){var f=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();f.then(ready,ready);setTimeout(fit,800)});fit();
})();

/* 30 oct. — la caméra : lancer un jeu, c'est s'approcher de la borne jusqu'à ce que l'écran remplisse la fenêtre ; Baku Boom ou l'accueil font reculer.
   Le meuble (.wrap) et son toit (.b-roof : plante, caméra Kapture) bougent ensemble, comme un seul objet devant l'objectif. */
(function(){
  var R=document.documentElement,T=0,busy=0,IN=460,OUT=520,EASE='cubic-bezier(.55,.06,.25,1)';
  function wrap(){return document.querySelector('.wrap')}
  function parts(){return [wrap(),document.querySelector('.b-roof')].filter(Boolean)}
  function glass(){return document.querySelector('.b-glass')}
  /* la place de l'écran sans les effets du tube (allumage, extinction) : la taille de la vitre, au centre de son cadre */
  function rect(){var g=glass();if(!g)return null;var S=(g.parentElement||g).getBoundingClientRect(),w=g.offsetWidth,h=g.offsetHeight,cx=S.left+S.width/2,cy=S.top+S.height/2;
    return {left:cx-w/2,top:cy-h/2,width:w,height:h}}
  function target(){var w=innerWidth,h=innerHeight;if(h<=520&&w>h)return {x:8,y:8,w:w-96,h:h-16};return w>700?{x:48,y:35,w:w-96,h:h-138}:{x:20,y:31,w:w-40,h:h-174}}
  /* la même prise de vue pour chaque pièce : l'écran A devient le cadre G */
  function shoot(A,G){var W=wrap().getBoundingClientRect(),s=Math.min(G.w/A.width,G.h/A.height),
      gx=G.x+G.w/2,gy=G.y+G.h/2,ax=A.left+A.width/2,ay=A.top+A.height/2,tx=gx-W.left-s*(ax-W.left),ty=gy-W.top-s*(ay-W.top);
    parts().forEach(function(e){var E=e===wrap()?W:e.getBoundingClientRect(),x=tx+(W.left-E.left)*(1-s),y=ty+(W.top-E.top)*(1-s);
      e.style.transformOrigin='0 0';e.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale('+s.toFixed(4)+')';});}
  function set(prop,v){parts().forEach(function(e){e.style[prop]=v;});}
  /* le mouvement de caméra par Web Animations : il part tout de suite et se joue jusqu'au bout, même quand la page peine (rendu lent) */
  var AN=[],SEQ=0;function play(A,G,dir,dur,done){var my=++SEQ;shoot(A,G);var tr=parts().map(function(e){return e.style.transform;});set('transition','none');set('transform','');
    AN.forEach(function(a){try{a.cancel();}catch(_){}});AN=parts().map(function(e,i){var k=[{transform:'none'},{transform:tr[i]}];if(dir<0)k.reverse();
      return e.animate(k,{duration:dur,easing:EASE,fill:'forwards'});});
    /* un mouvement interrompu par un autre (recul coupé par un nouveau programme) ne referme rien derrière lui */
    var f=AN[0];if(!f){done();return;}var ok=0;function end(){if(ok)return;ok=1;if(my!==SEQ)return;done();}f.finished.then(end,end);setTimeout(end,dur*4+400);}
  function unplay(){AN.forEach(function(a){try{a.cancel();}catch(_){}});AN=[];}
  function settle(){if(R.hasAttribute('data-prog'))return;var ft=document.querySelector('.b-bezelfoot');if(!ft)return;var fb=ft.getBoundingClientRect().bottom+scrollY;
    var top=fb>innerHeight+1?Math.ceil(fb-innerHeight+6):0;if(Math.abs(top-scrollY)>2)try{scrollTo({top:top,left:0,behavior:'smooth'});}catch(e){scrollTo(0,top);}}
  function clear(){unplay();var wasOut=R.getAttribute('data-cam')==='out';if(wasOut)setTimeout(function(){try{window.__borneFit&&window.__borneFit();}catch(e){}settle();},120);
    parts().forEach(function(e){e.style.transition='';e.style.transform='';e.style.transformOrigin='';e.style.opacity='';});R.removeAttribute('data-cam');busy=0}
  function stop(){if(!busy)return;clearTimeout(T);var f=busy;busy=0;clear();if(typeof f==='function')f();}
  window.__borneSettle=settle;
  /* la visite des psychopompes finie, la borne revient au cadre de l'arrivée */
  var wasTour=0;setInterval(function(){var t=!!window.__borneTour;if(wasTour&&!t&&!R.hasAttribute('data-prog')&&!busy&&!window.__borneTourByHand)settle();if(!wasTour&&t)window.__borneTourByHand=false;wasTour=t;},300);
  window.__borneCam={
    ok:function(){return !!(wrap()&&glass())&&!R.classList.contains('b-immersion')&&!matchMedia('(prefers-reduced-motion:reduce)').matches},
    rect:function(){var r=rect();return r?{x:r.left,y:r.top,w:r.width,h:r.height}:target()},
    stop:stop,
    zoomIn:function(cb){if(typeof busy==='function'){var prev=busy;busy=function(){prev();cb();};return;}stop();var A=rect();if(!A||!A.width){cb();return;}
      busy=cb;R.setAttribute('data-cam','in');
      var Z={w:0,h:0};play(A,target(),1,IN,function(){if(R.getAttribute('data-cam')!=='in')return;R.setAttribute('data-cam','swap');var f=busy;busy=0;var sc=Math.min(target().w/A.width,target().h/A.height);Z.w=A.width*sc;Z.h=A.height*sc;
        /* le meuble reprend sa taille avant l'ouverture du programme : chaque programme mesure son écran au repos */
        unplay();set('transition','none');set('transform','');void wrap().offsetWidth;try{f();}catch(e){}
        /* l'écran de jeu, plus large que le tube 4:3, s'ouvre depuis le cadre où la caméra s'est arrêtée */
        var g=glass();if(g&&R.hasAttribute('data-prog')){var B=g.getBoundingClientRect(),ix=Math.max(0,(B.width-Z.w)/2),iy=Math.max(0,(B.height-Z.h)/2);
          if(ix>2||iy>2){g.style.transition='none';g.style.clipPath='inset('+iy.toFixed(0)+'px '+ix.toFixed(0)+'px round 6px)';void g.offsetWidth;
            requestAnimationFrame(function(){g.style.transition='clip-path 280ms cubic-bezier(.3,.6,.2,1)';g.style.clipPath='inset(0px 0px round 6px)';setTimeout(function(){g.style.transition='';g.style.clipPath='';},320);});}}
        requestAnimationFrame(function(){requestAnimationFrame(clear);});});},
    swap:function(fn){stop();R.setAttribute('data-cam','swap');set('transition','none');fn();try{window.__borneFit&&window.__borneFit();}catch(e){}try{scrollTo({top:0,left:0,behavior:'instant'});}catch(e){scrollTo(0,0);}},
    /* le recul : le temps que l'accueil se remonte, l'écran reste noir comme un tube qui se rallume ; puis on part de l'écran plein cadre et on recule jusqu'à la borne entière */
    zoomOut:function(G){var w=wrap();if(!w){clear();return;}busy=1;w.classList.remove('b-shake');set('transition','none');set('opacity','0');
      /* l'accueil se remonte : on attend que la taille de l'écran ne bouge plus, puis on part de là */
      function stable(cb){var last=-1,n=0,t0=Date.now();(function f(){try{window.__borneFit&&window.__borneFit();}catch(e){}var g=glass(),sc=g&&g.parentElement?Math.round(g.parentElement.getBoundingClientRect().top+scrollY):0,v=g?g.offsetWidth+'x'+g.offsetHeight+'@'+sc:'';
        if(v===last){if(++n>=3)return cb();}else{n=0;last=v;}if(Date.now()-t0>1600)return cb();T=setTimeout(f,70);})();}
      T=setTimeout(function(){stable(go);},140);function go(){
        var A=rect();if(!A||!A.width){clear();return;}
        set('opacity','');R.setAttribute('data-cam','out');play(A,G,-1,OUT,function(){unplay();clear();});}}
  };
})();

/* 30 oct. — en jeu, Espace et les flèches restent au jeu : la page ne défile jamais dessous */
addEventListener('keydown',function(e){var R=document.documentElement;if(!R.hasAttribute('data-prog')||R.classList.contains('b-immersion'))return;
  var t=e.target,tag=t&&t.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
  if(/^(Space| |ArrowUp|ArrowDown|PageUp|PageDown|Home|End)$/.test(e.code||e.key)&&!e.defaultPrevented){if(e.code!=='PageUp'&&e.code!=='PageDown')e.preventDefault();}},false);

/* rejouer coûte une Koin (Mauk Tenieb, 30 oct.) : une nouvelle partie lancée d'un geste, dans un programme déjà payé, paie à son tour ;
   la première partie reste payée par le premier geste ; à zéro Koin, la partie attend le décompte du compteur */
(function(){var gest=0;
  function mark(){gest=Date.now();}
  document.addEventListener('pointerdown',mark,true);document.addEventListener('keydown',mark,true);
  setInterval(function(){document.querySelectorAll('.b-glass iframe').forEach(function(f){try{var d=f.contentDocument;if(d&&!d._brep){d._brep=1;d.addEventListener('pointerdown',mark,true);d.addEventListener('keydown',mark,true);}}catch(_){}});},1000);
  window.__borneReplay=function(){var r=document.documentElement,P=window.__bornePay,now=Date.now();
    if(!r.dataset.prog||!P)return true;                       /* hors jeu, ou programme gratuit */
    if(window.__bornePending&&window.__bornePending())return true; /* la première partie attend encore son premier geste */
    if(now-gest>800)return true;                              /* appel du programme lui-même (ouverture), sans geste */
    if(now-(window.__bornePaidAt||0)<1500)return true;        /* ce geste vient de payer la première partie */
    var ok=false;try{ok=P();}catch(_){ok=true;}if(ok)window.__bornePaidAt=now;return ok;};
  function wrap(n){var f=window[n];if(typeof f!=='function'||f._brep)return false;var g=function(){if(!window.__borneReplay())return;return f.apply(this,arguments);};g._brep=1;window[n]=g;return true;}
  var names=['hangNew','mmNew','mStart','mRestartSame','chStart','chRestart'],t=setInterval(function(){names=names.filter(function(n){return !wrap(n);});if(!names.length)clearInterval(t);},500);
})();

/* 30 oct. — fronton : sur ordinateur et tablette, le son et PL passent au pied du haut-parleur droit ; l'afficheur du Motel Sound prend toute la largeur du pied du gauche */
(function(){var mq=matchMedia('(min-width:701px)');
  function place(){var L=document.querySelector('.wrap .bar .dock:first-of-type'),Rd=document.querySelector('.wrap .bar .dock:last-of-type'),b=document.querySelector('.b-bell'),p=document.getElementById('export-pl');
    if(!L||!Rd||!b||!p||L===Rd)return;var to=mq.matches?Rd:L;if(b.parentNode!==to){to.appendChild(b);to.appendChild(p);}document.documentElement.classList.toggle('b-sonadroite',mq.matches);}
  if(mq.addEventListener)mq.addEventListener('change',place);else mq.addListener(place);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',place);else place();setTimeout(place,600);})();

/* 30 oct. — le 3615 ouvert reçoit le clavier tout de suite : le focus passe dans son cadre (audit du 3615, défaut 4) */
(function(){var last='';setInterval(function(){var p=document.documentElement.dataset.prog||'';if(p===last)return;last=p;if(!p)return;
  var n=0;(function t(){var f=[].find.call(document.querySelectorAll('.b-glass iframe,#kg-root iframe'),function(x){return /\/3615\//.test(x.src)&&x.getClientRects().length;});
    if(f){try{f.focus();f.contentWindow.focus();}catch(e){}return;}if(++n<20)setTimeout(t,250);})();},400);})();

/* 30 oct., 23 h 38 — la lumière de l'écran (Mauk Tenieb : « des couleurs, des choses vivantes, des électroluminescences intelligentes », « plutôt que mal éclairé ») :
   la couleur moyenne de l'image affichée éclaire le tour de la vitre et le haut du panneau, comme un tube dans une salle sombre ; elle suit l'image.
   Lumière seule (R4) : la matière reste celle des images. */
(function(){var R=document.documentElement,cv=document.createElement('canvas');cv.width=cv.height=8;var cx=cv.getContext('2d',{willReadFrequently:true}),cur=[0,0,0];
  function src(){var f=document.querySelector('.b-glass iframe');try{var d=f&&f.contentDocument;var c=d&&(d.querySelector('#view')||d.querySelector('canvas'));if(c&&c.width)return c;}catch(e){}
    var k=document.querySelector('#kg-root canvas');return k&&k.width&&k.getClientRects().length?k:null;}
  function tick(){if(document.hidden)return;var f0=document.querySelector('.b-glass iframe');try{var w=f0&&f0.contentWindow&&f0.contentWindow.__scr;if(w){mix(w[0],w[1],w[2]);return;}}catch(e){}var c=src();if(!c){R.style.setProperty('--scr-a','0');return;}
    try{cx.drawImage(c,0,0,8,8);var p=cx.getImageData(0,0,8,8).data,r=0,g=0,b=0;for(var i=0;i<p.length;i+=4){r+=p[i];g+=p[i+1];b+=p[i+2];}mix(r/64,g/64,b/64);}catch(e){}}
  function mix(r,g,b){cur=[cur[0]*.6+r*.4,cur[1]*.6+g*.4,cur[2]*.6+b*.4];var L=(cur[0]+cur[1]+cur[2])/765,mx=Math.max(1,cur[0],cur[1],cur[2]);/* la teinte de l'image, portée à pleine lumière ; l'intensité suit la luminosité */
      R.style.setProperty('--scr',Math.round(cur[0]*255/mx)+','+Math.round(cur[1]*255/mx)+','+Math.round(cur[2]*255/mx));R.style.setProperty('--scr-a',Math.min(.75,.3+L*1.6).toFixed(3));}
  setInterval(tick,450);
  (function put(){var p=document.querySelector('#home .b-panel');if(!p){setTimeout(put,500);return;}if(p.querySelector('.b-scrlight'))return;var l=document.createElement('i');l.className='b-scrlight';l.setAttribute('aria-hidden','true');p.appendChild(l);})();})();
