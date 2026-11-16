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
  function go(){dial();rec();quiet();loupe();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
  setTimeout(go,800);
})();
