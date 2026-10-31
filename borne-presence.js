/* Borne Insert Koin — Online Applicants.
   Chaque visiteur annonce sa présence toutes les 20 s sur un canal MQTT public, par WebSocket, sous un numéro tiré au hasard
   (zéro nom, zéro adresse, zéro cookie). Le compteur montre les numéros entendus dans les 50 dernières secondes, visiteur compris.
   Trois relais publics, essayés l'un après l'autre, à partir du premier geste du visiteur ; après un échec, l'attente double jusqu'à une minute. */
(function(){
  var BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081/mqtt'];
  if(window.__presenceBrokers)BROKERS=window.__presenceBrokers;
  var TOPIC='mauktenieb/insertkoin/borne/applicants/v1',ME=Math.random().toString(36).slice(2,10),SEEN={},ws=null,bi=0,beat=0,ping=0,el=null;
  var enc=new TextEncoder(),dec=new TextDecoder();
  function len(n){var o=[];do{var d=n%128;n=Math.floor(n/128);if(n>0)d|=128;o.push(d);}while(n>0);return o;}
  function str(s){var b=enc.encode(s);return [b.length>>8,b.length&255].concat([].slice.call(b));}
  function pkt(h,body){return new Uint8Array([h].concat(len(body.length),body));}
  function connect(){var b=str('MQTT').concat([4,2,0,60]).concat(str('ik-'+ME));return pkt(0x10,b);}
  function sub(){return pkt(0x82,[0,1].concat(str(TOPIC)).concat([0]));}
  function pub(msg){return pkt(0x30,str(TOPIC).concat([].slice.call(enc.encode(msg))));}
  function send(p){try{if(ws&&ws.readyState===1)ws.send(p);}catch(e){}}
  function say(kind){send(pub(kind+':'+ME));}
  function paint(){var now=Date.now(),n=1;for(var k in SEEN){if(now-SEEN[k]>50000)delete SEEN[k];else n++;}
    if(!el)return;el.querySelector('b').textContent=n>99?'99+':String(n);var w=n===1?'Online Applicant':'Online Applicants';el.querySelector('span').textContent=w;el.hidden=false;el.title=n+' '+w;}
  function onmsg(buf){var a=new Uint8Array(buf),i=0;
    while(i<a.length){var h=a[i++],m=1,l=0,d;do{d=a[i++];l+=(d&127)*m;m*=128;}while(d&128);var p=a.subarray(i,i+l);i+=l;
      if((h>>4)===2){send(sub());say('hello');paint();}
      else if((h>>4)===3){var tl=(p[0]<<8)|p[1],s=dec.decode(p.subarray(2+tl)),kv=s.split(':');if(kv[0]==='bye'&&kv[1]){delete SEEN[kv[1]];paint();}else if(kv[1]&&kv[1]!==ME){var fresh=!SEEN[kv[1]];SEEN[kv[1]]=Date.now();
        if(kv[0]==='hello'&&fresh)setTimeout(function(){say('here');},300+Math.random()*1500);paint();}}}}
  var fails=0,started=false;
  function open(){if(document.hidden||!started)return;try{ws=new WebSocket(BROKERS[bi%BROKERS.length],'mqtt');}catch(e){bi++;setTimeout(open,4000);return;}
    ws.binaryType='arraybuffer';var ok=false;
    ws.onopen=function(){ok=true;fails=0;send(connect());};
    ws.onmessage=function(e){onmsg(e.data);};
    ws.onclose=ws.onerror=function(){clearInterval(beat);clearInterval(ping);if(ws){ws.onclose=ws.onerror=null;}ws=null;if(!ok){bi++;fails++;}else fails=0;setTimeout(open,Math.min(60000,(ok?3000:1500)*Math.pow(2,Math.min(fails,5))));};
    clearInterval(beat);clearInterval(ping);
    beat=setInterval(function(){say('here');paint();},20000);ping=setInterval(function(){send(new Uint8Array([0xC0,0]));},30000);}
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(ws){say('bye');try{ws.close();}catch(e){}}}else if(!ws&&started)open();});
  addEventListener('pagehide',function(){say('bye');});
  function mount(){var foot=document.querySelector('.b-bezelfoot');if(!foot){setTimeout(mount,600);return;}
    el=document.createElement('div');el.className='b-online';el.hidden=true;el.innerHTML='<i></i><b>1</b><span>Online Applicants</span>';
    var boom=foot.querySelector('.b-stick-mini')||foot.querySelector('.b-boom');foot.insertBefore(el,boom);paint();}
  /* le compteur se branche au premier geste du visiteur : avant, zéro connexion vers les relais */
  function first(){if(started)return;started=true;['pointerdown','keydown','wheel','touchstart'].forEach(function(t){removeEventListener(t,first,true);});open();}
  ['pointerdown','keydown','wheel','touchstart'].forEach(function(t){addEventListener(t,first,true);});
  mount();setInterval(paint,10000);
})();
