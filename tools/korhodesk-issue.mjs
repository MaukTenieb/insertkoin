// KorhoDesk (protocole Kalabass) — émission ou renouvellement d'une clé.
// node tools/korhodesk-issue.mjs <étiquette> <euros> <AAAA-MM-JJ> [paypal|ln] [nom]
// euros = 0 : inscription ou correction du nom seule, sans nuit ajoutée.
// Clé privée : variable KORHOGOO_KEY (PEM) ou fichier désigné par KORHOGOO_KEY_FILE.
import { createHash, createPrivateKey, createPublicKey, sign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = 'kave/korhodesk/registry.json', RACK = 99, DAYS = 31;
const TIERS = [[99, "[K]ALEB'S ASS"], [50, '[k]ALABASS'], [10, 'KALABASS'], [5, '[K]alabass'], [1, 'kalabass']];
const sha = s => createHash('sha256').update(s).digest('hex');
const canon = o => JSON.stringify(o, Object.keys(o).sort());
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const [tagIn, eurIn, date, rail = 'paypal', nameIn = ''] = process.argv.slice(2);
const name = nameIn.normalize('NFC').replace(/[^\p{L}\p{N} ._'’-]/gu, '').trim().slice(0, 32);
const tag = (tagIn || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
if (tag.length !== 8 || !(+eurIn >= 0) || eurIn === '' || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('usage : <étiquette 8 signes> <euros> <AAAA-MM-JJ> [paypal|ln]');
const pem = process.env.KORHOGOO_KEY || readFileSync(process.env.KORHOGOO_KEY_FILE, 'utf8');
const priv = createPrivateKey(pem);
const pub = createPublicKey(priv).export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');
const reg = JSON.parse(readFileSync(OUT, 'utf8'));
if (reg.pub && reg.pub !== pub) throw new Error('clé privée étrangère au registre');
reg.pub = pub; reg.rack = RACK;
const eur = +eurIn, tier = (TIERS.find(([m]) => eur >= m) || [0, ''])[1];
let k = reg.keys.find(x => x.tag === tag);
if (eur === 0) { if (!k || !name) throw new Error('nom seul : étiquette connue et nom requis'); k.name = name; }
else if (k) { k.until = addDays(k.until > date ? k.until : date, DAYS); k.eur = Math.round((k.eur + eur) * 100) / 100; k.tier = TIERS.find(([m]) => eur >= m)[1]; k.rail = rail; }
else { const n = reg.keys.reduce((m, x) => Math.max(m, x.n), 0) + 1; k = { n, tag, tier, eur, rail, since: date, until: addDays(date, DAYS), rack: Math.ceil(n / RACK) }; reg.keys.push(k); }
if (name && eur > 0 && k.eur >= 5) k.name = name;
delete k.sig; k.sig = sign(null, Buffer.from(canon(k)), priv).toString('base64');
// chaîne : chaque clé signée scelle l'empreinte du registre précédent
const prev = reg.head ? reg.head.root : '';
let lv = reg.keys.map(x => sha(canon(x)));
while (lv.length > 1) { const nx = []; for (let i = 0; i < lv.length; i += 2) nx.push(sha(lv[i] + (lv[i + 1] ?? lv[i]))); lv = nx; }
const head = { root: sha(prev + lv[0]), prev, count: reg.keys.length, at: date };
head.sig = sign(null, Buffer.from(canon(head)), priv).toString('base64');
reg.head = head;
writeFileSync(OUT, JSON.stringify(reg, null, 1) + '\n');
writeFileSync('kave/korhodesk/root.txt', head.root + '\n');
console.log(`clé ${k.n} · ${tag} · ${k.tier} · jusqu'au ${k.until} · racine ${head.root.slice(0, 16)}`);
