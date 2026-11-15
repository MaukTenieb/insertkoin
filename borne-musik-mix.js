/* borne-musik-mix.js — le poste de mix de Musik : deux platines, son et vidéo, un fondu entre les deux.
   15 nov. 2026, 20 h 25 (Mauk Tenieb : « si on double-clique sur le 33 tours faiseur de scratches et de retours en arrière y compris pour les vidéos,
   que ça ouvre un autre endroit avec 2 platines de mix pour musique et pour vidéos »).
   Chaque platine reçoit un son ou une vidéo de la Kave ; le disque se saisit pour scratcher, en avant et en arrière, image comprise ;
   la tirette du milieu passe d'une platine à l'autre, pour le son comme pour l'image. Pictogrammes seuls, zéro texte d'aide. */
(function(){'use strict';
if(window.MusikMix)return;
var REV=1.8; /* un tour de disque = 1,8 s, comme la platine de Musik */
var CSS=
'.mzmix{position:absolute;inset:0;z-index:60;display:grid;grid-template-columns:minmax(0,1fr) minmax(112px,.42fr) minmax(0,1fr);grid-template-rows:minmax(0,1.05fr) minmax(0,1fr) auto;grid-template-areas:"scr scr scr" "da mx db" "lib lib lib";gap:10px;padding:12px;'+
 'background:radial-gradient(ellipse 70% 55% at 50% 0%,#2c241b,#0d0b09 72%);border-radius:8px;box-shadow:inset 0 0 0 1px #000;color:#efe3cf;font:500 12px/1.2 "Barlow Semi Condensed",Arial,sans-serif;animation:mzmixIn .32s cubic-bezier(.16,1,.3,1)}'+
'@keyframes mzmixIn{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:none}}'+
'.mzmix *{box-sizing:border-box}'+
'.mzmix .mxscr{grid-area:scr;position:relative;min-height:0;border-radius:10px/12px;background:#050505;box-shadow:inset 0 0 0 2px #000,inset 0 0 24px rgba(0,0,0,.9),0 2px 0 rgba(255,255,255,.04);overflow:hidden}'+
'.mzmix .mxscr canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}'+
'.mzmix .mxscr::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px),radial-gradient(ellipse at 50% 40%,transparent 55%,rgba(0,0,0,.55))}'+
'.mzmix .mxdeck{position:relative;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 26px;grid-template-rows:minmax(0,1fr) auto;gap:6px;padding:8px;border-radius:7px;background:linear-gradient(#2a241d,#1a1612);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 2px 6px rgba(0,0,0,.6)}'+
'.mzmix .mxdeck.on{box-shadow:inset 0 0 0 1px rgba(255,167,38,.7),0 2px 6px rgba(0,0,0,.6)}'+
'.mzmix .mxdeck.a{grid-area:da}.mzmix .mxdeck.b{grid-area:db}'+
'.mzmix .mxtt{width:100%;height:100%;min-height:0;object-fit:contain;touch-action:none;cursor:grab;display:block}'+
'.mzmix .mxpitch{writing-mode:vertical-lr;direction:rtl;width:22px;height:100%;min-height:60px;accent-color:#ffa726;margin:0;justify-self:center}'+
'.mzmix .mxrow{grid-column:1 / -1;display:flex;gap:6px;align-items:center;min-width:0}'+
'.mzmix button{flex:none;width:36px;height:32px;border:0;border-radius:4px;background:linear-gradient(#3b332a,#262019);color:#efe3cf;display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 2px rgba(0,0,0,.7)}'+
'.mzmix button svg{width:18px;height:18px}'+
'.mzmix button.on{background:linear-gradient(#ffb547,#e08a12);color:#1a0e00}'+
'.mzmix button:focus-visible,.mzmix input:focus-visible{outline:2px solid #ffa726;outline-offset:2px}'+
'.mzmix .mxlcd{flex:1;min-width:0;height:24px;border-radius:3px;background:#0b0f08;box-shadow:inset 0 0 0 1px #000;color:#9ad86a;font:400 14px/24px VT323,monospace;letter-spacing:.06em;white-space:nowrap;overflow:hidden;padding:0 6px;text-shadow:0 0 6px rgba(154,216,106,.55)}'+
'.mzmix .mxlcd i{font-style:normal;display:inline-block}.mzmix .mxlcd.tp i{animation:mxtp var(--tt,6s) linear 1s infinite alternate}@keyframes mxtp{to{transform:translateX(var(--dx,0))}}'+
'.mzmix .mxmix{grid-area:mx;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto minmax(0,1fr) auto;gap:8px;padding:8px;border-radius:7px;background:linear-gradient(#24201a,#15120f);box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 2px 6px rgba(0,0,0,.6);justify-items:center}'+
'.mzmix .mxmix .mxback{grid-column:1 / -1;justify-self:start}'+
'.mzmix .mxfad{writing-mode:vertical-lr;direction:rtl;width:24px;height:100%;min-height:60px;accent-color:#ffa726;margin:0}'+
'.mzmix .mxvu{grid-row:2;width:6px;height:100%;border-radius:2px;background:#0b0f08;position:relative;overflow:hidden}'+
'.mzmix .mxx{grid-column:1 / -1;width:100%;accent-color:#ffa726;margin:0}'+
'.mzmix .mxlib{grid-area:lib;display:flex;gap:6px;overflow-x:auto;overscroll-behavior:contain;padding:2px 2px 6px;scrollbar-color:#5a4a36 transparent}'+
'#mz .mzmix .mxlib button{width:auto!important;max-width:170px;height:30px;padding:0 10px 0 8px!important;gap:6px;display:flex!important;align-items:center;background:linear-gradient(#efe3cf,#d8c9ad)!important;color:#1a1209!important;font:700 11px/1 "Barlow Semi Condensed",Arial,sans-serif!important;white-space:nowrap;overflow:hidden;opacity:1!important}#mz .mzmix .mxlib button svg{width:14px;height:14px;flex:none;color:#3a2a18}'+
'.mzmix .mxlib button i{flex:none;width:6px;height:16px;border-radius:2px;background:var(--c)}'+
'.mzmix .mxlib button span{overflow:hidden;text-overflow:clip}'+
'@media (max-width:760px),(orientation:portrait){.mzmix{position:fixed;z-index:9000;padding-bottom:max(8px,env(safe-area-inset-bottom));grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,.8fr) minmax(0,1fr) auto auto;grid-template-areas:"scr scr" "da db" "mx mx" "lib lib";gap:8px;padding:8px}'+
 '.mzmix .mxmix{grid-template-columns:auto 1fr auto;grid-template-rows:auto;align-items:center}.mzmix .mxmix .mxback{grid-column:auto}.mzmix .mxfad{writing-mode:horizontal-tb;direction:ltr;height:auto;min-height:0;width:70px}.mzmix .mxvu{display:none}.mzmix .mxx{grid-column:auto}.mzmix button{width:44px;height:40px}.mzmix .mxrow{flex-wrap:wrap}.mzmix .mxlcd{order:-1;flex:1 1 100%}.mzmix .mxmix{grid-template-columns:auto 1fr 1fr;grid-template-areas:"bk fa fb" "x x x"}.mzmix .mxmix .mxback{grid-area:bk}.mzmix .mxmix>div:nth-of-type(1){grid-area:fa}.mzmix .mxmix>div:nth-of-type(2){grid-area:fb}.mzmix .mxx{grid-area:x}.mzmix .mxfad{width:100%}.mzmix .mxlib button{height:40px}}';
var IC={
 play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
 pause:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor"/><rect x="14" y="5" width="4" height="14" fill="currentColor"/></svg>',
 rev:'<svg viewBox="0 0 24 24"><path d="M10 6 4 12l6 6M4 12h11a5 5 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 cue:'<svg viewBox="0 0 24 24"><path d="M6 5v14M10 12l9-6v12z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
 back:'<svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 son:'<svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 4V6L7 10z" fill="currentColor"/></svg>',
 vid:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 10 5-3v10l-5-3z" fill="currentColor"/></svg>'};
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function img(u,B){var i=new Image();i.src=B()+u;return i}

window.MusikMix={open:function(host,M){
  if(!document.getElementById('mzmix-css')){var st=el('style');st.id='mzmix-css';st.textContent=CSS;document.head.appendChild(st)}
  var old=host.querySelector('.mzmix');if(old)return old.__api;
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  var FR=M.FR,c=M.ac(),G=c&&M.graph(c),TI={deck:img('a-tt-platine.webp',M.base),disc:img('a-tt-disque.webp',M.base),arm:img('a-tt-bras.webp',M.base)};
  var root=el('div','mzmix');root.setAttribute('role','dialog');root.setAttribute('aria-label','Mix');
  var scr=el('div','mxscr'),sc=el('canvas');sc.width=640;sc.height=360;scr.appendChild(sc);root.appendChild(scr);var sx=sc.getContext('2d');
  var X=.5,alive=true,armed=0;
  function deck(side){var D={side:side,buf:null,rev:null,vid:null,name:'',pos:0,pitch:0,motor:false,back:false,hold:false,src:null,last:0,lastA:0,ang:0,arm:0,fader:.9,g:null};
    if(c){D.g=c.createGain();D.an=c.createAnalyser();D.an.fftSize=256;D.g.connect(D.an);D.g.connect(G.out)}
    var box=el('div','mxdeck '+(side?'b':'a')),cv=el('canvas','mxtt');cv.width=cv.height=512;cv.setAttribute('aria-label',FR?'Disque : saisir pour scratcher':'Record: grab to scratch');
    var pi=el('input','mxpitch');pi.type='range';pi.min=-16;pi.max=16;pi.step=.1;pi.value=0;pi.setAttribute('aria-label','Pitch');
    var row=el('div','mxrow'),bp=el('button',null,IC.play),br=el('button',null,IC.rev),bc=el('button',null,IC.cue),lcd=el('div','mxlcd','<i>—</i>');
    bp.type=br.type=bc.type='button';bp.setAttribute('aria-label','Play');br.setAttribute('aria-label',FR?'À l\'envers':'Reverse');bc.setAttribute('aria-label',FR?'Retour au début':'Back to start');
    row.appendChild(bp);row.appendChild(br);row.appendChild(bc);row.appendChild(lcd);box.appendChild(cv);box.appendChild(pi);box.appendChild(row);
    D.box=box;D.cv=cv;D.x=cv.getContext('2d');D.lcd=lcd;D.bp=bp;
    function rate(){return 1+D.pitch/100}
    D.len=function(){return D.buf?D.buf.duration:(D.vid&&D.vid.duration)||0};
    D.stop=function(){if(D.src){try{D.src.stop()}catch(e){}D.src=null}D.motor=false;bp.innerHTML=IC.play;bp.classList.remove('on')};
    D.start=function(){D.last=performance.now();D.motor=true;bp.innerHTML=IC.pause;bp.classList.add('on');if(!c||!D.buf)return;var s=c.createBufferSource(),L=D.buf.duration;s.buffer=D.back?D.rev:D.buf;s.playbackRate.value=rate();s.connect(D.g);
      var off=D.back?Math.max(0,Math.min(L-.01,L-D.pos)):Math.min(D.pos,L-.01);s.start(c.currentTime,off);D.src=s;s.onended=function(){if(D.src===s){D.src=null;if(!D.hold)D.stop()}}};
    D.grain=function(r,dur){if(!c||!D.buf)return;var fwd=r>=0,b=fwd?D.buf:D.rev,L=D.buf.duration,off=fwd?D.pos:L-D.pos;if(off<0||off>=L)return;var s=c.createBufferSource(),g=c.createGain(),t=c.currentTime,q=Math.max(.05,Math.min(4,Math.abs(r)));
      s.buffer=b;s.playbackRate.value=q;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.004);g.gain.setValueAtTime(.9,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.012);s.connect(g);g.connect(D.g);s.start(t,off,Math.min(L-off,q*(dur+.02)))};
    D.sync=function(){var v=D.vid;if(!v||!v.duration||v.readyState<1)return;var w=Math.max(0,Math.min(v.duration-.04,D.pos));
      try{if(D.motor&&!D.hold&&!D.back){v.playbackRate=Math.max(.0625,Math.min(4,rate()));if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}if(Math.abs(v.currentTime-w)>.25&&!v.seeking)v.currentTime=w}
      else{if(!v.paused)v.pause();if(Math.abs(v.currentTime-w)>.03&&!v.seeking)v.currentTime=w}}catch(e){}};
    D.setName=function(n){D.name=n;lcd.classList.remove('tp');lcd.innerHTML='<i></i>';lcd.firstChild.textContent=n||'—';requestAnimationFrame(function(){var w=lcd.firstChild.scrollWidth-lcd.clientWidth+12;if(w>4){lcd.classList.add('tp');lcd.style.setProperty('--dx',-w+'px');lcd.style.setProperty('--tt',Math.max(4,w/16)+'s')}})};
    D.load=function(it){D.stop();D.pos=0;D.ang=0;if(D.vid){try{D.vid.pause();D.vid.removeAttribute('src');D.vid.load()}catch(e){}D.vid=null}D.buf=null;D.rev=null;D.setName(it.name);
      function setBuf(b){if(!b||!c)return;D.buf=b;var r=c.createBuffer(b.numberOfChannels,b.length,b.sampleRate);for(var k=0;k<b.numberOfChannels;k++){var d=b.getChannelData(k),o=r.getChannelData(k);for(var i=0;i<d.length;i++)o[i]=d[d.length-1-i]}D.rev=r}
      if(it.kind==='vid'){var u=it.file||M.base()+it.url,v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';if(!it.file)v.crossOrigin='anonymous';v.src=u;D.vid=v;
        /* le son de la vidéo, décodé, se scratche avec l'image */if(c)fetch(u).then(function(r){return r.arrayBuffer()}).then(function(a){return new Promise(function(ok,ko){c.decodeAudioData(a,ok,ko)})}).then(function(b){if(D.vid===v)setBuf(b)}).catch(function(){})}
      else if(it.buf)setBuf(it.buf);else M.load(it).then(setBuf).catch(function(){})};
    bp.onclick=function(){if(D.motor)D.stop();else D.start();arm(side)};
    br.onclick=function(){D.back=!D.back;br.classList.toggle('on',D.back);br.setAttribute('aria-pressed',String(D.back));if(D.motor){D.stop();D.start()}};
    bc.onclick=function(){var was=D.motor;D.stop();D.pos=0;D.ang=0;if(was)D.start()};
    pi.oninput=function(){D.pitch=+pi.value;if(D.src)D.src.playbackRate.value=rate()};
    function ang(e){var r=cv.getBoundingClientRect(),s=Math.min(r.width,r.height),ox=r.left+(r.width-s)/2,oy=r.top+(r.height-s)/2;return Math.atan2(e.clientY-oy-s*485.5/1024,e.clientX-ox-s*396.5/1024)}
    cv.addEventListener('pointerdown',function(e){e.preventDefault();arm(side);try{cv.setPointerCapture(e.pointerId)}catch(_){}D.wasMotor=D.motor;if(D.src){try{D.src.stop()}catch(_){}D.src=null}D.hold=true;D.lastA=ang(e);D.last=performance.now();cv.style.cursor='grabbing'});
    cv.addEventListener('pointermove',function(e){if(!D.hold)return;var a=ang(e),d=a-D.lastA;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;var now=performance.now(),dt=Math.max(.008,(now-D.last)/1000);
      D.lastA=a;D.last=now;D.ang+=d;var dp=d/(Math.PI*2)*REV;if(Math.abs(dp)>1e-4){D.grain(dp/dt,dt);var L=D.len();D.pos=Math.max(0,L?Math.min(L-.01,D.pos+dp):0)}});
    function rel(){if(!D.hold)return;D.hold=false;cv.style.cursor='';if(D.wasMotor)D.start()}
    cv.addEventListener('pointerup',rel);cv.addEventListener('pointercancel',rel);
    D.draw=function(now){var x=D.x,W=cv.width,k=W/1024;
      if(D.motor&&!D.hold){var dt=Math.max(0,(now-D.last)/1000),rr=rate()*(D.back?-1:1),L=D.len();D.last=Math.max(now,D.last);D.ang+=dt*rr/REV*Math.PI*2;D.pos+=dt*rr;if(L&&((rr>0&&D.pos>=L)||(rr<0&&D.pos<=0))){D.pos=Math.max(0,Math.min(L,D.pos));D.stop()}}
      D.sync();x.clearRect(0,0,W,W);if(TI.deck.complete&&TI.deck.naturalWidth)x.drawImage(TI.deck,0,0,W,W);else{x.fillStyle='#2b2620';x.fillRect(0,0,W,W)}
      x.save();x.translate(396.5*k,485.5*k);x.rotate(D.ang);var dr=255*k;if(TI.disc.complete&&TI.disc.naturalWidth)x.drawImage(TI.disc,-dr,-dr,dr*2,dr*2);
      if(D.buf||D.vid){x.fillStyle=D.vid?'rgba(143,227,212,.85)':'rgba(200,36,58,.85)';x.beginPath();x.arc(0,0,dr*.3,0,7);x.fill();x.fillStyle='#0e0d0c';x.beginPath();x.arc(0,0,6*k,0,7);x.fill()}x.restore();
      var on=(D.buf||D.vid)&&(D.hold||D.motor),L2=D.len(),pr=L2?Math.max(0,Math.min(1,D.pos/L2)):0,tg=on?(26+14*pr)*Math.PI/180:0;D.arm+=(tg-D.arm)*.12;
      if(TI.arm.complete&&TI.arm.naturalWidth){x.save();x.translate(785*k,330*k);x.rotate(D.arm);x.drawImage(TI.arm,(687-785)*k,(348-330)*k,TI.arm.naturalWidth*k,TI.arm.naturalHeight*k);x.restore()}};
    return D}
  var A=deck(0),B=deck(1),DK=[A,B];root.appendChild(A.box);
  /* la table de mixage : deux voies et la tirette */
  var mx=el('div','mxmix'),bk=el('button','mxback',IC.back);bk.type='button';bk.setAttribute('aria-label',FR?'Retour à Musik':'Back to Musik');mx.appendChild(bk);
  var fa=[0,1].map(function(i){var f=el('input','mxfad');f.type='range';f.min=0;f.max=1;f.step=.01;f.value=.9;f.setAttribute('aria-label',(FR?'Voie ':'Channel ')+(i?'B':'A'));f.oninput=function(){DK[i].fader=+f.value;gains()};return f});
  var vu=[0,1].map(function(){var v=el('div','mxvu','<b style="position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(0deg,#5bd15b,#ffd23f 70%,#ff4a2a)"></b>');return v});
  var xf=el('input','mxx');xf.type='range';xf.min=0;xf.max=1;xf.step=.005;xf.value=.5;xf.setAttribute('aria-label',FR?'Tirette A ↔ B':'Crossfader A ↔ B');xf.oninput=function(){X=+xf.value;gains()};
  var col=[el('div'),el('div')];col.forEach(function(d,i){d.style.cssText='display:flex;gap:6px;height:100%;min-height:0;align-items:stretch';d.appendChild(fa[i]);d.appendChild(vu[i]);mx.appendChild(d)});mx.appendChild(xf);
  root.appendChild(mx);root.appendChild(B.box);
  function xg(i){return i?Math.sin(X*Math.PI/2):Math.cos(X*Math.PI/2)}
  function gains(){DK.forEach(function(D,i){if(D.g)D.g.gain.setTargetAtTime(D.fader*xg(i)*1.15,c.currentTime,.015)})}gains();
  function arm(i){armed=i;DK.forEach(function(D,j){D.box.classList.toggle('on',j===i)})}arm(0);
  /* la Kave : sons et vidéos ; une touche charge la platine choisie, puis la main passe à l'autre */
  var lib=el('div','mxlib');root.appendChild(lib);
  function libDraw(){lib.innerHTML='';M.lib().filter(function(it){return !it.kind||it.kind==='vid'}).forEach(function(it){var b=el('button',null,'<i></i>'+(it.kind==='vid'?IC.vid:IC.son)+'<span></span>');b.type='button';b.lastChild.textContent=it.name;b.title=it.name;b.style.setProperty('--c',it.col||'#ffa726');
    b.onclick=function(){DK[armed].load(it);arm(1-armed)};lib.appendChild(b)})}
  libDraw();
  host.appendChild(root);
  function close(){alive=false;DK.forEach(function(D){D.stop();if(D.vid){try{D.vid.pause()}catch(e){}}try{D.g&&D.g.disconnect()}catch(e){}});root.remove();removeEventListener('keydown',key)}
  function key(e){if(e.key==='Escape'){e.preventDefault();close()}}addEventListener('keydown',key);bk.onclick=close;
  var buf=new Uint8Array(128);
  function frame(now){if(!alive||!document.body.contains(root))return;requestAnimationFrame(frame);A.draw(now);B.draw(now);
    /* l'écran : l'image de A et celle de B, mêlées selon la tirette */
    var W=sc.width,H=sc.height;sx.fillStyle='#000';sx.fillRect(0,0,W,H);
    DK.forEach(function(D,i){var v=D.vid,a=xg(i);if(!v||v.readyState<2||a<.01)return;var r=Math.min(W/v.videoWidth,H/v.videoHeight),w=v.videoWidth*r,h=v.videoHeight*r;sx.globalAlpha=i?Math.min(1,a*a*1.4):1;sx.drawImage(v,(W-w)/2,(H-h)/2,w,h)});sx.globalAlpha=1;
    DK.forEach(function(D,i){if(!D.an)return;D.an.getByteTimeDomainData(buf);var m=0;for(var k=0;k<buf.length;k++)m=Math.max(m,Math.abs(buf[k]-128));vu[i].firstChild.style.height=Math.min(100,m/1.1)+'%'})}
  requestAnimationFrame(frame);
  var api={close:close,decks:DK,libDraw:libDraw};root.__api=api;return api}};
})();
