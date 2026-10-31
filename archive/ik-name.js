/* Insert Koin: every saved file is named after the French Republican calendar, then the program, then a counter of the day:
   18-vendemiaire-235_photofauna_001.png
   Years III, VII, XI and XV were sextile (as kept in their day); from XX on, Romme's rule (every 4th year, but not the 100th unless the 400th, nor the 4000th).
   The date is the visitor's own local day. The counter lives in the browser (ik.saves), per program and per day. */
(function(){
  var MONTHS=['vendemiaire','brumaire','frimaire','nivose','pluviose','ventose','germinal','floreal','prairial','messidor','thermidor','fructidor','sansculottides'];
  function sextile(y){if(y<20)return y===3||y===7||y===11||y===15;return y%4===0&&(y%100!==0||y%400===0)&&y%4000!==0;}
  function rep(d){d=d||new Date();var n=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(1792,8,22))/864e5),y=1;
    if(n<0)return null;for(;;){var L=sextile(y)?366:365;if(n<L)break;n-=L;y++;}return{year:y,month:Math.floor(n/30)+1,day:n%30+1};}
  function repDate(d){var r=rep(d);return r?r.day+'-'+MONTHS[r.month-1]+'-'+r.year:'0';}
  function ikName(prog,ext,d){var date=repDate(d),k=date+'|'+prog,n=1,m={};
    try{m=JSON.parse(localStorage.getItem('ik.saves')||'{}')||{};Object.keys(m).forEach(function(x){if(x.split('|')[0]!==date)delete m[x];});n=(m[k]||0)+1;m[k]=n;localStorage.setItem('ik.saves',JSON.stringify(m));}catch(e){n=1+Math.floor(Math.random()*999);}
    return date+'_'+prog+'_'+String(n).padStart(3,'0')+(ext?'.'+String(ext).replace(/^\./,''):'');}
  window.ikRep=rep;window.ikRepDate=repDate;window.ikName=ikName;
})();
