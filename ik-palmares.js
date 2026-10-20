/*
 * Code: MIT licence, Copyright (c) 2026 Mauk Tenieb (see LICENSE).
 * Korhogo material: Copyright © Mauk Tenieb & Korhogo, all rights reserved. No use for training artificial intelligence.
 */
/* IKP — the palmarès of Korong! and FaunInvaders: the ten best, kept by the "palmares" worker (palmares-worker.js).
   IKP.top(game)                         → Promise<[{ini,a,b,t}]>  ([] when the worker is out of reach)
   IKP.enters(game,a,b,top)              → true when (a,b) takes a place among the ten
   IKP.record(game,{a,b,run},cb)         → asks the three initials once per run when the entry qualifies, sends it,
                                           then cb(top,rank); a refused write (one a minute per address) is retried
   IKP.html(game,top,rank)               → the list, ready for an element
   IKP.line(rank)                        → "#3 — 3615 PALMARÈS" (the full list lives in the Minitel: 3615 KORHOGO, 5)
   korong: a = Masks beaten in the run, b = goals conceded; fauninvaders: a = score, b = wave */
(function(){
  var URL_='https://palmares.mauktenieb.workers.dev',INI={};
  var better={korong:function(x,y){return x.a-y.a||y.b-x.b;},fauninvaders:function(x,y){return x.a-y.a||x.b-y.b;}};
  function fr(){try{return localStorage.getItem('ik.lang')==='fr';}catch(e){return false;}}
  function lastIni(){try{return localStorage.getItem('ik.ini')||'AAA';}catch(e){return 'AAA';}}
  function top(game){return fetch(URL_+'/top?game='+game,{cache:'no-store'}).then(function(r){return r.ok?r.json():[];}).catch(function(){return [];});}
  function enters(game,a,b,t){if(a<=0)return false;if(!t||t.length<10)return true;return better[game]({a:a,b:b},t[t.length-1])>0;}
  function send(game,e,cb,tries){
    fetch(URL_+'/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({game:game,ini:e.ini,a:e.a,b:e.b,run:e.run})})
      .then(function(r){if(r.status===429&&(tries||0)<5){setTimeout(function(){send(game,e,cb,(tries||0)+1);},61000);return null;}return r.ok?r.json():null;})
      .then(function(d){if(d&&cb)cb(d.top,d.rank);}).catch(function(){});
  }
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
      if(!enters(game,e.a,e.b,t)){if(cb)cb(t,0);return;}
      var go=function(ini){INI[e.run]=ini;send(game,{ini:ini,a:e.a,b:e.b,run:e.run},cb);};
      if(INI[e.run])go(INI[e.run]);else ask(go);
    });
  }
  /* in the games, a single line: the rank, and where the whole list lives (the Minitel) */
  function line(rank){if(!rank)return '';return (fr()?(rank===1?'1er':rank+'e'):'#'+rank)+' \u2014 3615 PALMAR\u00c8S';}
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
  window.IKP={top:top,enters:enters,record:record,html:html,line:line};
})();

/* ikp line style */
(function(){var c=document.createElement('style');c.textContent='#palm{font-family:"Press Start 2P",monospace;font-size:10px;letter-spacing:.12em;color:#c9a84c;min-height:12px}';document.head.appendChild(c);})();
