import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(SITE, { waitUntil: 'load' });
const r = await p.evaluate(async () => {
  const P = 'https://api.piped.private.coffee', CH = 'UCsYxJt19tb_ZLjVoTGgf5Mg', out = {};
  const J = async u => (await fetch(u)).json();
  try {
    const d = await J(P + '/channel/' + CH); out.tabs = (d.tabs || []).map(t => t.name).join(','); out.related = (d.relatedStreams || []).length; out.np = !!d.nextpage;
    for (const t of d.tabs || []) {
      let q = await J(P + '/channels/tabs?data=' + encodeURIComponent(t.data)), n = 0, pages = 0, types = {};
      while (q && pages < 30) { (q.content || []).forEach(c => types[c.type] = (types[c.type] || 0) + 1); n += (q.content || []).length; pages++; if (!q.nextpage) break; q = await J(P + '/channels/tabs?data=' + encodeURIComponent(t.data) + '&nextpage=' + encodeURIComponent(q.nextpage)).catch(e => ({ err: String(e) })); if (q.err || q.error) { out['tabErr_' + t.name] = q.err || q.error; break; } }
      out['tab_' + t.name] = n + ' items, ' + pages + ' pages ' + JSON.stringify(types);
      if (t.name === 'playlists') {
        const q0 = await J(P + '/channels/tabs?data=' + encodeURIComponent(t.data));
        out.playlists = [];
        for (const c of (q0.content || []).slice(0, 40)) { const L = (/list=([\w-]+)/.exec(c.url || '') || [])[1]; let z = await J(P + '/playlists/' + L).catch(() => ({})), m = (z.relatedStreams || []).length, pg = 1, tot = z.videos;
          while (z.nextpage && pg < 20) { z = await J(P + '/nextpage/playlists/' + L + '?nextpage=' + encodeURIComponent(z.nextpage)).catch(() => ({})); m += (z.relatedStreams || []).length; pg++; }
          out.playlists.push(c.name + ' [' + (c.uploaderName || '') + '] ' + m + '/' + tot); }
      }
    }
  } catch (e) { out.err = String(e); }
  const H = { headers: { 'X-Return-Format': 'html' } };
  for (const tab of ['videos', 'shorts', 'streams', 'releases', 'playlists', 'featured']) {
    try { const tx = await (await fetch('https://r.jina.ai/https://www.youtube.com/channel/' + CH + '/' + tab, H)).text(); out['jina_' + tab] = tx.length + ' ids:' + new Set((tx.match(/"videoId":"([\w-]{11})"/g) || [])).size + ' tabsSeen:' + [...new Set((tx.match(/"title":"(Home|Videos|Shorts|Live|Releases|Playlists|Posts|Podcasts|Courses|Store)"/g) || []))].join('|'); } catch (e) { out['jina_' + tab] = String(e); }
  }
  try { const tx = await (await fetch('https://r.jina.ai/https://www.youtube.com/playlist?list=UU' + CH.slice(2), H)).text(); out.uploads = (/"numVideosText":\{"runs":\[\{"text":"([^"]+)"/.exec(tx) || /([\d,]+) videos/.exec(tx) || [])[1] + ' ids:' + new Set((tx.match(/"videoId":"([\w-]{11})"/g) || [])).size; } catch (e) { out.uploads = String(e); }
  try { const tx = await (await fetch('https://r.jina.ai/https://www.youtube.com/@MaukTenieb', H)).text(); out.about = (/"videoCountText":\{[^}]*?"text":"([^"]+)"/.exec(tx) || /([\d,.]+\s*videos)/.exec(tx) || [])[1]; } catch (e) {}
  return out;
});
for (const [k, v] of Object.entries(r)) console.log(k, typeof v === 'string' ? v.slice(0, 400) : JSON.stringify(v, null, 0).slice(0, 3000));
/* the uploads playlist through Piped and Invidious, page after page, from the page (CORS as visitors) */
const up = await p.evaluate(async () => {
  const CH = 'UCsYxJt19tb_ZLjVoTGgf5Mg', L = 'UU' + CH.slice(2), out = {};
  const J = async (u, ms = 20000) => { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); try { return await (await fetch(u, { signal: c.signal })).json(); } finally { clearTimeout(t); } };
  for (const h of ['api.piped.private.coffee', 'pipedapi.kavin.rocks', 'pipedapi.adminforge.de']) {
    try { let z = await J('https://' + h + '/playlists/' + L), ids = new Set(), pg = 1; (z.relatedStreams || []).forEach(v => ids.add(v.url)); const tot = z.videos;
      while (z.nextpage && pg < 30) { z = await J('https://' + h + '/nextpage/playlists/' + L + '?nextpage=' + encodeURIComponent(z.nextpage)); (z.relatedStreams || []).forEach(v => ids.add(v.url)); pg++; }
      out['piped_' + h] = ids.size + '/' + tot + ' in ' + pg + ' pages'; } catch (e) { out['piped_' + h] = String(e).slice(0, 80); }
  }
  for (const h of ['inv.nadeko.net', 'invidious.nerdvpn.de', 'yewtu.be']) {
    try { let ids = new Set(), page = 1, z; do { z = await J('https://' + h + '/api/v1/playlists/' + L + '?page=' + page); (z.videos || []).forEach(v => ids.add(v.videoId)); page++; } while ((z.videos || []).length && page < 20);
      out['inv_' + h] = ids.size + ' in ' + (page - 1) + ' pages'; } catch (e) { out['inv_' + h] = String(e).slice(0, 80); }
  }
  return out;
});
for (const [k, v] of Object.entries(up)) console.log(k, v);
/* from the runner itself (no CORS): what YouTube says the channel holds */
for (const tab of ['videos', 'shorts', 'streams', 'playlists']) {
  try { const tx = await (await fetch('https://www.youtube.com/@MaukTenieb/' + tab, { headers: { 'Accept-Language': 'en' } })).text();
    console.log('yt_' + tab, tx.length, 'ids:' + new Set((tx.match(/"videoId":"([\w-]{11})"/g) || [])).size, 'count:' + ((/"videosCountText":\{"runs":\[\{"text":"([^"]+)"/.exec(tx) || /(\d[\d,.]*) videos/.exec(tx) || [])[1] || '?'), 'cont:' + /continuationCommand/.test(tx)); } catch (e) { console.log('yt_' + tab, String(e)); }
}
try { const tx = await (await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UCsYxJt19tb_ZLjVoTGgf5Mg')).text(); console.log('rss entries', (tx.match(/<entry>/g) || []).length); } catch (e) {}
await b.close();
// probe run 2026-10-09 19:00
