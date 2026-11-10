/* La barre universelle des lieux du motel (Mauk Tenieb, 10 nov. 2026, 19 h 37 : « La barre minimale universelle doit présenter le BakuBoom,
   le Kapture, le diktaTfaune […], le bouton d'immersion, la playlist du Motel Sound, la manette, elle, doit finalement faire passer d'une pièce à l'autre »).
   Une seule place dans KorhogOS, la TV, la Video Kave et le DVD : une plaque groupée au pied de l'écran, centrée, sous le pouce.
   Large : une rangée. Étroit (moins de 560 px) : un bloc de deux rangées, la manette sur toute la hauteur.
   19 h 51 : « La barre : Motel Sound aussi. Et que des icônes hein. » Zéro mot visible ; le nom de chaque bouton dans title et aria-label.
   Ordre : manette et pictogramme de la pièce courante (cinq voyants), Baku Boom, Kapture, diktaTfaune, Immersion, Motel Sound, playlist, langue, Koins.
   La manette passe d'une pièce à l'autre (KorhogOS, TV, Borne, Video Kave, DVD) : toucher ou cliquer = pièce suivante, glisser à gauche
   ou à droite, flèches gauche et droite quand elle a le focus. Le Motel Sound reste allumé d'un lieu à l'autre (ik.motel) et reprend
   au premier geste du visiteur ; window.IKMotel sert la télé et le téléphone de la Video Kave. */
(function(){
if(window.top!==window.self||document.getElementById('ikbar'))return;
var lang='en';try{lang=localStorage.getItem('ik.lang')==='fr'?'fr':'en'}catch(e){}
var ON=/github\.io$/.test(location.hostname),HALL=ON?'https://mauktenieb.github.io/insertkoin/':'../';
var KOS=/kos\.html/.test(location.pathname);try{sessionStorage.setItem('ik.os','1')}catch(e){}
var ROOMS=[['OS','KorhogOS','kos.html'],['TV','TV','tv.html'],['BORNE','Borne',HALL],['KAVE','Video Kave','videoclub.html'],['DVD','DVD','dvd.html']];
var here=0;ROOMS.forEach(function(r,i){if(i!==2&&location.pathname.indexOf(r[2])>=0)here=i});
var A='../',GOLD='#c9a24e',CREAM='#f1e7cf',AMB='#ff9a3c';
var BTN='background:url('+A+'bouton-gris.webp) 50% 50%/contain no-repeat;';
var CSS=
'#ikbar{position:fixed;left:0;right:0;bottom:0;z-index:2147482990;display:flex;justify-content:center;pointer-events:none;'+
 'padding:0 max(6px,env(safe-area-inset-right)) 0 max(6px,env(safe-area-inset-left))}'+
'#ikbar *{box-sizing:border-box}'+
'#ikbar .ikb{pointer-events:auto;display:flex;align-items:center;gap:6px;max-width:100%;'+
 'padding:4px 10px calc(4px + env(safe-area-inset-bottom)) 8px;border-radius:7px 7px 0 0;background:#0e0c0b;'+
 'background-image:radial-gradient(circle at 6px 8px,rgba(214,170,110,.32) 0 1.6px,transparent 2.2px),radial-gradient(circle at calc(100% - 6px) 8px,rgba(214,170,110,.32) 0 1.6px,transparent 2.2px),linear-gradient(180deg,#1b1714,#0b0908);'+
 'box-shadow:inset 0 1px 0 rgba(214,170,110,.22),inset 0 0 0 1px rgba(214,170,110,.12),0 -2px 10px rgba(0,0,0,.55);'+
 'color:'+CREAM+';font:12px/1 "DM Mono",ui-monospace,monospace;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}'+
'#ikbar button{appearance:none;border:0;margin:0;padding:0;background:none;color:inherit;font:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}'+
'#ikbar button:focus-visible{outline:2px solid '+GOLD+';outline-offset:2px;border-radius:50%}'+
'#ikbar .ikb-stick{display:flex;align-items:center;gap:4px;touch-action:none;margin-right:4px}'+
'#ikbar .ikb-man{position:relative;width:44px;height:52px;margin-top:-10px}'+
'#ikbar .ikb-man i{position:absolute;inset:0;background:url('+A+'manette-a.webp) 50% 100%/contain no-repeat;transform-origin:50% 88%;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}'+
'#ikbar .ikb-man::after{content:"";position:absolute;left:8px;right:8px;bottom:0;height:6px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.55),transparent 70%);z-index:-1}'+
'#ikbar .ikb-room{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:40px;height:44px;cursor:pointer}'+
'#ikbar .ikb-room b{display:block;width:26px;height:26px;color:'+AMB+';filter:drop-shadow(0 0 3px rgba(255,140,40,.6))}'+
'#ikbar .ikb-room b svg{width:26px;height:26px;display:block}'+
'#ikbar .ikb-room small{display:flex;gap:3px}#ikbar .ikb-room small i{width:4px;height:4px;border-radius:50%;background:rgba(241,231,207,.22)}'+
'#ikbar .ikb-room small i.on{background:'+AMB+';box-shadow:0 0 4px '+AMB+'}'+
'#ikbar .ikb-k{position:relative;display:grid;place-items:center;width:44px;height:44px;flex:0 0 44px;border-radius:50%;'+BTN+
 'box-shadow:0 2px 3px rgba(0,0,0,.6);transition:transform .1s ease-out,filter .1s ease-out;text-shadow:0 1px 2px rgba(0,0,0,.85)}'+
'#ikbar .ikb-k svg{width:20px;height:20px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.8));margin-top:-2px}'+
'#ikbar .ikb-k:active{transform:translateY(1px) scale(.95);filter:brightness(.88)}'+
'#ikbar .b-boom{background:none;box-shadow:none}'+
'#ikbar .b-boom i{position:absolute;inset:0;background:url('+A+'baku-boom-dynamite.webp) 50% 50%/contain no-repeat;transform:rotate(-3deg);filter:drop-shadow(0 0 6px rgba(220,40,30,.55)) drop-shadow(0 3px 3px rgba(0,0,0,.5))}'+
'#ikbar .b-px-lg svg{width:22px;height:22px}'+
'#ikbar .b-px-son::before{content:"";position:absolute;top:5px;right:6px;width:5px;height:5px;border-radius:50%;background:#3a1410;box-shadow:inset 0 0 1px #000}'+
'#ikbar .b-px-son.on::before{background:#7dff8a;box-shadow:0 0 5px #5dff8a}'+
'#ikbar .b-px-son:not(.on) .w1,#ikbar .b-px-son:not(.on) .w2{display:none}#ikbar .b-px-son.on .x{display:none}'+
'#ikbar .b-px-son.wait::before{animation:ikw 1s ease-in-out infinite alternate}@keyframes ikw{to{opacity:.35}}'+
'#ikbar .ikb-koins{display:flex;align-items:center;gap:6px;height:44px;padding:0 4px 0 6px;font:12px/1 "Press Start 2P",ui-monospace,monospace;color:'+AMB+';text-shadow:0 0 6px rgba(255,140,40,.55);white-space:nowrap}'+
'#ikbar .ikb-koins i{width:20px;height:20px;flex:0 0 20px;background:url('+A+'koin.webp) 50% 50%/contain no-repeat;animation:ikkt 5.5s cubic-bezier(.45,0,.55,1) infinite}'+
'@keyframes ikkt{50%{transform:rotateY(180deg);filter:brightness(.8)}}'+
'@media (hover:hover) and (pointer:fine){#ikbar .ikb-k:hover{filter:brightness(1.18)}#ikbar .ikb-stick:hover .ikb-room b{color:#ffc27a}}'+
/* étroit : bloc de deux rangées, la manette sur toute la hauteur */
'@media (max-width:559px){#ikbar .ikb{display:grid;grid-template-columns:62px repeat(4,44px);grid-auto-rows:44px;gap:6px;padding-left:6px;padding-right:8px}'+
 '#ikbar .ikb-stick{grid-row:span 2;flex-direction:column;justify-content:flex-end;gap:2px;margin:0;align-self:stretch}'+
 '#ikbar .ikb-man{height:56px;width:44px;margin:0}#ikbar .ikb-room{min-width:0;height:auto;gap:4px}#ikbar .ikb-room b,#ikbar .ikb-room b svg{width:22px;height:22px}'+
 '#ikbar .ikb-koins{flex-direction:column;justify-content:center;gap:4px;padding:0}}'+
'@media (prefers-reduced-motion:reduce){#ikbar .ikb-koins i{animation:none}#ikbar .ikb-k{transition:none}}'+
(KOS?'#desk{bottom:calc(var(--barb) + var(--ikbar,52px))!important}#taskbar{bottom:var(--ikbar,52px)!important}#fp{bottom:calc(4px + var(--ikbar,52px))!important}'
    :'#remote{margin-bottom:var(--ikbar,52px)}#nav{bottom:var(--ikbar,52px)!important}');
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
function svg(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'}
var S='fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
/* pictogrammes des pièces, au trait, couleur du phosphore */
var ROOM_ICON={
 OS:svg('<rect x="3" y="4" width="18" height="12.5" rx="1.5" '+S+'/><path d="M6 7.5h7M6 10.5h4M9 21h6M12 16.5V21" '+S+'/>'),
 TV:svg('<path d="M8 3l4 4 4-4" '+S+'/><rect x="2.5" y="7" width="19" height="13" rx="2" '+S+'/><rect x="5" y="9.5" width="10.5" height="8" rx="1.6" '+S+'/><circle cx="18.6" cy="11.5" r=".9" fill="currentColor"/><circle cx="18.6" cy="15.5" r=".9" fill="currentColor"/>'),
 BORNE:svg('<path d="M6.5 2.5h11v5l-1.8 2V21H8.3V9.5l-1.8-2z" '+S+'/><path d="M6.5 5.5h11" '+S+'/><rect x="9.6" y="10.6" width="4.8" height="3.8" rx=".6" '+S+'/><path d="M10.4 18.5v-1.8M13 17.6h1.6" '+S+'/>'),
 KAVE:svg('<rect x="2.5" y="6" width="19" height="12" rx="1.5" '+S+'/><circle cx="8" cy="12" r="2.3" '+S+'/><circle cx="16" cy="12" r="2.3" '+S+'/><path d="M10.3 12h3.4M5 18l1.5-2.6h11L19 18" '+S+'/>'),
 DVD:svg('<circle cx="12" cy="12" r="9" '+S+'/><circle cx="12" cy="12" r="2.4" '+S+'/><path d="M7 10.2a5.4 5.4 0 0 1 3.2-3.2M17 13.8a5.4 5.4 0 0 1-3.2 3.2" '+S+'/>')};
/* drapeau de la langue courante, sur sa hampe */
var FLAG={
 fr:svg('<path d="M4 3v19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 5h5v10H5z" fill="#2c4fa3"/><path d="M10 5h5v10h-5z" fill="#f1e7cf"/><path d="M15 5h5v10h-5z" fill="#c8372b"/><rect x="5" y="5" width="15" height="10" fill="none" stroke="rgba(0,0,0,.45)" stroke-width=".8"/>'),
 en:svg('<path d="M4 3v19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><svg x="5" y="5" width="15" height="10" viewBox="0 0 60 40" preserveAspectRatio="none"><rect width="60" height="40" fill="#24357a"/><path d="M0 0l60 40M60 0L0 40" stroke="#f1e7cf" stroke-width="8"/><path d="M0 0l60 40M60 0L0 40" stroke="#c8372b" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#f1e7cf" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#c8372b" stroke-width="7"/></svg><rect x="5" y="5" width="15" height="10" fill="none" stroke="rgba(0,0,0,.45)" stroke-width=".8"/>')};
var P=document.createElement('div');P.id='ikbar';
P.innerHTML='<div class="ikb" role="toolbar">'+
 '<div class="ikb-stick"><button type="button" class="ikb-man"><i></i></button><span class="ikb-room" aria-hidden="true"><b></b><small><i></i><i></i><i></i><i></i><i></i></small></span></div>'+
 '<button type="button" class="ikb-k b-boom"><i></i></button>'+
 '<button type="button" class="ikb-k b-px-kap">'+svg('<rect x="3" y="7" width="18" height="12" rx="2" '+S+'/><circle cx="12" cy="13" r="3.6" '+S+'/><path d="M8 7l1.6-2.4h4.8L16 7" '+S+'/>')+'</button>'+
 '<button type="button" class="ikb-k b-dikt">'+svg('<rect x="8.6" y="2.5" width="6.8" height="11.5" rx="3.4" '+S+'/><path d="M8.8 6.5h2.4M8.8 9.5h2.4M12.8 6.5h2.4M12.8 9.5h2.4M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" '+S+'/>')+'</button>'+
 '<button type="button" class="ikb-k b-imm">'+svg('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>')+'</button>'+
 '<button type="button" class="ikb-k b-px-son">'+svg('<path d="M3 9.5h4l5-4.5v14l-5-4.5H3z" fill="currentColor"/><path class="w1" d="M15.5 9a4.2 4.2 0 0 1 0 6" '+S+'/><path class="w2" d="M18.2 6.5a7.6 7.6 0 0 1 0 11" '+S+'/><path class="x" d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')+'</button>'+
 '<button type="button" class="ikb-k b-px-pl">'+svg('<path d="M3.5 6.5h10M3.5 11h10M3.5 15.5h6" '+S+'/><path d="M18.5 15.5V5l3 1.6" '+S+'/><circle cx="16.3" cy="16" r="2.4" fill="currentColor"/>')+'</button>'+
 '<button type="button" class="ikb-k b-px-lg">'+FLAG[lang]+'</button>'+
 '<span class="ikb-koins" role="status"><i aria-hidden="true"></i><b class="kn">0</b></span>'+
'</div>';
function q(s){return P.querySelector(s)}
var BAR=q('.ikb'),kn=q('.kn'),KO=q('.ikb-koins');
function koins(){var n='0';try{n=localStorage.getItem('ik.koins')||'0'}catch(e){}kn.textContent=n;KO.setAttribute('aria-label','Koins '+n)}koins();
addEventListener('storage',function(e){if(e.key==='ik.koins')koins()});
var SON=q('.b-px-son'),PL=q('.b-px-pl'),KAP=q('.b-px-kap'),DIK=q('.b-dikt'),IMM=q('.b-imm'),BOOM=q('.b-boom'),LG=q('.b-px-lg'),MAN=q('.ikb-man'),STK=q('.ikb-stick'),RM=q('.ikb-room b');
function lab(e,en,fr){var t=lang==='fr'?fr:en;e.title=t;e.setAttribute('aria-label',t)}
BAR.setAttribute('aria-label',lang==='fr'?'Barre du motel':'Motel bar');
lab(BOOM,'Baku Boom','Baku Boom');lab(KAP,'Kapture','Kapture');lab(DIK,'diktaTfaune','diktaTfaune');lab(IMM,'Immersion','Immersion');
lab(SON,'Motel Sound','Motel Sound');lab(PL,'Motel Sound playlist','Playlist du Motel Sound');lab(LG,'Language: English — switch to French','Langue : français — passer en anglais');
var MSB=SON;
SON.addEventListener('click',function(){user=true;want.panel=!want.panel;try{localStorage.setItem('ik.motel',want.panel?'1':'0')}catch(e){}sync()});
PL.addEventListener('click',function(){list(function(a){if(a.length)window.open('https://www.youtube.com/watch_videos?video_ids='+a.slice(0,50).join(','),'_blank','noopener')})});
/* Kapture sur place : la page du lieu part à FotoFauna ; au doigt, le choix SKREEN / KAM du hall */
KAP.addEventListener('click',function(){var md=navigator.mediaDevices;if(!(md&&md.getDisplayMedia)||matchMedia('(pointer:coarse)').matches){location.href=HALL+'?kap=1';return}
 md.getDisplayMedia({video:{displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude'}).then(function(s){var v=document.createElement('video');v.srcObject=s;v.muted=true;v.playsInline=true;return v.play().then(function(){return new Promise(function(r){setTimeout(r,250)})}).then(function(){var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);s.getTracks().forEach(function(t){t.stop()});try{sessionStorage.setItem('ik.kap',c.toDataURL('image/jpeg',.9))}catch(e){}location.href=HALL+'?kap=skreen'})}).catch(function(){})});
/* diktaTfaune : la borne ouvre son calque par ?p=diktat, le même accès depuis chaque lieu */
DIK.addEventListener('click',function(){location.href=HALL+'?p=diktat'});
IMM.addEventListener('click',function(){var d=document.documentElement;try{if(document.fullscreenElement)document.exitFullscreen();else d.requestFullscreen()}catch(e){}});
/* Baku Boom : retour au menu du lieu, comme à la borne (dans KorhogOS : ferme les fenêtres) */
BOOM.addEventListener('click',function(){if(window.__ikBoom)window.__ikBoom()});
LG.addEventListener('click',function(){try{localStorage.setItem('ik.lang',lang==='fr'?'en':'fr')}catch(e){}location.reload()});
/* la manette : une pièce à l'autre, rebond et résistance (DA.md : ressort de manette) */
var N=ROOMS.length,RED=matchMedia('(prefers-reduced-motion:reduce)').matches,STICK=MAN.firstChild,going=false;
function nx(d){return (here+d+N)%N}
var PIPS=P.querySelectorAll('.ikb-room small i');
function show(i){RM.innerHTML=ROOM_ICON[ROOMS[i][0]];for(var k=0;k<N;k++)PIPS[k].className=k===i?'on':''}
function mlab(){var a=ROOMS[nx(-1)][1],b=ROOMS[nx(1)][1];lab(MAN,'Room: '+ROOMS[here][1]+' — next: '+b+' (← '+a+')','Pièce : '+ROOMS[here][1]+' — suivante : '+b+' (← '+a+')')}
show(here);mlab();
function tilt(a){STICK.style.transform='rotate('+a+'deg)'}
function spring(from){if(RED){tilt(0);return}STICK.style.transform='';try{STICK.animate([{transform:'rotate('+from+'deg)'},{transform:'rotate('+(-from*.3)+'deg)',offset:.55},{transform:'rotate('+(from*.08)+'deg)',offset:.82},{transform:'rotate(0deg)'}],{duration:340,easing:'cubic-bezier(.25,.8,.4,1)'})}catch(e){}}
function go(d){if(going)return;going=true;var i=nx(d);show(i);
 if(!RED){spring(d*16);try{RM.animate([{transform:'translateX('+(d*14)+'px)',opacity:.2},{transform:'none',opacity:1}],{duration:180,easing:'ease-out'})}catch(e){}}
 setTimeout(function(){location.href=ROOMS[i][2]},RED?0:240)}
var px=null,dx=0,moved=false;
STK.addEventListener('pointerdown',function(e){px=e.clientX;dx=0;moved=false;try{STK.setPointerCapture(e.pointerId)}catch(_){}if(!RED)STICK.style.transform='translateY(1px)'});
STK.addEventListener('pointermove',function(e){if(px==null)return;dx=e.clientX-px;if(Math.abs(dx)>6)moved=true;if(moved)tilt(20*Math.tanh(dx/70))});
function up(e){if(px==null)return;var a=20*Math.tanh(dx/70);px=null;if(moved&&Math.abs(dx)>=28){go(dx>0?1:-1)}else if(moved){spring(a)}else{STICK.style.transform=''}}
STK.addEventListener('pointerup',up);STK.addEventListener('pointercancel',function(){px=null;spring(0)});
STK.addEventListener('click',function(e){if(moved){moved=false;e.preventDefault();return}go(1)});
MAN.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();go(e.key==='ArrowRight'?1:-1)}});
addEventListener('pageshow',function(e){if(e.persisted){going=false;show(here);STICK.style.transform=''}});
/* le lecteur du Motel Sound */
var want={panel:false,tv:false},user=false,pl=null,ready=false,ids=null,vol=100,muted=false,title='',ORD=null,pend=null;
try{want.panel=localStorage.getItem('ik.motel')==='1'}catch(e){}
function list(cb){if(ids)return cb(ids);fetch(HALL+'index.html').then(function(r){return r.text()}).then(function(t){var m=/var JUKE_TRACKS=(\[.*?\]);/.exec(t);try{var a=m?JSON.parse(m[1]):[];ids=a.map(function(x){return x.id});ids.T={};a.forEach(function(x){ids.T[x.id]=x.t})}catch(e){ids=[]}cb(ids)}).catch(function(){ids=[];cb(ids)})}
function make(a){var d=document.createElement('div');d.id='ikp-yt';d.setAttribute('aria-hidden','true');d.style.cssText='position:fixed;left:-9999px;top:0;width:160px;height:90px';document.body.appendChild(d);
 var o=a.slice();for(var i=o.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=o[i];o[i]=o[j];o[j]=t}ORD=o;
 function go(){pl=new YT.Player('ikp-yt',{height:'90',width:'160',host:'https://www.youtube-nocookie.com',playerVars:{autoplay:1,controls:0,playsinline:1,rel:0},
  events:{onReady:function(){ready=true;var i0=pend!=null&&ids?Math.max(0,o.indexOf(ids[pend-1])):0;pend=null;pl.loadPlaylist({playlist:o,index:i0});pl.setLoop(true);sync()},onError:function(){try{pl.nextVideo()}catch(e){}},
   onStateChange:function(){try{var v=pl.getVideoData&&pl.getVideoData();var id=v&&v.video_id;title=((ids.T&&ids.T[id])||(v&&v.title)||'').replace(/_/g,' ');$t()}catch(e){}}}})}
 if(window.YT&&YT.Player)go();else{var pr=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(pr)pr();go()};var sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc)}}
function $t(){MSB.title=title?'Motel Sound — '+title:'Motel Sound'}
var hush={};
function sync(){var on=(want.panel||want.tv)&&!Object.keys(hush).some(function(k){return hush[k]});MSB.classList.toggle('on',on);MSB.classList.toggle('wait',on&&!user);MSB.setAttribute('aria-pressed',String(want.panel));
 if(!on){if(pl&&ready)try{pl.pauseVideo()}catch(e){}return}
 if(!user)return;
 if(!pl){list(function(a){if(a.length&&!pl&&!document.getElementById('ikp-yt'))make(a)});return}
 if(ready)try{if(muted||!vol)pl.mute();else{pl.unMute();pl.setVolume(vol)}pl.playVideo()}catch(e){}}
['pointerdown','keydown'].forEach(function(ev){addEventListener(ev,function f(){if(!user){user=true;sync()}},{capture:true,once:true})});
/* 10 nov. : le téléphone du comptoir compose un numéro de piste du Motel Sound (1 à 99, ordre de la liste du hall) */
function dial(n){user=true;want.panel=true;try{localStorage.setItem('ik.motel','1')}catch(e){}if(pl&&ready&&ORD&&ids){var i=ORD.indexOf(ids[n-1]);if(i>=0)try{pl.playVideoAt(i)}catch(e){}}else pend=n;sync()}
window.IKMotel={dial:dial,on:function(v){user=true;want.panel=!!v;try{localStorage.setItem('ik.motel',v?'1':'0')}catch(e){}sync()},count:function(cb){list(function(a){cb(a.length)})},hush:function(k,v){hush[k]=!!v;sync()},want:function(k,v){want[k]=!!v;sync()},vol:function(v){vol=Math.max(0,Math.min(100,v));sync()},mute:function(m){muted=!!m;sync()}};
function fit(){var h=Math.round(BAR.getBoundingClientRect().height)||52;document.documentElement.style.setProperty('--ikbar',h+'px')}
function add(){document.body.appendChild(P);sync();fit();if(window.ResizeObserver)new ResizeObserver(function(){var o=getComputedStyle(document.documentElement).getPropertyValue('--ikbar');fit();if(KOS&&o!==getComputedStyle(document.documentElement).getPropertyValue('--ikbar'))dispatchEvent(new Event('resize'))}).observe(BAR);if(KOS)setTimeout(function(){dispatchEvent(new Event('resize'))},60)}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
