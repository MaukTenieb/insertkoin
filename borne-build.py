"""Borne Insert Koin : fabrique les pages de la borne depuis les copies d'Insert Koin (aspire-borne.sh).
insertkoin.html -> index.html (meuble, écran, panneau, porte à Koins) ;
skoporhogo.html -> skoporhogo-borne.html (horloge du visiteur, temps réel).
Les copies restent telles qu'aspirées, aux noms canoniques près (CANON) ; les fichiers borne-* et ces deux pages viennent d'ici."""
import os, re
D = os.path.dirname(os.path.abspath(__file__))

def rd(n): return open(os.path.join(D, n), encoding="utf-8").read()
def wr(n, s): open(os.path.join(D, n), "w", encoding="utf-8").write(s)

def once(s, old, new):
    assert s.count(old) >= 1, old
    return s.replace(old, new, 1)

s = rd("insertkoin.html")
# N7 : politique de sécurité du contenu (scripts du site et de cdnjs seuls, zéro objet, base fixe)
CSP = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' \'wasm-unsafe-eval\' blob: https://cdnjs.cloudflare.com https://www.youtube.com https://s.ytimg.com; style-src \'self\' \'unsafe-inline\'; font-src \'self\' data:; img-src \'self\' https: data: blob:; media-src \'self\' https: data: blob:; connect-src \'self\' https: wss: data: blob: http://127.0.0.1:* http://localhost:*; frame-src \'self\' blob: https://www.youtube-nocookie.com https://www.youtube.com https://bandcamp.com; worker-src \'self\' blob:; object-src \'none\'; base-uri \'self\'; form-action \'self\' https:">'
s = once(s, "<head>", "<head>\n" + CSP)
s = once(s, "</head>", '<style id="b-veil">html:not(.borne-ready) body{background:transparent!important}html:not(.borne-ready) body>*{visibility:hidden!important}html:not(.borne-ready){background:#0b0908!important;min-height:100%}html:not(.borne-ready)::before{content:"";position:fixed;inset:7vmin;z-index:2147483647;background:var(--wait) center/contain no-repeat;box-shadow:none}html.borne-ready{transition:background-color .4s}</style>\n<script>(function(){var i=1+Math.floor(Math.random()*27),d=document.documentElement.style;d.setProperty("--wait","url(attente-"+(i<10?"0":"")+i+".webp)");d.setProperty("--waitsz","contain");setTimeout(function(){document.documentElement.classList.add("borne-ready")},5000)})()</script>\n<link rel="stylesheet" href="borne-cabinet.css">\n<link rel="stylesheet" href="borne-charte.css">\n<link rel="stylesheet" href="borne-da2.css">\n<link rel="stylesheet" href="borne-da3.css">\n<link rel="stylesheet" href="borne-arcade.css">\n</head>')
i = s.rfind("</body>")
s = s[:i] + '<script src="borne-cabinet.js"></script>\n<script src="borne-aimant.js"></script>\n<script src="borne-jeu.js"></script>\n<script src="borne-presence.js"></script>\n<script src="borne-son.js"></script>\n<script src="borne-dekonect.js"></script>\n<script src="borne-arcade.js"></script>\n<script src="borne-plante.js"></script>\n<script src="borne-musik.js"></script>\n' + s[i:]
# crochets de la borne dans le code de la page (fermé dans une fonction) : go, goHome, openGame, et une poignée
# les psychopompes : les répliques de l'artiste restent telles quelles ; borne-say.txt ajoute une phrase aux seuls arrêts propres à la borne
import re as _re
_say=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'borne-say.txt'),encoding='utf-8').read().rstrip()
assert len(_re.findall(r'  const SAY=\{.*?\};\n',s))==1
s=_re.sub(r'(  const SAY=\{.*?\};\n)',lambda m:m.group(1)+_say+'\n'+'  window.__borneSAY=function(){try{return SAY[LANG]||SAY.en;}catch(e){return SAY.en;}};\n',s,count=1)
s = once(s, "const go=(el.querySelector('[data-go]')||el).dataset.go||(el.id==='kapture'", "const go=el.dataset.grp||(el.querySelector('[data-go]')||el).dataset.go||(/bandcamp/.test(hr)?'bc':'')||(el.id==='kapture'")
# psychopompes de la borne : premier arrêt Burrows ou Mauk Tenieb ; rebonds sur les bords de l'écran, trois au moins
s = once(s, "    TQ=stops;\n", "    if(!(resume&&resume.length)&&window.__borneFirst){const F=window.__borneFirst();stops=stops.filter(x=>F.indexOf(x)<0);stops.splice(1+Math.floor(Math.random()*stops.length),0,F[1]);stops.unshift(F[0]);}\n    /* la visite commence par ce que la fenêtre montre, au hasard, puis descend la borne de haut en bas : la page bouge peu, une seule fois */\n    if(!(resume&&resume.length)){const V=x=>{const q=x.getBoundingClientRect();return q.bottom>0&&q.top<innerHeight;},a=stops.filter(V),b=stops.filter(x=>!V(x)).sort((x,y)=>x.getBoundingClientRect().top-y.getBoundingClientRect().top);stops=a.concat(b);}\n    TQ=stops;\n")
s = once(s, "el.scrollIntoView({block:'center',behavior:RMg?'auto':'smooth'});await W(RMg?60:420);", "{const q=el.getBoundingClientRect(),m=28,d=q.top<m?q.top-m:q.bottom>innerHeight-m?Math.min(q.bottom-innerHeight+m,q.top-m):0;if(Math.abs(d)>2){scrollBy({top:d,behavior:RMg?'auto':'smooth'});await W(RMg?60:420);}}")
s = once(s, "function bounds(){const b=home.getBoundingClientRect(),gw=parseFloat(g.style.getPropertyValue('--gw'))||60;return{", "function bounds(){const b=home.getBoundingClientRect(),gw=parseFloat(g.style.getPropertyValue('--gw'))||60;const S=window.__borneScreen&&window.__borneScreen();if(S)return{x0:S.left-b.left,x1:Math.max(S.left-b.left,S.right-b.left-gw),y0:S.top-b.top,y1:Math.max(S.top-b.top,S.bottom-b.top-H)};return{")
s = once(s, "fl={vx:vx*k,vy:vy*k,t:performance.now()", "const s0=sp*k,an=sp<1?Math.random()*6.283:Math.atan2(vy,vx),S0=Math.max(window.__borneScreen?1500:0,s0);fl={vx:Math.cos(an)*S0,vy:Math.sin(an)*S0,t:performance.now()")
s = once(s, "const f=Math.pow(.42,dt);fl.vx*=f;fl.vy*=f;", "const f=Math.pow(window.__borneScreen?.6:.42,dt);fl.vx*=f;fl.vy*=f;if(window.__borneScreen&&fl.hits<3){const v=Math.hypot(fl.vx,fl.vy)||1;if(v<700){fl.vx*=700/v;fl.vy*=700/v;}}")
s = once(s, 'allow="autoplay; fullscreen; clipboard-write"', 'allow="autoplay; fullscreen; clipboard-write; microphone; camera"')
# l'enseigne change de nom en douceur : le néon baisse, le nom change dans la pénombre, le néon revient ; plus rarement
s = once(s, "morph(cur,nx,()=>{cur=nx;if(br)br.textContent=cur;", "morph(cur,nx,()=>{cur=nx;if(br){const B=br;B.classList.add('b-dim');setTimeout(()=>{const k=B.querySelector('.b-habit');B.firstChild&&B.firstChild.nodeType===3?B.firstChild.nodeValue=cur:B.insertBefore(document.createTextNode(cur),B.firstChild);if(k&&!B.contains(k))B.appendChild(k);B.classList.remove('b-dim');},900);}")
s = once(s, "function later(){setTimeout(go2,7000+Math.random()*11000);}", "function later(){setTimeout(go2,26000+Math.random()*34000);}")
# le titre du morceau tout de suite, à la place de « Wait a sec... » et « MOTEL SOUND »
s = once(s, "function jukeSetLabel(txt){", "function jukeSetLabel(txt){if((txt==='Wait a sec...'||txt==='MOTEL SOUND')&&window.__jukeNow)txt=window.__jukeNow;")
s = once(s, "    var order=jukeShuffleIds();\n", "    var order=jukeShuffleIds();try{var t0=(JUKE_TRACKS.find(function(x){return x.id===order[0];})||{}).t;if(t0)window.__jukeNow=jukeCleanTitle(t0);}catch(e){}\n")
s = once(s, "mls.forEach(function(n){n.textContent=radioOn?txt:'MOTEL SOUND';});", "mls.forEach(function(n){n.textContent=txt;});")
s = once(s, "function go(k){ac();", "function go(k){if(window.__borneGo&&window.__borneGo(k))return;ac();")
s = once(s, "function boom(cb){", "function boom(cb){if(window.__borneBoom)return window.__borneBoom(cb);")
s = once(s, "function openGame(k,title){", "function openGame(k,title){window.__borneGame&&window.__borneGame(k);")
i = s.index("function goHome(){"); j = s.index("\n", i)
s = s[:i] + "function goHome(){window.__borneHome&&window.__borneHome();" + s[i+len("function goHome(){"):j+1] \
    + "window.__ik={go:k=>go(k),goHome:()=>goHome(),openCalque:(a,b,c,d)=>openCalque(a,b,c,d),openGame:(k,t)=>openGame(k,t),boom:cb=>boom(cb),ac:()=>ac(),tone:(...a)=>tone(...a),burst:(...a)=>burst(...a),lang:()=>LANG};\n" + s[j+1:]
s = re.sub(r"<title>[^<]*</title>", "<title>Insert Koin — Mauk Tenieb</title>", s, count=1)
# devant Korong! : l'image de l'écran titre, avec ses zones cliquables (borne-lobby.json, repères de poster.webp, 1200 x 896)
import json
B = json.load(open(os.path.join(D, "borne-lobby.json"), encoding="utf-8"))
s = once(s, '<img id="lobbyImg" src="room.webp" width="512" height="382"', '<img id="lobbyImg" src="poster.webp" width="1200" height="896"')
for mid, box in B.items():
    pat = re.compile(r'("id": "' + mid + r'"(?:(?!"id": ).)*?"box": )\[[0-9, ]+\]', re.S)
    s, n = pat.subn(lambda m: m.group(1) + json.dumps(box), s, count=1)
    assert n == 1, mid
# Koins : 99 au plus ; à zéro, le décompte de la Koin gratuite part tout de suite (60 s, plus bas), sans attendre un refus
s = once(s, "if(k!==null)koins=+k;freeAt=", "if(k!==null)koins=Math.min(99,+k);freeAt=")
s = once(s, "koins=Math.min(Number.MAX_SAFE_INTEGER,koins+1)", "koins=Math.min(99,koins+1)")
s = once(s, "setInterval(()=>{if(koins<1&&freeAt&&Date.now()>=freeAt)", "setInterval(()=>{if(koins>99){koins=99;saveKoins();}if(koins<1&&!freeAt){freeAt=Date.now()+30000;saveKoins();}if(koins<1&&freeAt&&Date.now()>=freeAt)")
# Korong! : un toucher sur un Mask lance le duel (son nom s'affiche dès l'appui) ; la table reste dans la borne, sans plein écran automatique
s = once(s, "b.onpointerdown=e=>{b._touch=e.pointerType==='touch';};", "b.onpointerdown=e=>{b._touch=e.pointerType==='touch';say();};")
s = once(s, "b.onclick=()=>{if(b._touch&&!b.classList.contains('armed')){lb.querySelectorAll('.spot.armed').forEach(x=>x.classList.remove('armed'));b.classList.add('armed');say();return;}pickGuest(i);};", "b.onclick=()=>{pickGuest(i);};")
s = once(s, "$('cv').addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||document.fullscreenElement)return;", "$('cv').addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||document.fullscreenElement||document.documentElement.classList.contains('borne'))return;")
# Kapture : deux boutons (SKREEN, KAM), Échap ferme le choix
s = once(s, '<button class="btn hot" type="button">KAM</button><button class="btn" type="button" aria-label="${tr(\'no\')}">✕</button></div>`;', '<button class="btn hot" type="button">KAM</button></div>`;')
s = once(s, "a.onclick=()=>{m.remove();skreen();};b.onclick=()=>{m.remove();openGame('kapture','KAPTURE');};c.onclick=()=>m.remove();a.focus();}",
  "a.onclick=()=>{m.remove();skreen();};b.onclick=()=>{m.remove();openGame('kapture','KAPTURE');};const esc=e=>{if(e.key==='Escape'&&document.body.contains(m)){e.stopImmediatePropagation();e.preventDefault();m.remove();removeEventListener('keydown',esc,true);}};addEventListener('keydown',esc,true);m.addEventListener('click',e=>{if(e.target===m)m.remove();});a.focus();}")
# Motel Sound : la liste est déjà mélangée ; un second mélange du lecteur décalait le titre affiché du morceau joué
s = once(s, "    jukePlayer.setShuffle(true);\n", "")
# START et BACK de la borne restent hors de la visite des psychopompes
s = once(s, "chips=[...home.querySelectorAll('.menu a,.menu button')]", "chips=[...home.querySelectorAll('.menu a:not(.b-ab),.menu button')]")
# la démo de la borne attend la fin de la visite des psychopompes
s = once(s, "if(touring)return;touring=true;", "if(touring)return;touring=true;window.__borneTour=1;")
s = once(s, "function stop(){if(!touring)return;touring=false;", "function stop(){if(!touring)return;touring=false;window.__borneTour=0;")
# la Koin se paie au premier geste de jeu, pas à l'arrivée sur l'écran-titre (zapper reste gratuit)
s = once(s, "if(k!=='kapture'&&k!=='vhs'&&!pay()){", "if(k!=='kapture'&&k!=='vhs'&&!(koins>0&&window.__bornePayLater?(window.__bornePayLater(pay),true):pay())){")
# visite complète : les psychopompes passent aussi par l'autocollant Lore (sa réplique « lore » vient de SAY)
s = once(s, "[document.getElementById('radio-toggle')||document.querySelector('.motel-bar'),$('kapture')].filter(Boolean)", "[document.getElementById('radio-toggle')||document.querySelector('.motel-bar'),$('kapture'),document.querySelector('.b-lore')].filter(Boolean)")
# « U gotta stay tuned » : tuned en minuscules (demande de Mauk Tenieb, 30 oct.)
s = s.replace("U gotta stay TUNEd", "U gotta stay tuned")
wr("index.html", s)

# la visite des psychopompes s'arrête quand un programme s'ouvre (borne-cabinet.js appelle __borneTourStop)
s = once(s, "async function tour(resume){if(touring)return;", "window.__borneTourStop=function(){clearTimeout(g._tourT);stop();};async function tour(resume){if(touring)return;")
# Korong! : la raquette du joueur se dessine à la position réelle de la souris (zéro retard d'image) ; la physique lit la souris à chaque pas, comme avant (Mauk Tenieb, 30 oct.)
s = once(s, "ax=cl(L(p.ax,q.ax),pdk-250,250-pdk),az=cl(L(p.az,q.az),0,300);", "ax=cl(e.running?mouse[0]-ORIGIN_H:L(p.ax,q.ax),pdk-250,250-pdk),az=cl(e.running?330-mouse[1]:L(p.az,q.az),0,300);")
# Koins : une seule matière et une seule mécanique ; les Koins qui tombent (psychopompes, gains, pluie) font le bruit de vraies Koins du meuble (borne-son.js)
s = once(s, "tone(2093+Math.random()*900,.05,'triangle',.03);tone(3136,.07,'triangle',.018,0,.03);", "(window.__borneSon?window.__borneSon.tick():(tone(2093+Math.random()*900,.05,'triangle',.03),tone(3136,.07,'triangle',.018,0,.03)));")
s = once(s, "tone(2093,.05,'triangle',.05);tone(3136,.09,'triangle',.03,0,.04);", "(window.__borneSon?window.__borneSon.clack():(tone(2093,.05,'triangle',.05),tone(3136,.09,'triangle',.03,0,.04)));")
# psychopompes (Mauk Tenieb, 30 oct.) : la visite reste obligatoire ; un geste du visiteur la fige, elle reprend où elle en était ; la molette 👣 de la porte les retire
s = once(s, "window.__borneTourStop=function(){clearTimeout(g._tourT);stop();};", "window.__borneTourStop=function(){clearTimeout(g._tourT);stop();};window.__borneTourPause=function(){if(touring){pending=TQ.slice(TI);stop();}};window.__borneTourHeld=function(){return !!pending;};window.__borneTourResume=function(){if(pending&&!touring&&!fl&&!g._drag){const q=pending;pending=null;tour(q);return true;}return false;};")
s = once(s, "async function tour(resume){if(touring)return;", "async function tour(resume){if(touring||window.__borneNoPsy)return;if(!resume&&window.__borneTourHeld&&window.__borneTourHeld())return;")
# Koin gratuite à zéro : au bout de 60 s (Mauk Tenieb, 30 oct.)
s = once(s, "function pay(){if(koins<1){if(!freeAt)freeAt=Date.now()+30000;", "function pay(){if(koins<1){if(!freeAt)freeAt=Date.now()+60000;")
s = once(s, "if(koins<1&&!freeAt){freeAt=Date.now()+30000;saveKoins();}", "if(koins<1&&!freeAt){freeAt=Date.now()+60000;saveKoins();}")
s = once(s, "((freeAt||Date.now()+30000)-Date.now())", "((freeAt||Date.now()+60000)-Date.now())")
wr("index.html", s)
k = rd("skoporhogo.html")
k = once(k, "window.__room={step:stepSim,", "window.__room={SPEEDS,VIEW,applyView,zoomAt,step:stepSim,")
# la marche des Masks à vitesse naturelle, l'horloge à la minute exacte (window.__walk, posé par borne-skopo.js)
k = once(k, "a.mv.t+=a.speed*dt/a.mv.len; a.ph+=a.speed*dt*5.5;", "a.mv.t+=a.speed*dt*(window.__walk||1)/a.mv.len; a.ph+=a.speed*dt*(window.__walk||1)*5.5;")
k = once(k, "stepL=a.speed*.8*dt;", "stepL=a.speed*.8*dt*(window.__walk||1);")
k = once(k, "<head>", '<head>\n<meta name="robots" content="noindex,nofollow">')
i = k.rfind("</body>")
k = k[:i] + '<script src="borne-skopo.js"></script>\n' + k[i:]
wr("skoporhogo-borne.html", k)
# noms canoniques (KorhoBidule, FaunMachin) : appliqués aux pages de la borne et aux copies qu'elle affiche
CANON = {"Photofauna": "FotoFauna", "PHOTOFAUNA": "FOTOFAUNA", "Korhoname": "KorhoName", "Skoporhogo": "SkopoRhogo", "Mastermind": "MaskerMind", "MASTERMIND": "MASKERMIND"}
def canon(t):
    for a, b in CANON.items():
        t = t.replace(a, b)
    return t
for n in ("index.html", "skoporhogo-borne.html", "fotofauna.html", "kg-kapture.js", "kg-katabatik.js", "kg-katabatik.html"):
    if os.path.exists(os.path.join(D, n)):
        wr(n, canon(rd(n)))
# 99 au plus, partout : cassettes, morceaux d'une cassette, Kuration, récits de Faunarratik (copies de la borne, retouchées une fois)
def cap(n, old, new):
    t = rd(n)
    if new in t: return
    assert t.count(old) == 1, (n, old)
    wr(n, t.replace(old, new))
cap("kg-vhs-library.js", 'a.push({ channel: tape.channel, channel_url: tape.channel_url || "", count: tape.tracks.length, tracks: tape.tracks.slice(0, 5000) });\n      writeLocal(a);',
    'a.push({ channel: tape.channel, channel_url: tape.channel_url || "", count: Math.min(99, tape.tracks.length), tracks: tape.tracks.slice(0, 99) });\n      writeLocal(a.slice(-99));')
cap("kg-vhs-library.js", "maxTracks: 600,", "maxTracks: 9801,")
cap("kg-vhs-library.js", "    var tracks = [], all = 0;\n    for (var i = 0; i < tapes.length; i++) {\n      var tt = (tapes[i] && tapes[i].tracks) || [];",
    "    var tracks = [], all = 0;\n    tapes = tapes.slice(0, 99);\n    for (var i = 0; i < tapes.length; i++) {\n      if (tapes[i] && tapes[i].tracks && tapes[i].tracks.length > 99) tapes[i].tracks = tapes[i].tracks.slice(0, 99);\n      var tt = (tapes[i] && tapes[i].tracks) || [];")
cap("ik-kuration.js", "MAX = 200,", "MAX = 99,")
cap("ik-kuration.js", "var list = mine(), on = !has(t.id);", "var list = mine(), on = !has(t.id);\n    if (on && list.length >= MAX) return false;")
cap("kuration.html", "k.tracks.slice(0,50)", "k.tracks.slice(0,99)")
cap("kg-faunarratics.js", "if(arr.length>50)arr=arr.slice(0,50);", "if(arr.length>99)arr=arr.slice(0,99);")
# grammaire commune (audit du 25 octobre) : un toucher agit ; Échap revient ; le clavier vaut les gestes
cap("kg-katabatik.js", "var W=Math.min(window.innerWidth-32,440);", "var _hr=document.getElementById('kg-root'),W=Math.max(196,Math.min(((_hr&&_hr.clientWidth)||window.innerWidth)-32,((_hr&&_hr.clientHeight)||window.innerHeight)-150,560));")
cap("kg-katabatik.js", "      ctx.fillText(ln(state.levelNames[_li]),W/2,CW*0.78);",
    "      [CW,CW*3.5,CW*6].forEach(function(x,j){ctx.fillStyle=j===_li?'rgba(255,224,138,.95)':'rgba(201,168,76,.4)';ctx.fillText(ln(state.levelNames[j]),x,CW*0.82);});")
cap("kg-katabatik.js", "  function drop(col){\n    if(state.over||state.turn!==1) return;",
    "  window.__c4k={s:state,d:function(c){drop(c);},r:function(){draw();},n:COLS};\n  function drop(col){\n    if(state.over||state.turn!==1) return;")
cap("kg-katabatik.js", "go:['space / tap','espace / touche']", "go:['','']")
# Konnect4 : plateau et trous lisibles sur le noir de l'écran
cap("kg-katabatik.js", "    ctx.fillStyle='rgba(201,168,76,0.08)';\n    ctx.beginPath();\n    ctx.roundRect(0,CW,W,CW*ROWS,6);", "    ctx.fillStyle='rgba(201,168,76,0.22)';\n    ctx.beginPath();\n    ctx.roundRect(0,CW,W,CW*ROWS,6);")
cap("kg-katabatik.js", "        ctx.fillStyle='rgba(0,0,0,0.55)';\n        ctx.fill();", "        ctx.fillStyle='rgba(0,0,0,0.75)';\n        ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='rgba(255,227,160,0.28)';ctx.stroke();")
# pages en cadre : feuille commune de la borne (borne-frames.css)
for n in ("reporhogo.html", "tor.html"):
    t = rd(n)
    if "borne-frames.css" not in t:
        wr(n, t.replace("</head>", '<link rel="stylesheet" href="borne-frames.css">\n</head>', 1))
cap("reporhogo.html", ' placeholder="Comma-separated URLs appear here."', '')
# un programme Korhogo reste ouvert pendant les effets du tube et les mouvements de caméra (écran aplati un instant) : il se ferme après une seconde sans écran, au lieu de 300 ms
cap("kg-loader.js", "if(++s.hidden>=2)endSession(name);  // hidden on two consecutive checks (~300 ms)", "if(++s.hidden>=7)endSession(name);  // hidden on seven consecutive checks (~1 s)")
# 3615 sur téléphone : le texte suit la largeur de l'écran (40 colonnes), 11 px au moins ; une page plus longue que l'écran défile au doigt
cap("3615-local.html", "document.documentElement.style.setProperty('--fs',Math.min(h*0.88/(24*1.3),w*0.86/(40*0.62)).toFixed(2)+'px')",
    "document.documentElement.style.setProperty('--fs',(w<520?Math.max(11,Math.min(h*0.88/(15*1.3),w*0.86/(40*0.62))):Math.min(h*0.88/(24*1.3),w*0.86/(40*0.62))).toFixed(2)+'px')")
cap("3615-local.html", ".out{margin-top:1.2em;white-space:pre-wrap;flex:1;min-height:0;overflow:hidden}",
    ".out{margin-top:1.2em;white-space:pre-wrap;flex:1;min-height:0;overflow:hidden}@media (max-width:520px){.out{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}}")
# Faunarratik : un toucher, un clic ou une touche pendant la présentation du Kerema passe aussitôt à la consigne ; les textes restent les mêmes
cap("kg-faunarratics.js", """  setTimeout(function(){
    if(p1) p1.classList.add('fadeout');
    setTimeout(function(){
      if(p1) p1.style.display='none';
      if(p2){
        p2.style.animation='';
        p2.classList.add('visible');
      }
    },800);
  },5400);
}""", """  var done=false,t1,t2;
  function next(){if(done)return;done=true;clearTimeout(t1);clearTimeout(t2);p1.style.display='none';p2.style.animation='';p2.classList.add('visible');off();}
  function skip(e){if(p1.style.display==='none')return off();if(e&&e.type==='keydown'&&/^(Escape|Tab|Shift|Control|Alt|Meta)$/.test(e.key))return;
    if(e){e.preventDefault();e.stopPropagation();}p1.classList.add('fadeout');t2=setTimeout(next,260);}
  function off(){document.removeEventListener('pointerdown',skip,true);document.removeEventListener('keydown',skip,true);}
  document.addEventListener('pointerdown',skip,true);document.addEventListener('keydown',skip,true);
  t1=setTimeout(function(){
    if(p1) p1.classList.add('fadeout');
    t2=setTimeout(next,800);
  },5400);
}""")
# Musik (ex-Sampler) : l'export KAVE IT! porte le nouveau nom
cap("kg-katabatik.js", "ikName('sampler','wav')", "ikName('musik','wav')")
# SkopoRhogo : Échap désélectionne d'abord le Mask, sans quitter le programme
k2 = rd("skoporhogo-borne.html")
k2 = k2.replace("if(e.key==='Escape'&&selected>=0) select(selected);", "if(e.key==='Escape'&&selected>=0){ e.preventDefault(); select(selected); }")
# à l'accueil, la molette fait défiler la page ; SkopoRhogo zoome à la molette avec Ctrl, ou dans le programme ouvert
k2 = k2.replace("view.addEventListener('wheel',e=>{ e.preventDefault();", "view.addEventListener('wheel',e=>{ if(/attract=1/.test(location.search)&&!e.ctrlKey)return; e.preventDefault();", 1)
# SkopoRhogo suit la charte : DM Mono à la place de VT323 (police chargée de Google Fonts, absente en ligne)
k2 = k2.replace("'VT323'", "'DM Mono'").replace('"VT323"', '"DM Mono"')
# dans la borne, SkopoRhogo remplit tout l'écran qui l'accueille ; sous la taille native, l'image se réduit en lissant, sans damier
k2 = once(k2, "const aw=st.clientWidth-(mob?4:20), ah=mob?innerHeight*.62:Math.max(240,st.clientHeight-20);\n  let k=Math.min(aw/W,ah/H); if(k>=1) k=Math.floor(k*4)/4;",
  "const inF=window.top!==window, aw=inF?st.clientWidth:st.clientWidth-(mob?4:20), ah=inF?Math.max(160,st.clientHeight):(mob?innerHeight*.62:Math.max(240,st.clientHeight-20));\n  let k=Math.min(aw/W,ah/H); if(k>=1&&!inF) k=Math.floor(k*4)/4; view.style.imageRendering=k<1?'auto':'';")
# téléphone couché : la chambre tient la hauteur, la liste des Masks à droite, la barre de réglages resserrée
k2 = once(k2, "</style>", """  @media (orientation:landscape) and (max-height:500px){
    body{ height:100vh; min-height:0; }
    header{ padding:3px 8px; gap:6px; }
    button{ font-size:15px; padding:1px 6px; }
    main{ flex-direction:row; min-height:0; overflow:hidden; }
    #stage{ padding:2px; }
    aside{ width:210px; border-left:2px solid var(--w); border-top:none; overflow:auto; padding:6px; gap:6px; }
    #roster{ grid-template-columns:1fr; }
    #card{ padding:6px; }
    #cbody{ grid-template-columns:56px 1fr; }
    #pcv{ width:56px; height:56px; }
    #cname{ font-size:18px; }
    .row{ font-size:15px; }
  }
</style>""")
# dans la borne, la molette FR · EN de la borne règle la langue de SkopoRhogo : le bouton FR interne s'efface (une commande, une place)
k2 = once(k2, "applyLang();\ndocument.getElementById('hint').textContent=TXT[lang].hint;", "applyLang();\nif(window.top!==window){langBtn.hidden=true;try{const P=parent.document.documentElement,sync=()=>{const l=P.lang==='fr'?'fr':'en';if(l!==lang){lang=l;applyLang();}};sync();new MutationObserver(sync).observe(P,{attributes:true,attributeFilter:['lang']});}catch(e){}}\ndocument.getElementById('hint').textContent=TXT[lang].hint;")
# lettrage A (décision de Mauk Tenieb, 30 oct., 19 h 25) : « les capitales partout : très lisibles », liste et fiche des Masks comprises
k2 = once(k2, "</style>", "  aside, aside *, #hint{ text-transform:uppercase; letter-spacing:0; }\n</style>")
# après le rattrapage des heures, la liste suit la scène (audit UI de SkopoRhogo, S10)
k2 = once(k2, "window.__room={SPEEDS,", "window.__room={updateRoster,SPEEDS,")
wr("skoporhogo-borne.html", k2)
# FotoFauna : le logo déclenche, caméra avant ou arrière, pile et pellicule (borne-fotofauna.js, borne-fotofauna.css)
cap("fotofauna.html", 'getUserMedia({video:{facingMode:"user",width:{ideal:1280}},audio:false})', 'getUserMedia({video:{facingMode:(window.__ffFacing||"environment"),width:{ideal:1280}},audio:false})')  # caméra arrière par défaut
cap("fotofauna.html", "let img=vframe(src,!!CAM,VSIDE);", "let img=vframe(src,!!CAM&&window.__ffMirror!==false,VSIDE);")
cap("fotofauna.html", "</head>", '<link rel="stylesheet" href="borne-fotofauna.css">\n</head>')
t = rd("fotofauna.html")
if "borne-fotofauna.js" not in t:
    i = t.rfind("</body>"); wr("fotofauna.html", t[:i] + '<script src="borne-fotofauna.js"></script>\n' + t[i:])
# les paroles des psychopompes passent sous l'enseigne, jamais dessus
s2 = rd("index.html")
s2 = once(s2, "tip.style.top=(parseFloat(g.style.top)+8)+'px';tip.classList.add('on');}", "tip.style.top=(parseFloat(g.style.top)+8)+'px';tip.classList.add('on');{const B=document.getElementById('brand'),M=B&&(B.closest('.b-marquee,.marquee')||B);if(M){const m=M.getBoundingClientRect(),t=tip.getBoundingClientRect();if(t.top<m.bottom&&t.bottom>m.top&&t.left<m.right&&t.right>m.left)tip.style.top=(parseFloat(tip.style.top)+m.bottom-t.top+6)+'px';}}{const Fo=document.querySelector('.b-bezelfoot');if(Fo&&!Fo.contains(el)){const m=Fo.getBoundingClientRect(),t=tip.getBoundingClientRect();if(t.top<m.bottom&&t.bottom>m.top&&t.left<m.right&&t.right>m.left)tip.style.top=(parseFloat(tip.style.top)-(t.bottom-m.top)-6)+'px';}}{const X=[...document.querySelectorAll('.b-row2 nav a,.b-panel .cab,.bar .dock #radio-toggle,.bar .dock button')].filter(x=>x!==el&&!x.contains(el));const ov=()=>{const t=tip.getBoundingClientRect();return X.some(x=>{const m=x.getBoundingClientRect();return m.width>0&&t.left<m.right&&t.right>m.left&&t.top<m.bottom&&t.bottom>m.top;});};if(ov()){const t0=tip.getBoundingClientRect(),gy=parseFloat(g.style.top),top0=tip.style.top,left0=tip.style.left,Wr=document.querySelector('.wrap'),hb=home.getBoundingClientRect();if(Wr){const w=Wr.getBoundingClientRect(),wl=w.left-hb.left,wr=w.right-hb.left,HW2=home.clientWidth,gx=parseFloat(g.style.left);if(gx<HW2/2&&wl-t0.width-10>=4)tip.style.left=(wl-t0.width-10)+'px';else if(wr+10+t0.width<=HW2-4)tip.style.left=(wr+10)+'px';else if(wl-t0.width-10>=4)tip.style.left=(wl-t0.width-10)+'px';}if(ov()){tip.style.left=left0;tip.style.top=(gy-t0.height-6)+'px';if(ov()){const Fo=document.querySelector('.b-bezelfoot');if(Fo){const f=Fo.getBoundingClientRect();tip.style.top=(f.top-hb.top-t0.height-8)+'px';}if(ov())tip.style.top=top0;}}}}{const txt0=tip.textContent;const fixTip=()=>{if(!tip.classList.contains('on')||tip.textContent!==txt0||!el.classList.contains('sweep')&&!el.classList.contains('lit'))return;const Z=[...document.querySelectorAll('.b-bezelfoot,.b-row2 nav a,.b-panel .cab,.bar .dock #radio-toggle,.bar .dock button,#brand')].filter(x=>!x.contains(el)&&!el.contains(x)&&x.getClientRects().length);Z.push(el,g);const hb=home.getBoundingClientRect();const bad=()=>{const t=tip.getBoundingClientRect();return Z.some(x=>{const m=x.getBoundingClientRect();return t.left<m.right-4&&t.right>m.left+4&&t.top<m.bottom-4&&t.bottom>m.top+4;});};if(bad()){const t0=tip.getBoundingClientRect(),gq=g.getBoundingClientRect(),L0=tip.style.left,T0=tip.style.top,HW3=home.clientWidth,tw=t0.width,th=t0.height;const xs=[parseFloat(L0),gq.left-hb.left,gq.right-hb.left-tw,gq.left-hb.left-tw-6,gq.right-hb.left+6,8,HW3-tw-8];const ys=[gq.top-hb.top+(gq.height-th)/2,gq.top-hb.top-th-6,gq.bottom-hb.top+6,gq.top-hb.top,gq.bottom-hb.top-th,parseFloat(T0)];Z.forEach(f=>{const m=f.getBoundingClientRect();ys.push(m.top-hb.top-th-6,m.bottom-hb.top+6);});let ok=false;for(const y of ys){for(const x of xs){if(x<4||x+tw>HW3-4)continue;tip.style.left=x+'px';tip.style.top=y+'px';const t=tip.getBoundingClientRect();if(t.top<0||t.bottom>innerHeight)continue;const dx=Math.max(0,gq.left-t.right,t.left-gq.right),dy=Math.max(0,gq.top-t.bottom,t.top-gq.bottom);if(dx>24||dy>24)continue;if(!bad()){ok=true;break;}}if(ok)break;}if(!ok){const gcx=(gq.left+gq.right)/2-hb.left,R=[...document.querySelectorAll('.b-glass')].filter(x=>x.getClientRects().length).map(x=>x.getBoundingClientRect()).sort((a,b)=>{const d=r=>Math.abs((r.top+r.bottom)/2-(gq.top+gq.bottom)/2);return d(a)-d(b);});for(const r of R){const x=Math.max(r.left-hb.left+8,Math.min(r.right-hb.left-tw-8,gcx-tw/2));const cand=gq.top>r.bottom?[r.bottom-hb.top-th-10,r.top-hb.top+10]:[r.top-hb.top+10,r.bottom-hb.top-th-10];for(const y of cand){tip.style.left=x+'px';tip.style.top=y+'px';const t=tip.getBoundingClientRect();if(t.top<0||t.bottom>innerHeight||t.left<4||t.right>innerWidth-4)continue;if(!bad()){ok=true;break;}}if(ok)break;}}if(!ok){const area=()=>{const t=tip.getBoundingClientRect();let A=0;Z.forEach(x=>{const m=x.getBoundingClientRect();A+=Math.max(0,Math.min(t.right,m.right)-Math.max(t.left,m.left))*Math.max(0,Math.min(t.bottom,m.bottom)-Math.max(t.top,m.top));});return A;};let best=null,bA=1e9;for(const y of ys)for(const x of xs){if(x<4||x+tw>HW3-4)continue;tip.style.left=x+'px';tip.style.top=y+'px';const t=tip.getBoundingClientRect();if(t.top<0||t.bottom>innerHeight)continue;const dx=Math.max(0,gq.left-t.right,t.left-gq.right),dy=Math.max(0,gq.top-t.bottom,t.top-gq.bottom);if(dx>24||dy>24)continue;const A=area();if(A<bA){bA=A;best=[x,y];}}if(best){tip.style.left=best[0]+'px';tip.style.top=best[1]+'px';}else{tip.style.left=L0;tip.style.top=T0;}}}};fixTip();addEventListener('scrollend',fixTip,{once:true});setTimeout(fixTip,900);}}")
wr("index.html", s2)
# l'enseigne : INSERT KOIN domine ; INTERSEKTION, NOIR INSEKT, SEKTOR INN viennent brouiller son signal, souvent, peu de temps (décision du 30 oct.)
s3 = rd("index.html")
s3 = once(s3, "let cur=NM[(Math.random()*NM.length)|0];", "let cur=NM[0];")
s3 = once(s3, "busy=true;const nx=pick(cur);", "busy=true;const nx=cur===NM[0]?pick(cur):NM[0];")
s3 = once(s3, "function later(){setTimeout(go2,26000+Math.random()*34000);}", "function later(){setTimeout(go2,cur===NM[0]?7000+Math.random()*11000:1300+Math.random()*2700);}")
wr("index.html", s3)
# le psychopompe se pose à côté de l'enseigne, du compteur de Koins et de Baku Boom, jamais dessus (lieux de clarté absolue, DA.md)
s4 = rd("index.html")
s4 = once(s4, "tx=Math.max(4,Math.min(HW-gw-4,tx));place(tx,ty);", "tx=Math.max(4,Math.min(HW-gw-4,tx));{const F=[document.getElementById('brand'),document.querySelector('.b-bezelfoot'),document.getElementById('koins'),document.querySelector('.b-bezelfoot .b-boom'),...document.querySelectorAll('.bar .dock #radio-toggle,.bar .dock button,.b-row2 nav a')].filter(x=>x&&x.getClientRects().length&&x!==el&&!x.contains(el)&&!el.contains(x)).map(homeXY);for(let pass=0;pass<3;pass++)for(const f of F){if(tx<f.x+f.w&&tx+gw>f.x&&ty<f.y+f.h&&ty+H>f.y){const L=f.x-gw-6,Rr=f.x+f.w+6;if(L<4&&Rr+gw>HW-4){ty=f.y+f.h+4;}else tx=(L>=4&&(Math.abs(L-tx)<=Math.abs(Rr-tx)||Rr+gw>HW-4))?L:Rr;}}tx=Math.max(4,Math.min(HW-gw-4,tx));for(const f of F){if(tx<f.x+f.w&&tx+gw>f.x&&ty<f.y+f.h&&ty+H>f.y)ty=f.y+f.h+4;}}place(tx,ty);")
wr("index.html", s4)
# la visite part quand l'arrivée est faite : borne dévoilée, écran entier à l'écran, puis quelques secondes (téléphone couché compris)
s5 = rd("index.html")
s5 = once(s5, "clearTimeout(g._tourT);g._tourT=setTimeout(()=>{if(!touring&&!away&&!g._drag&&!g.classList.contains('fling')&&!$('home').hidden&&!document.hidden)tour();},2600+Math.random()*2200);}", "clearTimeout(g._tourT);const goT=()=>{const R0=document.documentElement;if(!R0.classList.contains('borne-ready')){g._tourT=setTimeout(goT,700);return;}if(!window.__borneReadyT)window.__borneReadyT=performance.now();if(performance.now()-window.__borneReadyT<3500){g._tourT=setTimeout(goT,700);return;}if(!touring&&!away&&!g._drag&&!g.classList.contains('fling')&&!$('home').hidden&&!document.hidden)tour();};g._tourT=setTimeout(goT,2600+Math.random()*2200);}")
wr("index.html", s5)
# visite figée par un geste : le psychopompe reste posé, sans s'en aller ni repartir de zéro ; la reprise se fait où il en était
s6 = rd("index.html")
s6 = once(s6, "setInterval(()=>{if(away||touring)return;const t=performance.now();if(t>idleT){leave();return;}", "setInterval(()=>{if(away||touring)return;const t=performance.now();if(window.__borneTourHeld&&window.__borneTourHeld()){idleT=t+12000;return;}if(t>idleT){leave();return;}")
wr("index.html", s6)
# geste du visiteur entre deux arrêts, ou avant le départ : la visite attend quatre secondes, comme pendant un arrêt (B12)
s7 = rd("index.html")
s7 = once(s7, "if(performance.now()-window.__borneReadyT<3500){g._tourT=setTimeout(goT,700);return;}", "if(performance.now()-window.__borneReadyT<3500||(window.__borneHandHold||0)>Date.now()){g._tourT=setTimeout(goT,700);return;}")
s7 = once(s7, "async function tour(resume){if(touring||window.__borneNoPsy)return;", "async function tour(resume){if(touring||window.__borneNoPsy)return;if(!resume&&(window.__borneHandHold||0)>Date.now())return;")
s7 = once(s7, "say(el,go==='motel'?'':nm,said)", "say(el,go==='motel'?'MOTEL SOUND':nm,said)")  # chaque bulle a son titre : l'arrêt de la radio prend le nom de la radio
wr("index.html", s7)
# la borne en français : fr.html sort de la borne finie, avec la langue et l'en-tête français d'InsertKoin (fr-head.json)
import json as _json
f = rd("index.html")
for a, b in _json.load(open("fr-head.json", encoding="utf-8")):
    f = once(f, a, b)
wr("fr.html", f)
print("index.html, skoporhogo-borne.html ; noms canoniques ; plafond 99 ; FotoFauna ; fr.html")
