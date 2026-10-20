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
    GAMES: {
      korong: { ok: function (a, b) { return a >= 1 && a <= 18 && b >= 0 && b <= 2000; }, better: function (x, y) { return x.a - y.a || y.b - x.b; } },
      fauninvaders: { ok: function (a, b) { return b >= 1 && b <= 999 && a >= 10 && a <= 1710 * b && a % 10 === 0; }, better: function (x, y) { return x.a - y.a || x.b - y.b; } }
    },
    tag: function (e, k) { for (var i = 0; i < e.tags.length; i++) if (e.tags[i][0] === k) return e.tags[i][1]; return null; },
    /* one checked entry from an event, or null */
    entry: function (e) {
      if (!e || e.kind !== P.KIND || !e.tags || e.created_at < P.SINCE) return null;
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
    enters: function (game, a, b, t) { if (a <= 0) return false; if (!t || t.length < 10) return true; return P.GAMES[game].better({ a: a, b: b }, t[t.length - 1]) > 0; }
  };
  root.IKPR = P;
  if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
