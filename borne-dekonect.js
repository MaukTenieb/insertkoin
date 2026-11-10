/* Borne Insert Koin — Dekonect.
   Un aimant gravé sur la caisse à pièces. Chaque pression déboîte les tronçons du meuble (chapiteau, écran, console, caisse),
   les lâche, les laisse flotter, puis les aspire un par un, par aimantation, dans un ordre nouveau. La plante et la caméra restent sur le toit. */
(function(){
  var root=document.documentElement,order=null,busy=false,R=Math.random;
  var SEL=['.bar','#home .b-bezel','#home .b-panel','.b-door'];
  /* téléphone couché (data-bland) : deux colonnes ; seuls le panneau et la porte, empilés à droite, changent de place */
  function parts(){var L=root.hasAttribute('data-bland')?['#home .b-panel','.b-door']:SEL;return L.map(function(s){return document.querySelector(s);}).filter(function(e){return e&&e.offsetHeight;});}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function same(a,b){return a.length===b.length&&a.every(function(x,i){return x===b[i];});}
  function son(k){try{window.__borneSon&&window.__borneSon[k]&&window.__borneSon[k]();}catch(e){}}
  function reset(anim){parts().forEach(function(e){e.style.transition=anim?'translate .45s cubic-bezier(.2,1.4,.4,1),rotate .45s':'';e.style.translate='';e.style.rotate='';e.style.zIndex='';});var was=order;order=null;if(was)setTimeout(function(){try{window.__borneLorePlace&&window.__borneLorePlace();}catch(_){}},anim?500:60);}
  /* 8 nov. (Mauk Tenieb : « ton magnet-demagnet est une merde » ; demande du 25 oct. : « par succion ou aspiration ») : trois temps.
     Le lâcher : chaque tronçon se décolle, s'écarte de ses voisins et pivote, vite puis de moins en moins vite (0,7 s).
     Le flottement : les tronçons restent suspendus, ils dérivent et respirent (0,5 s).
     La succion : un par un, chaque tronçon accélère vers sa nouvelle place, claque, rebondit de 3 px, et le meuble encaisse le choc. */
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function knock(k){var w=document.querySelector('.wrap');if(!w||RM||!w.animate)return;var a=1.5+k*.4;w.animate([{translate:'0 0'},{translate:(R()<.5?-a:a)+'px '+a+'px'},{translate:(R()<.5?-a:a)*.5+'px 0'},{translate:'0 0'}],{duration:170,easing:'ease-out'});}
  function press(){if(busy||root.dataset.prog)return;busy=true;var P=parts();if(P.length<2){busy=false;return;}
    P.forEach(function(e){e.style.transition='none';e.style.translate='';e.style.rotate='';});
    var top=Infinity,rects=P.map(function(e){var r=e.getBoundingClientRect();top=Math.min(top,r.top);return r;});
    var cur=order||P.slice(),next;do{next=shuffle(P);}while(same(next,cur)&&P.length>1);
    if(order&&R()<.25)next=P.slice();
    place(cur,rects,top,P,false);
    if(RM){place(next,rects,top,P,false);order=same(next,P)?null:next;busy=false;try{window.__borneLorePlace&&window.__borneLorePlace();}catch(_){}return;}
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      son('suck');var n=cur.length,dr=[];
      /* le lâcher */
      cur.forEach(function(e,k){var t=(e.style.translate||'0px 0px').split(' '),x0=parseFloat(t[0])||0,y0=parseFloat(t[1])||0,side=(k%2?1:-1)*(R()<.8?1:-1),
          dx=side*(.04+R()*.05)*innerWidth,dy=(k-(n-1)/2)*(14+R()*10)+8,rot=side*(2+R()*5);dr.push([x0+dx,y0+dy,rot]);
        e.style.transition='translate .7s cubic-bezier(.12,.75,.3,1) '+(k*40)+'ms,rotate .7s cubic-bezier(.12,.75,.3,1) '+(k*40)+'ms';
        e.style.translate=(x0+dx).toFixed(1)+'px '+(y0+dy).toFixed(1)+'px';e.style.rotate=rot.toFixed(1)+'deg';e.style.zIndex=30+k;});
      /* le flottement */
      setTimeout(function(){cur.forEach(function(e,k){var d=dr[k];e.style.transition='translate .5s ease-in-out,rotate .5s ease-in-out';
        e.style.translate=(d[0]+(R()*2-1)*6).toFixed(1)+'px '+(d[1]-5-R()*6).toFixed(1)+'px';e.style.rotate=(d[2]*.7).toFixed(1)+'deg';});},760);
      /* la succion */
      setTimeout(function(){place(next,rects,top,P,true);order=same(next,P)?null:next;setTimeout(function(){busy=false;},900);/* le meuble immobile, l'autocollant se recolle */setTimeout(function(){try{if(!busy&&window.__borneLorePlace)window.__borneLorePlace();}catch(_){}},1300);
        if(root.hasAttribute('data-bland'))setTimeout(function(){try{window.__borneSeat&&window.__borneSeat();}catch(_){}},900);},1300);
    });});}
  /* chaque tronçon prend la place suivante ; les jours d'origine entre les tronçons restent les mêmes (la caisse tombait mal sans eux) */
  function place(seq,rects,top,P,anim){var gaps=rects.map(function(r,i){return i<rects.length-1?Math.max(0,rects[i+1].top-r.bottom):0;});var y=top;seq.forEach(function(e,k){var r=rects[P.indexOf(e)],dy=y-r.top;y+=r.height+(gaps[k]||0);
      e.style.transition=anim?'translate .36s cubic-bezier(.6,0,.95,.35) '+(k*110)+'ms,rotate .36s cubic-bezier(.6,0,.95,.35) '+(k*110)+'ms':'none';e.style.translate='0px '+dy+'px';e.style.rotate='0deg';
      if(anim)setTimeout(function(){son('clack');knock(k);if(e.animate&&!RM)e.animate([{transform:'translateY(0)'},{transform:'translateY(3px) scaleY(.985)'},{transform:'translateY(0)'}],{duration:150,easing:'ease-out'});/* 10 nov. : la caisse déplacée garde son autocollant au-dessus des tronçons voisins */e.style.zIndex=(e.classList.contains('b-door')&&!same(seq,P))?'5':'';},360+k*110);});}
  /* 8 nov. : le rack des molettes accompagne la caisse à pièces dans chaque déplacement (même tronçon du meuble) ; l'aimant reste en bas à droite */
  (function follow(){var d=document.querySelector('.b-door'),k=document.querySelector('.b-knobs');if(!d||!k){setTimeout(follow,600);return;}
    new MutationObserver(function(){k.style.transition=d.style.transition;k.style.translate=d.style.translate;k.style.rotate=d.style.rotate;k.style.zIndex=d.style.zIndex;}).observe(d,{attributes:true,attributeFilter:['style']});})();
  window.__borneDekonect=press;window.__borneDekBusy=function(){return busy;};
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
      var k=document.querySelector('.b-knobs'),a=b.getBoundingClientRect(),q=k&&k.getBoundingClientRect();
      if(q&&q.width&&a.left<q.right+10&&a.right>q.left&&a.top<q.bottom&&a.bottom>q.top){w.style.setProperty('--dkb',Math.max(4,Math.round((gap-a.height)/2))+'px');b.classList.add('b-dklow');}}
    seat();addEventListener('resize',seat);setTimeout(seat,1500);window.__borneSeat=seat;}
  mount();
})();
