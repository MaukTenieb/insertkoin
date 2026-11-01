/* Borne Insert Koin — le bus des blocs (principe P5).
   Chaque bloc logique (plante, caméra, Insert Koin, écran, console, caisse, autocollant, palette) vit dans son module borne-<bloc>.js,
   qui s'enregistre ici par bloc(nom, init) ; init(host, bus) crée ses éléments dans host et ses écouteurs, sans toucher à un autre bloc.
   Les blocs se parlent par le bus : on / emit (événements), part (l'interface rendue par init), magnet (déclaration à l'aimant). */
(function(){
  var H={},B={},M=[];
  var bus={
    on:function(t,f){(H[t]=H[t]||[]).push(f);},
    emit:function(t,d){(H[t]||[]).slice().forEach(function(f){try{f(d);}catch(e){console.error(e);}});},
    bloc:function(n,init){B[n]={init:init,api:null};},
    mount:function(n,host,opt){var b=B[n];if(!b||!host)return null;if(!b.api)b.api=b.init(host,bus,opt||{})||{};return b.api;},
    part:function(n){return B[n]&&B[n].api;},
    blocs:function(){return Object.keys(B);},
    /* l'aimant : un bloc se déclare (id gardé dans les places sauvées, élément, zone de prise facultative, repos pendant les programmes) */
    magnet:function(id,el,o){var m={id:id,el:el,hit:o&&o.hit,rest:o&&o.rest};M.push(m);bus.emit('magnet',m);},
    magnets:function(){return M.slice();}
  };
  window.__borne=bus;
})();
