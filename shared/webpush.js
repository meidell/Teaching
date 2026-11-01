/* =====================================================================
   WEB PUSH · the browser side (1 Nov 2026).
   Jan Erik: "create code asking students to accept notifications on their
   devices — so that messages pop up on their screens".

   The "Courses" app already pushes to phones through Expo. This is the
   same thing for a BROWSER — Chrome, Edge, Firefox, Safari 16+, and an
   iPhone once the page is on the Home Screen — with no app installed.
   Loaded on demand by /shared/chat.js (the student side) and by
   /shared/site.html (the instructor's own browser). Knows nothing about
   who is subscribing; the caller passes that in.

       JEMWebPush.supported()           can this browser do Web Push at all
       JEMWebPush.platform()            {ios, standalone, inApp, …}
       JEMWebPush.needsInstall()        an iPhone/iPad not yet on the Home Screen
       JEMWebPush.state()               'unsupported' | 'install' | 'denied' | 'granted' | 'default'
       JEMWebPush.cfg()                 → {on, url, key, …} from _site/push, or null
       JEMWebPush.enable(ns, sid)       ask permission → register /sw.js → subscribe →
                                        write the subscription under the student
       JEMWebPush.enableInstructor(tok) the same, under _site/webpush, with the ID token
       JEMWebPush.disable(ns, sid, tok?)
       JEMWebPush.local(title, opts)    a notification from THIS page (no push needed)
       JEMWebPush.explain(err, lang)    why it failed, in words a page can show

   WHERE A SUBSCRIPTION LIVES. A device's record is {e: endpoint, p: p256dh,
   a: auth, ua, ts, v:'web'}, keyed by a hash of the endpoint:
       <ns>/<sid>/webpush/<key>     under the student's own node ($sid rule: no change)
       <ns>/_webpush/<sid>/<key>    a world-readable mirror the sender lists
       _site/webpush/<key>          the instructor's browsers (instructor-write)
   The sender (Teaching App/sender/worker.js) signs with the site's VAPID
   key and encrypts per RFC 8291; the public key it uses is what
   `_site/push.key` holds, written from site.html. No key → nothing here
   offers to subscribe, so a half-configured site never nags a student.

   ⚠ iOS: Web Push works ONLY from a site added to the Home Screen, and
   that "app" has its own storage — a student is signed out there until
   they sign in again. needsInstall() is what the panel checks first.
   ===================================================================== */
window.JEMWebPush = (function(){
  "use strict";
  var DB = 'https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
  var SW = '/sw.js', FLAG = 'jem_webpush';
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
    return { ios:ios, ipad:ipad, android:/Android/.test(ua), standalone:standalone, inApp:inApp,
             safari:/Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg/.test(ua) };
  }
  function needsInstall(){ var p=platform(); return p.ios && !p.standalone; }
  function state(){
    if(needsInstall()) return 'install';
    if(!supported()) return 'unsupported';
    return Notification.permission;          /* granted · denied · default */
  }
  function reg(){
    return navigator.serviceWorker.register(SW,{scope:'/'}).then(function(){ return navigator.serviceWorker.ready; });
  }
  function u8(b64){
    var s=String(b64).replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4)s+='=';
    var raw=atob(s), out=new Uint8Array(raw.length); for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i); return out;
  }
  function b64u(buf){ var s='',b=new Uint8Array(buf); for(var i=0;i<b.length;i++)s+=String.fromCharCode(b[i]); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  function keyOf(endpoint){
    if(window.crypto && crypto.subtle && crypto.subtle.digest){
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint)).then(function(h){
        return Array.prototype.map.call(new Uint8Array(h).slice(0,12),function(b){return ('0'+b.toString(16)).slice(-2);}).join('');
      });
    }
    var h=2166136261; for(var i=0;i<endpoint.length;i++){ h^=endpoint.charCodeAt(i); h=Math.imul(h,16777619); }
    return Promise.resolve('f'+(h>>>0).toString(16));
  }
  function record(sub){
    var j = sub.toJSON ? sub.toJSON() : sub;
    return { e:j.endpoint, p:j.keys.p256dh, a:j.keys.auth, ua:String(navigator.userAgent||'').slice(0,160), ts:Date.now(), v:'web' };
  }
  function subscribe(){
    if(needsInstall()) return Promise.reject(new Error('install'));
    if(!supported()) return Promise.reject(new Error('unsupported'));
    return cfg().then(function(c){
      if(!c || !c.url || !c.key) throw new Error('notconfigured');
      if(!c.on) throw new Error('off');
      return Notification.requestPermission().then(function(p){
        if(p!=='granted') throw new Error('denied');
        return reg();
      }).then(function(r){
        return r.pushManager.getSubscription().then(function(s){
          if(s) return s;
          return r.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:u8(c.key)});
        });
      });
    });
  }
  function put(path, val, token){
    return fetch(DB+'/'+path+'.json'+(token?'?auth='+encodeURIComponent(token):''),{method:'PUT',body:JSON.stringify(val)})
      .then(function(r){ if(!r.ok) throw new Error('refused:'+r.status); return r.json(); });
  }
  function del(path, token){
    return fetch(DB+'/'+path+'.json'+(token?'?auth='+encodeURIComponent(token):''),{method:'DELETE'}).catch(function(){});
  }
  function remembered(){ try{ return JSON.parse(localStorage.getItem(FLAG)||'{}'); }catch(e){ return {}; } }
  function remember(scope, key){
    var m=remembered(); if(key) m[scope]={k:key,ts:Date.now()}; else delete m[scope];
    try{ localStorage.setItem(FLAG, JSON.stringify(m)); }catch(e){}
  }
  /* the student's browser: own node first (always writable), then the mirror
     (needs the _webpush rules block — reported, never swallowed) */
  function enable(ns, sid){
    if(!/^[a-z0-9][a-z0-9-]{0,80}$/.test(String(ns)) || !/^[a-z0-9_][a-z0-9-]{0,60}$/.test(String(sid))) return Promise.reject(new Error('badid'));
    return subscribe().then(function(sub){
      var rec=record(sub);
      return keyOf(rec.e).then(function(key){
        return put(ns+'/'+encodeURIComponent(sid)+'/webpush/'+key, rec)
          .then(function(){ return put(ns+'/_webpush/'+encodeURIComponent(sid)+'/'+key, rec).catch(function(e){ throw new Error('mirror:'+e.message); }); })
          .then(function(){ remember(ns, key); return {key:key, sub:sub}; });
      });
    });
  }
  function enableInstructor(token){
    if(!token) return Promise.reject(new Error('notoken'));
    return subscribe().then(function(sub){
      var rec=record(sub);
      return keyOf(rec.e).then(function(key){
        return put('_site/webpush/'+key, rec, token).then(function(){ remember('_site', key); return {key:key, sub:sub}; });
      });
    });
  }
  function current(){
    if(!supported()) return Promise.resolve(null);
    return navigator.serviceWorker.getRegistration(SW).then(function(r){ return r ? r.pushManager.getSubscription() : null; }).catch(function(){ return null; });
  }
  function disable(ns, sid, token){
    var m=remembered(), scope=ns||'_site', k=m[scope]&&m[scope].k;
    return current().then(function(s){ return s ? s.unsubscribe().catch(function(){}) : null; }).then(function(){
      remember(scope, null);
      if(!k) return;
      if(ns) return Promise.all([del(ns+'/'+encodeURIComponent(sid)+'/webpush/'+k), del(ns+'/_webpush/'+encodeURIComponent(sid)+'/'+k, token)]);
      return del('_site/webpush/'+k, token);
    });
  }
  /* a notification shown by THIS page — the poll in chat.js uses it when
     a message arrives while the tab is open but not looked at. Works
     without any sender; needs only the permission. */
  function local(title, opts){
    if(!('Notification' in window) || Notification.permission!=='granted') return Promise.resolve(false);
    opts = opts||{};
    var o = { body:opts.body||'', icon:'/assets/icon-192.png', badge:'/assets/icon-192.png', tag:opts.tag, renotify:!!opts.tag, data:{url:opts.url||location.href} };
    if('serviceWorker' in navigator){
      return navigator.serviceWorker.getRegistration(SW).then(function(r){
        if(r) return r.showNotification(title, o).then(function(){return true;});
        return reg().then(function(r2){ return r2.showNotification(title, o).then(function(){return true;}); });
      }).catch(function(){ try{ new Notification(title, o); return true; }catch(e){ return false; } });
    }
    try{ var n=new Notification(title, o); n.onclick=function(){ try{window.focus();}catch(e){} n.close(); }; return Promise.resolve(true); }catch(e){ return Promise.resolve(false); }
  }
  function explain(e, lang){
    var m=String(e&&e.message||e), fr=lang==='fr';
    if(m==='install') return fr?'Sur iPhone et iPad : Partager → « Sur l’écran d’accueil », puis ouvrez la page depuis cette icône pour activer les notifications.':'On an iPhone or iPad: Share → "Add to Home Screen", then open the page from that icon to turn notifications on.';
    if(m==='unsupported') return fr?'Ce navigateur ne reçoit pas de notifications. Essayez Chrome, Edge, Firefox ou Safari 16+.':'This browser cannot receive notifications. Try Chrome, Edge, Firefox or Safari 16 or later.';
    if(m==='notconfigured') return fr?'Les notifications ne sont pas encore activées sur le site.':'Notifications are not set up on the site yet.';
    if(m==='off') return fr?'Les notifications sont désactivées pour le moment.':'Notifications are switched off at the moment.';
    if(m==='denied') return fr?'Autorisation refusée. Autorisez les notifications pour ce site dans les réglages du navigateur, puis réessayez.':'Permission was refused. Allow notifications for this site in the browser settings, then try again.';
    if(/^mirror:/.test(m)) return fr?'Enregistré sur cet appareil, mais le serveur a refusé la copie (règles non publiées).':'Saved on this device, but the server refused the copy (rules not published).';
    return m;
  }
  return { cfg:cfg, supported:supported, platform:platform, needsInstall:needsInstall, state:state, enable:enable, enableInstructor:enableInstructor,
           disable:disable, current:current, local:local, remembered:remembered, explain:explain };
})();
