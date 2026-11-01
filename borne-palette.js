/* Borne Insert Koin — bloc « palette d'interrupteurs-roues » (P5) : le rack de molettes de la porte.
   SKIN 🧤 (bois, métal), VOL 🎶 (trois crans : 0, moyen, fort ; Motel Sound compris), FR · EN, 👣 (les psychopompes).
   init(host, bus, {pos}) : crée .b-knobs dans host et ses quatre molettes ; la molette SKIN demande le skin suivant au bus (« skin:next ») ;
   se déclare à l'aimant (« molettes »). Zéro lecture d'un autre bloc. */
(function(){var bus=window.__borne;if(!bus)return;
bus.bloc('palette',function(host,bus,opt){
  var $=function(id){return document.getElementById(id);};
  var el=function(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
  var knobs=el('div','b-knobs');host.appendChild(knobs);
  var sw=el('div','b-knobw'),sb=el('button','b-knob b-skin');sb.type='button';sb.setAttribute('aria-label','Skin');sb.dataset.pos=opt.pos;
  sw.appendChild(sb);sw.appendChild(el('span','b-knoblab','🧤'));knobs.appendChild(sw);
  sb.onclick=function(){var d={};bus.emit('skin:next',d);if(d.pos!=null)sb.dataset.pos=d.pos;};
  /* VOL : la molette du volume de la machine (sons des jeux et de la mécanique) ; trois crans, 0, moyen, fort */
  (function(){var b=$('snd');if(!b)return;var lv=2;try{var v=localStorage.getItem('borne.vol');if(v!=null)lv=+v?2:0;}catch(e){}
    function isOn(){return /ON/i.test(b.textContent||'');}
    function apply(){if((lv>0)!==isOn())HTMLElement.prototype.click.call(b);window.__borneVol=[0,.45,1][lv];try{window.__borneSon&&window.__borneSon.vol&&window.__borneSon.vol(window.__borneVol);}catch(e){}
      b.dataset.pos=lv;try{localStorage.setItem('borne.vol',lv);}catch(e){}}
    b.addEventListener('click',function(e){if(e.isTrusted||e.detail){e.preventDefault();e.stopImmediatePropagation();lv=lv?0:2;apply();try{window.__borneMusic&&window.__borneMusic(lv>0);}catch(_){}}},true);
    setTimeout(apply,300);})();
  [['snd','🎶'],['lang','FR · EN']].forEach(function(p){var b=$(p[0]);if(!b)return;var w=el('div','b-knobw');b.classList.add('b-knob');b.setAttribute('aria-label',p[1]);w.appendChild(b);w.appendChild(el('span','b-knoblab',p[1]));knobs.appendChild(w);
    var sync=function(){var t=(b.textContent||'').toUpperCase();b.dataset.on=(p[0]==='snd'?/ON/.test(t):/FR/.test(t))?'1':'0';};sync();
    new MutationObserver(sync).observe(b,{childList:true,characterData:true,subtree:true});});
  /* la molette 👣 */
  function knob(){if(knobs.querySelector('.b-psy'))return;
    var on=true;try{on=localStorage.getItem('borne.psy')!=='0';}catch(_){}
    var w=document.createElement('div');w.className='b-knobw';var b=document.createElement('button');b.type='button';b.className='b-knob b-psy';b.setAttribute('aria-label','Psychopompes');
    var l=document.createElement('span');l.className='b-knoblab';l.textContent='👣';w.appendChild(b);w.appendChild(l);knobs.appendChild(w);
    function apply(){b.dataset.on=on?'1':'0';b.dataset.pos=on?1:0;window.__borneNoPsy=!on;document.documentElement.classList.toggle('b-nopsy',!on);
      if(!on){try{window.__borneTourStop&&window.__borneTourStop();}catch(_){}}try{localStorage.setItem('borne.psy',on?'1':'0');}catch(_){}}
    b.addEventListener('click',function(){on=!on;try{window.__borneSon&&window.__borneSon.detent(2);}catch(_){}apply();});apply();}
  knob();
  bus.magnet('molettes',knobs);
  return {el:knobs};
});})();
