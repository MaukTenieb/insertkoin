/*
 * Code: MIT licence, Copyright (c) 2026 Mauk Tenieb & Korhogo (see LICENSE).
 * Korhogo material: Copyright © Mauk Tenieb & Korhogo, all rights reserved. Training of AI models: reserved.
 */
/* IKK, Korhogo Kuration: a visitor keeps tracks with the heart key of the VHS deck and makes a cassette of them.
   The list stays in this browser (localStorage ik.kuration), appears on the deck's shelf as the cassette
   « Korhogo Kuration », and goes out on the open Nostr network (the Minitel's transport), signed with
   the Minitel's key: one addressable event per visitor (kind 30078, d = korhogo-kuration); each version replaces
   the previous one. Anyone opens it at insertkoin/?k=<public key>; kuration.html lists every visitor's cassette,
   kuration.html?k=<key> shows one; the Minitel service 3615 KURATIONS lists them too.
   The browser key appears with the first heart: reading the list creates zero keys.
   IKK.has(id) · IKK.toggle({id,title}) → true if kept · IKK.mine() → [{id,title}] · IKK.all() → Promise<[{pk,name,tracks,t}]>
   IKK.one(pk) → Promise<{pk,name,tracks,t}|null> · IKK.find(hex) → Promise<{…}|null> (8 to 64 hex) · IKK.url(pk) · IKK.pk() → own public key (hex) or null */
(function () {
  var KIND = 30078, TAG = 'korhogo-kuration', SINCE = 1792713600 /* 23 Oct 2026 */, MAX = 99,
    RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net', 'wss://nostr.mom'],
    NT = null, timer = 0, BASE = 'https://mauktenieb.github.io/insertkoin/';
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private window */ } }
  function load(src) { return new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function libs() { if (NT) return Promise.resolve(NT); return (window.NostrTools ? Promise.resolve() : load('nostr-tools.js')).then(function () { NT = window.NostrTools; return NT; }); }
  /* the browser's key, shared with the Minitel and the palmarès (same site, same storage) */
  function key(create) {
    var h = get('vdx.nostr.sk', null);
    if ((!h || !/^[0-9a-f]{64}$/.test(h)) && !create) return null;
    if (!h || !/^[0-9a-f]{64}$/.test(h)) { var b = NT.generateSecretKey(); h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); put('vdx.nostr.sk', h); }
    var u = new Uint8Array(32); for (var i = 0; i < 32; i++) u[i] = parseInt(h.substr(i * 2, 2), 16); return u;
  }
  function name() { var n = get('vdx.nick', '') || ''; if (!n) { try { n = localStorage.getItem('ik.ini') || ''; } catch (e) { n = ''; } } return String(n).replace(/[^\w\- .'À-ÿ]/g, '').slice(0, 16) || 'KORHOGO'; }
  function mine() { var a = get('ik.kuration', []); return Array.isArray(a) ? a.filter(function (t) { return t && /^[\w-]{11}$/.test(t.id); }) : []; }
  function has(id) { return mine().some(function (t) { return t.id === id; }); }
  /* the shelf of the deck: the visitor's own cassette, kept like a recorded one */
  function shelf(list) {
    var L = window.KGVHSLibrary; if (!L || !L.saveLocal) return;
    if (list.length) L.saveLocal({ channel: 'Korhogo Kuration', channel_url: '', tracks: list.map(function (t) { return { id: t.id, title: t.title }; }) });
    else if (L.eraseLocal) L.eraseLocal('Korhogo Kuration');
    if (L.invalidate) L.invalidate();
    if (L.ready) L.ready().then(function () { if (window.KGVHSRecorder && window.KGVHSRecorder.refresh) window.KGVHSRecorder.refresh(); });
  }
  function send() {
    var list = mine();
    return libs().then(function () {
      var ev = NT.finalizeEvent({ kind: KIND, created_at: Math.floor(Date.now() / 1000), content: JSON.stringify({ tracks: list.slice(-MAX).map(function (t) { return [t.id, String(t.title || '').slice(0, 120)]; }) }),
        tags: [['d', TAG], ['t', TAG], ['name', name()]] }, key(true));
      var pool = new NT.SimplePool();
      return Promise.allSettled(pool.publish(RELAYS, ev)).then(function () { try { pool.close(RELAYS); } catch (x) { /* closed */ } return ev; });
    }).catch(function () { return null; });
  }
  function toggle(t) {
    if (!t || !/^[\w-]{11}$/.test(t.id)) return false;
    var list = mine(), on = !has(t.id);
    if (on && list.length >= MAX) return false;
    list = on ? list.concat([{ id: t.id, title: String(t.title || t.id) }]) : list.filter(function (x) { return x.id !== t.id; });
    put('ik.kuration', list); shelf(list);
    clearTimeout(timer); timer = setTimeout(send, 4000);
    return on;
  }
  function parse(ev) {
    try {
      if (!ev || ev.kind !== KIND || !NT.verifyEvent(ev)) return null;
      var d = (ev.tags.filter(function (x) { return x[0] === 'd'; })[0] || [])[1]; if (d !== TAG) return null;
      var nm = (ev.tags.filter(function (x) { return x[0] === 'name'; })[0] || [])[1] || 'KORHOGO';
      var tr = (JSON.parse(ev.content).tracks || []).filter(function (x) { return Array.isArray(x) && /^[\w-]{11}$/.test(x[0]); })
        .slice(0, MAX).map(function (x) { return { id: x[0], title: String(x[1] || x[0]) }; });
      return { pk: ev.pubkey, name: String(nm).slice(0, 16), tracks: tr, t: ev.created_at };
    } catch (e) { return null; }
  }
  function query(filter) {
    return libs().then(function () {
      var pool = new NT.SimplePool();
      return pool.querySync(RELAYS, filter, { maxWait: 5000 }).then(function (evs) { try { pool.close(RELAYS); } catch (x) { /* closed */ } return evs; });
    }).then(function (evs) {
      var by = {};
      evs.map(parse).filter(Boolean).forEach(function (k) { if (!by[k.pk] || by[k.pk].t < k.t) by[k.pk] = k; });
      return Object.keys(by).map(function (p) { return by[p]; }).filter(function (k) { return k.tracks.length; }).sort(function (a, b) { return b.t - a.t; });
    }).catch(function () { return []; });
  }
  function all() { return query({ kinds: [KIND], '#t': [TAG], since: SINCE, limit: 2000 }); }
  function one(pk) { if (!/^[0-9a-f]{64}$/.test(pk || '')) return Promise.resolve(null); return query({ kinds: [KIND], authors: [pk], '#d': [TAG] }).then(function (a) { return a[0] || null; }); }
  function pk() { return libs().then(function () { var k = key(false); return k ? NT.getPublicKey(k) : null; }); }
  function find(want) { want = String(want || '').toLowerCase(); if (!/^[0-9a-f]{8,64}$/.test(want)) return Promise.resolve(null); return want.length === 64 ? one(want) : all().then(function (a) { return a.filter(function (k) { return k.pk.indexOf(want) === 0; })[0] || null; }); }
  /* the short address: mauktenieb.github.io/k/<first 12 hex of the key>; the root site's 404 page sends it on (8 hex still work) */
  function url(p) { return 'https://mauktenieb.github.io/k/' + p.slice(0, 12); }
  window.IKK = { has: has, toggle: toggle, mine: mine, all: all, one: one, find: find, url: url, pk: pk, name: name };

  /* insertkoin/?k=<public key>: that visitor's cassette goes into the deck */
  var m = /[?&]k=([0-9a-f]{8,64})/.exec(location.search);
  if (m) window.addEventListener('load', function () { if (!window.KG) return;
    var want = m[1];
    var find = want.length === 64 ? one(want) : all().then(function (a) { return a.filter(function (k) { return k.pk.indexOf(want) === 0; })[0] || null; });
    Promise.all([find, pk()]).then(function (r) {
      var k = r[0]; if (!k) return;
      var own = r[1] === k.pk, ch = own ? 'Korhogo Kuration' : 'Korhogo Kuration · ' + k.name;
      if (own) put('ik.kuration', k.tracks);
      var tries = 0;
      (function wait() {
        var L = window.KGVHSLibrary;
        if (!L || !L.saveLocal || !window.KGVHS) { if (tries++ === 0) { try { window.KG.open('vhs'); } catch (e) { /* not ready */ } } if (tries < 60) setTimeout(wait, 250); return; }
        L.saveLocal({ channel: ch, channel_url: '', tracks: k.tracks });
        L.invalidate(); L.ready().then(function () {
          L.selectTape(ch); if (window.KGVHS.refreshTracks) window.KGVHS.refreshTracks();
          if (window.KGVHSRecorder && window.KGVHSRecorder.refresh) window.KGVHSRecorder.refresh();
        });
      })();
    });
  });
})();
