/* =====================================================================
   PUSH NOTIFICATIONS · the sender.  A Cloudflare Worker (free tier).

   The site is static, so something off-site has to sign and encrypt a
   Web Push message. This is it: about 300 lines, no dependencies, running
   on Cloudflare's free Workers plan with one KV namespace for the device
   subscriptions. Deployed once with `npx wrangler deploy` from this
   folder — the five steps are in /shared/site.html and in README.md.

   It holds exactly ONE secret: the VAPID private key (env.VAPID_PRIVATE_JWK),
   which is what proves to Apple's and Google's push services that a
   message comes from this site. It holds no Firebase credential — the
   database is only ever read anonymously, through the same world-readable
   paths the student pages use, and anything an instructor asks it to do
   is authorised by a Firebase ID token that it verifies itself (RS256
   against Google's published JWKs, issuer and audience checked, email on
   the allow-list).

   Two directions, five endpoints:

     instructor devices (Jan Erik's Mac and iPhone)
       POST /subscribe     { sub, ua }           Bearer  → stored under  ins:<hash>
       POST /unsubscribe   { id }                Bearer
       GET  /subs                                Bearer  → the device list
       POST /test          { }                   Bearer  → a test push to every instructor device
       POST /notify        { ns, tid, id }       OPEN    ← chat.js, after a STUDENT message is
                                                           stored. Verified: the worker reads the
                                                           message itself from the database and
                                                           only then pushes — so the endpoint can
                                                           be public without being a spam cannon.
     student devices
       POST /student/subscribe   { ns, sid, sub, ua }   OPEN  → stu:<ns>:<sid>:<hash>. The sid must
                                                               exist in <ns> and the ns in courses.json.
       POST /student/unsubscribe { ns, sid, endpoint }  OPEN
       POST /send  { kind:'announce', ns, course }                Bearer → every device in <ns>
       POST /send  { kind:'reply',    ns, course, tid }           Bearer → dm-<sid>: that student;
                                                                           all: everyone; g-<slug>: members
     GET /vapid → { key }   the public key a browser needs to subscribe.

   What a student's push NEVER carries: the text of a direct message. A
   device can be registered for any sid that exists (students have no
   login — the same residual the site documents for <ns>/<sid>), so a DM
   push says "your instructor replied" and links to the course; the text is
   read on the site. Announcements and cohort-thread messages are public to
   the cohort already and are quoted.

   Crypto is RFC 8291 (aes128gcm) + RFC 8292 (VAPID), WebCrypto only;
   test.mjs checks the encryption against the RFC's own Appendix A vector.
   ===================================================================== */

const PROJECT = 'teaching-70f1c';
const DB      = 'https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
const SITE    = 'https://janerikmeidell.com';
const SUBJECT = 'mailto:janerik.meidell@gmail.com';     /* VAPID contact — who to call about abuse */
const ALLOW   = ['janerik.meidell@gmail.com', 'presence@janerikmeidell.com'];
const ORIGINS = /^https:\/\/(www\.)?janerikmeidell\.com$|^http:\/\/localhost(:\d+)?$|^http:\/\/127\.0\.0\.1(:\d+)?$/;
const MAX_SENDS_PER_HOUR   = 120;   /* pushes to the instructor, site-wide */
const MAX_STUDENT_SUBS_IP  = 20;    /* new student subscriptions per IP per hour */
const PUSH_TTL             = 86400; /* seconds a push service keeps an undelivered message */

/* ---------------------------------------------------------------- */
/* bytes and base64url                                               */
/* ---------------------------------------------------------------- */
const enc = (s) => new TextEncoder().encode(s);
const dec = (b) => new TextDecoder().decode(b);
export function b64u(bytes){ let s=''; for(const b of new Uint8Array(bytes)) s+=String.fromCharCode(b); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
export function b64d(str){ str=String(str).replace(/-/g,'+').replace(/_/g,'/'); while(str.length%4) str+='='; const s=atob(str); const out=new Uint8Array(s.length); for(let i=0;i<s.length;i++) out[i]=s.charCodeAt(i); return out; }
function concat(...parts){ let n=0; for(const p of parts) n+=p.length; const out=new Uint8Array(n); let o=0; for(const p of parts){ out.set(p,o); o+=p.length; } return out; }
function u32be(n){ return new Uint8Array([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]); }
async function sha256hex(s){ const h=await crypto.subtle.digest('SHA-256',enc(s)); return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32); }

/* ---------------------------------------------------------------- */
/* RFC 8291 · message encryption (aes128gcm)                         */
/* ---------------------------------------------------------------- */
async function hkdf(salt, ikm, info, len){
  const k=await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt,info}, k, len*8));
}
/* `test` injects the application-server key pair and the salt so the
   RFC's Appendix A vector can be reproduced; production draws both fresh
   for every message. */
export async function encrypt(plaintext, p256dh, auth, test){
  const uaPub = b64d(p256dh);                       /* 65 bytes, uncompressed point */
  const authSecret = b64d(auth);                    /* 16 bytes */
  if(uaPub.length!==65 || authSecret.length!==16) throw new Error('bad subscription keys');
  const uaKey = await crypto.subtle.importKey('raw', uaPub, {name:'ECDH',namedCurve:'P-256'}, false, []);
  let asPriv, asPub;
  if(test){
    asPriv = await crypto.subtle.importKey('jwk', test.asJwk, {name:'ECDH',namedCurve:'P-256'}, false, ['deriveBits']);
    asPub  = concat(new Uint8Array([4]), b64d(test.asJwk.x), b64d(test.asJwk.y));
  }else{
    const kp = await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'}, true, ['deriveBits']);
    asPriv = kp.privateKey;
    asPub  = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  }
  const shared = new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH', public: uaKey}, asPriv, 256));
  const salt   = test ? b64d(test.salt) : crypto.getRandomValues(new Uint8Array(16));
  const ikm    = await hkdf(authSecret, shared, concat(enc('WebPush: info\0'), uaPub, asPub), 32);
  const cek    = await hkdf(salt, ikm, enc('Content-Encoding: aes128gcm\0'), 16);
  const nonce  = await hkdf(salt, ikm, enc('Content-Encoding: nonce\0'), 12);
  const record = concat(enc(plaintext), new Uint8Array([2]));      /* 0x02 = last record, no padding */
  const key    = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct     = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv:nonce}, key, record));
  const header = concat(salt, u32be(4096), new Uint8Array([asPub.length]), asPub);
  return concat(header, ct);
}

/* ---------------------------------------------------------------- */
/* RFC 8292 · VAPID                                                  */
/* ---------------------------------------------------------------- */
let VAPID = null;   /* {priv: CryptoKey, pub: base64url raw point} — per isolate */
async function vapid(env){
  if(VAPID) return VAPID;
  if(!env.VAPID_PRIVATE_JWK) throw new Error('VAPID_PRIVATE_JWK secret is not set');
  const jwk = JSON.parse(env.VAPID_PRIVATE_JWK);
  const priv = await crypto.subtle.importKey('jwk', jwk, {name:'ECDSA',namedCurve:'P-256'}, false, ['sign']);
  const pub  = b64u(concat(new Uint8Array([4]), b64d(jwk.x), b64d(jwk.y)));
  VAPID = {priv, pub};
  return VAPID;
}
async function vapidHeader(env, endpoint){
  const v = await vapid(env);
  const aud = new URL(endpoint).origin;
  const now = Math.floor(Date.now()/1000);
  const h = b64u(enc(JSON.stringify({typ:'JWT',alg:'ES256'})));
  const p = b64u(enc(JSON.stringify({aud, exp: now+12*3600, sub: SUBJECT})));
  const sig = await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'}, v.priv, enc(h+'.'+p));   /* raw r||s, what JWS wants */
  return 'vapid t='+h+'.'+p+'.'+b64u(sig)+', k='+v.pub;
}

/* one push to one device. Resolves to the HTTP status; 404/410 mean the
   subscription is dead and the caller deletes it. */
async function sendPush(env, sub, payload){
  const body = await encrypt(JSON.stringify(payload), sub.keys.p256dh, sub.keys.auth);
  const r = await fetch(sub.endpoint, {
    method:'POST',
    headers:{
      'Authorization': await vapidHeader(env, sub.endpoint),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'TTL': String(PUSH_TTL),
      'Urgency': 'high',
      'Topic': String(payload.tag||'jem').replace(/[^A-Za-z0-9_-]/g,'').slice(0,32) || 'jem'
    },
    body
  });
  return r.status;
}

/* ---------------------------------------------------------------- */
/* Firebase ID token verification (RS256 against Google's JWKs)      */
/* ---------------------------------------------------------------- */
let JWKS=null, JWKS_AT=0;
async function jwks(force){
  if(JWKS && !force && Date.now()-JWKS_AT < 3600e3) return JWKS;
  const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  JWKS = await r.json(); JWKS_AT = Date.now();
  return JWKS;
}
async function verifyIdToken(tok){
  const parts = String(tok||'').split('.');
  if(parts.length!==3) throw new Error('not a token');
  const header = JSON.parse(dec(b64d(parts[0])));
  const claims = JSON.parse(dec(b64d(parts[1])));
  if(header.alg!=='RS256') throw new Error('alg');
  let keys = await jwks(false);
  let k = (keys.keys||[]).find(x=>x.kid===header.kid);
  if(!k){ keys = await jwks(true); k = (keys.keys||[]).find(x=>x.kid===header.kid); }
  if(!k) throw new Error('unknown key');
  const key = await crypto.subtle.importKey('jwk', {kty:'RSA', n:k.n, e:k.e}, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64d(parts[2]), enc(parts[0]+'.'+parts[1]));
  if(!ok) throw new Error('bad signature');
  const now = Math.floor(Date.now()/1000);
  if(claims.iss!=='https://securetoken.google.com/'+PROJECT) throw new Error('issuer');
  if(claims.aud!==PROJECT) throw new Error('audience');
  if(!(claims.exp>now)) throw new Error('expired');
  if(!claims.sub) throw new Error('subject');
  if(ALLOW.indexOf(claims.email)<0) throw new Error('not an instructor');
  return claims.email;
}

/* ---------------------------------------------------------------- */
/* storage helpers (KV)                                              */
/* ---------------------------------------------------------------- */
async function listKeys(env, prefix){
  const out=[]; let cursor;
  do{ const r=await env.SUBS.list({prefix, cursor}); out.push(...r.keys.map(k=>k.name)); cursor=r.list_complete?null:r.cursor; }while(cursor);
  return out;
}
async function getAll(env, prefix){
  const names = await listKeys(env, prefix);
  const subs = await Promise.all(names.map(async n=>{ const v=await env.SUBS.get(n,'json'); return v?{key:n, ...v}:null; }));
  return subs.filter(Boolean);
}
async function bump(env, name, max, ttl){
  const n = Number(await env.SUBS.get(name))||0;
  if(n>=max) return false;
  await env.SUBS.put(name, String(n+1), {expirationTtl: ttl||3600});
  return true;
}
function hourKey(){ return Math.floor(Date.now()/3600e3); }

/* push one payload to a set of subscriptions; prune the dead ones */
async function fanOut(env, subs, payload){
  let sent=0, dead=0, failed=0;
  await Promise.all(subs.map(async s=>{
    try{
      const st = await sendPush(env, s, payload);
      if(st===404||st===410){ dead++; await env.SUBS.delete(s.key); }
      else if(st>=200&&st<300) sent++;
      else failed++;
    }catch(e){ failed++; }
  }));
  return {sent, dead, failed, devices: subs.length};
}

/* ---------------------------------------------------------------- */
/* the database, read anonymously                                    */
/* ---------------------------------------------------------------- */
async function dbGet(path){
  const r = await fetch(DB+'/'+path+'.json', {headers:{'Accept':'application/json'}});
  if(!r.ok) return null;
  return r.json();
}
let REG=null, REG_AT=0;
async function registry(){
  if(REG && Date.now()-REG_AT<3600e3) return REG;
  const r = await fetch(SITE+'/courses.json', {headers:{'Accept':'application/json'}});
  REG = await r.json(); REG_AT = Date.now();
  return REG;
}
async function courseOfNs(ns){
  const reg = await registry();
  return (reg.courses||[]).find(c=>c.ns===ns) || null;
}
function title(c, ns){ return c ? ((c.title&&(c.title[c.lang]||c.title.en||c.title.fr))||c.code||c.id) : ns; }
function homeOf(c){ return c ? SITE+'/'+encodeURI(String(c.home||'')) : SITE+'/'; }
function okSub(sub){ return sub && typeof sub.endpoint==='string' && /^https:\/\//.test(sub.endpoint) && sub.endpoint.length<2000 && sub.keys && typeof sub.keys.p256dh==='string' && typeof sub.keys.auth==='string'; }
const SLUG = /^[a-z0-9][a-z0-9-]{0,80}$/;

/* ---------------------------------------------------------------- */
/* HTTP                                                              */
/* ---------------------------------------------------------------- */
function cors(req){
  const o = req.headers.get('Origin')||'';
  const h = {'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Max-Age':'86400','Vary':'Origin'};
  if(ORIGINS.test(o)) h['Access-Control-Allow-Origin']=o;
  return h;
}
function json(req, status, obj){ return new Response(JSON.stringify(obj), {status, headers:{'Content-Type':'application/json', 'Cache-Control':'no-store', ...cors(req)}}); }
async function body(req){ try{ return await req.json(); }catch(e){ return {}; } }
async function instructor(req){
  const m = /^Bearer\s+(.+)$/.exec(req.headers.get('Authorization')||'');
  if(!m) throw new Error('no token');
  return verifyIdToken(m[1].trim());
}

export default {
  async fetch(req, env){
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/,'') || '/';
    if(req.method==='OPTIONS') return new Response(null,{status:204, headers:cors(req)});

    try{
      /* ---- public ---- */
      if(path==='/' && req.method==='GET') return json(req,200,{ok:true, service:'teaching-push', endpoints:['/vapid','/subscribe','/unsubscribe','/subs','/test','/notify','/send','/student/subscribe','/student/unsubscribe']});
      if(path==='/vapid' && req.method==='GET'){ const v=await vapid(env); return json(req,200,{key:v.pub}); }

      /* ---- a student wrote to the instructor (from chat.js, after the write) ---- */
      if(path==='/notify' && req.method==='POST'){
        const b = await body(req);
        const ns=String(b.ns||''), tid=String(b.tid||''), id=String(b.id||'');
        if(!SLUG.test(ns) || !/^[A-Za-z0-9_-]{1,80}$/.test(tid) || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return json(req,400,{error:'bad request'});
        if(/^(p-|sg-)/.test(tid)) return json(req,200,{skipped:'peer thread'});
        const c = await courseOfNs(ns); if(!c) return json(req,404,{error:'unknown course'});
        /* dedupe, then verify the message really exists and is a student's */
        const seenKey = 'seen:'+ns+':'+tid+':'+id;
        if(await env.SUBS.get(seenKey)) return json(req,200,{skipped:'already sent'});
        await env.SUBS.put(seenKey,'1',{expirationTtl:3600});
        const msg = await dbGet(ns+'/_chat/'+encodeURIComponent(tid)+'/msgs/'+encodeURIComponent(id));
        if(!msg || msg.by!=='s') return json(req,404,{error:'no such student message'});
        if(Math.abs(Date.now()-Number(msg.ts||0)) > 15*60e3) return json(req,200,{skipped:'stale'});
        if(!await bump(env,'rl:ins:'+hourKey(), MAX_SENDS_PER_HOUR)) return json(req,429,{error:'rate limited'});
        const subs = await getAll(env,'ins:');
        const name = String(msg.name||msg.sid||'A student').slice(0,60);
        const where = tid.indexOf('dm-')===0 ? '' : (tid==='all' ? ' · to the cohort' : ' · in '+tid);
        const payload = {
          title: '['+(c.code||c.id)+'] '+name+where,
          body: String(msg.txt||'').slice(0,160),
          url: SITE+'/shared/chat.html?course='+encodeURIComponent(c.id)+'&t='+encodeURIComponent(tid),
          tag: 'msg-'+ns+'-'+tid
        };
        return json(req,200, await fanOut(env, subs, payload));
      }

      /* ---- a student's device subscribes / unsubscribes ---- */
      if(path==='/student/subscribe' && req.method==='POST'){
        const b = await body(req);
        const ns=String(b.ns||''), sid=String(b.sid||'');
        if(!SLUG.test(ns) || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(sid) || !okSub(b.sub)) return json(req,400,{error:'bad request'});
        const c = await courseOfNs(ns); if(!c) return json(req,404,{error:'unknown course'});
        const ip = req.headers.get('CF-Connecting-IP')||'0';
        if(!await bump(env,'rl:sub:'+(await sha256hex(ip))+':'+hourKey(), MAX_STUDENT_SUBS_IP)) return json(req,429,{error:'too many subscriptions from this network — try again in an hour'});
        const node = await dbGet(ns+'/'+encodeURIComponent(sid)+'/name');
        if(!node) return json(req,404,{error:'no such student in this course — sign in on the course page first'});
        const id = await sha256hex(b.sub.endpoint);
        await env.SUBS.put('stu:'+ns+':'+sid+':'+id, JSON.stringify({endpoint:b.sub.endpoint, keys:{p256dh:b.sub.keys.p256dh, auth:b.sub.keys.auth}, ua:String(b.ua||'').slice(0,160), ts:Date.now()}));
        return json(req,200,{ok:true, id, course:title(c,ns)});
      }
      if(path==='/student/unsubscribe' && req.method==='POST'){
        const b = await body(req);
        const ns=String(b.ns||''), sid=String(b.sid||''), ep=String(b.endpoint||'');
        if(!SLUG.test(ns) || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(sid) || !ep) return json(req,400,{error:'bad request'});
        await env.SUBS.delete('stu:'+ns+':'+sid+':'+(await sha256hex(ep)));
        return json(req,200,{ok:true});
      }

      /* ---- everything below needs the instructor's signed-in token ---- */
      const who = await instructor(req);

      if(path==='/subscribe' && req.method==='POST'){
        const b = await body(req);
        if(!okSub(b.sub)) return json(req,400,{error:'bad subscription'});
        const id = await sha256hex(b.sub.endpoint);
        await env.SUBS.put('ins:'+id, JSON.stringify({endpoint:b.sub.endpoint, keys:{p256dh:b.sub.keys.p256dh, auth:b.sub.keys.auth}, ua:String(b.ua||'').slice(0,160), label:String(b.label||'').slice(0,60), by:who, ts:Date.now()}));
        return json(req,200,{ok:true,id});
      }
      if(path==='/unsubscribe' && req.method==='POST'){
        const b = await body(req);
        const id = String(b.id||'').replace(/[^a-f0-9]/g,'').slice(0,32);
        if(!id) return json(req,400,{error:'bad id'});
        await env.SUBS.delete('ins:'+id);
        return json(req,200,{ok:true});
      }
      if(path==='/subs' && req.method==='GET'){
        const subs = await getAll(env,'ins:');
        const stu = await listKeys(env,'stu:');
        const perNs = {};
        stu.forEach(k=>{ const ns=k.split(':')[1]; perNs[ns]=(perNs[ns]||0)+1; });
        return json(req,200,{devices: subs.map(s=>({id:s.key.slice(4), ua:s.ua, label:s.label, ts:s.ts, host:new URL(s.endpoint).hostname})), students: perNs});
      }
      if(path==='/test' && req.method==='POST'){
        const subs = await getAll(env,'ins:');
        const payload = {title:'Test · janerikmeidell.com', body:'If you can read this, push notifications reach this device.', url:SITE+'/shared/site.html', tag:'test'};
        return json(req,200, await fanOut(env, subs, payload));
      }

      /* ---- the instructor did something students should hear about ---- */
      if(path==='/send' && req.method==='POST'){
        const b = await body(req);
        const ns=String(b.ns||''), kind=String(b.kind||'');
        if(!SLUG.test(ns)) return json(req,400,{error:'bad ns'});
        const c = await courseOfNs(ns); if(!c) return json(req,404,{error:'unknown course'});
        let subs=[], payload=null;
        if(kind==='announce'){
          const a = await dbGet(ns+'/_announce');
          if(!a || !a.on || !a.text) return json(req,404,{error:'no announcement is on'});
          subs = await getAll(env,'stu:'+ns+':');
          payload = {title:title(c,ns), body:String(a.text).slice(0,180), url:homeOf(c), tag:'announce-'+ns};
        }else if(kind==='reply'){
          const tid=String(b.tid||'');
          if(!/^[A-Za-z0-9_-]{1,80}$/.test(tid) || /^(p-|sg-)/.test(tid)) return json(req,400,{error:'bad thread'});
          if(tid.indexOf('dm-')===0){
            subs = await getAll(env,'stu:'+ns+':'+tid.slice(3)+':');
            payload = {title:title(c,ns), body:'Your instructor replied to your message.', url:homeOf(c), tag:'dm-'+ns};
          }else if(tid==='all'){
            subs = await getAll(env,'stu:'+ns+':');
            payload = {title:title(c,ns)+' · message to the class', body:String(b.text||'New message from your instructor.').slice(0,160), url:homeOf(c), tag:'all-'+ns};
          }else{
            const meta = await dbGet(ns+'/_chat/'+encodeURIComponent(tid)+'/meta');
            const members = meta&&meta.members ? (Array.isArray(meta.members)?meta.members:Object.keys(meta.members)) : [];
            const all = await getAll(env,'stu:'+ns+':');
            subs = all.filter(s=>members.indexOf(s.key.split(':')[2])>=0);
            payload = {title:title(c,ns)+' · '+String((meta&&meta.title)||'your group'), body:String(b.text||'New message from your instructor.').slice(0,160), url:homeOf(c), tag:'g-'+ns};
          }
        }else return json(req,400,{error:'unknown kind'});
        return json(req,200, await fanOut(env, subs, payload));
      }

      return json(req,404,{error:'no such endpoint'});
    }catch(e){
      const msg = String(e&&e.message||e);
      const auth = /token|signature|issuer|audience|expired|subject|instructor|unknown key|alg/.test(msg);
      return json(req, auth?401:500, {error: msg});
    }
  }
};
