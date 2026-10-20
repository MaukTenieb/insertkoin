/* Palmarès — a Cloudflare Worker (free plan) that keeps the ten best runs of Korong! and the ten best games of FaunInvaders.

   Deploy: dash.cloudflare.com → Workers & Pages → Create → Worker, name it "palmares" → Deploy → Edit code → paste this file → Deploy.
   Storage: Workers & Pages → KV → Create a namespace "PALMARES"; then the worker → Settings → Bindings → Add → KV namespace,
   variable name PALMARES, namespace PALMARES → Deploy.
   The site calls https://palmares.mauktenieb.workers.dev

   GET  /top?game=korong|fauninvaders            → [{ini,a,b,t}, …] (ten at most, best first)
   POST /score {game, ini, a, b, run}             → {rank, top}  (rank 0 = outside the ten)
     korong:       a = Masks beaten in the run (0–18), b = goals conceded over the run (fewer is better)
     fauninvaders: a = score, b = wave reached
   One entry per run: a run that goes further replaces its own line. Only the motel may write (Origin check),
   and one address writes once a minute at most (the site retries). */
const ALLOWED = ['https://mauktenieb.github.io'];
const GAMES = {
  korong: { ok: (a, b) => a >= 0 && a <= 18 && b >= 0 && b <= 2000, better: (x, y) => x.a - y.a || y.b - x.b },
  fauninvaders: { ok: (a, b) => b >= 1 && b <= 999 && a >= 0 && a <= 1710 * b, better: (x, y) => x.a - y.a || x.b - y.b }
};
const json = (o, cors, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0], 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
    const url = new URL(req.url);
    if (req.method === 'GET' && url.pathname === '/top') {
      const g = url.searchParams.get('game');
      if (!GAMES[g]) return json({ error: 'game' }, cors, 400);
      const top = JSON.parse((await env.PALMARES.get('top:' + g)) || '[]');
      return json(top.map(({ ini, a, b, t }) => ({ ini, a, b, t })), cors);
    }
    if (req.method === 'POST' && url.pathname === '/score') {
      if (!ALLOWED.includes(origin)) return json({ error: 'origin' }, cors, 403);
      const ip = req.headers.get('CF-Connecting-IP') || '?';
      if (await env.PALMARES.get('ip:' + ip)) return json({ error: 'slow' }, cors, 429);
      let d; try { d = await req.json(); } catch (e) { return json({ error: 'body' }, cors, 400); }
      const G = GAMES[d && d.game], a = Math.floor(+d.a), b = Math.floor(+d.b);
      const ini = String(d.ini || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
      const run = String(d.run || '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
      if (!G || ini.length !== 3 || !run || !Number.isFinite(a) || !Number.isFinite(b) || !G.ok(a, b)) return json({ error: 'entry' }, cors, 400);
      await env.PALMARES.put('ip:' + ip, '1', { expirationTtl: 60 });
      const key = 'top:' + d.game, top = JSON.parse((await env.PALMARES.get(key)) || '[]');
      const e = { ini, a, b, run, t: Date.now() }, i = top.findIndex(x => x.run === run);
      if (i >= 0) { if (G.better(e, top[i]) > 0) top[i] = e; } else top.push(e);
      top.sort((x, y) => G.better(y, x) || x.t - y.t);
      const ten = top.slice(0, 10), rank = ten.findIndex(x => x.run === run) + 1;
      await env.PALMARES.put(key, JSON.stringify(ten));
      return json({ rank, top: ten.map(({ ini, a, b, t }) => ({ ini, a, b, t })) }, cors);
    }
    return json({ error: 'route' }, cors, 404);
  }
};
