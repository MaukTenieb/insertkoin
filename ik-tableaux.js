/* Tableaux des chambres du motel (room-puck-1 à 6) : chaque cadre peint reçoit un portrait de la Fauna tiré au hasard.
   IK_TAB[n] : toile de chaque cadre, quadrilatère haut-gauche, haut-droit, bas-droit, bas-gauche, en pixels de l'image 1024 × 687.
   ikTableaux(src, exclure) rend une toile (canvas) de la chambre, portraits posés ; les autres images passent telles quelles. */
(function(){
var R=function(x0,y0,x1,y1){return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]};
var IK_TAB={
 1:[R(576,44,627,103),[[843,58],[865,55],[865,149],[843,145]]],
 2:[[[124,57],[169,59],[169,180],[124,194]],R(576,44,626,103),[[842,57],[864,55],[864,149],[842,144]]],
 3:[R(576,44,627,104),[[842,57],[865,55],[865,150],[842,145]]],
 4:[R(576,45,627,103),R(704,46,756,110),[[842,58],[864,55],[864,149],[842,145]]],
 5:[R(576,44,627,102),R(704,52,755,110),[[841,58],[865,56],[865,152],[841,145]]],
 6:[R(570,56,633,130),[[934,80],[970,70],[970,188],[934,180]]]
};
var FAUNA=['poisoned_well','maiden_call','hatra_loves','truce','silent_pact','tsui_pen','plague_of_justinian','honey_buzzard','c7h5n3o6','dogxim','malika','grand_colonel','cadaver_synod','auvergne','croisiere_noire','naphta','aube','unkle_maukie'];
function base(){var s=document.currentScript&&document.currentScript.src;return s?s.replace(/ik-tableaux\.js.*$/,''):''}
var B=base(),MI={};
function mask(id){if(!MI[id])MI[id]=new Promise(function(ok){var im=new Image();im.decoding='async';im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=B+'mask-'+id+'.webp'});return MI[id]}
function load(u){return new Promise(function(ok,ko){var im=new Image();im.decoding='async';im.onload=function(){ok(im)};im.onerror=ko;im.src=u})}
function tirer(n,ex){var a=FAUNA.filter(function(x){return (ex||[]).indexOf(x)<0}).sort(function(){return Math.random()-.5});return a.slice(0,n)}
/* toile : portrait recadré sur le visage, patiné à la lumière de la chambre, posé en bandes verticales qui suivent la fuite du mur */
function poser(c,im,Q,k){var xs=Q.map(function(p){return p[0]*k}),ys=Q.map(function(p){return p[1]*k});
 var w=Math.max(8,Math.round(Math.max.apply(0,xs)-Math.min.apply(0,xs))),h=Math.max(8,Math.round(Math.max.apply(0,ys)-Math.min.apply(0,ys)));
 var off=document.createElement('canvas');off.width=w*2;off.height=h*2;var o=off.getContext('2d');o.fillStyle='#2a2620';o.fillRect(0,0,off.width,off.height);
 if(im){var iw=im.naturalWidth,ih=im.naturalHeight,s=Math.max(off.width/iw,off.height/ih)*1.15,sw=off.width/s,sh=off.height/s;o.drawImage(im,(iw-sw)/2,Math.max(0,ih*.08),sw,sh,0,0,off.width,off.height)}
 o.globalCompositeOperation='multiply';o.fillStyle='rgba(170,150,120,.55)';o.fillRect(0,0,off.width,off.height);o.globalCompositeOperation='source-over';o.fillStyle='rgba(255,240,200,.05)';o.fillRect(0,0,off.width,off.height*.4);
 var P=Q.map(function(p){return [p[0]*k,p[1]*k]}),TL=P[0],TR=P[1],BR=P[2],BL=P[3],N=Math.max(6,w),L=function(a,b,u){return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]};
 for(var i=0;i<N;i++){var u0=i/N,u1=(i+1)/N,A=L(TL,TR,u0),Bq=L(TL,TR,u1),C=L(BL,BR,u0),D=L(BL,BR,u1),sw2=off.width/N;
  c.save();c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(Bq[0]+.4,Bq[1]);c.lineTo(D[0]+.4,D[1]);c.lineTo(C[0],C[1]);c.closePath();c.clip();
  c.transform((Bq[0]-A[0])/sw2,(Bq[1]-A[1])/sw2,(C[0]-A[0])/off.height,(C[1]-A[1])/off.height,A[0],A[1]);c.drawImage(off,u0*off.width,0,sw2+.5,off.height,0,0,sw2+.5,off.height);c.restore()}}
function chambre(u){var m=/room-puck-(\d)\.webp/.exec(u||'');return m?+m[1]:0}
window.IK_TAB=IK_TAB;window.IK_FAUNA=FAUNA;window.ikTabPoser=poser;window.ikTabTirer=tirer;window.ikTabChambre=chambre;
window.ikTableaux=function(u,ex){var n=chambre(u);return load(u).then(function(im){var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;var x=c.getContext('2d');x.drawImage(im,0,0);
 if(!n)return c;var T=IK_TAB[n],ids=tirer(T.length,ex),k=im.naturalWidth/1024;return Promise.all(ids.map(mask)).then(function(ims){T.forEach(function(Q,i){poser(x,ims[i],Q,k)});return c})})};
})();
