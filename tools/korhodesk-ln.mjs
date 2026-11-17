// KorhoDesk · routine Lightning : lit les paiements reçus (NWC réception seule, secret KORHODESK_NWC)
// et suspend une clé par paiement réglé. Euros = millisats modulo 1000 ; code de chambre = empreinte de paiement.
import { createHash } from 'node:crypto';
import { readFileSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { finalizeEvent } from 'nostr-tools/pure';
import * as nip04 from 'nostr-tools/nip04';

const MASKS = JSON.parse(readFileSync('kave/korhodesk/index.html', 'utf8').match(/const MASKS=(\[.*?\]);/)[1].replace(/'((?:\\'|[^'])*)'/g, (_, x) => JSON.stringify(x.replace(/\\'/g, "'"))));
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const b32 = u => { let b = 0, v = 0, o = ''; for (const x of u) { v = (v << 8) | x; b += 8; while (b >= 5) { o += B32[(v >>> (b - 5)) & 31]; b -= 5; } } return o; };
const tagOf = code => b32(createHash('sha256').update(code).digest()).slice(0, 8);
const lnCode = h => MASKS[h[0] % 18] + '-' + b32(h.subarray(1, 13)).match(/.{1,5}/g).join('-');

const u = new URL(process.env.KORHODESK_NWC.replace(/^[^:]+:\/\//, 'http://'));
const wallet = u.hostname, relay = u.searchParams.get('relay'), sk = Buffer.from(u.searchParams.get('secret'), 'hex');

async function nwc(method, params) {
  const ws = new WebSocket(relay);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  const ev = finalizeEvent({ kind: 23194, created_at: Math.floor(Date.now() / 1e3), tags: [['p', wallet]], content: await nip04.encrypt(sk, wallet, JSON.stringify({ method, params })) }, sk);
  try {
    return await new Promise((r, j) => {
      setTimeout(() => j(new Error('nwc : délai')), 30e3);
      ws.onmessage = async m => { const d = JSON.parse(m.data); if (d[0] === 'EVENT' && d[2].kind === 23195) { const o = JSON.parse(await nip04.decrypt(sk, wallet, d[2].content)); o.error ? j(new Error(JSON.stringify(o.error))) : r(o.result); } };
      ws.send(JSON.stringify(['REQ', 'k', { kinds: [23195], authors: [wallet], '#e': [ev.id] }]));
      ws.send(JSON.stringify(['EVENT', ev]));
    });
  } finally { ws.close(); }
}

const since = Math.floor(Date.now() / 1e3) - 14 * 86400;
const { transactions = [] } = await nwc('list_transactions', { from: since, type: 'incoming', limit: 200 });
const paid = transactions.filter(t => (t.settled_at || t.state === 'settled') && t.payment_hash).sort((a, b) => (a.settled_at || 0) - (b.settled_at || 0));
// cours BTC-EUR : les euros annoncés dans les millisats doivent correspondre aux sats payés (85 % au moins)
let eurBtc = 0;
for (const [u, f] of [['https://api.coinbase.com/v2/prices/BTC-EUR/spot', j => +j.data.amount], ['https://www.bitstamp.net/api/v2/ticker/btceur/', j => +j.last], ['https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur', j => +j.bitcoin.eur]]) {
  try { eurBtc = f(await (await fetch(u)).json()); if (eurBtc > 0) break; } catch (e) {}
}
if (!(eurBtc > 0)) throw new Error('cours BTC-EUR introuvable');
let n = 0;
for (const t of paid) {
  const eur = t.amount % 1000;
  if (eur < 1) continue; // paiement direct hors KorhoDesk : zéro clé
  const sats = Math.floor(t.amount / 1000), due = eur / eurBtc * 1e8;
  const tag = tagOf(lnCode(Buffer.from(t.payment_hash, 'hex')));
  const reg = JSON.parse(readFileSync('kave/korhodesk/registry.json', 'utf8'));
  if (reg.keys.some(k => k.tag === tag)) continue;
  if (sats < due * 0.85) {
    if ((t.settled_at || 0) > Date.now() / 1e3 - 20 * 60) appendFileSync('caisse.md', `⚠ ${sats.toLocaleString('fr-FR')} sats pour ${eur} € annoncés (${Math.round(due).toLocaleString('fr-FR')} attendus) · ${tag} · zéro clé\n`);
    continue;
  }
  const date = new Date((t.settled_at || t.created_at) * 1e3).toISOString().slice(0, 10);
  execFileSync('node', ['tools/korhodesk-issue.mjs', tag, String(eur), date, 'ln'], { stdio: 'inherit' });
  const k = JSON.parse(readFileSync('kave/korhodesk/registry.json', 'utf8')).keys.find(x => x.tag === tag);
  const at = new Date((t.settled_at || t.created_at) * 1e3).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' });
  appendFileSync('caisse.md', `⚡ ${eur} € · ${Math.floor(t.amount / 1000).toLocaleString('fr-FR')} sats · ${at} · clé ${k.n} · ${k.tier} · ${tag} · jusqu'au ${k.until}\n`);
  n++;
}
console.log(`${paid.length} paiements réglés lus · ${n} clés suspendues`);
