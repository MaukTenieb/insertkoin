import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(SITE, { waitUntil: 'load' });
const r = await p.evaluate(async () => {
  const out = {}, P = 'https://api.piped.private.coffee', CH = 'UCsYxJt19tb_ZLjVoTGgf5Mg';
  try { const d = await (await fetch(P + '/channel/' + CH)).json(); out.keys = Object.keys(d).join(','); out.rs = (d.relatedStreams || []).length; out.tabs = JSON.stringify((d.tabs || []).map(t => [t.name, String(t.data).slice(0, 200)]));
    const vt = (d.tabs || [])[0]; if (vt) { const x = await fetch(P + '/channels/tabs?data=' + encodeURIComponent(vt.data)); out.tabst = x.status; out.tab = (await x.text()).slice(0, 600); } } catch (e) { out.perr = String(e); }
  const J = { headers: { 'X-Return-Format': 'html' } };
  for (const [k, u] of [['vid', 'https://www.youtube.com/channel/' + CH + '/videos'], ['hvid', 'https://www.youtube.com/@MaukTenieb/videos'], ['pl', 'https://www.youtube.com/playlist?list=UU' + CH.slice(2)]]) {
    try { const x = await fetch('https://r.jina.ai/' + u, J); const tx = await x.text(); out[k + '_st'] = x.status + ' ' + tx.length;
      const d = new DOMParser().parseFromString(tx, 'text/html'); const as = d.querySelectorAll('a[href*="watch?v="]'); out[k + '_as'] = as.length;
      out[k + '_sample'] = [...as].slice(0, 4).map(a => a.outerHTML.slice(0, 250)).join(' || ');
      const i = tx.indexOf('watch?v='); out[k + '_raw'] = i < 0 ? tx.slice(0, 400) : tx.slice(i - 400, i + 300);
    } catch (e) { out[k] = String(e); }
  }
  return out;
});
for (const [k, v] of Object.entries(r)) console.log(k, String(v).replace(/\s+/g, ' ').slice(0, 1500));
await b.close();
