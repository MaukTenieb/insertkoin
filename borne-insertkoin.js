/* Borne Insert Koin — bloc « Insert Koin » (P5) : l'enseigne du fronton et l'habit en petit dessous (3615, VHS, FOTOFAUNA, KORONG!, TILT).
   init(host, bus) : host = le bouton #brand de la page ; crée .b-habit ; écoute « habit » {t, tilt} ; se déclare à l'aimant (« fronton »). */
(function(){var bus=window.__borne;if(!bus)return;
bus.bloc('insertkoin',function(host,bus){
  var hab=document.createElement('span');hab.className='b-habit';hab.setAttribute('aria-hidden','true');host.appendChild(hab);
  bus.on('habit',function(d){hab.classList.toggle('tilt',!!d.tilt);hab.textContent=d.t||'';});
  bus.magnet('fronton',host);
  return {el:host};
});})();
