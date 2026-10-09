/* FaunaTor relay — a Cloudflare Worker (free plan: 100,000 requests a day).
   It fetches a page for FaunaTor and hands it back with the header that lets the browser read it.
   Only the motel may use it (Origin check), so nobody else spends your quota.

   Deploy: dash.cloudflare.com → Workers & Pages → Create → Worker → paste this file → Deploy.
   Then in tor.html set: var RELAY='https://<name>.<you>.workers.dev/?url=';

   It reaches the ordinary web. It cannot reach .onion addresses: only a machine running Tor can. */
const ALLOWED = ['https://mauktenieb.github.io'];
export default {
  async fetch(req) {
    const origin = req.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0], 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: { ...cors, 'Access-Control-Allow-Methods': 'GET' } });
    if (origin && !ALLOWED.includes(origin)) return new Response('', { status: 403, headers: cors });
    const target = new URL(req.url).searchParams.get('url');
    if (!target || !/^https?:\/\//i.test(target)) return new Response('', { status: 400, headers: cors });
    try {
      const r = await fetch(target, { redirect: 'follow', headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en,fr;q=0.8' } });
      const h = new Headers(r.headers);
      ['content-security-policy', 'x-frame-options', 'set-cookie', 'content-encoding', 'content-length'].forEach(k => h.delete(k));
      Object.entries(cors).forEach(([k, v]) => h.set(k, v));
      return new Response(r.body, { status: r.status, headers: h });
    } catch (e) {
      return new Response('', { status: 502, headers: cors });
    }
  }
};
