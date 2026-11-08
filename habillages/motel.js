/* Le porte-clé du motel : les cinq lieux d'Insert Koin (hall, chambre, vidéoclub, bureau), au même coin de chaque page.
   Décision de Mauk Tenieb, 8 nov. 2026 : les univers sont les lieux d'un même motel. */
(function(){
if(window.top!==window.self||document.getElementById('mk'))return;
var lang='fr';try{lang=localStorage.getItem('ik.lang')||(/^fr/.test(navigator.language)?'fr':'en')}catch(e){}
var B=/github\.io$/.test(location.hostname)?'https://mauktenieb.github.io/insertkoin/':'../';
var here=(location.pathname.split('/').pop()||'').replace(/\?.*/,'');
/* dans la borne (hall), les lieux sont dans habillages/ ; le porte-clé se retire pendant un programme */
var HALL=!/\/habillages\//.test(location.pathname),P=HALL?'habillages/':'';if(HALL)here='../';
/* les lieux : une ligne par lieu ; la chambre donne ses deux objets */
var L=[
 [['../','Hall','Lobby']],
 [[null,'Chambre','Room'],['tv.html','Télé','TV'],['dvd.html','DVD','DVD']],
 [['videoclub.html','Vidéoclub','Video store']],
 [['kos.html','Bureau','Office']]];
var css='#mk{position:fixed;left:14px;top:0;z-index:2147483000;font:13px/1 "Courier New",Courier,monospace;-webkit-tap-highlight-color:transparent}'+
'#mk .fob{display:block;width:34px;cursor:pointer;background:none;border:0;padding:0 5px 4px;box-sizing:content-box;filter:drop-shadow(0 3px 3px rgba(0,0,0,.55))}'+
'#mk .sw{display:block;transform-origin:50% 0;animation:mksw 4.6s ease-in-out infinite alternate;perspective:240px}'+
'#mk .tw{display:block;position:relative;transform-style:preserve-3d;animation:mktw 11s cubic-bezier(.45,0,.25,1) infinite}'+
'#mk .tw svg{display:block;width:100%;height:auto;backface-visibility:hidden;-webkit-backface-visibility:hidden}'+
'#mk .tw svg+svg{position:absolute;left:0;top:0;transform:rotateY(180deg)}'+

'@keyframes mksw{from{transform:rotate(-3.5deg)}to{transform:rotate(3.5deg)}}'+
'@keyframes mktw{0%,62%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}'+
'@media (prefers-reduced-motion:reduce){#mk .sw,#mk .tw{animation:none}}'+
'#mk .fob:focus-visible{outline:2px solid #f3eedf;outline-offset:2px}'+
'#mk .card{position:absolute;left:4px;top:86px;background:#f3eedf;color:#1b1813;box-shadow:0 1px 0 #b9b19c,0 10px 24px rgba(0,0,0,.55);padding:4px 0;display:none;white-space:nowrap}'+
'#mk.on .card{display:block}'+
'#mk .r{display:flex;align-items:baseline;gap:14px;padding:0 16px;min-height:40px;align-items:center;border-top:1px dotted #c8bfa8}'+
'#mk .r:first-child{border-top:0}'+
'#mk .r b{font-weight:400;color:#6d665a;min-width:0}'+
'#mk a{color:#1b1813;text-decoration:none;padding:12px 0;flex:none}'+
'#mk .r>a:first-child{flex:1}'+
'#mk .r b~a{padding:12px 8px;margin:0 -8px}'+
'#mk a:hover,#mk a:focus-visible{color:#8b1e1e;outline:0;text-decoration:underline;text-underline-offset:3px}'+
'#mk a[aria-current]{color:#8b1e1e;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}'+
'@media (max-width:900px){#mk{left:4px}#mk .fob{width:28px;padding:0 8px 4px}#mk .card{top:70px}}'+
'body.on-calque #mk,html[data-prog] #mk,.b-immersion #mk{display:none}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
/* porte-clé de motel en losange, plastique rouge, anneau et clé en laiton ; deux faces pour qu'il tourne sur lui-même */
var svg='<svg viewBox="0 0 34 82" width="34" height="82" aria-hidden="true">'+
'<line x1="17" y1="0" x2="17" y2="7" stroke="#2a2420" stroke-width="2"/>'+
'<circle cx="17" cy="12" r="5.5" fill="none" stroke="#b08a3e" stroke-width="2"/>'+
'<path d="M14 17h6v5h-1v3h-2v-2h-1v4h-2z" fill="#c9a24e" stroke="#7d6128" stroke-width=".6"/>'+
'<path d="M17 26 L32 52 Q33 54 31.5 56 L19 79 Q17 82 15 79 L2.5 56 Q1 54 2 52 Z" fill="#8b1e1e" stroke="#5e1212" stroke-width="1"/>'+
'<path d="M17 31 L28.5 52.5 L17 75 L5.5 52.5 Z" fill="none" stroke="#e9dccb" stroke-width=".8" opacity=".75"/>'+
'<circle cx="17" cy="33" r="2.3" fill="#2a2420"/>'+
'<text x="17" y="55.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="5.6" letter-spacing=".6" fill="#efe3cf">KORHOGO</text>'+
'<path d="M8 30 L17 28 L11 44 Z" fill="#fff" opacity=".12"/></svg>';
var w=document.createElement('div');w.id='mk';
var b=document.createElement('button');b.className='fob';b.type='button';b.setAttribute('aria-expanded','false');
b.innerHTML='<span class="sw"><span class="tw">'+svg+svg+'</span></span>';
var c=document.createElement('nav');c.className='card';
function href(u){return u==='../'?(HALL?'./':B):P+u}
function fill(){try{lang=localStorage.getItem('ik.lang')||lang}catch(e){}var fr=lang==='fr';
 b.setAttribute('aria-label',fr?'Porte-clé du motel : les lieux':'Motel key tag: the places');c.setAttribute('aria-label',fr?'Les lieux du motel':'The motel places');
 c.innerHTML='';L.forEach(function(row){var r=document.createElement('div');r.className='r';
  row.forEach(function(x){var t=fr?x[1]:x[2],e;if(x[0]===null){e=document.createElement('b');e.textContent=t}else{e=document.createElement('a');e.href=href(x[0]);e.textContent=t;if(x[0]===here)e.setAttribute('aria-current','page')}r.appendChild(e)});
  c.appendChild(r)})}
fill();
w.appendChild(b);w.appendChild(c);
function tog(v){w.classList.toggle('on',v);b.setAttribute('aria-expanded',String(v))}
b.addEventListener('click',function(e){e.stopPropagation();var v=!w.classList.contains('on');if(v)fill();tog(v)});
document.addEventListener('click',function(e){if(!w.contains(e.target))tog(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('on')){tog(false);b.focus();e.stopPropagation();e.preventDefault()}},true);
function add(){document.body.appendChild(w);var t=getComputedStyle(document.documentElement).getPropertyValue('--mk-top');if(t)w.style.top=t}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
