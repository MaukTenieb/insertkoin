/* borne-musik-mix.js — le poste de mix de Musik : deux platines, son et vidéo, un fondu entre les deux.
   15 nov. 2026, 20 h 25 (Mauk Tenieb : « si on double-clique sur le 33 tours faiseur de scratches et de retours en arrière y compris pour les vidéos,
   que ça ouvre un autre endroit avec 2 platines de mix pour musique et pour vidéos »).
   Chaque platine reçoit un son ou une vidéo de la Kave ; le disque se saisit pour scratcher, en avant et en arrière, image comprise ;
   la tirette du milieu passe d'une platine à l'autre, pour le son comme pour l'image. Pictogrammes seuls, zéro texte d'aide. */
(function(){'use strict';
if(window.MusikMix)return;
var REV=1.8; /* un tour de disque = 1,8 s, comme la platine de Musik */
function CSS_(B){return (
'.mzmix{position:absolute;inset:0;z-index:60;display:grid;grid-template-columns:minmax(0,1fr) minmax(112px,.42fr) minmax(0,1fr);grid-template-rows:minmax(0,1.05fr) minmax(0,1fr) auto;grid-template-areas:"scr scr scr" "da mx db" "lib lib lib";gap:10px;padding:12px;'+
 'background:#0b0908 url('+B+'kave/a/mix/table.webp) center/cover no-repeat;border-radius:8px;box-shadow:inset 0 0 0 1px #000;color:#efe3cf;font:500 12px/1.2 "Barlow Semi Condensed",Arial,sans-serif;animation:mzmixIn .32s cubic-bezier(.16,1,.3,1)}'+
'@keyframes mzmixIn{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:none}}'+
'.mzmix *{box-sizing:border-box}'+
'.mzmix .mxscr{grid-area:scr;position:relative;min-height:0}'+
'.mzmix .mxtv{position:absolute;inset:0;margin:auto;height:100%;width:auto;max-width:100%;max-height:100%;aspect-ratio:880/690;background:url('+B+'kave/a/mix/tv.webp) center/100% 100% no-repeat;filter:drop-shadow(0 10px 14px rgba(0,0,0,.75))}'+
/* la vitre du téléviseur : x 17,2 %, y 16,2 %, 67,6 % × 67,1 % de la photo */
'.mzmix .mxtv canvas{position:absolute;left:17.2%;top:16.2%;width:67.6%;height:67.1%;border-radius:9%/11%;background:#050505}'+
'.mzmix .mxtv::after{content:"";position:absolute;left:17.2%;top:16.2%;width:67.6%;height:67.1%;border-radius:9%/11%;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.2) 0 1px,transparent 1px 3px),radial-gradient(ellipse at 40% 30%,rgba(255,255,255,.07),transparent 45%),radial-gradient(ellipse at 50% 50%,transparent 58%,rgba(0,0,0,.6))}'+
'.mzmix .mxdeck{position:relative;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 26px;grid-template-rows:minmax(0,1fr) auto;gap:6px;padding:8px;border-radius:7px;background:rgba(14,11,8,.35);box-shadow:none}'+
'.mzmix .mxdeck.on{box-shadow:inset 0 0 0 1px rgba(255,167,38,.55)}'+
'.mzmix .mxdeck.a{grid-area:da}.mzmix .mxdeck.b{grid-area:db}'+
'.mzmix .mxtt{width:100%;height:100%;min-height:0;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.7));touch-action:none;cursor:grab;display:block}'+
'.mzmix .mxpitch{position:relative;width:26px;height:100%;min-height:60px;justify-self:center;touch-action:none;cursor:grab;background:linear-gradient(90deg,transparent 11px,#0c0a08 11px,#0c0a08 15px,transparent 15px),repeating-linear-gradient(0deg,transparent 0 9px,rgba(230,220,200,.35) 9px 10px) center/16px 100% no-repeat}'+'.mzmix .mxpitch img{position:absolute;left:-3px;width:32px;height:18px;transform:translateY(-50%);pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.7))}.mzmix .mxpitch:focus-visible{outline:2px solid #ffa726;outline-offset:2px}'+
'.mzmix .mxrow{grid-column:1 / -1;display:flex;gap:6px;align-items:center;min-width:0}'+
'.mzmix button{flex:none;width:36px;height:32px;border:0;border-radius:4px;background:linear-gradient(#3b332a,#262019);color:#efe3cf;display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 1px 2px rgba(0,0,0,.7)}'+
'.mzmix button svg{width:18px;height:18px}'+
'.mzmix button.on{background:linear-gradient(#ffb547,#e08a12);color:#1a0e00}'+
'.mzmix button:focus-visible,.mzmix input:focus-visible{outline:2px solid #ffa726;outline-offset:2px}'+
'.mzmix .mxlcd{flex:1;min-width:0;height:24px;border-radius:3px;background:#0b0f08;box-shadow:inset 0 0 0 1px #000;color:#9ad86a;font:400 14px/24px VT323,monospace;letter-spacing:.06em;white-space:nowrap;overflow:hidden;padding:0 6px;text-shadow:0 0 6px rgba(154,216,106,.55)}'+
'.mzmix .mxlcd i{font-style:normal;display:inline-block}.mzmix .mxlcd.tp i{animation:mxtp var(--tt,6s) linear 1s infinite alternate}@keyframes mxtp{to{transform:translateX(var(--dx,0))}}'+
'.mzmix .mxmix{grid-area:mx;min-height:0;position:relative}'+
/* la table de mixage photographiée (640 × 601) ; glissières, tirette et aiguilles posées sur ses repères */
'.mzmix .mxpan{position:absolute;inset:0;margin:auto;height:100%;width:auto;max-width:100%;max-height:100%;aspect-ratio:640/601;background:url('+B+'kave/a/mix/mixer.webp) center/100% 100% no-repeat;filter:drop-shadow(0 8px 12px rgba(0,0,0,.7))}'+
'.mzmix .mxpan canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'+
'.mzmix .mxf{position:absolute;touch-action:none;cursor:grab}.mzmix .mxf img{position:absolute;pointer-events:none;filter:drop-shadow(0 3px 2px rgba(0,0,0,.7))}'+
'.mzmix .mxf.v{top:29.3%;height:36.6%;width:13%;transform:translateX(-50%)}.mzmix .mxf.v img{left:6.7%;width:86.5%;height:18.6%;transform:translateY(-50%)}'+
'.mzmix .mxf.x{top:78.7%;height:12.3%;left:36.25%;width:27.8%}.mzmix .mxf.x img{top:0;height:100%;width:21.4%;transform:translateX(-50%)}'+
'.mzmix .mxf:focus-visible{outline:2px solid #ffa726;outline-offset:2px}'+
'.mzmix .mxback{position:absolute;left:12px;top:12px;z-index:3}'+
'.mzmix .mxlib{grid-area:lib;display:flex;gap:6px;overflow-x:auto;overscroll-behavior:contain;padding:2px 2px 6px;scrollbar-color:#5a4a36 transparent}'+
'#mz .mzmix .mxlib button{width:auto!important;max-width:170px;height:30px;padding:0 10px 0 8px!important;gap:6px;display:flex!important;align-items:center;background:linear-gradient(#efe3cf,#d8c9ad)!important;color:#1a1209!important;font:700 11px/1 "Barlow Semi Condensed",Arial,sans-serif!important;white-space:nowrap;overflow:hidden;opacity:1!important}#mz .mzmix .mxlib button svg{width:14px;height:14px;flex:none;color:#3a2a18}'+
'.mzmix .mxlib button i{flex:none;width:6px;height:16px;border-radius:2px;background:var(--c)}'+
'.mzmix .mxlib button span{overflow:hidden;min-width:0;white-space:nowrap}.mzmix .mxlib span i{font-style:normal;display:inline-block}.mzmix .mxlib span.tp i{animation:mxtp var(--tt,6s) linear 1s infinite alternate}'+
'@media (max-width:760px),(orientation:portrait){.mzmix{position:fixed;z-index:9000;padding-bottom:max(8px,env(safe-area-inset-bottom));grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,.7fr) minmax(0,.9fr) minmax(0,.9fr) auto;grid-template-areas:"scr scr" "da db" "mx mx" "lib lib";gap:8px;padding:8px}'+
 '.mzmix button{width:44px;height:40px}.mzmix .mxrow{flex-wrap:wrap}.mzmix .mxlcd{order:-1;flex:1 1 100%}.mzmix .mxmix{grid-template-columns:auto 1fr 1fr;grid-template-areas:"bk fa fb" "x x x"}.mzmix .mxmix .mxback{grid-area:bk}.mzmix .mxmix>div:nth-of-type(1){grid-area:fa}.mzmix .mxmix>div:nth-of-type(2){grid-area:fb}.mzmix .mxx{grid-area:x}.mzmix .mxfad{width:100%}.mzmix .mxlib button{height:40px}}');}
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
  if(!document.getElementById('mzmix-css')){var st=el('style');st.id='mzmix-css';st.textContent=CSS_(M.base());document.head.appendChild(st)}
  var old=host.querySelector('.mzmix');if(old)return old.__api;
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  var FR=M.FR,c=M.ac(),G=c&&M.graph(c),TI={deck:img('a-tt-platine.webp',M.base),disc:img('a-tt-disque.webp',M.base),arm:img('a-tt-bras.webp',M.base)};
  var root=el('div','mzmix');root.setAttribute('role','dialog');root.setAttribute('aria-label','Mix');
  var scr=el('div','mxscr'),tv=el('div','mxtv'),sc=el('canvas');sc.width=560;sc.height=420;tv.appendChild(sc);scr.appendChild(tv);root.appendChild(scr);var sx=sc.getContext('2d');
  var X=.5,alive=true,armed=0;
  function deck(side){var D={side:side,buf:null,rev:null,vid:null,name:'',pos:0,pitch:0,motor:false,back:false,hold:false,src:null,last:0,lastA:0,ang:0,arm:0,fader:.9,g:null};
    if(c){D.g=c.createGain();D.an=c.createAnalyser();D.an.fftSize=256;D.g.connect(D.an);D.g.connect(G.out)}
    var box=el('div','mxdeck '+(side?'b':'a')),cv=el('canvas','mxtt');cv.width=cv.height=512;cv.setAttribute('aria-label',FR?'Disque : saisir pour scratcher':'Record: grab to scratch');
    var pi=el('div','mxpitch'),pim=el('img');pim.src=M.base()+'kave/a/mix/cap-v.webp';pim.alt='';pi.appendChild(pim);pi.tabIndex=0;pi.setAttribute('role','slider');pi.setAttribute('aria-label','Pitch');
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
    function pset(v){D.pitch=Math.max(-16,Math.min(16,v));pim.style.top=((16-D.pitch)/32*100)+'%';pi.setAttribute('aria-valuenow',D.pitch.toFixed(1));if(D.src)D.src.playbackRate.value=rate()}pset(0);function pat(e){var r=pi.getBoundingClientRect();return 16-32*(e.clientY-r.top)/r.height}pi.addEventListener('pointerdown',function(e){e.preventDefault();try{pi.setPointerCapture(e.pointerId)}catch(_){}pi.__d=1;pset(pat(e))});pi.addEventListener('pointermove',function(e){if(pi.__d)pset(pat(e))});pi.addEventListener('pointerup',function(){pi.__d=0});pi.addEventListener('dblclick',function(){pset(0)});pi.addEventListener('keydown',function(e){var d={ArrowUp:.5,ArrowDown:-.5}[e.key];if(d){e.preventDefault();pset(D.pitch+d)}});
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
  var mx=el('div','mxmix'),pan=el('div','mxpan'),bk=el('button','mxback',IC.back);bk.type='button';bk.setAttribute('aria-label',FR?'Retour à Musik':'Back to Musik');root.appendChild(bk);
  var nv=el('canvas');pan.appendChild(nv);mx.appendChild(pan);
  /* glissière : la main saisit le capuchon et le fait courir dans la fente ; flèches du clavier au pas de 5 % */
  function slider(cls,left,cap,val,label,set,vert){var z=el('div','mxf '+cls);z.tabIndex=0;z.setAttribute('role','slider');z.setAttribute('aria-label',label);z.setAttribute('aria-valuemin','0');z.setAttribute('aria-valuemax','100');if(left!=null)z.style.left=left;
    var im=el('img');im.src=M.base()+'kave/a/mix/'+cap;im.alt='';z.appendChild(im);var v=val;
    function put(x){v=Math.max(0,Math.min(1,x));if(vert)im.style.top=((1-v)*100)+'%';else im.style.left=(v*100)+'%';z.setAttribute('aria-valuenow',String(Math.round(v*100)));set(v)}
    function at(e){var r=z.getBoundingClientRect();return vert?1-(e.clientY-r.top)/r.height:(e.clientX-r.left)/r.width}
    z.addEventListener('pointerdown',function(e){e.preventDefault();try{z.setPointerCapture(e.pointerId)}catch(_){}z.__d=1;put(at(e))});
    z.addEventListener('pointermove',function(e){if(z.__d)put(at(e))});function up(){z.__d=0}z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up);
    z.addEventListener('keydown',function(e){var d={ArrowUp:.05,ArrowRight:.05,ArrowDown:-.05,ArrowLeft:-.05}[e.key];if(d){e.preventDefault();put(v+d)}});put(v);pan.appendChild(z);return z}
  slider('v','28.75%','cap-v.webp',.9,(FR?'Voie ':'Channel ')+'A',function(v){A.fader=v;gains()},true);
  slider('v','71.72%','cap-v.webp',.9,(FR?'Voie ':'Channel ')+'B',function(v){B.fader=v;gains()},true);
  slider('x',null,'cap-x.webp',.5,FR?'Tirette A ↔ B':'Crossfader A ↔ B',function(v){X=v;gains()},false);
  /* aiguilles des deux vumètres : pivots à (17,5 % ; 22,6 %) et (40,6 % ; 22,5 %), cadrans de 19 % de large */
  var VU=[{x:.175,y:.226,l:.12,r:.098,lo:.111,hi:.225,ex:.29},{x:.406,y:.225,l:.351,r:.098,lo:.111,hi:.225,ex:.52}],nd=[-.7,-.7];
  root.appendChild(mx);root.appendChild(B.box);
  function xg(i){return i?Math.sin(X*Math.PI/2):Math.cos(X*Math.PI/2)}
  function gains(){DK.forEach(function(D,i){if(D.g)D.g.gain.setTargetAtTime(D.fader*xg(i)*1.15,c.currentTime,.015)})}gains();
  function arm(i){armed=i;DK.forEach(function(D,j){D.box.classList.toggle('on',j===i)})}arm(0);
  /* la Kave : sons et vidéos ; une touche charge la platine choisie, puis la main passe à l'autre */
  var lib=el('div','mxlib');root.appendChild(lib);
  function libDraw(){lib.innerHTML='';M.lib().filter(function(it){return !it.kind||it.kind==='vid'}).forEach(function(it){var b=el('button',null,'<i></i>'+(it.kind==='vid'?IC.vid:IC.son)+'<span></span>');b.type='button';b.lastChild.textContent=it.name;b.title=it.name;b.style.setProperty('--c',it.col||'#ffa726');
    b.onclick=function(){DK[armed].load(it);arm(1-armed)};lib.appendChild(b)});
    /* titre trop long pour sa touche : il défile sur place (règle du 10 nov.) */requestAnimationFrame(function(){[].forEach.call(lib.querySelectorAll('span'),function(sp){var w=sp.scrollWidth-sp.clientWidth;if(w>3){sp.innerHTML='<i>'+sp.innerHTML+'</i>';sp.classList.add('tp');sp.style.setProperty('--dx',-(w+6)+'px');sp.style.setProperty('--tt',Math.max(4,w/14)+'s')}})})}
  libDraw();
  host.appendChild(root);
  function close(){alive=false;DK.forEach(function(D){D.stop();if(D.vid){try{D.vid.pause()}catch(e){}}try{D.g&&D.g.disconnect()}catch(e){}});root.remove();removeEventListener('keydown',key)}
  function key(e){if(e.key==='Escape'){e.preventDefault();close()}}addEventListener('keydown',key);bk.onclick=close;
  var buf=new Uint8Array(128);
  function frame(now){if(!alive||!document.body.contains(root))return;requestAnimationFrame(frame);A.draw(now);B.draw(now);
    /* l'écran : l'image de A et celle de B, mêlées selon la tirette */
    var W=sc.width,H=sc.height;sx.fillStyle='#000';sx.fillRect(0,0,W,H);
    DK.forEach(function(D,i){var v=D.vid,a=xg(i);if(!v||v.readyState<2||a<.01)return;var r=Math.min(W/v.videoWidth,H/v.videoHeight),w=v.videoWidth*r,h=v.videoHeight*r;sx.globalAlpha=i?Math.min(1,a*a*1.4):1;sx.drawImage(v,(W-w)/2,(H-h)/2,w,h)});sx.globalAlpha=1;
    var pw=nv.clientWidth,ph=nv.clientHeight;if(pw&&(nv.width!==pw||nv.height!==ph)){nv.width=pw;nv.height=ph}var nx=nv.getContext('2d');nx.clearRect(0,0,nv.width,nv.height);
    DK.forEach(function(D,i){var m=0;if(D.an){D.an.getByteTimeDomainData(buf);for(var k=0;k<buf.length;k++)m=Math.max(m,Math.abs(buf[k]-128))}
      var tg=-.7+Math.min(1.4,m/90*1.4);nd[i]+=(tg-nd[i])*(tg>nd[i]?.35:.08);var q=VU[i],W=nv.width,H=nv.height;
      nx.save();nx.beginPath();nx.rect(q.l*W,q.lo*H,(q.ex-q.l)*W,(q.hi-q.lo)*H);nx.clip();nx.strokeStyle='#1b1712';nx.lineWidth=Math.max(1,W/420);nx.beginPath();nx.moveTo(q.x*W,q.y*H);
      var L=q.r*W*1.2;nx.lineTo(q.x*W+Math.sin(nd[i])*L,q.y*H-Math.cos(nd[i])*L);nx.stroke();nx.restore()})}
  requestAnimationFrame(frame);
  var api={close:close,decks:DK,libDraw:libDraw};root.__api=api;return api}};
})();
