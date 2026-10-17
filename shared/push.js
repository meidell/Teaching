/* =====================================================================
   PUSH NOTIFICATIONS · the browser side, shared by the instructor's
   settings (/shared/site.html), the student page
   (/shared/notifications.html) and the nudge strip (/shared/push-nudge.js).

   Reads `_site/push = {on, url, key, ts}` from the ROOT of the database
   (world-readable, instructor-write): `url` is the sender — the
   Cloudflare Worker in /push/ — and `key` its VAPID public key, which a
   browser must present when it subscribes. Registers /sw.js, asks for
   permission, subscribes, and talks to the worker. Knows nothing about
   WHO is subscribing; the pages pass that in.

       JEMPush.cfg()            → Promise<{on,url,key}|null>
       JEMPush.supported()      → can this browser do Web Push at all
       JEMPush.platform()       → {ios, android, mac, standalone, inApp, ...}
       JEMPush.needsInstall()   → true on an iPhone/iPad that is not yet on the Home Screen
       JEMPush.current()        → Promise<PushSubscription|null>
       JEMPush.subscribe()      → Promise<PushSubscription>   (asks permission)
       JEMPush.unsubscribe()    → Promise<bool>
       JEMPush.post(path, body, token?) → Promise<json>       (to the worker)
       JEMPush.remember(ns, on) / JEMPush.remembered()        the per-device record the nudge reads

   ⚠ iOS: web push works ONLY from a site added to the Home Screen, and
   the Home Screen "app" has its own storage — a student is signed out
   there until they sign in again. needsInstall() is what every page
   checks before promising anything.
   ===================================================================== */
window.JEMPush = (function(){
  "use strict";
  var DB = 'https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
  var SW = '/sw.js', FLAG = 'jem_push_subs';
  var CFG = null;

  function cfg(force){
    if(CFG && !force) return CFG;
    CFG = fetch(DB+'/_site/push.json',{cache:'no-cache'}).then(function(r){return r.json();})
      .then(function(j){ return (j && !j.error) ? j : null; }).catch(function(){ return null; });
    return CFG;
  }
  function supported(){
    return typeof window!=='undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && typeof Notification.requestPermission==='function';
  }
  function platform(){
    var ua = navigator.userAgent||'';
    var ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints>1);
    var ios = /iPhone|iPod/.test(ua) || ipad;
    var standalone = (navigator.standalone===true) || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    var inApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat|TikTok|wv\)/.test(ua);
    return {
      ios: ios, ipad: ipad, android: /Android/.test(ua), mac: /Macintosh/.test(ua) && !ipad, windows: /Windows/.test(ua),
      safari: /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg/.test(ua), firefox: /Firefox|FxiOS/.test(ua), chrome: /Chrome|CriOS/.test(ua) && !/Edg/.test(ua),
      standalone: standalone, inApp: inApp
    };
  }
  function needsInstall(){ var p=platform(); return p.ios && !p.standalone; }
  function reg(){
    return navigator.serviceWorker.register(SW,{scope:'/'}).then(function(){ return navigator.serviceWorker.ready; });
  }
  function current(){
    if(!supported()) return Promise.resolve(null);
    return reg().then(function(r){ return r.pushManager.getSubscription(); }).catch(function(){ return null; });
  }
  function u8(b64){
    var s=String(b64).replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4)s+='=';
    var raw=atob(s), out=new Uint8Array(raw.length); for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i); return out;
  }
  /* The permission prompt is the FIRST thing that happens, synchronously
     in the click that called this: Safari drops a request that arrives
     after an await, and then the button appears to do nothing. */
  function subscribe(){
    if(!supported()) return Promise.reject(new Error('unsupported'));
    var perm;
    try{ perm = Notification.permission==='granted' ? Promise.resolve('granted') : Promise.resolve(Notification.requestPermission()); }
    catch(e){ perm = new Promise(function(res){ Notification.requestPermission(res); }); }   /* the old callback form */
    var C;
    return perm.then(function(pm){
      if(pm!=='granted') throw new Error('denied');
      return cfg();
    }).then(function(c){
      if(!c || !c.url || !c.key) throw new Error('notconfigured');
      if(!c.on) throw new Error('off');
      C=c; return reg();
    }).then(function(r){
      return r.pushManager.getSubscription().then(function(s){
        if(s) return s;
        return r.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:u8(C.key)});
      });
    });
  }
  function unsubscribe(){
    return current().then(function(s){ return s ? s.unsubscribe() : false; });
  }
  function post(path, body, token){
    return cfg().then(function(c){
      if(!c || !c.url) throw new Error('notconfigured');
      var h={'Content-Type':'application/json'}; if(token) h['Authorization']='Bearer '+token;
      return fetch(c.url.replace(/\/+$/,'')+path,{method:'POST',headers:h,body:JSON.stringify(body||{})});
    }).then(function(r){
      return r.json().catch(function(){return {};}).then(function(j){ if(!r.ok) throw new Error(j.error||('HTTP '+r.status)); return j; });
    });
  }
  function get(path, token){
    return cfg().then(function(c){
      if(!c || !c.url) throw new Error('notconfigured');
      var h={}; if(token) h['Authorization']='Bearer '+token;
      return fetch(c.url.replace(/\/+$/,'')+path,{headers:h});
    }).then(function(r){
      return r.json().catch(function(){return {};}).then(function(j){ if(!r.ok) throw new Error(j.error||('HTTP '+r.status)); return j; });
    });
  }
  /* the device's own record of what it subscribed to — a nudge-hiding
     convenience, not the truth (the worker's KV is the truth) */
  function remembered(){ try{ return JSON.parse(localStorage.getItem(FLAG)||'{}'); }catch(e){ return {}; } }
  function remember(ns, on){
    var m=remembered(); if(on) m[ns]=Date.now(); else delete m[ns];
    try{ localStorage.setItem(FLAG, JSON.stringify(m)); }catch(e){}
  }
  /* why subscribe() failed, in words a page can show */
  function explain(e, lang){
    var m=String(e&&e.message||e), fr=lang==='fr';
    if(m==='unsupported') return fr?'Ce navigateur ne sait pas recevoir de notifications. Sur iPhone, ouvrez la page dans Safari ; sur ordinateur, Chrome, Edge, Firefox ou Safari 16+.':'This browser cannot receive push notifications. On an iPhone open the page in Safari; on a computer use Chrome, Edge, Firefox or Safari 16 or later.';
    if(m==='notconfigured') return fr?'Les notifications ne sont pas encore installées côté site.':'Notifications are not set up on the site yet.';
    if(m==='off') return fr?'Les notifications sont désactivées pour le moment.':'Notifications are switched off at the moment.';
    if(m==='denied') return fr?'Autorisation refusée. Réactivez-la dans les réglages du navigateur pour ce site, puis réessayez.':'Permission was refused. Allow notifications for this site in the browser settings, then try again.';
    return m;
  }
  return {cfg:cfg, supported:supported, platform:platform, needsInstall:needsInstall, reg:reg, current:current,
          subscribe:subscribe, unsubscribe:unsubscribe, post:post, get:get, remember:remember, remembered:remembered, explain:explain, u8:u8};
})();
