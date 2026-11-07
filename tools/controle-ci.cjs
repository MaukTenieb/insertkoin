// Contrôle automatique de la borne, lancé par .github/workflows/controle-borne.yml à chaque envoi sur main.
// Formats : 1280×800, 1180×820, 820×1180, 844×390, 390×844, 360×740. Échec si une erreur de page survient,
// si la page défile de côté, ou si une commande visible de l'accueil refuse le clic (elementFromPoint au centre).
const { chromium } = require('playwright');
(async () => {
const base = process.env.BORNE_URL || 'http://localhost:8800/insertkoin/';
const formats = [[1280,800,0],[1180,820,1],[820,1180,1],[844,390,1],[390,844,1],[360,740,1]];
const cmds = ['#brand','.b-land','.b-panel .cabinets>.cab','.b-boom','.b-imm','#koins','.b-lore','.b-knobs .b-knob','.b-dekonect'];
const b = await chromium.launch(); let fautes = 0; const lignes = [], lignesPts = [];
for (const [w,h,t] of formats) {
  const c = await b.newContext({ viewport:{width:w,height:h}, isMobile:!!t, hasTouch:!!t });
  const p = await c.newPage(); const err = []; p.on('pageerror', e => err.push(e.message));
  await p.goto(base, { waitUntil:'load', timeout:60000 }); await p.waitForTimeout(4000);
  await p.addStyleTag({ content:'.b-guide,.guide{visibility:hidden!important}' });
  const largeur = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const refus = []; let vus = 0;
  for (const s of cmds) {
    const n = await p.$$eval(s, l => l.length);
    for (let i = 0; i < n; i++) {
      const ok = await p.evaluate(([s,i]) => { const e = document.querySelectorAll(s)[i]; if (!e) return 'absent';
        const st = getComputedStyle(e); if (st.display === 'none' || st.visibility === 'hidden' || !e.offsetWidth) return 'cache';
        e.scrollIntoView({ block:'center', inline:'center' }); const r = e.getBoundingClientRect();
        const x = r.left + r.width/2, y = r.top + r.height/2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return 'hors';
        const t = document.elementFromPoint(x, y); return (t && (t === e || e.contains(t))) ? 'ok' : ('sous ' + (t ? (t.id || String(t.className).split(' ')[0] || t.tagName) : '?'));
      }, [s,i]);
      if (ok === 'ok' || ok.startsWith('sous')) vus++;
      if (ok.startsWith('sous')) refus.push(s + '#' + i + ' ' + ok);
    }
  }
  await p.evaluate(() => scrollTo(0,0)); await p.screenshot({ path:`controle-${w}x${h}.png`, fullPage:true });
  // points de navigation : chaque touche de la console ouvre son programme ; ses points visibles reçoivent le clic
  const nk = await p.$$eval('.b-panel .cabinets>.cab', l => l.length); const pts = [];
  for (let k = 0; k < nk; k++) {
    await p.evaluate(k => { const e = document.querySelectorAll('.b-panel .cabinets>.cab')[k]; e.scrollIntoView({block:'center'}); (e.querySelector('.hit,[data-go]') || e).click(); }, k);
    await p.waitForTimeout(2500);
    const d = await p.evaluate(() => { const l = [...document.querySelectorAll('.b-dot')].filter(e => e.offsetWidth && getComputedStyle(e).visibility !== 'hidden');
      let ok = 0; for (const e of l) { const r = e.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2; const t = (x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight) ? document.elementFromPoint(x, y) : null; if (t && (t === e || e.contains(t))) ok++; }
      return [l.length, ok]; });
    if (d[0]) pts.push(d[1] + '/' + d[0]); if (d[0] && d[1] < d[0]) refus.push('points ' + d[1] + '/' + d[0] + ' (touche ' + (k+1) + ')');
    await p.keyboard.press('Escape'); await p.waitForTimeout(1500);
  }
  lignesPts.push(`${w}x${h} : points cliquables ${pts.join(' ') || 'aucun programme à points'}`);
  const f = err.length + (largeur > 1 ? 1 : 0) + refus.length + (vus < 8 ? 1 : 0); fautes += f;
  lignes.push(`${w}x${h} : erreurs ${err.length}${err[0] ? ' (' + err[0].slice(0,120) + ')' : ''} ; défilement latéral ${largeur} px ; commandes testées ${vus}, couvertes ${refus.length}${refus.length ? ' (' + refus.join(', ') + ')' : ''}`);
  await c.close();
}
await b.close(); console.log(lignes.join('\n')); console.log(lignesPts.join('\n')); console.log(fautes ? `ÉCHEC : ${fautes} défaut(s)` : 'OK : borne conforme sur 6 formats');
process.exit(fautes ? 1 : 0);
})();
