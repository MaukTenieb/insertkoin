import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(SITE, { waitUntil: 'load' });
const r = await p.evaluate(async () => {
  const P = 'https://api.piped.private.coffee', out = {};
  for (const CH of ['UC_x5XG1OV2P6uZZ5FSM9Ttw', 'UCsYxJt19tb_ZLjVoTGgf5Mg']) {
    try {
      const d = await (await fetch(P + '/channel/' + CH)).json();
      out[CH + '_keys'] = Object.keys(d).join(',');
      out[CH + '_tabs'] = JSON.stringify((d.tabs || []).map(t => ({ name: t.name, data: String(t.data).slice(0, 120) })));
      const vt = (d.tabs || []).find(t => /video/i.test(t.name));
      if (vt) {
        let n = 0, pages = 0, first = null, s = Date.now();
        let q = await (await fetch(P + '/channels/tabs?data=' + encodeURIComponent(vt.data))).json();
        out[CH + '_tab0'] = JSON.stringify(q).slice(0, 500);
        while (q && pages < 80) { const c = q.content || q.relatedStreams || []; n += c.length; if (!first) first = c[0]; pages++;
          if (!q.nextpage || !c.length) break;
          q = await (await fetch(P + '/channels/tabs?data=' + encodeURIComponent(vt.data) + '&nextpage=' + encodeURIComponent(q.nextpage))).json(); }
        out[CH + '_total'] = n + ' videos in ' + pages + ' pages, ' + (Date.now() - s) + 'ms; first=' + JSON.stringify(first);
      }
    } catch (e) { out[CH + '_err'] = String(e); }
  }
  const J = { headers: { 'X-Return-Format': 'html' } };
  for (const [k, u] of [['jvid', 'https://www.youtube.com/@MaukTenieb/videos'], ['jpl', 'https://www.youtube.com/playlist?list=UUsYxJt19tb_ZLjVoTGgf5Mg']]) {
    try { const tx = await (await fetch('https://r.jina.ai/' + u, J)).text(); const i = tx.indexOf('watch?v=');
      out[k] = tx.length + ' | ' + tx.slice(Math.max(0, i - 700), i + 500).replace(/\s+/g, ' ');
      const ids = new Set((tx.match(/watch\?v=([\w-]{11})/g) || [])); out[k + '_ids'] = ids.size;
      out[k + '_ytInitialData'] = /ytInitialData/.test(tx); out[k + '_videoRenderer'] = (tx.match(/"videoRenderer"|"richItemRenderer"|"lockupViewModel"|"playlistVideoRenderer"/g) || []).length;
    } catch (e) { out[k] = String(e); }
  }
  // rate: 6 quick jina calls
  const st = await Promise.all([1, 2, 3, 4, 5, 6].map(i => fetch('https://r.jina.ai/https://www.youtube.com/@GoogleDevelopers?x=' + i, J).then(x => x.status, e => 'err')));
  out.jina_burst = st.join(',');
  return out;
});
for (const [k, v] of Object.entries(r)) console.log(k, String(v).slice(0, 1400));
await b.close();
