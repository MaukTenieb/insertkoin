/* FotoFauna dans la borne : l'écran et le logo déclenchent ; la caméra avant ou arrière ; trois façons de prendre.
   UNE : la prise devient l'image, la caméra se ferme (comme avant).
   SUPERPOSER : chaque prise se fond dans les précédentes (moyenne des poses), la pile reste visible en fantôme sur le viseur ; ✓ la termine.
   PELLICULE : chaque prise part à part sur le disque et dans la bande du bas ; la caméra reste ouverte ; une vignette ouvre sa photo.
   99 poses au plus, par pile comme par pellicule. Les noms du code de la page (CAM, shoot, stopCam, setSource…) restent ceux de fotofauna.html. */
(function(){
  var $=function(i){return document.getElementById(i);};
  var fr=(document.documentElement.lang||'fr').slice(0,2)==='fr';
  var L=fr?{one:'Une',stack:'Superposer',roll:'Pellicule',flip:'Caméra avant ou arrière',done:'Terminer la pile',trig:'Déclencher'}
          :{one:'One',stack:'Stack',roll:'Roll',flip:'Front or back camera',done:'Finish the stack',trig:'Shutter'};
  var get=function(k,d){try{var v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}},set=function(k,v){try{localStorage.setItem(k,v);}catch(e){}};
  /* par défaut, la caméra arrière (générale) ; le dernier choix du visiteur est gardé */
  window.__ffFacing=get('borne.ff.facing2','environment');window.__ffMirror=window.__ffFacing==='user';
  var MODE=get('borne.ff.mode','one'),MAX=99,ACC=null,N=0,ROLL=[];
  var row=$('shutterRow'),stage=$('stage');if(!row||!stage||typeof shoot!=='function')return;

  /* ---------- le logo, déclencheur ---------- */
  var logo=document.querySelector('header .logo');
  if(logo){logo.classList.add('ff-trig');logo.setAttribute('role','button');logo.tabIndex=0;logo.setAttribute('aria-label',L.trig);
    var fire=function(){if(CAM)$('shutter').click();else $('bShoot').click();};
    logo.addEventListener('click',fire);logo.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fire();}});
    var sync=function(){var s=$('shutter');logo.classList.toggle('live',!!CAM);logo.classList.toggle('vid',s.classList.contains('vid'));logo.classList.toggle('rec',s.classList.contains('rec'));};
    new MutationObserver(sync).observe($('shutter'),{attributes:true,attributeFilter:['class']});new MutationObserver(sync).observe(row,{attributes:true,attributeFilter:['hidden']});sync();}

  /* ---------- les commandes de prise : UNE · SUPERPOSER · PELLICULE ; avant / arrière ; ✓ ---------- */
  var modes=document.createElement('div');modes.className='pvMode ff-modes';modes.setAttribute('role','group');
  [['one',L.one],['stack',L.stack],['roll',L.roll]].forEach(function(m){var b=document.createElement('button');b.type='button';b.dataset.ff=m[0];b.textContent=m[1];
    b.onclick=function(){if(MODE==='stack'&&N&&m[0]!=='stack')finish();MODE=m[0];set('borne.ff.mode',MODE);paint();};modes.appendChild(b);});
  var flip=document.createElement('button');flip.type='button';flip.className='key ff-flip';flip.setAttribute('aria-label',L.flip);flip.title=L.flip;flip.textContent='⇄';
  flip.onclick=function(){window.__ffFacing=window.__ffFacing==='user'?'environment':'user';window.__ffMirror=window.__ffFacing==='user';set('borne.ff.facing2',window.__ffFacing);
    if(CAM){if(MODE==='stack'&&N)return;stopCam();$('bShoot').click();}paint();};
  var done=document.createElement('button');done.type='button';done.className='key ff-done';done.setAttribute('aria-label',L.done);done.title=L.done;done.innerHTML='✓ <b></b>';done.hidden=true;
  done.onclick=function(){finish();};
  row.insertBefore(modes,row.querySelector('.advance'));row.appendChild(flip);row.appendChild(done);
  var ghost=document.createElement('canvas');ghost.className='ff-ghost';ghost.hidden=true;stage.appendChild(ghost);
  var strip=document.createElement('div');strip.className='ff-strip';strip.hidden=true;stage.appendChild(strip);
  function paint(){[].forEach.call(modes.children,function(b){b.setAttribute('aria-pressed',String(b.dataset.ff===MODE));});
    var vid=typeof PVMODE!=='undefined'&&PVMODE==='video';modes.hidden=vid;
    done.hidden=!(MODE==='stack'&&N);done.querySelector('b').textContent=N?'×'+N:'';
    ghost.hidden=!(CAM&&MODE==='stack'&&N);strip.hidden=!ROLL.length||MODE!=='roll';flip.classList.toggle('back',window.__ffFacing!=='user');}
  new MutationObserver(paint).observe(row,{attributes:true,attributeFilter:['hidden']});
  var pv=$('pvMode');if(pv)pv.addEventListener('click',function(){setTimeout(paint,0);});

  /* ---------- la prise ---------- */
  function frame(){var v=CAM.v,c=FF.util.canvas(v.videoWidth,v.videoHeight),g=c.getContext('2d');if(window.__ffMirror){g.translate(c.width,0);g.scale(-1,1);}g.drawImage(v,0,0);return c;}
  function flash(){var fx=$('flashFx');fx.hidden=false;fx.style.opacity=1;setTimeout(function(){fx.style.opacity=0;setTimeout(function(){fx.hidden=true;},300);},60);}
  async function open(c){var keep=S.stack.concat(S.cur?[S.cur]:[]),img=FF.util.fromCanvas(c);pushHist();await setSource(img,true);S.stack=keep.filter(function(x){return x.id!=='__baked';});
    THUMBS.clear();drawLayers();drawGrid();render();return img;}
  function placeGhost(){var vw=$('view');if(!vw)return;ghost.style.left=vw.offsetLeft+'px';ghost.style.top=vw.offsetTop+'px';ghost.style.width=vw.offsetWidth+'px';ghost.style.height=vw.offsetHeight+'px';}
  async function finish(){if(!ACC||!N){ACC=null;N=0;paint();return;}var c=ACC;ACC=null;N=0;if(CAM)stopCam();var img=await open(c);saveRaw(img);paint();}
  window.shoot=async function(){if(!CAM)return;var c=frame();flash();
    if(MODE==='stack'){
      if(!ACC||ACC.width!==c.width||ACC.height!==c.height){ACC=FF.util.canvas(c.width,c.height);N=0;}
      var g=ACC.getContext('2d');N++;g.globalAlpha=1/N;g.drawImage(c,0,0);g.globalAlpha=1;
      ghost.width=ACC.width;ghost.height=ACC.height;ghost.getContext('2d').drawImage(ACC,0,0);placeGhost();paint();
      if(N>=MAX)finish();return;}
    if(MODE==='roll'){
      var img=FF.util.fromCanvas(c);saveRaw(img);if(ROLL.length>=MAX)ROLL.shift();
      var t=document.createElement('canvas'),k=96/Math.max(c.width,c.height);t.width=Math.round(c.width*k);t.height=Math.round(c.height*k);t.getContext('2d').drawImage(c,0,0,t.width,t.height);
      var b=document.createElement('button');b.type='button';b.className='ff-shot';b.appendChild(t);var span=document.createElement('span');b.appendChild(span);
      var item={c:c,b:b};ROLL.push(item);b.onclick=function(){if(CAM)stopCam();open(item.c);};
      strip.appendChild(b);while(strip.children.length>MAX)strip.firstChild.remove();
      [].forEach.call(strip.children,function(x,i){x.lastChild.textContent=i+1;});strip.scrollLeft=strip.scrollWidth;paint();return;}
    stopCam();var im=await open(c);saveRaw(im);};
  /* ---------- l'écran lui-même déclenche : un appui sur le viseur prend la photo, ou lance et arrête la vidéo ---------- */
  var p0=null;
  stage.addEventListener('pointerdown',function(e){if(!CAM||e.target.closest('button'))return;p0=[e.clientX,e.clientY];});
  stage.addEventListener('pointerup',function(e){if(!CAM||!p0||e.target.closest('button'))return;var d=Math.hypot(e.clientX-p0[0],e.clientY-p0[1]);p0=null;if(d>12)return;
    var r=stage.getBoundingClientRect(),o=document.createElement('i');o.className='ff-tap';o.style.left=(e.clientX-r.left)+'px';o.style.top=(e.clientY-r.top)+'px';stage.appendChild(o);setTimeout(function(){o.remove();},500);
    $('shutter').click();});
  new MutationObserver(function(){stage.classList.toggle('ff-live',!!CAM);}).observe(row,{attributes:true,attributeFilter:['hidden']});
  addEventListener('resize',placeGhost);
  paint();
})();
