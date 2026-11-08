/* Borne Insert Koin (site d'essai) : range la page d'Insert Koin dans une borne d'arcade, d'après le plan d'une vraie borne.
   De haut en bas : le toit (une plante qui suit le calendrier républicain, la caméra Kapture), le fronton (l'enseigne entre
   deux haut-parleurs, le juke-box dans celui de gauche), le cadre de l'écran (Burrows au-dessus ; Mauk Tenieb et Lore dessous),
   l'écran (le programme, les Koins, la date), le panneau (la manette en miroir, quatre touches, Baku Boom ; BC TL IG),
   la porte (la fente, le son, la langue). Rien n'est réécrit : les éléments de la page changent de place, leurs fonctions restent. */
(function(){
  var $=function(id){return document.getElementById(id);};
  var root=document.documentElement;root.classList.add('borne');root.dataset.habit='repos';root.dataset.mode='arcade';
  var wrap=document.querySelector('.wrap'),bar=$('bar'),home=$('home');if(!wrap||!bar||!home)return;
  var IK=function(){return window.__ik||{};};
  var lang=function(){try{return IK().lang?IK().lang():'en';}catch(e){return 'en';}};
  var el=function(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};

  /* ---------- le toit : la plante et la caméra ---------- */
  var roof=el('div','b-roof'),pot=el('div','b-pot'),plant=el('div','b-plant'),care=el('div','b-care'),cam=el('div','b-cam');
  pot.tabIndex=0;pot.setAttribute('role','group');pot.setAttribute('aria-label','Plante');
  /* les soins de la plante suivent la langue de la borne (FR · EN) */
  [['water','💧','EAU','WATER'],['sun','☀','SOLEIL','SUN'],['cut','✂','TAILLE','PRUNE']].forEach(function(a){var b=el('button',null,'<i>'+a[1]+'</i><span data-fr="'+a[2]+'" data-en="'+a[3]+'">'+a[3]+'</span>');b.type='button';b.dataset.care=a[0];care.appendChild(b);});
  function careLang(){var fr=document.documentElement.lang==='fr';[].forEach.call(care.querySelectorAll('span[data-fr]'),function(x){x.textContent=fr?x.dataset.fr:x.dataset.en;});}
  careLang();new MutationObserver(careLang).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  pot.appendChild(care);pot.appendChild(plant);roof.appendChild(pot);if($('kapture'))cam.appendChild($('kapture'));roof.appendChild(cam);
  wrap.parentNode.insertBefore(roof,wrap);

  /* ---------- le fronton : l'enseigne, et l'habit en petit dessous ---------- */
  var brand=$('brand'),hab=el('span','b-habit');hab.setAttribute('aria-hidden','true');if(brand)brand.appendChild(hab);

  /* ---------- le cadre et l'écran ---------- */
  var bezel=el('div','b-bezel'),scr=el('div','b-screen'),glass=el('div','b-glass');glass.id='b-glass';scr.appendChild(glass);
  var att=el('div','b-attract'),skf=document.createElement('iframe');skf.title='SkopoRhogo';skf.setAttribute('tabindex','-1');att.appendChild(skf);glass.appendChild(att);
  var date=el('div','b-date','<b></b>');glass.appendChild(date);
  
  ['select','game','calque'].forEach(function(id){if($(id))glass.appendChild($(id));});
  var land=el('button','b-sticker b-land','<span>BURROWS</span>');land.type='button';land.setAttribute('aria-label','Burrows');
  var foot=el('div','b-bezelfoot');
  var badge=el('button','b-sticker b-badge','<b>MAUK TENIEB</b>');badge.type='button';badge.setAttribute('aria-label','Mauk Tenieb');
  var menu=home.querySelector('.menu'),loreHref=((menu&&menu.querySelector('a[href*="substack"]'))||{}).href||'https://mauktenieb.substack.com';
  var lore=el('a','b-sticker b-lore','<i class="b-paper" aria-hidden="true"></i><span class="b-sr">LORE</span><span class="b-word" aria-hidden="true">LORE</span>');lore.href=loreHref;lore.target='_blank';lore.rel='noopener';
  if($('koins')){$('koins').classList.add('b-credit');foot.appendChild($('koins'));}lore.classList.add('b-stuck');
  var butee=el('div','b-butee');butee.setAttribute('aria-hidden','true');
  bezel.appendChild(land);bezel.appendChild(butee);bezel.appendChild(scr);bezel.appendChild(foot);bezel.appendChild(lore);
  home.insertBefore(bezel,home.firstChild);

  /* ---------- le panneau ---------- */
  var panel=el('div','b-panel'),cabs=home.querySelector('.cabinets');home.insertBefore(panel,bezel.nextSibling);
  var row1=el('div','b-row1'),row2=el('div','b-row2'),sub=el('div','b-sub'),store=el('div','b-store');sub.hidden=true;store.hidden=true;
  var stick=el('div','b-stick','<i></i>');stick.setAttribute('aria-hidden','true');
  var keys=el('div','b-keys');if(cabs)keys.appendChild(cabs);keys.appendChild(sub);
  var bb=el('button','b-boom','<i></i>');bb.type='button';bb.setAttribute('aria-label','Baku Boom');foot.appendChild(bb);
  row1.appendChild(keys);
  if(menu)row2.appendChild(menu);
  /* console : les boutons BC TL IG en rangée de départ, au-dessus ; la manette au milieu, deux touches de chaque côté ; la plaque du fabricant sur le bord avant */
  panel.appendChild(row2);panel.appendChild(row1);var plate=el('div','b-plate');plate.appendChild(badge);panel.appendChild(plate);panel.appendChild(store);

  function cabOf(k){var b=document.querySelector('.cabinets [data-go="'+k+'"],.b-store [data-go="'+k+'"]');return b?b.closest('.cab'):null;}
  function tile(k,title,th,nc){var c=cabOf(k);if(c)return c;c=el('div','cab');c.style.cssText='--th:url('+th+');--nc:'+nc;
    c.innerHTML='<button type="button" class="hit" data-go="'+k+'"><b></b></button>';c.querySelector('b').textContent=title;
    c.querySelector('button').addEventListener('click',function(){IK().go&&IK().go(k);});return c;}
  /* KorhoGame : les grands jeux d'un côté ; de l'autre, Katabatik : le dé choisit parmi les mini-jeux (⚀ à ⚃ ; ⚄ et ⚅ : le hasard) */
  var KATA=['c4','bb','hang','mm','fi'],DICE='⚀⚁⚂⚃⚄⚅';
  var MINIS=[['c4','KONNECT4','borne-mini-c4.jpg','#f48fb1',0],['hang','AKASZTÓFA','borne-mini-hang.jpg','#f48fb1',2],['mm','MASKERMIND','borne-mini-mm.jpg','#f48fb1',3],['erratic','ERRATIK','thumb-erratic.jpg','#42a5f5',5]];
  function kata(g){var d=document.querySelector('.cab.dice b');if(d)d.dataset.d=DICE[KATA.indexOf(g)];IK().go&&IK().go('katabatik');}
  function play(g){if(g==='diktat'){IK().openCalque&&IK().openCalque('borne-diktat.html','DIKTATFAUNE');return;}if(g==='erratic')IK().go&&IK().go('erratic');else kata(g);}
  function ktile(g,title,th,nc,face){var c=el('div','cab b-kata');c.style.cssText='--th:url('+th+');--nc:'+nc;
    c.innerHTML='<button type="button" class="hit" data-kata="'+g+'"><b></b>'+(face!=null?'<i class="b-face">'+DICE[face]+'</i>':'')+'</button>';c.querySelector('b').textContent=title;
    c.querySelector('button').addEventListener('click',function(){play(g);});return c;}
  var GROUPS={korhogame:{t:'KorhoGame',th:'thumb-puck.jpg',nc:'#ffa726',items:[['puck','KORONG!','thumb-puck.jpg','#ffa726'],['chess','FAUNA CHESS','thumb-chess.jpg','#ab47bc'],
      ['faunarratics','FAUNARRATIK','thumb-faunarratics.jpg','#4fc3f7']],extra:[['fi','FAUNINVADERS','borne-big-fi.jpg','#c9a84c',3],]},
    fauneye:{t:'FaunEye',th:'borne-fauneye.jpg',nc:'#e2c27a',items:[['fauneye','BAKUBOOK','borne-fauneye.jpg','#e2c27a'],['vhs','VHS','thumb-vhs.jpg','#b9d84a'],['photo','FOTOFAUNA','thumb-photo.jpg','#ff5a5a']],extra:[['bb','MUSIK','borne-big-bb.jpg','#ff7043',2],['diktat','DIKTATFAUNE','borne-big-bb.jpg','#ff3b2f',4]]},
    surf:{t:'SurFauna',th:'thumb-repo.jpg',nc:'#7fe0ff',items:[['repo','REPORHOGO','thumb-repo.jpg','#b9d84a'],['tor','FAUNATOR','thumb-repo.jpg','#9e9e9e']]}};
  /* la graphie des noms (KorhoGame, FaunEye, SurFauna) dans une gravure tout en capitales : les minuscules en petites capitales */
  function caps(b,t){b.textContent='';b.setAttribute('aria-label',t);t.replace(/([A-Z0-9!]+)|([a-z]+)/g,function(m,U,l){var e=document.createElement(l?'small':'span');e.textContent=m;e.className=l?'b-sc':'';b.appendChild(e);return m;});}
  function group(g){var G=GROUPS[g],c=el('div','cab b-group');c.dataset.grp='g-'+g;c.style.cssText='--th:url('+G.th+');--nc:'+G.nc;
    c.innerHTML='<button type="button" class="hit" aria-expanded="false"><b></b></button>';caps(c.querySelector('b'),G.t);
    c.querySelector('button').addEventListener('click',function(){window.__borneGroup?window.__borneGroup(g):unfold(g);});return c;}
  if(cabs){
    /* les programmes des groupes vont en réserve ; les cabinets sans place y restent branchés (dé, chambre, Mask de Bio) */
    Object.keys(GROUPS).forEach(function(g){GROUPS[g].els=GROUPS[g].items.map(function(it){var c=tile(it[0],it[1],it[2],it[3]);store.appendChild(c);return c;});});
    Object.keys(GROUPS).forEach(function(g){(GROUPS[g].extra||[]).forEach(function(it){var c=ktile(it[0],it[1],it[2],it[3]);GROUPS[g].els.push(c);store.appendChild(c);});});var KG=GROUPS.korhogame;
    var ORD=['puck','fi','faunarratics','chess'],keyOf=function(c){var b=c.querySelector('[data-go],[data-kata]');return b.dataset.go||b.dataset.kata;};
    KG.els.sort(function(a,b){return ORD.indexOf(keyOf(a))-ORD.indexOf(keyOf(b));});
    /* le côté des mini-jeux : le dé, puis chaque mini-jeu sous sa face */
    var DIMG=['de-a.webp','de-b.webp','de-c.webp'],die=el('button','b-die','<img class="b-dimg" alt="" src="'+DIMG[0]+'"><span>'+DICE[0]+'</span><b>KATABATIK</b>');die.type='button';die.setAttribute('aria-label','Katabatik');
    KG.minis=[die].concat(MINIS.map(function(m){return ktile(m[0],m[1],m[2],m[3],m[4]);}));KG.minis.forEach(function(c){store.appendChild(c);});
    var rolling=false;die.onclick=function(){if(rolling)return;rolling=true;var n=0,N=9,pick=(function(){/* le dé tombe toujours sur un autre mini-jeu que la fois précédente (mémoire 20 oct.) */var last=null;try{last=sessionStorage.getItem('borne.dice');}catch(e){}var pool=MINIS.filter(function(m){return m[0]!==last;});var q=pool[Math.floor(Math.random()*pool.length)]||MINIS[0];try{sessionStorage.setItem('borne.dice',q[0]);}catch(e){}return q;})(),f=pick[4],sp=die.querySelector('span');
      var iv=setInterval(function(){var x=++n>=N?f:Math.floor(Math.random()*6);var di=die.querySelector('.b-dimg');di.src=DIMG[n%3];di.style.transform='rotate('+(n>=N?0:Math.round((Math.random()-.5)*120))+'deg)';sp.textContent=DICE[x];sp.style.setProperty('--r',(n>=N?0:(Math.random()-.5)*90)+'deg');
        try{IK().tone&&IK().tone(300+Math.random()*500,.03,'square',.02);}catch(e){}
        if(n>=N){clearInterval(iv);var g=pick[0];
          [].forEach.call(subG.querySelectorAll('[data-kata]'),function(b){b.closest('.cab').classList.toggle('lit',b.dataset.kata===g);});
          setTimeout(function(){rolling=false;play(g);},650);}},70);};
    var sk=cabOf('skopo');if(sk)sk.remove();
    var mt=tile('terminal','3615','thumb-3615.jpg','#66bb6a');
    [].slice.call(cabs.children).forEach(function(c){if(c.classList.contains('cab'))store.appendChild(c);});
    [group('korhogame'),group('fauneye'),stick,mt,group('surf')].forEach(function(c){cabs.appendChild(c);});
  }
  /* trois petits boutons : BC, TL, IG */
  if(menu){[].slice.call(menu.children).forEach(function(x){if(!/threadless|instagram/.test(x.getAttribute('href')||''))x.remove();});
    [].slice.call(menu.children).forEach(function(x){x.textContent=/threadless/.test(x.getAttribute('href')||'')?'TL':'IG';});
    var bc=el('a',null,'BC');bc.href='https://mauktenieb.bandcamp.com';bc.target='_blank';bc.rel='noopener';bc.style.setProperty('--mc','#1da0c3');menu.insertBefore(bc,menu.firstChild);}
  var subT=el('div','b-subbar','<b></b>'),subG=el('div','b-subgrid');sub.appendChild(subT);sub.appendChild(subG);
  var openG=null;
  function unfold(g){var G=GROUPS[g];openG=g;subG.innerHTML='';caps(subT.querySelector('b'),G.t);
    if(G.minis){var big=el('div','b-side b-big'),mini=el('div','b-side b-minis');G.els.forEach(function(c){big.appendChild(c);});G.minis.forEach(function(c){mini.appendChild(c);});
      subG.appendChild(big);subG.appendChild(mini);subG.classList.add('b-split');}
    else{subG.classList.remove('b-split');G.els.forEach(function(c){subG.appendChild(c);});}
    sub.hidden=false;if(cabs)cabs.hidden=true;panel.classList.remove('b-unfold');void panel.offsetWidth;panel.classList.add('b-unfold');}
  function fold(){if(!openG)return;GROUPS[openG].els.concat(GROUPS[openG].minis||[]).forEach(function(c){store.appendChild(c);});[].forEach.call(subG.querySelectorAll('.lit'),function(c){c.classList.remove('lit');});openG=null;sub.hidden=true;if(cabs)cabs.hidden=false;}

  /* ---------- la porte : la fente, le son, la langue ---------- */
  var door=el('div','b-door'),slot=el('button','b-slot','<b><em>INSERT</em> <u>KOIN</u></b><i></i>');slot.type='button';slot.setAttribute('aria-label','Insert Koin · 3615 KOINS');
  var knobs=el('div','b-knobs');door.appendChild(slot);var row=el('div','b-doorrow');row.appendChild(door);row.appendChild(knobs);/* le rack de molettes est un bloc frère de la caisse, dans la rangée */
  /* le bouton SKIN : le meuble en bois, en métal, ou en jeu électromécanique des années 1960 */
  var SKINS=['bois','metal'],skin=null;/* un skin tiré au hasard à chaque arrivée ; le bouton SKIN change ensuite */
  /* première visite : un skin au hasard ; ensuite, celui que le visiteur a choisi */
  if(SKINS.indexOf(skin)<0)skin=SKINS[Math.floor(Math.random()*SKINS.length)];root.dataset.skin=skin;
  /* variantes du skin 1960, tirées à chaque visite et à chaque retour sur ce skin : enseigne, cadre, panneau, porte */
  var V1960={fronton:['skin-1960-fronton-a.webp','skin-1960-fronton-b.webp'],
    cadre:[['skin-1960-cadre-a.webp','223 172 221 171'],['skin-1960-cadre-b.webp','213 202 137 177'],['skin-1960-cadre-c.webp','227 175 226 182']],
    panneau:['skin-1960-panneau-a.webp','skin-1960-panneau-b.webp'],
    porte:[['skin-1960-porte-a.webp','1024/572','31%','59%','38%','12%'],['skin-1960-porte-b.webp','1024/434','20%','76%','34%','14%']]};
  function pick(a){return a[Math.floor(Math.random()*a.length)];}
  function variants(){var s=root.style,c=pick(V1960.cadre),p=pick(V1960.porte);s.setProperty('--v-fronton','url('+pick(V1960.fronton)+')');s.setProperty('--v-cadre','url('+c[0]+')');s.setProperty('--v-cs',c[1]);
    s.setProperty('--v-panneau','url('+pick(V1960.panneau)+')');s.setProperty('--v-porte','url('+p[0]+')');s.setProperty('--v-pr',p[1]);s.setProperty('--v-sx',p[2]);s.setProperty('--v-sy',p[3]);s.setProperty('--v-sw',p[4]);s.setProperty('--v-sh',p[5]);}
  variants();
  /* pièces tirées au hasard à chaque visite : l'autocollant Lore, la caméra, la manette */
  (function(){var s=root.style;s.setProperty('--i-lore','url('+pick(['sticker-lore-vide-a.webp','sticker-lore-vide-b.webp'])+')');
    s.setProperty('--i-cam','url('+pick(['camera-a.webp','camera-c.webp'])+')');/* caméras du toit : la webcam à pied et lentille bleue, ou la compacte Korhogo (décision de Mauk Tenieb, 30 oct., 22 h 40) */var mt='manette-a.webp';/* la manette courte, à embase (décision de Mauk Tenieb, 30 oct., 23 h 33 : plus réaliste) */s.setProperty('--i-stick','url('+mt+')');s.setProperty('--stk-cut',mt==='manette-a.webp'?'50%':'76%');s.setProperty('--ball-cut',mt==='manette-a.webp'?'39.5%':'37.5%');})();
  var sw=el('div','b-knobw'),sb=el('button','b-knob b-skin');sb.type='button';sb.setAttribute('aria-label','Skin');sb.dataset.pos=SKINS.indexOf(skin);
  sw.appendChild(sb);sw.appendChild(el('span','b-knoblab','🧤'));knobs.appendChild(sw);
  sb.onclick=function(){try{window.__borneUsure&&window.__borneUsure();}catch(e){}skin=SKINS[(SKINS.indexOf(skin)+1)%SKINS.length];sb.dataset.pos=SKINS.indexOf(skin);try{localStorage.setItem('borne.skin',skin);}catch(e){}
    try{IK().tone&&IK().tone(220,.05,'square',.03);IK().tone&&IK().tone(330,.05,'square',.03,0,.06);}catch(e){}
    scr.classList.remove('b-morph');void scr.offsetWidth;scr.classList.add('b-morph');setTimeout(function(){if(skin==='1960')variants();root.dataset.skin=skin;},250);};
  /* VOL : la molette du volume de la machine (sons des jeux et de la mécanique) ; trois crans, 0, moyen, fort */
  (function(){var b=$('snd');if(!b)return;var lv=2;try{var v=localStorage.getItem('borne.vol');if(v!=null)lv=+v?2:0;}catch(e){}
    function isOn(){return /ON/i.test(b.textContent||'');}
    function apply(){if((lv>0)!==isOn())HTMLElement.prototype.click.call(b);window.__borneVol=[0,.45,1][lv];try{window.__borneSon&&window.__borneSon.vol&&window.__borneSon.vol(window.__borneVol);}catch(e){}
      b.dataset.pos=lv;try{localStorage.setItem('borne.vol',lv);}catch(e){}}
    b.addEventListener('click',function(e){if(e.isTrusted||e.detail){e.preventDefault();e.stopImmediatePropagation();lv=lv?0:2;apply();try{window.__borneMusic&&window.__borneMusic(lv>0);}catch(_){}}},true);
    setTimeout(apply,300);})();
  [['snd','🎶'],['lang','FR · EN']].forEach(function(p){var b=$(p[0]);if(!b)return;var w=el('div','b-knobw');b.classList.add('b-knob');b.setAttribute('aria-label',p[1]);w.appendChild(b);w.appendChild(el('span','b-knoblab',p[1]));knobs.appendChild(w);
    var sync=function(){var t=(b.textContent||'').toUpperCase();b.dataset.on=(p[0]==='snd'?/ON/.test(t):/FR/.test(t))?'1':'0';};sync();
    new MutationObserver(sync).observe(b,{childList:true,characterData:true,subtree:true});});
  if($('kal'))door.appendChild($('kal'));
  wrap.appendChild(row);
  /* le copyright, petit, tout en bas du meuble */
  var cp=document.querySelector('#home .copy');if(cp){cp.classList.add('b-copy');wrap.appendChild(cp);}
  var SL=['KOIN','KINOS',"O'SKIN"],si=0,kw=slot.querySelector('u');
  setInterval(function(){if(slot.classList.contains('b-wait'))return;si=(si+1)%SL.length;kw.classList.remove('flip');void kw.offsetWidth;kw.textContent=SL[si];kw.classList.add('flip');},4200);
  /* zéro Koin : la fente affiche le décompte de la Koin gratuite */
  setInterval(function(){var kn=$('kn'),m=kn&&/·\s*(\d+)\s*s/.exec(kn.textContent||''),w=slot.classList.contains('b-wait');
    if(m){slot.classList.add('b-wait');kw.textContent='+1 · '+m[1]+'s';}else if(w){slot.classList.remove('b-wait');kw.textContent=SL[si];}},500);
  slot.onclick=function(){var c=el('span','b-coin');slot.appendChild(c);
    try{IK().tone&&IK().tone(1320,.06,'square',.03);IK().tone&&IK().tone(660,.12,'triangle',.03,0,.25);}catch(e){}
    setTimeout(function(){c.remove();IK().go&&IK().go('kal');},560);};

  /* ---------- l'habit suit le programme ; les appareils transforment le meuble ---------- */
  var HABIT={terminal:'minitel',kal:'minitel',vhs:'vhs',photo:'photo',kapture:'photo',fauneye:'fauneye',puck:'korong',room:'korong'};
  var DEVICE={terminal:1,kal:1,vhs:1,photo:1,kapture:1};
  var LABEL={minitel:'3615',vhs:'VHS',photo:'FOTOFAUNA',fauneye:'FaunEye',korong:'KORONG!',arcade:'',repos:''};
  var morphT=0;
  function relayout(){try{window.dispatchEvent(new Event('resize'));}catch(e){}try{var f=$('cf');if(f&&f.contentWindow)f.contentWindow.dispatchEvent(new Event('resize'));}catch(e){}}
  /* la caméra : en lançant un jeu, on s'approche de l'écran ; en revenant à l'accueil, on recule (borne-arcade.js, __borneCam) */
  function dress(h,device){var C=window.__borneCam;
    if(C&&C.ok()&&root.dataset.prog&&h==='repos'){var g=C.rect();C.swap(function(){delete root.dataset.big;dress0(h,device);});Promise.resolve().then(function(){try{window.__borneFit&&window.__borneFit();}catch(e){}C.zoomOut(g);});return;}
    if(C)C.stop();dress0(h,device);}
  function dress0(h,device){var mode=device?'device':'arcade',change=root.dataset.habit!==h||root.dataset.mode!==mode;
    /* la caméra fait déjà le passage : le faisceau du tube sert seulement aux changements de programme sans caméra (zapping) */
    if(change&&!root.hasAttribute('data-cam')&&!matchMedia('(prefers-reduced-motion:reduce)').matches){scr.classList.remove('b-morph');void scr.offsetWidth;scr.classList.add('b-morph');
      clearTimeout(morphT);morphT=setTimeout(function(){scr.classList.remove('b-morph');},1000);}
    root.dataset.habit=h;root.dataset.mode=mode;if(h==='repos')delete root.dataset.prog;else{root.dataset.prog='1';[60,700].forEach(function(t){setTimeout(function(){scrollTo({top:0,behavior:t>100?'smooth':'auto'});},t);});}hab.classList.remove('tilt');hab.textContent=LABEL[h]||'';
    [120,500,800,1100].forEach(function(t){setTimeout(relayout,t);});
    if(h==='repos'){wake();camsOff();}else sleep();}
  /* la caméra s'éteint dès que FotoFauna quitte l'écran */
  function camsOff(){[].forEach.call(document.querySelectorAll('iframe'),function(f){try{var w=f.contentWindow;if(w&&typeof w.stopCam==='function')w.stopCam();}catch(e){}});}
  function mark(k){[cabs,subG].forEach(function(r){if(r)r.querySelectorAll('.cab').forEach(function(c){var b=c.querySelector('[data-go]');c.classList.toggle('on-air',!!b&&b.dataset.go===k);});});}
  /* les grands jeux agrandissent l'écran à la hauteur de la fenêtre ; FaunInvaders redresse l'écran à la verticale, comme les bornes de 1978 */
  function bigOf(k){if(k==='katabatik'){var d=document.querySelector('.cab.dice b'),f=d?DICE.indexOf(d.dataset.d):-1;return f===4?'tate':f===1?'wide':'';}
    return {puck:'wide',chess:'wide',faunarratics:'wide'}[k]||'';}
  function setBig(v){if(v)root.dataset.big=v;else delete root.dataset.big;
    setTimeout(relayout,820);}
  var CAMGO=0;
  window.__borneGo=function(k){var C=window.__borneCam;
    try{window.__borneTourStop&&window.__borneTourStop();}catch(e){}
    /* les mini-jeux et DiktatFaune passent par leur vraie touche : le dé de Katabatik, le calque de DiktatFaune */
    if(KATA.indexOf(k)>=0){kata(k);return true;}if(k==='diktat'){play('diktat');return true;}
    if(!CAMGO&&C&&C.ok()&&root.dataset.habit==='repos'&&!root.dataset.prog&&k!=='visit'){C.zoomIn(function(){CAMGO=1;try{IK().go(k);}finally{CAMGO=0;}});return true;}
    setBig(bigOf(k));CUR=k==='katabatik'?(function(){var d=document.querySelector('.cab.dice b'),f=d?DICE.indexOf(d.dataset.d):0;return KATA[f]||'c4';})():k;paintDots();
    if(k==='fauneye'){IK().ac&&IK().ac();dress('fauneye');mark(k);IK().openCalque('borne-fauneye.html','FaunEye');return true;}
    if(k==='skopo'){dress('arcade');mark(k);IK().openCalque('skoporhogo-borne.html','SkopoRhogo');return true;}
    if(k==='visit'){full('/katabase/','BURROWS');return true;}
    dress(HABIT[k]||'arcade',!!DEVICE[k]);mark(k);
    /* programme refusé (Koins à zéro) : la borne reprend son habit de repos */
    return false;};
  /* l'écran de la page commande l'habit : de retour à l'accueil (programme refusé, retour), la borne reprend son habit de repos */
  new MutationObserver(function(){var home=document.body.className.indexOf('on-home')>=0;
    if(home&&root.dataset.habit!=='repos'&&!SWAP){dress('repos');mark(null);setBig('');}else if(!home&&root.dataset.habit==='repos')dress('arcade');}).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.__borneHome=function(){if(SWAP)return;CUR=null;paintDots();fold();dress('repos');mark(null);setBig('');scrollTo({top:0,behavior:'smooth'});};
  window.__borneGame=function(k){if(k==='kapture')dress('photo',true);};

  /* ---------- d'un programme à l'autre : un glissé depuis le bord de l'écran, ou Page préc. / Page suiv. ; des points sous l'écran, comme les chaînes d'un téléviseur ----------
     L'ordre suit le panneau. À zéro Koin, un jeu payant se saute : le glissé va au programme suivant. */
  var ORDER=['puck','fi','faunarratics','chess','c4','hang','mm','erratic','fauneye','vhs','photo','bb','diktat','terminal','repo','tor'];
  var GRP=[['puck','fi','faunarratics','chess','c4','hang','mm','erratic'],['fauneye','vhs','photo','bb','diktat'],['terminal'],['repo','tor']];
  var NAME={chess:'FAUNA CHESS',fi:'FAUNINVADERS',diktat:'DIKTATFAUNE',puck:'KORONG!',faunarratics:'FAUNARRATIK',bb:'MUSIK',c4:'KONNECT4',hang:'AKASZTÓFA',mm:'MASKERMIND',erratic:'ERRATIK',
    fauneye:'BAKUBOOK',vhs:'VHS',photo:'FOTOFAUNA',terminal:'3615',repo:'REPORHOGO',tor:'FAUNATOR'};
  var CUR=null,SWAP=false;
  function launch(g){if(g==='diktat'){IK().openCalque&&IK().openCalque('borne-diktat.html','DIKTATFAUNE');return;}if(KATA.indexOf(g)>=0)kata(g);else IK().go&&IK().go(g);}
  /* 8 nov. — adresse par programme : ?p=<programme> ouvre ce programme (lien des habillages KorhogOS, DVD, télé du motel, vidéoclub) */
  window.__borneLaunch=launch;
/* 8 nov. : ?kap=1 (barre des lieux du motel) ouvre Kapture une fois la borne prête */
(function(){if(!/[?&]kap=1/.test(location.search))return;var n=0,t=setInterval(function(){var k=document.getElementById('kapture');if((k&&document.documentElement.classList.contains('borne-ready'))||++n>60){clearInterval(t);if(k)k.click();}},250);})();
  (function(){var m=/[?&]p=([a-z0-9]+)/.exec(location.search);if(!m)return;var k=m[1];if(ORDER.indexOf(k)<0&&['katabatik','skopo'].indexOf(k)<0)return;
    var n=0,t=setInterval(function(){n++;var ok=IK()&&IK().go;if(ok||n>40){clearInterval(t);if(ok)launch(k);}},150);})();
  var dots=el('div','b-dots');dots.setAttribute('role','tablist');scr.appendChild(dots);
  function paintDots(){dots.innerHTML='';var G=null;GRP.forEach(function(g){if(g.indexOf(CUR)>=0)G=g;});if(!G||G.length<2){dots.hidden=true;return;}dots.hidden=false;
    G.forEach(function(g){var b=el('button','b-dot'+(g===CUR?' on':''));b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(g===CUR));b.setAttribute('aria-label',NAME[g]);b.title=NAME[g];
      b.onclick=function(){if(g!==CUR)swap(ORDER.indexOf(g)>ORDER.indexOf(CUR)?1:-1,g);};dots.appendChild(b);});dotFit();}
  /* 1er nov. — la rangée de points tient entre le bas de l'écran et la bande basse : l'écran cède la hauteur qui manque, jamais les points ni la bande */
  function dotFit(){if(root.hasAttribute('data-fitting'))return;root.setAttribute('data-fitting','');try{dotFit1();}finally{requestAnimationFrame(function(){requestAnimationFrame(function(){root.removeAttribute('data-fitting');});});}}
  function dotFit1(){var old=root.style.getPropertyValue('--gh'),oldw=root.style.getPropertyValue('--gw');root.style.removeProperty('--gh');root.style.removeProperty('--gw');root.style.removeProperty('--r-dots');
    if(dots.hidden||!root.hasAttribute('data-prog')||root.classList.contains('b-immersion'))return;
    var d=dots.getBoundingClientRect(),ft=document.querySelector('.b-bezelfoot'),lim=innerHeight-2;if(!d.height){if(old)root.style.setProperty('--gh',old,'important');if(oldw)root.style.setProperty('--gw',oldw,'important');return;}
    if(ft){var f=ft.getBoundingClientRect();if(f.width&&f.left<d.right&&f.right>d.left&&f.bottom>d.top)lim=Math.min(lim,f.top-2);}
    var over=d.bottom-lim;
    /* l'écran centré (jeux en hauteur) redescend de la moitié de ce qu'il cède : on reprend la mesure jusqu'à ce que les points tiennent */
    for(var it=0;over>0&&it<6;it++){var g0=glass.getBoundingClientRect(),T=Math.max(160,Math.round(g0.height-over));root.style.setProperty('--gh',T+'px','important');
      var g1=glass.getBoundingClientRect();if(g1.height>T+1)root.style.setProperty('--gw',Math.round(g1.width*T/g1.height)+'px','important');
      var g2=glass.getBoundingClientRect();if(g2.height>T+1)root.style.setProperty('--r-dots',Math.round((parseFloat(root.style.getPropertyValue('--r-dots'))||0)+g2.height-T)+'px');
      d=dots.getBoundingClientRect();over=d.bottom-lim;if(T<=160)break;}}
  function dotLater(){clearTimeout(dotFit.t);dotFit.t=setTimeout(dotFit,60);}
  addEventListener('resize',dotLater);new MutationObserver(dotLater).observe(root,{attributes:true,attributeFilter:['data-prog','data-habit','data-mode','data-big','class']});
  setInterval(function(){if(root.hasAttribute('data-prog')&&!dots.hidden&&!document.hidden)dotFit();},400);
  var label=el('div','b-chan');glass.appendChild(label);
  /* un seul niveau : la touche lance le premier programme de son groupe ; la manette ou un glissé zappe dans le groupe */
  var FIRST={korhogame:'puck',fauneye:'fauneye',surf:'repo'};
  window.__borneGroup=function(g){var f=FIRST[g];if(!f)return unfold(g);CUR=f;label.textContent=NAME[f];label.classList.remove('on');void label.offsetWidth;label.classList.add('on');launch(f);setTimeout(paintDots,700);};
  window.__borneZap=function(d){swap(d);};window.__borneCur=function(){return CUR;};
  function swap(dir,target,tries){if(!CUR||SWAP&&!tries)return;tries=tries||0;if(tries>=ORDER.length)return;
    var PAID={chess:1,fi:1,faunarratics:1,bb:1,c4:1,hang:1,mm:1,erratic:1},broke=(parseInt(($('kn')||{}).textContent,10)||0)<1;
    var LIST=ORDER;GRP.forEach(function(G){if(G.indexOf(CUR)>=0&&G.length>1)LIST=G;});if(tries>=LIST.length)return;
    var i=LIST.indexOf(CUR),g=target;if(!g){for(var n=1;n<=LIST.length;n++){var c=LIST[(i+dir*n+LIST.length*n)%LIST.length];if(!(broke&&PAID[c])){g=c;break;}}}if(!g||g===CUR)return;SWAP=true;
    glass.classList.remove('b-snow');void glass.offsetWidth;glass.classList.add('b-snow');label.textContent=NAME[g];label.classList.remove('on');void label.offsetWidth;label.classList.add('on');
    try{IK().tone&&IK().tone(180,.25,'sawtooth',.02);IK().burst&&IK().burst(3000,'highpass',.04,.25);}catch(e){}
    setTimeout(function(){IK().goHome&&IK().goHome();setTimeout(function(){CUR=g;launch(g);
      setTimeout(function(){if(document.body.className.indexOf('on-home')>=0){CUR=g;swap(dir,null,tries+1);return;}SWAP=false;paintDots();},700);},40);},180);}
  /* les bandes des bords : un glissé qui part du bord change de programme, le milieu de l'écran reste aux programmes */
  ['l','r'].forEach(function(s){var e=el('div','b-edge b-edge-'+s);e.setAttribute('aria-hidden','true');e.innerHTML='<i>'+(s==='l'?'‹':'›')+'</i>';glass.appendChild(e);var x0=null,y0=0;
    e.addEventListener('pointerdown',function(ev){x0=ev.clientX;y0=ev.clientY;try{e.setPointerCapture(ev.pointerId);}catch(_){}});
    e.addEventListener('pointerup',function(ev){if(x0==null)return;var dx=ev.clientX-x0,dy=ev.clientY-y0;x0=null;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))swap(dx<0?1:-1);else if(Math.abs(dx)<8&&Math.abs(dy)<8)swap(s==='l'?-1:1);});
    e.addEventListener('pointercancel',function(){x0=null;});});
  function navKey(e){if(!CUR||document.body.className.indexOf('on-home')>=0)return;if(e.key==='PageDown'){e.preventDefault();swap(1);}else if(e.key==='PageUp'){e.preventDefault();swap(-1);}}
  addEventListener('keydown',navKey,true);

  /* ---------- Baku Boom : un coup de tilt, pour tous les boutons Baku Boom de la page ---------- */
  var tilting=false;
  window.__borneBoom=function(cb){if(tilting)return;tilting=true;
    try{IK().burst&&IK().burst(90,'lowpass',.35,.5);IK().tone&&IK().tone(70,.5,'sawtooth',.06,-30);IK().tone&&IK().tone(1046,.08,'square',.025,0,.45);}catch(e){}
    wrap.classList.remove('b-shake');void wrap.offsetWidth;wrap.classList.add('b-shake');root.classList.add('b-tilted');hab.textContent='TILT';hab.classList.add('tilt');
    /* le mot BAKU BOOM s'allume une fois le tube éteint, sur le noir, jamais par-dessus l'image du jeu */
    var gr=glass.getBoundingClientRect();setTimeout(function(){var fl=el('div','b-bbflash','BAKU BOOM');fl.style.left=(gr.left+gr.width/2)+'px';fl.style.top=(gr.top+gr.height/2)+'px';document.body.appendChild(fl);setTimeout(function(){fl.remove();},560);},360);
    /* 8 nov. (Mauk Tenieb : « BakuBoom est trop faible en matière de tilt ») : le meuble bascule sur ses pieds et oscille 1,4 s ; enseigne et lampes vacillent ; le tube s'éteint en trait puis en point, reste noir, puis chauffe et revient (rallumage dès le point éteint, sinon l'image d'avant transparaît) */
    glass.classList.remove('b-on');glass.classList.add('b-off');
    /* les étapes suivent la fin réelle de chaque animation (animationend), un minuteur de secours derrière */
    var stage=0,ch=glass.firstElementChild;
    function relight(){if(stage)return;stage=1;try{cb&&cb();}catch(e){}glass.classList.remove('b-off');glass.classList.add('b-on');
      var done=false;function fin(){if(done)return;done=true;glass.classList.remove('b-on');wrap.classList.remove('b-shake');root.classList.remove('b-tilted');hab.classList.remove('tilt');hab.textContent=LABEL[root.dataset.habit]||'';tilting=false;}
      if(ch)ch.addEventListener('animationend',function h(e){if(e.animationName==='bon2'){ch.removeEventListener('animationend',h);setTimeout(fin,350);}});setTimeout(fin,2200);}
    if(ch)ch.addEventListener('animationend',function h(e){if(e.animationName==='boff2'){ch.removeEventListener('animationend',h);relight();}});
    setTimeout(relight,1500);};
  bb.onclick=function(){var away=document.body.className.indexOf('on-home')<0;fold();window.__borneBoom(function(){if(away)IK().goHome();});};

  /* ---------- Burrows et la bio : la borne s'efface, la page s'ouvre en plein écran, prête à imprimer ---------- */
  function full(src,title){var o=el('div','b-full'),fr=lang()==='fr';o.setAttribute('role','dialog');o.setAttribute('aria-label',title);
    o.innerHTML='<header><button type="button" data-x aria-label="'+(fr?'Borne':'Cabinet')+'">◀</button><b></b><button type="button" data-p>'+(fr?'IMPRIMER · PDF':'PRINT · PDF')+'</button></header><iframe title=""></iframe>';
    o.querySelector('b').textContent=title;var f=o.querySelector('iframe');f.title=title;f.src=src;document.body.appendChild(o);wrap.classList.add('b-crushed');sleep();
    var close=function(){o.classList.add('out');wrap.classList.remove('b-crushed');setTimeout(function(){o.remove();if(root.dataset.habit==='repos')wake();},450);};
    o.querySelector('[data-x]').onclick=close;o.querySelector('[data-p]').onclick=function(){try{f.contentWindow.focus();f.contentWindow.print();}catch(e){window.print();}};
    addEventListener('keydown',function esc(e){if(e.key==='Escape'&&document.body.contains(o)){removeEventListener('keydown',esc);close();}});}
  land.onclick=function(){full('/katabase/','BURROWS');};
  badge.onclick=function(){window.open('https://github.com/mauktenieb','_blank','noopener');};
  wrap.addEventListener('click',function(e){var a=e.target.closest('[data-swap="bio"]');if(!a)return;e.preventDefault();e.stopPropagation();full('borne-bio.html','MAUK TENIEB');},true);

  /* ---------- SkopoRhogo tourne seulement quand il est à l'écran ---------- */
  function wake(){if(!skf.src||skf.src.indexOf('skoporhogo-borne.html')<0)skf.src='skoporhogo-borne.html?attract=1';try{skf.contentWindow.postMessage({borne:'wake'},'*');}catch(e){}}
  function sleep(){try{skf.contentWindow.postMessage({borne:'sleep'},'*');}catch(e){}}
  addEventListener('message',function(e){if(e.source===skf.contentWindow&&e.data&&e.data.borne==='open'&&root.dataset.habit==='repos')IK().go&&IK().go('skopo');});
  document.addEventListener('visibilitychange',function(){if(document.hidden)sleep();else if(root.dataset.habit==='repos')wake();});
  /* aux trois quarts hors de la fenêtre, la chambre dort ; elle se réveille quand l'écran revient en vue */
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){if(!skf.src)return;if(e.intersectionRatio>=.25){if(root.dataset.habit==='repos')wake();}else sleep();});},{threshold:[0,.25,.5]}).observe(skf);

  /* ---------- la manette, en miroir : elle penche avec les flèches et les glissés dans l'écran ---------- */
  var mini=el('div','b-stick b-stick-mini','<i></i>');mini.setAttribute('aria-hidden','true');foot.insertBefore(mini,bb);
  /* la manette a un ressort : elle part, dépasse, cogne la butée, tremble et revient ; le panneau encaisse le choc */
  var SP={x:0,y:0,vx:0,vy:0,tx:0,ty:0,run:false,t:0,hit:0};
  function spring(t){var dt=Math.min(.032,(t-(SP.t||t))/1000)||.016;SP.t=t;
    var k=SP.tx||SP.ty?520:380,c=SP.tx||SP.ty?18:11;
    SP.vx+=(-(SP.x-SP.tx)*k-SP.vx*c)*dt;SP.vy+=(-(SP.y-SP.ty)*k-SP.vy*c)*dt;SP.x+=SP.vx*dt;SP.y+=SP.vy*dt;
    var L=1.18;if(Math.abs(SP.x)>L){SP.x=L*Math.sign(SP.x);var v=Math.abs(SP.vx);SP.vx=-SP.vx*.42;if(v>3.2&&t-SP.hit>90){SP.hit=t;knock(Math.min(1,v/9));}}
    if(Math.abs(SP.y)>L){SP.y=L*Math.sign(SP.y);SP.vy=-SP.vy*.42;}
    var j=Math.min(.06,Math.hypot(SP.vx,SP.vy)/260);/* la vibration de la tige à grande vitesse */
    [stick,mini].forEach(function(s){s.style.setProperty('--x',(SP.x+(Math.random()-.5)*j).toFixed(3));s.style.setProperty('--y',SP.y.toFixed(3));s.style.setProperty('--v',Math.min(1,Math.abs(SP.vx)/6).toFixed(2));});
    if(Math.abs(SP.x-SP.tx)+Math.abs(SP.y-SP.ty)+Math.abs(SP.vx)+Math.abs(SP.vy)>.004)requestAnimationFrame(spring);else{SP.run=false;SP.t=0;}}
  function knock(f){try{if(window.__borneSon)window.__borneSon.knock(f);}catch(e){}
    var P=document.querySelector('.b-panel');if(P&&P.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)P.animate([{translate:'0 0'},{translate:(SP.x>0?2:-2)*f+'px '+f+'px'},{translate:(SP.x>0?-1:1)*f+'px 0'},{translate:'0 0'}],{duration:170,easing:'ease-out'});}
  var tilt=function(x,y){SP.tx=Math.tanh(x*1.1);SP.ty=Math.tanh(y*1.1);if(!SP.run){SP.run=true;requestAnimationFrame(spring);}},held={};
  window.__borneTilt=tilt;
  var KX={ArrowLeft:-1,ArrowRight:1,a:-1,q:-1,d:1},KY={ArrowUp:-1,ArrowDown:1,w:-1,z:-1,s:1};
  var clamp=function(v){return Math.max(-1,Math.min(1,v));};
  function fromKeys(){var x=0,y=0;Object.keys(held).forEach(function(k){x+=KX[k]||0;y+=KY[k]||0;});tilt(clamp(x),clamp(y));}
  addEventListener('keydown',function(e){if(KX[e.key]!=null||KY[e.key]!=null){held[e.key]=1;fromKeys();}},true);
  addEventListener('keyup',function(e){if(held[e.key]){delete held[e.key];fromKeys();}},true);
  var g0=null;glass.addEventListener('pointerdown',function(e){g0=[e.clientX,e.clientY];},true);
  glass.addEventListener('pointermove',function(e){if(g0)tilt(clamp((e.clientX-g0[0])/70),clamp((e.clientY-g0[1])/70));},true);
  addEventListener('pointerup',function(){if(g0){g0=null;tilt(0,0);}},true);
  addEventListener('pointercancel',function(){g0=null;tilt(0,0);},true);

  /* ---------- les retours en double des programmes disparaissent : la borne fournit Baku Boom ---------- */
  function hideDup(r){if(!r)return;[].forEach.call(r.querySelectorAll('button,a'),function(b){var t=(b.textContent||'').trim().toUpperCase();
    if(/^←\s*(BACK|RETOUR|MENU|EXIT|SORTIE|KATABATIK)$/.test(t)||t==='BAKU BOOM'||b.hasAttribute('data-back')||b.id==='m-quit'||b.id==='kapture-close')b.classList.add('b-dup');});}
  [$('select'),$('game'),$('kg-root')].forEach(function(r){if(!r)return;hideDup(r);new MutationObserver(function(){hideDup(r);}).observe(r,{childList:true,subtree:true});});

  /* ---------- l'entretien de la plante : l'eau, le soleil, la taille ; elle s'en souvient d'une visite à l'autre ----------
     sans eau depuis quatre jours ou sans soleil depuis six, elle s'affaisse et jaunit ; chaque taille la rend plus touffue, jusqu'à trois. */
  var DAY=864e5,CL=function(x){return Math.max(0,Math.min(1,x));};
  /* état stocké (borne.plant) : water, sun (dernier soin), cut (tailles, 0 à 3), cutAt, d (densité 0..1), g (pousse 0..1), t (dernier relevé), v (dernière visite).
     Les valeurs d et g déclinent lentement avec le temps ; cs() rend l'état déjà décliné. */
  var cs=function(){var c={};try{c=JSON.parse(localStorage.getItem('borne.plant')||'{}')||{};}catch(e){}var n=Date.now();
    if(!c.water)c.water=n;if(!c.sun)c.sun=n;if(c.cut==null)c.cut=0;if(!c.cutAt)c.cutAt=0;if(c.t==null)c.t=n;if(!c.v)c.v=0;
    var dt=Math.max(0,(n-c.t)/DAY),dry=Math.max((n-c.water)/(4*DAY),(n-c.sun)/(6*DAY));
    c.d=CL((c.d==null?.2:c.d)-.06*dt);c.g=CL((c.g==null?.1:c.g)-.012*dt*(dry>.5?1:.25));c.t=n;return c;};
  function save(c){try{localStorage.setItem('borne.plant',JSON.stringify(c));}catch(_){}}
  /* manque de soin : progressif, de 0 (soignée) à 1 (assoiffée, jamais morte) ; l'eau compte après deux jours, le soleil après trois */
  function neglect(c){var n=Date.now(),wl=CL(((n-c.water)/(4*DAY)-.5)/1.5),sl=CL(((n-c.sun)/(6*DAY)-.5)/1.5);return CL(.6*wl+.4*sl);}/* 7 nov. : la soif et le manque de lumière s'additionnent ; chaque soin se voit seul, les deux ensemble rendent la plante pleine */
  function health(){return 1-neglect(cs());}
  /* une visite (au plus une toutes les quatre heures) : bien soignée, elle pousse un peu ; négligée, elle recule un peu */
  (function visit(){var c=cs(),n=Date.now();if(n-c.v<4*36e5)return;c.v=n;c.g=CL(c.g+(neglect(c)<.3?.015:-.01));save(c);})();
  pot.addEventListener('click',function(e){var b=e.target.closest('[data-care]');if(!b){pot.classList.toggle('open');return;}
    var c=cs(),a=b.dataset.care,n=Date.now();
    if(a==='cut'){c.cut=Math.min(3,c.cut+1);c.cutAt=n;}else if(a==='water'){c.water=n;c.d=CL(c.d+.3);}else{c.sun=n;c.g=CL(c.g+.12);}
    save(c);
    try{a==='water'?IK().tone(520,.18,'sine',.03,-200):a==='sun'?IK().tone(880,.25,'triangle',.025,300):IK().tone(1500,.04,'square',.02);}catch(_){}
    pot.classList.remove('fx-water','fx-sun','fx-cut');void pot.offsetWidth;pot.classList.add('fx-'+a);lastM=-1;tick();});
  pot.addEventListener('mouseleave',function(){pot.classList.remove('open');});

  /* ---------- la plante du toit : elle suit les mois du calendrier républicain ----------
     vendémiaire : vendange ; brumaire, frimaire : les feuilles tombent ; nivôse : neige ; pluviôse : pluie ; ventôse : bourgeons ;
     germinal : pousse ; floréal, prairial : fleurs ; messidor, thermidor : plein été ; fructidor : fruits. */
  var P={1:[6,0,3,'#c9772b','#6b2a5a',0],2:[4,0,0,'#a5522a',0,0],3:[2,0,0,'#7a5a3a',0,'frost'],4:[0,0,0,0,0,'snow'],5:[0,0,0,0,0,'rain'],6:[0,3,0,'#9bbf5a',0,0],
    7:[3,0,0,'#9fd36a',0,0],8:[6,3,0,'#6fb04a','#f7a8c8',0],9:[8,5,0,'#4f9a3a','#fff1a8',0],10:[8,2,0,'#3f8030','#ffd54f',0],11:[8,0,2,'#3f7a2e','#9ccc65',0],
    12:[7,0,5,'#4a7a30','#e0442e',0],13:[6,0,3,'#7a8a30','#e0442e',0]};
  /* 8 nov. (Mauk Tenieb : « la plante est infâme ») : un myrte d'intérieur reste vert toute l'année ; ses baies mûrissent d'octobre à janvier ; l'image d'automne (feuilles rousses qui tombent) sort du cycle */var PIMG={7:'germinal',8:'floreal',9:'floreal',10:'messidor',11:'messidor',12:'fructidor',1:'fructidor',13:'fructidor',2:'fructidor',3:'fructidor',4:'fructidor',5:'messidor',6:'messidor'};
  /* la plante : deux piles d'images existantes (le mois, puis la plante assoiffée qui se fond dessus selon le manque de soin) ; le pot reste, le feuillage se redresse, s'épaissit, verdit, se taille par transformations et filtres */
  function unit(src,x){return '<span class="p-u'+(x?' p-x':'')+'"><img class="p-pot" alt="" src="'+src+'"><span class="p-fo"><span class="p-mid">'+(x?'':'<img class="p-dn" alt="" src="'+src+'">')+'<img class="p-m" alt="" src="'+src+'"></span></span></span>';}
  function plantRender(r){var m=r?r.month:2,c=cs(),nn=neglect(c),n=Date.now(),ps=Math.max(CL(1-(n-c.cutAt)/(12*DAY))*(c.cutAt?1:0),.2*c.cut*(c.cutAt?1:0));
    var st=plant.style;st.setProperty('--pd',c.d.toFixed(3));st.setProperty('--pg',c.g.toFixed(3));st.setProperty('--pn',nn.toFixed(3));st.setProperty('--ps',ps.toFixed(3));
    plant.dataset.dry=nn>.5?'1':'';
    if(plant.dataset.mk!==String(m)){plant.dataset.mk=String(m);plant.innerHTML=unit('plante-'+(PIMG[m]||'brumaire')+'.webp')+unit('plante-assoiffee.webp',1);}}
  function bornePlant(r){var m=r?r.month:2,d=r?r.day:1,p=P[m]||P[2],f=Math.min(1,(d||1)/30),s='',hl=health(),ex=cs().cut,droop=(1-hl)*35;
    var grow=m===7?.45+.55*f:m===6?.4:1,H=48*grow*(.8+.2*hl),L=(m===7?Math.max(1,Math.round(p[0]*f)):p[0])+(p[0]?ex:0);
    var pts=[];for(var i=0;i<9;i++){var t=(i+1)/10;pts.push([60+Math.sin(t*3)*5,62-t*H]);}
    s+='<path d="M60 62 C 64 '+(62-H*.35)+', 55 '+(62-H*.7)+', '+(pts[8][0]+droop*.5).toFixed(1)+' '+pts[8][1].toFixed(1)+'" fill="none" stroke="#4a3a1e" stroke-width="2.2" stroke-linecap="round"/>';
    for(i=0;i<L;i++){var q=pts[Math.min(8,1+(i%8))],side=i%2?1:-1,a=-side*(12+(i*17)%25)+side*droop,sc=.7+((i*7)%5)/10;
      s+='<path transform="translate('+q[0].toFixed(1)+' '+q[1].toFixed(1)+') rotate('+a+') scale('+sc+')" d="M0 0 C '+(6*side)+' -4, '+(14*side)+' -2, '+(17*side)+' 3 C '+(11*side)+' 6, '+(4*side)+' 5, 0 0Z" fill="'+(hl<.5?'#b9a24a':p[3])+'"/>';}
    for(i=0;i<p[1]*(hl<.5?0:1);i++){q=pts[[8,6,4,7,5][i]];
      s+=m===6?'<circle cx="'+(q[0]+(i%2?4:-4)).toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="2" fill="#c8e08a"/>'
        :'<g transform="translate('+(q[0]+(i%2?7:-7)).toFixed(1)+' '+(q[1]-2).toFixed(1)+')"><circle r="2.2" fill="#ffd54f"/>'+[0,72,144,216,288].map(function(a){return '<ellipse rx="2" ry="3.6" transform="rotate('+a+') translate(0 -4)" fill="'+p[4]+'"/>';}).join('')+'</g>';}
    for(i=0;i<p[2];i++){q=pts[[5,7,3,6,4][i]];s+='<circle cx="'+(q[0]+(i%2?6:-6)).toFixed(1)+'" cy="'+(q[1]+5).toFixed(1)+'" r="'+(m===1?2.6:3.4)+'" fill="'+p[4]+'"/>';}
    if(m===2||m===3)s+='<path d="M78 82 q4 -3 9 0 q-5 3 -9 0Z" fill="'+p[3]+'"/><path d="M38 84 q4 -3 8 1 q-5 2 -8 -1Z" fill="'+p[3]+'"/>';
    if(p[5]==='snow')s+='<path d="M44 62 q16 -6 32 0Z" fill="#f4f7fb"/>'+[[40,20],[70,12],[86,32],[52,40],[30,44],[94,8]].map(function(c){return '<circle cx="'+c[0]+'" cy="'+c[1]+'" r="1.4" fill="#f4f7fb"/>';}).join('');
    if(p[5]==='rain')s+=[[40,10],[58,22],[76,6],[90,26],[30,30],[66,38]].map(function(c){return '<path d="M'+c[0]+' '+c[1]+' l-2 6" stroke="#8fb8e8" stroke-width="1.2" stroke-linecap="round"/>';}).join('');
    if(p[5]==='frost')s+='<path d="M60 62 l0 -'+(H*.9).toFixed(1)+'" stroke="#dfe9f5" stroke-width=".7" stroke-dasharray="1 3"/>';
    s+='<path d="M42 60 h36 l-4 24 h-28Z" fill="#a8532e"/><path d="M40 58 h40 v6 h-40Z" fill="#c2643a"/><path d="M47 64 l-3 20" stroke="rgba(255,255,255,.12)" stroke-width="2"/>';
    return '<svg viewBox="0 0 120 86" width="100%" height="100%">'+s+'</svg>';}

  /* ---------- la date du visiteur, en calendrier républicain, et son heure ---------- */
  var MO=['vendémiaire','brumaire','frimaire','nivôse','pluviôse','ventôse','germinal','floréal','prairial','messidor','thermidor','fructidor','sans-culottides'];
  var lastM=-1;
  function tick(){var d=new Date(),r=window.ikRep?window.ikRep(d):null,h=d.getHours(),m=d.getMinutes();
    date.firstChild.textContent=(r?(r.month===13?'jour '+r.day+' des sans-culottides an '+r.year:r.day+' '+MO[r.month-1]+' '+r.year)+' · ':'')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
    var c0=cs(),key=(r?r.month*40+r.day:0)+'/'+Math.round(c0.d*50)+'/'+Math.round(c0.g*50)+'/'+Math.round(neglect(c0)*50)+'/'+c0.cut+'/'+Math.round((Date.now()-c0.cutAt)/(DAY/4));if(key!==lastM){lastM=key;plantRender(r);plant.title=r?MO[r.month-1]:'';}}
  tick();setInterval(tick,15000);
  /* taille de la plante : 8,5 % de la hauteur du meuble (toit + corps), posée sur le toit ; le toit prend cette hauteur (--p2h) */
  function plantSize(){var w=document.querySelector('.wrap');if(!w)return;var h=w.offsetHeight;if(!h)return;
    document.documentElement.style.setProperty('--p2h',Math.max(48,Math.round(h*.093))+'px');}
  plantSize();addEventListener('resize',plantSize);try{new ResizeObserver(plantSize).observe(document.querySelector('.wrap'));}catch(_){}setTimeout(plantSize,1500);

  /* ---------- Échap vaut Baku Boom, partout, même dans les programmes en cadre ; un programme qui s'en sert d'abord (fermer un tiroir, quitter une partie d'échecs) garde la main ---------- */
  function escHome(e){if(e.key!=='Escape'||e.defaultPrevented)return;if(document.querySelector('.b-full')||document.pointerLockElement)return;
    var open=function(id){var x=$(id);return x&&x.classList.contains('open');};if(open('chess')||open('mem'))return;
    if(document.body.className.indexOf('on-home')>=0){fold();return;}e.preventDefault();bb.click();}
  addEventListener('keydown',escHome);
  function hookFrame(f){if(f.__esc)return;f.__esc=1;var on=function(){try{var w=f.contentWindow,d=w.document;w.addEventListener('keydown',function(e){if(e.key==='Escape')setTimeout(function(){escHome(e);},0);if(e.key==='PageUp'||e.key==='PageDown')navKey(e);});
      var f0=null;w.addEventListener('pointerdown',function(e){f0=[e.clientX,e.clientY];},true);w.addEventListener('pointermove',function(e){if(f0)tilt(clamp((e.clientX-f0[0])/70),clamp((e.clientY-f0[1])/70));},true);
      w.addEventListener('pointerup',function(){f0=null;tilt(0,0);},true);w.addEventListener('keydown',function(e){if(KX[e.key]!=null||KY[e.key]!=null){held[e.key]=1;fromKeys();}},true);w.addEventListener('keyup',function(e){if(held[e.key]){delete held[e.key];fromKeys();}},true);
      [].forEach.call(d.querySelectorAll('iframe'),hookFrame);new MutationObserver(function(){[].forEach.call(d.querySelectorAll('iframe'),hookFrame);}).observe(d.documentElement,{childList:true,subtree:true});
      if(/3615/.test(w.location.pathname)&&!d.getElementById('b-3615')){var st=d.createElement('style');st.id='b-3615';st.textContent='#lg{display:none!important}';(d.head||d.documentElement).appendChild(st);}}catch(x){}};
    f.addEventListener('load',on);on();}
  new MutationObserver(function(){[].forEach.call(glass.querySelectorAll('iframe'),hookFrame);}).observe(glass,{childList:true,subtree:true});
  [].forEach.call(glass.querySelectorAll('iframe'),hookFrame);

  /* ---------- le clavier vaut les gestes dans les mini-jeux : flèches et Entrée pour Konnect4, chiffres, ⌫ et Entrée pour MaskerMind, Espace pour le Sampler ---------- */
  var shown=function(id){var x=$(id);return x&&x.style.display&&x.style.display!=='none';};
  addEventListener('keydown',function(e){if(/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return;var K=window.__c4k;
    if(shown('c4-panel')&&K){var h=K.s.hover>=0?K.s.hover:3;
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){K.s.hover=Math.max(0,Math.min(K.n-1,h+(e.key==='ArrowLeft'?-1:1)));K.r();e.preventDefault();}
      else if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){K.d(h);e.preventDefault();}return;}
    if(shown('mm-panel')){if(/^[1-9]$/.test(e.key)&&window.mmPick){var pal=document.querySelectorAll('#mm-palette .mm-peg'),n=+e.key-1;if(n<pal.length){pal[n].click();e.preventDefault();}}
      else if(e.key==='Backspace'&&window.mmPop){mmPop();e.preventDefault();}else if(e.key==='Enter'&&window.mmSubmit){mmSubmit();e.preventDefault();}return;}
    if(shown('bb-panel')&&e.key===' '&&window.bbTogglePlay){bbTogglePlay();e.preventDefault();}},true);
  /* Fauna Chess : le toucher qui choisit le niveau ne joue pas en même temps un coup sur la case dessous */
  document.addEventListener('touchend',function(e){if(e.target.closest&&e.target.closest('.ch-sel-btn'))window.__chSelT=Date.now();},true);
  document.addEventListener('touchend',function(e){if(Date.now()-(window.__chSelT||0)<450&&e.target.closest&&e.target.closest('#chess-board, .ch-board, [id^=chess] .sq')&&!e.target.closest('.ch-sel-btn')){e.stopImmediatePropagation();e.preventDefault();}},true);

  /* ---------- les Koins à l'écran d'accueil, comme le CREDIT des bornes ; à zéro, le décompte de la Koin gratuite ---------- */
  var cr=el('div','b-credit-scr','<b>KOINS</b> <span></span>');glass.appendChild(cr);
  function credit(){var t=(($('kn')||{}).textContent||'').trim(),m=/^0\s*·\s*(\d+)\s*s/.exec(t);cr.querySelector('span').textContent=m?'0 · +1 '+m[1]+'s':t;cr.classList.toggle('wait',!!m);if($('koins'))$('koins').classList.toggle('wait',!!m);}
  if($('kn'))new MutationObserver(credit).observe($('kn'),{childList:true,characterData:true,subtree:true});credit();setInterval(credit,500);

  /* ---------- Motel Sound joue dès l'arrivée, haut-parleur coupé ; la cloche barrée le rallume ---------- */
  var bell=el('button','b-bell','🔕');bell.type='button';bell.setAttribute('aria-label','Motel Sound : son coupé');bell.setAttribute('aria-pressed','false');
  var docks=bar.querySelectorAll('.dock');(docks[0]||bar).appendChild(bell);
  var muted=true,jp=function(){try{return window.__juke&&window.__juke();}catch(e){return null;}};
  function applyMute(force){var p=jp();if(!p||!p.mute)return false;
    /* n'agit que si l'état du lecteur diffère : plus de volume forcé chaque seconde, la baisse pendant VHS ou la voix reste en place */
    try{var m=p.isMuted?p.isMuted():null;if(muted){if(m!==true)p.mute();}
      else{if(m!==false||force){p.unMute();p.setVolume&&p.setVolume(window.__jukeVol||100);}
        if(force&&p.getPlayerState&&p.getPlayerState()!==1&&p.playVideo)p.playVideo();}}catch(e){}return true;}
  var BELL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9.5h4l5-4.5v14l-5-4.5H3z" fill="currentColor"/><path class="w1" d="M15.5 9a4.2 4.2 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="w2" d="M18.2 6.5a7.6 7.6 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="x" d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function paintBell(){bell.innerHTML=BELL;bell.classList.toggle('on',!muted);bell.setAttribute('aria-pressed',String(!muted));
    bell.setAttribute('aria-label','Motel Sound : '+(muted?'son coupé':'son ouvert'));}
  var guard=setInterval(function(){var p=jp();if(p&&p.mute){applyMute();if(muted&&p.getPlayerState&&p.getPlayerState()!==1&&p.playVideo){try{p.playVideo();}catch(e){}}}},150);
  setTimeout(function(){clearInterval(guard);guard=setInterval(applyMute,1000);},15000);
  setTimeout(function(){var n=$('radio-note'),t=$('radio-toggle');if(t&&!(n&&n.classList.contains('on')))t.click();},600);
  bell.onclick=function(e){e.stopPropagation();muted=!muted;paintBell();var n=$('radio-note'),t=$('radio-toggle');
    if(!muted&&t&&!(n&&n.classList.contains('on')))t.click();applyMute(true);};
  paintBell();
  /* la molette 🎶 coupe ou rouvre tout, Motel Sound compris */
  window.__borneMusic=function(on){if(muted===!on)return;muted=!on;paintBell();var n=$('radio-note'),t=$('radio-toggle');if(on&&t&&!(n&&n.classList.contains('on')))t.click();applyMute(on);};
  /* le titre du juke-box défile quand il dépasse la bande d'affichage */
  /* bandeau de téléscripteur : le titre en entier, qui file sans fin de droite à gauche, comme les annonces des chaînes d'information */
  (function(){var l=document.querySelector('#radio-toggle .motel-l');if(!l)return;var cur='';
    function pick(){if(!window.__jukeNow&&typeof JUKE_TRACKS!=='undefined'&&JUKE_TRACKS.length){try{var t=JUKE_TRACKS[Math.floor(Math.random()*JUKE_TRACKS.length)].t;window.__jukeNow=(typeof jukeCleanTitle==='function'?jukeCleanTitle(t):t);}catch(e){}}}
    function build(){var raw=(l.dataset.raw!=null&&l.querySelector('.b-tk'))?null:l.textContent.trim();if(raw===null)return;
      if(!raw||/^(wait a sec\.*|motel sound)$/i.test(raw)){pick();raw=window.__jukeNow||raw;}
      if(raw===cur&&l.querySelector('.b-tk'))return;cur=raw;l.dataset.raw=raw;
      /* chaque titre défile, quelle que soit sa longueur (Mauk Tenieb, 31 oct., 8 h 58) : il entre par la droite, traverse la bande et sort à gauche, puis revient ; une seule occurrence à la fois */
      var esc=raw.toUpperCase().replace(/</g,'&lt;');l.classList.remove('b-fit');l.innerHTML='<span class="b-tk b-one"><span>'+esc+'</span></span>';
      var tk=l.querySelector('.b-tk'),tw=tk.firstChild.offsetWidth,bw=l.clientWidth,d=Math.max(5,(tw+bw)/38);
      l.style.setProperty('--tkf',bw+'px');l.style.setProperty('--tkt',(-tw)+'px');l.style.setProperty('--tkd',d.toFixed(2)+'s');
      /* le bandeau ne repart jamais de zéro : il reprend là où il en était */
      if(!window.__tk0||window.__tkRaw!==raw){window.__tk0=performance.now();window.__tkRaw=raw;}
      tk.style.animationDelay=(-(((performance.now()-window.__tk0)/1000)%d)).toFixed(3)+'s';}
    new MutationObserver(function(){if(!l.querySelector('.b-tk')||l.childNodes.length!==1)build();else{var t=l.textContent;}}).observe(l,{childList:true,characterData:true,subtree:true});
    var setT=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
    setTimeout(build,50);addEventListener('resize',function(){cur='';build();});})();

  /* fronton symétrique : la plaque du son et de PL prend la hauteur et la ligne de base du titre du Motel Sound */
  (function(){function sym(){var t=document.querySelector('#radio-toggle'),d=document.querySelector('.bar .dock:last-of-type');if(!t||!d||!t.offsetHeight)return;
      var tr=t.getBoundingClientRect(),dl=t.closest('.dock').getBoundingClientRect(),cs=getComputedStyle(t.querySelector('.motel-l')||t);d.style.setProperty('--b-tkh',Math.round(tr.height)+'px');d.style.setProperty('--b-tkw',Math.round(d.getBoundingClientRect().width-8)+'px');/* 1er nov. (E48) : son et PL à la largeur de leur boîte */d.style.setProperty('--b-tkb',Math.max(0,Math.round(dl.bottom-tr.bottom))+'px');d.style.setProperty('--b-tkf',cs.fontFamily);d.style.setProperty('--b-tks',cs.fontSize);
      /* la paire son / PL se pose en miroir exact de la plaque du titre, par rapport à l'axe du meuble */
      var b=d.querySelector('.b-bell'),pl=d.querySelector('#export-pl'),w=document.querySelector('.wrap');if(!b||!pl||!w||innerWidth>0){/* 1er nov. (E48) : la boîte du titre prend la largeur maximale ; son et PL restent dans la leur, sans miroir */[b,pl].forEach(function(e){if(e)['position','left','top'].forEach(function(k){e.style.removeProperty(k)});});return;}
      var ax=w.getBoundingClientRect(),cx=ax.left+ax.width/2,dr=d.getBoundingClientRect(),L=2*cx-tr.right,hw=tr.width/2;
      if(getComputedStyle(d).position==='static')d.style.setProperty('position','relative');
      [[b,L],[pl,L+hw]].forEach(function(q){var e=q[0];e.style.setProperty('position','absolute','important');e.style.setProperty('left',Math.round(q[1]-dr.left)+'px','important');e.style.setProperty('top',Math.round(tr.top-dr.top)+'px','important');});}
    addEventListener('resize',function(){setTimeout(sym,120);});addEventListener('load',function(){setTimeout(sym,300);setTimeout(sym,1500);});setTimeout(sym,800);})();

  /* les psychopompes : premier arrêt Burrows ou la plaque Mauk Tenieb, au hasard ; jetés, ils rebondissent sur les bords de l'écran */
  land.dataset.grp='visit';badge.dataset.grp='bio';
  window.__borneFirst=function(){var a=[land,badge];if(Math.random()<.5)a.reverse();return a;};
  window.__borneScreen=function(){return {left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight};};

  /* l'autocollant Lore, collé au hasard n'importe où sur la caisse à pièces, de travers (Mauk Tenieb, 31 oct. : il ne fait pas partie de la plaque de la fente) */
  (function(){var slot=document.querySelector('.b-slot');if(!slot)return;
    lore.addEventListener('click',function(e){e.stopPropagation();});
    function place(){if(!slot.offsetWidth){setTimeout(place,300);return;}if(lore._moved){if(!restore())clampLore();return;}var P=slot.getBoundingClientRect(),door=slot.closest('.b-door')||slot.parentElement,S=door.getBoundingClientRect(),avoid=[];var BL=document.documentElement.hasAttribute('data-bland')&&!getComputedStyle(document.documentElement).getPropertyValue('--r-S');[slot.querySelector('b'),slot.querySelector('i')].filter(Boolean).forEach(function(x){var r=x.getBoundingClientRect();for(var z=0;z<(BL?30:6);z++)avoid.push({left:r.left-8,top:r.top-8,right:r.right+8,bottom:r.bottom+8});});
      /* partout (Mauk Tenieb, 31 oct., 8 h 50) : LORE collé au hasard sur la caisse à pièces, la fenêtre de la fente toujours nue ; l'ancien placement sert de repli */
      if(landPlace(P,S,door,BL)){if(!restore())setTimeout(settle,60);return;}
      /* repli, hors du téléphone couché : à cheval sur le bord gauche de la plaque, à mi-hauteur */
      if(!BL){var w0=lore.offsetWidth||84,h0=lore.offsetHeight||38;lore.classList.remove('b-stuck');lore.classList.add('b-onbox');
        lore.style.setProperty('--lx',(P.left-S.left-w0/2).toFixed(1)+'px');lore.style.setProperty('--ly',(P.top-S.top+P.height/2-h0/2).toFixed(1)+'px');
        lore.style.setProperty('--ls',1);lore.style.setProperty('--lr',((Math.random()*2-1)*6).toFixed(1)+'deg');door.appendChild(lore);return;}
      /* la fente et la serrure de chaque porte (en % de la porte) */
      var OPEN={bois:[[30,14,72,60],[60,62,86,92]],metal:[[40,14,60,52],[66,58,86,86]]}[document.documentElement.dataset.skin]||[];
      for(var z0=0;z0<(BL?0:3);z0++)avoid.push({left:P.left-6,top:P.top-6,right:P.right+6,bottom:P.bottom+6});/* sur le bois de la caisse, hors de la plaque */
      OPEN.forEach(function(o){for(var z=0;z<(BL?14:6);z++)avoid.push({left:P.left+P.width*o[0]/100,top:P.top+P.height*o[1]/100,right:P.left+P.width*o[2]/100,bottom:P.top+P.height*o[3]/100});});
      /* ni sur la plaque des molettes, ni sur l'aimant, ni hors du meuble */
      ['.b-knobs','.b-dekonect','.b-lamp.b-l1','.b-lamp.b-l2'].concat(BL?['#home .b-bezel','#home .b-panel']:[]).forEach(function(q){var e=document.querySelector(q);if(e&&e.offsetWidth){var r=e.getBoundingClientRect();for(var z=0;z<(BL?(q==='#home .b-panel'?3:8):3);z++)avoid.push({left:r.left-6,top:r.top-6,right:r.right+6,bottom:r.bottom+6});}});
      var WR=(document.querySelector('.wrap')||document.body).getBoundingClientRect();
      [[-1e4,-1e4,WR.left+8,1e4],[WR.right-8,-1e4,1e4,1e4]].concat(BL?[[-1e4,Math.min(WR.bottom,innerHeight)-2,1e4,1e4]]:[]).forEach(function(r,i){for(var z=0;z<(i>1?12:3);z++)avoid.push({left:r[0],top:r[1],right:r[2],bottom:r[3]});});
      var C=[];for(var gx=-4;gx<=86;gx+=4)for(var gy=(BL?-30:-6);gy<=92;gy+=4)C.push([gx,gy]);C.sort(function(){return Math.random()-.5;});var w=lore.offsetWidth||108,h=lore.offsetHeight||50;
      /* téléphone couché : l'autocollant pose aux trois cinquièmes au moins sur la porte à monnayeur */
      if(BL){var CP=C.filter(function(c){var L=S.left+S.width*c[0]/100,T=S.top+S.height*c[1]/100;return Math.max(0,Math.min(L+w,P.right)-Math.max(L,P.left))*Math.max(0,Math.min(T+h,P.bottom)-Math.max(T,P.top))>=.6*w*h;});if(CP.length)C=CP;}
      var best=null,bo=1e9;C.forEach(function(c){var L=S.left+S.width*c[0]/100,T=S.top+S.height*c[1]/100,o=0;avoid.forEach(function(a){o+=Math.max(0,Math.min(L+w,a.right)-Math.max(L,a.left))*Math.max(0,Math.min(T+h,a.bottom)-Math.max(T,a.top));});c.o=o;if(o<bo){bo=o;best=c;}});
      /* téléphone couché : une place tirée au hasard parmi les meilleures */
      if(BL){var CB=C.filter(function(c){return c.o<=bo*1.1+40;});best=CB[Math.floor(Math.random()*CB.length)]||best;}
      C=[best];
      for(var k=0;k<C.length;k++){
        if(true){lore.classList.remove('b-stuck');lore.classList.add('b-onbox');lore.style.setProperty('--lx',C[k][0]+'%');lore.style.setProperty('--ly',C[k][1]+'%');
          lore.style.setProperty('--lr',((Math.random()*2-1)*(BL?6:12)).toFixed(1)+'deg');door.appendChild(lore);return;}}}
    function landPlace(P,S,door,BL){var sk=document.documentElement.dataset.skin,w=lore.offsetWidth||92,h=lore.offsetHeight||44;
      /* la fenêtre sombre de la fente (en % de la plaque) ; son cadre compte comme plaque (décision du 31 oct.) */
      var OP={bois:[31,19,70,60],metal:[46,26,54,45]}[sk]||[31,19,70,60];
      function ov(a,x,y,W,H){return Math.max(0,Math.min(x+W,a.r)-Math.max(x,a.l))*Math.max(0,Math.min(y+H,a.b)-Math.max(y,a.t));}
      var O={l:P.left+P.width*OP[0]/100-6,t:P.top+P.height*OP[1]/100-6,r:P.left+P.width*OP[2]/100+6,b:P.top+P.height*OP[3]/100+6};
      var lb=slot.querySelector('b'),Lr=lb&&lb.getBoundingClientRect(),LB=Lr&&{l:Lr.left-(BL?0:4),t:Lr.top-(BL?0:4),r:Lr.right+(BL?0:4),b:Lr.bottom+(BL?0:4)},LA=LB?(LB.r-LB.l)*(LB.b-LB.t):0;
      /* la serrure (en % de la plaque), libre à 4 px */
      var KHp={bois:[60,62,86,92],metal:[66,58,86,86]}[sk]||[60,62,86,92],KH={l:P.left+P.width*KHp[0]/100-4,t:P.top+P.height*KHp[1]/100-4,r:P.left+P.width*KHp[2]/100+4,b:P.top+P.height*KHp[3]/100+4},PL={l:P.left,t:P.top,r:P.right,b:P.bottom};
      var kn=document.querySelector('.b-knobs'),KR=kn&&kn.getBoundingClientRect(),KN=KR&&{l:KR.left-4,t:KR.top-4,r:KR.right+4,b:KR.bottom+4};
      var pn=document.querySelector('#home .b-panel'),bz=document.querySelector('#home .b-bezel'),WR=document.querySelector('.wrap').getBoundingClientRect();
      var cp=document.querySelector('.b-copy'),CPt=cp&&cp.offsetWidth?cp.getBoundingClientRect().top:1e5,top=(pn?pn.getBoundingClientRect().bottom:P.top)+14,bot=Math.min(CPt-4,(BL?Math.min(innerHeight,WR.bottom):Math.min(WR.bottom,P.bottom+P.height*.12))-3),/* 7 nov. : jamais sur la ligne du copyright */lft=Math.max(S.left,BL&&bz?bz.getBoundingClientRect().right:WR.left+8)+3,rgt=Math.min(S.right,WR.right-8)-3;
      /* LORE au hasard sur la caisse : la fenêtre de la fente nue (6 px), l'étiquette couverte à 15 % au plus, 45 % de sa largeur au plus hors de la plaque, sur le bois de la caisse, sous le rebord du panneau */
      /* 0,6 au plus bas sous 800 px de large, et en bois jusqu'à 900 px (décision du 31 oct.) */
      var sc=!BL?[1,.9,.8]:(innerWidth<800||(sk==='bois'&&innerWidth<900))?[1,.9,.8,.7,.6,.5]:[1,.9,.8,.7,.6];
      for(var i=0;i<sc.length;i++){var W=w*sc[i]+4,H=h*sc[i]+6,C=[];
        for(var x=lft;x<=rgt-W;x+=2){var out=Math.max(0,P.left-x)+Math.max(0,x+W-P.right);if(out>.45*W)continue;
          for(var y=top;y<=bot-H;y+=2){if(ov(O,x,y,W,H)||(KN&&ov(KN,x,y,W,H))||(LB&&ov(LB,x,y,W,H)>0))continue;
            /* hors du téléphone couché : l'autocollant chevauche le bord de la plaque (35 à 65 % de sa surface dessus), la serrure libre */
            if(!BL){var f=ov(PL,x,y,W,H)/(W*H);if(f<.35||f>.65||ov(KH,x,y,W,H))continue;}
            C.push([x,y]);}}
        if(!C.length)continue;var k=C[Math.floor(Math.random()*C.length)];
        lore.classList.remove('b-stuck');lore.classList.add('b-onbox');
        lore.style.setProperty('--lx',(k[0]+W/2-w/2-S.left).toFixed(1)+'px');lore.style.setProperty('--ly',(k[1]+H/2-h/2-S.top).toFixed(1)+'px');
        lore.style.setProperty('--ls',sc[i]);lore.style.setProperty('--lr',((Math.random()*2-1)*4).toFixed(1)+'deg');door.appendChild(lore);return true;}
      /* porte trop petite (740 × 360, bois) : à la plus petite échelle, la place qui dépasse le moins les deux plafonds ; la fenêtre de la fente, le cadre de l'écran, le rebord du panneau et les molettes restent libres */
      var s3=sc[sc.length-1],W3=w*s3+2,H3=h*s3+2,D=[],mo=1e18;
      for(var x3=lft;x3<=rgt-W3;x3+=2)for(var y3=top;y3<=bot+2-H3;y3+=2){if(ov(O,x3,y3,W3,H3)||(KN&&ov(KN,x3,y3,W3,H3))||(LB&&ov(LB,x3,y3,W3,H3)))continue;
        var o3=Math.max(0,P.left-x3)+Math.max(0,x3+W3-P.right),e3=Math.max(0,o3-.45*W3)*H3+(LB?Math.max(0,ov(LB,x3,y3,W3,H3)-.15*LA):0);D.push([x3,y3,e3]);if(e3<mo)mo=e3;}
      if(!D.length)return false;D=D.filter(function(c){return c[2]<=mo+60;});var k3=D[Math.floor(Math.random()*D.length)];
      lore.classList.remove('b-stuck');lore.classList.add('b-onbox');
      lore.style.setProperty('--lx',(k3[0]+W3/2-w/2-S.left).toFixed(1)+'px');lore.style.setProperty('--ly',(k3[1]+H3/2-h/2-S.top).toFixed(1)+'px');
      lore.style.setProperty('--ls',s3);lore.style.setProperty('--lr','0deg');door.appendChild(lore);return true;}
    setTimeout(place,500);
    /* la caisse change de taille (mesure de l'écran, téléphone couché, skin) : l'autocollant se recolle sur sa nouvelle place */
    if(window.ResizeObserver){var rsT,rs0='',RO=new ResizeObserver(function(){var r=slot.getBoundingClientRect(),dr=(slot.closest('.b-door')||slot).getBoundingClientRect(),k=Math.round(r.width)+'x'+Math.round(r.height)+'/'+Math.round(dr.width)+'x'+Math.round(dr.height)+'/'+Math.round(r.left-dr.left)+'/'+Math.round(r.top-dr.top)+(document.documentElement.hasAttribute('data-bland')?'L':'');if(k===rs0)return;rs0=k;clearTimeout(rsT);rsT=setTimeout(place,350);});RO.observe(slot);RO.observe(slot.closest('.b-door')||slot);}
    /* le mot de l'autocollant : LORE le plus souvent, Tales, Korhogo ou Diegesis de temps en temps, comme l'enseigne qui change de nom ; le papier change de teinte ; il se déplace à la main */
    (function(){var W=['Tales','Korhogo','Diegesis'],H=['sang','noir','ambre','creme','bleu'],cw='Lore',ch='sang',wd=lore.querySelector('.b-word'),sr=lore.querySelector('.b-sr'),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
      function fit(){var w=lore.offsetWidth,h=lore.offsetHeight;if(!w||!h)return;var fs=.44*h/.7;wd.style.setProperty('--sx','1');wd.style.fontSize=fs.toFixed(1)+'px';var w1=wd.offsetWidth||1,av=.68*w,sx=1;if(w1>av){sx=Math.max(.74,av/w1);if(w1*sx>av)fs*=av/(w1*sx);}wd.style.fontSize=Math.max(8,fs).toFixed(1)+'px';wd.style.setProperty('--sx',sx.toFixed(3));}/* 7 nov. : hauteur de lettre fixe pour les quatre mots ; les mots longs se resserrent au lieu de rapetisser */
      function show(t,pap){cw=t;wd.textContent=t;sr.textContent=t;lore.style.setProperty('--i-lore','url(sticker-lore-papier-'+pap+'.webp)');lore.dataset.pap=pap;ch=pap;fit();}/* 7 nov. : cinq papiers peints dans la palette de la DA, à la place de la rotation de teinte */
      show('Lore','sang');
      /* tirage : Lore 64 %, Tales, Korhogo ou Diegesis 12 % chacun ; papier pris dans la liste, jamais deux fois de suite */
      function tick(){var t=Math.random()<.64?'Lore':W[(Math.random()*W.length)|0],o=H.filter(function(x){return x!==ch;}),hue=o[(Math.random()*o.length)|0];
        if(RM){show(t,hue);}else{lore.classList.add('b-peel');setTimeout(function(){show(t,hue);},170);setTimeout(function(){lore.classList.remove('b-peel');},420);}
        setTimeout(tick,6000+Math.random()*6000);}
      /* 1er nov. : un lustre passe de temps en temps sur l'autocollant, découpé à sa forme (masque de l'image du papier) */
      var lu=document.createElement('i');lu.className='b-lustre';lu.setAttribute('aria-hidden','true');lore.appendChild(lu);
      function shine(){if(!document.hidden){lore.classList.remove('b-shine','b-wob');void lore.offsetWidth;lore.classList.add(Math.random()<.5?'b-shine':'b-wob');setTimeout(function(){lore.classList.remove('b-shine','b-wob');},1300);}setTimeout(shine,3500+Math.random()*5000);}
      /* 8 nov. : lustre et lueur retirés (vinyle imprimé à plat, sans reflet d'appli) */
      lore._fit=fit;lore._tick=tick;fit();setTimeout(fit,700);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);setTimeout(tick,2000+Math.random()*2000);/* 1er nov. : vivant dès l'arrivée */
      /* glisser à la main : clic simple = lien ; au-delà de 6 px = déplacement ; l'aimant Dekonect ramène l'autocollant s'il est lâché dessus */
      var st=null;lore.draggable=false;lore.addEventListener('dragstart',function(e){e.preventDefault();});
      lore.addEventListener('pointerdown',function(e){if(!lore.classList.contains('b-onbox')||(e.button&&e.button!==0))return;lore._drag=false;st={x:e.clientX,y:e.clientY,l:lore.offsetLeft,t:lore.offsetTop,id:e.pointerId};});
      lore.addEventListener('pointermove',function(e){if(!st||e.pointerId!==st.id)return;var dx=e.clientX-st.x,dy=e.clientY-st.y;
        if(!lore._drag){if(Math.hypot(dx,dy)<=6)return;lore._drag=true;lore.classList.add('b-drag');try{lore.setPointerCapture(e.pointerId);}catch(x){}}
        lore.style.setProperty('--lx',(st.l+dx).toFixed(1)+'px');lore.style.setProperty('--ly',(st.t+dy).toFixed(1)+'px');lore._moved=true;clampLore();});
      function end(e){if(!st||(e&&e.pointerId!==st.id))return;var was=lore._drag;lore.classList.remove('b-drag');
        if(was){var r=lore.getBoundingClientRect(),back=hit(r,zones())||['.b-dekonect','.b-knobs'].some(function(q){var d=document.querySelector(q);if(!d||!d.offsetWidth)return false;var k=d.getBoundingClientRect();return r.left<k.right+6&&r.right>k.left-6&&r.top<k.bottom+6&&r.bottom>k.top-6;});
          if(back){lore.classList.add('b-back');lore.style.setProperty('--lx',st.l+'px');lore.style.setProperty('--ly',st.t+'px');setTimeout(function(){lore.classList.remove('b-back');},450);}else keep();}
        st=null;}
      lore.addEventListener('pointerup',end);lore.addEventListener('pointercancel',end);
      lore.addEventListener('click',function(e){if(lore._drag){e.preventDefault();lore._drag=false;}},true);})();
    /* zones interdites : fenêtre de la fente, étiquette INSERT, serrure (intersection 0, marge 3 px) ; vérifiées au repos et au relâché */
    function zones(){var P=slot.getBoundingClientRect(),sk=document.documentElement.dataset.skin,OP={bois:[31,19,70,60],metal:[46,26,54,45]}[sk]||[31,19,70,60],KHp={bois:[60,62,86,92],metal:[66,58,86,86]}[sk]||[60,62,86,92],m=3,Z=[];
      Z.push({l:P.left+P.width*OP[0]/100-m,t:P.top+P.height*OP[1]/100-m,r:P.left+P.width*OP[2]/100+m,b:P.top+P.height*OP[3]/100+m});
      Z.push({l:P.left+P.width*KHp[0]/100-m,t:P.top+P.height*KHp[1]/100-m,r:P.left+P.width*KHp[2]/100+m,b:P.top+P.height*KHp[3]/100+m});
      [slot.querySelector('b'),slot.querySelector('i')].forEach(function(x){if(x&&x.offsetWidth){var r=x.getBoundingClientRect();Z.push({l:r.left-m,t:r.top-m,r:r.right+m,b:r.bottom+m});}});return Z;}
    /* place choisie à la main : gardée dans ce navigateur, par skin et par cadrage, en fraction de la caisse */
    function posKey(){return (document.documentElement.dataset.skin||'')+(document.documentElement.hasAttribute('data-bland')?'L':'');}
    function posAll(){try{return JSON.parse(localStorage.getItem('borne.lore')||'{}')||{};}catch(x){return {};}}
    function keep(){var d=lore.closest('.b-door');if(!d||!d.offsetWidth)return;var a=posAll();a[posKey()]=[lore.offsetLeft/d.offsetWidth,lore.offsetTop/d.offsetHeight];try{localStorage.setItem('borne.lore',JSON.stringify(a));}catch(x){}}
    function restore(){var d=lore.closest('.b-door'),v=posAll()[posKey()];if(!d||!v||!lore.classList.contains('b-onbox'))return false;var lx=lore.style.getPropertyValue('--lx'),ly=lore.style.getPropertyValue('--ly');
      lore.style.setProperty('--lx',(v[0]*d.offsetWidth).toFixed(1)+'px');lore.style.setProperty('--ly',(v[1]*d.offsetHeight).toFixed(1)+'px');clampLore();
      if(clearLore()){lore._moved=true;return true;}lore.style.setProperty('--lx',lx);lore.style.setProperty('--ly',ly);lore._moved=false;return false;}
    function hit(r,Z){return Z.some(function(z){return r.left<z.r&&r.right>z.l&&r.top<z.b&&r.bottom>z.t;});}
    function clearLore(){return !hit(lore.getBoundingClientRect(),zones());}
    function settle(){if(!lore.classList.contains('b-onbox')||clearLore()){lore._try=0;return;}
      if((lore._try=(lore._try||0)+1)<=8){lore._moved=false;place();return;}
      var door=lore.closest('.b-door'),S=door.getBoundingClientRect(),Z=zones(),w=lore.offsetWidth,h=lore.offsetHeight,WR=(document.querySelector('.wrap')||document.body).getBoundingClientRect(),L=Math.max(S.left,WR.left+8),R=Math.min(S.right,WR.right-8,innerWidth),T=Math.max(S.top,0),B=Math.min(S.bottom,innerHeight),best=null;
      [.8,.6,.5].some(function(sc){var W=w*sc+4,H=h*sc+6,C=[];for(var x=L;x<=R-W;x+=3)for(var y=T;y<=B-H;y+=3)if(!hit({left:x,top:y,right:x+W,bottom:y+H},Z))C.push([x,y,sc,W,H]);if(C.length){best=C[(Math.random()*C.length)|0];return true;}});
      if(best){lore.style.setProperty('--lx',(best[0]+best[3]/2-w/2-S.left).toFixed(1)+'px');lore.style.setProperty('--ly',(best[1]+best[4]/2-h/2-S.top).toFixed(1)+'px');lore.style.setProperty('--ls',best[2]);lore.style.setProperty('--lr','0deg');}
      lore._try=0;}
    function clampLore(){var door=lore.closest('.b-door');if(!door||!lore.classList.contains('b-onbox'))return;/* 8 nov. (demande du 8 nov., 1 h 30) : Lore se déplace au doigt et à la souris sur tout le caisson bas, hors de la caisse si le visiteur le veut ; il reste sous la console, au-dessus du copyright, dans le meuble */var wr=(document.querySelector('.wrap')||document.body).getBoundingClientRect(),pn=document.querySelector('#home .b-panel'),cp=document.querySelector('.b-copy'),pb=pn&&pn.offsetWidth?pn.getBoundingClientRect().bottom:door.getBoundingClientRect().top,cb=cp&&cp.offsetWidth?cp.getBoundingClientRect().top:wr.bottom,r=lore.getBoundingClientRect(),L=Math.max(wr.left+10,0),R=Math.min(wr.right-10,innerWidth),T=Math.max(pb+4,0),B=Math.min(cb-4,innerHeight),dx=0,dy=0;
      if(r.left<L)dx=L-r.left;else if(r.right>R)dx=R-r.right;if(r.top<T)dy=T-r.top;else if(r.bottom>B)dy=B-r.bottom;
      if(dx||dy){lore.style.setProperty('--lx',(lore.offsetLeft+dx).toFixed(1)+'px');lore.style.setProperty('--ly',(lore.offsetTop+dy).toFixed(1)+'px');}}
    var RW=innerWidth;addEventListener('resize',function(){if(Math.abs(innerWidth-RW)>40){RW=innerWidth;clearTimeout(lore._rt);lore._rt=setTimeout(place,500);}});
    /* un autre skin, une autre caisse : l'autocollant se recolle hors de la fente et de son étiquette */
    new MutationObserver(function(){if(lore.classList.contains('b-onbox'))setTimeout(place,450);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-skin']});})();

  /* JACK THE BOX devient PL (la playlist) */
  (function(){var j=$('export-pl');if(!j)return;var put=function(){if(j.textContent!=='PL')j.textContent='PL';};j.setAttribute('aria-label','Playlist');put();new MutationObserver(put).observe(j,{childList:true,characterData:true,subtree:true});})();

  dress('repos');
  /* la page d'origine reste voilée jusqu'ici : le visiteur voit la borne d'emblée */
  /* la borne se montre quand elle est montée entière (images, mesures de l'écran) : borne-arcade.js lève le voile ; sinon, tout de suite */
  /* les scripts de la borne arrivent l'un après l'autre : le voile attend la fin du chargement (borne-arcade.js le lève, matières décodées) ; 4 s au plus */
  addEventListener('load',function(){setTimeout(function(){if(!window.__borneFit)root.classList.add('borne-ready');},0);});
  setTimeout(function(){root.classList.add('borne-ready');},4000);
})();

/* ---------- éclats et reflets (25 oct.) : les boutons scintillent de temps en temps ; les autocollants et les plaques prennent un reflet qui suit la souris, le doigt ou le défilement ---------- */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var root=document.documentElement;
  function add(e,c){if(!e||e.querySelector(':scope>.'+c))return;var s=document.createElement('s');s.className=c;s.setAttribute('aria-hidden','true');e.appendChild(s);}
  function setup(){
    document.querySelectorAll('.b-panel .cab,.b-row2 .menu a,.b-boom,.b-slot,.b-knob,#koins').forEach(function(e){add(e,'b-gl');});
    document.querySelectorAll('.b-land,.b-lore,.b-badge').forEach(function(e){add(e,'b-sheen');});
  }
  setTimeout(setup,600);setTimeout(setup,2500);
  /* les éléments s'allument d'eux-mêmes, doucement, comme sous tension : un ou deux à la fois, une lente montée puis une retombée */
  function glint(){var L=[].slice.call(document.querySelectorAll('.b-gl')).map(function(s){return s.parentNode;}).filter(function(e){var r=e.getBoundingClientRect();return r.width&&r.bottom>0&&r.top<innerHeight&&!e.classList.contains('b-alive');});
    if(L.length&&!document.hidden){var n=1+(Math.random()<.4?1:0);for(var i=0;i<n;i++){var e=L.splice(Math.floor(Math.random()*L.length),1)[0];if(!e)break;
      var d=(1.6+Math.random()*1.8).toFixed(2);if(Math.random()<.22)e.classList.add('b-flick');e.style.setProperty('--alive',d+'s');e.classList.add('b-alive');(function(e,d){setTimeout(function(){e.classList.remove('b-alive','b-flick');},d*1000+60);})(e,+d);}}
    setTimeout(glint,700+Math.random()*1900);}
  setTimeout(glint,2000);
  var raf=0,px=.5,py=.5;
  function paint(){raf=0;root.style.setProperty('--rx',px.toFixed(3));root.style.setProperty('--ry',py.toFixed(3));}
  function at(x,y){px=x/innerWidth;py=y/innerHeight;if(!raf)raf=requestAnimationFrame(paint);}
  addEventListener('pointermove',function(e){at(e.clientX,e.clientY);},{passive:true});
  addEventListener('scroll',function(){if(matchMedia('(pointer:coarse)').matches){px=.5+.5*Math.sin(scrollY/240);py=.5;if(!raf)raf=requestAnimationFrame(paint);}},{passive:true});
})();

/* ---------- la Koin animée (25 oct.) : elle tourne sur elle-même dans le compteur ; payée, elle vole du compteur jusqu'à la fente et y tombe ;
   gagnée, elle tombe du haut de l'écran dans le compteur ---------- */
(function(){
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  function coin(cls){var c=document.createElement('span');c.className='b-kspin '+(cls||'');c.innerHTML='<i></i>';c.setAttribute('aria-hidden','true');return c;}
  function setup(){var k=$('koins');if(!k||k._spin)return !!k;k._spin=1;var ic=k.querySelector('i');if(ic)ic.replaceWith(coin('b-kicon'));return true;}
  function fly(from,to,cb,drop){if(RM||!from||!to||!document.body.animate){cb&&cb();return;}
    var a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),c=coin('b-kfly');document.body.appendChild(c);
    try{window.__borneSon&&window.__borneSon.coin();}catch(e){}
    var x0=a.left+a.width/2-20,y0=a.top+a.height/2-20,x1=b.left+b.width/2-20,y1=b.top+b.height/2-20+(drop?-6:0),lift=-Math.min(220,Math.abs(x1-x0)*.3+90);
    c.style.left=x0+'px';c.style.top=y0+'px';
    var an=c.animate([{transform:'translate(0,0) scale(.7)'},{transform:'translate('+(x1-x0)*.5+'px,'+((y1-y0)*.5+lift)+'px) scale(1.25)',offset:.5},{transform:'translate('+(x1-x0)+'px,'+(y1-y0)+'px) scale('+(drop?.8:.6)+')'}],{duration:900,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'forwards'});
    an.onfinish=function(){if(drop){var d=c.animate([{transform:'translate('+(x1-x0)+'px,'+(y1-y0)+'px) scale(.8)',clipPath:'inset(0 0 0 0)'},{transform:'translate('+(x1-x0)+'px,'+(y1-y0+26)+'px) scale(.8)',clipPath:'inset(0 0 100% 0)'}],{duration:320,easing:'ease-in',fill:'forwards'});d.onfinish=function(){c.remove();cb&&cb();};try{window.__borneSon&&window.__borneSon.drop();}catch(e){}}
      else{c.remove();cb&&cb();}};}
  var last=null;
  function watch(){var kn=$('kn');if(!kn)return;var v=parseInt((kn.textContent||'').trim(),10);if(isNaN(v)){return;}
    if(last!==null&&v!==last){var k=$('koins'),slot=document.querySelector('.b-slot'),scr=document.querySelector('.b-glass');
      closeup(v<last?'pay':'win',k,slot,scr);}
    last=v;}
  /* gros plan : la Koin surgit en grand au milieu de la fenêtre, tourne, prend la lumière, puis rétrécit et file :
     gagnée, vers le compteur ; payée, vers la fente (ou l'écran). Chaque fois un numéro tiré au hasard. */
  var busyC=false;
  /* en jeu, l'écran reste au jeu (règle du 30 oct. : zéro décor qui prend de l'écran) : la Koin tourne au compteur, son bruit seul ; le gros plan reste à l'accueil */
  function closeup(kind,k,slot,scr){if(document.documentElement.dataset.prog){spin(k);try{window.__borneSon&&window.__borneSon[kind==='win'?'clack':'drop']();}catch(e){}return;}
    if(RM||!document.body.animate||busyC||document.hidden){spin(k);return;}busyC=true;
    var W=innerWidth,H=innerHeight,S=Math.round(Math.min(W,H)*.42),img='koin-hd-a.webp';
    var veil=document.createElement('div');veil.className='b-kveil';document.body.appendChild(veil);
    var c=document.createElement('div');c.className='b-kbig';c.innerHTML='<i style="background-image:url('+img+')"></i><s></s>';c.style.width=c.style.height=S+'px';c.style.left=(W/2-S/2)+'px';c.style.top=(H/2-S/2)+'px';document.body.appendChild(c);
    var face=c.querySelector('i'),R=Math.random,trick=Math.floor(R()*4);
    try{window.__borneSon&&window.__borneSon.coin();}catch(e){}
    veil.animate([{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.7},{opacity:0}],{duration:2300,easing:'ease-in-out'}).onfinish=function(){veil.remove();};
    /* 1. l'arrivée et le numéro */
    var intro=[
      [{transform:'scale(.1) rotateY(0deg)'},{transform:'scale(1.08) rotateY(540deg)',offset:.6},{transform:'scale(1) rotateY(720deg)'}],
      [{transform:'translateY(-60vh) scale(.6) rotateX(70deg)'},{transform:'translateY(0) scale(1) rotateX(0)',offset:.55},{transform:'translateY(-8%) scale(1)',offset:.72},{transform:'translateY(0) scale(1)',offset:.86},{transform:'translateY(-2%) scale(1)',offset:.93},{transform:'translateY(0) scale(1)'}],
      [{transform:'scale(.2) rotate(-200deg)'},{transform:'scale(1.05) rotate(10deg)',offset:.7},{transform:'scale(1) rotate(0)'}],
      [{transform:'scale(1) rotateX(80deg) rotateZ(0)'},{transform:'scale(1) rotateX(55deg) rotateZ(360deg)',offset:.35},{transform:'scale(1) rotateX(30deg) rotateZ(700deg)',offset:.7},{transform:'scale(1) rotateX(0) rotateZ(720deg)'}]][trick];
    var a1=face.animate(intro,{duration:1150,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'});
    c.querySelector('s').animate([{backgroundPosition:'-120% 0'},{backgroundPosition:'220% 0'}],{duration:900,delay:650,easing:'ease-in-out',fill:'forwards'});
    a1.onfinish=function(){
      /* 2. elle rétrécit et file vers sa destination */
      var to=kind==='win'?(k&&k.querySelector('.b-kicon')||k):((slot&&slot.getBoundingClientRect().bottom>0&&slot.getBoundingClientRect().top<H)?slot:scr);
      var t=to?to.getBoundingClientRect():{left:W/2,top:H,width:0,height:0},dx=t.left+t.width/2-W/2,dy=t.top+t.height/2-H/2,sc=Math.max(.04,Math.min(1,(kind==='win'?18:30)/S));
      var a2=c.animate([{transform:'translate(0,0) scale(1)'},{transform:'translate('+dx*.35+'px,'+(dy*.35-H*.12)+'px) scale(.55)',offset:.45},{transform:'translate('+dx+'px,'+dy+'px) scale('+sc+')'}],{duration:620,easing:'cubic-bezier(.5,0,.6,1)',fill:'forwards'});
      face.animate([{transform:'rotateY(0)'},{transform:'rotateY(1080deg)'}],{duration:620,easing:'linear',fill:'forwards'});
      a2.onfinish=function(){c.remove();busyC=false;spin(k);try{window.__borneSon&&window.__borneSon[kind==='win'?'clack':'drop']();}catch(e){}};};}
  function spin(k){var i=k&&k.querySelector('.b-kicon');if(!i)return;i.classList.remove('b-kgo');void i.offsetWidth;i.classList.add('b-kgo');}
  function boot(){if(!setup()){setTimeout(boot,500);return;}var kn=$('kn');new MutationObserver(watch).observe(kn,{childList:true,characterData:true,subtree:true});watch();}
  setTimeout(boot,600);
  /* la fente : une vraie Koin y tombe en tournant */
  document.addEventListener('click',function(e){var s=e.target.closest&&e.target.closest('.b-slot');if(!s||RM)return;var c=coin('b-kslot');s.appendChild(c);setTimeout(function(){c.remove();},700);},true);
})();

/* ---------- Burrows vit : l'image glisse très lentement de haut en bas ; la télé, le scarabée de C7H5N3O6, les mains d'Aube,
   la lyre, les cartes et les ailes s'allument doucement de l'intérieur, chacun à son heure ---------- */
(function(){
  var land=document.querySelector('.b-land');if(!land)return;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IW=1200,IH=896;/* poster.webp ; poster-800 en est la réduction exacte */
  var SP=[{x:628,y:306,r:62,c:'200,225,255',k:'tv'},{x:1035,y:190,r:30,c:'90,230,255'},{x:470,y:276,r:16,c:'255,170,210'},{x:563,y:263,r:16,c:'255,170,210'},
          {x:745,y:240,r:34,c:'120,255,150'},{x:525,y:392,r:18,c:'255,210,150'},{x:480,y:336,r:28,c:'255,150,220'}];
  var box=document.createElement('div');box.className='b-lglow';box.setAttribute('aria-hidden','true');land.insertBefore(box,land.firstChild);
  SP.forEach(function(s){var e=document.createElement('i');if(s.k)e.className='b-'+s.k;e.style.setProperty('--c',s.c);box.appendChild(e);s.e=e;});
  var t0=performance.now();
  function frame(t){var W=land.clientWidth,H=land.clientHeight;if(!W||!H){requestAnimationFrame(frame);return;}
    var sc=Math.max(W/IW,H/IH),rh=IH*sc,rw=IW*sc,py=RM?34:34+16*Math.sin((t-t0)/26000*2*Math.PI),oy=(H-rh)*py/100,ox=(W-rw)/2;
    land.style.setProperty('background-position','50% '+py.toFixed(2)+'%','important');
    SP.forEach(function(s){var x=ox+s.x*sc,y=oy+s.y*sc,r=Math.max(8,s.r*sc);s.e.style.cssText+=';left:'+(x-r).toFixed(1)+'px;top:'+(y-r).toFixed(1)+'px;width:'+(2*r).toFixed(1)+'px;height:'+(2*r).toFixed(1)+'px';});
    if(!RM&&!document.hidden)requestAnimationFrame(frame);else setTimeout(function(){requestAnimationFrame(frame);},1000);}
  requestAnimationFrame(frame);
  function wake(){var L=SP.filter(function(s){return !s.k&&!s.e.classList.contains('on');});if(L.length&&!document.hidden){var s=L[Math.floor(Math.random()*L.length)];
      var d=(3+Math.random()*3).toFixed(2);s.e.style.setProperty('--d',d+'s');s.e.classList.add('on');setTimeout(function(){s.e.classList.remove('on');},d*1000+50);}
    setTimeout(wake,1500+Math.random()*3500);}
  if(!RM)setTimeout(wake,1200);
})();
/* le bloc son étroit (écran d'ordinateur bas) : le titre passe sur sa propre ligne, au-dessus des touches */
(function(){function go(){var d=document.querySelector('.bar .dock:first-of-type');if(!d||!window.ResizeObserver){setTimeout(go,600);return;}
  new ResizeObserver(function(){d.classList.toggle('b-narrow',innerWidth>700&&d.offsetWidth<240);}).observe(d);}
  go();})();
/* grand écran d'ordinateur : les programmes dessinés pour un petit écran grandissent avec lui (zoom), au lieu de flotter tout petits au milieu */
(function(){var Z={erratic:1,faunarratics:1,repo:1,tor:1},last='';
  function k(w){return Math.max(1,Math.min(1.5,w/940));}
  function apply(){var root=document.documentElement,cur=(window.__borneCur&&window.__borneCur())||'',cf=document.querySelector('#calque .cframe');
    var on=!!root.dataset.prog&&Z[cur]&&cf&&innerWidth>900,z=on?k(cf.clientWidth):1,key=cur+':'+z.toFixed(2);
    var kg=document.getElementById('kg-root'),fr=document.getElementById('cf');
    if(kg)kg.style.zoom=(on&&kg.offsetWidth&&z>1)?z.toFixed(3):'';
    try{if(fr&&fr.contentDocument&&fr.contentDocument.documentElement){var d=fr.contentDocument.documentElement;d.style.zoom=(on&&fr.offsetWidth&&z>1)?z.toFixed(3):'';}}catch(e){}
    if(key!==last){last=key;try{dispatchEvent(new Event('resize'));}catch(e){}}}
  setInterval(apply,700);addEventListener('resize',function(){setTimeout(apply,50);});})();

/* la visite des psychopompes (Mauk Tenieb, 30 oct.) : obligatoire, elle fait voir toute la borne, programmes, jeux, services et sites extérieurs ;
   un geste du visiteur (molette, doigt qui glisse, clavier) la fige là où il est ; quatre secondes sans geste, elle reprend où elle en était ;
   la molette 👣 de la porte retire les psychopompes, et les rend */
(function(){var T=0;
  function hand(){window.__borneHandHold=Date.now()+4000;if(!window.__borneTour&&!T)return;window.__borneTourByHand=true;
    if(window.__borneTour&&window.__borneTourPause){try{window.__borneTourPause();}catch(_){}try{scrollTo({top:scrollY,behavior:'instant'});}catch(_){}}
    clearTimeout(T);T=setTimeout(function(){T=0;if(window.__borneNoPsy||document.documentElement.dataset.prog)return;window.__borneTourByHand=false;try{window.__borneTourResume&&window.__borneTourResume();}catch(_){}},4000);}
  addEventListener('wheel',hand,{passive:true,capture:true});addEventListener('touchmove',hand,{passive:true,capture:true});
  addEventListener('keydown',function(e){if(/^(Arrow|Page|Home|End| )/.test(e.key))hand();},true);
  /* la molette 👣 */
  function knob(){var knobs=document.querySelector('.b-knobs');if(!knobs){setTimeout(knob,500);return;}if(knobs.querySelector('.b-psy'))return;
    var on=true;try{on=localStorage.getItem('borne.psy')!=='0';}catch(_){}
    var w=document.createElement('div');w.className='b-knobw';var b=document.createElement('button');b.type='button';b.className='b-knob b-psy';b.setAttribute('aria-label','Psychopompes');
    var l=document.createElement('span');l.className='b-knoblab';l.textContent='👣';w.appendChild(b);w.appendChild(l);knobs.appendChild(w);
    function apply(){b.dataset.on=on?'1':'0';b.dataset.pos=on?1:0;window.__borneNoPsy=!on;document.documentElement.classList.toggle('b-nopsy',!on);
      if(!on){try{window.__borneTourStop&&window.__borneTourStop();}catch(_){}}try{localStorage.setItem('borne.psy',on?'1':'0');}catch(_){}}
    b.addEventListener('click',function(){on=!on;try{window.__borneSon&&window.__borneSon.detent(2);}catch(_){}apply();});apply();}
  knob();
})();

/* vieillissement du formica (décisions de Mauk Tenieb, 30 oct. à 1er nov. 04 h 01) : la borne gagne un palier d'usure toutes les deux visites
   (neuve, légère, moyenne, forte), puis le cycle recommence ; le bouton SKIN la remet à neuf. Le skin métal reste tel quel.
   Les visites se comptent dans le navigateur du visiteur (localStorage) ; sans stockage : palier 0. */
(function(){var K='borne.visites',d=document.documentElement,PAS=2,NIV=4;
  function get(){try{var n=parseInt(localStorage.getItem(K),10);return n>0?n:0;}catch(e){return 0;}}
  function put(n){try{localStorage.setItem(K,String(n));}catch(e){}}
  function tier(n){return n>0?Math.floor((n-1)/PAS)%NIV:0;}
  function show(t){if(t)d.dataset.usure=String(t);else delete d.dataset.usure;}
  var n=get()+1;put(n);show(tier(n));
  /* aperçu pour l'auteur : ?usure=1, 2 ou 3 montre un palier sans toucher au compteur, avec le skin bois */
  try{var q=/[?&]usure=([0-3])/.exec(location.search);if(q){d.dataset.skin='bois';show(+q[1]);}}catch(e){}
  window.__borneUsure=function(){put(1);show(0);};})();

/* palettes chromatiques (roue C ; palettes.md, règle de passage) : la machine pose html[data-palette] et --pal-fondu ; borne-palettes.css fait le reste.
   Priorité, du plus fort au plus faible : programme ouvert, heure du visiteur (22 h à 6 h), aimant tenu, palette tirée au hasard à chaque arrivée (puis anneau de l'aimant).
   Aperçu pour l'auteur : ?palette=ambre-noyer (ou une autre des cinq) fige la palette ; ?palette=aucune retire l'attribut. */
(function(){var d=document.documentElement,RING=['ambre-noyer','braise-acier','creme-1960','sang-autocollant','or-nocturne'],
  
  AC={'ambre-noyer':['#ffa726','#39979e'],'braise-acier':['#f29d2e','#28b2c0'],'creme-1960':['#e4b377','#36909b'],'sang-autocollant':['#f79372','#38c2d1'],'or-nocturne':['#dfb15c','#6782d0']},
  drawn=RING[Math.floor(Math.random()*RING.length)],cur='',over=null,held=0,heldEl=null,night=false,progP=null,progKey='',lastNc='',inProg=false;
  var q=/[?&]palette=([a-z0-9-]+)/.exec(location.search);
  if(q){if(RING.indexOf(q[1])>=0)d.dataset.palette=q[1];return;}
  function still(){try{return matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
  function put(p,sec){if(p===cur)return;d.style.setProperty('--pal-fondu',(still()||!cur?0:sec)+'s');d.dataset.palette=p;cur=p;}
  function lab(h){var n=parseInt(h.slice(1),16),c=[n>>16&255,n>>8&255,n&255].map(function(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});
    var l=Math.cbrt(.4122214708*c[0]+.5363325363*c[1]+.0514459929*c[2]),m=Math.cbrt(.2119034982*c[0]+.6806995451*c[1]+.1073969566*c[2]),s=Math.cbrt(.0883024619*c[0]+.2817188376*c[1]+.6299787005*c[2]);
    return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
  function dist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);}
  /* programme ouvert : palette dont l'accent ou l'accent 2 tient à moins de 0,10 d'OKLab de l'encre --nc du programme ; sinon la palette du moment reste */
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-go]'),c=b&&b.closest('.cab');if(c)lastNc=(getComputedStyle(c).getPropertyValue('--nc')||'').trim();},true);
  function prog(){if(d.dataset.habit==='repos'||!d.dataset.prog){progKey='';progP=null;if(inProg){lastNc='';inProg=false;}return;}inProg=true;
    var c=document.querySelector('.cab.on-air'),nc=c?(getComputedStyle(c).getPropertyValue('--nc')||'').trim():lastNc;/* jeu rangé dans un groupe replié : pas de .on-air, l'encre vient du dernier clic sur un [data-go] */
    if(!nc){progKey='';progP=null;return;}if(nc===progKey)return;progKey=nc;progP=null;
    var m=/^#([0-9a-f]{6})$/i.exec(nc);if(!m)return;var L=lab(nc),best=.1;
    RING.forEach(function(p){AC[p].forEach(function(h){var x=dist(L,lab(h));if(x<best){best=x;progP=p;}});});}
  function want(){return progP||(night?'or-nocturne':held?'sang-autocollant':(over||drawn));}
  function run(sec){put(want(),sec);}
  var pend=0;function soon(){if(pend)return;pend=setTimeout(function(){pend=0;var was=progP;prog();var h=d.classList.contains('b-holding');
    if(h&&!held){held=1;heldEl=document.querySelector('.b-held');run(.6);}
    else if(!h&&held){held=0;var home=heldEl&&!heldEl.classList.contains('b-moved');heldEl=null;
      if(home)over=RING[(RING.indexOf(over||drawn)+1)%RING.length];/* réaimantation : palette suivante sur l'anneau, base jusqu'au départ du visiteur */
      run(home?2.4:1.2);}
    else if(was!==progP)run(1.2);}
    ,60);}
  night=(function(){var h=new Date().getHours();return h>=22||h<6;})();
  ['fond','fond-2','ligne','bois','metal','scr','neon','neon-trait','neon-x1','neon-x2','neon-ampoule','titre','accent','accent-2','accent-encre','texte','texte-faible','succes','alerte','desactive'].forEach(function(n){try{CSS.registerProperty({name:'--pal-'+n,syntax:'<color>',inherits:true,initialValue:'#000000'});}catch(e){}});/* enregistrés ici et non dans la feuille : sans palette posée, var(--pal-x,repli) garde son repli */
  put(want(),0);
  new MutationObserver(function(r){for(var i=0;i<r.length;i++){if(r[i].attributeName==='data-skin'&&r[i].target===d){over=null;}}soon();if(r.some(function(x){return x.attributeName==='data-skin'&&x.target===d;}))run(.4);})
    .observe(d,{attributes:true,subtree:true,attributeFilter:['class','data-habit','data-prog','data-skin']});
  setInterval(function(){var h=new Date().getHours(),n=h>=22||h<6;if(n!==night){night=n;run(90);}},2e4);})();

/* 1er nov., 10 h 50 — barre son d'une pièce : une seule plaque court sous le titre et le haut-parleur (image de la grille étirée sur la largeur des deux boîtes) */
(function(){function plate(){var b=document.getElementById('bar');if(!b)return;var d=b.querySelectorAll(':scope>.dock');if(d.length<2)return;
  b.style.setProperty('--bk-w',Math.round(d[0].getBoundingClientRect().width+d[1].getBoundingClientRect().width)+'px');}
  addEventListener('resize',function(){setTimeout(plate,150);});setTimeout(plate,300);setTimeout(plate,1500);
  if(window.ResizeObserver){var b0=document.getElementById('bar');if(b0)new ResizeObserver(plate).observe(b0);}})();
