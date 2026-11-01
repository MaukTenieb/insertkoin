/* Borne Insert Koin — bloc « plante » (P5) : le pot du toit, ses soins (eau, soleil, taille), son image du mois républicain, sa vie.
   Elle respire doucement ; la main qui passe dans ses feuilles les froisse, dans le sens du geste, et elles reviennent en ressort ;
   deux tapes rapides l'arrosent : l'eau tombe en gouttes, la terre fonce puis sèche ; les feuilles mortes de l'automne et les pétales des mois en fleur
   tombent de temps en temps. Les touches EAU, SOLEIL et TAILLE restent, gravées sur une étiquette du pot.
   init(host, bus) : crée .b-pot dans host, se déclare à l'aimant (« plante ») ; zéro lecture d'un autre bloc. */
(function(){var bus=window.__borne;if(!bus)return;
bus.bloc('plante',function(host,bus){
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var IK=function(){return window.__ik||{};};
  var el=function(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
  var pot=el('div','b-pot'),plant=el('div','b-plant'),care=el('div','b-care');
  pot.tabIndex=0;pot.setAttribute('role','group');pot.setAttribute('aria-label','Plante');
  /* les soins de la plante suivent la langue de la borne (FR · EN) */
  [['water','💧','EAU','WATER'],['sun','☀','SOLEIL','SUN'],['cut','✂','TAILLE','PRUNE']].forEach(function(a){var b=el('button',null,'<i>'+a[1]+'</i><span data-fr="'+a[2]+'" data-en="'+a[3]+'">'+a[3]+'</span>');b.type='button';b.dataset.care=a[0];care.appendChild(b);});
  function careLang(){var fr=document.documentElement.lang==='fr';[].forEach.call(care.querySelectorAll('span[data-fr]'),function(x){x.textContent=fr?x.dataset.fr:x.dataset.en;});}
  careLang();new MutationObserver(careLang).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  pot.appendChild(care);pot.appendChild(plant);host.appendChild(pot);
  /* ---------- l'entretien de la plante : l'eau, le soleil, la taille ; elle s'en souvient d'une visite à l'autre ----------
     sans eau depuis quatre jours ou sans soleil depuis six, elle s'affaisse et jaunit ; chaque taille la rend plus touffue, jusqu'à trois. */
  var DAY=864e5,cs=function(){var c={};try{c=JSON.parse(localStorage.getItem('borne.plant')||'{}')||{};}catch(e){}var n=Date.now();
    if(!c.water)c.water=n;if(!c.sun)c.sun=n;if(c.cut==null)c.cut=0;return c;};
  function health(){var c=cs(),n=Date.now();return Math.max(0,Math.min(1,1.25-Math.max((n-c.water)/(4*DAY),(n-c.sun)/(6*DAY))));}
  pot.addEventListener('click',function(e){var b=e.target.closest('[data-care]');if(!b){pot.classList.toggle('open');return;}
    var c=cs(),a=b.dataset.care;if(a==='cut')c.cut=Math.min(3,c.cut+1);else c[a]=Date.now();try{localStorage.setItem('borne.plant',JSON.stringify(c));}catch(_){}
    try{a==='water'?IK().tone(520,.18,'sine',.03,-200):a==='sun'?IK().tone(880,.25,'triangle',.025,300):IK().tone(1500,.04,'square',.02);}catch(_){}
    pot.classList.remove('fx-water','fx-sun','fx-cut');void pot.offsetWidth;pot.classList.add('fx-'+a);lastM=-1;tick();});
  pot.addEventListener('mouseleave',function(){pot.classList.remove('open');});

  /* ---------- la plante du toit : elle suit les mois du calendrier républicain ----------
     vendémiaire : vendange ; brumaire, frimaire : les feuilles tombent ; nivôse : neige ; pluviôse : pluie ; ventôse : bourgeons ;
     germinal : pousse ; floréal, prairial : fleurs ; messidor, thermidor : plein été ; fructidor : fruits. */
  var P={1:[6,0,3,'#c9772b','#6b2a5a',0],2:[4,0,0,'#a5522a',0,0],3:[2,0,0,'#7a5a3a',0,'frost'],4:[0,0,0,0,0,'snow'],5:[0,0,0,0,0,'rain'],6:[0,3,0,'#9bbf5a',0,0],
    7:[3,0,0,'#9fd36a',0,0],8:[6,3,0,'#6fb04a','#f7a8c8',0],9:[8,5,0,'#4f9a3a','#fff1a8',0],10:[8,2,0,'#3f8030','#ffd54f',0],11:[8,0,2,'#3f7a2e','#9ccc65',0],
    12:[7,0,5,'#4a7a30','#e0442e',0],13:[6,0,3,'#7a8a30','#e0442e',0]};
  var PIMG={7:'germinal',8:'floreal',9:'floreal',10:'messidor',11:'messidor',12:'fructidor',1:'fructidor',13:'fructidor',2:'brumaire',3:'brumaire',4:'brumaire',5:'brumaire',6:'brumaire'};
  function plantImg(r){var m=r?r.month:2,n=health()<.5?'assoiffee':PIMG[m]||'brumaire';return '<img alt="" draggable="false" src="plante-'+n+'.webp">';/* l'image ne part pas en glisser-déposer : l'appui long saisit le pot */}
  function bornePlant(r){var m=r?r.month:2,d=r?r.day:1,p=P[m]||P[2],f=Math.min(1,(d||1)/30),s='',hl=health(),ex=cs().cut,droop=(1-hl)*35;
    var grow=m===7?.45+.55*f:m===6?.4:1,H=48*grow*(.8+.2*hl),L=(m===7?Math.max(1,Math.round(p[0]*f)):p[0])+(p[0]?ex:0);
    var pts=[];for(var i=0;i<9;i++){var t=(i+1)/10;pts.push([60+Math.sin(t*3)*5,62-t*H]);}
    s+='<path d="M60 62 C 64 '+(62-H*.35)+', 55 '+(62-H*.7)+', '+(pts[8][0]+droop*.5).toFixed(1)+' '+pts[8][1].toFixed(1)+'" fill="none" stroke="#4a3a1e" stroke-width="2.2" stroke-linecap="round"/>';
    for(i=0;i<L;i++){var q=pts[Math.min(8,1+(i%8))],side=i%2?1:-1,a=-side*(12+(i*17)%25)+side*droop,sc=.7+((i*7)%5)/10;
      s+='<path transform="translate('+q[0].toFixed(1)+' '+q[1].toFixed(1)+') rotate('+a+') scale('+sc+')" d="M0 0 C '+(6*side)+' -4, '+(14*side)+' -2, '+(17*side)+' 3 C '+(11*side)+' 6, '+(4*side)+' 5, 0 0Z" fill="'+(hl<.5?'#b9a24a':p[3])+'"/>';}
    for(i=0;i<p[1]*(hl<.5?0:1);i++){q=pts[[8,6,4,7,5][i]];
      s+=m===6?'<circle cx="'+(q[0]+(i%2?4:-4)).toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="2" fill="#c8e08a"/>'
        :'<g transform="translate('+(q[0]+(i%2?7:-7)).toFixed(1)+' '+(q[1]-2).toFixed(1)+')"><circle r="2.2" fill="#ffd54f"/>'+[0,72,144,216,288].map(function(a){return '<ellipse rx="2" ry="3.6" transform="rotate('+a+') translate(0 -4)" fill="'+p[4]+'"/>';}).join('')+'</g>';}
    for(i=0;i<p[2];i++){q=pts[[5,7,3,6,4][i]];s+='<circle cx="'+(q[0]+(i%2?6:-6)).toFixed(1)+'" cy="'+(q[1]+5).toFixed(1)+'" r="'+(m===1?2.6:3.4)+'" fill="'+p[4]+'"/>';}
    if(m===2||m===3)s+='<path d="M78 82 q4 -3 9 0 q-5 3 -9 0Z" fill="'+p[3]+'"/><path d="M38 84 q4 -3 8 1 q-5 2 -8 -1Z" fill="'+p[3]+'"/>';
    if(p[5]==='snow')s+='<path d="M44 62 q16 -6 32 0Z" fill="#f4f7fb"/>'+[[40,20],[70,12],[86,32],[52,40],[30,44],[94,8]].map(function(c){return '<circle cx="'+c[0]+'" cy="'+c[1]+'" r="1.4" fill="#f4f7fb"/>';}).join('');
    if(p[5]==='rain')s+=[[40,10],[58,22],[76,6],[90,26],[30,30],[66,38]].map(function(c){return '<path d="M'+c[0]+' '+c[1]+' l-2 6" stroke="#8fb8e8" stroke-width="1.2" stroke-linecap="round"/>';}).join('');
    if(p[5]==='frost')s+='<path d="M60 62 l0 -'+(H*.9).toFixed(1)+'" stroke="#dfe9f5" stroke-width=".7" stroke-dasharray="1 3"/>';
    s+='<path d="M42 60 h36 l-4 24 h-28Z" fill="#a8532e"/><path d="M40 58 h40 v6 h-40Z" fill="#c2643a"/><path d="M47 64 l-3 20" stroke="rgba(255,255,255,.12)" stroke-width="2"/>';
    return '<svg viewBox="0 0 120 86" width="100%" height="100%">'+s+'</svg>';}

  var MO=['vendémiaire','brumaire','frimaire','nivôse','pluviôse','ventôse','germinal','floréal','prairial','messidor','thermidor','fructidor','sans-culottides'];
  var lastM=-1;
  function tick(){var r=window.ikRep?window.ikRep(new Date()):null;
    var key=(r?r.month*40+r.day:0)+'/'+Math.round(health()*10)+'/'+cs().cut;if(key!==lastM){lastM=key;plant.innerHTML=plantImg(r);plant.title=r?MO[r.month-1]:'';}}
  tick();setInterval(tick,15000);
  /* la plante vivante */
  (function(){var pl=plant;
    var A={a:0,v:0,run:false,lx:null,lt:0};
    function frame(){var k=120,c=7,dt=1/60;A.v+=(-A.a*k-A.v*c)*dt;A.a+=A.v*dt;pl.style.setProperty('--rs',A.a.toFixed(2)+'deg');
      if(Math.abs(A.a)>.05||Math.abs(A.v)>.05)requestAnimationFrame(frame);else{A.run=false;pl.style.setProperty('--rs','0deg');}}
    function kick(v){A.v+=v;if(!A.run){A.run=true;requestAnimationFrame(frame);}}
    var lastSnd=0;
    pot.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'&&e.buttons===0&&e.pointerType!=='pen')return;var t=performance.now();
      if(A.lx!=null){var dx=e.clientX-A.lx,sp=dx/Math.max(8,t-A.lt);if(Math.abs(sp)>.25){kick(Math.max(-60,Math.min(60,sp*28)));
        if(t-lastSnd>140&&window.__borneSon){lastSnd=t;try{window.__borneSon.tick();}catch(_){}}}}A.lx=e.clientX;A.lt=t;});
    pot.addEventListener('pointerleave',function(){A.lx=null;});
    /* deux tapes rapides l'arrosent (l'appui long, lui, déplace la plante à l'aimant) */
    function water(){var c={};try{c=JSON.parse(localStorage.getItem('borne.plant')||'{}')||{};}catch(_){}c.water=Date.now();try{localStorage.setItem('borne.plant',JSON.stringify(c));}catch(_){}
      pot.classList.add('b-wet');setTimeout(function(){pot.classList.remove('b-wet');},9000);
      var b=pot.querySelector('[data-care=water]');if(b)b.click();
      if(!RM)for(var i=0;i<14;i++)(function(i){setTimeout(function(){var d=document.createElement('i');d.className='b-drop';d.style.left=(30+Math.random()*40)+'%';d.style.animationDuration=(.5+Math.random()*.35)+'s';pot.appendChild(d);setTimeout(function(){d.remove();},900);},i*55);})(i);}
    var lastUp=0;
    pot.addEventListener('pointerup',function(e){if(e.target.closest('[data-care]'))return;var t=performance.now();if(t-lastUp<380){lastUp=0;water();}else lastUp=t;});
    /* ce qui tombe, selon le mois de la plante */
    function season(){var img=pl.querySelector('img'),s=img?img.src:'';return /brumaire|assoiffee/.test(s)?'leaf':/floreal/.test(s)?'petal':/fructidor/.test(s)?'leaf':'';}
    function fall(){var k=season();if(k&&!RM&&!document.hidden){var f=document.createElement('i');f.className='b-fall b-'+k;f.style.left=(25+Math.random()*50)+'%';
        f.style.setProperty('--dx',((Math.random()*2-1)*40).toFixed(0)+'px');f.style.animationDuration=(3.5+Math.random()*2.5).toFixed(1)+'s';pot.appendChild(f);setTimeout(function(){f.remove();},6500);}
      setTimeout(fall,k==='petal'?9000+Math.random()*12000:14000+Math.random()*20000);}
    setTimeout(fall,6000);
    /* la borne vibre, la plante aussi (Mauk Tenieb, 30 oct. : « qu'elle réagisse presque à chaque geste ») : chaque bruit mécanique
       du meuble (touche, ressort de la manette, Koin, TILT) lui transmet une secousse à sa mesure ; un geste sur le meuble la pousse loin de la main */
    var AMP={press:.8,release:.4,tick:.3,detent:.6,knock:2.2,twang:1.4,coin:.8,drop:1.2,tilt:7,suck:.3,clack:1};
    function shake(a){if(RM)return;kick((Math.random()<.5?-1:1)*a*(9+Math.random()*4));}
    (function wrap(){var S=window.__borneSon;if(!S){setTimeout(wrap,800);return;}if(S._plant)return;S._plant=1;
      Object.keys(AMP).forEach(function(k){var f=S[k];if(typeof f!=='function')return;S[k]=function(x){shake(AMP[k]*(k==='knock'&&x?Math.min(2,x):1));return f.apply(this,arguments);};});})();
    document.addEventListener('pointerdown',function(e){if(RM||document.documentElement.dataset.prog||pot.contains(e.target))return;
      var r=pl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=cx-e.clientX,d=Math.hypot(dx,cy-e.clientY);
      kick((dx>=0?1:-1)*Math.max(1.5,9*Math.exp(-d/520)));},true);})();
  bus.magnet('plante',pot);
  return {el:pot};
});})();
