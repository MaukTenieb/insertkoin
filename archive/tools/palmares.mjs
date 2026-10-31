/* The hourly routine of the palmarès (see PALMARES.md): it reads the entries the arcade sent to the Nostr relays,
   checks each signature and each rule (palmares-rules.js), keeps the ten best of each game and the twenty best totals of the HALL OF KAVE, and writes palmares.json.
   Run by .github/workflows/palmares.yml; by hand: node tools/palmares.mjs */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const NT = require('../nostr-tools.js');
const R = require('../palmares-rules.js');
const OUT = new URL('../palmares.json', import.meta.url);

function ask(url) {
  return new Promise((done) => {
    const got = []; let ws;
    const end = () => { try { ws.close(); } catch {} done(got); };
    const timer = setTimeout(end, 15000);
    try { ws = new WebSocket(url); } catch { clearTimeout(timer); return done(got); }
    ws.onopen = () => ws.send(JSON.stringify(['REQ', 'p', { kinds: [R.KIND], '#t': [R.TAG, R.KAVE], since: R.SINCE, limit: 5000 }]));
    ws.onmessage = (m) => { let d; try { d = JSON.parse(m.data); } catch { return; }
      if (d[0] === 'EVENT') got.push(d[2]); else if (d[0] === 'EOSE') { clearTimeout(timer); end(); } };
    ws.onerror = () => { clearTimeout(timer); end(); };
  });
}
const seen = new Map();
const reached = [];
for (const url of R.RELAYS) { const evs = await ask(url); reached.push([url, evs.length]); for (const e of evs) if (e && e.id) seen.set(e.id, e); }
const valid = [...seen.values()].filter((e) => { try { return NT.verifyEvent(e); } catch { return false; } });
const entries = valid.map(R.entry).filter(Boolean);
const cards = valid.map(R.card).filter(Boolean);
let old = {}; try { old = JSON.parse(readFileSync(OUT, 'utf8')); } catch {}
const out = { updated: new Date().toISOString().slice(0, 16) + 'Z', relays: Object.fromEntries(reached) };
for (const g of Object.keys(R.GAMES)) {
  const prev = (old[g] || []).map((x) => ({ game: g, ...x }));     // an entry a relay dropped stays in the ten
  out[g] = R.top(prev.concat(entries), g).map(({ ini, a, b, t, who, run }) => ({ ini, a, b, t, who, run }));
}
// first event of each key, kept from run to run: the pace rule of the HALL OF KAVE reads it
out.first = { ...(old.first || {}) };
// the first run of the pace rule (30 October 2026): every key already listed counts from the opening of the palmarès
if (!old.first) for (const x of [...(old.kave || []), ...Object.keys(R.GAMES).flatMap((g) => old[g] || [])]) if (x.who) out.first[x.who] = R.SINCE;
for (const e of valid) if (!out.first[e.pubkey] || e.created_at < out.first[e.pubkey]) out.first[e.pubkey] = e.created_at;
// HALL OF KAVE: the twenty best totals; a card a relay dropped stays until a newer card of the same key replaces it
out.kave = R.hall((old.kave || []).map((x) => ({ ...x })).concat(cards), out.first).map(({ who, name, t, c, pts }) => ({ who, name, t, c, pts }));
const same = JSON.stringify({ ...old, updated: 0, relays: 0 }) === JSON.stringify({ ...out, updated: 0, relays: 0 });
if (!same) writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(same ? 'unchanged' : 'written', JSON.stringify(out.relays), Object.keys(R.GAMES).map((g) => g + ':' + out[g].length).join(' '), 'kave:' + out.kave.length);
