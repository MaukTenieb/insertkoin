/* KamOrhogo, lot 2 « matière » (16 nov. 2026) : molette des prises, bouton REC, cassette Hi8 à la sauvegarde,
   loupe à la place du texte de recherche. Habillage : borne-kam.css. */
(function(){
  var $=function(s){return document.querySelector(s);};
  /* molette : trois crans, chaque cran suit le mode de prise choisi */
  function dial(){
    var modes=$('.pvMode.ff-modes');if(!modes||modes.querySelector('.kam-dial'))return;
    var bs=modes.querySelectorAll('button');if(bs.length<3)return;
    var d=document.createElement('button');d.type='button';d.className='kam-dial';
    d.setAttribute('aria-label',(document.documentElement.lang==='fr')?'Molette':'Dial');
    modes.appendChild(d);
    function cur(){for(var i=0;i<bs.length;i++)if(bs[i].getAttribute('aria-pressed')==='true')return i;return 1;}
    function sync(){d.dataset.c=String(cur());}
    d.onclick=function(){bs[(cur()+1)%bs.length].click();sync();};
    new MutationObserver(sync).observe(modes,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});sync();
  }
  /* REC : déclenche comme un appui sur l'écran ; rouge vif tant que l'écran affiche REC */
  function rec(){
    var row=$('#shutterRow');if(!row||row.querySelector('.kam-rec'))return;
    var r=document.createElement('button');r.type='button';r.className='kam-rec';r.setAttribute('aria-label','REC');
    var flip=row.querySelector('.ff-flip');row.insertBefore(r,flip||null);
    r.onclick=function(){var s=document.getElementById('shutter');if(s)s.click();};
    var hm=$('#hMode');if(hm){var f=function(){r.classList.toggle('on',/REC/.test(hm.textContent));var x=hm.textContent;if(!/REC/.test(x))document.documentElement.classList.toggle('kam-son',/SOUND|\bSON\b/.test(x));};new MutationObserver(f).observe(hm,{childList:true,characterData:true,subtree:true});f();}
  }
  /* sauvegarde : chaque fichier téléchargé sort de l'appareil sur une cassette Hi8, son nom écrit sur l'étiquette */
  var lastHi8=0;
  function hi8(name){
    var st=$('#stage');if(!st)return;var old=st.querySelector('.kam-hi8');if(old)old.remove();
    var k=document.createElement('div');k.className='kam-hi8';k.setAttribute('aria-hidden','true');
    var b=document.createElement('b'),i=document.createElement('i');i.textContent=name;b.appendChild(i);k.appendChild(b);
    st.appendChild(k);lastHi8=Date.now();var t=$('#stText');if(t)t.textContent='';setTimeout(function(){k.remove();},2700);
  }
  var click0=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){if(this.download)hi8(this.download);return click0.apply(this,arguments);};
  /* la phrase d'enregistrement s'efface : la cassette la remplace */
  function quiet(){
    var t=$('#stText');if(!t)return;
    new MutationObserver(function(){if(Date.now()-lastHi8<1500&&t.textContent){t.textContent='';}}).observe(t,{childList:true,characterData:true,subtree:true});
  }
  /* recherche : la loupe dessinée remplace la phrase */
  function loupe(){var q=$('#q');if(!q)return;q.removeAttribute('data-ph');q.placeholder='';}

  /* boutons rotatifs : chaque curseur du dictaphone et des rendus devient un bouton qu'on tourne (glisser, molette, flèches) ; double appui = retour au neutre */
  var KN=[];
  function fmt(inp){var v=+inp.value;if(inp.id==='sonP')return (v>0?'+':'')+v;if(inp.id==='sonS')return '×'+(Math.pow(2,v/4)).toFixed(2).replace(/\.?0+$/,'');var f=(+inp.max>+inp.min)?((v-(+inp.min||0))/((+inp.max)-(+inp.min||0))):0;return Math.round(f*100)+'';}
  function knob(inp){
    if(inp.dataset.kam)return;inp.dataset.kam='1';
    var mn=+inp.min||0,mx=inp.max===''?100:+inp.max,st=inp.step==='any'?0:(+inp.step||1),def=+inp.defaultValue||0;
    var k=document.createElement('div');k.className='kam-knob';k.tabIndex=0;k.setAttribute('role','slider');
    k.setAttribute('aria-label',inp.getAttribute('aria-label')||(inp.parentElement&&inp.parentElement.textContent.trim())||'');
    if(inp.id==='sonP')k.dataset.k='pitch';if(inp.id==='sonS')k.dataset.k='speed';
    var cap=document.createElement('i'),rd=document.createElement('b');k.appendChild(cap);k.appendChild(rd);
    inp.parentNode.insertBefore(k,inp);inp.classList.add('kam-hid');inp.tabIndex=-1;
    function q(v){v=Math.max(mn,Math.min(mx,v));if(st)v=Math.round((v-mn)/st)*st+mn;return +v.toFixed(4);}
    function show(){var v=+inp.value,f=mx>mn?(v-mn)/(mx-mn):0;k.style.setProperty('--a',(-135+270*f)+'deg');rd.textContent=fmt(inp);k.setAttribute('aria-valuenow',v);k._v=inp.value;}
    function set(v,end){v=q(v);if(String(v)!==inp.value){inp.value=v;inp.dispatchEvent(new Event('input',{bubbles:true}));}show();if(end)inp.dispatchEvent(new Event('change',{bubbles:true}));}
    var y0=0,v0=0,drag=false;
    k.addEventListener('pointerdown',function(e){e.preventDefault();drag=true;y0=e.clientY;v0=+inp.value;k.setPointerCapture(e.pointerId);});
    k.addEventListener('pointermove',function(e){if(!drag)return;set(v0+(y0-e.clientY)/160*(mx-mn));});
    var up=function(){if(!drag)return;drag=false;set(+inp.value,true);};k.addEventListener('pointerup',up);k.addEventListener('pointercancel',up);
    k.addEventListener('wheel',function(e){e.preventDefault();set(+inp.value+(e.deltaY<0?1:-1)*(st||(mx-mn)/50),true);},{passive:false});
    k.addEventListener('keydown',function(e){var d={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(!d)return;e.preventDefault();set(+inp.value+d*(st||(mx-mn)/50),true);});
    k.addEventListener('dblclick',function(){set(def,true);});
    k.addEventListener('click',function(e){e.preventDefault();});
    KN.push({k:k,inp:inp,show:show});show();
    var lb=k.parentNode.querySelector(':scope>span');if(lb&&!lb.querySelector('i'))requestAnimationFrame(function(){if(lb.scrollWidth>lb.clientWidth+1){var t=lb.textContent,i=document.createElement('i');i.textContent=t;lb.textContent='';lb.appendChild(i);lb.classList.add('kam-tp');i.style.animationDuration=Math.max(4,t.length*.32)+'s';}});
  }
  function tpTitle(){var n=$('#lbName');if(!n||n.querySelector('i'))return;n.classList.remove('kam-tp');n.style.whiteSpace='nowrap';n.style.overflow='hidden';if(n.scrollWidth>n.clientWidth+1){var t=n.textContent,i=document.createElement('i');i.textContent=t;n.textContent='';n.appendChild(i);n.classList.add('kam-tp');i.style.animationDuration=Math.max(4,t.length*.32)+'s';}}
  function labo(){[].forEach.call(document.querySelectorAll('#laboBody .chip'),function(b){var t=b.textContent.trim();if(t&&b.title!==t){b.title=t;b.setAttribute('aria-label',t);}});var pr=$('#prompt');if(pr&&pr.placeholder){pr.removeAttribute('data-ph');pr.placeholder='';}}
  function knobs(){tpTitle();labo();[].forEach.call(document.querySelectorAll('#sonPanel input[type=range],#ctl input[type=range]'),knob);}
  setInterval(function(){for(var i=KN.length-1;i>=0;i--){var o=KN[i];if(!o.inp.isConnected){o.k.remove();KN.splice(i,1);continue;}if(o.k._v!==o.inp.value)o.show();}},150);
  var kq=0;new MutationObserver(function(){if(kq)return;kq=requestAnimationFrame(function(){kq=0;knobs();});}).observe(document.body,{childList:true,subtree:true});
  function go(){dial();rec();quiet();loupe();knobs();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
  setTimeout(go,800);
})();
