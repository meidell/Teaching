/* =====================================================================
   SHARED · link the old sign-in to an email, BEFORE a course moves to the
   new platform (3 Nov 2026).

   Jan Erik: "we need to find a solution so that they can continue from old
   to new — a big pop-up after logging in with the old (or automatically
   logged in), telling them to add their email — and if not they will not
   be able to continue (but let them nevertheless have more tries)".

   Loaded by config.js on every page of a course listed in LMS_LINK there
   (and never on a course that is already `lms:true` — lms.js does it).
   On a device that holds the OLD identity (<key>_auth with sid + password,
   from login.js), it opens a full-screen box:

     email → 6-digit code (POST /auth/start, /auth/verify)
           → POST /claim {ns, sid, pass}   (the API checks the password
             against the live Firebase roster and copies the live node)

   Afterwards the device holds the platform session (`jem_lms`, the same
   one lms.js uses), so the day the course switches nothing is asked again
   — on this device or any other, since the email is now enrolled.

   "Later" is allowed SKIPS times, each hiding the box for HIDE_H hours;
   then the box cannot be closed. It never blocks for a fault that is not
   the student's: server unreachable, the old password not verifiable,
   or a course with nothing on the platform — those let the page be used.
   A course the student already linked through another course's page is
   linked silently with the same session (no box).

   Per device: <key>_lmslink = {ok, email} | {skips, until} | {bad} | {na}.
   Never on an instructor device, never for the hidden student "_jem".
   ===================================================================== */
(function () {
  "use strict";
  var CFG = window.CourseConfig, C = CFG && CFG.current();
  if (!C || C.lms || !C.ns) return;
  var API = CFG.lmsApi(), K = C.key, SKEY = 'jem_lms', LKEY = K + '_lmslink';
  var SKIPS = 3, HIDE_H = 12;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function jget(k, d) { try { return JSON.parse(lsGet(k) || 'null') || d; } catch (e) { return d; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function instructor() {
    if (lsGet('jem_view') === 'student') return false;
    if (lsGet('jem_instructor')) return true;
    var f = jget('jem_fb_session', null); if (f && f.rt) return true;
    return /(?:^|; )jem_instructor=1/.test(document.cookie || '');
  }
  function oldAuth() { var a = jget(K + '_auth', null); return a && a.sid && a.pass != null && !a.lms && a.sid.charAt(0) !== '_' ? a : null; }
  function state() { return jget(LKEY, {}); }
  function setState(o) { lsSet(LKEY, JSON.stringify(o)); }
  function sess() { var s = jget(SKEY, null); return s && s.t ? s : null; }

  var FR = C.lang === 'fr';
  var T = FR ? {
    k: 'Important · une minute, une seule fois',
    h: 'Votre compte change : ajoutez votre e-mail',
    p: 'Le site passe bientôt à une connexion par <b>e-mail</b>, sans mot de passe. Pour garder tout ce que vous avez déjà fait — progression, réponses, quiz — reliez-le maintenant à votre e-mail. Cela vaut pour tous vos cours, sur tous vos appareils.',
    who: 'Connecté·e en ce moment :', notme: 'ce n’est pas moi',
    emailL: 'Votre e-mail', emailP: 'vous@exemple.com', send: 'Recevoir le code par e-mail',
    sent: 'Un code à 6 chiffres a été envoyé à <b>{e}</b> (regardez aussi dans les indésirables). Il est valable 10 minutes.',
    codeL: 'Le code reçu', go: 'Relier mon compte', other: 'changer d’e-mail', resend: 'renvoyer le code',
    later: 'Plus tard ({n} fois encore)', later1: 'Plus tard (une dernière fois)', must: 'Pour continuer, reliez votre compte à votre e-mail. Un problème ? Dites-le à votre enseignant.',
    okH: 'C’est fait ✓', okP: 'Votre progression dans ce cours est reliée à <b>{e}</b>. Quand le site passera au nouveau système, vous vous connecterez avec cet e-mail — et vous retrouverez tout.', cont: 'Continuer',
    taken: 'Cette progression est déjà reliée à une autre adresse e-mail. Utilisez celle-là.',
    bad: 'Votre ancien code n’a pas pu être vérifié. Vous pouvez continuer ; dites-le à votre enseignant.',
    net: 'Le serveur ne répond pas. Réessayez dans un instant — vous pouvez continuer en attendant.',
    wake: 'Le serveur démarre, un instant…', toast: '✓ Compte relié à {e}'
  } : {
    k: 'Important · one minute, once',
    h: 'Your account is changing: add your email',
    p: 'The site is moving to signing in with your <b>email</b>, no password. To keep everything you have already done — progress, answers, quizzes — link it to your email now. It covers all your courses, on all your devices.',
    who: 'Signed in right now as:', notme: 'this is not me',
    emailL: 'Your email', emailP: 'you@example.com', send: 'Email me the code',
    sent: 'A 6-digit code was sent to <b>{e}</b> (check your spam folder too). It is valid for 10 minutes.',
    codeL: 'The code you received', go: 'Link my account', other: 'use another email', resend: 'send the code again',
    later: 'Later ({n} more times)', later1: 'Later (one last time)', must: 'To continue, link your account to your email. A problem? Tell your teacher.',
    okH: 'Done ✓', okP: 'Your progress in this course is linked to <b>{e}</b>. When the site moves to the new system, you sign in with this email — and find everything.', cont: 'Continue',
    taken: 'This progress is already linked to another email address. Use that one.',
    bad: 'Your old code could not be verified. You can continue; tell your teacher.',
    net: 'The server is not answering. Try again in a moment — you can continue meanwhile.',
    wake: 'The server is starting, one moment…', toast: '✓ Account linked to {e}'
  };

  function call(method, path, body) {
    var s = sess(), h = body ? { 'Content-Type': 'application/json' } : {};
    if (s) h.Authorization = 'Bearer ' + s.t;
    var slow = setTimeout(function () { var w = document.getElementById('ll-x'); if (w && !w.textContent) w.textContent = T.wake; }, 4000);
    return fetch(API + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { clearTimeout(slow); return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.message || j.error || ('HTTP ' + r.status)); e.status = r.status; throw e; } return j; }); },
            function (e) { clearTimeout(slow); e.status = 0; throw e; });
  }

  /* ---- the claim, with what each answer means for the box ---- */
  function claim(a) {
    return call('POST', '/claim', { ns: C.ns, sid: a.sid, pass: a.pass }).then(function () {
      var s = sess(); setState({ ok: Date.now(), email: s && s.user ? s.user.email : '' }); return 'ok';
    }, function (e) {
      if (e.status === 409) return 'taken';
      if (e.status === 403) { setState({ bad: Date.now() }); return 'bad'; }
      if (e.status === 404) { setState({ na: Date.now() }); return 'na'; }
      if (e.status === 401) { try { localStorage.removeItem(SKEY); } catch (x) {} return 'again'; }
      throw e;
    });
  }

  function css() {
    if (document.getElementById('ll-css')) return;
    var acc = (C.theme && (C.theme.main || C.theme.accent)) || '#176B87';
    var s = document.createElement('style'); s.id = 'll-css';
    s.textContent =
      '#ll-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(15,25,35,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Helvetica Neue",Arial,sans-serif;}' +
      '#ll-box{background:#fff;color:#1d2731;max-width:520px;width:100%;border-radius:18px;padding:26px 26px 20px;box-shadow:0 20px 60px rgba(0,0,0,.35);border-top:6px solid ' + acc + ';max-height:calc(100vh - 32px);overflow:auto;}' +
      '#ll-box .k{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:800;color:' + acc + ';}' +
      '#ll-box h3{font-size:23px;line-height:1.2;margin:6px 0 10px;color:#14202b;}' +
      '#ll-box p{font-size:14.5px;line-height:1.55;margin:0 0 12px;color:#3b4652;}' +
      '#ll-box .who{background:#f3f6f8;border-radius:10px;padding:9px 12px;font-size:13.5px;margin-bottom:14px;}' +
      '#ll-box .who a{color:#7a8590;margin-left:6px;font-size:12px;}' +
      '#ll-box label{display:block;font-size:12px;font-weight:800;color:#5b6670;margin:4px 0 4px;}' +
      '#ll-box input{width:100%;box-sizing:border-box;border:1.5px solid #cfd7de;border-radius:10px;padding:11px 12px;font-size:16px;margin-bottom:10px;}' +
      '#ll-box input.code{letter-spacing:6px;font-size:22px;text-align:center;}' +
      '#ll-box .go{width:100%;background:' + acc + ';color:#fff;border:none;border-radius:10px;padding:13px;font-size:15px;font-weight:800;cursor:pointer;}' +
      '#ll-box .go:disabled{opacity:.6;cursor:wait;}' +
      '#ll-box .ln{background:none;border:none;color:#5b6670;font-size:13px;text-decoration:underline;cursor:pointer;margin:10px 8px 0 0;padding:0;}' +
      '#ll-box .err{min-height:18px;font-size:13px;color:#B3261E;font-weight:700;margin:2px 0 8px;}' +
      '#ll-box .must{font-size:13px;color:#8a4b00;background:#fff6e5;border-radius:8px;padding:8px 10px;margin-top:12px;}' +
      '#ll-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;background:#1f6f4a;color:#fff;border-radius:22px;padding:9px 18px;font:700 13.5px "Helvetica Neue",Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);}';
    document.head.appendChild(s);
  }
  function toast(msg) { css(); var t = document.createElement('div'); t.id = 'll-toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 4500); }

  var M = { email: '' }, A = null;
  function skipsLeft() { var s = state(); return Math.max(0, SKIPS - (s.skips || 0)); }
  function close() { var o = document.getElementById('ll-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; }
  function open(step, msg) {
    css();
    var o = document.getElementById('ll-ov');
    if (!o) { o = document.createElement('div'); o.id = 'll-ov'; o.innerHTML = '<div id="ll-box" role="dialog" aria-modal="true"></div>'; document.body.appendChild(o); }
    document.documentElement.style.overflow = 'hidden';
    var b = document.getElementById('ll-box'), left = skipsLeft(), soft = msg === T.net || msg === T.bad;
    var foot = '';
    if (step !== 'done') {
      foot = (left > 0 || soft) ? '<button class="ln" id="ll-later">' + esc(soft ? T.cont : (left === 1 ? T.later1 : T.later.replace('{n}', left))) + '</button>' : '<div class="must">' + esc(T.must) + '</div>';
    }
    var err = '<div class="err" id="ll-x">' + (msg ? esc(msg) : '') + '</div>';
    if (step === 'email') {
      b.innerHTML = '<div class="k">' + esc(T.k) + '</div><h3>' + esc(T.h) + '</h3><p>' + T.p + '</p>' +
        '<div class="who">' + esc(T.who) + ' <b>' + esc(A.name || A.sid) + '</b><a href="#" id="ll-notme">' + esc(T.notme) + '</a></div>' +
        '<label for="ll-e">' + esc(T.emailL) + '</label><input id="ll-e" type="email" autocomplete="email" placeholder="' + esc(T.emailP) + '" value="' + esc(M.email) + '">' +
        err + '<button class="go" id="ll-b">' + esc(T.send) + '</button>' + foot;
      bind('ll-b', function () {
        var e = val('ll-e'); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { say(FR ? 'Vérifiez l’adresse e-mail.' : 'Check the email address.'); return; }
        M.email = e; busy(true);
        call('POST', '/auth/start', { email: e }).then(function () { open('code'); }, fault).then(function () { busy(false); });
      });
      var nm = document.getElementById('ll-notme');
      if (nm) nm.onclick = function (ev) { ev.preventDefault(); try { localStorage.removeItem(K + '_auth'); } catch (x) {} if (window.CourseLogin && CourseLogin.logout) CourseLogin.logout(); else location.reload(); };
    } else if (step === 'code') {
      b.innerHTML = '<div class="k">' + esc(T.k) + '</div><h3>' + esc(T.h) + '</h3><p>' + T.sent.replace('{e}', esc(M.email)) + '</p>' +
        '<label for="ll-c">' + esc(T.codeL) + '</label><input id="ll-c" class="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••">' +
        err + '<button class="go" id="ll-b">' + esc(T.go) + '</button>' +
        '<button class="ln" id="ll-other">' + esc(T.other) + '</button><button class="ln" id="ll-re">' + esc(T.resend) + '</button>' + foot;
      bind('ll-b', function () {
        busy(true);
        call('POST', '/auth/verify', { email: M.email, code: val('ll-c'), name: A.name || '' }).then(function (r) {
          lsSet(SKEY, JSON.stringify({ t: r.token, user: r.user }));
          return claim(A).then(function (res) {
            if (res === 'ok') open('done');
            else if (res === 'taken') open('email', T.taken);
            else if (res === 'bad') open('email', T.bad);
            else if (res === 'again') open('email');
            else close();
          });
        }).catch(fault).then(function () { busy(false); });
      });
      document.getElementById('ll-other').onclick = function () { open('email'); };
      document.getElementById('ll-re').onclick = function () { call('POST', '/auth/start', { email: M.email }).then(function () { say(FR ? 'Nouveau code envoyé.' : 'New code sent.'); }, fault); };
    } else {
      var s = state();
      b.innerHTML = '<div class="k">' + esc(T.k) + '</div><h3>' + esc(T.okH) + '</h3><p>' + T.okP.replace('{e}', esc(s.email || M.email)) + '</p><button class="go" id="ll-b">' + esc(T.cont) + '</button>';
      bind('ll-b', close);
    }
    var lt = document.getElementById('ll-later');
    if (lt) lt.onclick = function () {
      if (!soft) { var s = state(); s.skips = (s.skips || 0) + 1; s.until = Date.now() + HIDE_H * 3600e3; setState(s); }
      close();
    };
    var f = b.querySelector('input'); if (f) setTimeout(function () { f.focus(); }, 30);
  }
  function bind(id, fn) {
    document.getElementById(id).onclick = fn;
    Array.prototype.forEach.call(document.querySelectorAll('#ll-box input'), function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') fn(); }); });
  }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function say(t) { var x = document.getElementById('ll-x'); if (x) x.textContent = t; }
  function busy(on) { var e = document.getElementById('ll-b'); if (e) e.disabled = on; }
  /* a server or network fault: say so, and let the page be used */
  function fault(e) {
    if (e && e.status) { say(e.message); return; }
    var lt = document.getElementById('ll-later');
    say(T.net);
    if (!lt) { var b = document.getElementById('ll-box'), x = document.createElement('button'); x.className = 'ln'; x.id = 'll-later'; x.textContent = T.cont; x.onclick = close; b.appendChild(x); }
  }

  /* ---- when to show it ---- */
  var shown = false;
  function check() {
    if (shown || instructor()) return;
    var a = oldAuth(); if (!a) return;
    var s = state();
    if (s.ok || s.bad || s.na) return;
    if (s.until && Date.now() < s.until) return;
    A = a; shown = true;
    if (sess()) {
      /* already signed in on the platform (another course's page): link silently */
      claim(a).then(function (res) {
        if (res === 'ok') toast(T.toast.replace('{e}', state().email));
        else if (res === 'taken' || res === 'again') open('email', res === 'taken' ? T.taken : '');
      }, function () { shown = false; });
      return;
    }
    open('email');
  }
  function start() {
    check();
    /* the old identity may arrive after load (the student signs in with login.js) */
    var n = 0, iv = setInterval(function () { if (shown || ++n > 300) { clearInterval(iv); return; } check(); }, 2000);
    window.addEventListener('storage', function (e) { if (e.key === K + '_auth') check(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 1200); });
  else setTimeout(start, 1200);
  window.CourseLink = { open: function () { A = oldAuth(); if (A) open('email'); }, state: state };
})();
