// KorhoDesk (protocole Kalabass) — registre des Postulants.
// Lit les parrainages GitHub Sponsors de MaukTenieb, numérote les clés,
// signe chaque clé (Ed25519), calcule la racine de Merkle, écrit kave/korhodesk/registry.json.
// Variables : SPONSORS_TOKEN (jeton GitHub, portée read:user), KORHOGOO_KEY (clé privée PEM),
// KORHOGOO_SALT (sel secret). Mode essai : node tools/registry.mjs --mock
import { createHash, createPrivateKey, createPublicKey, sign } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const OUT = 'kave/korhodesk/registry.json';
const RACK = 99;
const TIERS = [ // seuils en cents USD, du plus haut au plus bas
  [9900, '[K]ALEB\'S ASS'], [5000, '[k]ALABASS'], [1000, 'KALABASS'], [500, '[K]alabass'], [100, 'kalabass'],
];
const tierName = c => (TIERS.find(([min]) => c >= min) || TIERS[TIERS.length - 1])[1];
const sha = s => createHash('sha256').update(s).digest('hex');
const canon = o => JSON.stringify(o, Object.keys(o).sort());

async function fetchSponsors() {
  const q = `query($c:String){viewer{sponsorshipsAsMaintainer(first:100,after:$c,includePrivate:true,activeOnly:false){
    pageInfo{hasNextPage endCursor}
    nodes{id createdAt isActive privacyLevel isOneTimePayment
      sponsorEntity{...on User{login} ...on Organization{login}}
      tier{monthlyPriceInCents isOneTime}}}}}`;
  const all = []; let c = null;
  do {
    const r = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${process.env.SPONSORS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, variables: { c } }),
    });
    const j = await r.json();
    if (j.errors) throw new Error(JSON.stringify(j.errors));
    const s = j.data.viewer.sponsorshipsAsMaintainer;
    all.push(...s.nodes); c = s.pageInfo.hasNextPage ? s.pageInfo.endCursor : null;
  } while (c);
  return all;
}

function mock() {
  const logins = ['zeta', null, 'kandiktat', 'oilman', null, 'bakou1879'];
  const cents = [100, 500, 1000, 5000, 9900, 500];
  return logins.map((l, i) => ({
    id: 'MOCK' + i, createdAt: new Date(Date.UTC(2026, 10, 1 + i)).toISOString(), isActive: i !== 1,
    privacyLevel: l ? 'PUBLIC' : 'PRIVATE', isOneTimePayment: i % 3 === 2,
    sponsorEntity: l ? { login: l } : null, tier: { monthlyPriceInCents: cents[i], isOneTime: i % 3 === 2 },
  }));
}

function merkle(leaves) {
  if (!leaves.length) return sha('');
  let lv = leaves.slice();
  while (lv.length > 1) {
    const nx = [];
    for (let i = 0; i < lv.length; i += 2) nx.push(sha(lv[i] + (lv[i + 1] ?? lv[i])));
    lv = nx;
  }
  return lv[0];
}

const isMock = process.argv.includes('--mock');
if (!isMock && (!process.env.SPONSORS_TOKEN || !process.env.KORHOGOO_KEY || !process.env.KORHOGOO_SALT)) { console.log('KorhoDesk : secrets absents, registre inchangé'); process.exit(0); }
const pem = isMock ? readFileSync('tools/test-key.pem', 'utf8') : process.env.KORHOGOO_KEY;
const salt = isMock ? 'test-salt' : process.env.KORHOGOO_SALT;
if (!pem || !salt) throw new Error('KORHOGOO_KEY et KORHOGOO_SALT requis');
const priv = createPrivateKey(pem);
const pubRaw = createPublicKey(priv).export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { keys: [] };
const byHash = new Map(prev.keys.map(k => [k.id, k]));
const nodes = (isMock ? mock() : await fetchSponsors()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
let next = prev.keys.reduce((m, k) => Math.max(m, k.n), 0) + 1;

for (const s of nodes) {
  const id = sha(salt + s.id).slice(0, 32);
  const cents = s.tier?.monthlyPriceInCents ?? 0;
  const rec = byHash.get(id) || { n: next++, id, since: s.createdAt.slice(0, 10) };
  Object.assign(rec, {
    name: s.privacyLevel === 'PUBLIC' && s.sponsorEntity ? s.sponsorEntity.login : null,
    tier: tierName(cents), cents, currency: 'USD',
    rhythm: s.isOneTimePayment || s.tier?.isOneTime ? 'once' : 'monthly',
    active: !!s.isActive, rack: 0,
  });
  rec.rack = Math.ceil(rec.n / RACK);
  delete rec.sig;
  rec.sig = sign(null, Buffer.from(canon(rec)), priv).toString('base64');
  byHash.set(id, rec);
}

const keys = [...byHash.values()].sort((a, b) => a.n - b.n);
const root = merkle(keys.map(k => sha(canon(k))));
const head = { root, count: keys.length, at: new Date().toISOString().slice(0, 10) };
head.sig = sign(null, Buffer.from(canon({ root, count: keys.length, at: head.at })), priv).toString('base64');
writeFileSync(OUT, JSON.stringify({ v: 1, pub: pubRaw, rack: RACK, head, keys }, null, 1) + '\n');
writeFileSync('kave/korhodesk/root.txt', root + '\n');
console.log(`${keys.length} clés, racine ${root}`);
