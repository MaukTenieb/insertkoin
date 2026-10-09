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

let webP = null, onionP = null;
export function web() {
  if (!webP) {
    webP = (async () => {
      let m;
      if (await has('tor-web.js')) { m = await import(here('tor-web.js')); await m.default({ module_or_path: here('tor-web_bg.wasm') }); }
      else { m = await import(CDN_WEB); await m.default(); }
      let o = m.TorClientOptions.snowflakeWebRtc();
      try { o = o.withCreateCircuitEarly(true); } catch (e) {}
      const c = await new m.TorClient(o);
      try { await c.waitForCircuit(); } catch (e) {}
      return c;
    })();
    webP.catch(() => { webP = null; });
  }
  return webP;
}
export function onion() {
  if (!onionP) {
    onionP = (async () => {
      if (!(await has('tor-onion.js'))) throw new Error('no onion client');
      const m = await import(here('tor-onion.js'));
      await m.default({ module_or_path: here('tor-onion_bg.wasm') });
      const opts = { log: false, onDirectoryChange: (s) => { shelf('put', s); } };
      const old = await shelf('get');
      if (old && old.v && Date.now() - old.t < 2.5 * 3600e3) opts.directorySeed = old.v;
      try { return await m.WebtorClient.create(opts); }
      catch (e) { if (opts.directorySeed) { delete opts.directorySeed; return await m.WebtorClient.create(opts); } throw e; }
    })();
    onionP.catch(() => { onionP = null; });
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
    const c = await onion();
    const r = await c.fetch(url.replace(/^https:/i, 'http:'), { headers: { Accept: 'text/html,*/*' } });
    return { status: r.status, text: r.text(), url };
  }
  const c = await web();
  const r = await c.fetch(url);
  return { status: r.status, text: await asText(r), url: r.url || url };
}
/* bytes, for the images of an onion page */
export async function bytes(url) {
  const c = await onion();
  const r = await c.fetch(url.replace(/^https:/i, 'http:'), { maxResponseBytes: 2097152 });
  if (r.status >= 400) throw new Error('http ' + r.status);
  return { type: (r.headers && r.headers.get && r.headers.get('content-type')) || '', data: r.bytes() };
}
export function hasOnion() { return has('tor-onion.js'); }
