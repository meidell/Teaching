// Offline check of the encryption against RFC 8291 Appendix A.  node test.mjs
import { encrypt, b64u, b64d } from './worker.js';
const asPriv = 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw';
const asPub  = 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
const uaPub  = 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4';
const auth   = 'BTBZMqHH6r4Tts7J_aSIgg';
const salt   = 'DGv6ra1nlYgDCS1FRnbzlw';
const header = 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
const cipher = '8pfeW0KbunFT06SuDKoJH9Ql87S1QUrdirN6GcG7sFz1y1sqLgVi1VhjVkHsUoEsbI_0LpXMuGvnzQ';
const pub = b64d(asPub);
const asJwk = {kty:'EC', crv:'P-256', x:b64u(pub.slice(1,33)), y:b64u(pub.slice(33,65)), d:asPriv};
const out = await encrypt('When I grow up, I want to be a watermelon', uaPub, auth, {asJwk, salt});
const gotH = b64u(out.slice(0,86)), gotC = b64u(out.slice(86));
console.log('header    ', gotH===header ? 'OK' : 'MISMATCH\n  got '+gotH+'\n  exp '+header);
console.log('ciphertext', gotC===cipher ? 'OK' : 'MISMATCH\n  got '+gotC+'\n  exp '+cipher);
if(gotH!==header||gotC!==cipher) process.exit(1);
