/* FaunaTor — Tor inside the page.
   Two clients, both compiled to WebAssembly, both reaching the Tor network through Snowflake
   (the Tor Project's own bridges, over WebSocket / WebRTC) — no server of ours, no extension:
   - the web:    webtor-wasm, privacy-ethereum/webtor-rs (MIT)      → any http(s) page, through a Tor exit
   - .onion:     webtor-wasm, andrewtheguy/webtor-rs (MIT)          → v3 onion services, http:// and ws://
   The files tor-web.js/.wasm and tor-onion.js/.wasm are built from those sources by
   .github/workflows/faunator-tor.yml and sit at the top level of the site.
   Until they exist, the web client is loaded from its author's CDN; the onion client has none. */
const CDN_WEB = 'https://webtor-wasm.53627.org/webtor-wasm/v0.5.7/webtor_wasm.js';
const here = (f) => new URL(f, import.meta.url).href;
async function has(f) { try { const r = await fetch(here(f), { method: 'HEAD', cache: 'no-store' }); return r.ok; } catch (e) { return false; } }

/* ---- a tiny IndexedDB shelf for the onion client's directory (a few MB, valid ~3 h) ---- */
function shelf(op, val) {
  return new Promise((res) => {
    try {
      const rq = indexedDB.open('faunator', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
      rq.onerror = () => res(null);
      rq.onsuccess = () => {
        try {
          const tx = rq.result.transaction('kv', op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore('kv');
          const q = op === 'get' ? st.get('seed') : st.put({ v: val, t: Date.now() }, 'seed');
          q.onsuccess = () => res(op === 'get' ? q.result : true); q.onerror = () => res(null);
        } catch (e) { res(null); }
      };
    } catch (e) { res(null); }
  });
}

/* what Tor last said — shown, small, under a rejection */
const TRAIL = [];
function note(where, x) {
  let t = '';
  try { t = typeof x === 'string' ? x : (x && (x.message || x.code || (x.toString && x.toString()))) || JSON.stringify(x); } catch (e) { t = String(x); }
  t = String(t).replace(/\s+/g, ' ').slice(0, 160);
  if (!t) return;
  TRAIL.push(where + ': ' + t); if (TRAIL.length > 30) TRAIL.shift();
}
export function lastWords() { return TRAIL.slice(-2).join(' · '); }
function within(p, ms, what) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(what + ' timeout ' + Math.round(ms / 1000) + 's')), ms))]); }
let webP = null, onionP = null;
export function web() {
  if (!webP) {
    webP = (async () => {
      let m;
      if (await has('tor-web.js')) { m = await import(here('tor-web.js')); await m.default({ module_or_path: here('tor-web_bg.wasm') }); }
      else { m = await import(CDN_WEB); await m.default(); }
      try { m.setLogCallback((a, b) => { const t = String(b === undefined ? a : a + ' ' + b); if (/error|fail|timeout|refus|denied|closed/i.test(t)) note('web', t); }); } catch (e) {}
      /* roads to the Tor network, one after the other: Snowflake's own WebSocket bridges, then the WebRTC volunteers */
      const roads = [() => new m.TorClientOptions('wss://snowflake.torproject.net/'), () => new m.TorClientOptions('wss://snowflake.bamsoftware.com/'), () => m.TorClientOptions.snowflakeWebRtc()];
      let last;
      for (const mk of roads) {
        try {
          let o = mk();
          try { o = o.withCreateCircuitEarly(true).withConnectionTimeout(60000).withCircuitTimeout(90000); } catch (e) {}
          const c = await within(new m.TorClient(o), 120000, 'web bootstrap');
          await within(c.waitForCircuit(), 100000, 'web circuit');
          return c;
        } catch (e) { last = e; note('web', e); }
      }
      throw last || new Error('no road to Tor');
    })();
    webP.catch((e) => { note('web', e); webP = null; });
  }
  return webP;
}
export function onion() {
  if (!onionP) {
    onionP = (async () => {
      if (!(await has('tor-onion.js'))) throw new Error('no onion client');
      const m = await import(here('tor-onion.js'));
      await m.default({ module_or_path: here('tor-onion_bg.wasm') });
      const opts = { onLog: (msg, lvl) => { if (lvl === 'error' || lvl === 'warn') note('onion', msg); }, onDirectoryChange: (s) => { shelf('put', s); } };
      const old = await shelf('get');
      if (old && old.v && Date.now() - old.t < 2.5 * 3600e3) opts.directorySeed = old.v;
      const create = (o) => within(m.WebtorClient.create(o), 120000, 'onion bootstrap');
      /* the direct WebSocket road to Snowflake first, then the brokered WebRTC road */
      try { return await create(opts); }
      catch (e) {
        note('onion ws', e);
        if (opts.directorySeed) { try { const o = Object.assign({}, opts); delete o.directorySeed; return await create(o); } catch (e2) { note('onion ws', e2); } }
        const o3 = Object.assign({}, opts, { bridge: 'webrtc', stunUrls: ['stun:stun.l.google.com:19302', 'stun:stun.antisip.com:3478'], rtcPeerConnection: window.RTCPeerConnection });
        delete o3.directorySeed;
        try { return await create(o3); } catch (e3) { note('onion rtc', e3); throw e3; }
      }
    })();
    onionP.catch((e) => { note('onion', e); onionP = null; });
  }
  return onionP;
}
/* start bootstrapping early: Snowflake + a circuit take from a few seconds to a minute */
export function warm() { web().catch(() => {}); }

const dec = new TextDecoder();
function asText(r) {
  try { if (typeof r.text === 'function') return r.text(); } catch (e) {}
  try { return dec.decode(r.body); } catch (e) { return ''; }
}
/* GET through Tor; resolves to {status, text, url} */
export async function get(url, onionToo) {
  const isOnion = /\.onion(:\d+)?(\/|$)/i.test(new URL(url).host + '/');
  if (isOnion) {
    try {
      const c = await onion();
      const r = await within(c.fetch(url.replace(/^https:/i, 'http:'), { headers: { Accept: 'text/html,*/*' } }), 240000, 'onion fetch');
      return { status: r.status, text: r.text(), url };
    } catch (e) { note('onion', e); throw e; }
  }
  try {
    const c = await web();
    const r = await within(c.fetch(url), 90000, 'web fetch');
    return { status: r.status, text: await asText(r), url: r.url || url };
  } catch (e) { note('web', e); throw e; }
}
/* bytes, for the images of an onion page */
export async function bytes(url) {
  const c = await onion();
  const r = await c.fetch(url.replace(/^https:/i, 'http:'), { maxResponseBytes: 2097152 });
  if (r.status >= 400) throw new Error('http ' + r.status);
  return { type: (r.headers && r.headers.get && r.headers.get('content-type')) || '', data: r.bytes() };
}
export function hasOnion() { return has('tor-onion.js'); }
