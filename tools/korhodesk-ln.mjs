// KorhoDesk · routine Lightning : lit les paiements reçus (NWC réception seule, secret KORHODESK_NWC)
// et suspend une clé par paiement réglé. Euros = millisats modulo 1000 ; code de chambre = empreinte de paiement.
import { createHash } from 'node:crypto';
import { readFileSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { finalizeEvent } from 'nostr-tools/pure';
import * as nip04 from 'nostr-tools/nip04';

const MASKS = ['Unkle Maukie', 'dogXim', 'C7H5N3O6', 'Naphta', "Ts'ui Pên", 'Honey Buzzard', 'Hátra Lövés', 'Croisière Noire', 'Aube', 'Silent Pact', 'Maiden Call', 'Plague of Justinian', 'Poisoned Well', 'Cadaver Synod', 'Truce', 'Auvergne', 'Grand Colonel', 'Malika'];
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
let n = 0;
for (const t of paid) {
  const eur = t.amount % 1000;
  if (eur < 1) continue; // paiement direct hors KorhoDesk : zéro clé
  const tag = tagOf(lnCode(Buffer.from(t.payment_hash, 'hex')));
  const reg = JSON.parse(readFileSync('kave/korhodesk/registry.json', 'utf8'));
  if (reg.keys.some(k => k.tag === tag)) continue;
  const date = new Date((t.settled_at || t.created_at) * 1e3).toISOString().slice(0, 10);
  execFileSync('node', ['tools/korhodesk-issue.mjs', tag, String(eur), date, 'ln'], { stdio: 'inherit' });
  const k = JSON.parse(readFileSync('kave/korhodesk/registry.json', 'utf8')).keys.find(x => x.tag === tag);
  const at = new Date((t.settled_at || t.created_at) * 1e3).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' });
  appendFileSync('caisse.md', `⚡ ${eur} € · ${Math.floor(t.amount / 1000).toLocaleString('fr-FR')} sats · ${at} · clé ${k.n} · ${k.tier} · ${tag} · jusqu'au ${k.until}\n`);
  n++;
}
console.log(`${paid.length} paiements réglés lus · ${n} clés suspendues`);
