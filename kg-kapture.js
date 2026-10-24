
/*
 * Code: MIT licence, Copyright (c) 2026 Mauk Tenieb (see LICENSE).
 * Korhogo material: Copyright © Mauk Tenieb & Korhogo, all rights reserved. Korhogo™,
 * Korhogo Fauna™, Fauna Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™,
 * Korong!™ and any related material — characters, names, symbols, rules, lore, texts,
 * images and music, in any form or medium, including inside this file — stay out of the
 * MIT licence and remain the property of the author. No use of that material for
 * training artificial intelligence. Contact: mauktenieb@gmail.com
 */

/* KG module "kapture" -- KAPTURE camera: a live view, one shot, and the photo goes to Photofauna
   (window.ikToPhotofauna, set by the host page). Outside Insert Koin the photo is saved as a file.
   The screenshot (SKREEN) is the host page's job: it has to be taken before any panel opens.
   The former 5-second video recorder stays in the git history (kg-kapture.js before 20 Oct 2026).
   The viewfinder is the shared screen (ik-ecran.js): the same frame, size and place as in every program,
   the keys in the controls slot; profile "photo": framing marks and glass over the live view, the video
   itself untouched, so the shot drawn from it stays clean. */
(function(){
  var st=null,facing='environment';
  function $(id){return document.getElementById(id);}
  function msg(t){var m=$('kapture-msg');if(m)m.textContent=t||'';}
  function stopCam(){if(st&&st.stream){st.stream.getTracks().forEach(function(t){try{t.stop();}catch(e){}});}if(st)st.stream=null;var v=$('kapture-video');if(v)v.srcObject=null;}
  function startCam(){
    stopCam();st=st||{};msg('');
    var v=$('kapture-video');
    if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){msg('KAM ?');pickFile();return;}
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:4096},height:{ideal:4096}},audio:false}).then(function(s){
      if(!st){s.getTracks().forEach(function(t){t.stop();});return;}
      st.stream=s;v.srcObject=s;v.classList.toggle('mirror',facing==='user');v.play().catch(function(){});
    }).catch(function(){msg('KAM ?');});
  }
  function pickFile(){var f=$('kapture-file');if(!f)return;f.onchange=function(){var file=f.files&&f.files[0];f.value='';if(file)deliver(file,file.name);};f.click();}
  function deliver(blob,name){
    stopCam();
    if(typeof window.ikToPhotofauna==='function'){window.kaptureClose();window.ikToPhotofauna(blob,'kam');return;}
    var a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name||(window.ikName?ikName('kapture','jpg'):'kapture.jpg');
    document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u);},2000);window.kaptureClose();
  }
  var ecran=null;
  window.kaptureStart=function(){var o=$('kapture-overlay');if(o)o.style.display='block';st={};
    if(o&&window.IKEcran){if(window.IKEcran.layout)window.IKEcran.layout(o,{screen:'#kapture-screen',controls:'#kapture-bar'});
      ecran=window.IKEcran.mount('#kapture-screen',{program:'kapture',content:'#kapture-video',z:2});}
    startCam();};
  window.kaptureFlip=function(){facing=facing==='environment'?'user':'environment';startCam();};
  window.kaptureShoot=function(){
    var v=$('kapture-video');
    if(!st||!st.stream||!v||!v.videoWidth){pickFile();return;}
    var c=$('kapture-canvas'),w=v.videoWidth,h=v.videoHeight;c.width=w;c.height=h;var x=c.getContext('2d');
    if(facing==='user'){x.translate(w,0);x.scale(-1,1);}
    x.drawImage(v,0,0,w,h);
    var o=$('kapture-overlay');if(o){o.classList.remove('flash');void o.offsetWidth;o.classList.add('flash');}
    c.toBlob(function(b){if(b)deliver(b,window.ikName?ikName('kapture','jpg'):'kapture.jpg');},'image/jpeg',.94);
  };
  window.kaptureClose=function(){stopCam();st=null;if(ecran)ecran.sleep();var o=$('kapture-overlay');if(o){o.style.display='none';o.classList.remove('flash');}};
})();
