// Contrôle automatique de la borne, lancé par .github/workflows/controle-borne.yml à chaque envoi sur main.
// Formats : 1280×800, 1180×820, 820×1180, 844×390, 390×844, 360×740. Échec si une erreur de page survient,
// si la page défile de côté, ou si une commande visible de l'accueil refuse le clic (elementFromPoint au centre).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let PNG = null, pixelmatch = null; try { PNG = require('pngjs').PNG; pixelmatch = require('pixelmatch'); } catch (e) {}
const MAJ = process.argv.includes('--maj-ref'), SEUL = process.argv.includes('--visuel-seul'), AVIS = !!process.env.VISUEL_AVIS, REF = process.env.BORNE_REF || path.join(__dirname, 'ref');
(async () => {
const base = process.env.BORNE_URL || 'http://localhost:8800/insertkoin/';
const formats = [[1280,800,0],[1180,820,1],[820,1180,1],[844,390,1],[390,844,1],[360,740,1]];
const cmds = ['#brand','.b-land','.b-panel .cabinets>.cab','.b-boom','.b-imm','#koins','.b-lore','.b-knobs .b-knob','.b-dekonect'];
const b = await chromium.launch(); let fautes = 0; const lignes = [], lignesPts = [], lignesRef = [];
  // régression visuelle : capture figée (hasard fixé, skin bois, caméra a, papier sang, mouvements coupés, écran et textes changeants masqués) comparée à tools/ref/WxH.png
async function visuel(w,h,t,refus) {
  if (PNG && pixelmatch) {
    const cf = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:.5, isMobile:!!t, hasTouch:!!t, reducedMotion:'reduce' });
    await cf.addInitScript(() => { let s = 7; Math.random = () => ((s = s * 16807 % 2147483647) / 2147483647); const D = Date; const T = new D('2026-11-07T20:00:00Z').getTime(); Date = class extends D { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; try { localStorage.clear(); } catch (e) {} });
    const pf = await cf.newPage(); await pf.goto(base + '?palette=ambre-noyer', { waitUntil:'load', timeout:60000 }); await pf.waitForTimeout(6000);
    await pf.addStyleTag({ content:'*,*::before,*::after{animation:none!important;transition:none!important}.guide,.gtip,.b-attract,.b-screen iframe,.b-tk,.b-date,.b-lore .b-word,.b-lustre,.b-psy{visibility:hidden!important}' });
    await pf.evaluate(async () => { try { window.__borneTourStop && window.__borneTourStop(); } catch (e) {} const R = document.documentElement; R.dataset.skin = 'bois'; R.style.setProperty('--i-cam', 'url(camera-a.webp)'); document.querySelectorAll('.b-lore').forEach(e => { e.style.setProperty('--i-lore', 'url(sticker-lore-papier-sang.webp)'); e.dataset.pap = 'sang'; }); await document.fonts.ready; scrollTo(0,0); dispatchEvent(new Event('resize')); }); await pf.waitForTimeout(1200); await pf.evaluate(() => scrollTo(0,0)); await pf.waitForTimeout(300); const img = await pf.screenshot({ fullPage:false }); await cf.close();
    const fr = path.join(REF, `${w}x${h}.png`);
    if (MAJ || !fs.existsSync(fr)) { fs.mkdirSync(REF, { recursive:true }); fs.writeFileSync(fr, img); lignesRef.push(`${w}x${h} : référence ${MAJ ? 'mise à jour' : 'créée'}`); }
    else { const A = PNG.sync.read(fs.readFileSync(fr)), B = PNG.sync.read(img);
      const hh = Math.min(A.height, B.height);
      if (A.width !== B.width || Math.abs(A.height - B.height) > 20) { refus.push(`capture ${B.width}x${B.height} contre référence ${A.width}x${A.height}`); lignesRef.push(`${w}x${h} : taille changée`); }
      else { const cut = I => I.data.subarray(0, I.width * hh * 4); const dif = new PNG({ width:A.width, height:hh }); const n = pixelmatch(cut(A), cut(B), dif.data, A.width, hh, { threshold:.12 }); const pc = 100 * n / (A.width * hh);
        lignesRef.push(`${w}x${h} : écart visuel ${pc.toFixed(2)} %`); if (pc > 1.5) { if (AVIS) console.log(`::warning::${w}x${h} écart visuel ${pc.toFixed(2)} % avec la version précédente (voir ecart-${w}x${h}.png)`); else refus.push(`écart visuel ${pc.toFixed(2)} %`); fs.writeFileSync(`ecart-${w}x${h}.png`, PNG.sync.write(dif)); fs.writeFileSync(`actuel-${w}x${h}.png`, img); } } }
  }
}
if (SEUL) { for (const [w,h,t] of formats) await visuel(w,h,t,[]); await b.close(); console.log(lignesRef.join('\n')); process.exit(0); }

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
  await visuel(w,h,t,refus);
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
  // menu de Fauna Chess (7 nov.) : titre sur l'axe du verre à 2 px près, entier dans le verre
  await p.evaluate(() => { const e = document.querySelector('[data-go="chess"]'); if (e) e.click(); }); await p.waitForTimeout(2500);
  const ch = await p.evaluate(() => { const g = document.querySelector('.b-glass'), h = document.querySelector('#chess-sel h2'); if (!g || !h || !h.offsetWidth) return null;
    const G = g.getBoundingClientRect(), H = h.getBoundingClientRect(); return [Math.round((H.left + H.width/2) - (G.left + G.width/2)), H.top >= G.top && H.bottom <= G.bottom]; });
  if (ch && (Math.abs(ch[0]) > 2 || !ch[1])) refus.push('menu Fauna Chess décalé de ' + ch[0] + ' px' + (ch[1] ? '' : ', hors du verre'));
  lignesPts.push(`${w}x${h} : menu Fauna Chess ${ch ? 'écart ' + ch[0] + ' px' : 'non ouvert'}`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
  const f = err.length + (largeur > 1 ? 1 : 0) + refus.length + (vus < 8 ? 1 : 0); fautes += f;
  lignes.push(`${w}x${h} : erreurs ${err.length}${err[0] ? ' (' + err[0].slice(0,120) + ')' : ''} ; défilement latéral ${largeur} px ; commandes testées ${vus}, couvertes ${refus.length}${refus.length ? ' (' + refus.join(', ') + ')' : ''}`);
  await c.close();
}
await b.close(); console.log(lignes.join('\n')); console.log(lignesPts.join('\n')); console.log(lignesRef.join('\n')); console.log(fautes ? `ÉCHEC : ${fautes} défaut(s)` : 'OK : borne conforme sur 6 formats');
process.exit(fautes ? 1 : 0);
})();
