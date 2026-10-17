/* =====================================================================
   SHARED · talking to the push sender from an instructor page.

   The "Courses" app (iOS + Android) registers each phone's push token in
   the database; a Cloudflare Worker — the sender — turns an event on the
   site into a push. This helper is what chat.html, admin2.html and
   site.html use to ask the sender for one. Student pages do NOT load it:
   chat.js has its own three-line hook (no token needed there).

       JEMPushApp.cfg()                 → {on, url, …} from _site/push, or null
       JEMPushApp.post('/send', body, idToken)
                                        → the sender's JSON, or null when the
                                          switch is off; dead tokens it reports
                                          are deleted with the same idToken
       JEMPushApp.describe(res)         → 'pushed to 3 of 4 devices' for a status line

   Everything is best-effort: the message or announcement is already in
   the database before any of this runs, and a failure here changes
   nothing on the site.
   ===================================================================== */
window.JEMPushApp = (function () {
  "use strict";
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var CFG = null;
  /* a dead-token path is deletable only where the rules say the instructor may:
     a student's mirror under <ns>/_push, or the instructor's own list */
  var DELETABLE = /^([a-z0-9][a-z0-9-]{0,80}\/_push\/[A-Za-z0-9_.-]{1,80}\/[A-Za-z0-9_-]{1,120}|_site\/push\/instructor\/[A-Za-z0-9_-]{1,120})$/;

  function cfg(force) {
    if (CFG && !force) return CFG;
    CFG = fetch(DB + '/_site/push.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (j) { return (j && !j.error) ? j : null; })
      .catch(function () { return null; });
    return CFG;
  }
  function cleanup(dead, token) {
    if (!dead || !dead.length || !token) return Promise.resolve(0);
    var paths = dead.filter(function (p) { return DELETABLE.test(String(p)); });
    return Promise.all(paths.map(function (p) {
      return fetch(DB + '/' + p + '.json?auth=' + encodeURIComponent(token), { method: 'DELETE' }).catch(function () {});
    })).then(function () { return paths.length; });
  }
  function post(path, body, token) {
    return cfg().then(function (c) {
      if (!c || !c.on || !c.url || !/^https:\/\//.test(c.url)) return null;
      var h = { 'Content-Type': 'application/json' };
      if (token) h['Authorization'] = 'Bearer ' + token;
      return fetch(String(c.url).replace(/\/+$/, '') + path, { method: 'POST', headers: h, body: JSON.stringify(body || {}) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok && j && !j.error) j.error = 'HTTP ' + r.status; return j; }); })
        .then(function (j) {
          if (j && j.dead && j.dead.length) cleanup(j.dead, token);
          return j;
        });
    });
  }
  function describe(j) {
    if (!j) return '';
    if (j.error) return 'push: ' + j.error;
    if (j.skipped) return '';
    if (j.devices == null) return '';
    var s = 'pushed to ' + j.sent + ' of ' + j.devices + ' device' + (j.devices === 1 ? '' : 's');
    if (j.dead && j.dead.length) s += ' · ' + j.dead.length + ' stale removed';
    return s;
  }
  return { cfg: cfg, post: post, cleanup: cleanup, describe: describe, reset: function () { CFG = null; } };
})();
