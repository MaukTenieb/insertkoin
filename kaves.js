/* kaves.js — the registry of the Kaves and artefacts of Insert Koin, and of their names.
   21 Nov. 2026 (Mauk Tenieb): Kaves and artefacts carry several names, drawn at random; each name has its own address,
   https://mauktenieb.github.io/insertkoin/<name>/, which opens the Kave under that name. MiniTale keeps one name and one address.
   A visit keeps the name it drew (sessionStorage) until the tab closes; an address with ?kn=<name> sets the name.
   Code: MIT. Korhogo material (names, marks, lore): all rights reserved. */
(function(){
  var K={
    arkade:   {names:['Arkade','Arkane','Insert Koin'], url:'?hall=1'},
    tv:       {names:['TVHS','KombinaTV','Korhogo TV','TVCR'], url:'kave/tv.html'},
    kamera:   {names:['Kamera','Kamescope','Kamcorder','VCR','KamOrhogo','KeremaKam'], url:'?p=photo'},
    videoklub:{names:['VideoKave','VideoKlub'], url:'kave/videoclub.html'},
    desk:     {names:['Kalabass','Komptoir','Desk','KorhoDesk'], url:'kave/korhodesk/'},
    wiki:     {names:['FauxRhogo','KalabWiki','Weaky','WigWiki','Kerema'], url:'kave/wiki.html'},
    minitale: {names:['MiniTale'], url:'/3615/'}
  };
  var store=function(){try{return window.sessionStorage}catch(e){return null}}();
  function kaveName(id){
    var k=K[id];if(!k)return '';
    var q=null;try{q=new URLSearchParams(location.search).get('kn')}catch(e){}
    if(q&&k.names.indexOf(q)>=0){try{store&&store.setItem('kn.'+id,q)}catch(e){}return q}
    var s=null;try{s=store&&store.getItem('kn.'+id)}catch(e){}
    if(s&&k.names.indexOf(s)>=0)return s;
    var n=k.names[Math.floor(Math.random()*k.names.length)];
    try{store&&store.setItem('kn.'+id,n)}catch(e){}
    return n;
  }
  window.KAVES=K;window.kaveName=kaveName;
  /* any element marked data-kn="<id>" shows the drawn name; <html data-kt="<id>"> sets the page title */
  function fill(){[].forEach.call(document.querySelectorAll('[data-kn]'),function(e){var n=kaveName(e.getAttribute('data-kn'));if(n){if(e.getAttribute('data-kn-up')!=null)n=n.toUpperCase();e.textContent=n}});
    var t=document.documentElement.getAttribute('data-kt'),w=document.documentElement.getAttribute('data-kt-was');
    if(t&&w){var nm=kaveName(t),re=new RegExp('(^|[^A-Za-z])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z])');
      var fix=function(){if(re.test(document.title))document.title=document.title.replace(re,function(m,p){return p+nm})};fix();
      /* a place that rewrites its own title (the sign of the TV) keeps the drawn name */
      var el=document.querySelector('title');if(el&&window.MutationObserver)new MutationObserver(fix).observe(el,{childList:true,characterData:true,subtree:true});}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fill);else fill();
})();
