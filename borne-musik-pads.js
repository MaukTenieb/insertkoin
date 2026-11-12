/* Musik, les pads du sampleur (12 nov. 2026, Mauk Tenieb : « 1c, avec des sons enregistrés depuis diktaTfaune, c'est-à-dire le Kamescope »).
   Seize pads sous la grille : douze coupes des albums de Mauk Tenieb (dépôts Internet Archive, snd/pads, 1,6 s chacune) et quatre sons de la borne (snd), tirés à chaque ouverture.
   Toucher un pad le joue tout de suite ; un appui long l'épingle comme piste de la grille (et le désépingle), à côté des sons de diktaTfaune et du Kamescope ; Kave l'exporte avec le reste. */
(function(){
  var ALB=[['20k368-1','Esiön'],['20k368-2','Esiön'],['cassette-zero1','Cassette Zero'],['cassette-zero2','Cassette Zero'],['interzone-men-at-work-1','Interzone Men at Work'],['interzone-men-at-work-2','Interzone Men at Work'],
    ['mantrajazzininterzone-1','Ritual Jazz in Interzone'],['mantrajazzininterzone-2','Ritual Jazz in Interzone'],['der-golem-1','Der Golem'],['der-golem-2','Der Golem'],['furia-1-1','Furia'],['furia-1-2','Furia'],
    ['tribute-to-miles-davis-1','Tribute to Miles Davis'],['tribute-to-miles-davis-2','Tribute to Miles Davis'],['libri-carolini-1','Libri Carolini'],['libri-carolini-2','Libri Carolini'],['carthago-our-times-1','Carthago, Our Times'],['carthago-our-times-2','Carthago, Our Times']];
  var BRN=[['bell-1','Bell'],['coin-1','Koin'],['clack-1','Clack'],['buzz-1','Buzz'],['relay-7','Relay'],['twang-2','Twang'],['knock-4','Knock'],['neon-2','Neon']];
  var COLA='#ffa726',COLB='#4fc3f7',SET=null,BUF={},PIN={};
  function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function base(){try{if(window.KG&&KG.base)return String(KG.base).replace(/kg-$/,'');}catch(e){}return '';}
  function ac(){var a=window._bbAC;if(!a){try{a=window._bbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(a&&a.state==='suspended')try{a.resume();}catch(e){}return a;}
  function load(p){if(BUF[p.id])return Promise.resolve(BUF[p.id]);var a=ac();if(!a)return Promise.reject();
    return fetch(base()+p.url).then(function(r){return r.arrayBuffer();}).then(function(b){return new Promise(function(ok,ko){a.decodeAudioData(b,ok,ko);});}).then(function(b){BUF[p.id]=b;return b;});}
  function play(p){var a=ac();if(!a)return;load(p).then(function(b){var s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=.85;s.connect(g);g.connect(window.bbOut?window.bbOut(a):a.destination);s.start();}).catch(function(){});}
  /* épingler : la piste prend la voix « diktat » de borne-musik.js (lecture d'un son, export Kave compris) */
  function pin(p,el){var T=window._bbTracks;if(!T)return;var i=-1;for(var k=0;k<T.length;k++)if(T[k].pad===p.id)i=k;
    if(i>=0){T.splice(i,1);delete PIN[p.id];el.classList.remove('pin');try{window.bbRender();}catch(e){}return;}
    load(p).then(function(b){T.push({name:p.name,color:p.col,voice:'diktat',pad:p.id,clip:{id:'pad-'+p.id,name:p.name,data:b.getChannelData(0),sr:b.sampleRate},root:0,steps:[1,0,0,0,0,0,0,0],pitch:null,deg:0});PIN[p.id]=1;el.classList.add('pin');try{window.bbRender();}catch(e){}}).catch(function(){});}
  function build(){var host=document.getElementById('bb-panel'),ctl=document.getElementById('bb-controls');if(!host||!ctl)return;var old=document.getElementById('bb-pads');if(old)old.remove();
    SET=shuf(ALB).slice(0,12).map(function(x){return {id:x[0],url:'snd/pads/'+x[0]+'.mp3',name:x[1],col:COLA};}).concat(shuf(BRN).slice(0,4).map(function(x){return {id:x[0],url:'snd/'+x[0]+'.mp3',name:x[1],col:COLB};}));
    var w=document.createElement('div');w.id='bb-pads';w.setAttribute('role','group');w.setAttribute('aria-label','Pads');
    SET.forEach(function(p){var b=document.createElement('button');b.type='button';b.className='bb-pad';b.style.setProperty('--pc',p.col);b.setAttribute('aria-label',p.name);b.title=p.name;
      var t=document.createElement('span'),ti=document.createElement('i');ti.textContent=p.name;t.appendChild(ti);b.appendChild(t);if(PIN[p.id])b.classList.add('pin');
      var lt=0,tm=0;b.addEventListener('pointerdown',function(e){e.preventDefault();play(p);b.classList.add('hit');lt=0;tm=setTimeout(function(){lt=1;pin(p,b);},480);});
      ['pointerup','pointerleave','pointercancel'].forEach(function(ev){b.addEventListener(ev,function(){clearTimeout(tm);b.classList.remove('hit');});});
      b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(e.shiftKey)pin(p,b);else play(p);}});
      w.appendChild(b);});
    host.insertBefore(w,ctl);
    /* 10 nov. (Mauk Tenieb) : un nom trop long pour sa case défile sur place, en téléprompteur */
    setTimeout(function(){[].forEach.call(w.querySelectorAll('.bb-pad span'),function(sp){var i=sp.firstChild,dx=i.scrollWidth-sp.clientWidth;if(dx>2){sp.classList.add('tp');sp.style.setProperty('--dx',(-dx-6)+'px');sp.style.setProperty('--tt',Math.max(3,dx/14)+'s');}});},60);}
  var st=document.createElement('style');st.textContent='#bb-pads{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;width:100%;max-width:520px;margin:4px 0}'+
    '.bb-pad{position:relative;min-height:44px;border-radius:5px;border:1px solid color-mix(in srgb,var(--pc) 55%,transparent);background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--pc) 22%,#0b0908),#0b0908 75%);color:var(--pc);font:9px "DM Mono",monospace;letter-spacing:.04em;overflow:hidden;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;transition:transform .06s,box-shadow .12s}'+
    '.bb-pad span{position:absolute;left:3px;right:3px;bottom:3px;white-space:nowrap;overflow:hidden;opacity:.8}.bb-pad span i{font-style:normal;display:inline-block}.bb-pad span.tp i{animation:bbtp var(--tt,4s) ease-in-out infinite alternate}@keyframes bbtp{0%,15%{transform:none}85%,100%{transform:translateX(var(--dx))}}@media (prefers-reduced-motion:reduce){.bb-pad span.tp i{animation:none}}'+
    '.bb-pad.hit{transform:translateY(1px) scale(.97);box-shadow:0 0 14px color-mix(in srgb,var(--pc) 70%,transparent),inset 0 0 12px color-mix(in srgb,var(--pc) 45%,transparent)}'+
    '.bb-pad.pin{border-color:var(--pc);box-shadow:inset 0 0 0 2px var(--pc)}'+
    '@media (max-width:520px){#bb-pads{grid-template-columns:repeat(4,1fr)}}';
  document.head.appendChild(st);
  /* à chaque ouverture du panneau, un nouveau tirage */
  var was=false;setInterval(function(){var p=document.getElementById('bb-panel'),on=!!p&&getComputedStyle(p).display!=='none';if(on&&!was)build();was=on;},400);
})();
