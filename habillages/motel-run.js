/* Motel infini : rendu par lancer de rayons, à la Doom, en basse définition.
   Un des 18 Masks, tiré au hasard, court de dos dans les couloirs d'un motel sans fin ;
   il prend seul les bifurcations, au hasard, comme une vidéo qui tourne sans fin ; noir et blanc. */
(function(){
var W=240,H=150,FOV=0.66;
function hash(a,b,c){var h=(a*374761393+b*668265263+(c||0)*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return (h^(h>>>16))>>>0}
function rowC(y){return y===0||hash(y,7)%3===0}
function colC(x){return x===0||hash(x,11)%3===0}
function solid(x,y){return !(rowC(y)||colC(x))}
/* textures 32 × 32 dessinées en code ; palette réduite */
function tex(f){var t=new Uint32Array(1024);for(var y=0;y<32;y++)for(var x=0;x<32;x++)t[y*32+x]=f(x,y);return t}
function rgb(r,g,b){return (255<<24)|(b<<16)|(g<<8)|r}
var WALL=tex(function(x,y){if(y===20||y===21)return rgb(92,58,30);if(y>21){return (x%8===0)?rgb(70,42,22):(y===31?rgb(52,30,16):rgb(118,74,38))}var s=(x>>2)%2;return s?rgb(176,150,96):rgb(160,134,84)});
var DOOR=tex(function(x,y){if(x<3||x>28||y<2)return rgb(60,36,18);if(x===24&&y===17||x===25&&y===17||x===24&&y===18||x===25&&y===18)return rgb(214,176,82);if((x===8||x===23)&&y>5&&y<29||(y===6||y===16||y===28)&&x>7&&x<24)return rgb(78,46,22);return rgb(98,58,28)});
var CARPET=tex(function(x,y){var u=Math.abs((x%16)-8)+Math.abs((y%16)-8);return u<2?rgb(206,160,70):u<5?rgb(120,24,24):u===5?rgb(70,14,16):rgb(96,20,20)});
var CEIL=tex(function(x,y){return (x%16===0||y%16===0)?rgb(150,142,120):rgb(196,188,164)});
var LAMP=tex(function(x,y){return (x>6&&x<26&&y>11&&y<21)?rgb(246,244,226):(x%16===0||y%16===0)?rgb(150,142,120):rgb(196,188,164)});
/* les Masks de dos : tête, haut, bas, signes ; taille d'après leur stature (toise du vidéoclub) */
var M={
 aube:{h:'bob',hc:'#e86aa8',t:'#a8642c',p:'#c87a7a',s:1.68},auvergne:{h:'bald',hc:'#d8b090',t:'stripe:#3a4a6a:#9aa6b8',p:'#3a3a40',s:1.78},
 c7h5n3o6:{h:'bald',hc:'#8a8c88',t:'#a8aab0',p:'#7a7c80',s:1.98},cadaver_synod:{h:'mask',hc:'#c82a2a',t:'#202020',p:'#202020',a:'#d89060',s:1.88},
 croisiere_noire:{bull:1,s:1.6},dogxim:{h:'curl',hc:'#1a1410',t:'#c8402a',p:'#3a3020',a:'#6a4028',s:1.55},
 grand_colonel:{h:'short',hc:'#c8b878',t:'#5a6a3a',p:'#4a5630',s:1.80},hatra_loves:{h:'hat',hc:'#d8d0b0',t:'camo',p:'#5a5a3a',s:1.80},
 honey_buzzard:{h:'bird',hc:'#18181c',t:'#141418',p:'#141418',s:1.98},maiden_call:{h:'long',hc:'#121214',t:'stripe:#2a3a6a:#5a6a9a',p:'#2a2a40',s:1.65},
 malika:{h:'wavy',hc:'#141012',t:'#24282a',p:'#24282a',a:'#b07a52',s:1.68},naphta:{h:'short',hc:'#141012',t:'#d86a1a',p:'#d86a1a',a:'#5a3424',s:1.72},
 plague_of_justinian:{h:'cloud',hc:'#7a7c84',t:'#2a3448',p:'#2a2a30',a:'#c8a080',s:1.92},poisoned_well:{h:'bald',hc:'#e8b8a0',t:'#141418',p:'#141418',s:1.35},
 silent_pact:{veil:1,s:1.98},truce:{two:1,h:'short',hc:'#121214',t:'#2a2e36',p:'#24262c',s:1.75},
 tsui_pen:{h:'short',hc:'#e8e8e4',t:'#2a5a3a',p:'#3a3a30',wings:'#2a4a3a',s:1.68},unkle_maukie:{h:'hat',hc:'#e8dcc0',t:'#b02a1a',p:'#3a3a40',s:1.78}};
var KEYS=Object.keys(M);
function body(c,m,f,ox){var leg=[0,3,0,-3][f],arm=-leg,X=function(x,y,w,h,col){c.fillStyle=col;c.fillRect(ox+x,y,w,h)};
 if(m.wings){X(1,12,7,12,m.wings);X(16,12,7,12,m.wings)}
 X(8,26+(leg>0?-1:0),3,10-(leg>0?2:0),m.p);X(13,26+(leg<0?-1:0),3,10-(leg<0?2:0),m.p);X(8,35+(leg>0?-2:0),3,2,'#111');X(13,35+(leg<0?-2:0),3,2,'#111');
 var tc=m.t;if(tc==='camo'){X(7,13,10,14,'#5a6a3a');X(8,15,3,3,'#3a4228');X(12,19,4,3,'#7a6a48');X(9,23,3,2,'#3a4228')}
 else if(tc.indexOf('stripe')===0){var q=tc.split(':');for(var i=0;i<7;i++)X(7,13+i*2,10,2,i%2?q[1]:q[2])}else X(7,13,10,14,tc);
 var ac=m.a||tc.split(':').pop();if(ac==='camo')ac='#5a6a3a';X(5,14+arm,2,9,ac);X(17,14-arm,2,9,ac);
 var hc=m.hc;switch(m.h){
  case 'bob':X(8,4,8,9,hc);X(7,6,10,5,hc);break;
  case 'bald':X(9,5,6,8,hc);X(8,7,8,4,hc);break;
  case 'mask':X(9,5,6,8,hc);X(8,8,8,1,'#f0f0f0');break;
  case 'curl':X(8,4,8,8,hc);X(7,5,10,5,hc);break;
  case 'short':X(9,5,6,8,'#c89070');X(8,4,8,5,hc);break;
  case 'hat':X(9,7,6,6,'#a87850');X(4,6,16,2,hc);X(8,2,8,5,hc);break;
  case 'bird':X(8,3,8,10,hc);X(9,2,6,2,hc);break;
  case 'long':X(8,4,8,14,hc);X(7,6,10,10,hc);break;
  case 'wavy':X(7,4,10,15,hc);X(6,7,12,9,hc);break;
  case 'cloud':X(4,2,16,9,hc);X(6,0,8,4,'#9a9ca4');X(2,5,6,5,'#8a8c94');X(16,4,6,5,'#8a8c94');break}}
function sprite(key,f){var m=M[key],cv=document.createElement('canvas');cv.width=m.two?48:24;cv.height=38;var c=cv.getContext('2d');
 if(m.bull){var l=[0,2,0,-2][f];c.fillStyle='#141210';c.fillRect(2,10,20,18);c.fillRect(4,6,16,6);c.fillStyle='#e0d8c0';c.fillRect(0,4,5,2);c.fillRect(19,4,5,2);c.fillRect(0,2,2,2);c.fillRect(22,2,2,2);c.fillStyle='#141210';c.fillRect(4,28+l,4,9-l);c.fillRect(16,28-l,4,9+l);c.fillRect(11,26,2,6);return cv}
 if(m.veil){var v=[0,1,0,-1][f];c.fillStyle='#0c0c0e';c.beginPath();c.moveTo(12,1);c.lineTo(21+v,37);c.lineTo(3+v,37);c.closePath();c.fill();c.fillStyle='#1c1c22';c.fillRect(11,8,2,26);return cv}
 body(c,m,f,0);if(m.two)body(c,m,(f+2)%4,24);return cv}
window.MotelRun=function(host){
 var cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.className='mrun';cv.setAttribute('role','img');cv.setAttribute('aria-label','Motel');cv.tabIndex=0;
 cv.style.cssText='image-rendering:pixelated;image-rendering:crisp-edges;display:block;width:100%;height:100%;outline:0;touch-action:manipulation;filter:grayscale(1) contrast(1.12) brightness(1.05)';
 host.appendChild(cv);var c=cv.getContext('2d'),img=c.createImageData(W,H),buf=new Uint32Array(img.data.buffer),zb=new Float32Array(W);
 var key=KEYS[Math.floor(Math.random()*KEYS.length)],m=M[key],frames=[0,1,2,3].map(function(f){return sprite(key,f)});
 var face=new Image();face.src='a/b-'+key+'.webp';
 var px=0.5,py=0.5,dir=0,ang=0,pend=0,speed=2.3,last=performance.now(),run=0,alive=true;
 var DX=[1,0,-1,0],DY=[0,1,0,-1];
 function key_(e){if(!alive)return;if(e.target&&e.target.closest&&e.target.closest('input,textarea,.win'))return;if(e.key==='ArrowLeft'){pend=-1;e.preventDefault()}else if(e.key==='ArrowRight'){pend=1;e.preventDefault()}}
 addEventListener('keydown',key_);
 cv.addEventListener('pointerdown',function(e){var r=cv.getBoundingClientRect();pend=(e.clientX-r.left)<r.width/2?-1:1});
 function step(dt){var ox=px,oy=py;px+=DX[dir]*speed*dt;py+=DY[dir]*speed*dt;
  var cx=Math.floor(px),cy=Math.floor(py),pcx=Math.floor(ox-0.5+0.5),pcy=Math.floor(oy);
  var crossed=dir%2===0?(Math.floor(ox-0.5)!==Math.floor(px-0.5)):(Math.floor(oy-0.5)!==Math.floor(py-0.5));
  if(crossed&&!pend&&Math.random()<0.4)pend=Math.random()<0.5?-1:1;
  if(crossed&&pend){var nx=dir%2===0?Math.round(px-0.5)+0.5:px,ny=dir%2===0?py:Math.round(py-0.5)+0.5,gx=Math.floor(nx),gy=Math.floor(ny);
   var nd=(dir+pend+4)%4,ok=nd%2===1?colC(gx):rowC(gy);
   if(ok){px=nx;py=ny;dir=nd}pend=0}}
 function cast(){var ta=dir*Math.PI/2;var d=ta-ang;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;ang+=d*0.18;
  var dx=Math.cos(ang),dy=Math.sin(ang),plx=-dy*FOV,ply=dx*FOV,bob=Math.sin(run*11)*1.2;
  /* sol et plafond */
  for(var y=0;y<H;y++){var p=y-H/2-bob;if(Math.abs(p)<0.5)p=0.5;var rd=(H/2)/Math.abs(p),fl=p>0;
   var rx0=dx-plx,ry0=dy-ply,sx=(2*plx)*rd/W,sy=(2*ply)*rd/W,fx=px+rd*rx0,fy=py+rd*ry0,sh=Math.max(0.12,1-rd/9);
   for(var x=0;x<W;x++){var gx=Math.floor(fx),gy=Math.floor(fy),tx=(32*(fx-gx))&31,ty=(32*(fy-gy))&31,col;
    if(fl)col=CARPET[ty*32+tx];else col=((gx+gy)%3===0?LAMP:CEIL)[ty*32+tx];
    buf[y*W+x]=shade(col,sh);fx+=sx;fy+=sy}}
  /* murs */
  for(var x=0;x<W;x++){var cam=2*x/W-1,rx=dx+plx*cam,ry=dy+ply*cam,mx=Math.floor(px),my=Math.floor(py),ddx=Math.abs(1/rx),ddy=Math.abs(1/ry),stx,sty,sdx,sdy,side,hit=0,n=0;
   if(rx<0){stx=-1;sdx=(px-mx)*ddx}else{stx=1;sdx=(mx+1-px)*ddx}if(ry<0){sty=-1;sdy=(py-my)*ddy}else{sty=1;sdy=(my+1-py)*ddy}
   while(!hit&&n++<64){if(sdx<sdy){sdx+=ddx;mx+=stx;side=0}else{sdy+=ddy;my+=sty;side=1}if(solid(mx,my))hit=1}
   var pd=side===0?sdx-ddx:sdy-ddy;if(!hit)pd=40;zb[x]=pd;var lh=Math.floor(H/pd),y0=Math.floor(H/2-lh/2+bob),y1=y0+lh;
   var wx=side===0?py+pd*ry:px+pd*rx;wx-=Math.floor(wx);var tx=(wx*32)&31,T=hash(mx,my,side)%4===0?DOOR:WALL,sh=Math.max(0.1,1-pd/9)*(side?0.82:1);
   for(var y=Math.max(0,y0);y<Math.min(H,y1);y++){var ty=(((y-y0)*32/lh)|0)&31;buf[y*W+x]=shade(T[ty*32+tx],sh)}}
  c.putImageData(img,0,0);
  /* le Mask, de dos, à sa taille */
  var fr=frames[Math.floor(run*8)%4],sc=2.1*m.s/1.75,w=fr.width*sc,h=fr.height*sc;c.imageSmoothingEnabled=false;
  c.fillStyle='rgba(0,0,0,.35)';c.fillRect(W/2-w*0.35,H-9,w*0.7,3);
  c.drawImage(fr,Math.round(W/2-w/2),Math.round(H-8-h+Math.abs(Math.sin(run*11))*-1.5),Math.round(w),Math.round(h));
  /* visage du Mask dans la barre d'état, à la Doom */
  c.fillStyle='#2a2420';c.fillRect(2,H-26,24,24);if(face.complete&&face.naturalWidth){c.drawImage(face,3,H-25,22,22)}
}
 function shade(col,s){var r=col&255,g=(col>>8)&255,b=(col>>16)&255;return (255<<24)|(((b*s)|0)<<16)|(((g*s)|0)<<8)|((r*s)|0)}
 function loop(t){if(!alive)return;var dt=Math.max(0,Math.min(0.05,(t-last)/1000));last=t;if(!document.hidden){run+=dt;step(dt);cast()}requestAnimationFrame(loop)}
 requestAnimationFrame(loop);
 return{stop:function(){alive=false;removeEventListener('keydown',key_);cv.remove()},mask:key}};
})();
