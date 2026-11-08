/* Le panneau de contrôle commun des lieux du motel (Mauk Tenieb, 8 nov., 16 h 55 : « un panneau de contrôle universel sous tous les régimes et tous les écrans ;
   il existe déjà : le Baku Boom, la musique »). Les commandes de la bande de la borne, sur une plaque émaillée, au même coin de chaque lieu :
   BAKU BOOM (retour au hall), MOTEL SOUND (la liste du hall, lecteur YouTube ; le titre défile), FR · EN (la langue de tout le site).
   Le Motel Sound reste allumé d'un lieu à l'autre (ik.motel) ; le navigateur exige un geste pour le son : il reprend au premier geste du visiteur.
   window.IKMotel : la télé y branche le son de son télétexte, son volume et son muet. */
(function(){
if(window.top!==window.self||document.getElementById('ikp'))return;
var lang='en';try{lang=localStorage.getItem('ik.lang')==='fr'?'fr':'en'}catch(e){}
var ON=/github\.io$/.test(location.hostname),HALL=ON?'https://mauktenieb.github.io/insertkoin/':'../';
var KOS=/kos\.html/.test(location.pathname);
var css='#ikp{position:fixed;'+(KOS?'right:10px;top:8px':'left:10px;bottom:10px')+';z-index:2147482990;display:flex;align-items:stretch;gap:2px;padding:6px 7px;background:#3b2416;border-radius:9px;box-shadow:inset 0 0 0 3px #3b2416,inset 0 0 0 4.5px #efe3cf,0 8px 20px rgba(0,0,0,.6);font:700 11px/1 "Bebas Neue",Impact,"Arial Narrow",sans-serif;letter-spacing:.14em;color:#efe3cf;-webkit-tap-highlight-color:transparent;max-width:calc(100vw - 20px)}'+
'#ikp button{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:6px;min-height:34px;padding:0 9px;border-radius:4px;cursor:pointer;color:#efe3cf;white-space:nowrap}'+
'#ikp button:hover,#ikp button:focus-visible{background:rgba(239,227,207,.12)}#ikp button:focus-visible{outline:2px solid #c9a24e}'+
'#ikp svg{width:16px;height:16px;flex:none}'+
'#ikp .ms{min-width:0;max-width:min(240px,42vw)}#ikp .ms .tt{overflow:hidden;min-width:0;font-weight:400;letter-spacing:.08em;color:#c9a24e}#ikp .ms .tt span{display:inline-block;padding-left:100%;animation:ikpm 14s linear infinite}'+
'#ikp .ms:not(.on) .tt{display:none}#ikp .ms.wait svg{animation:ikpw 1s ease-in-out infinite alternate}'+
'#ikp .lg b{color:#c9a24e}#ikp .lg i{font-style:normal;opacity:.45}'+
'@keyframes ikpm{to{transform:translateX(-100%)}}@keyframes ikpw{to{opacity:.35}}'+
'@media (max-width:600px){#ikp{font-size:10px;padding:4px 5px}#ikp button{min-height:44px;padding:0 7px}#ikp .bb .l{display:none}#ikp .ms{max-width:34vw}}'+
(KOS?'@media (max-width:600px){#ikp{right:auto;top:auto;left:8px;bottom:86px}}':'@media (max-width:600px){#ikp{left:auto;bottom:auto;right:8px;top:8px}}')+
'@media (prefers-reduced-motion:reduce){#ikp .ms .tt span{animation:none;padding-left:0}}'+
'html[data-prog] #ikp,body.on-calque #ikp{display:none}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var P=document.createElement('div');P.id='ikp';P.setAttribute('role','toolbar');P.setAttribute('aria-label',lang==='fr'?'Panneau de contrôle':'Control panel');
var SV={boom:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 L9.6 5.6 L14 4.4 L11 8 L14 11.6 L9.6 10.4 L8 14.5 L6.4 10.4 L2 11.6 L5 8 L2 4.4 L6.4 5.6 Z" fill="#efe3cf"/></svg>',
 note:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2 L14 0.5 V11 A2.2 2 0 1 1 12.4 9.1 V4 L7.6 4.9 V12.5 A2.2 2 0 1 1 6 10.6 Z" fill="#efe3cf"/></svg>'};
function btn(c,html,lab,fn){var b=document.createElement('button');b.type='button';b.className=c;b.innerHTML=html;b.title=lab;b.setAttribute('aria-label',lab);b.addEventListener('click',fn);P.appendChild(b);return b}
btn('bb',SV.boom+'<span class="l">BAKU BOOM</span>',lang==='fr'?'Baku Boom : retour au hall':'Baku Boom: back to the hall',function(){location.href=HALL});
var MSB=btn('ms',SV.note+'<span class="l">MOTEL SOUND</span><span class="tt"><span></span></span>','Motel Sound',function(){user=true;want.panel=!want.panel;try{localStorage.setItem('ik.motel',want.panel?'1':'0')}catch(e){}sync()});
btn('lg',lang==='fr'?'<b>FR</b><i>·</i><i>EN</i>':'<i>FR</i><i>·</i><b>EN</b>',lang==='fr'?'Switch to English':'Passer en français',function(){try{localStorage.setItem('ik.lang',lang==='fr'?'en':'fr')}catch(e){}location.reload()});
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
function $t(){var s=MSB.querySelector('.tt span');s.textContent=title?' '+title+' ':''}
function sync(){var on=want.panel||want.tv;MSB.classList.toggle('on',on&&!!title);MSB.classList.toggle('wait',on&&!user);MSB.setAttribute('aria-pressed',String(want.panel));
 if(!on){if(pl&&ready)try{pl.pauseVideo()}catch(e){}return}
 if(!user)return;
 if(!pl){list(function(a){if(a.length&&!pl&&!document.getElementById('ikp-yt'))make(a)});return}
 if(ready)try{if(muted||!vol)pl.mute();else{pl.unMute();pl.setVolume(vol)}pl.playVideo()}catch(e){}}
['pointerdown','keydown'].forEach(function(ev){addEventListener(ev,function f(){if(!user){user=true;sync()}},{capture:true,once:true})});
window.IKMotel={want:function(k,v){want[k]=!!v;sync()},vol:function(v){vol=Math.max(0,Math.min(100,v));sync()},mute:function(m){muted=!!m;sync()}};
function add(){document.body.appendChild(P);sync()}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
