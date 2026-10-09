// Real-world check of VHS REC from the live site (run by .github/workflows/vhs-probe.yml)
import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const CH = 'UC_x5XG1OV2P6uZZ5FSM9Ttw';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(SITE, { waitUntil: 'load' });
const r = await p.evaluate(async (CH) => {
  const t = (u, ms = 20000, opt = {}) => { const c = new AbortController(); const k = setTimeout(() => c.abort(), ms);
    const s = Date.now(); return fetch(u, { ...opt, signal: c.signal }).then(async x => { clearTimeout(k); const tx = await x.text(); return { st: x.status, len: tx.length, ms: Date.now() - s, head: tx.slice(0, 300), ext: (/"externalId":"(UC[\w-]{22})"/.exec(tx) || /channel_id=(UC[\w-]{22})/.exec(tx) || [])[1], pv: (tx.match(/playlistVideoRenderer/g) || []).length, vids: (tx.match(/watch\?v=[\w-]{11}/g) || []).length, entries: (tx.match(/<entry>/g) || []).length, nextpage: /"nextpage":"/.test(tx) }; },
      e => ({ err: String(e.name || e) + ' ' + String(e.message || ''), ms: Date.now() - s })); };
  const P = 'https://api.piped.private.coffee';
  const yt = 'https://www.youtube.com/@GoogleDevelopers';
  const J = { headers: { 'X-Return-Format': 'html' } };
  const out = {
    pc_channel: await t(P + '/channel/' + CH),
    pc_handle1: await t(P + '/@/GoogleDevelopers'),
    pc_handle2: await t(P + '/c/GoogleDevelopers'),
    pc_handle3: await t(P + '/user/GoogleDevelopers'),
    pc_search: await t(P + '/search?q=GoogleDevelopers&filter=channels'),
    pc_resolve: await t(P + '/resolve?url=' + encodeURIComponent(yt)),
    pc_playlist: await t(P + '/playlists/UU' + CH.slice(2)),
    mk_search: await t(P + '/search?q=Mauk%20Tenieb&filter=channels'),
    jina_html: await t('https://r.jina.ai/' + yt, 30000, J),
    jina_plain: await t('https://r.jina.ai/' + yt, 30000),
    jina_rss: await t('https://r.jina.ai/https://www.youtube.com/feeds/videos.xml?channel_id=' + CH, 30000, J),
    jina_pl: await t('https://r.jina.ai/https://www.youtube.com/playlist?list=UU' + CH.slice(2), 30000, J),
    jina_mk: await t('https://r.jina.ai/https://www.youtube.com/@MaukTenieb', 30000, J),
    noembed: await t('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')),
    oembed: await t('https://www.youtube.com/oembed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ') + '&format=json'),
    allorigins_get: await t('https://api.allorigins.win/get?url=' + encodeURIComponent(yt)),
    corsproxy_org: await t('https://corsproxy.org/?' + encodeURIComponent(yt)),
    cors_eu: await t('https://cors.eu.org/' + yt),
    htmldriven: await t('https://cors-proxy.htmldriven.com/?url=' + encodeURIComponent(yt)),
    everyorigin: await t('https://everyorigin.jwvbremen.nl/api/get?url=' + encodeURIComponent(yt)),
    fringe: await t('https://cors.fringe.zone/' + yt)
  };
  try { const d = await (await fetch(P + '/channel/' + CH)).json(); out.pc_detail = { name: d.name, n: (d.relatedStreams || []).length, np: !!d.nextpage, first: d.relatedStreams && d.relatedStreams[0] };
    if (d.nextpage) { const d2 = await (await fetch(P + '/nextpage/channel/' + CH + '?nextpage=' + encodeURIComponent(d.nextpage))).json(); out.pc_next = { n: (d2.relatedStreams || []).length, np: !!d2.nextpage, err: d2.error || d2.message }; } } catch (e) { out.pc_detail = String(e); }
  return out;
}, CH);
for (const [k, v] of Object.entries(r)) console.log(k, JSON.stringify(v).slice(0, 700));
await b.close();
