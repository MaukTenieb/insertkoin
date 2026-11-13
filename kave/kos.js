/* KorhogOS — le monde d'Insert Koin rangé en système de fichiers, dans quatre apparences d'époque. */
(function(){
'use strict';
var D=window.KDATA,$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
function h(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var ON=/github\.io$/.test(location.hostname);

/* ---------- état ---------- */
function guess(){var u=navigator.userAgent+' '+(navigator.platform||'');if(/Mac|iPhone|iPad/.test(u))return'plat';if(/arm|aarch64/i.test(u)&&/Linux/.test(u)&&!/Android/.test(u))return'fram';if(/Linux|X11|BSD/.test(u)&&!/Android/.test(u))return'motif';return'std'}
var S={theme:guess(),lang:(function(){try{return localStorage.getItem('ik.lang')==='fr'?'fr':'en'}catch(e){return'en'}})(),wall:-1,wallMode:'',psy:true,psyId:'',pos:{},koins:3,ws:0,view:{}};
try{var sv=JSON.parse(localStorage.getItem('kos')||'{}');for(var k in sv)S[k]=sv[k];var kk=parseInt(localStorage.getItem('ik.koins'),10);if(kk>=0)S.koins=Math.min(99,kk)}catch(e){}
/* le psychopompe se tire au hasard à chaque ouverture : le choix du panneau dure jusqu'à la prochaine */delete S.psyPick;S.psyId='';
function save(){try{localStorage.setItem('kos',JSON.stringify(S))}catch(e){}}

/* ---------- textes ---------- */
var TX={
fr:{start:'Démarrer',programs:'Programmes',documents:'Documents',settings:'Paramètres',find:'Rechercher',help:'Aide',run:'Exécuter...',shutdown:'Arrêter...',control:'Panneau de configuration',explorer:'Explorateur',cmd:'Invite de commandes',terminal:'Terminal',notepad:'Bloc-notes',file:'Fichier',edit:'Édition',view:'Affichage',open:'Ouvrir',props:'Propriétés',close:'Fermer',large:'Grandes icônes',details:'Détails',objects:'objet(s)',name:'Nom',size:'Taille',type:'Type',modified:'Modifié le',location:'Emplacement',desc:'Description',general:'Général',version:'Version',copyright:'Copyright',licence:'Licence',ok:'OK',cancel:'Annuler',apply:'Appliquer',folder:'Dossier de fichiers',app:'Application',mask:'Fiche de la Fauna',text:'Document texte',url:'Raccourci Internet',drive:'Disque local',about:'À propos de KorhogOS',display:'Affichage',background:'Arrière-plan',appearance:'Apparence',language:'Langue',psy:'Psychopompes',datetime:'Date et heure',wallpaper:'Papier peint',mode:'Affichage',center:'Centré',tile:'Mosaïque',stretch:'Étiré',scheme:'Modèle',showpsy:'Afficher le psychopompe',stats:'Stats',masks:'Masks',powers:'Powers',up:'Dossier parent',refresh:'Actualiser',arrange:'Réorganiser les icônes',runlbl:'Tapez le nom d\'un programme, d\'un dossier ou d\'un document, et KorhogOS l\'ouvrira.',openlbl:'Ouvrir :',browse:'Parcourir...',shuttitle:'Arrêter KorhogOS',shutq:'Voulez-vous :',shut1:'Arrêter l\'ordinateur ?',shut2:'Redémarrer l\'ordinateur ?',shut3:'Baku Boom : fermer tous les programmes ?',yes:'Oui',no:'Non',safe:'Vous pouvez maintenant éteindre votre ordinateur.',findtitle:'Rechercher : tous les fichiers',named:'Nommé :',lookin:'Rechercher dans :',findnow:'Rechercher',koins:'Koins',volume:'Volume',mute:'Muet',special:'Spécial',empty:'Vider Baku Boom...',restart:'Redémarrer',turnoff:'Éteindre',getinfo:'Lire les informations',newwin:'Nouvelle fenêtre',byicon:'Par icônes',bylist:'Par liste',items:'éléments',avail:'disponibles',apps:'Applications',games:'Jeux',media:'Son et vidéo',internet:'Internet',acc:'Accessoires',prefs:'Préférences',logout:'Déconnexion',filemgr:'Gestionnaire de fichiers',home:'Dossier personnel',texted:'Éditeur de texte',style:'Gestionnaire de styles',welcome:'Bienvenue dans KorhogOS',login:'Nom d\'utilisateur',starting:'Démarrage de KorhogOS...',today:'Aujourd\'hui',month:'Mois',decade:'Décade',greg:'Calendrier grégorien',stat:'Statistiques',formula:'Formula',appearance2:'Appearance',faction:'Faction',masks2:'Masks',profile:'Profile',powers2:'Powers',maskomatics:'Maskomatics',hexagram:'Hexagram',ministories:'Mini-stories',krewsmatics:'Krewsmatics',motto:'Devise',number:'Numéro',random:'Au hasard',free:'Koins',palm:'Palmarès',memory:'Mémoire disponible pour KorhogOS :',reg:'Ce produit est enregistré au nom de :'},
en:{start:'Start',programs:'Programs',documents:'Documents',settings:'Settings',find:'Find',help:'Help',run:'Run...',shutdown:'Shut Down...',control:'Control Panel',explorer:'Explorer',cmd:'Command Prompt',terminal:'Terminal',notepad:'Notepad',file:'File',edit:'Edit',view:'View',open:'Open',props:'Properties',close:'Close',large:'Large Icons',details:'Details',objects:'object(s)',name:'Name',size:'Size',type:'Type',modified:'Modified',location:'Location',desc:'Description',general:'General',version:'Version',copyright:'Copyright',licence:'Licence',ok:'OK',cancel:'Cancel',apply:'Apply',folder:'File Folder',app:'Application',mask:'Fauna profile',text:'Text Document',url:'Internet Shortcut',drive:'Local Disk',about:'About KorhogOS',display:'Display',background:'Background',appearance:'Appearance',language:'Language',psy:'Psychopomps',datetime:'Date/Time',wallpaper:'Wallpaper',mode:'Display',center:'Center',tile:'Tile',stretch:'Stretch',scheme:'Scheme',showpsy:'Show the psychopomp',stats:'Stats',masks:'Masks',powers:'Powers',up:'Up One Level',refresh:'Refresh',arrange:'Arrange Icons',runlbl:'Type the name of a program, folder, or document, and KorhogOS will open it for you.',openlbl:'Open:',browse:'Browse...',shuttitle:'Shut Down KorhogOS',shutq:'Are you sure you want to:',shut1:'Shut down the computer?',shut2:'Restart the computer?',shut3:'Baku Boom: close all programs?',yes:'Yes',no:'No',safe:'It\'s now safe to turn off your computer.',findtitle:'Find: All Files',named:'Named:',lookin:'Look in:',findnow:'Find Now',koins:'Koins',volume:'Volume',mute:'Mute',special:'Special',empty:'Empty Baku Boom...',restart:'Restart',turnoff:'Shut Down',getinfo:'Get Info',newwin:'New Window',byicon:'by Icon',bylist:'by List',items:'items',avail:'available',apps:'Applications',games:'Games',media:'Sound & Video',internet:'Internet',acc:'Accessories',prefs:'Preferences',logout:'Logout',filemgr:'File Manager',home:'Home Folder',texted:'Text Editor',style:'Style Manager',welcome:'Welcome to KorhogOS',login:'Username',starting:'Starting KorhogOS...',today:'Today',month:'Month',decade:'Decade',greg:'Gregorian calendar',stat:'Statistics',formula:'Formula',appearance2:'Appearance',faction:'Faction',masks2:'Masks',profile:'Profile',powers2:'Powers',maskomatics:'Maskomatics',hexagram:'Hexagram',ministories:'Mini-stories',krewsmatics:'Krewsmatics',motto:'Motto',number:'Number',random:'Random',free:'Koins',palm:'Palmarès',memory:'Memory available to KorhogOS:',reg:'This product is licensed to:'}};
function t(k){return TX[S.lang][k]||k}

/* ---------- calendrier républicain (règle d'ik-name.js) ---------- */
var MO=['Vendémiaire','Brumaire','Frimaire','Nivôse','Pluviôse','Ventôse','Germinal','Floréal','Prairial','Messidor','Thermidor','Fructidor','Sansculottides'],
    DAYS=['Primidi','Duodi','Tridi','Quartidi','Quintidi','Sextidi','Septidi','Octidi','Nonidi','Décadi'];
function sext(y){return y<20?(y===3||y===7||y===11||y===15):(y%4===0&&(y%100!==0||y%400===0)&&y%4000!==0)}
function rep(d){d=d||new Date();var n=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(1792,8,22))/864e5),y=1;for(;;){var l=sext(y)?366:365;if(n<l)break;n-=l;y++}return{d:n%30+1,m:Math.floor(n/30)+1,y:y}}
function roman(n){var r='',v=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];v.forEach(function(p){while(n>=p[0]){r+=p[1];n-=p[0]}});return r}
function p2(n){return String(n).padStart(2,'0')}
function repShort(d){var r=rep(d);return p2(r.d)+'/'+p2(r.m)+'/'+r.y+' '+p2(d.getHours())+':'+p2(d.getMinutes())}
function repLong(d){var r=rep(d);return r.d+' '+MO[r.m-1].toLowerCase()+' '+r.y}
var COMMIT=new Date('2026-11-07T16:51:54Z');

/* ---------- icônes ---------- */
function ic(name,size){size=size||32;if(name.indexOf('m:')===0)return '<img class="px" src="a/m/'+name.slice(2)+'-'+(size>16?32:16)+'.png" width="'+size+'" height="'+size+'" alt="">';return KICON(name,size)}
function icURI(name){if(name.indexOf('m:')===0)return 'url(a/m/'+name.slice(2)+'-32.png)';return 'url("data:image/svg+xml,'+encodeURIComponent(KICON(name,32))+'")'}

/* ---------- système de fichiers K:\ ---------- */
function node(o){o.children=o.children||null;return o}
function prog(p){return node({name:p.name,kind:'exe',icon:p.icon,size:p.size,date:COMMIT,prog:p,exe:p.exe})}
function url(name,u,icon){return node({name:name,kind:'url',icon:icon||'url',url:u,size:180+name.length*3,date:COMMIT})}
function txt(name,text,icon){return node({name:name,kind:'txt',icon:icon||'txt',text:text,size:new Blob([text]).size,date:COMMIT})}
function dir(name,children,icon){var d=node({name:name,kind:'dir',icon:icon||'folder',children:children,date:COMMIT});children.forEach(function(c){c.parent=d});return d}
function group(g){return D.P.filter(function(p){return p.group===g}).map(prog)}
function palmText(){var L=['INSERT KOIN · PALMARÈS · '+D.PALM.updated,'','KORONG!   '+(S.lang==='fr'?'Masks battus, buts pris':'Masks beaten, goals in')];
 D.PALM.korong.forEach(function(r,i){L.push(p2(i+1)+'  '+r[0]+'   '+p2(r[1])+'   '+p2(r[2]))});L.push('','FAUNINVADERS   score · wave');
 D.PALM.fauninvaders.forEach(function(r,i){L.push(p2(i+1)+'  '+r[0]+'   '+String(r[1]).padStart(5,' ')+'   '+p2(r[2]))});return L.join('\r\n')}
var FAUNA=dir(S.lang==='fr'?'La Fauna':'The Fauna',D.F.map(function(f){return node({name:f.name,kind:'msk',icon:'m:'+f.slug,size:9000+f.name.length*137,date:COMMIT,fiche:f})}),'fauna');
/* 11 nov. 2026 (Mauk Tenieb, 14 h 19) : à la racine de K:, un raccourci vers le wiki du motel, sous un nom tiré au hasard à chaque ouverture de l'OS ; le wiki reprend ce nom */
var WKN=['KalabWiki','Weaky','WigWiki','Kerema','FauxRhogo'][Math.floor(Math.random()*5)];var WIKI=node({name:WKN,kind:'lieu',icon:'scroll',url:'wiki.html?n='+WKN,size:4096,date:COMMIT});
var ROOT=dir('K:',[
 dir('KorhoGame',group('KorhoGame').concat([dir('Katabatik',group('Katabatik'))])),
 dir('FaunEye',group('FaunEye')),
 dir('3615',group('3615')),
 dir('SurFauna',group('SurFauna')),
 dir('SkopoRhogo',group('SkopoRhogo')),
 FAUNA,
 dir('Lore',[url('Lore','https://mauktenieb.substack.com','scroll'),url('Journal','https://korhogo.substack.com','scroll'),url('Mighty Fauna Sips Your Gas','https://korhogo.substack.com/p/mighty-fauna-sips-your-gas','scroll')]),
 dir('Mauk Tenieb',[url('Bio','https://github.com/MaukTenieb','plaque'),url('Burrows','https://mauktenieb.github.io/katabase','rabbit'),url('Bandcamp','https://mauktenieb.bandcamp.com','vinyl'),url('Threadless','https://korhogo.threadless.com','tshirt'),url('Instagram','https://www.instagram.com/mauktenieb','polaroid'),url('YouTube','https://www.youtube.com/@mauktenieb','vhs'),url('ORCID','https://orcid.org/0009-0007-9096-8267'),url('MusicBrainz','https://musicbrainz.org/artist/701a6795-f583-4567-b8f4-0d05f961d63f','catalog')]),
 WIKI,
 txt('README.md',D.README),txt('LICENSE',D.LICENSE),txt('Palmarès.txt',palmText())
],'drive');
ROOT.kind='drive';
var BAKU=dir('Baku Boom',[],'boom');BAKU.kind='bin';
function pathOf(n){var a=[];for(var x=n;x;x=x.parent)a.unshift(x===ROOT?'':x.name);if(S.theme==='fram'||S.theme==='motif')return '/home/mauk/korhogo'+(a.length>1?'/'+a.slice(1).join('/'):'');if(S.theme==='plat')return 'K:'+(a.length>1?':'+a.slice(1).join(':'):'');return 'K:\\'+a.slice(1).join('\\')}
function rootName(){return 'K:'}
function walk(n,f){f(n);(n.children||[]).forEach(function(c){walk(c,f)})}
function findNode(q){q=String(q).trim().toLowerCase().replace(/^k:\\?/,'');if(!q)return ROOT;var hit=null;
 walk(ROOT,function(n){if(hit)return;var nm=n.name.toLowerCase();if(nm===q||(n.exe&&(n.exe.toLowerCase()===q||n.exe.toLowerCase()===q+'.exe'))||pathOf(n).toLowerCase()==='k:\\'+q)hit=n});
 if(!hit)walk(ROOT,function(n){if(!hit&&n.name.toLowerCase().indexOf(q)===0)hit=n});return hit}
function typeOf(n){return {dir:t('folder'),drive:t('drive'),exe:t('app'),msk:t('mask'),txt:t('text'),url:t('url'),bin:t('folder')}[n.kind]}
function kb(n){if(n.kind==='dir'||n.kind==='drive'||n.kind==='bin')return '';return Math.max(1,Math.ceil(n.size/1024)).toLocaleString(S.lang==='fr'?'fr-FR':'en-US')+(S.lang==='fr'?' Ko':' KB')}
function sumSize(n){var s=0;walk(n,function(x){if(x.size)s+=x.size});return s}

/* ---------- ouverture ---------- */
function openNode(n){
 if(!n)return;window.__petN=n;
 if(n.kind==='dir'||n.kind==='drive'||n.kind==='bin')return explorer(n);
 if(n.kind==='exe')return runProg(n);
 if(n.kind==='msk')return fiche(n);
 if(n.kind==='txt')return notepad(n.name,n.text);
 if(n.kind==='url'){window.open(n.url,'_blank','noopener');return}
 if(n.kind==='lieu'){try{localStorage.setItem('ik.lieu',n.url)}catch(e){}location.href=n.url;return}
 if(n.kind==='sys')return n.run();
}
function runProg(n){var p=n.prog,body=h('div','prog');
 if(ON){body.innerHTML='<iframe src="'+p.url+'" allow="camera;microphone;fullscreen;autoplay" title="'+esc(p.name)+'"></iframe>'}
 else{var s=h('div','scr');s.style.backgroundImage='url('+p.thumb+')';s.title=p.url;s.onclick=function(){window.open(p.url,'_blank','noopener')};body.appendChild(s)}
 return win({key:'p:'+p.id,title:p.name,icon:p.icon,w:720,h:500,body:body,status:[p.exe,ON?'':p.url.replace('https://','')]})}

/* ---------- fenêtres ---------- */
var Z=100,WINS=[],casc=0;
function win(o){
 var ex=WINS.filter(function(w){return w.key===o.key})[0];if(ex&&o.key){ex.el.classList.remove('min');front(ex);return ex}
 var el=h('div','win'+(o.dlg?' dlg':'')),dw=$('#desk').clientWidth,dh=$('#desk').clientHeight;
 var W=Math.min(o.w||480,dw-8),H=Math.min(o.h||340,dh-8);casc=(casc+1)%9;
 el.style.width=W+'px';el.style.height=o.dlg&&!o.h?'auto':H+'px';
 el.style.left=Math.max(4,Math.round((dw-W)/2-140+casc*22))+'px';el.style.top=Math.max(4,Math.round((dh-H)/2-70+casc*20))+'px';
 var tb=h('div','tb');tb.innerHTML='<button class="wmenu" title=""></button><div class="tbt">'+(o.icon?ic(o.icon,16):'')+'<span>'+esc(o.title)+'</span></div><div class="tbb">'+(o.dlg?'':'<button class="n" aria-label="min"></button><button class="m" aria-label="max"></button>')+'<button class="x" aria-label="'+t('close')+'"></button></div>';
 el.appendChild(tb);var wb=h('div','wbody');el.appendChild(wb);
 if(o.menus){var mb=h('div','wmenubar');o.menus.forEach(function(m){var b=h('button',null,m[0]);b.onclick=function(e){e.stopPropagation();popMenu(m[1](),b,'below');b.classList.add('on')};mb.appendChild(b)});wb.appendChild(mb)}
 if(o.tool)wb.appendChild(o.tool);
 if(o.finfo)wb.appendChild(o.finfo);
 wb.appendChild(o.body);
 if(o.status){var st=h('div','wstat');o.status.forEach(function(s){st.appendChild(h('div','thin',esc(s)))});wb.appendChild(st);o.statusEl=st}
 if(!o.dlg)el.appendChild(h('div','grip'));
 $('#desk').appendChild(el);
 var w={key:o.key,el:el,title:o.title,icon:o.icon,ws:S.ws,o:o};WINS.push(w);if(window.__petWin&&!o.dlg)setTimeout(function(){window.__petWin(w)},350);
 el.addEventListener('pointerdown',function(){front(w)});
 $('.x',tb).onclick=function(e){e.stopPropagation();closeWin(w)};
 if(!o.dlg){$('.n',tb).onclick=function(e){e.stopPropagation();el.classList.add('min');front(null)};$('.m',tb).onclick=function(e){e.stopPropagation();el.classList.toggle('max')};tb.addEventListener('dblclick',function(){el.classList.toggle('max')})}
 $('.wmenu',tb).onclick=function(e){e.stopPropagation();popMenu([[t('restore')||'Restaurer',function(){el.classList.remove('max')}],[t('close'),function(){closeWin(w)}]],this,'below')};
 drag(tb,function(dx,dy,s){if(el.classList.contains('max'))return;el.style.left=s.l+dx+'px';el.style.top=Math.max(0,s.t+dy)+'px'},function(){return{l:el.offsetLeft,t:el.offsetTop}});
 var g=$('.grip',el);if(g)drag(g,function(dx,dy,s){el.style.width=Math.max(200,s.w+dx)+'px';el.style.height=Math.max(100,s.h+dy)+'px'},function(){return{w:el.offsetWidth,h:el.offsetHeight}});
 front(w);if(o.onopen)o.onopen(w);return w}
function front(w){WINS.forEach(function(x){x.el.classList.remove('front')});if(w){w.el.classList.add('front');w.el.style.zIndex=++Z}renderTasks()}
function closeWin(w){w.el.remove();WINS=WINS.filter(function(x){return x!==w});var last=WINS.filter(function(x){return !x.el.classList.contains('min')&&x.ws===S.ws}).sort(function(a,b){return b.el.style.zIndex-a.el.style.zIndex})[0];front(last||null)}
function drag(hnd,move,start){hnd.addEventListener('pointerdown',function(e){if(e.button||e.target.closest('button'))return;var x=e.clientX,y=e.clientY,s=start(),moved=false;hnd.setPointerCapture(e.pointerId);
 function mv(ev){moved=true;move(ev.clientX-x,ev.clientY-y,s)}function up(){hnd.removeEventListener('pointermove',mv);hnd.removeEventListener('pointerup',up)}hnd.addEventListener('pointermove',mv);hnd.addEventListener('pointerup',up)})}
function dialog(o){o.dlg=true;return win(o)}

/* ---------- menus ---------- */
var openMenus=[];
function closeMenus(){openMenus.forEach(function(m){m.remove()});openMenus=[];$$('.on',$('#menubar')).forEach(function(b){b.classList.remove('on')});$$('.wmenubar .on').forEach(function(b){b.classList.remove('on')});var sb=$('#startbtn');if(sb)sb.classList.remove('on');$$('.subpanel.open').forEach(function(s){s.classList.remove('open')})}
/* items : [label, action|subitems-fn, icon, opts] ; '-' = séparateur */
function popMenu(items,ref,where,keep,cls){if(!keep)closeMenus();var m=h('div','menu open'+(cls?' '+cls:''));document.body.appendChild(m);openMenus.push(m);
 items.forEach(function(it){if(it==='-'){m.appendChild(h('div','msep'));return}
  var big=it[3]&&it[3].big,b=h('button','mi'+(typeof it[1]==='function'&&it[1].sub?' sub':'')+(it[1]?'':' dis')+(big?' big':''),(it[2]?ic(it[2],big?32:16):'')+'<span>'+esc(it[0])+'</span>'+(it[3]&&it[3].k?'<span class="k">'+it[3].k+'</span>':''));
  if(it[1]&&it[1].sub){var open=function(){$$('.mi.hov',m).forEach(function(x){x.classList.remove('hov')});b.classList.add('hov');var idx=openMenus.indexOf(m);openMenus.slice(idx+1).forEach(function(x){x.remove()});openMenus=openMenus.slice(0,idx+1);popMenu(it[1](),b,'right',true)};b.onmouseenter=open;b.onclick=function(e){e.stopPropagation();open()}}
  else{b.onmouseenter=function(){var idx=openMenus.indexOf(m);openMenus.slice(idx+1).forEach(function(x){x.remove()});openMenus=openMenus.slice(0,idx+1);$$('.mi.hov',m).forEach(function(x){x.classList.remove('hov')})};if(it[1])b.onclick=function(e){e.stopPropagation();closeMenus();it[1]()}}
  m.appendChild(b)});
 var r=ref.getBoundingClientRect?ref.getBoundingClientRect():{left:ref.x,right:ref.x,top:ref.y,bottom:ref.y},mw=m.offsetWidth,mh=m.offsetHeight,x,y;
 if(where==='right'){x=r.right-3;y=r.top-3;if(x+mw>innerWidth)x=r.left-mw+3}else if(where==='above'){x=r.left;y=r.top-mh}else if(where==='at'){x=r.left;y=r.top}else{x=r.left;y=r.bottom}
 if(x+mw>innerWidth)x=innerWidth-mw;if(y+mh>innerHeight)y=innerHeight-mh;m.style.left=Math.max(0,x)+'px';m.style.top=Math.max(0,y)+'px';return m}
function sub(fn){fn.sub=true;return fn}
document.addEventListener('pointerdown',function(e){if(!e.target.closest('.menu,#startbtn,#menubar>button,.wmenubar button,#panel .pb.menu,.subpanel,#fp .tab,#vol'))closeMenus();if(!e.target.closest('#vol,#tVol'))$('#vol').classList.remove('open')});

function progItems(g){var arr=D.P.filter(function(p){return p.group===g});if(g==='KorhoGame')arr=arr.concat(D.P.filter(function(p){return p.group==='Katabatik'}));return arr.map(function(p){return[p.name,function(){runProg(prog(p))},p.icon]})}
var GROUPS=['KorhoGame','FaunEye','3615','SurFauna','SkopoRhogo'];
function groupIcon(g){return{KorhoGame:'programs',FaunEye:'programs',SurFauna:'programs','3615':'minitel',SkopoRhogo:'skopo'}[g]}
function sys(name,icon,run){return{name:name,icon:icon,kind:'sys',run:run}}
function docItems(){return[['README.md',function(){openNode(findNode('README.md'))},'txt'],['LICENSE',function(){openNode(findNode('LICENSE'))},'txt'],['Palmarès.txt',function(){openNode(findNode('Palmarès.txt'))},'txt']]}
function faunaItems(){return FAUNA.children.map(function(n){return[n.name,function(){fiche(n)},n.icon]})}

/* Démarrer (Standard) */
function startMenu(){var items=[
 [t('programs'),sub(function(){return GROUPS.map(function(g){return g==='3615'||g==='SkopoRhogo'?[g==='3615'?'3615':'SkopoRhogo',function(){runProg(prog(D.P.filter(function(p){return p.group===g})[0]))},g==='3615'?'minitel':'skopo']:[g,sub(function(){return progItems(g)}),'programs']}).concat(['-',[S.lang==='fr'?'La Fauna':'The Fauna',sub(faunaItems),'fauna'],[t('explorer'),function(){explorer(ROOT)},'explorer'],[S.lang==='fr'?'Commandes MS-DOS':'MS-DOS Prompt',terminal,'term'],[t('notepad'),function(){notepad(t('notepad'),'')},'txt']])}),'programs',{big:1}],
 [t('documents'),sub(docItems),'folderOpen',{big:1}],
 [t('settings'),sub(function(){return[[t('control'),control,'control']]}),'control',{big:1}],
 [t('find'),sub(function(){return[[t('find')+'...',findDlg,'find']]}),'find',{big:1}],
 [t('help'),help,'help',{big:1}],
 [t('run'),runDlg,'run',{big:1}],'-',
 [t('shutdown'),shutdownDlg,'shutdown',{big:1}]];
 var m=popMenu(items,$('#startbtn'),'above',false);m.id='startmenu';m.insertAdjacentHTML('afterbegin','<div class="band"><b>Korhog</b>OS</div>');
 var r=$('#startbtn').getBoundingClientRect();m.style.left='0px';m.style.top=(r.top-m.offsetHeight)+'px';$('#startbtn').classList.add('on')}

/* barre de menus (Platine) */
function platMenus(){var mb=$('#menubar');mb.innerHTML='';
 var defs=[[ic('koin',16),function(){return[[t('about'),about],'-'].concat(GROUPS.map(function(g){return g==='3615'||g==='SkopoRhogo'?[g,function(){runProg(prog(D.P.filter(function(p){return p.group===g})[0]))},g==='3615'?'minitel':'skopo']:[g,sub(function(){return progItems(g)}),'folder']})).concat([[S.lang==='fr'?'La Fauna':'The Fauna',sub(faunaItems),'fauna'],[t('control'),control,'control']])}],
  [t('file'),function(){var s=selNode();return[[t('newwin'),function(){explorer(ROOT)},null,{k:'⌘N'}],[t('open'),s?function(){openNode(s)}:null,null,{k:'⌘O'}],'-',[t('getinfo'),s?function(){props(s)}:null,null,{k:'⌘I'}],'-',[t('close'),frontWin()?function(){closeWin(frontWin())}:null,null,{k:'⌘W'}],'-',[t('find')+'...',findDlg,null,{k:'⌘F'}]]}],
  [t('edit'),function(){var fr=S.lang==='fr';return[[fr?'Couper':'Cut',null],[fr?'Copier':'Copy',null],[fr?'Coller':'Paste',null]]}],
  [S.lang==='fr'?'Présentation':'View',function(){return[[t('byicon'),function(){setView('icons')}],[t('bylist'),function(){setView('details')}]]}],
  [t('special'),function(){return[[t('empty'),null],'-',[t('restart'),function(){boot(true)}],[t('turnoff'),function(){shutdownNow()}]]}],
  [t('help'),function(){return[[t('help')+' KorhogOS',help]]}]];
 defs.forEach(function(d,i){var b=h('button',null,d[0]);b.onclick=function(e){e.stopPropagation();var was=b.classList.contains('on');closeMenus();if(was)return;popMenu(d[1](),b,'below');b.classList.add('on')};b.onmouseenter=function(){if(openMenus.length&&!b.classList.contains('on'))b.click()};mb.appendChild(b)});
 mb.appendChild(h('div','sp'));mb.appendChild(trayEl('plat'));var c=h('div','clk clkx');mb.appendChild(c);
 var app=h('div','app',ic('koin',16)+'<span class="opt">KorhogOS</span>');mb.appendChild(app);tick()}

/* panneau (Framboise) */
function framPanel(){var p=$('#panel');p.innerHTML='';
 var mbtn=h('button','pb menu',ic('koin',24));mbtn.title=t('apps');mbtn.onclick=function(e){e.stopPropagation();popMenu(framMenu(),mbtn,'below')};p.appendChild(mbtn);
 p.appendChild(h('div','sep'));
 [['explorer',function(){explorer(ROOT)},t('filemgr')],['term',terminal,t('terminal')],['minitel',function(){runProg(prog(D.P.filter(function(x){return x.id==='3615'})[0]))},'3615']].forEach(function(q){var b=h('button','pb',ic(q[0],24));b.title=q[2];b.onclick=q[1];p.appendChild(b)});
 p.appendChild(h('div','sep'));var tk=h('div');tk.id='ptasks';p.appendChild(tk);
 var tr=trayEl('fram');tr.id='ptray';p.appendChild(tr);renderTasks();tick()}
function framMenu(){return[
 [t('games'),sub(function(){return progItems('KorhoGame')}),'die'],
 [t('media'),sub(function(){return progItems('FaunEye').concat([['SkopoRhogo',function(){runProg(prog(D.P.filter(function(p){return p.id==='skopo'})[0]))},'skopo']])}),'vhs'],
 [t('internet'),sub(function(){return progItems('SurFauna').concat([['3615',function(){runProg(prog(D.P.filter(function(p){return p.id==='3615'})[0]))},'minitel']])}),'url'],
 [S.lang==='fr'?'La Fauna':'The Fauna',sub(faunaItems),'fauna'],
 [t('acc'),sub(function(){return[[t('filemgr'),function(){explorer(ROOT)},'explorer'],[t('terminal'),terminal,'term'],[t('notepad'),function(){notepad(t('notepad'),'')},'txt'],[t('find'),findDlg,'find']]}),'programs'],
 [t('help'),help,'help'],
 [t('prefs'),sub(function(){return[[t('control'),control,'control'],[t('display'),displayDlg,'computer']]}),'control'],'-',
 [t('run'),runDlg,'run'],[t('shutdown'),shutdownDlg,'shutdown']]}

/* tableau de bord (Motif) */
var WSN=['KorhoGame','FaunEye','SurFauna','3615'];
function motifPanel(){var f=$('#fp');f.innerHTML='';
 function ctl(icon,label,act,tabFn){var c=h('div','ctl');var tab=h('div','tab',tabFn?'▲':'');c.appendChild(tab);var b=h('button','body',ic(icon,32)+'<small>'+esc(label)+'</small>');b.onclick=act;c.appendChild(b);
  if(tabFn){tab.style.cursor='pointer';tab.onclick=function(e){e.stopPropagation();var sp=$('#subp');var was=sp.classList.contains('open')&&sp._for===c;closeMenus();if(was)return;sp.innerHTML='<div class="hd"><span>'+esc(label)+'</span><span>▼</span></div>';tabFn().forEach(function(it){var x=h('button',null,ic(it[2],32)+'<span>'+esc(it[0])+'</span>');x.onclick=function(){closeMenus();it[1]()};sp.appendChild(x)});sp._for=c;sp.classList.add('open');var r=c.getBoundingClientRect();sp.style.left=r.left+'px';sp.style.top=(r.top-sp.offsetHeight)+'px'}}
  return c}
 f.appendChild(h('div','grip'));
 var clk=h('div','clock','<svg width="44" height="44" viewBox="0 0 44 44" id="aclk"></svg>');f.appendChild(clk);
 var dt=h('div','date','<span id="fpm"></span><b id="fpd"></b><span id="fpy"></span>');dt.title=repLong(new Date());f.appendChild(dt);
 f.appendChild(ctl('drive',t('home'),function(){explorer(ROOT)},function(){return GROUPS.map(function(g){var n=findNode(g);return[g,function(){explorer(n)},groupIcon(g)]})}));
 f.appendChild(ctl('txt',t('texted'),function(){notepad(t('notepad'),'')},docItems));
 f.appendChild(ctl('fauna',S.lang==='fr'?'La Fauna':'The Fauna',function(){explorer(FAUNA)},faunaItems));
 var lk=h('div','lock');var b1=h('button',null,KICON('koin',16));b1.title=t('about');b1.onclick=about;var b2=h('button',null,KICON('shutdown',16));b2.title=t('logout');b2.onclick=shutdownDlg;lk.appendChild(b1);lk.appendChild(b2);f.appendChild(lk);
 var ws=h('div','ws');WSN.forEach(function(n,i){var b=h('button',i===S.ws?'on':'',esc(n));b.onclick=function(){setWS(i)};ws.appendChild(b)});f.appendChild(ws);
 var lk2=h('div','lock');var b3=h('button',null,ic('koin',16));b3.title=t('koins')+' : '+p2(S.koins);var b4=h('button',null,'<b style="font-size:12px">'+S.lang.toUpperCase()+'</b>');b4.onclick=toggleLang;lk2.appendChild(b3);lk2.appendChild(b4);f.appendChild(lk2);
 f.appendChild(ctl('term',t('terminal'),terminal));
 f.appendChild(ctl('help',t('help'),help));
 f.appendChild(ctl('control',t('style'),control,function(){return[[t('display'),displayDlg,'computer'],[t('language'),langDlg,'url'],[t('psy'),psyDlg,'m:'+(S.psyId||'c7h5n3o6')],[t('datetime'),dateDlg,'koin']]}));

 f.appendChild(h('div','grip'));drawClock();tick()}
function setWS(i){S.ws=i;save();$$('#fp .ws button').forEach(function(b,j){b.classList.toggle('on',j===i)});WINS.forEach(function(w){w.el.style.display=w.ws===i?'':'none'})}
function drawClock(){var s=$('#aclk');if(!s)return;var d=new Date(),a=(d.getHours()%12+d.getMinutes()/60)*30,b=d.getMinutes()*6;
 function hand(deg,len,w){var r=deg*Math.PI/180;return '<line x1="22" y1="22" x2="'+(22+Math.sin(r)*len)+'" y2="'+(22-Math.cos(r)*len)+'" stroke="#000" stroke-width="'+w+'"/>'}
 var ticks='';for(var i=0;i<12;i++){var r=i*30*Math.PI/180;ticks+='<rect x="'+(21+Math.sin(r)*18)+'" y="'+(21-Math.cos(r)*18)+'" width="2" height="2" fill="#2c2f3b"/>'}
 s.innerHTML='<circle cx="22" cy="22" r="20" fill="#e4e6ee" stroke="#6b7187" stroke-width="2"/>'+ticks+hand(a,11,2.5)+hand(b,16,1.5);
 var r2=rep(d);var m=$('#fpm');if(m){m.textContent=MO[r2.m-1].toLowerCase();$('#fpd').textContent=r2.d;$('#fpy').textContent=r2.y}}

/* plateau */
function trayEl(th){var tr=h('div');tr.id=th==='std'?'tray':'';if(th==='std')tr.className='';
 var k=h('button','t',ic('koin',16)+'<span>'+p2(S.koins)+'</span>');k.title=t('koins')+' : '+p2(S.koins);k.onclick=function(){balloon({name:t('koins'),line:p2(S.koins)+' / 99'},k)};
 var v=h('button','t',speaker());v.id='tVol';v.title='Motel Sound';v.onclick=function(e){e.stopPropagation();var vol=$('#vol');vol.classList.toggle('open');vol.className=vol.className.replace(/ ?(out)/,'')+' out';var r=v.getBoundingClientRect();vol.style.left=Math.min(innerWidth-80,r.left-30)+'px';vol.style.top=(S.theme==='std'?r.top-140:r.bottom+4)+'px'};
 var l=h('button','t','<span>'+S.lang.toUpperCase()+'</span>');l.title=t('language');l.onclick=toggleLang;
 tr.appendChild(k);tr.appendChild(v);tr.appendChild(l);
 if(th!=='plat'){var c=h('span','clkx');tr.appendChild(c)}return tr}
function speaker(){return '<svg width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges"><path d="M2 6h3l4-4v12l-4-4H2z" fill="#000"/><path d="M3 7h2l3-3v8l-3-3H3z" fill="#ffff00"/><rect x="11" y="5" width="1" height="6" fill="#000"/><rect x="13" y="3" width="1" height="10" fill="#000"/></svg>'}
function tick(){var d=new Date();$$('.clkx').forEach(function(c){c.textContent=p2(d.getHours())+':'+p2(d.getMinutes());c.title=repLong(d)+' · '+d.toLocaleDateString(S.lang==='fr'?'fr-FR':'en-GB')});drawClock()}
setInterval(tick,10000);

function renderTasks(){var host=S.theme==='std'?$('#tasks'):S.theme==='fram'?$('#ptasks'):null;if(!host)return;host.innerHTML='';
 WINS.forEach(function(w){var on=w.el.classList.contains('front')&&!w.el.classList.contains('min');var b=h('button',(S.theme==='std'?'out ':'')+(on?'on':''),(w.icon?ic(w.icon,16).replace('<svg','<svg class="ti"').replace('<img','<img class="ti"'):'')+'<span>'+esc(w.title)+'</span>');
  b.onclick=function(){if(w.el.classList.contains('min')){w.el.classList.remove('min');front(w)}else if(w.el.classList.contains('front')){w.el.classList.add('min');front(null)}else front(w)};host.appendChild(b)})}

/* ---------- Explorateur ---------- */
function setView(v){var w=frontWin();if(w&&w.o.setView)w.o.setView(v)}
function frontWin(){return WINS.filter(function(w){return w.el.classList.contains('front')})[0]}
var SEL=null;function selNode(){return SEL}
function explorer(n){
 if(n===ROOT)ROOT.name=rootName();var cur=n,view=S.view[pathOf(n)]||'icons',o={key:'e:'+pathOf(n),title:S.theme==='motif'?'File Manager - '+pathOf(n):n.name,icon:n.kind==='drive'?'drive':n===FAUNA?'fauna':n.kind==='bin'?'boom':'folderOpen',w:Math.min(560,innerWidth-10),h:380};
 var body=h('div','split'+(S.theme==='fram'?' hasside':'')),side=h('div','side'),vw=h('div','wview');body.appendChild(side);body.appendChild(vw);
 var tool=h('div','wtool'),addr=h('div','addr in');
 var bUp=h('button','tbtn out',KICON('folderOpen',16));bUp.title=t('up');bUp.onclick=function(){if(cur.parent)go(cur.parent)};
 var bI=h('button','tbtn out',KICON('folder',16));bI.title=t('large');bI.onclick=function(){view='icons';draw()};
 var bD=h('button','tbtn out',KICON('txt',16));bD.title=t('details');bD.onclick=function(){view='details';draw()};
 tool.appendChild(addr);tool.appendChild(bUp);tool.appendChild(bI);tool.appendChild(bD);
 var finfo=h('div','finfo');
 o.body=body;o.tool=tool;o.finfo=finfo;o.status=['',''];
 var fileM=[t('file'),function(){return[[t('open'),SEL?function(){openNode(SEL)}:null],[t('props'),SEL?function(){props(SEL)}:null],'-',[t('close'),function(){closeWin(w)}]]}];var FR=S.lang==='fr';o.menus=S.theme==='fram'?[fileM,[FR?'Éditer':'Edit',function(){return[[FR?'Couper':'Cut',null],[FR?'Copier':'Copy',null],[FR?'Coller':'Paste',null]]}],[t('view'),function(){return[[t('large'),function(){view='icons';draw()}],[t('details'),function(){view='details';draw()}]]}],[FR?'Signets':'Bookmarks',function(){return ROOT.children.filter(function(c){return c.kind==='dir'}).map(function(c){return[c.name,function(){go(c)},'folder']})}],[FR?'Aller':'Go',function(){return[[t('up'),function(){if(cur.parent)go(cur.parent)}],[t('home'),function(){go(ROOT)}]]}],[FR?'Outils':'Tools',function(){return[[t('terminal'),terminal]]}],[t('help'),function(){return[[t('about'),about]]}]]:S.theme==='motif'?[[ 'File',fileM[1]],['Selected',function(){return[[t('open'),SEL?function(){openNode(SEL)}:null],[t('props'),SEL?function(){props(SEL)}:null]]}],['View',function(){return[[t('large'),function(){view='icons';draw()}],[t('details'),function(){view='details';draw()}]]}],['Help',function(){return[[t('about'),about]]}]]:[fileM,[t('view'),function(){return[[t('large'),function(){view='icons';draw()}],[t('details'),function(){view='details';draw()}],'-',[t('refresh'),draw]]}],[S.theme==='std'?'?':t('help'),function(){return[[t('help'),help],[t('about'),about]]}]];
 o.setView=function(v){view=v;draw()};
 var w=win(o);
 function go(x){cur=x;w.title=S.theme==='motif'?'File Manager - '+pathOf(x):x.name;$('.tbt span',w.el).textContent=w.title;draw();renderTasks()}
 function sideDraw(){side.innerHTML='';[[ROOT,'drive']].concat(ROOT.children.filter(function(c){return c.kind==='dir'}).map(function(c){return[c,c===FAUNA?'fauna':'folder']})).forEach(function(a){var b=h('button',a[0]===cur?'on':'',KICON(a[1],16)+'<span>'+esc(a[0].name)+'</span>');b.onclick=function(){go(a[0])};side.appendChild(b)})}
 function draw(){S.view[pathOf(cur)]=view;save();addr.innerHTML=ic(cur.kind==='drive'?'drive':'folderOpen',16)+'<span>'+esc(pathOf(cur))+'</span>';sideDraw();
  var kids=cur.children||[];vw.innerHTML='';SEL=null;
  if(view==='icons'){var g=h('div','vicons');kids.forEach(function(c){var it=h('div','vi'+(c.kind==='url'?' ':''),'<div class="ig'+(c.kind==='url'?' lnk':'')+'">'+ic(c.icon,32)+'</div><div class="lb">'+esc(c.name)+'</div>');bindItem(it,c,g);g.appendChild(it)});vw.appendChild(g)}
  else{var tb=h('table','vdet');tb.innerHTML='<thead><tr><th>'+t('name')+'</th><th>'+t('size')+'</th><th>'+t('type')+'</th><th>'+t('modified')+'</th></tr></thead>';var tbd=h('tbody');kids.forEach(function(c){var tr=h('tr',null,'<td>'+ic(c.icon,16)+'<span>'+esc(c.name)+'</span></td><td class="r">'+kb(c)+'</td><td>'+typeOf(c)+'</td><td>'+(c.date?repShort(c.date):'')+'</td>');bindItem(tr,c,tbd);tbd.appendChild(tr)});tb.appendChild(tbd);vw.appendChild(tb)}
  var tot=Math.ceil(sumSize(cur)/1024);var loc=S.lang==='fr'?'fr-FR':'en-US';
  if(o.statusEl){o.statusEl.children[0].textContent=kids.length+' '+t('objects');o.statusEl.children[1].textContent=tot.toLocaleString(loc)+(S.lang==='fr'?' Ko':' KB')}
  finfo.innerHTML='<span>'+kids.length+' '+t('items')+'</span><span>'+p2(S.koins)+' Koins '+t('avail')+'</span>'}
 function bindItem(it,c,parent){it.addEventListener('click',function(e){$$('.sel',parent).forEach(function(x){x.classList.remove('sel')});it.classList.add('sel');SEL=c;if(coarse())openNode(c);else say(c,it)});
  it.addEventListener('dblclick',function(){openNode(c)});it.addEventListener('contextmenu',function(e){e.preventDefault();it.click();ctxMenu(c,e)})}
 draw();return w}
function coarse(){return matchMedia('(pointer:coarse)').matches}
function ctxMenu(n,e){popMenu([[t('open'),function(){openNode(n)}],'-',[t('props'),function(){props(n)}]],{getBoundingClientRect:function(){return{left:e.clientX,top:e.clientY,right:e.clientX,bottom:e.clientY}}},'at')}

/* ---------- Propriétés ---------- */
function tabs(names,panes,w){var wrap=h('div');wrap.style.cssText='display:flex;flex-direction:column;flex:1;min-height:0';var tb=h('div','tabs'),pane=h('div','tabpane');wrap.appendChild(tb);wrap.appendChild(pane);
 names.forEach(function(nm,i){var b=h('button',i?'':'on',esc(nm));b.onclick=function(){$$('button',tb).forEach(function(x){x.classList.remove('on')});b.classList.add('on');pane.innerHTML='';pane.appendChild(panes[i]())};tb.appendChild(b)});pane.appendChild(panes[0]());return wrap}
function rows(pairs){var g=h('div','prow');pairs.forEach(function(p){if(p==='-'){g.appendChild(h('div','hr'));g.lastChild.style.gridColumn='1/3';return}if(!p[1])return;g.appendChild(h('div','k',p[0]?esc(p[0])+' :':''));g.appendChild(h('div','v',p[2]?p[1]:esc(p[1])))});return g}
function btnRow(w,extra,apply){var b=h('div','btns');var ok=h('button','btn def',t('ok'));ok.onclick=function(){if(extra)extra();closeWin(w)};var c=h('button','btn',t('cancel'));c.onclick=function(){closeWin(w)};b.appendChild(ok);b.appendChild(c);if(apply){var a=h('button','btn',t('apply'));a.disabled=true;a.style.color='#808080';b.appendChild(a)}return b}
function props(n){
 if(n.kind==='msk')return fiche(n);
 var body=h('div','dbody');body.style.cssText='flex:1;min-height:0';var w;
 var gen=function(){var d=h('div');d.appendChild(rows([['',''],[t('type'),typeOf(n)],[t('location'),n.parent?pathOf(n.parent):'K:'],[t('size'),n.kind==='dir'||n.kind==='drive'?Math.ceil(sumSize(n)/1024).toLocaleString()+(S.lang==='fr'?' Ko':' KB'):kb(n)+' ('+(n.size||0).toLocaleString()+(S.lang==='fr'?' octets)':' bytes)')],'-',[t('modified'),n.date?repLong(n.date)+', '+p2(n.date.getHours())+':'+p2(n.date.getMinutes()):''],n.url?[ 'URL',n.url]:['','']]));
  d.insertAdjacentHTML('afterbegin','<div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">'+ic(n.icon,32)+'<input class="field in" value="'+esc(n.name)+'" style="flex:1"></div><div class="hr"></div>');return d};
 var panes=[gen],names=[t('general')];
 if(n.kind==='exe'){names.push(t('version'));panes.push(function(){return rows([[t('desc'),n.prog.desc],[t('name'),n.exe],[t('copyright'),'© Korhogo™, Korhogo Fauna™ & Mauk Tenieb'],[t('licence'),'Code: MIT. Korhogo material (characters, names, marks, lore, texts, images, music): all rights reserved.'],['URL',n.prog.url]])})}
 body.appendChild(tabs(names,panes));
 w=dialog({key:'pr:'+pathOf(n),title:(S.lang==='fr'?'Propriétés de ':'')+n.name+(S.lang==='fr'?'':' Properties'),w:380,h:430,body:body});body.appendChild(btnRow(w,null,1));return w}
function fiche(n){var f=n.fiche,body=h('div','dbody');body.style.cssText='flex:1;min-height:0';var w;
 var L=function(k){return t(k)};
 var panes=[
  function(){var d=h('div');d.innerHTML='<div class="bust in"><img src="a/b-'+f.slug+'.webp" alt=""></div>';d.appendChild(rows([[L('number'),'N° '+f.num],[t('name'),f.name],['',f.motto],['',f.sub],'-',[L('formula'),f.formula],[L('appearance2'),f.appearance],[L('faction'),f.faction]]));return d},
  function(){var d=h('div');['STR','DEX','INT','WIS','CHA','CON'].forEach(function(k){var v=+f.stats[k],bar='';for(var i=0;i<10;i++)bar+=i<v?'<i></i>':'<i style="background:transparent"></i>';d.insertAdjacentHTML('beforeend','<div class="statbar"><b>'+k+'</b><div class="bar in">'+bar+'</div><span>'+v+'</span></div>')});
   var tot=['STR','DEX','INT','WIS','CHA','CON'].reduce(function(a,k){return a+(+f.stats[k])},0);d.insertAdjacentHTML('beforeend','<div class="hr"></div>');d.appendChild(rows([['Total',tot+' / 60']]));return d},
  function(){return rows([[L('masks2'),f.masks],[L('maskomatics'),f.maskomatics],[L('hexagram'),f.hexagram],[L('krewsmatics'),f.krewsmatics]])},
  function(){return rows([[L('profile'),f.profile],[L('powers2'),f.powers],[L('ministories'),f['mini-stories']]])},
  function(){return rows([['Korong!',S.lang==='fr'?(f.korong_fr||f.korong_en):f.korong_en],'-',['',S.lang==='fr'?'Fiche en ligne':'Online sheet'],['URL','<a href="https://mauktenieb.github.io/insertkoin/fauna-'+f.slug+'.html" target="_blank" rel="noopener">fauna-'+f.slug+'.html</a>',1]])}];
 body.appendChild(tabs([t('general'),L('stats'),L('masks'),L('powers'),'Korong!'],panes));
 w=dialog({key:'f:'+f.slug,title:(S.lang==='fr'?'Propriétés de ':'')+f.name+(S.lang==='fr'?'':' Properties'),icon:n.icon,w:400,h:470,body:body});body.appendChild(btnRow(w,null,1));return w}

/* ---------- Bloc-notes ---------- */
function notepad(title,text){var pre=h('pre','note');pre.textContent=text;pre.contentEditable='true';pre.spellcheck=false;var v=h('div','wview');v.appendChild(pre);
 return win({key:'n:'+title,title:title+' - '+t('notepad'),icon:'txt',w:600,h:420,body:v,menus:[[t('file'),function(){return[[t('close'),function(){closeWin(frontWin())}]]}],[t('edit'),function(){return[[S.lang==='fr'?'Copier':'Copy',function(){try{navigator.clipboard.writeText(getSelection().toString()||pre.textContent)}catch(e){}}]]}],[S.theme==='std'?'?':t('help'),function(){return[[t('about'),about]]}]]})}

/* ---------- invite de commandes ---------- */
function terminal(){var box=h('div','wview term'),cwd=ROOT,hist=[],hi=0;
 var unix=S.theme!=='std';
 function prompt(){return unix?'mauk@korhogo:'+(cwd===ROOT?'~':'~/'+pathOf(cwd).split('\\').slice(1).join('/'))+'$ ':pathOf(cwd)+'>'}
 function out(s){var p=h('div');p.textContent=s;box.insertBefore(p,line)}
 var line=h('div'),ps=h('span'),inp=h('input');inp.spellcheck=false;inp.autocapitalize='off';line.appendChild(ps);line.appendChild(inp);
 box.appendChild(h('div',null,unix?'KorhogOS · '+repLong(new Date())+'\n':'\nKorhogOS\n    (C) Korhogo™, Korhogo Fauna™ & Mauk Tenieb\n\n'));box.appendChild(line);ps.textContent=prompt();
 function resolve(arg){if(!arg)return cwd;if(arg==='..')return cwd.parent||cwd;if(arg==='\\'||arg==='/'||arg==='~')return ROOT;var low=arg.toLowerCase().replace(/^\.?[\\/]/,'');return (cwd.children||[]).filter(function(c){return c.name.toLowerCase()===low||(c.exe&&(c.exe.toLowerCase()===low||c.exe.toLowerCase()===low+'.exe'))})[0]||findNode(arg)}
 var C={
  help:function(){out(unix?'ls  cd  cat  open  date  koins  whoami  uname  clear  exit':'DIR  CD  TYPE  START  DATE  KOINS  VER  CLS  EXIT')},
  dir:function(){var k=cwd.children||[];if(!unix){var fr=S.lang==='fr',tot=0;out(fr?' Le volume dans le lecteur K s\'appelle KORHOGO':' Volume in drive K is KORHOGO');out((fr?' Répertoire de ':' Directory of ')+pathOf(cwd)+'\n');
   k.forEach(function(c){var nm=(c.exe||c.name).toUpperCase().replace(/[^A-Z0-9._]/g,''),base=nm.split('.')[0].slice(0,8),ext=(nm.split('.')[1]||'').slice(0,3),r=rep(c.date||COMMIT),d=p2(r.d)+'-'+p2(r.m)+'-'+String(r.y).slice(-2)+'  '+p2(COMMIT.getHours())+':'+p2(COMMIT.getMinutes());if(c.size&&c.kind!=='dir')tot+=c.size;
    out(base.padEnd(9)+ext.padEnd(4)+(c.kind==='dir'||c.kind==='drive'?'  <REP>      ':String(c.size||0).replace(/\B(?=(\d{3})+(?!\d))/g,' ').padStart(13))+' '+d+' '+c.name)});
   var nf=k.filter(function(c){return c.kind!=='dir'}).length,nd=k.length-nf;out('         '+nf+(fr?' fichier(s)    ':' file(s)    ')+String(tot).replace(/\B(?=(\d{3})+(?!\d))/g,' ').padStart(12)+(fr?' octets':' bytes'));out('         '+nd+(fr?' Rép(s)  ':' dir(s)   '))}
   else out(k.map(function(c){return c.kind==='dir'?c.name+'/':(c.exe?c.exe.toLowerCase():c.name)}).join('  '))},
  cd:function(a){var n=resolve(a);if(n&&(n.kind==='dir'||n.kind==='drive'))cwd=n;else out(unix?'cd: '+a+': No such file or directory':S.lang==='fr'?'Chemin d\'accès introuvable':'Invalid directory')},
  type:function(a){var n=resolve(a);if(n&&n.kind==='txt')out(n.text);else if(n&&n.kind==='msk'){var f=n.fiche;out('N° '+f.num+'  '+f.name+'\n'+f.motto+'\n'+f.sub+'\nSTR '+f.stats.STR+'  DEX '+f.stats.DEX+'  INT '+f.stats.INT+'  WIS '+f.stats.WIS+'  CHA '+f.stats.CHA+'  CON '+f.stats.CON+'\n'+f.appearance)}else out(unix?'cat: '+a+': No such file':S.lang==='fr'?'Fichier introuvable':'File not found')},
  start:function(a){var n=resolve(a);if(n&&n!==cwd)openNode(n);else if(n===cwd)explorer(cwd);else out(unix?'open: '+a+': not found':S.lang==='fr'?'Fichier introuvable : '+a:'File not found - '+a)},
  date:function(){out(repLong(new Date()))},koins:function(){out(p2(S.koins)+' Koins')},
  whoami:function(){out('mauk')},ver:function(){out('KorhogOS · an '+roman(rep().y))},
  cls:function(){$$('div',box).forEach(function(d){if(d!==line)d.remove()})},exit:function(){closeWin(w)}};
 C.ls=C.dir;C.cat=C.type;C.open=C.start;C.clear=C.cls;C.uname=C.ver;C.aide=C.help;
 inp.addEventListener('keydown',function(e){if(e.key==='Enter'){var v=inp.value;out(prompt()+v);inp.value='';hist.push(v);hi=hist.length;var a=v.trim().split(/\s+/),cmd=(a.shift()||'').toLowerCase();
   if(cmd){if(C[cmd])C[cmd](a.join(' '));else{var n=resolve(cmd);if(n&&n.kind!=='dir')openNode(n);else if(n&&n.kind==='dir'){cwd=n}else out(unix?cmd+': command not found':S.lang!=='fr'?'Bad command or file name':'\''+cmd+'\' n\'est pas reconnu en tant que commande interne\nou externe, un programme exécutable ou un fichier de commandes.')}}
   ps.textContent=prompt();box.scrollTop=box.scrollHeight}
  else if(e.key==='ArrowUp'){if(hi>0)inp.value=hist[--hi]||''}else if(e.key==='ArrowDown'){inp.value=hist[++hi]||''}});
 box.addEventListener('click',function(){inp.focus()});
 var w=win({key:'term',title:unix?'mauk@korhogo: ~':(S.lang==='fr'?'Commandes MS-DOS':'MS-DOS Prompt'),icon:'term',w:560,h:330,body:box,onopen:function(){setTimeout(function(){inp.focus()},50)}});return w}

/* ---------- Exécuter, Rechercher ---------- */
function runDlg(){var body=h('div','dbody');body.innerHTML='<div style="display:flex;gap:12px;align-items:flex-start">'+ic('run',32)+'<div>'+t('runlbl')+'</div></div><div style="display:flex;align-items:center;gap:8px"><span>'+t('openlbl')+'</span><input class="field in" id="runf" value="korong"></div>';
 var w=dialog({key:'run',title:t('run').replace('...',''),w:360,body:body});
 var b=h('div','btns'),ok=h('button','btn def',t('ok')),c=h('button','btn',t('cancel'));b.appendChild(ok);b.appendChild(c);body.appendChild(b);
 var f=$('#runf',body);f.focus();f.select();function go(){var n=findNode(f.value);closeWin(w);if(n)openNode(n);else msgBox(t('run'),'« '+f.value+' » ?','term')}
 ok.onclick=go;c.onclick=function(){closeWin(w)};f.addEventListener('keydown',function(e){if(e.key==='Enter')go();if(e.key==='Escape')closeWin(w)})}
function findDlg(){var body=h('div','dbody');body.style.cssText='flex:1;min-height:0';body.innerHTML='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:6px 8px;align-items:center"><span>'+t('named')+'</span><input class="field in" id="ff" value="Ma"><button class="btn def" id="fgo">'+t('findnow')+'</button><span>'+t('lookin')+'</span><div class="field in">'+ic('drive',16).replace('<svg','<svg style="display:inline;vertical-align:-3px"')+' K:</div></div><div class="wview in" style="flex:1;min-height:120px"></div>';
 var w=dialog({key:'find',title:t('findtitle'),icon:'find',w:440,h:340,body:body}),res=$('.wview',body);
 function go(){var q=$('#ff',body).value.toLowerCase(),tb=h('table','vdet');tb.innerHTML='<thead><tr><th>'+t('name')+'</th><th>'+t('location')+'</th><th>'+t('type')+'</th></tr></thead>';var tbd=h('tbody');
  walk(ROOT,function(n){if(n===ROOT||!q||n.name.toLowerCase().indexOf(q)<0)return;var tr=h('tr',null,'<td>'+ic(n.icon,16)+'<span>'+esc(n.name)+'</span></td><td>'+esc(pathOf(n.parent))+'</td><td>'+typeOf(n)+'</td>');tr.ondblclick=function(){openNode(n)};tr.onclick=function(){$$('tr',tbd).forEach(function(x){x.classList.remove('sel')});tr.classList.add('sel');if(coarse())openNode(n)};tbd.appendChild(tr)});
  tb.appendChild(tbd);res.innerHTML='';res.appendChild(tb)}
 $('#fgo',body).onclick=go;$('#ff',body).addEventListener('keydown',function(e){if(e.key==='Enter')go()});go()}
function msgBox(title,text,icon){var body=h('div','dbody');body.innerHTML='<div style="display:flex;gap:14px;align-items:center">'+ic(icon||'help',32)+'<div>'+esc(text)+'</div></div>';var w=dialog({key:'msg'+Math.random(),title:title,w:320,body:body});var b=h('div','btns');var ok=h('button','btn def',t('ok'));ok.onclick=function(){closeWin(w)};b.appendChild(ok);b.style.justifyContent='center';body.appendChild(b)}

/* ---------- Panneau de configuration ---------- */
var APPLETS=function(){return[sys(t('display'),'computer',displayDlg),sys(t('language'),'url',langDlg),sys(t('psy'),'m:'+(S.psyId||'c7h5n3o6'),psyDlg),sys(t('datetime'),'koin',dateDlg)]};
function control(){var d=dir(t('control'),APPLETS(),'control');d.parent=null;return explorer(d)}
var WALLS=[['D(r)IVE INN','run'],['attente-01','a/att-01.webp'],['attente-23','a/att-23.webp'],['attente-09','a/att-09.webp'],['poster','a/poster-800.webp'],['attente-19','a/att-19.webp'],['attente-09 (motif)','a/cde-tile.webp'],[S.lang==='fr'?'(Aucun)':'(None)','']];
var SCHEMES=[['std','KorhogOS Standard'],['plat','Platine'],['fram','Framboise'],['motif','Motif']];
function displayDlg(){var body=h('div','dbody');body.style.cssText='flex:1;min-height:0';var w;var pick={wall:S.wall>=0?S.wall:WDEF[S.theme][0],mode:S.wallMode||WDEF[S.theme][1],theme:S.theme};
 function bg(){var d=h('div');var mon=h('div','monitor','<div class="sc"></div>');d.appendChild(mon);var sc=$('.sc',mon);function pv(){var u=WALLS[pick.wall][1];sc.style.backgroundImage=(u&&u!=='run')?'url('+u+')':'none';sc.style.backgroundSize=pick.mode==='cover'?'cover':pick.mode==='tile'?'24px':'40%';sc.style.backgroundRepeat=pick.mode==='tile'?'repeat':'no-repeat'}
  var row=h('div');row.style.cssText='display:grid;grid-template-columns:1fr 110px;gap:10px;margin-top:20px';var lst=h('div','lst in');WALLS.forEach(function(x,i){var it=h('div',i===pick.wall?'on':'',esc(x[0]));it.onclick=function(){pick.wall=i;$$('div',lst).forEach(function(y){y.classList.remove('on')});it.classList.add('on');pv()};lst.appendChild(it)});
  var md=h('div');[['center',t('center')],['tile',t('tile')],['cover',t('stretch')]].forEach(function(m){var l=h('label',null,'<input type="radio" name="wm" '+(pick.mode===m[0]?'checked':'')+'> '+m[1]);l.style.display='block';$('input',l).onchange=function(){pick.mode=m[0];pv()};md.appendChild(l)});
  row.appendChild(h('div',null,'<div style="margin-bottom:4px">'+t('wallpaper')+'</div>'));row.firstChild.appendChild(lst);row.appendChild(h('div',null,'<div style="margin-bottom:4px">'+t('mode')+'</div>'));row.lastChild.appendChild(md);d.appendChild(row);pv();return d}
 function ap(){var d=h('div');var mon=h('div','monitor','<div class="sc" style="background:#008080;display:grid;place-items:center"><div id="mini" style="width:110px;height:64px"></div></div>');d.appendChild(mon);
  function pv(){var m=$('#mini',d),th=pick.theme;var tb={std:'background:linear-gradient(90deg,#000080,#1084d0);color:#fff;height:10px',plat:'background:repeating-linear-gradient(#bbb 0 1px,#fff 1px 2px);height:10px;border-bottom:1px solid #000',fram:'background:#ededed;height:12px;border-bottom:1px solid #c4c4c4',motif:'background:#7a90b8;height:10px;border:1px solid #e4e6ee'}[th];var fc={std:'#c0c0c0',plat:'#ddd',fram:'#fff',motif:'#aeb2c3'}[th];m.innerHTML='<div style="background:'+fc+';border:1px solid #000;height:100%;padding:1px"><div style="'+tb+'"></div></div>';$('.sc',d).style.background={std:'#008080',plat:'#666699',fram:'#2f3237',motif:'#596a8a'}[th]}
  var r=h('div',null,'<div style="margin:22px 0 4px">'+t('scheme')+'</div>');var sel=h('select','field in');SCHEMES.forEach(function(s){var o=h('option',null,s[1]);o.value=s[0];if(s[0]===pick.theme)o.selected=true;sel.appendChild(o)});sel.onchange=function(){pick.theme=sel.value;pv()};r.appendChild(sel);d.appendChild(r);setTimeout(pv);return d}
 body.appendChild(tabs([t('background'),t('appearance')],[bg,ap]));
 w=dialog({key:'disp',title:(S.lang==='fr'?'Propriétés de ':'')+t('display')+(S.lang==='fr'?'':' Properties'),icon:'computer',w:400,h:440,body:body});
 var b=h('div','btns'),ok=h('button','btn def',t('ok')),c=h('button','btn',t('cancel')),a=h('button','btn',t('apply'));b.appendChild(ok);b.appendChild(c);b.appendChild(a);body.appendChild(b);
 function apply(){S.wall=pick.wall;S.wallMode=pick.mode;save();applyWall();if(pick.theme!==S.theme)setTheme(pick.theme)}
 ok.onclick=function(){closeWin(w);apply()};c.onclick=function(){closeWin(w)};a.onclick=apply}
function langDlg(){var body=h('div','dbody');body.innerHTML='<div style="display:flex;gap:12px;align-items:center">'+ic('url',32)+'<div>'+t('language')+'</div></div><label><input type="radio" name="lg" value="en" '+(S.lang==='en'?'checked':'')+'> English</label><label><input type="radio" name="lg" value="fr" '+(S.lang==='fr'?'checked':'')+'> Français</label>';
 var w=dialog({key:'lang',title:t('language'),w:300,body:body});body.appendChild(btnRow(w,function(){var v=$('input:checked',body).value;if(v!==S.lang)toggleLang()}))}
function psyDlg(){var body=h('div','dbody');var ids=['c7h5n3o6','honey_buzzard','croisiere_noire','tsui_pen'];
 body.innerHTML='<label><input type="checkbox" id="ps" '+(S.psy?'checked':'')+'> '+t('showpsy')+'</label><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">'+['',].concat(ids).map(function(id){var f=D.F.filter(function(x){return x.slug===id})[0];return '<label style="display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center"><span class="in" style="width:40px;height:40px;display:grid;place-items:center;background:#fff">'+(id?ic('m:'+id,32):'?')+'</span><span><input type="radio" name="pid" value="'+id+'" '+((S.psyId||'')===id?'checked':'')+'> '+(f?esc(f.name):t('random'))+'</span></label>'}).join('')+'</div>';
 var w=dialog({key:'psy',title:t('psy'),w:430,body:body});body.appendChild(btnRow(w,function(){S.psy=$('#ps',body).checked;S.psyId=$('input[name=pid]:checked',body).value;S.psyPick=S.psyId;PSYID='';save();initPsy()}))}
function dateDlg(){var body=h('div','dbody'),now=new Date(),r=rep(now);var cal='<div class="cal">'+'';/* A46 : zéro nom de jour de décade */
 var len=r.m===13?(sext(r.y)?6:5):30;for(var i=1;i<=30;i++)cal+='<div class="'+(i===r.d?'on':'')+'"'+(i>len?' style="color:#aaa"':'')+'>'+(i<=len?i:'')+'</div>';cal+='</div>';
 body.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><b>'+MO[r.m-1].toLowerCase()+' '+r.y+'</b></div>'+cal+'<div class="hr"></div>'+'<div class="prow"><div>'+t('today')+' :</div><div>'+repLong(now)+'</div><div>'+t('greg')+' :</div><div>'+now.toLocaleDateString(S.lang==='fr'?'fr-FR':'en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</div></div>';
 var w=dialog({key:'date',title:(S.lang==='fr'?'Propriétés de ':'')+t('datetime')+(S.lang==='fr'?'':' Properties'),icon:'koin',w:420,body:body});body.appendChild(btnRow(w))}

/* ---------- Aide, À propos, Arrêter ---------- */
function help(){return notepad(t('help')+' KorhogOS',D.README)}
function about(){var body=h('div','dbody');body.innerHTML='<div style="display:flex;gap:16px">'+ic('koin',32)+'<div><b>KorhogOS</b><br>Insert Koin · '+rep().y+'<br>© Korhogo™, Korhogo Fauna™ & Mauk Tenieb<br><br>'+t('reg')+'<br>Mauk Tenieb<br>Korhogo<div class="hr"></div>https://mauktenieb.github.io/insertkoin/</div></div>';
 var w=dialog({key:'about',title:t('about'),w:400,body:body});var b=h('div','btns');var ok=h('button','btn def',t('ok'));ok.onclick=function(){closeWin(w)};b.appendChild(ok);body.appendChild(b)}
function shutdownDlg(){var body=h('div','dbody');body.innerHTML='<div style="display:flex;gap:14px">'+ic('shutdown',32)+'<div><div style="margin-bottom:8px">'+t('shutq')+'</div><label style="display:block;margin:3px 0"><input type="radio" name="sd" value="0" checked> '+t('shut1')+'</label><label style="display:block;margin:3px 0"><input type="radio" name="sd" value="1"> '+t('shut2')+'</label><label style="display:block;margin:3px 0"><input type="radio" name="sd" value="2"> '+t('shut3')+'</label></div></div>';
 var w=dialog({key:'shut',title:t('shuttitle'),w:390,body:body});var b=h('div','btns'),y=h('button','btn def',t('yes')),n=h('button','btn',t('no'));b.appendChild(y);b.appendChild(n);body.appendChild(b);
 y.onclick=function(){var v=$('input:checked',body).value;closeWin(w);if(v==='0')shutdownNow();else if(v==='1')boot(true);else bakuBoom()};n.onclick=function(){closeWin(w)}}
function shutdownNow(){WINS.slice().forEach(closeWin);var s=$('#safe');s.textContent=t('safe');s.classList.add('on');s.onclick=function(){s.classList.remove('on');boot(true)}}
function bakuBoom(){var d=$('#desk');d.animate([{transform:'translate(-6px,2px)'},{transform:'translate(5px,-3px)'},{transform:'translate(-3px,1px)'},{transform:'none'}],{duration:320});WINS.slice().forEach(closeWin)}

/* ---------- bureau ---------- */
function lieux(){var fr=S.lang==='fr';return[[{name:'Insert Koin',kind:'lieu',url:'../?hall=1',icon:'borne'},'borne',1,1],[{name:'TV',kind:'lieu',url:'tv.html',icon:'tele'},'tele',1,1],[{name:'Video Kave',kind:'lieu',url:'videoclub.html',icon:'vhs'},'vhs',1,1]]}
function deskItems(){var drive=Object.assign({},ROOT);drive.real=ROOT;
 return lieux().concat([[ROOT,'drive'],[findNode('KorhoGame')],[findNode('FaunEye')],[findNode('SurFauna')],[prog(D.P.filter(function(p){return p.id==='3615'})[0]),null,1],[prog(D.P.filter(function(p){return p.id==='skopo'})[0]),null,1],[prog(D.P.filter(function(p){return p.id==='musik'})[0]),null,1],[FAUNA],[findNode('Lore'),null],[url('GitHub','https://github.com/MaukTenieb','plaque'),null,1],[findNode('Mauk Tenieb'),'plaque']])}
function renderDesk(){var host=$('#icons');host.innerHTML='';
 var items=deskItems(),dh=$('#desk').clientHeight,dw=$('#desk').clientWidth,phone=dw<=640,Z=phone?1:Math.max(1,Math.min(1.5,Math.min(innerWidth,innerHeight)/700)),cellH=(S.theme==='plat'?68:74)*Z,perCol=Math.max(1,Math.floor((dh-8)/cellH));document.documentElement.style.setProperty('--zi',Z);document.documentElement.style.setProperty('--zd',innerWidth<700?1:Math.max(1.25,Math.min(1.7,innerWidth/1100,innerHeight*1.35/720)));
 items.forEach(function(a,i){var n=a[0];if(!n)return;var icon=a[1]||n.icon,lnk=a[2]||n.kind==='url';var big=!!a[3];var el=h('div','di'+(big?' big':''),'<div class="ig'+(lnk&&!big?' lnk':'')+'">'+ic(icon,big?48:32)+'</div><div class="lb">'+esc(n.name)+'</div>');el.style.setProperty('--m',icURI(icon));
  var key=S.theme+':'+n.name,p=S.pos[key],col,row;
  if(phone&&!(p&&p[0]<=dw-80&&p[1]<=dh-70)){col=i%4;row=Math.floor(i/4);el.style.left=(col*(dw/4)+(dw/4-75)/2)+'px';el.style.top=(8+row*84)+'px'}
  else if(p){el.style.left=Math.max(0,Math.min(dw-96,p[0]))+'px';el.style.top=Math.max(0,Math.min(dh-70,p[1]))+'px'}
  else{col=Math.floor(i/perCol);row=i%perCol;var x=S.theme==='plat'?dw-(96+col*96)*Z:4+col*80*Z;if(S.theme==='plat'&&n===BAKU){el.style.left=(dw-84)+'px';el.style.top=(dh-74)+'px'}else{el.style.left=x+'px';el.style.top=(6+row*cellH)+'px'}}
  if(Z!==1){el.style.transformOrigin='0 0';el.style.transform='scale('+Z+')'}host.appendChild(el);el._n=n;deskBind(el,n,key)})}
function deskBind(el,n,key){var sx,sy,ox,oy,moved=false,down=false;
 el.addEventListener('pointerdown',function(e){if(e.button)return;e.stopPropagation();$$('.di.sel').forEach(function(x){x.classList.remove('sel')});el.classList.add('sel');SEL=n;down=true;moved=false;sx=e.clientX;sy=e.clientY;ox=el.offsetLeft;oy=el.offsetTop;el.setPointerCapture(e.pointerId)});
 el.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx,dy=e.clientY-sy;if(!moved&&Math.abs(dx)+Math.abs(dy)<6)return;moved=true;el.style.left=ox+dx+'px';el.style.top=oy+dy+'px'});
 el.addEventListener('pointerup',function(){if(!down)return;down=false;if(moved){var dk=$('#desk'),gx=Math.max(0,Math.min(dk.clientWidth-el.offsetWidth,Math.round(el.offsetLeft/4)*4)),gy=Math.max(0,Math.min(dk.clientHeight-el.offsetHeight,Math.round(el.offsetTop/4)*4));el.style.left=gx+'px';el.style.top=gy+'px';S.pos[key]=[gx,gy];save()}else{if(coarse())openNode(n);else say(n,el)}});
 el.addEventListener('dblclick',function(){openNode(n)});
 el.addEventListener('contextmenu',function(e){e.preventDefault();e.stopPropagation();ctxMenu(n,e)})}
$('#desk')&&0;
function deskEvents(){var d=$('#desk');/* 11 nov. 2026 (Mauk Tenieb) : D(r)IVE INN se pilote au clic sur le bureau nu, clic bref à gauche ou à droite = un quart de tour, appui tenu = virage */
 d.addEventListener('pointerdown',function(e){if(e.button||!RUN||!RUN.down)return;if(!(e.target===d||e.target.id==='icons'||e.target.id==='wall'||e.target.closest('#runbox')))return;var c=$('#runbox canvas');if(!c)return;var r=c.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;RUN.down(e);
  function mv(x){RUN&&RUN.move&&RUN.move(x)}function up(){RUN&&RUN.up&&RUN.up();removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)}addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)});
 d.addEventListener('pointerdown',function(e){if(e.target===d||e.target.id==='icons'||e.target.id==='wall'||e.target.closest('#runbox')){$$('.di.sel').forEach(function(x){x.classList.remove('sel')});SEL=null}});
 d.addEventListener('contextmenu',function(e){if(e.target.closest('.win,.di'))return;e.preventDefault();popMenu([[t('arrange'),function(){S.pos={};save();renderDesk()}],[t('refresh'),renderDesk],'-',[t('props'),displayDlg]],{getBoundingClientRect:function(){return{left:e.clientX,top:e.clientY,right:e.clientX,bottom:e.clientY}}},'at')})}
var WDEF={std:[0,'center'],plat:[7,'cover'],fram:[2,'cover'],motif:[6,'tile']};
var RUN=null;
function applyWall(){var df=WDEF[S.theme],wi=S.wall>=0?S.wall:df[0],wm=S.wallMode||df[1];var w=$('#wall'),u=WALLS[wi]?WALLS[wi][1]:'';
 if(RUN){RUN.stop();RUN=null;var ob=$('#runbox');if(ob)ob.remove()}
 if(u==='run'){var bx=h('div');bx.id='runbox';w.appendChild(bx);RUN=window.MotelRun?MotelRun(bx):null;u=''}w.style.backgroundImage=u?'url('+u+')':'none';w.className=wm==='tile'?'tile':wm==='center'?'center':'';w.style.imageRendering=wi===0?'pixelated':'auto';w.style.backgroundSize=wm==='tile'?'256px':''}

/* ---------- psychopompe ---------- */
var psy,bal,idle=0,tour=[],ti=0,balT;
/* 10 nov. (Mauk Tenieb, 17 h 33) : le psychopompe dit les mêmes choses qu'à la borne ; une seule source, la liste SAY d'index.html ; sans réplique à la borne, le nom seul */
var SAYS={'K:':'K-Files|K-Files'},SAYMAP={korong:'puck',chess:'chess',erratik:'erratic',faunarratik:'faunarratics',katabatik:'katabatik','3615':'terminal',vhs:'vhs',fotofauna:'photo',faunator:'tor',skopo:'skopo',reporhogo:'repo',Lore:'lore',Bio:'bio','Mauk Tenieb':'bio',Burrows:'visit',Threadless:'tl',Instagram:'ig'};
fetch('../index.html').then(function(r){return r.text()}).then(function(t){var m=/const SAY=(\{"en"[\s\S]*?\}\});/.exec(t);if(!m)return;var d=JSON.parse(m[1]);Object.keys(SAYMAP).forEach(function(k){var b=SAYMAP[k],en=(d.en||{})[b]||'',fr=(d.fr||{})[b]||'';if(en||fr)SAYS[k]=en+'|'+fr})}).catch(function(){});
/* 11 nov. 2026 (Mauk Tenieb, 17 h 25) : bulles sans titre ; lieux du motel : « Another Kave » ; gros dossiers sans bulle propre : une phrase tirée au hasard */
var DIRSAY={en:function(){var a=['Purpose','Point','Gist','Clue'],b=['title','label'];return a[Math.floor(Math.random()*a.length)]+'\'s in the '+b[Math.floor(Math.random()*b.length)]+', uh?'},fr:["C'est comme le Port-Salut...",'Hey, tu sais lire\u202f?','Tu devines pas\u202f?']};
/* 12 nov. 2026 (Mauk Tenieb, 18 h 50) : en anglais, chaque icône a sa liste ; un message tiré au hasard à chaque passage, chances égales */
var PSY_EN={"Video Kave": ["Cop Porn!", "Interzone of DVDs", "Kount the gates! (And die tryin’.)", "Lasciate ogne speranza, voi ch’intrate."], "SkopoRhogo": ["Watch out!", "Live love?"], "The Fauna": ["Yeah.", "18 shades of klay"], "SurFauna": ["SurfAce", "SurfAss", "Surf us"], "GitHub": ["Bad seeds...", "Homeland?", "Repo-shit"], "FaunEye": ["Soul window", "Whoever has ears..."], "Insert Koin": ["Koin-op!", "Arkadin’ arkana", "Orchid kabinet", "Slutty slots?", "“Find out why you’re playing the game.”"], "K:": ["Be technoFile!", "This disk’s harder than yours", "No diskount here..."], "Mauk Tenieb": ["Meet your uncle", "Meet Mau-krap"], "Lore": ["Lore thy neighbah", "Peace and Lore", "Everyone I lore is dead"], "TV": ["“Retina of the mind’s eye.”", "Kathodick...", "Teleskreen?"]};
function lineFor(n){var L=S.lang!=='fr'&&PSY_EN[n.name];if(L)return L[Math.floor(Math.random()*L.length)];if(n.kind==='lieu')return 'Another Kave';var l=lineFor0(n);if(l||n.kind!=='dir')return l;return S.lang==='fr'?DIRSAY.fr[Math.floor(Math.random()*DIRSAY.fr.length)]:DIRSAY.en()}
function lineFor0(n){var k=n.prog?n.prog.id:n.name,s=SAYS[k];/* 10 nov. (Mauk Tenieb, 21 h 02) : les mêmes bulles que la borne */if(!s){var B=(window.KDATA&&window.KDATA.SAY)||{},d=B[k]||B[SAYMAP[k]];if(!d)return '';return S.lang==='fr'?(d[1]||d[0]):(d[0]||d[1])}var a=s.split('|');return S.lang==='fr'?(a[1]||a[0]):(a[0]||a[1])}
var PSYID='';function initPsy(){var ids=['c7h5n3o6','honey_buzzard','croisiere_noire','tsui_pen'];/* 10 nov. (Mauk Tenieb, 21 h 22) : psychopompe tiré au hasard à chaque ouverture de l'OS et à chaque Baku Boom, jamais deux fois de suite le même ; un choix fait dans le panneau tient jusqu'à la prochaine ouverture */var ch=S.psyPick||'',last='';try{last=sessionStorage.getItem('ik.psylast')||''}catch(e){}var bl='';try{bl=localStorage.getItem('ik.psyborne')||''}catch(e){}var pool=ids.filter(function(x){return x!==last&&x!==bl});var id=ch||PSYID||(PSYID=pool[Math.floor(Math.random()*pool.length)]);try{sessionStorage.setItem('ik.psylast',id)}catch(e){}/* 10 nov. (Mauk Tenieb, 19 h 39) : psychopompe tiré au hasard à chaque visite ; un choix fait dans le panneau tient le temps de la session */
 psy=$('#psy');bal=$('#bal');$('.spr',psy).style.backgroundImage='url(a/strip-'+id+'.webp)';psy.style.display=S.psy?'':'none';if(!S.psy)bal.classList.remove('on');
 if(!psy.style.left){psy.style.left=(S.theme==='plat'?(innerWidth/2-48):(innerWidth-120))+'px';var fp=$('#fp');psy.style.top=Math.max(60,(fp&&fp.offsetHeight?fp.getBoundingClientRect().top:innerHeight)-psy.offsetHeight-12)+'px'}}
function balloon(o,el){if(!bal)return;bal.innerHTML=(o.name?'<b>'+esc(o.name)+'</b>':'')+esc(o.line||'');bal.classList.add('on');var r=(el||psy).getBoundingClientRect(),p=psy.getBoundingClientRect(),bw=bal.offsetWidth,bh=bal.offsetHeight;
 var x=Math.max(4,Math.min(innerWidth-bw-4,p.left+p.width/2-bw/2)),y=p.top-bh-10,below=false;if(y<4){y=p.bottom+10;below=true}bal.classList.toggle('below',below);bal.style.left=x+'px';bal.style.top=y+'px';bal.style.setProperty('--ax',Math.max(10,Math.min(bw-20,p.left+p.width/2-x-5))+'px');clearTimeout(balT);balT=setTimeout(function(){bal.classList.remove('on')},4500)}
/* 8 nov. (Mauk Tenieb, 17 h 59) : le psychopompe va vraiment s'asseoir sur chaque icône : un bond, la base posée sur le haut de l'image, une réception */
function goTo(el,cb){var im=el.querySelector('.ig>*')||el.querySelector('.ig')||el,r=im.getBoundingClientRect(),pw=psy.offsetWidth,ph=psy.offsetHeight;var x=r.left+r.width/2-pw/2+(Math.random()-.5)*r.width*.3,y=r.top-ph+2;if(y<0)y=0;psy.classList.remove('land','hop');void psy.offsetWidth;psy.classList.add('hop');psy.style.left=Math.max(4,Math.min(innerWidth-pw-4,x))+'px';psy.style.top=Math.max(0,Math.min(innerHeight-ph-4,y))+'px';setTimeout(function(){psy.classList.remove('hop');void psy.offsetWidth;psy.classList.add('land');setTimeout(function(){psy.classList.remove('land')},460);cb()},psy.classList.contains('fou')?700:900)}
function say(n,el){if(!S.psy||!psy)return;idle=0;var line=lineFor(n);if(!line)return;if(window.__petHold)window.__petHold();goTo(el,function(){balloon({line:line},el);if(window.__petFree)setTimeout(window.__petFree,2600)})}
function buildTour(){tour=$$('#icons .di').sort(function(){return Math.random()-.5});ti=0}
window.__ikBoom=function(){/* 10 nov. (Mauk Tenieb, 21 h 05) : dans l'OS, Baku Boom réinitialise, l'OS se relance */WINS.slice().forEach(closeWin);location.reload()};
setInterval(function(){if(window.__petOn&&window.__petOn())return;if(!S.psy||!psy||document.hidden||!$('#boot').classList.contains('out'))return;if(++idle<3)return;if(WINS.some(function(w){return !w.el.classList.contains('min')&&w.el.style.display!=='none'}))return;if(ti>=tour.length)buildTour();var e=tour[ti++];if(!e||!e.offsetWidth)return;var line=lineFor(e._n)||'';goTo(e,line?function(){balloon({line:line},e)}:function(){});idle=line?1:2},2700);
['pointerdown','keydown','wheel'].forEach(function(ev){addEventListener(ev,function(){idle=0},{passive:true})});

/* ---------- 13 nov. 2026 (Mauk Tenieb, 1 h 55 et 1 h 57) : le psychopompe de l'OS, bête de bureau un peu foufou.
   Au démarrage, une visite fofolle : il saute vite d'icône en icône. Ensuite il vit sur le bureau : il marche sur la barre des tâches,
   grimpe aux bords de l'écran, s'assoit sur la barre de titre des fenêtres, tombe quand la fenêtre se ferme, suit la fenêtre qu'on déplace,
   dort quand rien ne bouge ; à l'ouverture d'un programme il monte sur sa fenêtre et dit sa réplique (« 1a », 1 h 57 : sans malice). */
var PET={on:false,x:0,y:0,vx:0,vy:0,dir:1,st:'fall',plat:null,off:0,t:0,sit:0,lt:0,calm:0,next:0,climbTo:0};
function petSync(){PET.x=psy.offsetLeft;PET.y=psy.offsetTop}
function petStart(){if(!psy||!S.psy)return;petSync();psy.classList.add('pet');PET.on=true;PET.st='fall';PET.vx=0;PET.vy=0;PET.next=performance.now()+30000+Math.random()*30000}
window.__petOn=function(){return PET.on};
window.__petHold=function(){PET.on=false;if(psy){psy.classList.remove('pet');psy.style.rotate='';psy.style.scale=''}};
window.__petFree=function(){if(!PET.on)petStart()};
window.__petThrow=function(vx,vy){if(!PET.on)return false;petSync();PET.vx=vx*55;PET.vy=vy*55;PET.st='fall';PET.plat=null;return true};
function petFloor(){var fl=innerHeight,tb=$('#taskbar');if(tb&&tb.offsetHeight){var r=tb.getBoundingClientRect();if(r.top>innerHeight/2)fl=r.top}return fl}
function petPlats(){var a=[{top:petFloor(),l:-1e4,r:1e4,el:null}];WINS.forEach(function(w){var e=w.el;if(!e.isConnected||e.classList.contains('min')||e.style.display==='none'||w.ws!==S.ws)return;var r=e.getBoundingClientRect();if(r.width>60&&r.top>20)a.push({top:r.top,l:r.left,r:r.right,el:e})});return a}
window.__petTour=function(){if(!S.psy||!psy)return;window.__petHold();var ic=$$('#icons .di').filter(function(e){return e.offsetWidth}).sort(function(){return Math.random()-.5}).slice(0,8),i=0;psy.classList.add('fou');
 (function nx(){if(i>=ic.length){psy.classList.remove('fou');setTimeout(petStart,300);return}var e=ic[i++],line=i%2?lineFor(e._n||{}):'';goTo(e,function(){if(line)balloon({line:line},e);setTimeout(nx,line?1100:350)})})()};
window.__petWin=function(w){if(!S.psy||!psy||!$('#boot').classList.contains('out'))return;var n=window.__petN,tb=w.el.querySelector('.tb')||w.el;window.__petHold();goTo(tb,function(){var line=n?lineFor(n):'';if(line)balloon({line:line},tb);petStart();PET.st='sit';PET.plat=w.el;PET.off=psy.offsetLeft-w.el.getBoundingClientRect().left;PET.sit=performance.now()+3500})};
['pointerdown','keydown','wheel','pointermove'].forEach(function(ev){addEventListener(ev,function(){PET.calm=0;if(PET.st==='sleep'){PET.st='walk';if(bal)bal.classList.remove('on')}},{passive:true})});
function petTick(ts){requestAnimationFrame(petTick);var dt=Math.min(.05,(ts-(PET.lt||ts))/1000);PET.lt=ts;if(!PET.on||!S.psy||!psy||document.hidden||psy.classList.contains('drag'))return;
 var pw=psy.offsetWidth,ph=psy.offsetHeight,W=innerWidth,now=performance.now();PET.t+=dt;PET.calm+=dt;
 if(PET.st==='fall'){var y0=PET.y+ph;PET.vy+=1900*dt;PET.x+=PET.vx*dt;PET.y+=PET.vy*dt;PET.vx*=.995;
  if(PET.x<0){PET.x=0;PET.vx=-PET.vx*.5}if(PET.x>W-pw){PET.x=W-pw;PET.vx=-PET.vx*.5}if(PET.y<0){PET.y=0;PET.vy=Math.abs(PET.vy)*.3}
  if(PET.vy>0){var cx=PET.x+pw/2,best=null;petPlats().forEach(function(p){if(cx>=p.l&&cx<=p.r&&p.top>=y0-2&&p.top<=PET.y+ph&&(!best||p.top<best.top))best=p});
   if(best){PET.y=best.top-ph;PET.plat=best.el;PET.off=best.el?PET.x-best.el.getBoundingClientRect().left:0;PET.vx=0;PET.vy=0;PET.st=Math.random()<.4?'sit':'walk';PET.sit=now+1500+Math.random()*2500;psy.classList.remove('land');void psy.offsetWidth;psy.classList.add('land');setTimeout(function(){psy.classList.remove('land')},460)}}
  psy.style.rotate=(PET.vx*.02)+'deg'}
 else if(PET.st==='climb'){PET.y-=70*dt;psy.style.rotate=(PET.x<=1?90:-90)+'deg';if(PET.y<=PET.climbTo){PET.st='fall';PET.vx=(PET.x<=1?1:-1)*260;PET.vy=-260;psy.style.rotate=''}}
 else{var p=PET.plat,L=0,R=W-pw,top=petFloor();
  if(p){if(!p.isConnected||p.classList.contains('min')||p.style.display==='none'){PET.st='fall';PET.plat=null;PET.vy=0;return}var r=p.getBoundingClientRect();top=r.top;L=Math.max(0,r.left);R=Math.min(W-pw,r.right-pw);PET.x=r.left+PET.off}
  PET.y=top-ph;
  if(PET.st==='sit'||PET.st==='sleep'){psy.style.rotate='';if(PET.st==='sit'&&now>PET.sit)PET.st='walk';if(PET.calm>28&&PET.st!=='sleep'&&!p){PET.st='sleep';if(bal){balloon({line:'Zzz'})}}}
  if(PET.st==='walk'){var sp=58;PET.x+=PET.dir*sp*dt;psy.style.rotate=(Math.sin(PET.t*11)*5)+'deg';psy.style.scale=PET.dir<0?'-1 1':'';
   if(PET.x<=L){PET.x=L;if(!p&&L<=0&&Math.random()<.35){PET.st='climb';PET.climbTo=80+Math.random()*(top-ph-200)}else PET.dir=1}
   if(PET.x>=R){PET.x=R;if(!p&&R>=W-pw-1&&Math.random()<.35){PET.st='climb';PET.climbTo=80+Math.random()*(top-ph-200)}else PET.dir=-1}
   if(Math.random()<dt*.18){PET.st='sit';PET.sit=now+1800+Math.random()*3500}
   else if(Math.random()<dt*.12){PET.st='fall';PET.vy=-720-Math.random()*300;PET.vx=PET.dir*(160+Math.random()*160);PET.plat=null}
   else if(Math.random()<dt*.05)PET.dir=-PET.dir;
   }
  if(p)PET.off=PET.x-p.getBoundingClientRect().left}
 psy.style.left=Math.round(PET.x)+'px';psy.style.top=Math.round(PET.y)+'px'}
requestAnimationFrame(petTick);
function psyDrag(){psy=$("#psy");psy.addEventListener('pointerdown',function(e){e.stopPropagation();var r=psy.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top,lx=e.clientX,ly=e.clientY,vx=0,vy=0;psy.classList.add('drag');psy.setPointerCapture(e.pointerId);
 function mv(ev){vx=ev.clientX-lx;vy=ev.clientY-ly;lx=ev.clientX;ly=ev.clientY;psy.style.left=ev.clientX-ox+'px';psy.style.top=ev.clientY-oy+'px'}
 function up(){psy.removeEventListener('pointermove',mv);psy.removeEventListener('pointerup',up);psy.classList.remove('drag');if(window.__petThrow&&window.__petThrow(vx,vy))return;var pw=psy.offsetWidth,ph=psy.offsetHeight;psy.style.left=Math.max(4,Math.min(innerWidth-pw-4,psy.offsetLeft+vx*14))+'px';psy.style.top=Math.max(4,Math.min(innerHeight-ph-4,psy.offsetTop+vy*14))+'px';idle=-2}
 psy.addEventListener('pointermove',mv);psy.addEventListener('pointerup',up)})}

/* ---------- démarrage ---------- */
function boot(again){var b=$('#boot');b.className='';b.innerHTML='';WINS.slice().forEach(closeWin);var th=S.theme,done=false;
 function end(){if(done)return;done=true;b.className='out';b.innerHTML='';buildTour();if(window.__petTour)setTimeout(window.__petTour,700)}
 b.onclick=end;document.addEventListener('keydown',function k(){document.removeEventListener('keydown',k);end()});
 if(th==='std'){b.innerHTML='<pre>'+t('starting')+'</pre>';setTimeout(function(){if(done)return;b.innerHTML='<div class="splash95" style="background-image:url(../attente-04.webp)"><div class="wm"><b>Korhog</b><i>OS</i><small>Insert Koin · Korhogo Fauna</small></div><div class="pb"></div></div>'},700);setTimeout(end,2600)}
 else if(th==='plat'){b.innerHTML='<div class="macbox"><div style="margin-bottom:8px">'+ic('koin',32).replace('<svg','<svg style="margin:0 auto 8px"')+'</div>'+t('welcome')+'<div class="bar"><i></i></div></div><div class="macext"></div>';var ex=$('.macext',b),list=['koin','minitel','vhs','camera','book','musik','mic','onion','repo','skopo','jukebox','webcam'];
  setTimeout(function(){var i=$('.bar i',b);if(i)i.style.width='100%'},60);list.forEach(function(n,i){setTimeout(function(){if(!done)ex.insertAdjacentHTML('beforeend',KICON(n,32))},150+i*140)});setTimeout(end,2300)}
 else if(th==='fram'){var L=['[    0.000000] Booting KorhogOS','[  OK  ] Started Motel Sound.','[  OK  ] Started SkopoRhogo.','[  OK  ] Reached target KorhoGame.','[  OK  ] Started FaunEye.','[  OK  ] Started SurFauna.','[  OK  ] Started 3615.','[  OK  ] Reached target Graphical Interface.'],pre=h('pre');b.appendChild(pre);L.forEach(function(l,i){setTimeout(function(){if(!done)pre.textContent+=l+'\n'},i*170)});setTimeout(end,1900)}
 else{b.style.background='#596a8a';b.innerHTML='<div class="cdelogin"><b>'+t('welcome')+'</b><br>'+t('login')+'<br><input class="field" value="mauk" readonly></div>';setTimeout(end,1500)}}

/* ---------- apparence ---------- */
function setTheme(th){S.theme=th;S.wall=-1;S.wallMode='';save();document.body.className=th;WINS.slice().forEach(closeWin);build();boot(true)}
function toggleLang(){S.lang=S.lang==='en'?'fr':'en';document.documentElement.lang=S.lang;save();try{localStorage.setItem('ik.lang',S.lang)}catch(e){}WINS.slice().forEach(closeWin);build()}
function build(){document.body.className=S.theme;
 $('#tray').replaceWith(trayEl('std'));$('#startbtn span').textContent=t('start');
 if(S.theme==='plat')platMenus();if(S.theme==='fram')framPanel();if(S.theme==='motif'){motifPanel();setWS(S.ws||0)}
 applyWall();renderDesk();renderTasks();initPsy();tick();
 var v=$('#vol');v.innerHTML='<div>'+t('volume')+'</div><input type="range" min="0" max="100" value="70"><label><input type="checkbox"> '+t('mute')+'</label>';v.className='menu '+(v.classList.contains('open')?'open':'')}
/* clavier */
addEventListener('keydown',function(e){if(e.key==='Escape'){if(openMenus.length)closeMenus();else{var w=frontWin();if(w&&w.o.dlg)closeWin(w)}}
 if(e.key==='Enter'&&SEL&&!e.target.closest('input,pre,select,textarea'))openNode(SEL)});
addEventListener('resize',function(){clearTimeout(window.__rz);window.__rz=setTimeout(renderDesk,150)});
/* l'enseigne brouille le titre de l'onglet */
setInterval(function(){var r=Math.random(),n=r<.7?'KorhogOS':['Intersektion','Sektor Inn','Noir Insekt'][Math.floor(Math.random()*3)];document.title=n},5200);

/* montage */
document.documentElement.lang=S.lang;
$('#startbtn').innerHTML=KICON('koin',16)+'<span>'+t('start')+'</span>';
$('#startbtn').onclick=function(e){e.stopPropagation();if($('#startmenu')){closeMenus();return}startMenu()};
deskEvents();psyDrag();build();boot();
})();

