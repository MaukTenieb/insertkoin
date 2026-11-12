/* Le porte-clé du motel : les cinq lieux d'Insert Koin (hall, chambre, vidéoclub, bureau), au même coin de chaque page.
   Décision de Mauk Tenieb, 8 nov. 2026 : les univers sont les lieux d'un même motel. */
(function(){
if(window.top!==window.self||document.getElementById('mk'))return;
/* lieu retenu pour le visiteur qui revient ; l'entrée du site (index.html de la borne, session « Audit ») le lira */
try{var lp=location.pathname;localStorage.setItem('ik.lieu',/\/kave\//.test(lp)?(lp.split('/').pop()||'index.html'):'../')}catch(e){}
var lang='en';try{lang=localStorage.getItem('ik.lang')==='fr'?'fr':'en'}catch(e){}
var B=/github\.io$/.test(location.hostname)?'https://mauktenieb.github.io/insertkoin/':'../';
var here=(location.pathname.split('/').pop()||'').replace(/\?.*/,'');
/* dans la borne (hall), les lieux sont dans kave/ ; le porte-clé se retire pendant un programme */
var HALL=!/\/kave\//.test(location.pathname),P=HALL?'kave/':'';if(HALL)here='../';
/* les lieux : un pictogramme par lieu, sur une plaque émaillée */
var L=[['../','Insert Koin','Insert Koin','borne'],['tv.html','TV','TV','tele'],['videoclub.html','Video Kave','Video Kave','vhs'],['kos.html','KorhogOS','KorhogOS','ordi']];
/* pictogrammes en aplat, 40 × 40, encre crème ; c = couleur du fond (évidements) */
function picto(k,c){var f='#efe3cf',p={
 borne:'<rect x="9" y="3" width="22" height="34" rx="2" fill="'+f+'"/><rect x="13" y="8" width="14" height="10" fill="'+c+'"/><rect x="12" y="22" width="16" height="3" fill="'+c+'"/><circle cx="17" cy="29" r="1.7" fill="'+c+'"/><circle cx="23" cy="29" r="1.7" fill="'+c+'"/>',
 tele:'<path d="M14 3 L20 9 L26 3" fill="none" stroke="'+f+'" stroke-width="2.2"/><rect x="4" y="9" width="32" height="24" rx="3" fill="'+f+'"/><rect x="8" y="13" width="19" height="16" rx="3" fill="'+c+'"/><circle cx="31" cy="17" r="1.8" fill="'+c+'"/><circle cx="31" cy="24" r="1.8" fill="'+c+'"/><rect x="8" y="33" width="4" height="4" fill="'+f+'"/><rect x="28" y="33" width="4" height="4" fill="'+f+'"/>',
 dvd:'<circle cx="20" cy="20" r="16" fill="'+f+'"/><circle cx="20" cy="20" r="5" fill="'+c+'"/><circle cx="20" cy="20" r="2" fill="'+f+'"/>',
 vhs:'<rect x="2" y="9" width="36" height="22" rx="2" fill="'+f+'"/><circle cx="12" cy="19" r="4" fill="'+c+'"/><circle cx="28" cy="19" r="4" fill="'+c+'"/><rect x="16" y="17" width="8" height="4" fill="'+c+'"/><rect x="8" y="26" width="24" height="3" fill="'+c+'"/>',
 ordi:'<rect x="5" y="4" width="30" height="21" rx="2" fill="'+f+'"/><rect x="9" y="8" width="22" height="13" fill="'+c+'"/><rect x="16" y="25" width="8" height="5" fill="'+f+'"/><rect x="4" y="31" width="32" height="5" rx="1" fill="'+f+'"/>'}[k];
 return '<svg viewBox="0 0 40 40" aria-hidden="true">'+p+'</svg>'}
var css='#mk{position:fixed;left:14px;top:0;z-index:2147483000;-webkit-tap-highlight-color:transparent}'+
'#mk .fob{display:block;width:34px;cursor:pointer;background:none;border:0;padding:0 5px 4px;box-sizing:content-box;filter:drop-shadow(0 3px 3px rgba(0,0,0,.55))}'+
'#mk .sw{display:block;transform-origin:50% 0;animation:mksw 4.6s ease-in-out infinite alternate;perspective:240px}'+
'#mk .tw{display:block;position:relative;transform-style:preserve-3d;animation:mktw 11s cubic-bezier(.45,0,.25,1) infinite}'+
'#mk .tw>*{display:block;width:100%;height:auto;backface-visibility:hidden;-webkit-backface-visibility:hidden}'+
'#mk .tw>*+*{position:absolute;left:0;top:0;transform:rotateY(180deg)}'+
'@keyframes mksw{from{transform:rotate(-3.5deg)}to{transform:rotate(3.5deg)}}'+
'@keyframes mktw{0%,62%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}'+
'#mk .fob:focus-visible,#mk .board a:focus-visible{outline:2px solid #c9a24e;outline-offset:1px}'+
/* la plaque émaillée : une seule pièce brune, filet crème, les cinq pictogrammes ; un filet laiton sous le lieu courant */
'#mk .board{position:absolute;left:0;top:88px;display:none;gap:2px;padding:9px 10px;background:#3b2416;border-radius:9px;box-shadow:inset 0 0 0 4px #3b2416,inset 0 0 0 5.5px #efe3cf,0 10px 24px rgba(0,0,0,.6)}'+
'#mk.on .board{display:flex}'+
'#mk .board a{display:grid;place-items:center;width:48px;height:48px;position:relative;border-radius:4px}'+
'#mk .board a svg{width:30px;height:30px;transition:transform .15s}'+
'#mk .board a:hover svg{transform:scale(1.1)}'+
'#mk .board a[aria-current]::after{content:"";position:absolute;left:9px;right:9px;bottom:2px;height:3px;background:#c9a24e}'+
'@media (max-width:900px){#mk{left:4px}#mk .fob{width:28px;padding:0 8px 4px}#mk .board{top:72px;padding:7px 8px}#mk .board a{width:44px;height:44px}#mk .board a svg{width:26px;height:26px}}'+
'#mk.img .board{top:126px}'+
'@media (max-width:900px){#mk.img .board{top:100px}}'+
'@media (prefers-reduced-motion:reduce){#mk .sw,#mk .tw{animation:none}}'+
'body.on-calque #mk,html[data-prog] #mk,.b-immersion #mk{display:none}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
/* le porte-clé : image fournie par Mauk Tenieb (a/porte-cle.webp) ; à défaut, le losange dessiné */
var svg='<svg viewBox="0 0 34 82" width="34" height="82" aria-hidden="true">'+
'<line x1="17" y1="0" x2="17" y2="7" stroke="#2a2420" stroke-width="2"/>'+
'<circle cx="17" cy="12" r="5.5" fill="none" stroke="#b08a3e" stroke-width="2"/>'+
'<path d="M14 17h6v5h-1v3h-2v-2h-1v4h-2z" fill="#c9a24e" stroke="#7d6128" stroke-width=".6"/>'+
'<path d="M17 26 L32 52 Q33 54 31.5 56 L19 79 Q17 82 15 79 L2.5 56 Q1 54 2 52 Z" fill="#8b1e1e" stroke="#5e1212" stroke-width="1"/>'+
'<path d="M17 31 L28.5 52.5 L17 75 L5.5 52.5 Z" fill="none" stroke="#e9dccb" stroke-width=".8" opacity=".75"/>'+
'<circle cx="17" cy="33" r="2.3" fill="#2a2420"/>'+
'<text x="17" y="55.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="5.6" letter-spacing=".6" fill="#efe3cf">KORHOGO</text></svg>';
var IMG=P+'a/porte-cle.webp';
var w=document.createElement('div');w.id='mk';
var b=document.createElement('button');b.className='fob';b.type='button';b.setAttribute('aria-expanded','false');
b.innerHTML='<span class="sw"><span class="tw">'+svg+svg+'</span></span>';
(function(){var im=new Image();im.onload=function(){w.classList.add('img');b.querySelector('.tw').innerHTML='<img src="'+IMG+'" alt=""><img src="'+IMG+'" alt="">'};im.src=IMG})();
var c=document.createElement('nav');c.className='board';
function href(u){return u==='../'?(HALL?'./':B):P+u}
var BG='#3b2416';
function fill(){try{lang=localStorage.getItem('ik.lang')||lang}catch(e){}var fr=lang==='fr';
 b.setAttribute('aria-label',fr?'Porte-clé du motel : les lieux':'Motel key tag: the places');c.setAttribute('aria-label',fr?'Les lieux du motel':'The motel places');
 c.innerHTML='';L.forEach(function(x){var a=document.createElement('a');a.href=href(x[0]);a.title=fr?x[1]:x[2];a.setAttribute('aria-label',a.title);a.innerHTML=picto(x[3],BG);if(x[0]===here)a.setAttribute('aria-current','page');c.appendChild(a)})}
fill();
w.appendChild(b);w.appendChild(c);
function tog(v){w.classList.toggle('on',v);b.setAttribute('aria-expanded',String(v))}
b.addEventListener('click',function(e){e.stopPropagation();var v=!w.classList.contains('on');if(v)fill();tog(v)});
document.addEventListener('click',function(e){if(!w.contains(e.target))tog(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('on')){tog(false);b.focus();e.stopPropagation();e.preventDefault()}},true);
function add(){document.body.appendChild(w);var t=getComputedStyle(document.documentElement).getPropertyValue('--mk-top');if(t)w.style.top=t}
/* au hall, sur un écran sans marge à gauche du meuble (téléphone), le porte-clé pend au toit et défile avec la page : il cesse de flotter sur le meuble (Mauk Tenieb, 8 nov.) */
function hall(){var wr=document.querySelector('.wrap');if(!wr||!document.querySelector('.b-panel'))return;var R=wr.getBoundingClientRect();
 if(R.left>=56){w.style.position='';w.style.left='';return}
 var p=document.querySelector('.b-pot'),P=p&&p.offsetParent?p.getBoundingClientRect():null;var F=document.querySelector('.bar .brand'),Q=F&&F.getBoundingClientRect();/* la plante au-dessus du fronton (téléphone debout) : le porte-clé pend à sa droite ; sinon au bord gauche */
 w.style.position='absolute';w.style.top='0px';w.style.left=Math.round((P&&P.width&&(!Q||Q.top>=P.bottom-4)?P.right+8:4)+scrollX)+'px'}
addEventListener('resize',function(){setTimeout(hall,200)});addEventListener('load',function(){setTimeout(hall,900);setTimeout(hall,3000)});setTimeout(hall,1200);
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
