/* TVCR, épure (21 nov. 2026). Habillage : tvcr-epure.css. Chaque geste appelle une touche d'origine du magnétoscope. */
(function(){
  'use strict';
  var D=document;
  function fr(){return D.documentElement.lang==='fr';}
  function q(r,s){return r.querySelector(s);}
  function tracks(r){return [].slice.call(r.querySelectorAll('[data-vhs-tracklist] button'));}
  function cur(r){var t=tracks(r);for(var i=0;i<t.length;i++)if(t[i].getAttribute('aria-current')==='true')return i;return -1;}
  var osdT=0;
  function osd(r,txt){var sc=q(r,'.vhs-screen');if(!sc)return;var o=q(sc,'.tv-osd');if(!o){o=D.createElement('div');o.className='tv-osd';o.setAttribute('aria-hidden','true');sc.appendChild(o);}
    o.innerHTML=txt;o.classList.add('on');clearTimeout(osdT);osdT=setTimeout(function(){o.classList.remove('on');},1400);}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function zap(r,dir){var t=tracks(r);if(!t.length)return;var i=cur(r),n=i<0?0:(i+dir+t.length)%t.length;t[n].click();
    var nm=(t[n].textContent||'').replace(/\s+/g,' ').trim().replace(/^\d+[.)]\s*/,'');osd(r,'<b>'+(n+1)+'/'+t.length+'</b> '+esc(nm.toUpperCase()));}
  function action(r,a){var b=q(r,'[data-vhs-action="'+a+'"]');if(b)b.click();}
  function setup(r){
    if(r.dataset.tvEpure)return;r.dataset.tvEpure='1';r.classList.add('tv-epure');
    /* tiroir */
    var act=q(r,'.vhs-shelf-actions');
    if(act){var m=D.createElement('button');m.type='button';m.className='vhs-tape vhs-tape-all tv-more';m.setAttribute('aria-pressed','false');
      m.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>';
      var lab=function(){var l=fr()?'Tiroir':'Drawer';m.setAttribute('aria-label',l);m.title=l;};lab();
      new MutationObserver(lab).observe(D.documentElement,{attributes:true,attributeFilter:['lang']});
      m.onclick=function(){var on=r.classList.toggle('tv-tiroir');m.setAttribute('aria-pressed',String(on));};
      act.appendChild(m);
      /* régression corrigée (22 nov.) : la touche REC du magnétoscope ouvre le tiroir et donne la main à la barre d'enregistrement d'une chaîne YouTube */
      var rk=q(r,'[data-vhs-action="rec"]');if(rk)rk.addEventListener('click',function(){r.classList.add('tv-tiroir');m.setAttribute('aria-pressed','true');},true);
      var lo=q(r,'[data-vhs-find-open]');if(lo)lo.addEventListener('click',function(){r.classList.add('tv-tiroir');m.setAttribute('aria-pressed','true');},true);}
    /* jugement externe : un morceau sans titre (« ... » dans les données) prend un titre de repli */
    var tl=q(r,'[data-vhs-tracklist]');
    if(tl){var fix=function(){[].forEach.call(tl.querySelectorAll('button'),function(b){var t=(b.textContent||'').trim(),m=/^(\d+)\.\s*(\.{2,}|…|—|-)?\s*$/.exec(t);
        if(m){var nn=('0'+m[1]).slice(-2);b.textContent=m[1]+'. '+(fr()?'PISTE ':'TRACK ')+nn;}});};
      new MutationObserver(fix).observe(tl,{childList:true,subtree:true,characterData:true});fix();}
    /* état du magnétoscope incrusté à l'écran (OSD d'époque) */
    var scr=q(r,'.vhs-screen'),st=q(r,'[data-vhs-osd-state]');
    if(scr&&st){var et=D.createElement('div');et.className='tv-etat';et.setAttribute('aria-hidden','true');scr.appendChild(et);
      var ETn={play:'▶ PLAY',pause:'❚❚ PAUSE',stop:'■ STOP',rec:'● REC',ff:'▶▶',rew:'◀◀'};
      var upd=function(){var x=(st.textContent||'').trim(),k=x.toLowerCase();var lbl=ETn[k]||x.toUpperCase();et.textContent=lbl;
        clearTimeout(et._t);et.style.opacity='1';if(k==='play')et._t=setTimeout(function(){et.style.opacity='0';},2200);};
      et.style.transition='opacity .4s';new MutationObserver(upd).observe(st,{childList:true,characterData:true,subtree:true});upd();}
    /* façade du téléviseur : l'écran noir de la photo (x 251-879, y 147-611 sur 1312 x 816) se cale sur l'écran commun */
    var facade=function(){var frm=q(r,':scope>.ike-frame'),scn=q(r,'.vhs-screen');if(!frm||!scn||!window.ResizeObserver||r.dataset.tvFac)return!!r.dataset.tvFac;r.dataset.tvFac='1';
      var fit=function(){var a=frm.getBoundingClientRect(),b=scn.getBoundingClientRect();if(!b.width)return;
        var k=b.width/628,ox=b.left-a.left,oy=b.top-a.top;
        frm.style.setProperty('--tv-w',(1312*k)+'px');frm.style.setProperty('--tv-h',(816*k)+'px');
        frm.style.setProperty('--tv-x',(ox-251*k)+'px');frm.style.setProperty('--tv-y',(oy-147*k-(464*k-b.height)/2)+'px');r.classList.add('tv-facade');};
      new ResizeObserver(fit).observe(scn);new ResizeObserver(fit).observe(frm);fit();return true;};
    (function tf(n){if(!facade()&&n<200)setTimeout(function(){tf(n+1);},100);})(0);
    /* jugement externe : la liste descend jusqu'au bas du cadre de l'écran (paysage) */
    var lst=q(r,'[data-vhs-tracklist]');
    if(lst&&window.ResizeObserver){var fitL=function(){var frm=q(r,':scope>.ike-frame');if(!frm||innerWidth<700||innerWidth<innerHeight){lst.style.removeProperty('height');lst.style.removeProperty('max-height');return;}
        var h=Math.round(frm.getBoundingClientRect().bottom-lst.getBoundingClientRect().top);if(h>80){lst.style.setProperty('height',h+'px','important');lst.style.setProperty('max-height',h+'px','important');}};
      new ResizeObserver(fitL).observe(r);setTimeout(fitL,600);setTimeout(fitL,2500);}
    /* gestes sur l'écran */
    var sc=q(r,'.vhs-screen');if(!sc)return;
    var g=D.createElement('div');g.className='tv-geste';g.setAttribute('aria-hidden','true');sc.appendChild(g);
    var p=null;
    g.addEventListener('pointerdown',function(e){p={x:e.clientX,y:e.clientY,id:e.pointerId,t:performance.now(),moved:false};try{g.setPointerCapture(e.pointerId);}catch(_){}});
    g.addEventListener('pointermove',function(e){if(!p||e.pointerId!==p.id)return;if(Math.abs(e.clientX-p.x)>14||Math.abs(e.clientY-p.y)>14)p.moved=true;});
    function end(e){if(!p||e.pointerId!==p.id)return;var dx=e.clientX-p.x,dy=e.clientY-p.y,dt=performance.now()-p.t;var was=p;p=null;
      if(e.type==='pointercancel')return;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){zap(r,dx<0?1:-1);return;}
      if(!was.moved&&dt<500){action(r,'play');}}
    g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end);
  }
  var mo=new MutationObserver(scan);
  function scan(){var r=D.getElementById('vhs');if(r&&q(r,'.vhs-screen')&&q(r,'.vhs-shelf-actions')){setup(r);mo.disconnect();}}
  mo.observe(D.documentElement,{childList:true,subtree:true});scan();
})();
