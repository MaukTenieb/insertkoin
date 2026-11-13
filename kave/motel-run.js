/* Motel infini : rendu par lancer de rayons, à la Doom, en basse définition, en couleur.
   Un des 18 Masks, tiré au hasard, court de dos dans les couloirs d'un motel sans fin ;
   la caméra le suit à un pas derrière lui, sur sa trace ; il prend seul les bifurcations, au hasard, et tourne avant les murs.
   Les Masks reprennent les figures cubiques de SkopoRhogo (human() et CHAR), vues de dos, à leur taille (toise du vidéoclub).
   Flèches tenues : virage libre et immédiat, à la Doom ; devant un mur, il freine et dévie ; le pilote reprend après 2,5 s sans commande.
   Buste du Mask dans le coin, en pleine résolution. Mouvement réduit : marche lente, caméra sans balancement. */
(function(){
var W=240,H=150,FOV=0.66,CEIL=2.7,CAMD=1.15;
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
var CEILT=tex(function(x,y){return (x%16===0||y%16===0)?rgb(150,142,120):rgb(196,188,164)});
var LAMP=tex(function(x,y){return (x>6&&x<26&&y>11&&y<21)?rgb(246,244,226):(x%16===0||y%16===0)?rgb(150,142,120):rgb(196,188,164)});

/* ---------- les Masks de dos, d'après SkopoRhogo : 1 pixel = 0,025 unité de human() ---------- */
var U=0.025,CH=56;
function pen(c,cw){var g={ox:0};
 function px(i,j,col){if(typeof col==='function')col=col(i,j);if(!col)return;c.fillStyle=col;c.fillRect(i,j,1,1)}
 g.X=function(x){return cw/2+(x+g.ox)/U};g.Y=function(y){return CH-y/U};
 g.R=function(x0,y0,x1,y1,col){var i0=Math.round(g.X(x0)),i1=Math.round(g.X(x1)),j0=Math.round(g.Y(y1)),j1=Math.round(g.Y(y0));if(i1<=i0)i1=i0+1;if(j1<=j0)j1=j0+1;
  if(typeof col==='string'){c.fillStyle=col;c.fillRect(i0,j0,i1-i0,j1-j0)}else for(var j=j0;j<j1;j++)for(var i=i0;i<i1;i++)px(i,j,col)};
 g.P=function(pts,col){var q=pts.map(function(p){return [g.X(p[0]),g.Y(p[1])]}),a=1e9,b=-1e9,e=1e9,d=-1e9;q.forEach(function(p){a=Math.min(a,p[0]);b=Math.max(b,p[0]);e=Math.min(e,p[1]);d=Math.max(d,p[1])});
  for(var j=Math.floor(e);j<Math.ceil(d);j++)for(var i=Math.floor(a);i<Math.ceil(b);i++){var x=i+.5,y=j+.5,inn=false;for(var k=0,l=q.length-1;k<q.length;l=k++){var A=q[k],B=q[l];if((A[1]>y)!==(B[1]>y)&&x<(B[0]-A[0])*(y-A[1])/(B[1]-A[1])+A[0])inn=!inn}if(inn)px(i,j,col)}};
 g.E=function(cx,cy,rx,ry,col){var X=g.X(cx),Y=g.Y(cy),ax=rx/U,ay=ry/U;for(var j=Math.floor(Y-ay);j<Math.ceil(Y+ay);j++)for(var i=Math.floor(X-ax);i<Math.ceil(X+ax);i++){var u=(i+.5-X)/ax,v=(j+.5-Y)/ay;if(u*u+v*v<=1)px(i,j,col)}};
 g.RR=function(cx,cy,w,h,an,col){var co=Math.cos(an),si=Math.sin(an);g.P([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(function(p){return [cx+p[0]*co-p[1]*si,cy+p[0]*si+p[1]*co]}),col)};
 return g}
function pat(base,alt,test){return function(i,j){return test(i,j)?alt:base}}
function hp(i,j){return hash(i,j,5)}
var EMB=pat('#7a2420','#e0b45a',function(i,j){return hp(i,j)%6===0}),LEO=pat('#d0a060','#2a1a10',function(i,j){return (i+2*j)%4===0}),
 BRASS=pat('#6a3e1e','#e0b84a',function(i,j){return (i+j)%3===0}),STUDS=pat('#141414','#d8d8d0',function(i,j){return i%3===1&&j%3===1}),
 MASK=pat('#c8322a','#f0e0c0',function(i,j){return hp(i,j)%5===0}),FEATHER=pat('#1f7a5e','#2a50a8',function(i,j){return j%4===1}),
 BRONZE=pat('#a8683a','#e0a868',function(i,j){return j%4===0||i%7===3}),STRIPES=function(i,j){return (j>>1)&1?'#ece4cc':'#5e5a40'},
 PIN=pat('#1a1a1c','#8a8a8a',function(i){return i%3===0}),RIB=pat('#1a1a1a','#3a3a3a',function(i){return i%3===0}),
 FLORAL=pat('#3e9a4a','#f4f0d8',function(i,j){return hp(i,j)%6===0}),WING=pat('#121418','#2a8a74',function(i,j){return hp(i,j)%13===0});
/* human(o) de SkopoRhogo, de dos : gauche et droite du spectateur (la figure regarde au loin) */
function man(g,o,f,ox){g.ox=ox||0;var ph=[0,1,0,-1][f],sk=o.skin;
 [-1,1].forEach(function(s){var lift=(s<0?ph>0:ph<0)?0.075:0,x0=s<0?-0.13:0.02,x1=s<0?-0.02:0.13;
  g.R(x0,0.06+lift,x1,0.44,o.legs||o.bottom);g.R(s<0?-0.135:0.015,lift,s<0?-0.015:0.135,0.06+lift,o.shoes)});
 if(o.skirt){var r=o.skirtR||0.24;g.P([[-0.17,0.5],[0.17,0.5],[r,0.5-o.skirt],[-r,0.5-o.skirt]],o.skirtMat||o.top)}
 [-1,1].forEach(function(s){if(o.raise===s)return;var sh=(s<0?ph<0:ph>0)?0.05:0,a0=s<0?-0.255:0.165,col=(s<0?o.sleeveL:o.sleeveR)||o.sleeve||o.top;
  g.R(a0,0.48+sh,a0+0.09,0.78,col);g.R(a0+0.005,0.41+sh,a0+0.085,0.49+sh,o.hand||sk);if(s<0&&o.hold)o.hold(g,a0,0.41+sh)});
 g.R(-0.16,0.44,0.16,0.80,o.top);if(o.torso)o.torso(g,f);
 g.R(-0.05,0.795,0.05,0.865,o.neck||sk);
 var hs=o.hs||0.22,hy=o.hy||0.95;if(o.head!==false)g.R(-hs/2,hy-hs/2,hs/2,hy+hs/2,o.headMat||sk);
 if(o.hair)o.hair(g,hy,f)}
function cap(g,hy,col,top){top=top||0.09;g.R(-0.12,hy+top-0.035,0.12,hy+top+0.035,col);g.R(-0.12,hy-0.06,0.12,hy+0.10,col)}
function long(g,hy,col,len){cap(g,hy,col);g.R(-0.135,hy+0.1-len,0.135,hy+0.1,col);g.R(-0.145,hy-0.18,-0.105,hy+0.12,col);g.R(0.105,hy-0.18,0.145,hy+0.12,col)}
function hat(g,hy,brim,crown,band){g.P([[-0.14,hy+0.125],[0.14,hy+0.125],[0.115,hy+0.275],[-0.115,hy+0.275]],crown);g.R(-0.143,hy+0.135,0.143,hy+0.17,band);
 g.R(-0.27,hy+0.11,0.27,hy+0.14,brim);g.R(-0.27,hy+0.14,-0.23,hy+0.165,brim);g.R(0.23,hy+0.14,0.27,hy+0.165,brim)}
/* s : stature en mètres (toise du vidéoclub) ; ref : hauteur de la figure en unités de human() */
var M={
 aube:{s:1.68,d:function(g,f){var sk='#f0c0a0';man(g,{skin:sk,top:BRONZE,sleeve:sk,bottom:sk,legs:sk,shoes:'#6a3e1e',skirt:0.24,skirtMat:'#e8907a',skirtR:0.25,
  torso:function(g){g.R(-0.265,0.76,-0.135,0.84,'#8a5028');g.R(0.135,0.76,0.265,0.84,'#8a5028')},
  hair:function(g,hy){var h='#f28ab4';g.R(-0.125,hy+0.065,0.125,hy+0.135,h);g.R(-0.125,hy-0.12,0.125,hy+0.1,h);g.R(-0.1475,hy-0.13,-0.1025,hy+0.09,h);g.R(0.1025,hy-0.13,0.1475,hy+0.09,h)}},f)}},
 auvergne:{s:1.78,d:function(g,f){man(g,{skin:'#e8c0a0',top:STRIPES,bottom:'#3a3a30',shoes:'#2a2018',torso:function(g){g.R(-0.16,0.45,0.16,0.79,'#5a6040')},
  hair:function(g,hy){g.R(-0.115,hy+0.1,0.115,hy+0.13,'#b0906a')}},f)}},
 c7h5n3o6:{s:1.98,line:1,d:function(g,f){man(g,{skin:'#6a9a88',neck:'#151515',top:'#b8bcc0',sleeve:'#a8acb2',bottom:'#9ea2a8',shoes:'#7a7e84',hand:'#a8acb2',
  torso:function(g){g.R(-0.295,0.75,-0.145,0.85,'#c8ccd0');g.R(0.145,0.75,0.295,0.85,'#c8ccd0')},hair:function(g,hy){g.R(-0.12,hy+0.085,0.12,hy+0.135,'#557a6c')}},f)}},
 cadaver_synod:{s:1.88,d:function(g,f){man(g,{skin:'#e0b090',headMat:MASK,top:STUDS,sleeve:STUDS,bottom:'#1a1a1a',shoes:'#0e0e0e',
  hair:function(g){[-1,1].forEach(function(sx){for(var i=0;i<3;i++)g.RR(-sx*0.17,0.92,0.05,0.3,-sx*(-0.3+i*0.35),FEATHER)})}},f)}},
 croisiere_noire:{s:1.6,ref:1.0,d:function(g,f){var k='#1c1c22',hn='#f0e6d0',ph=[0,1,0,-1][f];
  g.R(-0.34,0.8,-0.16,0.86,hn);g.R(0.16,0.8,0.34,0.86,hn);g.R(-0.36,0.84,-0.3,1.0,hn);g.R(0.3,0.84,0.36,1.0,hn);
  [-1,1].forEach(function(s){var l=(s<0?ph>0:ph<0)?0.06:0,x0=s<0?-0.215:0.085;g.R(x0,0.04+l,x0+0.13,0.44,k);g.R(x0-0.005,l,x0+0.135,0.06+l,'#3a3030')});
  g.R(-0.23,0.4,0.23,0.84,k);g.R(-0.21,0.8,0.21,0.96,k)}},
 dogxim:{s:1.55,d:function(g,f){man(g,{skin:'#5a3a28',top:'#e85e4e',sleeve:'#e85e4e',bottom:'#3a3a4a',shoes:'#2a2a2a',
  hold:function(g,x0,y0){g.R(x0+0.025,y0-0.17,x0+0.055,y0+0.02,'#b08050');g.R(x0-0.01,y0-0.23,x0+0.09,y0-0.16,'#5a5e66')},
  hair:function(g,hy){cap(g,hy,'#0e0e0e',0.1);[0.08,-0.08,0,0.09,-0.09].forEach(function(x,i){g.R(x-0.035,hy+0.125,x+0.035,hy+(i%2?0.155:0.175),'#0e0e0e')})}},f)}},
 grand_colonel:{s:1.80,d:function(g,f){var o='#5a6a3a';man(g,{skin:'#ecc4a4',top:o,bottom:o,shoes:'#111',
  torso:function(g){g.R(-0.165,0.49,0.165,0.53,'#1a1a1a');g.R(-0.23,0.795,-0.13,0.825,'#6e7e48');g.R(0.13,0.795,0.23,0.825,'#6e7e48')},hair:function(g,hy){cap(g,hy,'#b4b4b4',0.085)}},f)}},
 hatra_loves:{s:1.80,d:function(g,f){man(g,{skin:'#e2aa82',top:'#cdb68c',bottom:'#6b5a44',shoes:'#4a3020',torso:function(g){g.RR(0,0.62,0.07,0.5,-0.75,BRASS)},
  hair:function(g,hy){g.R(-0.12,hy-0.07,0.12,hy+0.05,'#5a3a22');hat(g,hy,'#d8c8a4','#e0d0ac','#7a5a3a')}},f)}},
 honey_buzzard:{s:1.98,d:function(g,f){man(g,{skin:'#e8c4a4',top:'#141418',bottom:'#141418',shoes:'#0a0a0a',head:false,hair:function(g,hy){g.E(0,hy+0.02,0.15,0.15,'#0e0e14')}},f)}},
 maiden_call:{s:1.65,d:function(g,f){var sk='#f2d0b0';man(g,{skin:sk,top:'#4a78a8',bottom:sk,legs:sk,shoes:'#d8c4a0',skirt:0.36,skirtMat:'#4a78a8',skirtR:0.21,raise:1,
  hair:function(g,hy){long(g,hy,'#0e0e10',0.48);g.R(0.17,0.72,0.25,0.92,'#4a78a8');g.R(0.12,hy-0.09,0.16,hy+0.12,'#e2d2b0');g.R(0.13,hy-0.03,0.21,hy+0.05,sk)}},f)}},
 malika:{s:1.68,d:function(g,f){var sk='#e0b090',h='#0e0e10';man(g,{skin:sk,top:'#4e5a3a',sleeve:sk,bottom:'#2a2a30',shoes:'#2a2018',
  hair:function(g,hy){long(g,hy,h,0.38);g.R(-0.15,hy-0.21,0.15,hy-0.15,h);g.R(0.12,hy+0.03,0.2,hy+0.09,h)}},f)}},
 naphta:{s:1.72,d:function(g,f){var sk='#6b4430';man(g,{skin:sk,top:'#e05a2a',bottom:sk,legs:sk,shoes:'#151515',sleeveL:sk,sleeveR:'#151515',hand:sk,skirt:0.3,skirtMat:'#e05a2a',
  torso:function(g){g.R(-0.16,0.44,0,0.8,'#e05a2a');g.R(0,0.44,0.16,0.8,'#151515')},
  hair:function(g,hy){g.R(-0.12,hy-0.02,0.12,hy+0.13,'#111');g.R(-0.135,hy-0.06,-0.115,hy-0.02,'#e0e0e0');g.R(-0.16,hy+0.22,0.16,hy+0.27,'#ffe680');g.R(-0.11,hy+0.235,0.11,hy+0.255,'#b89a40')}},f)}},
 plague_of_justinian:{s:1.92,d:function(g,f){man(g,{skin:'#a87458',top:RIB,sleeve:RIB,bottom:'#26262c',shoes:'#141414',head:false,
  hair:function(g,hy){var y0=hy+0.08;[[0,0.04,0.17],[0.15,0,0.13],[-0.15,0.02,0.14],[0,0.17,0.13],[0.08,0.1,0.13],[-0.09,0.1,0.12],[-0.2,0.12,0.1],[0.2,0.08,0.1]].forEach(function(s){g.E(s[0],y0+s[1],s[2],s[2],'#6e737c');g.E(s[0],y0+s[1]+0.01,s[2]-0.03,s[2]-0.03,'#868c96')})}},f)}},
 poisoned_well:{s:1.35,d:function(g,f){man(g,{skin:'#f0d4b4',hs:0.27,hy:0.98,top:PIN,sleeve:PIN,bottom:PIN,shoes:'#0a0a0a'},f)}},
 silent_pact:{s:1.98,ref:1.27,d:function(g,f){var k='#141416',v=[0,1,0,-1][f]*0.025;g.P([[-0.12,0.95],[0.12,0.95],[0.3+v,0],[-0.3+v,0]],k);g.R(-0.01,0.08,0.015,0.86,'#24242a');
  g.E(0,0.98,0.14,0.175,k);g.P([[-0.11,1.07],[0.11,1.07],[0,1.27]],k)}},
 truce:{s:1.75,cw:44,d:function(g,f){var sk='#ecc8a0',hc=function(g,hy){cap(g,hy,'#111')};
  man(g,{skin:sk,top:'#9a9a9e',neck:'#9a9a9e',bottom:'#3a3a3e',shoes:'#1a1a1a',hair:hc},f,0.25);man(g,{skin:sk,top:'#c49a38',bottom:'#3a3a3e',shoes:'#1a1a1a',hair:hc},(f+2)%4,-0.25)}},
 tsui_pen:{s:1.68,d:function(g,f){man(g,{skin:'#e8c8a0',top:FLORAL,sleeve:FLORAL,bottom:'#6a6a5a',shoes:'#4a3020',
  hair:function(g,hy,f){var w='#f2f2ee',k=Math.cos(0.45+[0,0.35,0,-0.35][f]);g.R(-0.125,hy+0.075,0.125,hy+0.125,w);g.R(-0.125,hy-0.04,0.125,hy+0.1,w);g.R(-0.14,hy-0.04,-0.1,hy+0.08,w);g.R(0.1,hy-0.04,0.14,hy+0.08,w);
   [-1,1].forEach(function(v){g.RR(v*(0.04+0.18*k),0.82,0.34*k,0.3,v*0.25,WING);g.RR(v*(0.04+0.12*k),0.6,0.22*k,0.2,-v*0.3,WING)})}},f)}},
 unkle_maukie:{s:1.78,d:function(g,f){man(g,{skin:'#f0c8a8',top:EMB,bottom:'#5a4030',shoes:'#6a3a1e',hair:function(g,hy){hat(g,hy,'#e2d2ae','#e8dab8',LEO)}},f)}}};
var KEYS=Object.keys(M);
/* contour sombre d'un pixel autour de la silhouette */
function outline(cv){var c=cv.getContext('2d'),w=cv.width,h=cv.height,d=c.getImageData(0,0,w,h),a=d.data,o=c.createImageData(w,h),b=o.data;
 for(var y=0;y<h;y++)for(var x=0;x<w;x++){if(a[(y*w+x)*4+3])continue;var n=(x>0&&a[(y*w+x-1)*4+3])||(x<w-1&&a[(y*w+x+1)*4+3])||(y>0&&a[((y-1)*w+x)*4+3])||(y<h-1&&a[((y+1)*w+x)*4+3]);
  if(n){var i=(y*w+x)*4;b[i]=18;b[i+1]=20;b[i+2]=22;b[i+3]=255}}
 var t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').putImageData(o,0,0);c.drawImage(t,0,0)}
function sprites(key){var m=M[key],cw=m.cw||38;return [0,1,2,3].map(function(f){var cv=document.createElement('canvas');cv.width=cw;cv.height=CH;m.d(pen(cv.getContext('2d'),cw),f);if(m.line)outline(cv);return cv})}

window.MotelRun=function(host,want){
 var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 var cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.className='mrun';cv.setAttribute('role','img');cv.setAttribute('aria-label','Motel');cv.tabIndex=0;
 cv.style.cssText='image-rendering:pixelated;image-rendering:crisp-edges;display:block;width:100%;height:100%;outline:0;touch-action:manipulation;filter:grayscale(1) contrast(1.12) brightness(1.05)';var bw=true;
 host.appendChild(cv);var c=cv.getContext('2d'),img=c.createImageData(W,H),buf=new Uint32Array(img.data.buffer),zb=new Float32Array(W);
 var key=M[want]?want:KEYS[Math.floor(Math.random()*KEYS.length)],m=M[key],frames=sprites(key);
 /* le buste du Mask, net, seul, dans le coin */
 var face=document.createElement('img');face.src='a/b-'+key+'.webp';face.alt='';face.className='mrun-buste';
 face.style.cssText='position:absolute;left:2%;bottom:2.5%;height:20%;width:auto;pointer-events:none;image-rendering:auto';
 host.appendChild(face);
 var px=0.5,py=0.5,dir=0,ang=0,speed=reduce?1.0:3.8,last=performance.now(),gait=0,alive=true,turn=0,idle=9,pendT=0,cell=-1,auto=true,odo=0,lastT=-9;
 var DX=[1,0,-1,0],DY=[0,1,0,-1],held={},ptr=null,tq=0,TURN=1.55,RAD=0.34,hT=0,stuck=0,lane=-1,trail=[],cx=0,cy=0,ca=0,depth=CAMD;
 var st={t:0,minClear:9,minFront:99,minDepth:99,contacts:0,cuts:0};
 var KM={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d',a:'l',q:'l',d:'r',w:'u',z:'u',s:'d'};
 function own(e){return !(e.target&&e.target.closest&&e.target.closest('input,textarea,.win'))}
 function key_(e){if(!alive||!own(e))return;var k=KM[e.key.length===1?e.key.toLowerCase():e.key];if(!k)return;held[k]=1;idle=0;if(e.key.indexOf('Arrow')===0)e.preventDefault()}
 function keyu_(e){var k=KM[e.key.length===1?e.key.toLowerCase():e.key];if(k)held[k]=0}
 function blur_(){held={};ptr=null}
 addEventListener('keydown',key_);addEventListener('keyup',keyu_);addEventListener('blur',blur_);
 function down_(e){var r=cv.getBoundingClientRect();ptr={x:e.clientX,x0:e.clientX,t0:Date.now(),cx:r.left+r.width/2,w:r.width};idle=0}
 cv.addEventListener('pointerdown',function(e){down_(e);try{cv.setPointerCapture(e.pointerId)}catch(_){}});
 cv.addEventListener('pointermove',function(e){if(ptr){ang+=(e.clientX-ptr.x)*0.0055;ptr.x=e.clientX;idle=0}});
 function up_(){if(ptr&&Date.now()-ptr.t0<300&&Math.abs(ptr.x-ptr.x0)<10)tq+=(ptr.x0<ptr.cx?-1:1)*Math.PI/2;ptr=null}cv.addEventListener('pointerup',up_);cv.addEventListener('pointercancel',up_);
 function open_(x,y){return !solid(Math.floor(x),Math.floor(y))}
 function wrap(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a}
 function free(gx,gy,d){return !solid(gx+DX[d],gy+DY[d])}
 /* distance au mur le long d'une direction */
 function probe(a,max){var dx=Math.cos(a)*0.04,dy=Math.sin(a)*0.04,x=px,y=py;for(var d=0;d<max;d+=0.04){if(!open_(x,y))return d;x+=dx;y+=dy}return max}
 /* distance du Mask au mur le plus proche */
 function clear_(){var gx=Math.floor(px),gy=Math.floor(py),best=9;for(var j=-1;j<=1;j++)for(var i=-1;i<=1;i++){if(!solid(gx+i,gy+j))continue;
  var qx=Math.max(gx+i,Math.min(px,gx+i+1)),qy=Math.max(gy+j,Math.min(py,gy+j+1));best=Math.min(best,Math.hypot(px-qx,py-qy))}return best}
 function step(dt){var man_=held.l||held.r||held.u||held.d||ptr||tq;if(man_)idle=0;else idle+=dt;var tr=0,sp=speed,gx=Math.floor(px),gy=Math.floor(py);
  if(idle<2.5){/* le joueur tient la course ; devant un mur, il freine et dévie */
   /* 12 nov. (Mauk Tenieb) : gauche et droite seulement, braquage divisé par deux (89 °/s, contre 123 °/s pour la marche de Doom), départ lent les 0,17 premières secondes comme Doom ; zéro freinage, zéro piétinement ; à un angle de mur, le Mask glisse vite vers la travée la plus proche */
   auto=false;var tg=(held.r?1:0)-(held.l?1:0);if(ptr){var o=(ptr.x-ptr.cx)/(ptr.w/2);if(Math.abs(o)>0.25)tg+=Math.max(-1,Math.min(1,o))}tg=Math.max(-1,Math.min(1,tg));
   hT=tg?hT+dt:0;tr=tg*TURN*(hT<0.17?0.5:1);
   if(tq){var qa=Math.min(Math.abs(tq),TURN*1.3*dt),qs=tq>0?1:-1;tr+=qs*qa/dt;tq-=qs*qa;if(Math.abs(tq)<1e-3)tq=0}
   /* 12 nov., 23 h 13 (Mauk Tenieb : « arrête de vibrer […] à la Quake ou à la Doom ») : zéro virage forcé ; le glissement se règle au contact du mur, plus bas */
   ang+=tr*dt;pendT=0}
  else{/* pilote automatique : couloir, centre, bifurcations au hasard, virage engagé dès l'entrée du carrefour */
   var id=gx*100003+gy,cxm=gx+0.5,cym=gy+0.5;
   if(!auto){auto=true;var bd=dir,bs=-9;for(var d0=0;d0<4;d0++){if(!free(gx,gy,d0))continue;var sc=Math.cos(ang-d0*Math.PI/2);if(sc>bs){bs=sc;bd=d0}}dir=bd;cell=id;pendT=0}
   if(id!==cell){cell=id;pendT=0;var o2=[1,3].filter(function(t){return free(gx,gy,(dir+t)%4)});
    if(!free(gx,gy,dir))pendT=o2.length?o2[Math.floor(Math.random()*o2.length)]:2;/* mur une case devant : virage obligé */
    else if(o2.length&&odo-lastT>2.2&&Math.random()<0.4)pendT=o2[Math.floor(Math.random()*o2.length)]}
   var along=(cxm-px)*DX[dir]+(cym-py)*DY[dir];if(pendT&&along<0.3){dir=(dir+pendT)%4;pendT=0;lastT=odo}
   var lat=(cxm-px)*(-DY[dir])+(cym-py)*DX[dir],want=dir*Math.PI/2+Math.max(-0.6,Math.min(0.6,lat*2)),dd=wrap(want-ang);
   tr=Math.max(-5.5,Math.min(5.5,dd*10));ang+=Math.max(-Math.abs(dd),Math.min(Math.abs(dd),tr*dt));sp=speed*(Math.abs(dd)>0.6?0.6:1)}
  turn+=(tr-turn)*Math.min(1,dt*12);
  /* glisse le long des murs */
  /* glisse le long des murs, comme Doom et Quake : la composante qui bute s'annule, l'autre garde au moins 75 % de la vitesse ; de front, le Mask part du côté le plus ouvert ; au contact, le cap s'aligne sur le mur sans dépasser (pas d'oscillation) */
  var vx=Math.cos(ang)*sp*dt,vy=Math.sin(ang)*sp*dt,V=sp*dt;
  function okX(nx){var s2=nx>px?RAD:-RAD;return open_(nx+s2,py-RAD+0.001)&&open_(nx+s2,py+RAD-0.001)}
  function okY(ny){var s2=ny>py?RAD:-RAD;return open_(px-RAD+0.001,ny+s2)&&open_(px+RAD-0.001,ny+s2)}
  var bx=!okX(px+vx),by=!okY(py+vy),slide=null;
  if(bx&&!by){var cy2=Math.abs(vy)<0.15*V?(probe(Math.PI/2,2)>=probe(-Math.PI/2,2)?1:-1)*0.75*V:(vy>0?1:-1)*Math.max(Math.abs(vy),0.75*V);if(okY(py+cy2))py+=cy2;slide=cy2>0?Math.PI/2:-Math.PI/2}
  else if(by&&!bx){var cx2=Math.abs(vx)<0.15*V?(probe(0,2)>=probe(Math.PI,2)?1:-1)*0.75*V:(vx>0?1:-1)*Math.max(Math.abs(vx),0.75*V);if(okX(px+cx2))px+=cx2;slide=cx2>0?0:Math.PI}
  else if(bx&&by){var cands=[[0.75*V,0,0],[-0.75*V,0,Math.PI],[0,0.75*V,Math.PI/2],[0,-0.75*V,-Math.PI/2]].filter(function(c){return c[0]?okX(px+c[0]):okY(py+c[1])}).sort(function(a,b){return Math.cos(b[2]-ang)-Math.cos(a[2]-ang)});if(cands.length){px+=cands[0][0];py+=cands[0][1];slide=cands[0][2]}}
  else{px+=vx;py+=vy}
  if(slide!=null&&!auto&&!tq&&!((held.l||held.r)||(ptr&&Math.abs((ptr.x-ptr.cx)/(ptr.w/2))>0.25))){var dd3=wrap(slide-ang),st3=Math.min(Math.abs(dd3),9*dt);ang+=dd3>0?st3:-st3}
  stuck=slide!=null?stuck+dt:0;
  ang=wrap(ang);gait+=sp*dt*3.4;odo+=sp*dt;camera()}
 function sight(x,y){var n=Math.ceil(Math.hypot(px-x,py-y)/0.05);for(var i=1;i<n;i++){var t=i/n;if(!open_(x+(px-x)*t,y+(py-y)*t))return false}return true}
 /* caméra sur la trace du Mask, un pas derrière lui, tournée vers lui */
 function reseed(){var b=Math.min(CAMD,probe(ang+Math.PI,CAMD+0.3)-0.2);trail=[[px-Math.cos(ang)*b,py-Math.sin(ang)*b],[px,py]];st.cuts++}
 function camera(){var L=trail[trail.length-1];if(!L||Math.hypot(px-L[0],py-L[1])>0.03)trail.push([px,py]);if(trail.length>500)trail.shift();
  var q=null;for(var i=trail.length-2;i>=0;i--){var A=trail[i];if(!sight(A[0],A[1])){q=trail[i+1];break}if(Math.hypot(A[0]-px,A[1]-py)>=CAMD){var B=trail[i+1],lo=0,hi=1;for(var k=0;k<10;k++){var mid=(lo+hi)/2,x=A[0]+(B[0]-A[0])*mid,y=A[1]+(B[1]-A[1])*mid;if(Math.hypot(x-px,y-py)>=CAMD)lo=mid;else hi=mid}q=[A[0]+(B[0]-A[0])*lo,A[1]+(B[1]-A[1])*lo];break}}
  if(!q){q=trail[0];if(Math.hypot(q[0]-px,q[1]-py)<0.3){reseed();q=trail[0]}}
  var hx=Math.cos(ang),hy=Math.sin(ang),rx=px-q[0],ry=py-q[1],rl=Math.hypot(rx,ry)||1;
  if((rx*hx+ry*hy)/rl<-0.3){reseed();q=trail[0];rx=px-q[0];ry=py-q[1];rl=Math.hypot(rx,ry)||1}
  cx=q[0];cy=q[1];ca=Math.atan2(ry,rx);depth=rl}
 function cast(){
  var dx=Math.cos(ca),dy=Math.sin(ca),plx=-dy*FOV,ply=dx*FOV,bob=reduce?0:Math.sin(gait*3.2)*1.2;
  /* sol et plafond */
  for(var y=0;y<H;y++){var p=y-H/2-bob;if(Math.abs(p)<0.5)p=0.5;var rd=(H/2)/Math.abs(p),fl=p>0;
   var rx0=dx-plx,ry0=dy-ply,sx=(2*plx)*rd/W,sy=(2*ply)*rd/W,fx=cx+rd*rx0,fy=cy+rd*ry0,sh=Math.max(0.12,1-rd/9);
   for(var x=0;x<W;x++){var gx=Math.floor(fx),gy=Math.floor(fy),tx=(32*(fx-gx))&31,ty=(32*(fy-gy))&31,col;
    if(fl)col=CARPET[ty*32+tx];else col=((gx+gy)%3===0?LAMP:CEILT)[ty*32+tx];
    buf[y*W+x]=shade(col,sh);fx+=sx;fy+=sy}}
  /* murs */
  for(var x=0;x<W;x++){var cam=2*x/W-1,rx=dx+plx*cam,ry=dy+ply*cam,mx=Math.floor(cx),my=Math.floor(cy),ddx=Math.abs(1/rx),ddy=Math.abs(1/ry),stx,sty,sdx,sdy,side,hit=0,n=0;
   if(rx<0){stx=-1;sdx=(cx-mx)*ddx}else{stx=1;sdx=(mx+1-cx)*ddx}if(ry<0){sty=-1;sdy=(cy-my)*ddy}else{sty=1;sdy=(my+1-cy)*ddy}
   while(!hit&&n++<64){if(sdx<sdy){sdx+=ddx;mx+=stx;side=0}else{sdy+=ddy;my+=sty;side=1}if(solid(mx,my))hit=1}
   var pd=side===0?sdx-ddx:sdy-ddy;if(!hit)pd=40;zb[x]=pd;var lh=Math.floor(H/pd),y0=Math.floor(H/2-lh/2+bob),y1=y0+lh;
   var wx=side===0?cy+pd*ry:cx+pd*rx;wx-=Math.floor(wx);var tx=(wx*32)&31,T=hash(mx,my,side)%4===0?DOOR:WALL,sh=Math.max(0.1,1-pd/9)*(side?0.82:1);
   for(var y=Math.max(0,y0);y<Math.min(H,y1);y++){var ty=(((y-y0)*32/lh)|0)&31;buf[y*W+x]=shade(T[ty*32+tx],sh)}}
  c.putImageData(img,0,0);
  /* le Mask, de dos, à sa taille, les pieds sur la moquette ; caché par les murs plus proches que lui */
  var rx_=px-cx,ry_=py-cy,dz=rx_*dx+ry_*dy,lx=-rx_*dy+ry_*dx;if(dz<0.3)dz=0.3;
  var fr=frames[Math.floor(gait)%4],k=(m.s/CEIL)*(H/dz)/((m.ref||1.06)/U),w=fr.width*k,h=fr.height*k,sxc=W/2*(1+lx/(dz*FOV)),feet=H/2+bob+(H/2)/dz;
  var x0=Math.round(sxc-w/2),y0_=Math.round(feet-h),hh=Math.round(h);c.imageSmoothingEnabled=false;if(bw)c.filter='brightness(1.35)';/* 10 nov. (Mauk Tenieb, 21 h 05) : en noir et blanc, le Mask se détache en gris clair */
  for(var xs=Math.max(0,x0);xs<Math.min(W,x0+Math.round(w));xs++){if(zb[xs]<dz)continue;var si=Math.floor((xs+0.5-x0)/k);if(si>=0&&si<fr.width)c.drawImage(fr,si,0,1,fr.height,xs,y0_,1,hh)}c.filter='none';
  st.minFront=Math.min(st.minFront,zb[W>>1]);st.minDepth=Math.min(st.minDepth,dz)}
 function shade(col,s){var r=col&255,g=(col>>8)&255,b=(col>>16)&255;return (255<<24)|(((b*s)|0)<<16)|(((g*s)|0)<<8)|((r*s)|0)}
 function loop(t){if(!alive)return;/* 10 nov. (Mauk Tenieb, 21 h 11) : en fond d'écran, noir et blanc ; dès que le visiteur prend la course en main, le jeu passe en couleur */var nb=idle>=2.5;if(nb!==bw){bw=nb;cv.style.filter=bw?'grayscale(1) contrast(1.12) brightness(1.05)':'none'}var dt=Math.max(0,Math.min(0.05,(t-last)/1000));last=t;if(!document.hidden){st.t+=dt;step(dt);var cl=clear_();st.minClear=Math.min(st.minClear,cl);if(cl<0.3)st.contacts++;cast()}requestAnimationFrame(loop)}
 reseed();st.cuts=0;requestAnimationFrame(loop);
 var api={stop:function(){alive=false;removeEventListener('keydown',key_);removeEventListener('keyup',keyu_);removeEventListener('blur',blur_);cv.remove();face.remove()},mask:key,st:st,
  down:down_,up:up_,move:function(e){if(ptr){ang+=(e.clientX-ptr.x)*0.0055;ptr.x=e.clientX;idle=0}},
  pos:function(){return {px:px,py:py,ang:ang,cx:cx,cy:cy,depth:depth,auto:auto}}};
 window.MotelRun.cur=api;return api};
})();
