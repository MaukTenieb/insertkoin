/* Borne Insert Koin — les sons de la mécanique.
   Sons enregistrés, domaine public (CC0 ou marque du domaine public) : la liste, les sources et les retouches sont dans snd/SOURCES.md.
   Le premier geste ouvre le son ; les fichiers de snd/ se chargent alors, en Ogg Opus, ou en MP3 quand le navigateur refuse l'Opus.
   Chaque coup tire une prise au hasard parmi plusieurs, avec un écart de hauteur (± 4 %) et de volume.
   Interrupteurs qui basculent et claquent, butée de la manette (coups de bobine d'un flipper), ressort, crans des molettes,
   pièce qui roule dans un téléphone public et tombe dans le godet de métal, TILT au ronfleur secteur, claquement des loquets de métal ;
   la machine s'allume comme un flipper électromécanique, ronronne (ventilateur et transformateur à 50 Hz) et s'échauffe un peu quand on joue.
   Tant qu'un fichier manque, la synthèse Web Audio d'origine joue à sa place. Le bouton FX de la porte coupe tout. */
(function(){
  var C=null,M=null,hum=null,heat=0,R=Math.random;
  function on(){try{return !window.__ikFx||window.__ikFx.on();}catch(e){return true;}}
  function ctx(){if(!on())return null;if(!C){try{C=new (window.AudioContext||window.webkitAudioContext)();M=C.createGain();M.gain.value=.9*(window.__borneVol==null?1:window.__borneVol);M.connect(C.destination);}catch(e){return null;}setTimeout(load,0);}
    if(C.state==='suspended')C.resume();return C;}
  function j(v,p){return v*(1+(R()*2-1)*(p||.08));}
  function env(g,t,a,d,peak){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);}
  var NB=null;function nbuf(c){if(NB)return NB;NB=c.createBuffer(1,c.sampleRate*.5,c.sampleRate);var d=NB.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=R()*2-1;return NB;}
  function noise(c,t,type,f,q,a,d,peak){var s=c.createBufferSource();s.buffer=nbuf(c);s.playbackRate.value=j(1,.2);var fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    var g=c.createGain();env(g,t,a,d,peak);s.connect(fl);fl.connect(g);g.connect(M);s.start(t,R()*.3);s.stop(t+a+d+.05);}
  function osc(c,t,type,f,f2,a,d,peak,ph){var o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+a+d);
    var g=c.createGain();env(g,t,a,d,peak);if(ph){var p=c.createStereoPanner?c.createStereoPanner():null;if(p){p.pan.value=ph;o.connect(g);g.connect(p);p.connect(M);}else{o.connect(g);g.connect(M);}}else{o.connect(g);g.connect(M);}
    o.start(t+R()*.004);o.stop(t+a+d+.05);}
  function warm(x){heat=Math.min(1,heat+x);}

  /* les prises enregistrées : nom -> nombre de variantes dans snd/ */
  var SND={press:5,release:6,tick:4,detent:9,knock:4,twang:5,coin:3,drop:4,buzz:4,thump:2,suck:2,clack:5,power:1,hum:1},
      HUM_LOOP=12,HUM_AT=.1,B={},last={},loading=false,t0=0,
      ST=window.__borneSonCharge={ok:0,ko:0,fmt:''},
      BASE=(function(){try{return new URL('snd/',document.currentScript&&document.currentScript.src||location.href).href;}catch(e){return 'snd/';}})();
  function fmt(){try{var a=document.createElement('audio');return a.canPlayType&&a.canPlayType('audio/ogg; codecs="opus"')?'ogg':'mp3';}catch(e){return 'mp3';}}
  function decode(c,ab){return new Promise(function(ok,ko){var p=c.decodeAudioData(ab,ok,ko);if(p&&p.then)p.then(ok,ko);});}
  function get(c,f,x){return fetch(BASE+f+'.'+x).then(function(r){if(!r.ok)throw r.status;return r.arrayBuffer();}).then(function(ab){return decode(c,ab);});}
  function load(){if(loading||!C)return;loading=true;t0=Date.now();ST.fmt=fmt();
    Object.keys(SND).forEach(function(k){for(var i=1;i<=SND[k];i++)(function(f){
      get(C,f,ST.fmt).catch(function(){return ST.fmt==='ogg'?get(C,f,'mp3'):Promise.reject();})
        .then(function(b){(B[k]=B[k]||[]).push(b);ST.ok++;if(k==='hum')humSwap();if(k==='power'&&Date.now()-t0<3000)play('power',.22);})
        .catch(function(){ST.ko++;});})(k+'-'+i);});}
  /* une prise au hasard (jamais deux fois la même de suite), hauteur et volume légèrement tirés ; rend le gain, ou null si rien n'est chargé */
  function play(k,g,t,rate){var c=C,a=B[k];if(!c||!a||!a.length||!on())return null;var i=Math.floor(R()*a.length);if(a.length>1&&i===last[k])i=(i+1)%a.length;last[k]=i;
    var s=c.createBufferSource(),gn=c.createGain();s.buffer=a[i];s.playbackRate.value=(rate||1)*j(1,.04);gn.gain.value=g*j(1,.12);s.connect(gn);gn.connect(M);s.start(t||c.currentTime);return gn;}

  /* la synthèse d'origine, qui joue tant que la prise manque */
  var Y={
    press:function(c,t){osc(c,t,'sine',j(120),j(70),.002,.09,.22);noise(c,t,'lowpass',j(900,.3),.8,.001,.06,.18);noise(c,t+.004,'bandpass',j(4200,.2),3,.0005,.012,.08);},
    release:function(c,t){noise(c,t,'bandpass',j(3600,.25),4,.0005,.01,.09);osc(c,t+.01,'triangle',j(260),j(180),.001,.035,.05);},
    tick:function(c,t){noise(c,t,'highpass',j(5000,.2),1,.0005,.008,.07);},
    detent:function(c,t){noise(c,t,'bandpass',j(2600,.25),6,.0005,.012,.1);},
    knock:function(c,t,f){noise(c,t,'lowpass',j(700,.3),1,.001,.07,.25*f);osc(c,t,'square',j(95),j(60),.001,.05,.05*f);noise(c,t+.003,'bandpass',j(3000,.3),5,.0005,.015,.08*f);},
    twang:function(c,t,x){var f=j(230+Math.abs(x||1)*90,.12);
      var o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type='sine';o.frequency.value=f;l.frequency.value=j(17,.3);lg.gain.value=f*.04;l.connect(lg);lg.connect(o.frequency);
      env(g,t,.003,.38,.07);o.connect(g);g.connect(M);o.start(t);l.start(t);o.stop(t+.45);l.stop(t+.45);noise(c,t,'bandpass',j(1800,.3),8,.001,.05,.05);},
    coin:function(c,t){[2093,3389,4790].forEach(function(f,i){osc(c,t+i*.002,'sine',j(f,.03),0,.001,j(.5,.2)/(i+1),.07/(i+1),(R()*2-1)*.3);});},
    drop:function(c,t){var n=3+Math.floor(R()*3);for(var i=0;i<n;i++){var u=t+.05+i*j(.06,.4)*(1-i*.12);noise(c,u,'bandpass',j(3200,.3),9,.0005,.02,.09*(1-i*.15));}
      osc(c,t+.05+n*.06,'sine',j(150),j(80),.002,.12,.18);},
    buzz:function(c,t){/* le TILT : un bourdon de relais, le tremblé du solénoïde */
      var o=c.createOscillator(),g=c.createGain(),tr=c.createOscillator(),tg=c.createGain();o.type='sawtooth';o.frequency.value=j(110,.04);tr.frequency.value=j(22,.2);tg.gain.value=.05;tr.connect(tg);tg.connect(g.gain);
      var fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=j(1400,.2);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.08,t+.02);g.gain.setValueAtTime(.08,t+.62);g.gain.exponentialRampToValueAtTime(.0001,t+.9);
      o.connect(fl);fl.connect(g);g.connect(M);o.start(t);tr.start(t);o.stop(t+.95);tr.stop(t+.95);
      for(var i=0;i<4;i++)noise(c,t+i*j(.13,.25),'bandpass',j(2400,.3),4,.0005,.03,.12);},
    thump:function(c,t){noise(c,t,'lowpass',j(260,.2),1,.004,.5,.35);osc(c,t,'sine',j(55),j(32),.004,.55,.3);},
    suck:function(c,t){var s=c.createBufferSource();s.buffer=nbuf(c);var fl=c.createBiquadFilter();fl.type='bandpass';fl.Q.value=3;fl.frequency.setValueAtTime(j(400),t);fl.frequency.exponentialRampToValueAtTime(j(2600),t+.16);
      var g=c.createGain();env(g,t,.06,.12,.08);s.connect(fl);fl.connect(g);g.connect(M);s.start(t);s.stop(t+.25);},
    clack:function(c,t){noise(c,t,'bandpass',j(1700,.25),3,.0008,.03,.16);osc(c,t,'sine',j(180),j(110),.001,.06,.1);}
  };
  /* la prise, sinon la synthèse */
  function hit(k,g,t,a){if(!play(k,g,t))Y[k](C,t,a);}
  var S={
    press:function(){var c=ctx();if(!c)return;hit('press',.32,c.currentTime);warm(.05);},
    release:function(){var c=ctx();if(!c)return;hit('release',.2,c.currentTime);},
    tick:function(){var c=ctx();if(!c)return;hit('tick',.14,c.currentTime);},
    detent:function(n){var c=ctx();if(!c)return;var t=c.currentTime;for(var i=0;i<(n||3);i++)hit('detent',.18,t+i*j(.045,.3));},
    knock:function(f){var c=ctx();if(!c)return;f=f||.6;var t=c.currentTime;if(!play('knock',.42*f,t,.94+.1*f))Y.knock(c,t,f);warm(.08*f);},
    twang:function(x){var c=ctx();if(!c)return;var t=c.currentTime;if(!play('twang',.16,t,1+(Math.min(2,Math.abs(x||1))-1)*.06))Y.twang(c,t,x);},
    coin:function(){var c=ctx();if(!c)return;hit('coin',.22,c.currentTime);warm(.04);},
    drop:function(){var c=ctx();if(!c)return;var t=c.currentTime;if(!play('drop',.24,t+.05))Y.drop(c,t);},
    tilt:function(){var c=ctx();if(!c)return;var t=c.currentTime,g=play('buzz',.16,t);
      if(g){var v=g.gain.value;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.setValueAtTime(v,t+.62);g.gain.exponentialRampToValueAtTime(.0001,t+.9);}else Y.buzz(c,t);
      hit('thump',.45,t+.7);warm(.3);},
    suck:function(){var c=ctx();if(!c)return;hit('suck',.12,c.currentTime);},
    clack:function(){var c=ctx();if(!c)return;hit('clack',.28,c.currentTime);}
  };
  S.vol=function(v){if(M)M.gain.value=.9*v;};
  window.__borneSon=S;
  /* la machine s'échauffe : un ronronnement très bas (ventilateur et secteur), qui monte un peu quand on joue et retombe ensuite.
     En attendant la boucle enregistrée, les deux sinus d'origine tiennent la place. */
  function humSwap(){if(!hum||hum.src||!B.hum)return;var c=C,b=B.hum[0],s=c.createBufferSource();s.buffer=b;s.loop=true;
    if(b.duration>=HUM_AT+HUM_LOOP){s.loopStart=HUM_AT;s.loopEnd=HUM_AT+HUM_LOOP;}s.connect(hum.g);s.start(c.currentTime,HUM_AT);hum.src=s;
    if(hum.o){try{hum.o.stop();hum.o2.stop();}catch(e){}hum.o=hum.o2=null;}}
  function startHum(){var c=ctx();if(!c||hum)return;var g=c.createGain();g.gain.value=0;g.connect(M);hum={g:g};
    if(B.hum)humSwap();
    else{var o=c.createOscillator(),o2=c.createOscillator(),fl=c.createBiquadFilter();o.type='sine';o.frequency.value=50;o2.type='sine';o2.frequency.value=100.3;
      fl.type='lowpass';fl.frequency.value=180;o.connect(fl);o2.connect(fl);fl.connect(g);o.start();o2.start();hum.o=o;hum.o2=o2;}
    setInterval(function(){if(!hum||!C)return;var t=C.currentTime,lv;
      if(hum.src){lv=on()?.02+heat*.06:0;hum.src.playbackRate.setTargetAtTime(1+heat*.015+(R()-.5)*.004,t,.8);}
      else{lv=on()?.004+heat*.018:0;if(hum.o2)hum.o2.frequency.setTargetAtTime(100+(R()-.5)*.8+heat*1.5,t,.8);}
      hum.g.gain.setTargetAtTime(lv,t,.4);heat*=.94;},250);}
  var first=true;
  /* les gestes */
  function closest(e,s){return e.target&&e.target.closest?e.target.closest(s):null;}
  document.addEventListener('pointerdown',function(e){if(first){first=false;startHum();amb();}
    var k=closest(e,'.b-panel .cab, .b-row2 .menu a, .b-slot, .b-badge, .b-land, .b-lore, #koins, .b-boom');if(!k)return;
    if(k.matches('.b-panel .cab, .b-row2 .menu a')){S.press();k.classList.remove('b-up');k.classList.add('b-down');}
    else if(k.matches('.b-boom')){}
    else S.tick();},true);
  function up(e){document.querySelectorAll('.b-down').forEach(function(k){k.classList.remove('b-down');void k.offsetWidth;k.classList.add('b-up');setTimeout(function(){k.classList.remove('b-up');},420);S.release();});}
  document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
  document.addEventListener('click',function(e){var kb=closest(e,'.b-knob');if(kb){S.detent(2+Math.floor(R()*3));kb.classList.remove('b-cran');void kb.offsetWidth;kb.classList.add('b-cran');}if(closest(e,'.b-boom'))S.tilt();if(closest(e,'.b-slot')){S.coin();setTimeout(S.drop,380);}},true);

  /* l'ambiance électrique (Mauk Tenieb, 30 oct. : « des sons de moteur, de fréquences électriques »), synthétisée, zéro fichier :
     le transformateur ronfle à 50 Hz et ses harmoniques, saturé comme une tôle qui vibre ; le ventilateur souffle et respire ;
     le tube siffle à 15 734 Hz ; de rares crépitements ; au lancement d'un programme, le relais claque et la bobine de démagnétisation tonne.
     Très bas ; l'interrupteur FX et le volume de la borne le règlent comme le reste. */
  var A=null;
  function amb(){var c=ctx();if(!c||A)return;A={};var g=c.createGain();g.gain.value=0;g.connect(M);A.g=g;
    /* transformateur */
    var tg=c.createGain();tg.gain.value=.011;var sh=c.createWaveShaper(),cv=new Float32Array(1024);for(var i=0;i<1024;i++){var x=i/511.5-1;cv[i]=Math.tanh(2.4*x);}sh.curve=cv;
    var bp=c.createBiquadFilter();bp.type='lowpass';bp.frequency.value=520;[[50,.55],[100,1],[150,.38],[200,.22],[300,.1]].forEach(function(h){var o=c.createOscillator(),og=c.createGain();o.frequency.value=h[0]*(1+(R()-.5)*.002);og.gain.value=h[1]*.35;o.connect(og);og.connect(sh);o.start();});
    sh.connect(bp);bp.connect(tg);tg.connect(g);A.tg=tg;
    /* ventilateur */
    var nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=nb.getChannelData(0),l=0;for(var k=0;k<d.length;k++){l=(l+.02*(R()*2-1))/1.02;d[k]=l*3.5;}
    var ns=c.createBufferSource();ns.buffer=nb;ns.loop=true;var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=480;var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=70;
    var fg=c.createGain();fg.gain.value=.05;var lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.23;lg.gain.value=.015;lfo.connect(lg);lg.connect(fg.gain);lfo.start();
    ns.connect(lp);lp.connect(hp);hp.connect(fg);fg.connect(g);ns.start();
    /* le sifflement du tube */
    var w=c.createOscillator(),wg=c.createGain();w.frequency.value=15734;wg.gain.value=.0012;w.connect(wg);wg.connect(g);w.start();
    /* crépitements rares */
    (function pop(){setTimeout(function(){if(C&&on()&&!document.hidden){var t=C.currentTime;var s=C.createBufferSource();s.buffer=nbuf(C);var f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=j(3200,.4);f.Q.value=2;var e=C.createGain();env(e,t,.0005,j(.012,.5),j(.03,.5));s.connect(f);f.connect(e);e.connect(g);s.start(t,R()*.3);s.stop(t+.05);}pop();},7000+R()*18000);})();
    setInterval(function(){if(!C)return;var t=C.currentTime;g.gain.setTargetAtTime(on()?1:0,t,.3);tg.gain.setTargetAtTime(.011+heat*.02,t,.6);},400);}
  /* relais et démagnétisation au lancement d'un programme */
  S.degauss=function(){var c=ctx();if(!c||!A)return;var t=c.currentTime+.02;hit('clack',.2,t);
    var o=c.createOscillator(),f=c.createBiquadFilter(),e=c.createGain(),m=c.createOscillator(),mg=c.createGain();o.type='square';o.frequency.value=50;f.type='lowpass';f.frequency.value=260;
    m.frequency.value=j(7,.2);mg.gain.value=.03;m.connect(mg);mg.connect(e.gain);e.gain.setValueAtTime(0,t+.05);e.gain.linearRampToValueAtTime(.075,t+.07);e.gain.exponentialRampToValueAtTime(.0001,t+.95);
    o.connect(f);f.connect(e);e.connect(M);o.start(t+.05);m.start(t+.05);o.stop(t+1);m.stop(t+1);warm(.15);};
  new MutationObserver(function(){if(document.documentElement.dataset.prog)S.degauss();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-prog']});
})();
