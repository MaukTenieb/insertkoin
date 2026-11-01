/* Borne Insert Koin — bloc « écran » (P5) : le cadre (.b-bezel), le tube (.b-screen), la vitre (.b-glass), SkopoRhogo au repos, la date républicaine.
   SkopoRhogo tourne seulement quand il est à l'écran ; aux trois quarts hors de la fenêtre, la chambre dort.
   init(host, bus) : crée le cadre en tête de host ; écoute « ecran:wake » et « ecran:sleep » ; émet « ecran:open » ; se déclare à l'aimant (« ecran »).
   Les autres blocs posés sur le cadre (Burrows, Lore, pied de l'écran) y entrent par le meuble, jamais par ce module. */
(function(){var bus=window.__borne;if(!bus)return;
bus.bloc('ecran',function(host,bus){
  var el=function(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
  var bezel=el('div','b-bezel'),scr=el('div','b-screen'),glass=el('div','b-glass');glass.id='b-glass';scr.appendChild(glass);
  var att=el('div','b-attract'),skf=document.createElement('iframe');skf.title='SkopoRhogo';skf.setAttribute('tabindex','-1');att.appendChild(skf);glass.appendChild(att);
  var date=el('div','b-date','<b></b>');glass.appendChild(date);
  bezel.appendChild(scr);host.insertBefore(bezel,host.firstChild);
  function wake(){if(!skf.src||skf.src.indexOf('skoporhogo-borne.html')<0)skf.src='skoporhogo-borne.html?attract=1';try{skf.contentWindow.postMessage({borne:'wake'},'*');}catch(e){}}
  function sleep(){try{skf.contentWindow.postMessage({borne:'sleep'},'*');}catch(e){}}
  addEventListener('message',function(e){if(e.source===skf.contentWindow&&e.data&&e.data.borne==='open'&&document.documentElement.dataset.habit==='repos')bus.emit('ecran:open','skopo');});
  document.addEventListener('visibilitychange',function(){if(document.hidden)sleep();else if(document.documentElement.dataset.habit==='repos')wake();});
  /* aux trois quarts hors de la fenêtre, la chambre dort ; elle se réveille quand l'écran revient en vue */
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){if(!skf.src)return;if(e.intersectionRatio>=.25){if(document.documentElement.dataset.habit==='repos')wake();}else sleep();});},{threshold:[0,.25,.5]}).observe(skf);
  bus.on('ecran:wake',wake);bus.on('ecran:sleep',sleep);
  var MO=['vendémiaire','brumaire','frimaire','nivôse','pluviôse','ventôse','germinal','floréal','prairial','messidor','thermidor','fructidor','sans-culottides'];
  function tick(){var d=new Date(),r=window.ikRep?window.ikRep(d):null,h=d.getHours(),m=d.getMinutes();
    date.firstChild.textContent=(r?(r.month===13?'jour '+r.day+' des sans-culottides an '+r.year:r.day+' '+MO[r.month-1]+' '+r.year)+' · ':'')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
  tick();setInterval(tick,15000);
  bus.magnet('ecran',bezel,{rest:true});
  return {el:bezel,scr:scr,glass:glass};
});})();
