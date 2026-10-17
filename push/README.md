# Push notifications — the sender

The site is static, so the one thing it cannot do by itself is *send* a push
notification: somebody has to sign the message (VAPID) and encrypt it for the
device (RFC 8291). `worker.js` does that, as a Cloudflare Worker on the free
plan. Nothing else of ours runs off-site.

What it holds: **one secret**, the VAPID private key. No Firebase credential —
it reads the database anonymously through the same world-readable paths the
student pages use, and verifies the instructor's Firebase ID token itself
before accepting a device or sending to a cohort.

## Deploy (once, about ten minutes)

From this folder, in a terminal:

```
npx wrangler login                        # opens the browser; a free Cloudflare account is enough
npx wrangler kv namespace create SUBS     # prints an id — paste it into wrangler.toml
node keys.mjs                             # prints VAPID_PRIVATE_JWK; copy the JSON line
npx wrangler secret put VAPID_PRIVATE_JWK # paste it when asked
npx wrangler deploy                       # prints the worker URL, https://teaching-push.<you>.workers.dev
```

Then on **/shared/site.html** → *Push notifications*: paste the worker URL,
**Save** (the page fetches the public key from `/vapid` and stores both in
`_site/push`), switch it **on**, press **Enable on this device**, then **Send
a test**. The `_site/push` rules block in `firebase-database-rules.json` must
be deployed first, like every other rules change.

To change the code later: edit `worker.js`, `npx wrangler deploy` again. The
URL does not change. `node test.mjs` checks the encryption against the RFC's
own test vector and should print `OK` twice.

## Who gets what

| Event | Who is pushed | Carries the text? |
|---|---|---|
| a student writes to the instructor (`chat.js`) | the instructor's devices | yes |
| the instructor posts an announcement (`admin2.html`) | every subscribed student of that course | yes (it is public) |
| the instructor replies in a DM (`chat.html`) | that one student | **no** — "your instructor replied" |
| the instructor writes to the cohort or a group | those students | yes |

A student's device can be registered for any `sid` that exists in the course —
students have no login, the same residual the site documents for `<ns>/<sid>` —
which is why a DM push never carries the message.

## Files

- `worker.js` — the sender. Endpoints are listed at the top of the file.
- `wrangler.toml` — name, entry point, the KV binding.
- `keys.mjs` — generates the VAPID key pair.
- `test.mjs` — RFC 8291 Appendix A check; `node test.mjs`.
- `/sw.js` (site root) — the receiving half; shows the notification.
- `/shared/push.js` — the browser helper the three pages share.
- `/shared/notifications.html` — the student's set-up page.
- `/shared/push-nudge.js` — the strip on hubs and landing pages that points to it.
