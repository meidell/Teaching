/* =====================================================================
   SERVICE WORKER · receives push notifications (1 Nov 2026).
   Scope: the whole site — it sits at the web root for that one reason:
   a browser shows a push notification only from a service worker, and a
   service worker covers only the paths at or below where it is served.

   It has NO fetch handler: it caches nothing, intercepts nothing, and
   every page loads exactly as it did before it was registered. Delete
   this file and nothing on the site changes except that notifications
   stop arriving.

   The payload is written by the sender (Teaching App/sender/worker.js):
   {title, body, url, tag}. An empty push still shows a generic
   notification, because iOS revokes a subscription whose pushes show
   nothing. Registered by /shared/webpush.js.
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
