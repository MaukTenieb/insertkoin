import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const b = await chromium.launch(); const p = await b.newPage(); const logs = [];
p.on('console', m => { const t = m.text(); if (/consensus|Tor|circuit|error|fail/i.test(t)) logs.push(t.slice(0, 200)); });
await p.goto(SITE + 'tor.html', { waitUntil: 'load' }); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const out = {}; const t0 = Date.now();
  try { const m = await import('./faunator-tor.js'); const res = await Promise.race([m.get('https://example.com/'), new Promise((_, j) => setTimeout(() => j(new Error('timeout 240s')), 240000))]);
    out.web = 'status ' + res.status + ' len ' + (res.text || '').length + ' in ' + Math.round((Date.now() - t0) / 1000) + 's'; out.title = (/<title>([^<]*)/.exec(res.text || '') || [])[1];
  } catch (e) { out.web = 'ERR ' + String(e.message || e).slice(0, 200) + ' after ' + Math.round((Date.now() - t0) / 1000) + 's'; try { const m = await import('./faunator-tor.js'); out.last = m.lastWords(); } catch (e2) {} }
  return out;
});
console.log('RESULT', JSON.stringify(r)); console.log('LOGS', JSON.stringify(logs.slice(-15)));
await b.close();
