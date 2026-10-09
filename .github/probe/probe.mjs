// Real REC on the live site (run by .github/workflows/vhs-probe.yml)
import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const b = await chromium.launch(); const p = await b.newPage({ acceptDownloads: true });
// wait for the new scraper to be deployed
for (let i = 0; i < 30; i++) { const r = await p.request.get(SITE + 'kg-vhs-scrape.js?x=' + Date.now()); if ((await r.text()).includes('jinaVideos')) break; await p.waitForTimeout(10000); }
for (const ch of ['https://www.youtube.com/@MaukTenieb', 'https://www.youtube.com/@GoogleDevelopers', 'https://www.youtube.com/channel/UCsYxJt19tb_ZLjVoTGgf5Mg']) {
  await p.goto(SITE, { waitUntil: 'load' }); await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.click('[data-go="vhs"]'); await p.waitForTimeout(3000);
  await p.fill('[data-vhs-rec-input]', ch); await p.click('[data-vhs-rec-btn]');
  const s = Date.now(); let txt = '';
  while (Date.now() - s < 240000) { txt = await p.innerText('[data-vhs-rec-progress]').catch(() => ''); if (/RECORDED|ENREGISTR|failed|chou|cancel/i.test(txt)) break; await p.waitForTimeout(2000); }
  console.log('REC', ch, Math.round((Date.now() - s) / 1000) + 's', JSON.stringify(txt));
  const tape = await p.evaluate(() => { try { const a = JSON.parse(localStorage.getItem('kg.vhs.tapes.local.v1') || '[]'); return a.map(t => ({ ch: t.channel, n: t.tracks.length, first: t.tracks.slice(0, 3), last: t.tracks[t.tracks.length - 1] })); } catch (e) { return String(e); } });
  console.log('TAPE', JSON.stringify(tape).slice(0, 900));
  if (/RECORDED|ENREGISTR/i.test(txt)) {
    await p.click('.vhs-tape:not(.vhs-tape-all)').catch(() => {}); await p.waitForTimeout(800);
    try { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.click('[data-vhs-tapetools-csv]')]); const f = await d.path(); const fs = await import('fs'); console.log('CSV', d.suggestedFilename(), JSON.stringify(fs.readFileSync(f, 'utf8').slice(0, 400))); } catch (e) { console.log('CSV fail', String(e).slice(0, 200)); }
  }
}
await b.close();
