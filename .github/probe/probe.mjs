// Full smoke test of the live site (run by .github/workflows/vhs-probe.yml)
import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const b = await chromium.launch();
for (let i = 0; i < 30; i++) { const r = await (await b.newPage()).request.get(SITE + 'kg-loader.js?x=' + Date.now()); if ((await r.text()).includes('data-vhs-rec')) break; await new Promise(r => setTimeout(r, 10000)); }
const GAMES = ['puck', 'chess', 'erratic', 'faunarratics', 'katabatik', 'vhs', 'photo', 'tor', 'terminal'];
for (const [name, vp, touch, page] of [['desk', { width: 1280, height: 860 }, false, ''], ['deskFR', { width: 1280, height: 860 }, false, 'fr.html'], ['phone', { width: 390, height: 844 }, true, ''], ['phoneL', { width: 844, height: 390 }, true, '']]) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + String(e).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|ERR_|net::/.test(m.text())) errs.push('console ' + m.text().slice(0, 160)); });
  await p.goto(SITE + page, { waitUntil: 'load' }); await p.evaluate(() => localStorage.setItem('ik.koins', '50')); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(2500);
  const res = [];
  for (const g of GAMES) {
    try {
      await p.goto(SITE + page, { waitUntil: 'load' }); await p.waitForTimeout(1200);
      await p.click(`.cab [data-go="${g}"]`, { timeout: 5000 }); await p.waitForTimeout(g === 'katabatik' ? 5000 : 3500);
      const st = await p.evaluate(() => ({ home: !document.getElementById('home').hidden, sel: !document.getElementById('select').hidden, game: !document.getElementById('game').hidden, calque: document.getElementById('calque') && !document.getElementById('calque').hidden, kg: !document.getElementById('kg-root').hidden, cf: !document.getElementById('cf').hidden }));
      if (g === 'puck' && st.sel) { await p.click('#run'); await p.waitForTimeout(2500); st.game = await p.evaluate(() => !document.getElementById('game').hidden); }
      res.push(g + ':' + Object.entries(st).filter(([k, v]) => v).map(([k]) => k).join('+'));
    } catch (e) { res.push(g + ':FAIL ' + String(e).slice(0, 80)); }
  }
  console.log(name, res.join('  '));
  console.log(name, 'errors', errs.length, JSON.stringify([...new Set(errs)].slice(0, 8)));
  await ctx.close();
}
// real REC
const p = await b.newPage(); await p.goto(SITE, { waitUntil: 'load' }); await p.waitForTimeout(1000); await p.click('[data-go="vhs"]'); await p.waitForTimeout(4000);
await p.fill('[data-vhs-rec-input]', 'https://www.youtube.com/@MaukTenieb'); await p.click('[data-vhs-rec-btn]');
const s = Date.now(); let txt = ''; while (Date.now() - s < 150000) { txt = await p.innerText('[data-vhs-rec-progress]').catch(() => ''); if (/RECORDED|ENREGISTR|failed|chou/i.test(txt)) break; await p.waitForTimeout(2000); }
console.log('REC', JSON.stringify(txt));
await b.close();
