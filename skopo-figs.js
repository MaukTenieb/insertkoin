/* skopo-figs.js — généré par tools/skopo-figs.py depuis skoporhogo.html ; ne pas retoucher à la main.
   Les 18 Masks de SkopoRhogo (corps 3D, three.js r128) pour les autres lieux du motel : Musik d'abord.
   15 nov. 2026 (Mauk Tenieb : « il faut ici non pas les noms, qui sont verbeux, mais les figurines 3D de Skoporhogo ») */
(function(){'use strict';
if(window.SkopoFigs||!window.THREE)return;
const THREE=window.THREE, scene=null, CS=1.25, PI=Math.PI;
let seed=1337;
function rnd(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }
const R=(a,b)=>a+(b-a)*Math.random();
const pick=a=>a[(Math.random()*a.length)|0];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };


const toC=v=>typeof v==='string'?new THREE.Color(v):new THREE.Color(v,v,v);
const gs=v=>typeof v==='string'?v:(v=Math.round(clamp(v,0,1)*255),`rgb(${v},${v},${v})`);
const mcache={};
function M(g){ return mcache[g]||(mcache[g]=new THREE.MeshLambertMaterial({color:toC(g)})); }
function Mu(g){ return new THREE.MeshLambertMaterial({color:toC(g)}); }    // unique (animated)
function MB(g){ return new THREE.MeshBasicMaterial({color:toC(g)}); }       // unlit
function T(size,draw,rep){
  const c=document.createElement('canvas'); c.width=c.height=size; const x=c.getContext('2d'); draw(x,size);
  const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0],rep[1]); return t;
}
function MT(tex,g=1,rep){ let t=tex; if(rep){ t=tex.clone(); t.needsUpdate=true; t.repeat.set(rep[0],rep[1]); }
  return new THREE.MeshLambertMaterial({map:t,color:toC(g)}); }
const F=(c,col,x,y,w,h)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); };
seed=7;
const TX={
  planks:T(64,(c,s)=>{ F(c,'#c08a52',0,0,s,s); c.fillStyle='#7a4e2a';
    for(let y=0;y<s;y+=16){ c.fillRect(0,y,s,1); c.fillRect(((y/16)%2)?18:46,y,1,16); }
    c.fillStyle='#a87444'; for(let i=0;i<46;i++) c.fillRect(rnd()*s|0,rnd()*s|0,2+rnd()*5|0,1); }),
  wall:T(32,(c,s)=>{ F(c,'#e9d9a6',0,0,s,s); c.fillStyle='#c9c48a'; c.fillRect(0,0,8,s); c.fillRect(16,0,8,s);
    c.fillStyle='#7a9a6a'; for(let y=4;y<s;y+=16){ c.fillRect(11,y,2,2); c.fillRect(27,y+8,2,2);} }),
  checker:T(16,(c,s)=>{ F(c,'#f2f0e6',0,0,s,s); F(c,'#1d2a3a',0,0,8,8); F(c,'#1d2a3a',8,8,8,8); }),
  tiles:T(16,(c,s)=>{ F(c,'#bfe3d6',0,0,s,s); F(c,'#7fb3a3',0,0,s,1); F(c,'#7fb3a3',0,0,1,s); }),
  rug:T(64,(c,s)=>{ F(c,'#a8322e',0,0,s,s); c.strokeStyle='#f0b040'; c.lineWidth=2; c.strokeRect(4,4,s-8,s-8); c.strokeStyle='#2a2a5a'; c.strokeRect(9,9,s-18,s-18);
    for(let y=16;y<s-12;y+=8) for(let x=16;x<s-12;x+=8) if(((x+y)/8)%2===0) F(c,'#f0b040',x,y,3,3); }),
  blanket:T(32,(c,s)=>{ F(c,'#8e2a3e',0,0,s,s); c.fillStyle='#d8b04a'; for(let y=0;y<s;y+=8) c.fillRect(0,y,s,2); }),
  wood:T(32,(c,s)=>{ F(c,'#6e4426',0,0,s,s); c.fillStyle='#55331c'; for(let i=0;i<14;i++) c.fillRect(0,rnd()*s|0,s,1); }),
  curtain:T(16,(c,s)=>{ F(c,'#e0902e',0,0,s,s); F(c,'#b8661c',0,0,3,s); F(c,'#b8661c',8,0,3,s); }),
  stripesH:T(8,(c,s)=>{ F(c,'#ece4cc',0,0,s,s); F(c,'#5e5a40',0,0,s,2); F(c,'#5e5a40',0,4,s,2); }),
  studs:T(8,(c,s)=>{ F(c,'#141414',0,0,s,s); F(c,'#d8d8d0',1,1,1,1); F(c,'#d8d8d0',5,5,1,1); }),
  brass:T(8,(c,s)=>{ F(c,'#6a3e1e',0,0,s,s); F(c,'#e0b84a',1,1,2,2); F(c,'#e0b84a',5,5,2,2); }),
  emb:T(16,(c,s)=>{ F(c,'#7a2420',0,0,s,s); c.fillStyle='#e0b45a'; for(let i=0;i<16;i++) c.fillRect(rnd()*s|0,rnd()*s|0,2,1); }),
  leo:T(8,(c,s)=>{ F(c,'#d0a060',0,0,s,s); F(c,'#2a1a10',1,1,2,2); F(c,'#2a1a10',5,4,2,2); }),
  mask:T(16,(c,s)=>{ F(c,'#c8322a',0,0,s,s); c.fillStyle='#f0e0c0'; for(let i=0;i<22;i++) c.fillRect(rnd()*s|0,rnd()*s|0,2,1); }),
  feather:T(8,(c,s)=>{ F(c,'#1f7a5e',0,0,s,s); F(c,'#2a50a8',2,3,3,3); F(c,'#e0c040',3,4,1,1); }),
  shirtRed:T(8,(c,s)=>{ F(c,'#c0302a',0,0,s,s); F(c,'#f0e0c0',1,2,2,1); F(c,'#f0e0c0',5,6,2,1); }),
  bronze:T(16,(c,s)=>{ F(c,'#a8683a',0,0,s,s); c.fillStyle='#e0a868'; c.fillRect(0,5,s,1); c.fillRect(0,11,s,1); c.fillRect(7,0,1,s); }),
  pin:T(8,(c,s)=>{ F(c,'#1a1a1c',0,0,s,s); F(c,'#8a8a8a',0,0,1,s); F(c,'#8a8a8a',4,0,1,s); }),
  floral:T(16,(c,s)=>{ F(c,'#3e9a4a',0,0,s,s); c.fillStyle='#f4f0d8';
    for(const [x,y] of [[3,3],[11,6],[5,11],[13,13]]){ c.fillRect(x-1,y,3,1); c.fillRect(x,y-1,1,3); } }),
  wing:T(16,(c,s)=>{ F(c,'#121418',0,0,s,s); F(c,'#3ac0a0',2,3,3,3); F(c,'#3a8ae0',10,6,3,2); F(c,'#3ac0a0',6,11,2,2);
    c.fillStyle='#2a6a5a'; c.fillRect(0,8,s,1); c.fillRect(8,0,1,s); }),
  rib:T(8,(c,s)=>{ F(c,'#1a1a1a',0,0,s,s); F(c,'#3a3a3a',0,0,1,s); F(c,'#3a3a3a',4,0,1,s); }),
  water:T(16,(c,s)=>{ F(c,'#5ab8d8',0,0,s,s); c.fillStyle='#d8f4ff'; c.fillRect(2,3,5,1); c.fillRect(9,9,5,1); c.fillRect(4,13,4,1); }),
};

// geometry helpers
const BG=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function mk(geo,mat,x=0,y=0,z=0,p=scene){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; p.add(m); return m; }
function bx(x0,y0,z0,x1,y1,z1,mat,p=scene){ return mk(BG(x1-x0,y1-y0,z1-z0),mat,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,p); }
function cyl(rt,rb,h,mat,x,y,z,seg=10,p=scene){ return mk(new THREE.CylinderGeometry(rt,rb,h,seg),mat,x,y,z,p); }

function eyes(h,m=M(.02),y=.01,z=.112,dx=.05){ mk(BG(.035,.035,.012),m,-dx,y,z,h); mk(BG(.035,.035,.012),m,dx,y,z,h); }
function human(o){
  const s=(o.s||1)*CS, g=new THREE.Group(), f={type:'human',g,legs:[],arms:[],s};
  for(const sx of [-1,1]){
    const p=new THREE.Group(); p.position.set(sx*.075,.44,0); g.add(p);
    mk(BG(.11,.42,.13),o.legs||o.bottom,0,-.21,0,p); mk(BG(.12,.06,.18),o.shoes,0,-.41,.025,p); f.legs.push(p);
  }
  f.torso=mk(BG(.32,.36,.19),o.top,0,.62,0,g);
  if(o.skirt) cyl(.17,o.skirtR||.24,o.skirt,o.skirtMat||o.top,0,.5-o.skirt/2,0,8,g);
  for(const sx of [-1,1]){
    const p=new THREE.Group(); p.position.set(sx*.21,.78,0); g.add(p);
    mk(BG(.09,.3,.1),(sx<0?o.sleeveL:o.sleeveR)||o.sleeve||o.top,0,-.14,0,p);
    mk(BG(.08,.08,.08),o.hand||o.skin,0,-.33,0,p); f.arms.push(p);
  }
  mk(BG(.1,.07,.1),o.neck||o.skin,0,.83,0,g);
  const head=new THREE.Group(); head.position.y=.95; g.add(head); f.head=head;
  if(o.head!==false){ mk(BG(o.hs||.22,o.hs||.22,o.hs||.22),o.headMat||o.skin,0,0,0,head); if(o.eyes!==false) eyes(head,o.eyeMat,.01,(o.hs||.22)/2+.002); }
  g.scale.setScalar(s); return f;
}
// accessories
function hairCap(h,m,top=.09){ mk(BG(.24,.07,.24),m,0,top,0,h); mk(BG(.24,.16,.06),m,0,.02,-.1,h); }
function hairLong(h,m,len=.42){ hairCap(h,m); mk(BG(.27,len,.07),m,0,.1-len/2,-.12,h); mk(BG(.04,.3,.2),m,-.125,-.03,-.01,h); mk(BG(.04,.3,.2),m,.125,-.03,-.01,h); }
function hat(h,brim,crown,band){ cyl(.27,.27,.025,brim,0,.125,0,14,h); cyl(.115,.14,.15,crown,0,.2,0,10,h); cyl(.143,.143,.035,band||crown,0,.15,0,10,h);
  mk(BG(.04,.035,.36),brim,-.25,.145,0,h); mk(BG(.04,.035,.36),brim,.25,.145,0,h); }
function beard(h,m,long=1){ mk(BG(.22,.12*long,.08),m,0,-.075-.03*(long-1),.085,h); mk(BG(.16,.035,.04),m,0,-.03,.12,h); }

const CHAR=[
 {k:'UnkleMaukie',n:'Unkle Maukie',sp:.95,p:{chess:1.6,chat:1.4,cook:1.8,cards:1.4,drinkSit:.5,water:1},build(){
   const f=human({skin:M('#f0c8a8'),top:MT(TX.emb),bottom:M('#5a4030'),shoes:M('#6a3a1e')});
   mk(BG(.1,.32,.01),M('#efe2c4'),0,.63,.097,f.g); beard(f.head,M('#f6f6f2'),1.3); hat(f.head,M('#e2d2ae'),M('#e8dab8'),MT(TX.leo)); return [f]; }},
 {k:'HatraLoves',n:'Hátra Lövés',sp:1,p:{tv:1.2,chat:1.1,cook:1.3,drink:1.6,drinkSit:1.8,cards:.7},build(){
   const f=human({skin:M('#e2aa82'),top:M('#cdb68c'),bottom:M('#6b5a44'),shoes:M('#4a3020')});
   const b=mk(BG(.07,.5,.21),MT(TX.brass,1,[1,4]),0,.62,0,f.g); b.rotation.z=.75;
   beard(f.head,M('#5a3a22')); mk(BG(.24,.12,.05),M('#5a3a22'),0,-.01,-.11,f.head); hat(f.head,M('#d8c8a4'),M('#e0d0ac'),M('#7a5a3a')); return [f]; }},
 {k:'Naphta',n:'Naphta',sp:1.05,p:{smoke:1.6,window:.5,chat:1.2,dance:1.3,phone:1.6,drink:1.5,drinkSit:.5},build(){
   const sk=M('#6b4430');
   const f=human({skin:sk,top:M('#e05a2a'),bottom:sk,legs:sk,shoes:M('#151515'),sleeveL:M('#151515'),sleeveR:sk,hand:sk,skirt:.3,skirtMat:M('#e05a2a')});
   f.torso.visible=false; mk(BG(.16,.36,.19),M('#151515'),-.08,.62,0,f.g); mk(BG(.16,.36,.19),M('#e05a2a'),.08,.62,0,f.g);
   mk(BG(.24,.06,.24),M('#111'),0,.1,0,f.head); mk(BG(.24,.12,.05),M('#111'),0,.04,-.1,f.head);
   mk(BG(.012,.012,.08),MB('#ffffff'),.04,-.06,.15,f.head); mk(BG(.014,.014,.014),MB('#ff7a2a'),.04,-.06,.19,f.head);
   mk(BG(.02,.04,.02),M('#e0e0e0'),.12,-.04,0,f.head);
   const halo=mk(new THREE.TorusGeometry(.14,.018,5,18),MB('#ffe680'),0,.24,0,f.head); halo.rotation.x=PI/2; halo.castShadow=false;
   f.fx=(t)=>{ halo.position.y=.24+Math.sin(t*2)*.015; }; return [f]; }},
 {k:'SilentPact',n:'Silent Pact',sp:.85,p:{chat:0,corner:5,tv:.2,wander:.6,dance:0,play:0,cook:0,eat:0,lounge:0,chess:.4,read:0,rest:0,phone:0,exercise:0,drink:0},noSeat:1,sleepStand:1,build(){
   const g=new THREE.Group(), f={type:'veil',g,legs:[],arms:[],s:CS}; g.scale.setScalar(CS); const k=M('#141416');
   cyl(.12,.3,.95,k,0,.475,0,12,g); const hd=mk(new THREE.SphereGeometry(.14,10,8),k,0,.98,0,g); hd.scale.y=1.25;
   mk(new THREE.ConeGeometry(.11,.2,10),k,0,1.17,-.02,g); return [f]; }},
 {k:'Truce',n:'Truce',sp:1,p:{chat:1.3,chess:1.4,exercise:.8,mirror:2.6,water:.4},build(){
   const sk=M('#ecc8a0');
   const a=human({s:.84,skin:sk,top:M('#9a9a9e'),neck:M('#9a9a9e'),bottom:M('#3a3a3e'),shoes:M('#1a1a1a')}); hairCap(a.head,M('#111'));
   const b=human({s:.84,skin:sk,top:M('#c49a38'),bottom:M('#3a3a3e'),shoes:M('#1a1a1a')}); hairCap(b.head,M('#111'));
   mk(BG(.02,.3,.01),M('#7a5a20'),0,.62,.097,b.g);
   a.g.position.x=-.21; b.g.position.x=.21; b.g.position.z=-.07;
   a.gesture=()=>{ a.arms[1].rotation.x=-PI/2; }; b.gesture=()=>{ b.arms[0].rotation.x=-2.7; b.arms[0].rotation.z=.15; };
   return [a,b]; }},
 {k:'CadaverSynod',n:'Cadaver Synod',sp:1,p:{tv:1.6,chat:.8,dance:1.5,flex:2},build(){
   const f=human({skin:M('#e0b090'),headMat:MT(TX.mask),eyes:false,top:MT(TX.studs,1,[3,3]),sleeve:MT(TX.studs,1,[1,3]),bottom:M('#1a1a1a'),shoes:M('#0e0e0e')});
   mk(BG(.06,.04,.012),M('#f0e0c0'),-.05,.02,.112,f.head); mk(BG(.06,.04,.012),M('#f0e0c0'),.05,.02,.112,f.head);
   mk(BG(.03,.025,.014),M('#111'),-.05,.02,.116,f.head); mk(BG(.03,.025,.014),M('#111'),.05,.02,.116,f.head);
   mk(BG(.1,.3,.01),MT(TX.shirtRed),0,.63,.097,f.g);
   for(const sx of [-1,1]) for(let i=0;i<3;i++){ const fe=mk(BG(.025,.3,.07),MT(TX.feather),sx*.17,.92,-.05,f.g); fe.rotation.z=sx*(-.3+i*.35); fe.rotation.x=-.2; }
   return [f]; }},
 {k:'Aube',n:'Aube',sp:1.1,p:{wander:1.3,chat:1.1,dance:1.6,exercise:2.2,kata:2.2,water:.6},build(){
   const sk=M('#f0c0a0');
   const f=human({skin:sk,top:MT(TX.bronze),sleeve:sk,bottom:sk,legs:sk,shoes:M('#6a3e1e'),skirt:.24,skirtMat:M('#e8907a'),skirtR:.25});
   const hm=M('#f28ab4'); mk(BG(.25,.07,.25),hm,0,.1,0,f.head); mk(BG(.045,.22,.25),hm,-.125,-.02,0,f.head); mk(BG(.045,.22,.25),hm,.125,-.02,0,f.head);
   mk(BG(.25,.22,.05),hm,0,-.01,-.11,f.head); mk(BG(.22,.05,.03),hm,0,.065,.115,f.head);
   mk(BG(.13,.08,.22),M('#8a5028'),-.2,.8,0,f.g); mk(BG(.13,.08,.22),M('#8a5028'),.2,.8,0,f.g);
   return [f]; }},
 {k:'Auvergne',n:'Auvergne',sp:1,p:{window:1.2,chess:1.5,read:1.3,lyre:2.4},build(){
   const f=human({skin:M('#e8c0a0'),top:MT(TX.stripesH,1,[2,3]),bottom:M('#3a3a30'),shoes:M('#2a2018'),eyeMat:M('#3ac060')});
   mk(BG(.23,.03,.23),M('#b0906a'),0,.115,0,f.head);
   const v=M('#5a6040'); mk(BG(.11,.34,.012),v,-.1,.62,.098,f.g); mk(BG(.11,.34,.012),v,.1,.62,.098,f.g); mk(BG(.32,.34,.012),v,0,.62,-.098,f.g);
   return [f]; }},
 {k:'C7H5N3O6',n:'C7H5N3O6',sp:.85,p:{corner:1.2,wander:1.2,chat:.6,exercise:1.5,chess:1.2,sweep:2.2,water:1},build(){
   const f=human({s:1.12,skin:M('#6a9a88'),neck:M('#151515'),top:M('#b8bcc0'),sleeve:M('#a8acb2'),bottom:M('#9ea2a8'),shoes:M('#7a7e84'),hand:M('#a8acb2'),eyes:false});
   mk(BG(.06,.02,.012),M('#102018'),-.05,.02,.112,f.head); mk(BG(.06,.02,.012),M('#102018'),.05,.02,.112,f.head);
   mk(BG(.24,.05,.24),M('#557a6c'),0,.11,0,f.head); mk(BG(.15,.1,.25),M('#c8ccd0'),-.22,.8,0,f.g); mk(BG(.15,.1,.25),M('#c8ccd0'),.22,.8,0,f.g);
   mk(BG(.34,.2,.03),M('#cfd3d8'),0,.67,.1,f.g);
   const sc=mk(BG(.1,.09,.02),MB('#6ff4ff'),0,.66,.12,f.g); sc.castShadow=false;
   f.fx=(t)=>{ sc.visible=Math.sin(t*2.2)>-.6; }; return [f]; }},
 {k:'CroisiereNoire',n:'Croisière Noire',sp:.85,p:{wander:2,tv:.6,chat:.7,sitBed:0,chess:0,phone:0,read:0,rest:0,drink:0,exercise:0,tinker:0,cook:0,eat:0,play:0,lounge:0,dance:1.2,paw:1.6},noSeat:1,build(){
   const g=new THREE.Group(), f={type:'bull',g,legs:[],arms:[],s:CS}; g.scale.setScalar(CS); const k=M('#1c1c22');
   mk(BG(.46,.44,.92),k,0,.62,0,g); mk(BG(.42,.16,.42),k,0,.88,.18,g);
   for(const [x,z] of [[-.15,.32],[.15,.32],[-.15,-.32],[.15,-.32]]){ const p=new THREE.Group(); p.position.set(x,.44,z); g.add(p);
     mk(BG(.13,.4,.13),k,0,-.2,0,p); mk(BG(.14,.06,.15),M('#3a3030'),0,-.41,0,p); f.legs.push(p); }
   const hd=new THREE.Group(); hd.position.set(0,.7,.56); g.add(hd); f.head=hd;
   mk(BG(.34,.32,.32),k,0,0,0,hd); mk(BG(.25,.17,.12),M('#6a5250'),0,-.08,.2,hd);
   mk(BG(.04,.04,.012),MB('#e8a040'),-.12,.05,.161,hd); mk(BG(.04,.04,.012),MB('#e8a040'),.12,.05,.161,hd);
   for(const sx of [-1,1]){ mk(BG(.18,.06,.06),M('#f0e6d0'),sx*.25,.13,0,hd); mk(BG(.06,.16,.06),M('#f0e6d0'),sx*.33,.22,0,hd); }
   const tl=mk(BG(.04,.32,.04),k,0,.6,-.48,g); tl.rotation.x=.25;
   return [f]; }},
 {k:'GrandColonel',n:'Grand Colonel',sp:1,p:{wander:1.4,chess:1.8,corner:.8,eat:1.3,exercise:1.8,salute:1.4,cards:.6},build(){
   const o=M('#5a6a3a'); const f=human({skin:M('#ecc4a4'),top:o,bottom:o,shoes:M('#111')});
   hairCap(f.head,M('#b4b4b4'),.085); bx(-.165,.49,-.1,.165,.53,.1,M('#1a1a1a'),f.g); bx(-.03,.49,.1,.03,.53,.105,M('#c8ccd0'),f.g);
   mk(BG(.1,.03,.12),M('#6e7e48'),-.18,.81,0,f.g); mk(BG(.1,.03,.12),M('#6e7e48'),.18,.81,0,f.g);
   for(let i=0;i<3;i++) mk(BG(.03,.02,.01),MB(['#d83a2a','#e0b84a','#3a6ad8'][i]),.04+i*.035,.7,.097,f.g); mk(BG(.03,.03,.01),MB('#e0302a'),-.07,.72,.097,f.g);
   return [f]; }},
 {k:'HoneyBuzzard',n:'Honey Buzzard',sp:1,p:{window:1.3,chess:1.4,chat:.9,eat:1.2,read:1.5,drink:1.4,water:1.5,cards:.5,drinkSit:.6},build(){
   const f=human({skin:M('#e8c4a4'),top:M('#141418'),bottom:M('#141418'),shoes:M('#0a0a0a'),head:false});
   const hd=mk(new THREE.SphereGeometry(.15,10,8),M('#0e0e14'),0,.02,0,f.head); hd.scale.z=1.1;
   const bk=mk(new THREE.ConeGeometry(.055,.24,6),M('#3a3a44'),0,-.01,.24,f.head); bk.rotation.x=PI/2;
   mk(BG(.03,.03,.03),MB('#ffffff'),-.1,.05,.08,f.head); mk(BG(.03,.03,.03),MB('#ffffff'),.1,.05,.08,f.head);
   mk(BG(.08,.3,.01),M('#f6f6f2'),0,.65,.097,f.g); mk(BG(.12,.04,.02),M('#1f6a42'),0,.78,.105,f.g); mk(BG(.05,.04,.01),M('#f6f6f2'),-.1,.72,.097,f.g);
   return [f]; }},
 {k:'MaidenCall',n:'Maiden Call',sp:1,p:{phone:6,chat:1.2,sitBed:1.2,rest:1.4,water:1.6},build(){
   const sk=M('#f2d0b0');
   const f=human({skin:sk,top:M('#4a78a8'),bottom:sk,legs:sk,shoes:M('#d8c4a0'),skirt:.36,skirtMat:M('#4a78a8'),skirtR:.21});
   hairLong(f.head,M('#0e0e10'),.48); mk(BG(.1,.03,.012),M('#d8b04a'),0,.78,.097,f.g);
   const hs=new THREE.Group(); hs.position.set(-.15,-.01,.03); hs.rotation.z=1.3; f.head.add(hs); const pm=M('#e2d2b0');
   bx(-.11,-.025,-.03,.11,.025,.03,pm,hs); bx(-.13,-.04,-.04,-.07,.03,.04,pm,hs); bx(.07,-.04,-.04,.13,.03,.04,pm,hs);
   f.gesture=()=>{ f.arms[0].rotation.x=-2.3; f.arms[0].rotation.z=-.5; }; f.hasPhone=1; return [f]; }},
 {k:'Malika',n:'Malika',sp:1.05,p:{tv:1.3,sitBed:1.2,chat:1.2,dance:1.8,read:1.4,rest:1.3,guitar:2.6,water:.8},build(){
   const sk=M('#e0b090');
   const f=human({skin:sk,top:M('#4e5a3a'),sleeve:sk,bottom:M('#2a2a30'),shoes:M('#2a2018')});
   const h=M('#0e0e10'); hairLong(f.head,h,.38); mk(BG(.3,.06,.08),h,0,-.18,-.12,f.head); mk(BG(.08,.06,.06),h,-.16,.06,.0,f.head);
   return [f]; }},
 {k:'PlagueOfJustinian',n:'Plague of Justinian',sp:.95,p:{window:1.2,corner:1,chat:.6,water:2.6},rain:1,build(){
   const f=human({skin:M('#a87458'),top:MT(TX.rib,1,[2,2]),sleeve:MT(TX.rib),bottom:M('#26262c'),shoes:M('#141414'),head:false});
   const cm=Mu('#868c96'); const cl=new THREE.Group(); cl.position.y=.08; f.head.add(cl);
   for(const [x,y,z,r] of [[0,.04,0,.17],[-.15,0,.02,.13],[.15,.02,0,.14],[0,.17,.02,.13],[-.08,.1,-.1,.13],[.09,.1,.1,.12],[.2,.12,-.05,.1],[-.2,.08,-.05,.1]])
     mk(new THREE.SphereGeometry(r,8,6),cm,x,y,z,cl);
   const bolt=new THREE.Group(); bolt.visible=false; cl.add(bolt);
   for(const [x,y,rz] of [[.05,-.12,.5],[-.01,-.22,-.6],[.04,-.32,.5]]){ const b=mk(BG(.025,.12,.025),MB('#e8d8ff'),x,y,.12,bolt); b.rotation.z=rz; b.castShadow=false; }
   let until=0; f.fx=(t)=>{ if(t>until && Math.random()<.004){ until=t+.14; } const on=t<until; bolt.visible=on; cm.emissive.setRGB(on?.7:0,on?.65:0,on?.9:0); };
   return [f]; }},
 {k:'PoisonedWell',n:'Poisoned Well',sp:1.15,p:{floor:2.6,tv:1.6,chat:.7,play:1.6,chess:1.8,read:1.2,smoke:1.2},build(){
   const f=human({s:.72,skin:M('#f0d4b4'),hs:.27,top:MT(TX.pin,1,[2,2]),sleeve:MT(TX.pin),bottom:MT(TX.pin),shoes:M('#0a0a0a')});
   f.head.position.y=.98; mk(BG(.08,.3,.01),M('#efe6cc'),0,.64,.097,f.g); mk(BG(.12,.05,.02),M('#111'),0,.78,.105,f.g);
   return [f]; }},
 {k:'TsuiPen',n:"Ts'ui Pên",sp:.75,p:{window:1.6,chess:2,wander:.7,corner:.6,read:2.4,cards:2.6,water:1.2},build(){
   const f=human({skin:M('#e8c8a0'),top:MT(TX.floral,1,[2,2]),sleeve:MT(TX.floral),bottom:M('#6a6a5a'),shoes:M('#4a3020')});
   const w=M('#f2f2ee'); mk(BG(.25,.05,.25),w,0,.1,0,f.head); mk(BG(.25,.14,.06),w,0,.03,-.1,f.head); mk(BG(.04,.12,.2),w,-.12,.02,-.01,f.head); mk(BG(.04,.12,.2),w,.12,.02,-.01,f.head);
   mk(BG(.2,.035,.012),M('#2a2a2a'),0,.015,.118,f.head);
   const wings=[]; const wm=MT(TX.wing);
   for(const sx of [-1,1]){ const p=new THREE.Group(); p.position.set(sx*.04,.7,-.11); f.g.add(p);
     const u=mk(BG(.34,.3,.012),wm,sx*.18,.12,0,p); u.rotation.z=sx*.25; const l=mk(BG(.22,.2,.012),wm,sx*.12,-.1,0,p); l.rotation.z=-sx*.3; wings.push([p,sx]); }
   f.fx=(t,a)=>{ const fl=a&&a.moving?6:2; for(const [p,sx] of wings) p.rotation.y=sx*(.45+Math.sin(t*fl)*.35); }; return [f]; }},
 {k:'dogXim',n:'dogXim',sp:1.2,p:{tinker:1.8,tv:1.2,wander:1.3,play:2.2,juggle:1.8},build(){
   const f=human({s:.8,skin:M('#5a3a28'),top:M('#e85e4e'),sleeve:M('#e85e4e'),bottom:M('#3a3a4a'),shoes:M('#2a2a2a'),eyeMat:M('#0a0a0a')});
   const h=M('#0e0e0e'); mk(BG(.24,.07,.24),h,0,.1,0,f.head); for(const [x,z] of [[-.08,.06],[.08,-.05],[0,-.08],[.09,.08],[-.09,-.07]]) mk(BG(.07,.05,.07),h,x,.15,z,f.head);
   mk(BG(.035,.035,.014),MB('#3aa8ff'),-.05,.01,.113,f.head);
   const hm=new THREE.Group(); hm.position.set(0,-.34,.04); f.arms[1].add(hm);
   bx(-.02,-.02,-.02,.02,.02,.24,M('#b08050'),hm); bx(-.03,-.03,.2,.03,.03,.3,M('#5a5e66'),hm).position.set(0,.02,.24);
   f.hammer=hm; return [f]; }},
];


const key=k=>String(k||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const BY={};CHAR.forEach(d=>{BY[key(d.k)]=d});
window.SkopoFigs={keys:CHAR.map(d=>key(d.k)),build(mask){const d=BY[key(mask)];if(!d)return null;
  const g=new THREE.Group(),figs=d.build();figs.forEach(f=>g.add(f.g));return {g,figs,d}}};
})();
