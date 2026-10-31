/* Borne Insert Koin — Dekonect.
   Un aimant gravé sur la caisse à pièces. Chaque pression déboîte les tronçons du meuble (chapiteau, écran, console, caisse),
   les fait flotter un instant, puis les rassemble par aimantation dans un ordre nouveau. La plante et la caméra restent sur le toit. */
(function(){
  var root=document.documentElement,order=null,busy=false,R=Math.random;
  var SEL=['.bar','#home .b-bezel','#home .b-panel','.b-door'];
  /* téléphone couché (data-bland) : deux colonnes ; seuls le panneau et la porte, empilés à droite, changent de place */
  function parts(){var L=root.hasAttribute('data-bland')?['#home .b-panel','.b-door']:SEL;return L.map(function(s){return document.querySelector(s);}).filter(function(e){return e&&e.offsetHeight;});}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function same(a,b){return a.length===b.length&&a.every(function(x,i){return x===b[i];});}
  function son(k){try{window.__borneSon&&window.__borneSon[k]&&window.__borneSon[k]();}catch(e){}}
  function reset(anim){parts().forEach(function(e){e.style.transition=anim?'translate .45s cubic-bezier(.2,1.4,.4,1),rotate .45s':'';e.style.translate='';e.style.rotate='';e.style.zIndex='';});order=null;}
  function press(){if(busy||root.dataset.prog)return;busy=true;var P=parts();if(P.length<2){busy=false;return;}
    /* les places d'origine : on mesure sans décalage */
    P.forEach(function(e){e.style.transition='none';e.style.translate='';e.style.rotate='';});
    var top=Infinity,rects=P.map(function(e){var r=e.getBoundingClientRect();top=Math.min(top,r.top);return r;});
    var cur=order||P.slice(),next;do{next=shuffle(P);}while(same(next,cur)&&P.length>1);
    /* le retour à l'ordre d'origine passe aussi, une fois sur quatre */
    if(order&&R()<.25)next=P.slice();
    /* rétablit visuellement l'ordre en cours avant de déboîter */
    place(cur,rects,top,P,false);
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      son('suck');
      P.forEach(function(e,i){var dx=(R()*2-1)*Math.min(90,innerWidth*.08),dy=(R()*2-1)*24;e.style.transition='translate .32s cubic-bezier(.3,0,.3,1),rotate .32s';
        var t=(e.style.translate||'0px 0px').split(' ');e.style.translate=(parseFloat(t[0])+dx)+'px '+(parseFloat(t[1]||0)+dy)+'px';e.style.rotate=((R()*2-1)*5).toFixed(1)+'deg';e.style.zIndex=30+i;});
      setTimeout(function(){place(next,rects,top,P,true);order=same(next,P)?null:next;setTimeout(function(){busy=false;},700);
        /* téléphone couché : l'aimant suit la plaque MAUK TENIEB à sa nouvelle place */
        if(root.hasAttribute('data-bland'))setTimeout(function(){try{window.__borneSeat&&window.__borneSeat();}catch(_){}},760);},380);
    });});}
  /* chaque tronçon prend la place suivante ; les jours d'origine entre les tronçons restent les mêmes (la caisse tombait mal sans eux) */
  function place(seq,rects,top,P,anim){var gaps=rects.map(function(r,i){return i<rects.length-1?Math.max(0,rects[i+1].top-r.bottom):0;});var y=top;seq.forEach(function(e,k){var r=rects[P.indexOf(e)],dy=y-r.top;y+=r.height+(gaps[k]||0);
      e.style.transition=anim?'translate .5s cubic-bezier(.2,1.5,.4,1) '+(k*70)+'ms,rotate .5s '+(k*70)+'ms':'none';e.style.translate='0px '+dy+'px';e.style.rotate='0deg';
      if(anim)setTimeout(function(){son('clack');},420+k*70);});}
  window.__borneDekonect=press;
  /* un programme s'ouvre : le meuble se remet en ordre */
  new MutationObserver(function(){if(root.dataset.prog&&order)reset(false);}).observe(root,{attributes:true,attributeFilter:['data-prog']});
  var W0=innerWidth;addEventListener('resize',function(){if(innerWidth!==W0){W0=innerWidth;if(order)reset(false);}});
  function mount(){var d=document.querySelector('.b-door');if(!d){setTimeout(mount,500);return;}
    var b=document.createElement('button');b.type='button';b.className='b-dekonect';b.setAttribute('aria-label','Dekonect');b.title='Dekonect';
    b.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 4h6v13a3 3 0 0 0 6 0V4h6v13a9 9 0 0 1-18 0z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M7 9h6M19 9h6" stroke="currentColor" stroke-width="2.2"/></svg>';
    b.onclick=function(e){e.stopPropagation();press();};
    /* l'aimant reste en bas à droite du meuble, quoi qu'il arrive aux blocs */
    var w=d.parentElement;w.classList.add('b-dkhost');w.appendChild(b);
    function seat(){if(order&&!root.hasAttribute('data-bland'))return;var wr=w.getBoundingClientRect(),dr=d.getBoundingClientRect(),gap=wr.bottom-dr.bottom;
      /* téléphone couché : la porte manque de largeur ; l'aimant se pose sur le panneau, à droite de la plaque MAUK TENIEB */
      var pl=root.hasAttribute('data-bland')&&document.querySelector('#home .b-plate .b-badge');
      if(pl&&pl.offsetHeight){var pr=pl.getBoundingClientRect();w.style.setProperty('--dkb',Math.round(wr.bottom-pr.bottom-(b.offsetHeight-pr.height)/2)+'px');b.classList.remove('b-dklow');return;}
      w.style.setProperty('--dkb',Math.max(6,Math.round(gap+10))+'px');b.classList.remove('b-dklow');
      /* trop près des molettes : il descend sur le socle, toujours en bas à droite */
      var k=d.querySelector('.b-knobs'),a=b.getBoundingClientRect(),q=k&&k.getBoundingClientRect();
      if(q&&q.width&&a.left<q.right+10&&a.right>q.left&&a.top<q.bottom&&a.bottom>q.top){w.style.setProperty('--dkb',Math.max(4,Math.round((gap-a.height)/2))+'px');b.classList.add('b-dklow');}}
    seat();addEventListener('resize',seat);setTimeout(seat,1500);window.__borneSeat=seat;}
  mount();
})();
