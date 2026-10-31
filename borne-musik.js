/* Musik ← DiktatFaune : les cinq derniers sons enregistrés ou traités dans DiktatFaune deviennent cinq pistes, en bas de la grille de Musik.
   DiktatFaune range chaque son (le dernier traitement d'un enregistrement remplace sa version précédente) dans IndexedDB, base « borne », magasin « diktat ».
   Musik lit ces sons à l'ouverture et les joue au pas de la grille, en direct comme dans KAVE IT!. */
(function(){
  var DB='borne',ST='diktat',MAX=5;
  function db(){return new Promise(function(ok,ko){try{var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore(ST,{keyPath:'id'});};r.onsuccess=function(){ok(r.result);};r.onerror=function(){ko(r.error);};}catch(e){ko(e);}});}
  function all(){return db().then(function(d){return new Promise(function(ok){var q=d.transaction(ST).objectStore(ST).getAll();q.onsuccess=function(){ok((q.result||[]).sort(function(a,b){return b.t-a.t;}));};q.onerror=function(){ok([]);};});}).catch(function(){return [];});}
  /* DiktatFaune : un son par enregistrement ; ses traitements (hauteur, vitesse, sens) remplacent la version rangée ; on garde les cinq plus récents */
  function put(clip){return db().then(function(d){return new Promise(function(ok){var tx=d.transaction(ST,'readwrite'),os=tx.objectStore(ST);os.put(clip);
      var q=os.getAll();q.onsuccess=function(){(q.result||[]).sort(function(a,b){return b.t-a.t;}).slice(MAX).forEach(function(x){os.delete(x.id);});};
      tx.oncomplete=function(){ok();try{(window.top||window).dispatchEvent(new Event('borne-diktat'));}catch(e){}};tx.onerror=function(){ok();};});}).catch(function(){});}
  window.__borneDiktat={all:all,put:put,MAX:MAX};

  /* Musik : les pistes DiktatFaune s'ajoutent sous les 18 Masks */
  var CLIPS=[],COL='#ff3b2f';
  function voiceOf(ac,c){ac.__ikDk=ac.__ikDk||{};var b=ac.__ikDk[c.id];if(b)return b;b=ac.createBuffer(1,c.data.length,c.sr);b.getChannelData(0).set(c.data);ac.__ikDk[c.id]=b;return b;}
  function hook(){
    if(typeof window.bbBuildTracks!=='function'||typeof window.bbVoice!=='function'){setTimeout(hook,700);return;}
    if(window.bbBuildTracks.__dk)return;
    var build=window.bbBuildTracks,voice=window.bbVoice;
    window.bbBuildTracks=function(){build.apply(this,arguments);try{var T=window._bbTracks;if(!T)return;
        CLIPS.forEach(function(c){T.push({name:c.name,color:COL,voice:'diktat',clip:c,root:0,steps:[0,0,0,0,0,0,0,0],pitch:null,deg:0});});}catch(e){}};
    window.bbBuildTracks.__dk=1;
    /* un pas joue le son depuis son début, une mesure au plus, avec une courte fin en fondu */
    window.bbVoice=function(ac,vi,time){var tr=window._bbTracks&&window._bbTracks[vi];if(!tr||tr.voice!=='diktat')return voice.apply(this,arguments);
      try{var s=ac.createBufferSource(),g=ac.createGain(),b=voiceOf(ac,tr.clip),len=Math.min(b.duration,60/((window._bbBPM||90)*2)*8);
        s.buffer=b;g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(.8,time+.006);g.gain.setValueAtTime(.8,time+Math.max(.01,len-.06));g.gain.linearRampToValueAtTime(.0001,time+len);
        s.connect(g);g.connect(window.bbOut?window.bbOut(ac):ac.destination);s.start(time);s.stop(time+len+.02);}catch(e){}};
    refresh();addEventListener('borne-diktat',refresh);}
  /* à chaque nouveau son, la grille garde les pas des 18 Masks et des sons déjà là */
  function refresh(){all().then(function(L){var old={};try{(window._bbTracks||[]).forEach(function(t){if(t.voice==='diktat')old[t.clip.id]=t.steps;});}catch(e){}
      CLIPS=L.slice(0,MAX).reverse();var T=window._bbTracks;if(!T)return;
      for(var i=T.length-1;i>=0;i--)if(T[i].voice==='diktat')T.splice(i,1);
      CLIPS.forEach(function(c){T.push({name:c.name,color:COL,voice:'diktat',clip:c,root:0,steps:old[c.id]||[0,0,0,0,0,0,0,0],pitch:null,deg:0});});
      try{if(document.getElementById('bb-grid'))window.bbRender();}catch(e){}});}
  if(window.top===window)hook();
})();
