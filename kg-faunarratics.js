
/*
 * =============================================================================
 * COPYRIGHT NOTICE AND INTELLECTUAL PROPERTY DECLARATION
 * =============================================================================
 *
 * Copyright \u00a9 2024 Mauk Tenieb & Korhogo.
 * ALL RIGHTS RESERVED.
 *
 * This software, including but not limited to its source code, architecture,
 * algorithms, user interface, documentation, artistic content, role-playing
 * scenarios, narrative texts, descriptions, lore, game mechanics, dialogues,
 * aesthetic assets, and any associated materials (collectively referred to as
 * "the Work"), is the exclusive intellectual property of Mauk Tenieb.
 *
 * The Work is protected by international copyright laws, the Berne Convention,
 * the Universal Copyright Convention, and all applicable national laws including
 * (but not limited to) French Intellectual Property Code, U.S. Copyright Law
 * (Title 17 U.S.C.), and EU directives.
 *
 * NO PART OF THIS WORK MAY BE USED, COPIED, REPRODUCED, MODIFIED, ADAPTED,
 * TRANSLATED, DISTRIBUTED, TRANSMITTED, DISPLAYED, PUBLISHED, BROADCAST,
 * LICENSED, SUBLICENSED, SOLD, TRANSFERRED, OR EXPLOITED IN ANY FORM OR BY
 * ANY MEANS (electronic, mechanical, photocopying, recording, scanning,
 * or otherwise) WITHOUT THE PRIOR EXPRESS WRITTEN PERMISSION OF THE COPYRIGHT
 * OWNER.
 *
 * This prohibition explicitly includes, but is not limited to:
 *   - Any form of reverse engineering, decompilation, disassembly, or
 *     derivative work creation.
 *   - Any use of the Work or its outputs for training, fine-tuning, or
 *     improving any artificial intelligence, machine learning, or large
 *     language models.
 *   - Any scanning, parsing, extraction, or analysis of the code, structure,
 *     or content by humans or automated systems (including AI agents, crawlers,
 *     scrapers, or LLMs) for any purpose other than the legitimate execution
 *     of the authorized software by its rightful owner.
 *   - Any commercial, non-commercial, educational, research, or personal use
 *     without explicit authorization.
 *
 * Any unauthorized use, access, study, or inspection of this Work constitutes
 * a direct and serious infringement of copyright and may result in civil and/or
 * criminal prosecution to the fullest extent permitted by law. The copyright
 * owner reserves the right to pursue all available legal remedies, including
 * but not limited to injunctions, damages, attorney fees, and statutory damages.
 *
 * This notice is an integral part of the Work. Removing, altering, obscuring,
 * or bypassing this notice does not waive any rights of the copyright owner.
 *
 * For licensing inquiries, permissions, or commercial arrangements, contact:
 * mauktenieb@gmail.com
 *
 * =============================================================================
 * Instead of being open source, this work is under copyright \u00a9 2024 Mauk Tenieb & Korhogo.
 * All rights strictly reserved. No use without express written permission.
 * =============================================================================
 */

/* KG module "faunarratics" -- FAUNARRATICS / Konklave (panel #konklave-panel) + OG transition. Code copied verbatim from kofa.js (Korhogo). */
function _pick(a){return a[Math.floor(Math.random()*a.length)];}


// ===== KONKLAVE ENGINE (new Faunarratics) =====
// Spec: 5 KONTEXT + seuil 4/7/18 -> flux A+B+C + Make-it
// All strings figees, ASCII pur, pas de optional chaining (iOS<15)

// --- Banques figees (spec figee, mot a mot) ---
var KK_A_VERB=['Pick','Select','Choose','Steal'];
var KK_A_OBJ =['glyph','symbol','fragment','snippet','content'];
var KK_B_LINES=[
  'Push it further. Break something.',
  'What changes now?',
  'What did you hide with the last Mask?',
  "What's the meaning of all this shit?",
  'Are you here, busy bee?',
  'Something shifts. Write it.',
  'What does this Mask owe the last one?',
  'Go further than you meant to.'
];
var KK_C_VERB=['Stay','Remain','Keep it'];
var KK_C_ADJ =['rational','logical','unexpected','granular','intricately detailed','immersive','alive','off','yours','dense'];
var KK_APARTES=['(Yes you did.)','(Kerema awaits.)'];
var KK_HAND_TAIL=[
  'Remember what came to you back when the music had you.',
  'Remember what came to you back when you were under the "games" \u2014 whatever you may call them.',
  'You had this strange dream \u2014 recently. <span class="kk-apart">(Yes you did.)</span>'
];
var KK_BUILD_CRY='Build da game! Choose the pieces that set the logic \u2014 who, what, where, when, why, even if unknown yet. Make it logical. Make it consistent. Make it surprising. Make it immersive, busy bee.';
var KK_SAVE_KEY='kk_save_v1';
var KK_ARCHIVE_KEY='kk_archive_v1';

// --- Etat global ---
var kkOrder=[], kkIdx=0, kkTotal=3, kkEntries=[], kkPending=null, kkChosenFaunaIdx=-1, kkOrderSnapshot=null;
var kkSecs=[];           // multi-chips (max 3)
var kkFlow=null;         // flux A+B+C+Make-it tire pour la carte courante
var kkIdleTimer=null, kkIdleFired=false;

function kkShuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function kkGo(id){
  var p=document.getElementById('konklave-panel');if(!p)return;
  var scr=p.querySelectorAll('.kk-screen');
  for(var i=0;i<scr.length;i++)scr[i].classList.remove('kk-active');
  var el=document.getElementById(id);if(el)el.classList.add('kk-active');
}
function kkEsc(s){if(s==null)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function kkEnter(){
  if(typeof FAUNA==='undefined'){return;}
  // Toujours nouvelle partie -- pas de reprise silencieuse
  kkClearSave();
  kkOrder=kkShuffle(FAUNA.map(function(_,i){return i;}));
  kkIdx=0;kkTotal=3;kkEntries=[];
  kkSecs=[];kkFlow=null;kkIdleClear();kkIdleFired=false;
  var feed=document.getElementById('kk-feed');
  if(feed){
    feed.innerHTML='<div class="kk-feedlbl">KEREMA</div>';
    // Replay des bubbles si reprise
    for(var i=0;i<kkEntries.length;i++){
      var e=kkEntries[i];
      var b=document.createElement('div');b.className='kk-bubble';
      var lbl=(e.idx<3?'KONTEXT '+(e.idx+1):'STORY '+(e.idx-2));
      b.innerHTML='<span class="kk-tag">\u2500\u2500 '+kkTeamTag()+' \u25b8 '+lbl+'</span><div class="kk-btxt">'+kkEsc(e.txt)+'</div>';
      feed.appendChild(b);
    }
  }
  // Flux: si reprise et kkFlow null, re-tirer au show
  if(kkIdx>=3 && !kkFlow) kkFlow=null;
  kkShowMask();
  kkGo('kk-mask');
  // BUILD CRY: lance le jeu dans le fil
  setTimeout(function(){
    var feed=document.getElementById('kk-feed');
    if(feed&&!feed.querySelector('.kk-build')){
      var e=document.createElement('div');
      e.className='kk-kerema kk-build';
      e.innerHTML=KK_HDR+kkKBody(KK_BUILD_CRY);
      feed.appendChild(e);feed.scrollTop=feed.scrollHeight;
    }
  },1400);
}

// --- Autosave / Restore ---
function kkSaveNow(){
  try{
    var data={kkOrder:kkOrder,kkIdx:kkIdx,kkTotal:kkTotal,kkEntries:kkEntries,t:Date.now()};
    localStorage.setItem(KK_SAVE_KEY,JSON.stringify(data));
  }catch(e){}
}
function kkLoadSave(){
  try{var s=localStorage.getItem(KK_SAVE_KEY);if(!s)return null;return JSON.parse(s);}catch(e){return null;}
}
function kkClearSave(){try{localStorage.removeItem(KK_SAVE_KEY);}catch(e){}}

// --- Archive ---
function kkArchiveLoad(){
  try{var s=localStorage.getItem(KK_ARCHIVE_KEY);if(!s)return [];return JSON.parse(s)||[];}catch(e){return [];}
}
function kkArchiveSave(arr){
  try{localStorage.setItem(KK_ARCHIVE_KEY,JSON.stringify(arr));}catch(e){}
}

// Extraction de titre (option 1 - depuis le texte joueur, pas d'invention)
function kkBuildTitle(){
  var stops={'the':1,'a':1,'an':1,'and':1,'or':1,'but':1,'of':1,'in':1,'on':1,'at':1,'to':1,'for':1,'with':1,'by':1,'is':1,'was':1,'are':1,'were':1,'be':1,'been':1,'has':1,'have':1,'had':1,'do':1,'does':1,'did':1,'i':1,'you':1,'he':1,'she':1,'it':1,'we':1,'they':1,'this':1,'that':1,'these':1,'those':1,'my':1,'your':1,'his':1,'her':1,'its':1,'our':1,'their':1,'me':1,'him':1,'them':1,'us':1,'so':1,'if':1,'as':1,'than':1,'then':1,'when':1,'where':1,'why':1,'how':1,'what':1,'who':1,'which':1,'just':1,'will':1,'would':1,'could':1,'should':1,'can':1,'may':1,'no':1,'not':1,'yes':1,'too':1,'very':1,'much':1,'more':1,'most':1,'some':1,'all':1,'any':1,'one':1,'two':1,'into':1,'from':1,'up':1,'down':1,'out':1,'about':1,'over':1,'under':1};
  var words=[];
  for(var i=0;i<kkEntries.length;i++){
    var raw=String(kkEntries[i].txt||'').toLowerCase();
    var tokens=raw.split(/[^a-z0-9\u00c0-\u017f]+/);
    for(var j=0;j<tokens.length;j++){
      var w=tokens[j];
      if(w.length>=4 && !stops[w]) words.push(w);
    }
  }
  if(!words.length) return 'Untitled Konklave';
  // Pick: premier, milieu, dernier mot saillants
  var sel=[];
  sel.push(words[0]);
  if(words.length>3) sel.push(words[Math.floor(words.length/2)]);
  if(words.length>1) sel.push(words[words.length-1]);
  // Capitalisation
  var out=[];
  for(var k=0;k<sel.length;k++){
    var s=sel[k];
    out.push(s.charAt(0).toUpperCase()+s.slice(1));
  }
  // Style: "Word and Word" ou "Word, Word & Word"
  if(out.length===1) return out[0];
  if(out.length===2) return out[0]+' & '+out[1];
  return out[0]+', '+out[1]+' & '+out[2];
}

function kkRub(label,txt,italic,color,mono,bold){
  if(!txt)return '';
  var base='line-height:1.55;font-family:Archivo,sans-serif;font-weight:300;font-size:clamp(.78rem,1.5vw,.92rem);';
  if(mono) base='line-height:1.45;font-family:DM Mono,monospace;font-weight:'+(bold?'500':'300')+';font-size:clamp(.72rem,1.4vw,.88rem);letter-spacing:.02em;';
  var sty=base+'color:'+(color||'#ede5d8')+';font-style:'+(italic?'italic':'normal')+';'+(bold?'text-shadow:0 0 12px '+(color||'#c9a84c')+';':'');
  var on=kkSecHas(label)?' kk-rub-on':'';
  return '<div class="kk-rub'+on+'" data-rub="'+kkEsc(label)+'"><div class="kk-rub-lbl">'+kkEsc(label)+'</div><div style="'+sty+'">'+kkEsc(txt)+'</div></div>';
}
function kkSecHas(label){for(var i=0;i<kkSecs.length;i++)if(kkSecs[i]===label)return true;return false;}
function kkPickRubric(label){
  if(typeof sndBtn==='function')sndBtn();
  // Toggle: si deja present, on retire
  var idx=-1;
  for(var i=0;i<kkSecs.length;i++)if(kkSecs[i]===label){idx=i;break;}
  if(idx>=0){
    kkSecs.splice(idx,1);
  } else {
    if(kkSecs.length>=3){
      kkFlashMax();
      return;
    }
    kkSecs.push(label);
  }
  kkShowMask();
  kkSyncBoxFromSecs();
  var box=document.getElementById('kk-box');if(box)try{box.focus();}catch(e){}
  kkIdleStart();
  kkUpdateAddBtn();
}
function kkUpdateAddBtn(){
  var btn=document.getElementById('kk-add-btn');
  if(!btn)return;
  var box=document.getElementById('kk-box');
  var hasTxt=box&&box.value.trim().length>0;
  var hasChip=kkSecs.length>0;
  if(hasTxt&&hasChip){btn.disabled=false;}
  else{btn.disabled=true;}
}
function kkFlashMax(){
  var el=document.getElementById('kk-sections');if(!el)return;
  el.classList.add('kk-max-flash');
  setTimeout(function(){el.classList.remove('kk-max-flash');},400);
}

function kkRollFlow(){
  var a=_pick(KK_A_VERB)+' any '+_pick(KK_A_OBJ)+' \u2014 visual or sound.';
  var b=_pick(KK_B_LINES);
  var c=_pick(KK_C_VERB)+' '+_pick(KK_C_ADJ)+'.';
  // Imperatif unique - 3 regimes (spec #6.5)
  // Defaut: net 70% / ellipse 22% / aparte Kerema 8%
  var r=Math.random(), mk;
  var KK_MK_ADJ=['dense','dissonant','unresolved','too much','off','alive','broken','precise','wrong','yours'];
  if(r<0.70)      mk='Make it '+_pick(KK_MK_ADJ)+'.';
  else if(r<0.92) mk='Make it\u2026';
  else            mk='(Kerema awaits.)';
  return {a:a,b:b,c:c,mk:mk};
}

var KK_FRAME_INSTRS=[
  '<div class="kk-flow-line">Steal any glyph, symbol, fragment \u2014 visual or sound.</div>'
  +'<div class="kk-flow-line">Who or what. And where. Write it down.</div>'
  +'<div class="kk-flow-line">Remain intricately detailed.</div>',
  '<div class="kk-flow-line">Pick any snippet \u2014 visual or sound.</div>'
  +'<div class="kk-flow-line">Find out when, exactly.</div>'
  +'<div class="kk-flow-line">Stay granular.</div>'
  +'<div class="kk-flow-mk kk-flow-mk-apart">(Yes you did.)</div>',
  '<div class="kk-flow-line">Select any content \u2014 the one that disturbs and/or makes sense, tale wise.</div>'
  +'<div class="kk-flow-line">Write down what for. What\u2019s lurking.</div>'
  +'<div class="kk-flow-line">Remain immersive.</div>'
  +'<div class="kk-flow-mk">Make it\u2026</div>'
];
function kkInstrHtml(){
  if(kkIdx<3) return KK_FRAME_INSTRS[kkIdx];
  if(!kkFlow) kkFlow=kkRollFlow();
  var apart=(kkFlow.mk.charAt(0)==='(');
  return '<div class="kk-flow-line">'+kkEsc(kkFlow.a)+'</div>'+
         '<div class="kk-flow-line">'+kkEsc(kkFlow.b)+'</div>'+
         '<div class="kk-flow-line">'+kkEsc(kkFlow.c)+'</div>'+
         '<div class="kk-flow-mk'+(apart?' kk-flow-mk-apart':'')+'">'+kkEsc(kkFlow.mk)+'</div>';
}

// Progress gauge: 5 squares for framing (1-5) + N dots for flow (6+)
function kkRenderDots(){
  var el=document.getElementById('kk-dots');if(!el)return;
  var html='';
  // 3 squares for framing cards
  for(var i=0;i<3;i++){
    var cls='kk-dot kk-dot-sq';
    if(i<kkIdx)cls+=' done';else if(i===kkIdx)cls+=' cur';
    html+='<span class="'+cls+'"></span>';
  }
  // separator
  if(kkTotal>3){
    html+='<span class="kk-dot-sep"></span>';
    var flowN=kkTotal-3;
    for(var j=0;j<flowN;j++){
      var jdx=3+j;
      var c='kk-dot kk-dot-pt';
      if(jdx<kkIdx)c+=' done';else if(jdx===kkIdx)c+=' cur';
      html+='<span class="'+c+'"></span>';
    }
  }
  el.innerHTML=html;
}
window.kkRenderDots=kkRenderDots;

function kkShowMask(){
  var m=FAUNA[kkOrder[kkIdx]];if(!m)return;
  // Tire un nouveau flux si pas encore fait pour cette carte
  if(!kkFlow)kkFlow=kkRollFlow();
  // Compteur: KONTEXT 1 ON 5 / STORY 1 ON N
  var cEl=document.getElementById('kk-count');
  if(cEl){
    if(kkIdx<3) cEl.textContent='KONTEXT '+(kkIdx+1)+' ON 3';
    else{
      var storyN=Math.min(kkIdx-2, kkTotal-3);
      var storyM=kkTotal-3;
      cEl.textContent='STORY '+storyN+' ON '+storyM;
    }
  }
  kkRenderDots();
  var iEl=document.getElementById('kk-instr');
  if(iEl)iEl.innerHTML=kkInstrHtml();
  var c=m.c;
  var fp=(typeof FP!=='undefined'&&FP[m.name])?FP[m.name]:{};
  var motto=fp.motto||m.motto||'';
  var img=m.face?'<img src="data:image/jpeg;base64,'+m.face+'" alt="">':'<span class="kk-ph">?</span>';
  var sk=['STR','DEX','INT','WIS','CHA','CON'];var st=fp.stats||m.stats||{};
  var barsHtml='';
  sk.forEach(function(k){if(!st[k])return;var pct=(st[k]/10*100).toFixed(0);barsHtml+='<div class="bw"><div class="bv">'+st[k]+'</div><div class="bt"><div class="bf" style="height:'+pct+'%;background:'+c+'"></div></div><div class="bl">'+k+'</div></div>';});
  var body='';
  body+=kkRub('Formula',fp.formula,false,c,true,true);
  body+=kkRub('Appearance',fp.appearance,true,'rgba(237,229,216,.78)');
  var line1='';
  if(fp.faction)line1+=fp.faction;
  if(fp.emojis)line1+=(line1?' \u00b7 ':'')+fp.emojis;
  if(fp.attributes)line1+=(line1?' \u2014 ':'')+fp.attributes;
  body+=kkRub('Faction',line1,false,'#ede5d8');
  body+=kkRub('Masks',fp.archetypes,true,'rgba(237,229,216,.68)');
  body+=kkRub('Motto',motto,false,c);
  body+=kkRub('Profile',fp.profile||m.bio,false,'#ede5d8');
  body+=kkRub('Powers',fp.powers||m.pow,false,'rgba(237,229,216,.88)');
  body+=kkRub('Maskomatics',fp.cosmo,false,'rgba(237,229,216,.72)');
  body+=kkRub('Hexagram',fp.hexagram,true,'rgba(237,229,216,.68)');
  body+=kkRub('Mini-stories',fp.ministories,false,'rgba(237,229,216,.82)');
  body+=kkRub('Krewsmatics',fp.synergy,false,'rgba(237,229,216,.82)');
  var imgOn=kkSecHas('Image')?' kk-rub-on':'';
  var statsOn=kkSecHas('Stats')?' kk-rub-on':'';
  var fiche=document.getElementById('kk-fiche');
  if(fiche)fiche.innerHTML='<div class="kk-imgwrap kk-rub'+imgOn+'" data-rub="Image" style="--c:'+c+'">'+img+'</div><div class="kk-meta"><div class="kk-name" style="color:'+c+'">'+m.name.toUpperCase()+'</div>'+(fp.faction?'<div class="kk-sub">'+fp.faction+'</div>':'')+'<div class="kk-bars kk-rub'+statsOn+'" data-rub="Stats">'+barsHtml+'</div><div class="kk-body">'+body+'</div></div>';
  kkRenderSections();
  kkIdleResetForNewCard();
}

function kkRenderSections(){
  var el=document.getElementById('kk-sections');if(!el)return;
  if(kkSecs.length){
    var html='';
    for(var i=0;i<kkSecs.length;i++){
      html+='<button class="kk-chip on" data-rub="'+kkEsc(kkSecs[i])+'">'+kkEsc(kkSecs[i].toUpperCase())+' \u00d7</button>';
    }
    el.innerHTML=html;
  } else {
    el.innerHTML='<div class="kk-chip kk-chip-hint">Pick one to three blocks above \u2014 tap them. Then write below.</div>';
  }
}

function kkAdd(){
  var box=document.getElementById('kk-box');if(!box)return;
  var txt=box.value.trim();
  if(!txt||kkSecs.length<1){return;}
  // Random subtitle for modal (25% each)
  var subs=["Unanimity\'s mandatory, you Krew.","Rational, immersive, granular, odd, surprising \u2014 got it all in?","(Kerema awaits.)","You lil\' busy bee, aren\'t ya?"];
  var sub=subs[Math.floor(Math.random()*subs.length)];
  var subEl=document.getElementById('kk-confirm-sub');
  if(subEl)subEl.textContent=sub;
  kkPending={txt:txt,secs:kkSecs.slice()};
  var c=document.getElementById('kk-confirm');if(c)c.style.display='flex';
}

function kkConfirmYes(){
  var c=document.getElementById('kk-confirm');if(c)c.style.display='none';
  if(!kkPending)return;
  var txt=kkPending.txt, secs=kkPending.secs.slice();kkPending=null;
  var flowSnap=kkFlow?{a:kkFlow.a,b:kkFlow.b,c:kkFlow.c,mk:kkFlow.mk}:null;
  kkEntries.push({secs:secs,txt:txt,mask:FAUNA[kkOrder[kkIdx]].name,idx:kkIdx,flow:flowSnap});
  var feed=document.getElementById('kk-feed');
  if(feed){
    var b=document.createElement('div');b.className='kk-bubble';
    var lbl=(kkIdx<3?'KONTEXT '+(kkIdx+1):'STORY '+(kkIdx-2));
    b.innerHTML='<span class="kk-tag">'+kkTeamTag()+'</span><span class="kk-sec">'+lbl+' \u00b7</span> '+kkEsc(txt);
    feed.appendChild(b);
    document.getElementById('kk-box').value='';
    feed.scrollTop=feed.scrollHeight;
  }
  kkSecs=[];kkRenderSections();kkUpdateCounter();
  kkIdleClear();kkIdleFired=false;
  // Apartes rares (8%)
  if(Math.random()<0.08)setTimeout(kkApartLine,450);
  // Cooperate/betray prompt: a partir de carte 5 (idx>=4), prob 0.30
  if(kkIdx>=4 && Math.random()<0.25)setTimeout(kkRapoport,1200);
  // Avance auto: carte 5 -> seuil, sinon carte suivante
  // Apres cadrage: le joueur choisit la carte libre suivante
  kkIdx++;
  if(kkIdx===3){
    kkSaveNow();
    setTimeout(function(){kkShowThreshold();},500);
    return;
  }
  if(kkIdx>=kkTotal){
    kkSaveNow();
    setTimeout(function(){
      if(typeof ogTransitionIn==='function'){
        ogTransitionIn(function(){ogInit();});
      } else if(typeof ogInit==='function'){
        ogInit();
      } else kkSynth();
    },300);
    return;
  }
  kkFlow=null;
  kkSaveNow();
  setTimeout(function(){kkShowChoose();},500);
}

function kkShowChoose(){
  kkChosenFaunaIdx=-1;
  // Build list of remaining fauna indices (not yet played)
  var played={};
  for(var i=0;i<kkIdx;i++) played[kkOrder[i]]=true;
  var remaining=[];
  for(var i=kkIdx;i<kkTotal;i++) remaining.push(kkOrder[i]);
  var countEl=document.getElementById('kk-choose-count');
  if(countEl) countEl.textContent=(kkTotal-kkIdx)+' LEFT';
  var list=document.getElementById('kk-choose-list');
  if(!list) return;
  list.innerHTML='';
  remaining.forEach(function(fi){
    var f=FAUNA[fi];if(!f)return;
    var fp=(typeof FP!=='undefined'&&FP[f.name])?FP[f.name]:{};
    var item=document.createElement('div');
    item.className='kk-choose-item';
    item.style.setProperty('--mc',f.c||'#c9a84c');
    item.setAttribute('data-fi',fi);
    item.innerHTML='<div class="kk-choose-dot"></div>'
      +'<div><div class="kk-choose-name">'+kkEsc(f.name)+'</div>'
      +(fp.faction?'<div class="kk-choose-sub">'+kkEsc(fp.faction)+'</div>':'')
      +'</div>';
    item.addEventListener('click',function(){kkPickChooseMask(parseInt(this.getAttribute('data-fi')));});
    list.appendChild(item);
  });
  var btn=document.getElementById('kk-play-btn');if(btn)btn.disabled=true;
  kkGo('kk-choose');
}

function kkPickChooseMask(fi){
  if(typeof sndBtn==='function')sndBtn();
  if(kkChosenFaunaIdx===fi){
    // deselect
    kkChosenFaunaIdx=-1;
  } else {
    kkChosenFaunaIdx=fi;
  }
  // Update UI
  var items=document.querySelectorAll('#kk-choose-list .kk-choose-item');
  items.forEach(function(el){
    var elFi=parseInt(el.getAttribute('data-fi'));
    el.classList.toggle('selected',elFi===kkChosenFaunaIdx);
  });
  var btn=document.getElementById('kk-play-btn');
  if(btn) btn.disabled=(kkChosenFaunaIdx<0);
}

function kkPlayChosen(){
  if(kkChosenFaunaIdx<0) return;
  // Swap chosen fauna index into position kkIdx in kkOrder
  var curPos=-1;
  for(var i=kkIdx;i<kkOrder.length;i++){
    if(kkOrder[i]===kkChosenFaunaIdx){curPos=i;break;}
  }
  if(curPos>=0 && curPos!==kkIdx){
    var tmp=kkOrder[kkIdx];kkOrder[kkIdx]=kkOrder[curPos];kkOrder[curPos]=tmp;
  }
  kkChosenFaunaIdx=-1;
  kkFlow=null;
  kkSaveNow();
  kkShowMask();kkGo('kk-mask');
}

function kkBackFromChoose(){
  // Remove last entry from kkEntries and from feed
  if(kkEntries.length>0) kkEntries.pop();
  var feed=document.getElementById('kk-feed');
  if(feed){
    var bubbles=feed.querySelectorAll('.kk-bubble');
    if(bubbles.length>0) bubbles[bubbles.length-1].parentNode.removeChild(bubbles[bubbles.length-1]);
  }
  // Rewind kkIdx (flux = kkIdx>=3)
  if(kkIdx>=3) kkIdx--;
  // Reset card state
  kkSecs=[];kkFlow=null;kkChosenFaunaIdx=-1;
  var box=document.getElementById('kk-box');if(box)box.value='';
  kkRenderSections();kkUpdateCounter();kkUpdateAddBtn();
  kkSaveNow();
  kkShowMask();kkGo('kk-mask');
}

function kkConfirmNo(){var c=document.getElementById('kk-confirm');if(c)c.style.display='none';kkPending=null;}
function kkTeamTag(){return 'KRHGO';}

var KK_HDR='<span class="kk-who">\u2500\u2500 KEREMA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</span>';
function kkKBody(msg){return '<span class="kk-kerema-body">'+msg+'</span>';}
function kkFlash(msg){
  var feed=document.getElementById('kk-feed');if(!feed)return;
  var e=document.createElement('div');e.className='kk-kerema kk-flash';
  e.innerHTML=KK_HDR+kkKBody(msg);
  feed.appendChild(e);feed.scrollTop=feed.scrollHeight;
  setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},2500);
}

function kkApartLine(){
  var feed=document.getElementById('kk-feed');if(!feed)return;
  var e=document.createElement('div');e.className='kk-apart-line';
  e.textContent='\u2508\u2508 '+_pick(KK_APARTES)+' \u2508\u2508';
  feed.appendChild(e);feed.scrollTop=feed.scrollHeight;
}

function kkRapoport(){
  if(kkIdx<4)return;
  var feed=document.getElementById('kk-feed');if(!feed)return;
  if(feed.querySelector('.kk-rapo'))return;
  var msgs=[
    'Did I say you\'ll have to set up da rules? Talk to yourself. Talk to your Krew.',
    'You\'re making the rules here. No one else. What do you owe this story?',
    'Your Krew, your call. Or just you. Either way \u2014 what\'s the deal?',
    'Set da rules. Or don\'t. The Kave doesn\'t care. But you do.'
  ];
  var e=document.createElement('div');e.className='kk-kerema kk-rapo';
  e.innerHTML=KK_HDR+kkKBody(msgs[Math.floor(Math.random()*msgs.length)]);
  feed.appendChild(e);feed.scrollTop=feed.scrollHeight;
}


function kkBayou(){
  var feed=document.getElementById('kk-feed');if(!feed)return;
  var rs=feed.querySelectorAll('.kk-rapo');
  for(var i=0;i<rs.length;i++)rs[i].parentNode.removeChild(rs[i]);
}

function kkHand(){
  var feed=document.getElementById('kk-feed')||document.querySelector('#kk-synth .kk-synthscroll');
  if(!feed)return;
  var head=document.createElement('div');head.className='kk-kerema';
  head.innerHTML=KK_HDR+kkKBody('Need a hand? Shake ur Kalabass.');
  feed.appendChild(head);feed.scrollTop=feed.scrollHeight;
  setTimeout(function(){
    var t=document.createElement('div');t.className='kk-kerema kk-kerema-tail';
    t.innerHTML=KK_HDR+kkKBody(_pick(KK_HAND_TAIL));
    feed.appendChild(t);feed.scrollTop=feed.scrollHeight;
  },700);
}

// --- Inactivite (#9) ---
function kkIdleClear(){if(kkIdleTimer){clearTimeout(kkIdleTimer);kkIdleTimer=null;}}
function kkIdleStart(){
  kkIdleClear();
  if(kkIdleFired)return;
  kkIdleTimer=setTimeout(function(){
    if(kkIdleFired)return;
    kkIdleFired=true;
    kkHand();
  },30000);
}
function kkIdleResetForNewCard(){kkIdleClear();kkIdleFired=false;}
function kkSentenceCount(t){
  if(!t)return 0;
  var s=t.replace(/\s+/g,' ').trim();
  if(!s)return 0;
  // Compter les terminateurs de phrase (. ! ? ...) en evitant les abrev courantes
  var matches=s.match(/[\.\!\?]+(?:\s|$)/g);
  var n=matches?matches.length:0;
  // Si pas de terminateur mais du texte ecrit, c'est au moins 1 phrase en cours
  if(n===0&&s.length>0)n=1;
  // Si le texte se termine sans terminateur mais en a deja, compter la derniere comme +1
  if(matches&&!/[\.\!\?]\s*$/.test(s))n+=1;
  return n;
}
function kkUpdateCounter(){
  var c=document.getElementById('kk-counter');if(!c)return;
  var box=document.getElementById('kk-box');if(!box){c.textContent='';return;}
  var n=kkSentenceCount(box.value);
  c.textContent=n+'/10 phrases';
  if(n>10)c.className='kk-counter over';
  else if(n>=1)c.className='kk-counter ok';
  else c.className='kk-counter';
}
function kkPrefixFromSecs(){
  if(!kkSecs||!kkSecs.length)return '';
  var parts=[];
  for(var i=0;i<kkSecs.length;i++)parts.push('['+kkSecs[i].toUpperCase()+']');
  return parts.join(' ')+' ';
}
function kkStripPrefix(txt){
  // Retire tous les [LABEL] en debut, repetes, separes par espaces
  return txt.replace(/^(\s*\[[A-Z][A-Z\s]*\]\s*)+/,'');
}
function kkSyncBoxFromSecs(){
  var box=document.getElementById('kk-box');if(!box)return;
  var rest=kkStripPrefix(box.value);
  var pre=kkPrefixFromSecs();
  box.value=pre+rest;
  kkUpdateCounter();
}
function kkBoxInput(){
  // Sync inverse: si l'utilisateur a efface un prefixe, retirer le chip correspondant
  var box=document.getElementById('kk-box');
  if(box&&kkSecs.length){
    var v=box.value;
    var still=[];
    for(var i=0;i<kkSecs.length;i++){
      var tag='['+kkSecs[i].toUpperCase()+']';
      if(v.indexOf(tag)===0||v.indexOf(' '+tag)>=0||v.indexOf(tag+' ')>=0){
        still.push(kkSecs[i]);
      }
    }
    if(still.length!==kkSecs.length){
      kkSecs=still;
      kkRenderSections();
    }
  }
  kkUpdateCounter();
  kkIdleStart();
  kkUpdateAddBtn();
}

// --- Seuil apres carte 5 ---
function kkShowThreshold(){
  var p2=document.getElementById('kk-th-p2');
  if(p2)p2.innerHTML='How far?';
  kkGo('kk-threshold');
}
function kkPick4(){ kkSetTotal(7);  kkLeaveThreshold(); }
function kkPick7(){ kkSetTotal(12); kkLeaveThreshold(); }
function kkPick18(){kkSetTotal(18); kkLeaveThreshold(); }
function kkSetTotal(n){kkTotal=n;}
function kkLeaveThreshold(){
  var feed=document.getElementById('kk-feed');
  if(feed){
    var e=document.createElement('div');e.className='kk-kerema kk-build';
    e.innerHTML=KK_HDR+kkKBody(KK_BUILD_CRY);
    feed.appendChild(e);feed.scrollTop=feed.scrollHeight;
  }
  kkIdx=3;kkFlow=null;
  kkSaveNow();
  kkShowChoose();
}

function kkFork(){
  var q=document.getElementById('kk-forkq');
  if(q)q.innerHTML=(kkIdx)+' Masks played. The Kerema holds \u2014 for now.<br><br>Press on, or close the Konklave and seal the lore?';
  kkGo('kk-fork');
}

function kkNext(){
  if(kkIdx>=FAUNA.length||kkIdx>=kkTotal){
    // Beatbox seul avant synthese
    if(typeof beatboxOpen==='function') beatboxOpen('kk');
    else kkSynth();
    return;
  }
  kkFlow=null;
  kkShowChoose();
}

function kkSynth(){
  var recall=document.getElementById('kk-recall');if(!recall)return;
  var html='';
  // KONTEXT block (cartes 1-5)
  html+='<div class="kk-recall-block"><div class="kk-rhd">KONTEXT <span class="kk-n">3 cards</span></div>';
  for(var i=0;i<kkEntries.length;i++){
    var e=kkEntries[i];
    if(e.idx>=3)continue;
    html+='<div class="kk-ritem-wrap"><div class="kk-ritem-lbl">'+(e.idx+1)+' \u00b7 '+kkEsc(e.mask)+'</div><div class="kk-ritem">'+kkEsc(e.txt)+'</div></div>';
  }
  html+='</div>';
  // STORY block (cartes 6+)
  var flowEntries=[];for(var k=0;k<kkEntries.length;k++)if(kkEntries[k].idx>=3)flowEntries.push(kkEntries[k]);
  if(flowEntries.length){
    html+='<div class="kk-recall-block"><div class="kk-rhd">STORY <span class="kk-n">'+flowEntries.length+' cards</span></div>';
    for(var m=0;m<flowEntries.length;m++){
      var fe=flowEntries[m];
      html+='<div class="kk-ritem-wrap"><div class="kk-ritem-lbl">'+(fe.idx-2)+' \u00b7 '+kkEsc(fe.mask)+'</div><div class="kk-ritem">'+kkEsc(fe.txt)+'</div></div>';
    }
    html+='</div>';
  }
  recall.innerHTML=html;
  var sc=document.getElementById('kk-scount');if(sc)sc.textContent=(kkIdx)+' MASKS PLAYED';
  // Cache l'ancien bloc kk-stake-recall si present
  var stakeEl=document.getElementById('kk-stake-recall');
  if(stakeEl)stakeEl.style.display='none';
  kkGo('kk-synth');
}
function kkBuildTxt(){
  var lines=[];
  lines.push('THE KONKLAVE');
  lines.push(kkRepublicanDate());
  lines.push('');
  // Context
  lines.push('-- KONTEXT --');
  for(var i=0;i<kkEntries.length;i++){
    var e=kkEntries[i];if(e.idx>=3)continue;
    lines.push('');
    lines.push('['+(e.idx+1)+'] '+e.mask.toUpperCase());
    lines.push(e.txt);
  }
  lines.push('');
  // Story
  var hasStory=false;
  for(var j=0;j<kkEntries.length;j++){if(kkEntries[j].idx>=3){hasStory=true;break;}}
  if(hasStory){
    lines.push('-- STORY --');
    var sn=1;
    for(var k=0;k<kkEntries.length;k++){
      var se=kkEntries[k];if(se.idx<3)continue;
      lines.push('');
      lines.push('['+sn+'] '+se.mask.toUpperCase());
      lines.push(se.txt);
      sn++;
    }
    lines.push('');
  }
  lines.push('');
  lines.push('(c) Korhogo(tm)');
  return lines.join('\n');
}
function kkDownloadTxt(){
  try{
    var txt=kkBuildTxt();
    var blob=new Blob([txt],{type:'text/plain;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='konklave.txt';
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},1000);
  }catch(e){}
}
window.kkDownloadTxt=kkDownloadTxt;
function kkSeal(){
  // Export TXT
  kkDownloadTxt();
  // Archive la partie + clear save
  var title=kkBuildTitle();
  var arr=kkArchiveLoad();
  arr.unshift({
    title:title,
    date:Date.now(),
    masks:kkIdx,
    entries:kkEntries.slice()
  });
  if(arr.length>50)arr=arr.slice(0,50);
  kkArchiveSave(arr);
  kkClearSave();
  kkGo('kk-done');
}

function kkBlow(){
  // Make it blow: efface tout sans archiver
  kkClearSave();
  kkExit();
}
window.kkBlow=kkBlow;

function kkExit(){
  var p=document.getElementById('konklave-panel');if(p)p.classList.remove('open');
  document.body.style.overflow='';
  kkIdleClear();
}

// --- Archive view ---
function kkOpenArchive(){
  var arr=kkArchiveLoad();
  var box=document.getElementById('kk-ante-list');
  if(!box)return;
  if(!arr.length){
    box.innerHTML='<div class="kk-ante-empty">No Konklaves yet. Seal one first.</div>';
  } else {
    var html='';
    for(var i=0;i<arr.length;i++){
      var a=arr[i];
      var d=new Date(a.date);
      var ds=d.getDate()+' '+['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'][d.getMonth()]+' '+d.getFullYear();
      html+='<div class="kk-ante-entry" data-action="kkOpenAnte('+i+')">'+
            '<div class="kk-ante-title">'+kkEsc(a.title)+'</div>'+
            '<div class="kk-ante-meta">'+a.masks+' Masks \u00b7 '+ds+'</div>'+
            '</div>';
    }
    box.innerHTML=html;
  }
  kkGo('kk-ante');
}
window.kkOpenArchive=kkOpenArchive;

function kkOpenAnte(idx){
  var arr=kkArchiveLoad();var a=arr[idx];if(!a)return;
  var html='<div class="kk-ante-rd-title">'+kkEsc(a.title)+'</div>';
  for(var i=0;i<a.entries.length;i++){
    var e=a.entries[i];
    var lbl=(e.idx<3?'KONTEXT '+(e.idx+1):'STORY '+(e.idx-2));
    html+='<div class="kk-ritem-wrap"><div class="kk-ritem-lbl">'+lbl+' \u00b7 '+kkEsc(e.mask)+'</div><div class="kk-ritem">'+kkEsc(e.txt)+'</div></div>';
  }
  var rd=document.getElementById('kk-ante-read');
  if(rd)rd.innerHTML=html;
  kkGo('kk-ante-read-screen');
}
window.kkOpenAnte=kkOpenAnte;

function kkBackToList(){kkOpenArchive();}
window.kkBackToList=kkBackToList;

// --- Exposition globale (delegation data-action utilise new Function en scope global) ---
window.kkEnter=kkEnter;
window.kkAdd=kkAdd;
window.kkConfirmYes=kkConfirmYes;
window.kkConfirmNo=kkConfirmNo;
window.kkHand=kkHand;
window.kkFork=kkFork;
window.kkNext=kkNext;
window.kkSynth=kkSynth;
window.kkSeal=kkSeal;
window.kkExit=kkExit;
window.kkPickRubric=kkPickRubric;
window.kkPick4=kkPick4;
window.kkPick7=kkPick7;
window.kkPick18=kkPick18;
window.kkBayou=kkBayou;
window.kkBoxInput=kkBoxInput;
window.kkUpdateCounter=kkUpdateCounter;
window.kkSyncBoxFromSecs=kkSyncBoxFromSecs;

// Redirect openFaunarratics to the Konklave
var _kkBoxBound=false;
function _kkBindBox(){
  if(_kkBoxBound)return;
  var box=document.getElementById('kk-box');
  if(!box)return;
  box.addEventListener('input',function(){kkBoxInput();},false);
  _kkBoxBound=true;
}

function kkIntroAnimate(){
  var p1=document.getElementById('kk-intro-p1');
  var p2=document.getElementById('kk-intro-p2');
  if(!p1||!p2) return;
  p1.classList.remove('fadeout');
  p2.style.animation='none';
  p2.style.opacity='0';
  p2.classList.remove('visible');
  setTimeout(function(){
    if(p1) p1.classList.add('fadeout');
    setTimeout(function(){
      if(p1) p1.style.display='none';
      if(p2){
        p2.style.animation='';
        p2.classList.add('visible');
      }
    },800);
  },5400);
}
window.kkIntroAnimate=kkIntroAnimate;
function openFaunarratics(){
  var p=document.getElementById('konklave-panel');
  if(p){p.classList.add('open');document.body.style.overflow='hidden';kkGo('kk-intro');_kkBindBox();
  setTimeout(kkIntroAnimate,100);}
}
window.openFaunarratics=openFaunarratics;


function ogTransitionIn(cb){
  // Glitch puis fondu au noir avant T for Gravity
  var tr=document.getElementById('og-transition');
  if(!tr){if(cb)cb();return;}
  tr.style.display='block';
  tr.style.opacity='0';
  // Flash glitch rapide
  var flashes=0;
  var iv=setInterval(function(){
    tr.style.opacity=(flashes%2===0)?'0.7':'0';
    flashes++;
    if(flashes>=6){
      clearInterval(iv);
      tr.style.opacity='1';
      setTimeout(function(){
        if(cb)cb();
      },300);
    }
  },80);
}

function ogTransitionOut(cb){
  // Fondu au noir puis retour a Faunarratics
  var tr=document.getElementById('og-transition');
  if(!tr){if(cb)cb();return;}
  tr.style.display='block';
  tr.style.opacity='1';
  setTimeout(function(){
    tr.style.opacity='0';
    setTimeout(function(){
      tr.style.display='none';
      if(cb)cb();
    },500);
  },100);
}
// ============================================================
// OIL DROP -- gravity pacman, Korhogo style
// (between us: T for Gravity)
// ============================================================

var OG = null;

// TIME FOR GRAVITY -- rewrite
// PacMan gravity : left/right wrap, fixed grid, oil drop

function ogClose(){
  if(OG){OG.cleanup();OG=null;}
  var panel=document.getElementById('og-panel');
  if(panel) panel.style.display='none';
  var fromSynth=_ogFromSynth;
  _ogFromSynth=false;
  ogTransitionOut(function(){
    if(fromSynth){
      kkGo('kk-synth');
    } else {
      if(typeof kkSynth==='function') kkSynth();
    }
  });
}

var _ogFromSynth=false;
function kkHandSynth(){_ogFromSynth=true;ogInit();}
window.kkHandSynth=kkHandSynth;


// [KG] ogInit() (the "Oil drop / T for Gravity" mini-game) is called by kkConfirmYes() at the end of a
// [KG] Konklave and by kkHandSynth() ("LET THE KEREMA WRAP IT"), but its implementation exists in no
// [KG] Korhogo source (kofa.js, kofa_small.js, index*.html, git history). Without it the original leaves the
// [KG] black #og-transition overlay stuck on screen. Fallback: go straight to the original ogClose(), which
// [KG] fades #og-transition out and returns to THE RECKONING (kkSynth / kk-synth screen).
function ogInit(){ogClose();} // [KG]

// === Ensure all game launchers are global for data-action delegation ===
try{
  window.openFaunarratics=openFaunarratics;
  window.kkShowChoose=kkShowChoose;
  window.kkPickChooseMask=kkPickChooseMask;
  window.kkPlayChosen=kkPlayChosen;
  window.kkBackFromChoose=kkBackFromChoose;
  window.kkDownloadTxt=kkDownloadTxt;
  window.kkHandSynth=kkHandSynth;
  window.ogInit=ogInit;
  window.ogClose=ogClose;
  window.ogSkip=function(){
    if(typeof kkClick==='function')try{kkClick();}catch(_e){}
    if(OG){OG.cleanup();OG=null;}
    var p=document.getElementById('og-panel');if(p)p.style.display='none';
    var fd=document.getElementById('kk-feed');
    if(fd&&typeof KK_HDR!=='undefined'&&typeof kkKBody!=='undefined'){
      var es=document.createElement('div');es.className='kk-kerema';
      es.innerHTML=KK_HDR+kkKBody('Oh, u lost. Pack ur tale by urself, honey bunny.');
      fd.appendChild(es);fd.scrollTop=fd.scrollHeight;
    }
    if(typeof ogTransitionOut==='function')ogTransitionOut(function(){
      if(typeof kkSynth==='function')kkSynth();
    });else if(typeof kkSynth==='function')kkSynth();
  };
  window.ogRestart=function(){
    if(typeof kkClick==='function')try{kkClick();}catch(_e){}
    if(OG){OG.cleanup();OG=null;}
    var p=document.getElementById('og-panel');if(p)p.style.display='none';
    if(typeof ogTransitionIn==='function')ogTransitionIn(function(){ogInit();});
    else ogInit();
  };
}catch(e){}
