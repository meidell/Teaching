// Generates the VAPID key pair for the push sender. Run once:  node keys.mjs
// Prints the private key as a JWK (paste it into `npx wrangler secret put
// VAPID_PRIVATE_JWK`) and the public key the browsers use (the worker also
// serves it at /vapid, so you do not need to copy it anywhere).
import { webcrypto as crypto } from 'node:crypto';
const kp = await crypto.subtle.generateKey({name:'ECDSA', namedCurve:'P-256'}, true, ['sign','verify']);
const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
const priv = {kty:'EC', crv:'P-256', x:jwk.x, y:jwk.y, d:jwk.d};
const raw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
const b64u = (b)=>Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
console.log('VAPID_PRIVATE_JWK (keep secret — this is the one secret the worker holds):');
console.log(JSON.stringify(priv));
console.log('\nVAPID public key (served by the worker at /vapid; nothing to copy):');
console.log(b64u(raw));
