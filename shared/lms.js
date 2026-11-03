/* =====================================================================
   SHARED · the new platform's adapter (3 Nov 2026).
   A course with `lms:true` in config.js records here instead of Firebase.
   Nothing on the page changes: progress.js and login.js step aside
   (config.js → lmsBoot) and this file provides the same two objects —

     StatsTrack  init · complete · setScore · quizAnswer · attach · askName
                 identified · name · sid · course
     CourseLogin open · logout · current · group …

   — talking to the Teaching API (Render, Frankfurt) with a Bearer token.

   Sign-in is an email and a 6-digit code (no password). One sign-in serves
   every course on the platform: the session is `jem_lms` = {t, user}.

   localStorage stays the source of truth, under the SAME keys progress.js
   uses (<key>_done_<mod>, _secs_, _score_, _q<i>_, _work_<field>), so a
   course that moves to the platform keeps what each device already holds,
   and everything done before signing in is sent the moment the student
   signs in (backfill), as before.

   Course-local scripts (walls, teams, presence) still read <key>_auth for
   {sid, name}; it is written here with `lms:1` and no password.

   On first sign-in in a course this file, in order: finds the student's
   edition (/courses/<id>/current); if there is none, claims the device's
   old Firebase identity (/claim — the old sid and password, checked by
   the API, once); if that fails too, asks for the course's join code.
   ===================================================================== */
(function () {
  "use strict";

  var CFG = window.CourseConfig;
  var C = CFG && CFG.current();
  if (!C) return;

  var API = CFG.lmsApi(), K = C.key, T = C.theme, FR = C.lang === 'fr';
  var SKEY = 'jem_lms';

  var STR = {
    en: {
      pill: 'Sign in to save your progress', synced: ' · synced', offline: ' · saved on this device',
      h: 'Your course account', lead: 'Sign in with your email. Your progress then follows you between devices, and your professor can see it.',
      emailL: 'Email', emailP: 'you@example.com', nameL: 'Full name', nameP: 'First and last name (first time only)',
      send: 'Email me a code', sent: 'We sent a 6-digit code to {e}. It is valid for 10 minutes.',
      codeL: 'Code', go: 'Sign in', other: 'use another address', later: 'not now',
      joinH: 'One more step', joinP: 'You are signed in, but not yet enrolled in this course. Type the course code your teacher gave you.',
      joinL: 'Course code', join: 'Join the course',
      out: 'Sign out', signedAs: 'Signed in as {e}',
      net: 'The server could not be reached. Your work is kept on this device; try again in a moment.',
      expired: 'Your session has ended. Sign in again — nothing on this device is lost.'
    },
    fr: {
      pill: 'Connectez-vous pour enregistrer votre progression', synced: ' · synchronisé', offline: ' · enregistré sur cet appareil',
      h: 'Votre compte de cours', lead: 'Connectez-vous avec votre e-mail. Votre progression vous suit alors d’un appareil à l’autre, et votre professeur peut la voir.',
      emailL: 'E-mail', emailP: 'vous@exemple.com', nameL: 'Nom complet', nameP: 'Prénom et nom (la première fois seulement)',
      send: 'Recevoir un code par e-mail', sent: 'Un code à 6 chiffres a été envoyé à {e}. Il est valable 10 minutes.',
      codeL: 'Code', go: 'Se connecter', other: 'utiliser une autre adresse', later: 'plus tard',
      joinH: 'Encore une étape', joinP: 'Vous êtes connecté, mais pas encore inscrit à ce cours. Tapez le code du cours donné par votre professeur.',
      joinL: 'Code du cours', join: 'Rejoindre le cours',
      out: 'Se déconnecter', signedAs: 'Connecté en tant que {e}',
      net: 'Le serveur est injoignable. Votre travail reste sur cet appareil ; réessayez dans un instant.',
      expired: 'Votre session a expiré. Reconnectez-vous — rien n’est perdu sur cet appareil.'
    }
  };
  function L() { var l = document.documentElement.getAttribute('data-lang'); return STR[l === 'fr' || l === 'en' ? l : (FR ? 'fr' : 'en')]; }

  var S = { mod: null, title: '', total: 0, secs: 0, done: {}, ed: null, grp: '', role: '', ok: false };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function jget(k, d) { try { return JSON.parse(lsGet(k) || 'null') || d; } catch (e) { return d; } }
  function lk(k, mod) { return K + '_' + k + '_' + (mod || S.mod); }
  function san(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- session + the course's edition ---- */
  function sess() { return jget(SKEY, null); }
  function edKey() { return K + '_lms_ed'; }
  function edition() { var e = jget(edKey(), null), s = sess(); return e && s && e.uid === s.user.id ? e : null; }

  function call(method, path, body, keepalive) {
    var s = sess(), h = { 'content-type': 'application/json' };
    if (s && s.t) h.authorization = 'Bearer ' + s.t;
    return fetch(API + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined, keepalive: !!keepalive })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.status === 401 && s) { signedOut(true); }
          if (!r.ok) { var e = new Error(j.error || ('HTTP ' + r.status)); e.status = r.status; throw e; }
          return j;
        });
      });
  }

  /* ---- the identity course-local scripts read ---- */
  function writeAuth(user) {
    /* keep the sid this device already had, so walls and teams still know the student */
    var old = jget(K + '_auth', null);
    var sid = (old && old.sid) || san(user.name || user.email.split('@')[0]);
    lsSet(K + '_auth', JSON.stringify({ sid: sid, name: user.name || (old && old.name) || '', lms: 1, grp: S.grp || undefined, ts: Date.now() }));
  }
  function auth() { var a = jget(K + '_auth', null); return a && a.lms && sess() ? a : null; }

  /* ---- sending: one debounced PUT per module, work and quiz batched ---- */
  var dirty = {}, workQ = {}, quizQ = {}, timer = null;
  function canSend() { return S.ok && S.ed && S.role === 'student'; }
  function modBody(mod) {
    var meta = jget(lk('meta', mod), {}), done = jget(lk('done', mod), {}), sc = lsGet(lk('score', mod)), m = /^\s*([\d.]+)\s*\/\s*([\d.]+)/.exec(sc || '');
    return { module: mod, total: meta.total || 0, sections: Object.keys(done).filter(function (k) { return done[k]; }),
             secs: parseInt(lsGet(lk('secs', mod)) || '0', 10) || 0, score: m ? Number(m[1]) : undefined, scoreMax: m ? Number(m[2]) : undefined };
  }
  function schedule(now) { clearTimeout(timer); timer = setTimeout(send, now ? 0 : 1200); }
  function send(keep) {
    if (!canSend()) return;
    var id = S.ed.id;
    Object.keys(dirty).forEach(function (mod) { delete dirty[mod]; call('PUT', '/editions/' + id + '/progress', modBody(mod), keep).then(synced, failed); });
    var wk = Object.keys(workQ);
    while (wk.length) {
      var chunk = {}, part = wk.splice(0, 100);
      part.forEach(function (k) { chunk[k] = workQ[k]; delete workQ[k]; });
      call('PUT', '/editions/' + id + '/work', { fields: chunk }, keep).then(synced, failed);
    }
    Object.keys(quizQ).forEach(function (mod) { var a = quizQ[mod]; delete quizQ[mod]; call('PUT', '/editions/' + id + '/quiz', { module: mod, answers: a }, keep).then(synced, failed); });
  }
  function synced() { setPill('ok'); }
  function failed(e) { if (e && e.status === 401) return; setPill('off'); }

  /* everything this device holds for the course, sent once after sign-in */
  function backfill() {
    var re = new RegExp('^' + K + '_(?:done|secs|score|meta)_(.+)$'), rw = new RegExp('^' + K + '_work_(.+)$'), i, k, m;
    try {
      for (i = 0; i < localStorage.length; i++) {
        k = localStorage.key(i);
        if ((m = k && k.match(re))) dirty[m[1]] = true;
        else if ((m = k && k.match(rw))) { var el = document.querySelector('[data-work="' + m[1] + '"]'); workQ[m[1]] = { v: lsGet(k), label: (el && el.getAttribute('data-worklabel')) || m[1], mod: (el && S.mod) || '' }; }
      }
    } catch (e) {}
    schedule(true);
  }

  /* what the server holds that this device does not: sections are a union,
     time the max, an empty score / field / quiz answer is filled — the
     login.js merge rule, so neither device's work is lost */
  function mergeDown() {
    if (!S.ed) return Promise.resolve();
    return call('GET', '/editions/' + S.ed.id + '/mine').then(function (r) {
      var byMod = {};
      (r.done || []).forEach(function (d) { (byMod[d.module_id] = byMod[d.module_id] || {})[d.section_id] = true; });
      Object.keys(byMod).forEach(function (mod) {
        var cur = jget(lk('done', mod), {}), ch = false;
        Object.keys(byMod[mod]).forEach(function (s) { if (!cur[s]) { cur[s] = true; ch = true; } });
        if (ch) lsSet(lk('done', mod), JSON.stringify(cur));
        if (mod === S.mod) S.done = cur;
      });
      (r.stats || []).forEach(function (st) {
        var have = parseInt(lsGet(lk('secs', st.module_id)) || '0', 10) || 0;
        if (st.secs > have) { lsSet(lk('secs', st.module_id), String(st.secs)); if (st.module_id === S.mod && st.secs > S.secs) S.secs = st.secs; }
        if (st.score != null && !lsGet(lk('score', st.module_id))) lsSet(lk('score', st.module_id), Number(st.score) + '/' + Number(st.score_max));
      });
      (r.work || []).forEach(function (w) {
        if (lsGet(K + '_work_' + w.field_id)) return;
        lsSet(K + '_work_' + w.field_id, w.value);
        var el = document.querySelector('[data-work="' + w.field_id + '"]'); if (el && !el.value) el.value = w.value;
      });
      (r.quiz || []).forEach(function (a) {
        var key = lk(String(a.q), a.module_id);
        if (!lsGet(key) && a.picked != null) lsSet(key, (a.correct ? 1 : 0) + ':' + a.picked);
      });
      try { window.dispatchEvent(new CustomEvent('statstrack:synced')); } catch (e) {}
    }).catch(function () {});
  }

  /* ---- finding (or earning) a place in this course ---- */
  function enter() {
    var s = sess(); if (!s) return Promise.resolve(false);
    return call('GET', '/courses/' + encodeURIComponent(C.id) + '/current').then(found, function (e) {
      if (e.status !== 404) throw e;
      var old = jget(K + '_auth', null);
      if (old && old.sid && old.pass && !old.lms) {
        return call('POST', '/claim', { ns: C.ns, sid: old.sid, pass: old.pass })
          .then(function () { old.claimed = 1; lsSet(K + '_auth', JSON.stringify(old)); return call('GET', '/courses/' + encodeURIComponent(C.id) + '/current').then(found); },
                function () { return needJoin(); });
      }
      return needJoin();
    });
  }
  function found(r) {
    var s = sess();
    S.ed = { id: r.edition.id, label: r.edition.label, uid: s.user.id };
    S.role = r.edition.as_role === 'student' ? 'student' : 'staff';
    lsSet(edKey(), JSON.stringify(S.ed));
    return call('GET', '/me').then(function (me) {
      (me.studying || []).forEach(function (e) { if (e.id === S.ed.id) S.grp = e.group_label || ''; });
      s.user = me.user; lsSet(SKEY, JSON.stringify(s));
    }).catch(function () {}).then(function () {
      S.ok = true; writeAuth(s.user); setPill('ok');
      return mergeDown().then(function () { if (S.role === 'student') backfill(); return true; });
    });
  }
  function needJoin() { S.ok = false; openModal('join'); return false; }

  function signedOut(expired) {
    lsDel(SKEY); lsDel(edKey()); S.ok = false; S.ed = null;
    var a = jget(K + '_auth', null); if (a && a.lms) lsDel(K + '_auth');
    setPill(); if (expired) openModal('email', L().expired);
  }

  /* ---- UI: one pill, one modal, themed from config ---- */
  function css() {
    if (document.getElementById('lms-css')) return;
    var c = document.createElement('style'); c.id = 'lms-css';
    c.textContent =
      '#lms-pill{position:fixed;right:14px;bottom:14px;z-index:300;background:rgba(255,255,255,.95);border:1.5px solid ' + T.main + ';color:' + T.deep + ';font:700 12px/1.2 "Helvetica Neue",Helvetica,Arial,sans-serif;border-radius:30px;padding:9px 14px;cursor:pointer;box-shadow:0 10px 26px -12px rgba(0,0,0,.4);max-width:260px;}' +
      '#lms-pill.unset{animation:lmspulse 2s infinite;}#lms-pill.inst{border-color:transparent;background:transparent;box-shadow:none;font-weight:600;font-size:11px;opacity:.45;}' +
      '@keyframes lmspulse{0%,100%{box-shadow:0 0 0 0 ' + T.main + '73;}50%{box-shadow:0 0 0 7px ' + T.main + '00;}}' +
      '#lms-modal{position:fixed;inset:0;z-index:301;background:rgba(20,25,20,.55);display:none;align-items:center;justify-content:center;padding:18px;}#lms-modal.on{display:flex;}' +
      '#lms-box{background:#fff;border-radius:20px;padding:26px 24px;max-width:380px;width:100%;color:' + T.ink + ';font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;box-shadow:0 18px 50px -20px rgba(0,0,0,.5);}' +
      '#lms-box h3{font-family:Georgia,serif;font-size:20px;margin:0 0 8px;color:' + T.deep + ';}#lms-box p{font-size:13px;color:' + T.grey + ';margin:0 0 14px;line-height:1.5;}' +
      '#lms-box label{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:700;color:' + T.grey + ';margin:0 0 4px;}' +
      '#lms-box input{box-sizing:border-box;width:100%;background:' + T.surface + ';border:1px solid ' + T.main + '4d;border-radius:10px;color:' + T.ink + ';font:15px "Helvetica Neue",Arial,sans-serif;padding:11px 13px;margin:0 0 12px;}' +
      '#lms-box input.code{letter-spacing:6px;font-size:20px;text-align:center;}#lms-box input:focus{outline:none;border-color:' + T.main + ';}' +
      '#lms-box button.go{width:100%;background:' + T.main + ';color:#fff;border:none;border-radius:30px;padding:12px 22px;font:bold 13px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}#lms-box button.go:disabled{opacity:.5;}' +
      '#lms-box .ln{display:block;margin:12px auto 0;color:' + T.grey + ';font-size:12px;cursor:pointer;background:none;border:none;text-decoration:underline;}' +
      '#lms-box .err{color:#b3261e;font-size:12.5px;margin:-4px 0 10px;min-height:1em;}#lms-box .note{background:' + T.pale + ';color:' + T.deep + ';border-radius:10px;padding:9px 11px;}';
    document.head.appendChild(c);
  }
  function isInstructor() {
    if (lsGet('jem_instructor')) return true;
    var f = jget('jem_fb_session', null); if (f && f.rt) return true;
    return /(?:^|; )jem_instructor=1/.test(document.cookie || '');
  }
  function setPill(state) {
    var w = document.getElementById('topWho'), a = auth(), t = L();
    if (w) { if (a) { w.textContent = '👤 ' + a.name; w.classList.add('on'); } return; }
    var p = document.getElementById('lms-pill');
    if (!p) { p = document.createElement('div'); p.id = 'lms-pill'; document.body.appendChild(p); p.addEventListener('click', function () { openModal(auth() ? 'me' : 'email'); }); }
    if (a) { p.className = ''; p.textContent = '👤 ' + (a.name || sess().user.email) + (state === 'off' ? t.offline : t.synced); }
    else if (sess() && !S.ok) { p.className = 'unset'; p.textContent = t.joinH; }
    else if (isInstructor()) { p.className = 'inst'; p.textContent = 'Jan Erik Meidell'; }
    else { p.className = 'unset'; p.textContent = t.pill; }
  }

  var M = { email: '' };
  function openModal(step, note) {
    css();
    var m = document.getElementById('lms-modal');
    if (!m) { m = document.createElement('div'); m.id = 'lms-modal'; m.innerHTML = '<div id="lms-box"></div>'; document.body.appendChild(m);
      m.addEventListener('click', function (e) { if (e.target === m) close(); }); }
    var b = document.getElementById('lms-box'), t = L(), s = sess();
    if (!step) step = s ? (S.ok ? 'me' : 'join') : 'email';
    var noteH = note ? '<p class="note">' + esc(note) + '</p>' : '';
    if (step === 'email') {
      b.innerHTML = '<h3>' + esc(t.h) + '</h3><p>' + esc(t.lead) + '</p>' + noteH +
        '<label>' + esc(t.emailL) + '</label><input id="lms-e" type="email" autocomplete="email" placeholder="' + esc(t.emailP) + '" value="' + esc(M.email) + '">' +
        '<label>' + esc(t.nameL) + '</label><input id="lms-n" autocomplete="name" placeholder="' + esc(t.nameP) + '">' +
        '<div class="err" id="lms-x"></div><button class="go" id="lms-b">' + esc(t.send) + '</button><button class="ln" id="lms-l">' + esc(t.later) + '</button>';
      on('lms-b', function () {
        var e = val('lms-e'); M.email = e; M.name = val('lms-n');
        busy(true); call('POST', '/auth/start', { email: e }).then(function () { openModal('code'); }, err).then(function () { busy(false); });
      });
    } else if (step === 'code') {
      b.innerHTML = '<h3>' + esc(t.h) + '</h3><p>' + esc(t.sent.replace('{e}', M.email)) + '</p>' +
        '<label>' + esc(t.codeL) + '</label><input id="lms-c" class="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••">' +
        '<div class="err" id="lms-x"></div><button class="go" id="lms-b">' + esc(t.go) + '</button><button class="ln" id="lms-l">' + esc(t.other) + '</button>';
      on('lms-b', function () {
        busy(true);
        call('POST', '/auth/verify', { email: M.email, code: val('lms-c'), name: M.name || '' }).then(function (r) {
          lsSet(SKEY, JSON.stringify({ t: r.token, user: r.user }));
          return enter().then(function (ok) { if (ok) close(); });
        }).catch(err).then(function () { busy(false); });
      });
      document.getElementById('lms-l').onclick = function () { openModal('email'); };
    } else if (step === 'join') {
      b.innerHTML = '<h3>' + esc(t.joinH) + '</h3><p>' + esc(t.joinP) + '</p>' + noteH +
        '<label>' + esc(t.joinL) + '</label><input id="lms-j" class="code" maxlength="12" autocapitalize="characters">' +
        '<div class="err" id="lms-x"></div><button class="go" id="lms-b">' + esc(t.join) + '</button><button class="ln" id="lms-o">' + esc(t.out) + '</button>';
      on('lms-b', function () {
        busy(true); call('POST', '/join', { code: val('lms-j').toUpperCase() }).then(function () { return enter(); }).then(function (ok) { if (ok) close(); }).catch(err).then(function () { busy(false); });
      });
      document.getElementById('lms-o').onclick = logout;
    } else {
      b.innerHTML = '<h3>' + esc(t.h) + '</h3><p>' + esc(t.signedAs.replace('{e}', s.user.email)) + (S.ed ? ' · ' + esc(S.ed.label) : '') + '</p>' +
        '<button class="go" id="lms-o">' + esc(t.out) + '</button><button class="ln" id="lms-l">OK</button>';
      document.getElementById('lms-o').onclick = logout;
    }
    var l = document.getElementById('lms-l'); if (l && !l.onclick) l.onclick = close;
    m.classList.add('on');
    var f = b.querySelector('input'); if (f) setTimeout(function () { f.focus(); }, 30);
  }
  function on(id, fn) {
    var b = document.getElementById(id); b.onclick = fn;
    Array.prototype.forEach.call(document.querySelectorAll('#lms-box input'), function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') fn(); }); });
  }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function busy(b) { var e = document.getElementById('lms-b'); if (e) e.disabled = b; }
  function err(e) { var x = document.getElementById('lms-x'); if (x) x.textContent = (e && e.status) ? e.message : L().net; }
  function close() { var m = document.getElementById('lms-modal'); if (m) m.classList.remove('on'); }
  function logout() {
    var s = sess(); if (s) call('POST', '/auth/logout').catch(function () {});
    signedOut(false); close();
  }

  /* ---- the page's own work: timer, workbook fields ---- */
  function startTimer() {
    setInterval(function () { if (document.visibilityState !== 'hidden') { S.secs++; if (S.secs % 5 === 0) lsSet(lk('secs'), String(S.secs)); } }, 1000);
    setInterval(function () { if (S.mod) { lsSet(lk('secs'), String(S.secs)); dirty[S.mod] = true; send(); } }, 30000);
    function bye() { if (!S.mod) return; lsSet(lk('secs'), String(S.secs)); dirty[S.mod] = true; send(true); }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') bye(); });
    window.addEventListener('pagehide', bye);
  }
  function wireWorkbook() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-work]'), function (el) {
      var id = el.getAttribute('data-work'); if (!id || el.__lms) return; el.__lms = 1;
      var label = el.getAttribute('data-worklabel') || id, sv = lsGet(K + '_work_' + id), t;
      if (sv != null) el.value = sv;
      el.addEventListener('input', function () {
        lsSet(K + '_work_' + id, el.value);
        var st = document.getElementById('wbSave'), str = CFG.strings(FR ? 'fr' : 'en'); if (st) st.textContent = str.saving;
        clearTimeout(t);
        t = setTimeout(function () { workQ[id] = { v: el.value, label: label, mod: S.mod || '' }; send(); if (st) st.textContent = str.saved; }, 700);
      });
    });
  }

  /* ---- public API: the same as progress.js and login.js ---- */
  window.StatsTrack = {
    init: function (o) {
      if (window.COURSE_ACCESS === false || window.E1410_ACCESS === false) return;
      o = o || {};
      S.mod = o.module || (document.body && document.body.getAttribute('data-module')) || null;
      S.title = o.title || S.mod; S.total = o.total || 0;
      if (S.mod) {
        S.secs = parseInt(lsGet(lk('secs')) || '0', 10) || 0; S.done = jget(lk('done'), {});
        lsSet(lk('meta'), JSON.stringify({ title: S.title, total: S.total })); dirty[S.mod] = true;
        startTimer(); schedule();
      }
      boot();
    },
    attach: function () { boot(); },
    complete: function (id) {
      if (!id || !S.mod || S.done[id]) return;
      S.done[id] = true; lsSet(lk('done'), JSON.stringify(S.done)); dirty[S.mod] = true; schedule();
    },
    setScore: function (done, total) {
      if (S.mod) { lsSet(lk('score'), done + '/' + total); dirty[S.mod] = true; schedule(true); }
      if (!auth()) openModal();
    },
    quizAnswer: function (i, picked, ok) {
      if (!S.mod) return;
      var key = lk('q' + i); if (lsGet(key) == null) lsSet(key, (ok ? 1 : 0) + ':' + picked);
      (quizQ[S.mod] = quizQ[S.mod] || {})['q' + i] = { p: picked, c: ok ? 1 : 0 }; schedule();
    },
    askName: function () { openModal(); },
    setIdentity: function () { openModal(); },     /* names come from the account now */
    identified: function () { return !!auth(); },
    name: function () { var a = auth(); return a ? a.name : ''; },
    sid: function () { var a = auth(); return a ? a.sid : ''; },
    course: function () { return C; }
  };
  window.CourseLogin = {
    open: function () { openModal(); }, logout: logout, current: auth, sync: mergeDown,
    handoffUrl: function (u) { return u || location.href; }, inApp: function () { return false; },
    groups: function () { return S.grp ? [{ id: S.grp, label: S.grp }] : []; }, group: function () { return S.grp; },
    groupLabel: function (g) { return g; }
  };

  var booted = false;
  function boot() {
    css(); wireWorkbook();
    if (booted) return; booted = true;
    var e = edition();
    if (e) { S.ed = e; S.role = 'student'; S.ok = true; }
    setPill();
    if (sess()) {
      enter().then(function (ok) { if (!ok) setPill(); }, function () { setPill('off'); if (S.ed) { backfill(); } });
    } else if (!isInstructor()) {
      setTimeout(function () { if (!sess()) openModal('email'); }, 1500);
    }
  }

  /* replay what the page asked for while this file was loading */
  var q = window.__lmsQ || []; window.__lmsQ = [];
  q.forEach(function (c) { try { window[c[0]][c[1]].apply(null, c[2]); } catch (e) {} });
  if (!q.length && document.body) boot();
})();
