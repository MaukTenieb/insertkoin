import { chromium } from 'playwright';
/* a real REC of a channel against the live site, as a visitor's browser does it */
const SITE = 'https://mauktenieb.github.io/insertkoin/', URL_ = 'https://youtube.com/@mauktenieb';
await new Promise(r => setTimeout(r, 90000)); /* let Pages publish the last commit */
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(SITE + '?v=' + Date.now(), { waitUntil: 'load' });
const r = await p.evaluate(async (u) => {
  await new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'kg-vhs-scrape.js?v=' + Date.now(); s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  const t0 = Date.now(), log = [];
  try { const tape = await window.KGVHSScrape.record(u, { onProgress: (n, nm) => log.push(n) });
    return { ok: true, count: tape.tracks.length, expected: tape.expected, channel: tape.channel, secs: Math.round((Date.now() - t0) / 1000), steps: log.filter((x, i) => i % 10 === 0).join(','), sample: tape.tracks.slice(-3).map(t => t.id + ' ' + (t.title || '').slice(0, 40) + ' ' + (t.duration || '')) };
  } catch (e) { return { ok: false, err: String(e && e.message || e).slice(0, 400), why: e && e.why } }
}, URL_);
console.log('REC', JSON.stringify(r, null, 1));
await b.close();
// probe run 2026-10-09 19:20
