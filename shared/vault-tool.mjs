#!/usr/bin/env node
/* The local half of /shared/vault.js — see the comment at the top of that file.

     node shared/vault-tool.mjs key                  print the file key (creates _private/vault.key once)
     node shared/vault-tool.mjs encrypt <in> <out>   encrypt a file with it → <out> (commit that, never <in>)

   The file key is in _private/ (never committed). Paste it once into
   /admin/ → "Downloads password" so the admin page can set the password.
   Same format as vault.js: "JEMV1" · iv(12) · AES-256-GCM ciphertext+tag. */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { randomBytes, createCipheriv } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEYFILE = join(ROOT, '_private', 'vault.key');

function fileKey() {
  if (!existsSync(KEYFILE)) {
    mkdirSync(dirname(KEYFILE), { recursive: true });
    writeFileSync(KEYFILE, randomBytes(32).toString('base64') + '\n', { mode: 0o600 });
    console.error('Created ' + KEYFILE);
  }
  const k = Buffer.from(readFileSync(KEYFILE, 'utf8').trim(), 'base64');
  if (k.length !== 32) throw new Error('vault.key is not 32 bytes');
  return k;
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'key') {
  console.log(fileKey().toString('base64'));
} else if (cmd === 'encrypt' && a && b) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', fileKey(), iv);
  const ct = Buffer.concat([c.update(readFileSync(a)), c.final(), c.getAuthTag()]);
  writeFileSync(b, Buffer.concat([Buffer.from('JEMV1'), iv, ct]));
  console.log(b + '  (' + ct.length + ' bytes)');
} else {
  console.error('usage: vault-tool.mjs key | encrypt <in> <out>');
  process.exit(1);
}
