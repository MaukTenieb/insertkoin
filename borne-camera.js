/* Borne Insert Koin — bloc « caméra » (P5) : la caméra Kapture du toit.
   init(host, bus) : crée .b-cam dans host, y range le bouton #kapture de la page, tire son image (webcam à pied et lentille bleue,
   ou compacte Korhogo ; décision de Mauk Tenieb, 30 oct., 22 h 40) au signal « tirage » du bus, se déclare à l'aimant (« camera »). */
(function(){var bus=window.__borne;if(!bus)return;
bus.bloc('camera',function(host,bus){
  var cam=document.createElement('div');cam.className='b-cam';
  var k=document.getElementById('kapture');if(k)cam.appendChild(k);host.appendChild(cam);
  bus.on('tirage',function(pick){cam.style.setProperty('--i-cam','url('+pick(['camera-a.webp','camera-c.webp'])+')');});
  bus.magnet('camera',cam);
  return {el:cam};
});})();
