/* Le porte-clé du motel : les cinq lieux d'Insert Koin (hall, chambre, vidéoclub, bureau), au même coin de chaque page.
   Décision de Mauk Tenieb, 8 nov. 2026 : les univers sont les lieux d'un même motel. */
(function(){
if(window.top!==window.self||document.getElementById('mk'))return;
var lang='fr';try{lang=localStorage.getItem('ik.lang')||(/^fr/.test(navigator.language)?'fr':'en')}catch(e){}
var B=/github\.io$/.test(location.hostname)?'https://mauktenieb.github.io/insertkoin/':'../';
var here=(location.pathname.split('/').pop()||'').replace(/\?.*/,'');
/* dans la borne (hall), les lieux sont dans habillages/ ; le porte-clé se retire pendant un programme */
var HALL=!/\/habillages\//.test(location.pathname),P=HALL?'habillages/':'';if(HALL)here='../';
var L=[
 ['../',          'Hall · borne d’arcade','Lobby · arcade cabinet'],
 ['tv.html',      'Chambre · télévision','Room · television'],
 ['dvd.html',     'Chambre · lecteur DVD','Room · DVD player'],
 ['videoclub.html','Vidéoclub','Video store'],
 ['kos.html',     'Bureau · ordinateur','Office · computer']];
var css='#mk{position:fixed;left:14px;top:0;z-index:2147483000;font:13px/1.35 "Courier New",Courier,monospace;-webkit-tap-highlight-color:transparent}'+
'#mk .fob{display:block;width:34px;cursor:pointer;background:none;border:0;padding:0 5px 4px;box-sizing:content-box;filter:drop-shadow(0 3px 3px rgba(0,0,0,.55));transform-origin:50% 0;transition:transform .2s}'+
'#mk .fob:hover{transform:rotate(-6deg)}'+
'#mk .fob:focus-visible{outline:2px solid #f3eedf;outline-offset:2px}'+
'#mk .card{position:absolute;left:2px;top:84px;min-width:236px;background:#f3eedf;color:#1b1813;border:1px solid #b9b19c;box-shadow:0 8px 22px rgba(0,0,0,.6);padding:10px 0 8px;display:none}'+
'#mk.on .card{display:block}'+
'#mk .card a{display:block;padding:6px 14px;color:#1b1813;text-decoration:none;border-top:1px dotted #c8bfa8}'+
'#mk .card a:first-child{border-top:0}'+
'#mk .card a:hover,#mk .card a:focus{background:#e4dcc6;outline:0}'+
'#mk .card a.cur{color:#8b1e1e}'+
'#mk .card a.cur::after{content:" ◀"}'+
'#mk .fob svg{width:100%;height:auto;display:block}'+
'@media (max-width:900px){#mk{left:4px}#mk .fob{width:28px;padding:0 8px 4px}#mk .card{top:66px}}'+
'body.on-calque #mk,html[data-prog] #mk,.b-immersion #mk{display:none}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
/* porte-clé de motel en losange, plastique rouge, anneau et clé en laiton */
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
var b=document.createElement('button');b.className='fob';b.type='button';b.setAttribute('aria-haspopup','true');b.setAttribute('aria-expanded','false');
b.setAttribute('aria-label',lang==='fr'?'Porte-clé du motel : les lieux':'Motel key tag: the places');b.innerHTML=svg;
var c=document.createElement('nav');c.className='card';c.setAttribute('aria-label',lang==='fr'?'Les lieux du motel':'The motel places');
function fill(){try{lang=localStorage.getItem('ik.lang')||lang}catch(e){}c.innerHTML='';L.forEach(function(x){var a=document.createElement('a');a.href=x[0]==='../'?(HALL?'./':B):P+x[0];a.textContent=lang==='fr'?x[1]:x[2];if(x[0]===here)a.className='cur';c.appendChild(a)})}fill();
w.appendChild(b);w.appendChild(c);
function tog(v){w.classList.toggle('on',v);b.setAttribute('aria-expanded',String(v))}
b.addEventListener('click',function(e){e.stopPropagation();var v=!w.classList.contains('on');if(v)fill();tog(v)});
document.addEventListener('click',function(e){if(!w.contains(e.target))tog(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('on')){tog(false);b.focus();e.stopPropagation();e.preventDefault()}},true);
function add(){document.body.appendChild(w);var t=getComputedStyle(document.documentElement).getPropertyValue('--mk-top');if(t)w.style.top=t}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
