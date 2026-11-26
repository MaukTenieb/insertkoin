/* 26 nov. 2026 (Mauk Tenieb, 22 h 52 : « les fiches de personnages peuvent-elles de temps en temps produire leurs propres voix ») : sur la fiche d'un Mask, après le premier toucher du visiteur, le Mask dit son motto de sa voix (kave/a/masks), à un moment tiré au hasard, puis de temps en temps tant que la page reste ouverte */
(function(){var m=/fauna-([a-z0-9_]+)\.html/.exec(location.pathname);if(!m)return;var src='kave/a/masks/'+m[1]+'.mp3',a=null,t=0;
 function say(){if(document.hidden){t=setTimeout(say,15000);return}try{a=a||new Audio(src);a.volume=.85;a.currentTime=0;a.play().catch(function(){})}catch(e){}t=setTimeout(say,60000+Math.random()*180000)}
 function first(){removeEventListener('pointerdown',first,true);removeEventListener('keydown',first,true);try{a=new Audio(src);a.preload='auto'}catch(e){}t=setTimeout(say,2000+Math.random()*18000)}
 addEventListener('pointerdown',first,true);addEventListener('keydown',first,true)})();
