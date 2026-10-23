/*
 * Code: MIT licence, Copyright (c) 2026 Mauk Tenieb (see LICENSE).
 * Korhogo material: Copyright © Mauk Tenieb & Korhogo, all rights reserved. No use for training artificial intelligence.
 */
/* IKP — the palmarès of Korong! and FaunInvaders, carried by the open Nostr network (the Minitel's own transport):
   rules in palmares-rules.js, method in PALMARES.md; the official ten, rewritten every hour by the routine of this
   repository, sit in palmares.json.
   IKP.top(game)                 → Promise<[{ini,a,b,t}]>: palmares.json merged with what the relays hold right now
   IKP.record(game,{a,b,run},cb) → asks the three initials once per run when the entry takes a place, signs it with
                                   the Minitel's key and sends it to the relays, then cb(top,rank)
   IKP.line(rank)                → "#3 — 3615 KORHOGO" (the board sits on the Minitel's home screen)
   korong: a = Masks beaten in the run, b = goals let in; fauninvaders: a = score, b = wave */
(function(){
  var INI={},R=null,NT=null,LIVE=[];
  function fr(){try{return localStorage.getItem('ik.lang')==='fr';}catch(e){return false;}}
  function lastIni(){try{return localStorage.getItem('ik.ini')||'AAA';}catch(e){return 'AAA';}}
  function load(src){return new Promise(function(ok,ko){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s);});}
  function libs(){if(R&&NT)return Promise.resolve();return Promise.all([window.IKPR?0:load('palmares-rules.js'),window.NostrTools?0:load('nostr-tools.js')]).then(function(){R=window.IKPR;NT=window.NostrTools;});}
  /* the browser's key, shared with the Minitel (same site, same storage) */
  function key(){var h=null;try{h=JSON.parse(localStorage.getItem('vdx.nostr.sk'));}catch(e){}
    if(!h||!/^[0-9a-f]{64}$/.test(h)){var b=NT.generateSecretKey();h=Array.prototype.map.call(b,function(x){return('0'+x.toString(16)).slice(-2);}).join('');try{localStorage.setItem('vdx.nostr.sk',JSON.stringify(h));}catch(e){}}
    var u=new Uint8Array(32);for(var i=0;i<32;i++)u[i]=parseInt(h.substr(i*2,2),16);return u;}
  function official(){return fetch('palmares.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():{};}).catch(function(){return {};});}
  function relays(){var pool=new NT.SimplePool();
    return pool.querySync(R.RELAYS,{kinds:[R.KIND],'#t':[R.TAG],since:R.SINCE,limit:500},{maxWait:4000})
      .then(function(evs){try{pool.close(R.RELAYS);}catch(e){}return evs.filter(function(e){try{return NT.verifyEvent(e);}catch(x){return false;}}).map(R.entry).filter(Boolean);})
      .catch(function(){return [];});}
  function top(game){return libs().then(function(){return Promise.all([official(),relays()]);}).then(function(r){
    var off=(r[0][game]||[]).map(function(x){return Object.assign({game:game},x);});LIVE=r[1];
    return R.top(off.concat(LIVE),game);}).catch(function(){return [];});}
  function send(game,e){var sk=key(),ev=NT.finalizeEvent({kind:R.KIND,created_at:Math.floor(Date.now()/1000),content:'',
      tags:[['d',R.TAG+':'+game+':'+e.run],['t',R.TAG],['game',game],['ini',e.ini],['a',String(e.a)],['b',String(e.b)]]},sk);
    var pool=new NT.SimplePool();return Promise.allSettled(pool.publish(R.RELAYS,ev)).then(function(){try{pool.close(R.RELAYS);}catch(x){}return R.entry(ev);});}
  /* three letters, arcade style: ▲ ▼ on each slot, or type them */
  function ask(cb){
    var o=document.createElement('div'),L=lastIni().split(''),A='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',k=0;
    o.className='ikp-ask';o.setAttribute('role','dialog');o.setAttribute('aria-label','PALMARÈS');
    o.innerHTML='<p>PALMARÈS</p><div class="ikp-slots">'+[0,1,2].map(function(i){return '<span data-i="'+i+'"><button type="button" data-d="1" aria-label="▲">▲</button><b></b><button type="button" data-d="-1" aria-label="▼">▼</button></span>';}).join('')+'</div><button type="button" class="ikp-ok">OK</button>';
    document.body.appendChild(o);
    var bs=o.querySelectorAll('.ikp-slots b');
    function paint(){bs.forEach(function(b,i){b.textContent=L[i];b.className=i===k?'on':'';});}
    o.querySelectorAll('.ikp-slots button').forEach(function(b){b.onclick=function(){var i=+b.parentNode.dataset.i,j=A.indexOf(L[i]);k=i;L[i]=A[(j+(+b.dataset.d)+A.length)%A.length];paint();};});
    function done(){var s=L.join('');try{localStorage.setItem('ik.ini',s);}catch(e){}document.removeEventListener('keydown',key,true);o.remove();cb(s);}
    function key(e){var c=String(e.key||'').toUpperCase();
      if(A.indexOf(c)>=0&&c.length===1){L[k]=c;k=Math.min(2,k+1);paint();}
      else if(e.key==='ArrowUp'||e.key==='ArrowDown'){var j=A.indexOf(L[k]);L[k]=A[(j+(e.key==='ArrowUp'?1:-1)+A.length)%A.length];paint();}
      else if(e.key==='ArrowLeft'){k=Math.max(0,k-1);paint();}else if(e.key==='ArrowRight'){k=Math.min(2,k+1);paint();}
      else if(e.key==='Backspace'){k=Math.max(0,k-1);paint();}else if(e.key==='Enter'){done();}else return;
      e.preventDefault();e.stopPropagation();}
    document.addEventListener('keydown',key,true);o.querySelector('.ikp-ok').onclick=done;paint();
  }
  function record(game,e,cb){
    top(game).then(function(t){
      if(!R||!R.enters(game,e.a,e.b,t)){if(cb)cb(t,0);return;}
      var go=function(ini){INI[e.run]=ini;send(game,{ini:ini,a:e.a,b:e.b,run:e.run}).then(function(x){
        var all=t.map(function(y){return Object.assign({game:game},y);}).concat(x?[x]:[]),nt=R.top(all,game),rank=0;
        nt.forEach(function(y,i){if(x&&y.run===x.run&&y.who===x.who)rank=i+1;});if(cb)cb(nt,rank);});};
      if(INI[e.run])go(INI[e.run]);else ask(go);
    });
  }
  /* in the games, a single line: the rank, and where the whole list lives (the Minitel) */
  function line(rank){if(!rank)return '';return (fr()?(rank===1?'1er':rank+'e'):'#'+rank)+' \u2014 3615 KORHOGO';}
  function html(game,t,rank){
    if(!t||!t.length)return '';
    var col=game==='korong'?(fr()?['MASKS','BUTS PRIS']:['MASKS','GOALS LET IN']):(fr()?['SCORE','VAGUE']:['SCORE','WAVE']);
    return '<table class="ikp-top"><caption>PALMARÈS</caption><thead><tr><th></th><th></th><th>'+col[0]+'</th><th>'+col[1]+'</th></tr></thead><tbody>'+
      t.map(function(x,i){return '<tr'+(i+1===rank?' class="me"':'')+'><td>'+(i+1)+'</td><td>'+x.ini+'</td><td>'+x.a+'</td><td>'+x.b+'</td></tr>';}).join('')+'</tbody></table>';
  }
  var css=document.createElement('style');
  css.textContent='.ikp-ask{position:fixed;inset:0;z-index:100000;display:grid;place-content:center;justify-items:center;gap:18px;background:rgba(7,6,10,.9);font-family:"Press Start 2P",monospace;color:#ece4d2}'+
    '.ikp-ask p{font-size:12px;letter-spacing:.2em;margin:0;color:#c9a84c}.ikp-slots{display:flex;gap:14px}.ikp-slots span{display:flex;flex-direction:column;align-items:center;gap:6px}'+
    '.ikp-slots b{font-size:30px;width:1.2em;text-align:center;border-bottom:2px solid transparent}.ikp-slots b.on{border-color:#c9a84c}'+
    '.ikp-ask button{font:inherit;font-size:12px;color:#c9a84c;background:transparent;border:1px solid rgba(201,168,76,.5);padding:8px 12px;cursor:pointer}.ikp-ask button:focus-visible{outline:2px solid #c9a84c}'+
    '.ikp-ask .ikp-ok{padding:10px 26px;background:#c9a84c;color:#0b0805}'+
    '.ikp-top{border-collapse:collapse;margin:6px auto 0;font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.08em;color:#ece4d2;font-variant-numeric:tabular-nums}'+
    '.ikp-top caption{font-family:"Press Start 2P",monospace;font-size:9px;letter-spacing:.2em;color:#c9a84c;padding-bottom:6px}'+
    '.ikp-top th{font-weight:400;color:rgba(236,228,210,.5);font-size:9px;padding:2px 8px}.ikp-top td{padding:2px 8px;text-align:right}.ikp-top td:nth-child(2){text-align:left;letter-spacing:.2em}.ikp-top tr.me td{color:#c9a84c}';
  document.head.appendChild(css);
  /* HALL OF KAVE: this browser's card (localStorage ik.kave), sent to the relays a few seconds after each change */
  var KV=null,kvT=0;
  function kvGet(){if(KV)return KV;try{KV=JSON.parse(localStorage.getItem('ik.kave'))||{};}catch(e){KV={};}
    ['ka','kb','du','fi','cl','er','c4','hg','mm','ko'].forEach(function(k){KV[k]=+KV[k]||0;});return KV;}
  function kvSave(){try{localStorage.setItem('ik.kave',JSON.stringify(KV));}catch(e){}}
  function kvPut(){kvSave();clearTimeout(kvT);kvT=setTimeout(kvSend,5000);}
  function kvName(){var n='';try{n=JSON.parse(localStorage.getItem('vdx.nick'))||'';}catch(e){}if(!n)n=lastIni();return String(n).replace(/[^\w\- .'À-ÿ]/g,'').slice(0,16)||'KORHOGO';}
  function kvSend(){libs().then(function(){var c={};Object.keys(R.CAP).forEach(function(k){c[k]=Math.min(R.CAP[k],kvGet()[k]);});
    var ev=NT.finalizeEvent({kind:R.KIND,created_at:Math.floor(Date.now()/1000),content:JSON.stringify(c),tags:[['d',R.KAVE],['t',R.KAVE],['name',kvName()]]},key());
    var pool=new NT.SimplePool();return Promise.allSettled(pool.publish(R.RELAYS,ev)).then(function(){try{pool.close(R.RELAYS);}catch(x){}});}).catch(function(){});}
  var kave={
    /* a Kompete! run: the card keeps the best one (more Masks, then fewer goals) */
    run:function(masks,goals){var c=kvGet();if(masks>c.ka||(masks===c.ka&&masks>0&&goals<c.kb)){c.ka=masks;c.kb=goals;kvPut();}},
    fi:function(score){var c=kvGet();if(score>c.fi){c.fi=score-score%10;kvPut();}},
    /* a win reported by kg-loader (KG.onwin) or by Korong! (duel) */
    win:function(name,d){var c=kvGet();d=d||{};
      if(name==='duel')c.du++;else if(name==='chess')c.cl+=Math.max(1,Math.min(3,+d.level||1));else if(name==='erratic')c.er++;
      else if(name==='katabatik'&&d.game==='c4')c.c4++;else if(name==='katabatik'&&d.game==='hang')c.hg++;else if(name==='katabatik'&&d.game==='mm')c.mm++;else return;kvPut();},
    card:function(){return Object.assign({},kvGet());},
    points:function(){return libs().then(function(){return R.points(kvGet());});}
  };
  /* Koins earned: each rise of the balance (wins, 3615 KOINS, profiles, messages) adds to the card */
  function kvKoins(){var b=0;try{b=+JSON.parse(localStorage.getItem('ik.koins'))||0;}catch(e){}var c=kvGet();
    if(c.seen===undefined){c.seen=b;kvSave();return;}
    if(b>c.seen){c.ko+=b-c.seen;c.seen=b;kvPut();}else if(b<c.seen){c.seen=b;kvSave();}}
  setInterval(kvKoins,2000);window.addEventListener('storage',function(e){if(e.key==='ik.koins')kvKoins();});
  window.IKP={top:top,record:record,html:html,line:line,kave:kave};
})();

/* ikp line style */
(function(){var c=document.createElement('style');c.textContent='#palm{font-family:"Press Start 2P",monospace;font-size:10px;letter-spacing:.12em;color:#c9a84c;min-height:12px}';document.head.appendChild(c);})();
