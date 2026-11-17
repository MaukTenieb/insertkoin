// Génère la paire de clés Korhogoo. La clé privée va dans le secret KORHOGOO_KEY du dépôt.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
const { privateKey } = generateKeyPairSync('ed25519');
console.log(privateKey.export({ format: 'pem', type: 'pkcs8' }));
console.log('KORHOGOO_SALT=' + randomBytes(24).toString('base64url'));
