/* Langue des jeux KG (Fauna Chess, Erratik, Kapture, Katabatik, VHS) : le français passe par kg-fr.json, {"chaîne anglaise": "chaîne française"}.
   Anglais par défaut ; une valeur vide laisse l'anglais. Même clé de langue que la borne (ik.lang). Roue K, champ l. */
(function(){
  /* 8 nov., 18 h 26 (Mauk Tenieb : « l'arcade traduit le nom des programmes et des boutons en horrible français mot à mot ») : la traduction mot à mot s'arrête ; l'arcade garde ses noms et ses boutons d'origine dans les deux langues, en attendant le français de Mauk Tenieb (kg-fr.json) */
  return;
  var fr=false;try{fr=window.IK_LANG==='fr'||localStorage.getItem('ik.lang')==='fr';}catch(e){fr=window.IK_LANG==='fr';}
  if(!fr)return;
  var D=null,root=null,busy=false,ATTR=['placeholder','title','aria-label'];
  function tr(s){if(!D)return s;var t=s.trim();if(!t)return s;var v=D[t];return v?s.replace(t,v):s;}
  function node(n){
    if(n.nodeType===3){var v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return;}
    if(n.nodeType!==1||/^(SCRIPT|STYLE)$/.test(n.tagName))return;
    ATTR.forEach(function(a){var x=n.getAttribute(a);if(x){var y=tr(x);if(y!==x)n.setAttribute(a,y);}});
    for(var c=n.firstChild;c;c=c.nextSibling)node(c);}
  function pass(){if(!root||!D)return;busy=true;node(root);busy=false;}
  function start(){root=document.getElementById('kg-root');if(!root)return;
    new MutationObserver(function(){if(!busy)pass();}).observe(root,{childList:true,subtree:true,characterData:true});pass();}
  fetch('kg-fr.json').then(function(r){return r.ok?r.json():{};}).then(function(j){D=j||{};start();}).catch(function(){});
})();
