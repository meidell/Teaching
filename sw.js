/* =====================================================================
   SERVICE WORKER · receives push notifications.  Scope: the whole site.

   This file exists for ONE reason: a browser can only show a push
   notification from a service worker, and a service worker can only
   cover the paths at or below where it is served — so it sits at the web
   root. It has NO fetch handler: it caches nothing, intercepts nothing,
   and every page loads exactly as it did before it was registered.

   The payload is written by push/worker.js: {title, body, url, tag}.
   An empty push (no payload) still shows a generic notification, because
   iOS revokes a subscription whose pushes show nothing.
   ===================================================================== */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function(e){
  var d = {};
  try{ d = e.data ? e.data.json() : {}; }catch(err){ try{ d = {body: e.data.text()}; }catch(e2){} }
  var title = d.title || 'janerikmeidell.com';
  var opts = {
    body: d.body || '',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(ws){
    for(var i=0;i<ws.length;i++){
      var w = ws[i];
      if('focus' in w){
        if('navigate' in w){ return w.navigate(url).then(function(x){ return (x||w).focus(); }).catch(function(){ return w.focus(); }); }
        return w.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
