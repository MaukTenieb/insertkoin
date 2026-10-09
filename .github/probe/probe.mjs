// Real-world check of VHS REC from the live site (run by .github/workflows/vhs-probe.yml)
import { chromium } from 'playwright';
const SITE = 'https://mauktenieb.github.io/insertkoin/';
const CH = 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Google for Developers
const b = await chromium.launch(); const p = await b.newPage();
const logs = []; p.on('console', m => logs.push(m.text()));
await p.goto(SITE, { waitUntil: 'load' });
const r = await p.evaluate(async (CH) => {
  const t = (u, ms = 15000, opt = {}) => { const c = new AbortController(); const k = setTimeout(() => c.abort(), ms);
    const s = Date.now(); return fetch(u, { ...opt, signal: c.signal }).then(async x => { clearTimeout(k); const tx = await x.text(); return { st: x.status, len: tx.length, ms: Date.now() - s, head: tx.slice(0, 120) }; },
      e => ({ err: String(e.name || e), ms: Date.now() - s })); };
  const out = {};
  const inv = await t('https://api.invidious.io/instances.json?sort_by=health');
  out.invList = inv.err || inv.st;
  let live = []; try { live = (await (await fetch('https://api.invidious.io/instances.json?sort_by=health')).json()).filter(x => x[1].type === 'https').map(x => x[0] + (x[1].api ? ' api' : '') + (x[1].cors ? ' cors' : '')); } catch (e) {}
  out.invLive = live;
  const INV = ['inv.nadeko.net', 'invidious.nerdvpn.de', 'yewtu.be', 'invidious.f5.si', 'iv.melmac.space', 'invidious.privacyredirect.com', 'invidious.materialio.us', 'inv.tux.pizza'].concat(live.map(x => x.split(' ')[0]));
  out.inv = {}; await Promise.all([...new Set(INV)].map(async h => out.inv[h] = await t('https://' + h + '/api/v1/channels/' + CH + '/videos')));
  let pl = []; const pi = await t('https://piped-instances.kavin.rocks/'); out.pipedList = pi.err || pi.st;
  try { pl = (await (await fetch('https://piped-instances.kavin.rocks/')).json()).map(x => x.api_url.replace(/^https?:\/\//, '')); } catch (e) {}
  const PIP = ['pipedapi.kavin.rocks', 'pipedapi.adminforge.de', 'api.piped.private.coffee', 'pipedapi.r4fo.com', 'pipedapi.leptons.xyz', 'pipedapi.nosebs.ru', 'piped-api.lunar.icu', 'pipedapi.drgns.space', 'pipedapi.ducks.party', 'pipedapi.reallyaweso.me'].concat(pl);
  out.piped = {}; await Promise.all([...new Set(PIP)].map(async h => out.piped[h] = await t('https://' + h + '/channel/' + CH)));
  const yt = 'https://www.youtube.com/@GoogleDevelopers';
  const R = { allorigins: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(yt), corslol: 'https://api.cors.lol/?url=' + encodeURIComponent(yt), x2u: 'https://cors.x2u.in/' + yt, thingproxy: 'https://thingproxy.freeboard.io/fetch/' + yt,
    codetabs: 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(yt), corsproxyio: 'https://corsproxy.io/?url=' + encodeURIComponent(yt), whatever: 'https://whateverorigin.org/get?url=' + encodeURIComponent(yt),
    rss_allorigins: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=' + CH),
    rss_codetabs: 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=' + CH),
    pl_allorigins: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.youtube.com/playlist?list=UU' + CH.slice(2)),
    jina: 'https://r.jina.ai/' + yt };
  out.relay = {}; await Promise.all(Object.entries(R).map(async ([k, u]) => { const x = await t(u, 20000); out.relay[k] = { ...x, head: undefined, ext: undefined }; }));
  out.ytdirect = await t('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', 15000, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: '2.20250101.00.00' } }, browseId: CH }) });
  out.gapi = await t('https://www.googleapis.com/youtube/v3/channels?part=id&id=' + CH + '&key=x');
  return out;
}, CH);
const ok = o => Object.entries(o).filter(([k, v]) => v.st === 200 && v.len > 500).map(([k, v]) => k + ' (' + v.len + 'b ' + v.ms + 'ms)');
const bad = o => Object.entries(o).filter(([k, v]) => !(v.st === 200 && v.len > 500)).map(([k, v]) => k + ': ' + (v.err || v.st + ' ' + v.len + 'b ' + (v.head || '').replace(/\s+/g, ' ').slice(0, 60)));
console.log('INVIDIOUS list', r.invList, JSON.stringify(r.invLive));
console.log('INVIDIOUS OK', JSON.stringify(ok(r.inv))); console.log('INVIDIOUS KO', JSON.stringify(bad(r.inv), null, 1));
console.log('PIPED list', r.pipedList); console.log('PIPED OK', JSON.stringify(ok(r.piped))); console.log('PIPED KO', JSON.stringify(bad(r.piped), null, 1));
console.log('RELAYS', JSON.stringify(r.relay, null, 1));
console.log('YT innertube direct', JSON.stringify(r.ytdirect)); console.log('GOOGLEAPIS', JSON.stringify(r.gapi));
// full REC through the UI
for (const ch of ['https://www.youtube.com/@GoogleDevelopers', 'https://www.youtube.com/@MaukTenieb']) {
  await p.goto(SITE, { waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.click('[data-go="vhs"]'); await p.waitForTimeout(3000);
  await p.fill('[data-vhs-rec-input]', ch); await p.click('[data-vhs-rec-btn]');
  const s = Date.now(); let txt = '';
  while (Date.now() - s < 150000) { txt = await p.innerText('[data-vhs-rec-progress]').catch(() => ''); if (/RECORDED|ENREGISTR|failed|chou/i.test(txt) && !/▸/.test(txt.split('\n')[0])) break; await p.waitForTimeout(2000); }
  console.log('REC', ch, Math.round((Date.now() - s) / 1000) + 's', JSON.stringify(txt));
}
await b.close();
