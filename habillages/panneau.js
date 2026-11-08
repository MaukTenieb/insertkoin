/* La barre universelle des lieux du motel (Mauk Tenieb, 8 nov. 2026 : « une barre universelle. Simple. Minimaliste. »).
   Une capsule en haut à droite, la même dans KorhogOS, la TV, le Video Kave et le DVD : Koins, Motel Sound, PL, Kapture, FR · EN, Immersion, Baku Boom.
   Une seule source : ce fichier. Le Motel Sound reste allumé d'un lieu à l'autre (ik.motel) et reprend au premier geste ; window.IKMotel sert la télé. */
(function(){
if(window.top!==window.self||document.getElementById('ikbar'))return;
var lang='en';try{lang=localStorage.getItem('ik.lang')==='fr'?'fr':'en'}catch(e){}
var ON=/github\.io$/.test(location.hostname),HALL=ON?'https://mauktenieb.github.io/insertkoin/':'../';
var KOS=/kos\.html/.test(location.pathname);try{sessionStorage.setItem('ik.os','1')}catch(e){}

var ICO={
 son:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="w" d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12"/></svg>',
 kap:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.6"/></svg>',
 imm:'<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>'
};
var CSS='@font-face{font-family:"Press Start 2P";src:url('+HALL+'font-press-start-2p-latin-400-normal.woff2) format("woff2");font-display:swap}'+
'#ikbar{position:fixed;z-index:2147482990;right:max(8px,env(safe-area-inset-right));top:calc(var(--bart,0px) + max(8px,env(safe-area-inset-top)));display:flex;align-items:center;gap:2px;padding:3px 4px 3px 12px;'+
 'background:rgba(9,7,5,.78);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border:1px solid rgba(201,168,76,.45);border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.45);'+
 'font:12px/1 "Press Start 2P",ui-monospace,monospace;color:#ff9a3c;text-shadow:0 0 8px rgba(255,140,40,.5);user-select:none;-webkit-user-select:none}'+
'#ikbar .k{display:flex;align-items:center;gap:7px;padding-right:8px;margin-right:2px;border-right:1px solid rgba(201,168,76,.25);height:28px}'+
'#ikbar .k i{width:16px;height:16px;background:url('+HALL+'koin.webp) center/contain no-repeat;animation:ikturn 5.5s cubic-bezier(.45,0,.55,1) infinite}'+
'@keyframes ikturn{0%,70%{transform:rotateY(0)}85%{transform:rotateY(180deg)}100%{transform:rotateY(360deg)}}'+
'#ikbar button{all:unset;box-sizing:border-box;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;cursor:pointer;color:#e8c27a;transition:background .15s,color .15s,transform .1s}'+
'#ikbar button:hover{background:rgba(255,154,60,.12);color:#ffcf7a}#ikbar button:active{transform:scale(.92)}#ikbar button:focus-visible{outline:2px solid #ffcf7a;outline-offset:1px}'+
'#ikbar svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
'#ikbar .son:not(.on) .w{opacity:.25}#ikbar .son.on{color:#ff9a3c}#ikbar .son.wait{animation:ikwait 1.6s ease-in-out infinite}@keyframes ikwait{50%{opacity:.45}}'+
'#ikbar .t{font-size:11px;letter-spacing:.06em}'+
'#ikbar .boom{width:42px}#ikbar .boom img{width:30px;height:30px;object-fit:contain;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}'+
'@media (pointer:coarse){#ikbar button{width:44px;height:44px}}'+
'@media (max-width:480px){#ikbar{padding-left:10px;gap:0}#ikbar .pl,#ikbar .imm{display:none}}';
var P=document.createElement('div');P.id='ikbar';P.setAttribute('role','toolbar');P.setAttribute('aria-label','Insert Koin');
P.innerHTML='<style>'+CSS+'</style><span class="k"><i></i><b class="kn">0</b></span>'+
 '<button class="son" type="button">'+ICO.son+'</button><button class="pl t" type="button">PL</button><button class="kap" type="button">'+ICO.kap+'</button>'+
 '<button class="lg t" type="button">'+(lang==='fr'?'EN':'FR')+'</button><button class="imm" type="button">'+ICO.imm+'</button>'+
 '<button class="boom" type="button"><img alt="" src="'+HALL+'baku-boom-dynamite.webp"></button>';
function q(s){return P.querySelector(s)}
var kn=q('.kn');function koins(){try{kn.textContent=localStorage.getItem('ik.koins')||'0'}catch(e){}}koins();addEventListener('storage',koins);
var SON=q('.son'),PL=q('.pl'),KAP=q('.kap'),IMM=q('.imm'),BOOM=q('.boom'),LG=q('.lg');
function lab(e,t){e.title=t;e.setAttribute('aria-label',t)}
lab(SON,'Motel Sound');lab(PL,'PL');lab(KAP,'Kapture');lab(IMM,'Immersion');lab(BOOM,'Baku Boom');lab(LG,'Français / English');
SON.addEventListener('click',function(){user=true;want.panel=!want.panel;try{localStorage.setItem('ik.motel',want.panel?'1':'0')}catch(e){}sync()});
PL.addEventListener('click',function(){list(function(a){if(a.length)window.open('https://www.youtube.com/watch_videos?video_ids='+a.slice(0,50).join(','),'_blank','noopener')})});
/* Kapture sur place : la page du lieu part à FotoFauna ; au doigt, le choix SKREEN / KAM du hall */
KAP.addEventListener('click',function(){var md=navigator.mediaDevices;if(!(md&&md.getDisplayMedia)||matchMedia('(pointer:coarse)').matches){location.href=HALL+'?kap=1';return}
 md.getDisplayMedia({video:{displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude'}).then(function(s){var v=document.createElement('video');v.srcObject=s;v.muted=true;v.playsInline=true;return v.play().then(function(){return new Promise(function(r){setTimeout(r,250)})}).then(function(){var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);s.getTracks().forEach(function(t){t.stop()});try{sessionStorage.setItem('ik.kap',c.toDataURL('image/jpeg',.9))}catch(e){}location.href=HALL+'?kap=skreen'})}).catch(function(){})});
IMM.addEventListener('click',function(){var d=document.documentElement;try{if(document.fullscreenElement)document.exitFullscreen();else d.requestFullscreen()}catch(e){}});
/* Baku Boom : retour au menu du lieu, comme à la borne ; dans KorhogOS, toutes les fenêtres se ferment */
BOOM.addEventListener('click',function(){if(KOS&&window.__kosBoom){window.__kosBoom();return}if(window.__ikBoom){window.__ikBoom();return}location.href=(ON?HALL+'habillages/':'')+'kos.html'});
LG.addEventListener('click',function(){try{localStorage.setItem('ik.lang',lang==='fr'?'en':'fr')}catch(e){}location.reload()});
/* le lecteur du Motel Sound */
var want={panel:false,tv:false},user=false,pl=null,ready=false,ids=null,vol=100,muted=false,title='';
try{want.panel=localStorage.getItem('ik.motel')==='1'}catch(e){}
function list(cb){if(ids)return cb(ids);fetch(HALL+'index.html').then(function(r){return r.text()}).then(function(t){var m=/var JUKE_TRACKS=(\[.*?\]);/.exec(t);try{var a=m?JSON.parse(m[1]):[];ids=a.map(function(x){return x.id});ids.T={};a.forEach(function(x){ids.T[x.id]=x.t})}catch(e){ids=[]}cb(ids)}).catch(function(){ids=[];cb(ids)})}
function make(a){var d=document.createElement('div');d.id='ikp-yt';d.setAttribute('aria-hidden','true');d.style.cssText='position:fixed;left:-9999px;top:0;width:160px;height:90px';document.body.appendChild(d);
 var o=a.slice();for(var i=o.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=o[i];o[i]=o[j];o[j]=t}
 function go(){pl=new YT.Player('ikp-yt',{height:'90',width:'160',host:'https://www.youtube-nocookie.com',playerVars:{autoplay:1,controls:0,playsinline:1,rel:0},
  events:{onReady:function(){ready=true;pl.loadPlaylist({playlist:o,index:0});pl.setLoop(true);sync()},onError:function(){try{pl.nextVideo()}catch(e){}},
   onStateChange:function(){try{var v=pl.getVideoData&&pl.getVideoData();var id=v&&v.video_id;title=((ids.T&&ids.T[id])||(v&&v.title)||'').replace(/_/g,' ');$t()}catch(e){}}}})}
 if(window.YT&&YT.Player)go();else{var pr=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(pr)pr();go()};var sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc)}}
function $t(){SON.title=title?'Motel Sound — '+title:'Motel Sound'}
function sync(){var on=want.panel||want.tv;SON.classList.toggle('on',on);SON.classList.toggle('wait',on&&!user);SON.setAttribute('aria-pressed',String(want.panel));
 if(!on){if(pl&&ready)try{pl.pauseVideo()}catch(e){}return}
 if(!user)return;
 if(!pl){list(function(a){if(a.length&&!pl&&!document.getElementById('ikp-yt'))make(a)});return}
 if(ready)try{if(muted||!vol)pl.mute();else{pl.unMute();pl.setVolume(vol)}pl.playVideo()}catch(e){}}
['pointerdown','keydown'].forEach(function(ev){addEventListener(ev,function f(){if(!user){user=true;sync()}},{capture:true,once:true})});
window.IKMotel={want:function(k,v){want[k]=!!v;sync()},vol:function(v){vol=Math.max(0,Math.min(100,v));sync()},mute:function(m){muted=!!m;sync()}};
function add(){document.body.appendChild(P);sync()}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
