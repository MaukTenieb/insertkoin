/*
 * Code: MIT licence, Copyright (c) 2026 Mauk Tenieb (see LICENSE).
 * Korhogo material: Copyright © Mauk Tenieb & Korhogo, all rights reserved. No use for training artificial intelligence.
 */
/* The rules of the palmarès of Korong! and FaunInvaders, in one file read by three programs:
   the arcade (ik-palmares.js), the 3615 Minitel (service PALMARÈS) and the hourly routine
   (tools/palmares.mjs, .github/workflows/palmares.yml). See PALMARES.md.

   An entry is a Nostr event of kind 30078 (NIP-78, application data), signed with the key the
   browser keeps for the Minitel (localStorage vdx.nostr.sk):
     tags: ["d","korhogo-palmares:<game>:<run>"] ["t","korhogo-palmares"] ["game",<game>]
           ["ini",<3 letters>] ["a",<n>] ["b",<n>]
   kind 30078 is addressable: a relay keeps the last version per key and per d, so a run that goes
   further replaces its own line.
   korong:       a = Masks beaten in the run (1 to 18), b = goals let in over the run (fewer is better)
   fauninvaders: a = score, b = wave reached */
(function (root) {
  var P = {
    KIND: 30078,
    TAG: 'korhogo-palmares',
    RELAYS: ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net', 'wss://nostr.mom'],
    SINCE: 1792454400, /* 20 October 2026 */
    /* from 31 October 2026, each entry and each card carries a proof of work (NIP-13): its id starts with 16 zero bits,
       about 65,000 tries, a second or so in a browser, a cost multiplied for anyone who forges by the thousand */
    POW: 16, POW_SINCE: 1793404800,
    bits: function (id) { var n = 0; for (var i = 0; i < 64; i++) { var v = parseInt(id[i], 16); if (isNaN(v)) return 0; if (v === 0) { n += 4; continue; } n += v < 2 ? 3 : v < 4 ? 2 : v < 8 ? 1 : 0; break; } return n; },
    worked: function (e) { return e.created_at < P.POW_SINCE || (typeof e.id === 'string' && P.bits(e.id) >= P.POW); },
    GAMES: {
      korong: { ok: function (a, b) { return a >= 1 && a <= 18 && b >= 0 && b <= 2000; }, better: function (x, y) { return x.a - y.a || y.b - x.b; } },
      fauninvaders: { ok: function (a, b) { return b >= 1 && b <= 999 && a >= 10 && a <= 1710 * b && a % 10 === 0; }, better: function (x, y) { return x.a - y.a || x.b - y.b; } }
    },
    tag: function (e, k) { for (var i = 0; i < e.tags.length; i++) if (e.tags[i][0] === k) return e.tags[i][1]; return null; },
    /* one checked entry from an event, or null */
    entry: function (e) {
      if (!e || e.kind !== P.KIND || !e.tags || e.created_at < P.SINCE || !P.worked(e)) return null;
      var g = P.tag(e, 'game'), d = P.tag(e, 'd') || '', G = P.GAMES[g];
      if (!G || d.indexOf(P.TAG + ':' + g + ':') !== 0) return null;
      var ini = String(P.tag(e, 'ini') || '').toUpperCase(), a = +P.tag(e, 'a'), b = +P.tag(e, 'b');
      if (!/^[A-Z0-9]{3}$/.test(ini) || !isFinite(a) || !isFinite(b) || a !== Math.floor(a) || b !== Math.floor(b) || !G.ok(a, b)) return null;
      return { game: g, ini: ini, a: a, b: b, t: e.created_at, who: e.pubkey, run: d };
    },
    /* the ten of one game: one line per run (its last state), at most three lines per key */
    top: function (entries, game) {
      var G = P.GAMES[game], byRun = {}, out = [], per = {};
      entries.forEach(function (x) { if (x && x.game === game) { var o = byRun[x.who + '|' + x.run]; if (!o || x.t > o.t) byRun[x.who + '|' + x.run] = x; } });
      Object.keys(byRun).map(function (k) { return byRun[k]; })
        .sort(function (x, y) { return G.better(y, x) || x.t - y.t; })
        .forEach(function (x) { per[x.who] = (per[x.who] || 0) + 1; if (per[x.who] <= 3 && out.length < 10) out.push(x); });
      return out;
    },
    enters: function (game, a, b, t) { if (a <= 0) return false; if (!t || t.length < 10) return true; return P.GAMES[game].better({ a: a, b: b }, t[t.length - 1]) > 0; },

    /* HALL OF KAVE: one card per player (per key), the last version replacing the previous one:
       kind 30078, tags ["d","korhogo-kave"] ["t","korhogo-kave"] ["name",<nickname or initials>], content = the card:
       ka/kb best Kompete! run (Masks beaten, goals let in) · du duels won · fi best FaunInvaders score
       cl sum of the levels of the chess AIs beaten · er Erratik grids · c4 hg mm Konnect4, Akasztófa, Mastermind wins
       ko Koins earned since the first visit.
       Points: 100 per Mask of the best run minus 1 per goal let in (0 to 1,800) · 20 per duel · best FaunInvaders score ÷ 10
       · 50 per chess level beaten · 30 per Erratik grid · 20 per Konnect4, Akasztófa or Mastermind win.
       ko stays on the card and counts zero points since 30 October 2026: a Koin balance lives in the browser, anyone can rewrite it. */
    KAVE: 'korhogo-kave',
    CAP: { ka: 18, kb: 2000, du: 100000, fi: 1708290, cl: 300000, er: 100000, c4: 100000, hg: 100000, mm: 100000, ko: 1000000 },
    points: function (c) {
      return Math.max(0, Math.min(1800, 100 * c.ka - (c.ka ? c.kb : 0))) + 20 * c.du + Math.floor(c.fi / 10) + 50 * c.cl + 30 * c.er + 20 * (c.c4 + c.hg + c.mm);
    },
    card: function (e) {
      if (!e || e.kind !== P.KIND || !e.tags || e.created_at < P.SINCE || P.tag(e, 'd') !== P.KAVE || !P.worked(e)) return null;
      var raw; try { raw = JSON.parse(e.content || '{}'); } catch (x) { return null; }
      var c = {};
      for (var k in P.CAP) { var v = +(raw[k] || 0); if (!isFinite(v) || v < 0 || v !== Math.floor(v) || v > P.CAP[k]) return null; c[k] = v; }
      if (c.fi % 10) return null;
      var name = String(P.tag(e, 'name') || '').replace(/[^\w\- .'À-ÿ]/g, '').slice(0, 16) || 'KORHOGO';
      return { who: e.pubkey, name: name, t: e.created_at, c: c, pts: P.points(c) };
    },
    /* a total grows at a human pace: BASE points at the first card, then RATE points an hour at most since the key's first event
       (first: { pubkey: unix time }, kept by the hourly routine in palmares.json) */
    BASE: 2000, RATE: 1500,
    plausible: function (x, first) { var f = (first && first[x.who]) || x.t; return x.pts <= P.BASE + P.RATE * Math.max(0, x.t - Math.min(f, x.t)) / 3600; },
    /* the twenty: the last card of each key, best total first */
    hall: function (cards, first) {
      var by = {};
      cards.forEach(function (x) { if (x && (!by[x.who] || x.t > by[x.who].t)) by[x.who] = x; });
      return Object.keys(by).map(function (k) { var x = by[k]; return Object.assign({}, x, { pts: P.points(x.c) }); }).filter(function (x) { return x.pts > 0 && P.plausible(x, first); })
        .sort(function (x, y) { return y.pts - x.pts || x.t - y.t; }).slice(0, 20);
    }
  };
  root.IKPR = P;
  if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
