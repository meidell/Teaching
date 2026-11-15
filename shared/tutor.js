/* /shared/tutor.js — the course tutor on a course page (15 Nov 2026).
   Jan Erik: "do your top three (let the professor see the questions asked and other feedback)".
   A course opts in with `tutor: {on: true, rubric: [...], reflectionRubric: [...], note: "..."}` in
   courses.json; /track.js loads this file on every page with <body data-course> of such a course.
   1. "Ask the course tutor" — a button bottom-left opens a panel; the question goes to the sender
      worker (POST /tutor/ask, Claude Opus 5.5) with this page's path; the worker reads the course home
      and this page and answers from them, naming where. The conversation of each page is kept on this
      device (<key>_tutor_<path>, last 20 messages).
   2. "Get feedback on this answer" — under every writing field (textarea[data-work] whose CSS min-height is
      at least 80 px or unset, not a quotation or source field), from 25 words: POST /tutor/feedback with the field's label and the
      step's text as the task; the answer comes back as what works, what to change, each criterion
      met / partly / not yet, and the length. Never a mark, never a rewrite.
   Who: the student's course sign-in (<key>_auth: sid + password, checked against the roster by the
   worker) or, on an instructor device, the Firebase token. Every question and every feedback is saved by
   the worker under <ns>/<sid>/tutor — the panel says so — and /shared/tutor.html shows them to the
   instructor. The worker's address is _site/push.url (the same sender as push and the online rooms). */
(function () {
  if (window.__jemTutor) return; window.__jemTutor = 1;
  var B = document.body, ID = B && B.getAttribute('data-course'); if (!ID) return;
  var DB = 'https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* a small, safe Markdown: escape first, then bold, italics, code, lists, paragraphs */
  function md(t) {
    var lines = esc(t).split(/\n/), out = [], list = null;
    function inl(s) { return s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|\W)\*([^*\n]+)\*(?=\W|$)/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
    lines.forEach(function (l) {
      var m = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(l);
      if (m) { if (!list) { list = /^\s*\d/.test(l) ? 'ol' : 'ul'; out.push('<' + list + '>'); } out.push('<li>' + inl(m[1]) + '</li>'); return; }
      if (list) { out.push('</' + list + '>'); list = null; }
      if (/^\s*#{1,4}\s+/.test(l)) out.push('<p><b>' + inl(l.replace(/^\s*#+\s+/, '')) + '</b></p>');
      else if (l.trim()) out.push('<p>' + inl(l) + '</p>');
    });
    if (list) out.push('</' + list + '>');
    return out.join('');
  }
  var load = (window.CourseConfig && CourseConfig.load) ? CourseConfig.load() : fetch('/courses.json', { cache: 'no-cache' }).then(function (r) { return r.json(); });
  Promise.resolve(load).then(function (reg) {
    var list = reg && (reg.courses || reg); if (!list || !list.find) return;
    var c = list.find(function (x) { return x.id === ID; }); if (!c || !c.tutor || !c.tutor.on || !c.ns) return;
    var fr = c.lang === 'fr', KP = c.keyPrefix || c.id, th = (reg.themes || {})[c.theme] || {}, accent = th.accent || '#1d3a5f', hot = th.accentBright || accent;
    var instructor = !!ls('jem_fb_session') && ls('jem_view') !== 'student';
    var PATH = decodeURI(location.pathname); if (/\/$/.test(PATH)) PATH += 'index.html';
    var T = fr ? {
      btn: 'Poser une question au tuteur', title: 'Tuteur du cours', ph: 'Écrivez votre question sur ce cours…', send: 'Envoyer', close: 'Fermer', clear: 'Effacer cette conversation',
      note: 'Le tuteur répond à partir des pages de ce cours et indique où il a trouvé la réponse. Il peut se tromper : vérifiez sur la page qu’il cite. Vos questions et ses réponses sont enregistrées, et votre enseignant peut les lire.',
      signin: 'Connectez-vous d’abord au cours (la case avec votre nom, en bas à droite), puis reposez la question.', wait: 'Le tuteur réfléchit…',
      fb: 'Obtenir un retour sur cette réponse', fbWait: 'Lecture de votre réponse…', fbShort: 'Écrivez au moins 25 mots, puis demandez un retour.',
      works: 'Ce qui fonctionne', change: 'Ce qu’il faut changer', crit: 'Critères', len: 'Longueur', notMark: 'Ceci est un retour, pas une note. Votre enseignant note le travail.',
      rate: { met: 'atteint', partly: 'en partie', 'not yet': 'pas encore' }, err: 'Le tuteur n’a pas pu répondre'
    } : {
      btn: 'Ask the course tutor', title: 'Course tutor', ph: 'Type your question about this course…', send: 'Send', close: 'Close', clear: 'Clear this conversation',
      note: 'The tutor answers from this course’s pages and says where it found the answer. It can be wrong: check the page it names. Your questions and its answers are saved, and your instructor can read them.',
      signin: 'Sign in to the course first (the box with your name, bottom right), then ask again.', wait: 'The tutor is thinking…',
      fb: 'Get feedback on this answer', fbWait: 'Reading your answer…', fbShort: 'Write at least 25 words, then ask for feedback.',
      works: 'What works', change: 'What to change', crit: 'Criteria', len: 'Length', notMark: 'This is feedback, not a mark. Your instructor marks the work.',
      rate: { met: 'met', partly: 'partly', 'not yet': 'not yet' }, err: 'The tutor could not answer'
    };
    /* ---- talking to the worker ---- */
    var senderP = null;
    function sender() { if (!senderP) senderP = fetch(DB + '/_site/push.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (x) { if (!x || !x.url) throw new Error('no sender'); return x.url.replace(/\/+$/, ''); }); return senderP; }
    function fbToken() {
      if (window.FBAuth) return FBAuth.token();
      return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/shared/fb-auth.js'; s.onload = function () { window.FBAuth ? FBAuth.token().then(ok, no) : no(new Error('no auth')); }; s.onerror = no; document.head.appendChild(s); });
    }
    function post(route, body) {
      var h = { 'Content-Type': 'application/json' };
      body.ns = c.ns; body.page = PATH;
      var who = instructor ? fbToken().then(function (t) { h.Authorization = 'Bearer ' + t; })
        : Promise.resolve().then(function () { var a = null; try { a = JSON.parse(ls(KP + '_auth') || 'null'); } catch (e) {} if (!a || !a.sid || !a.pass) { var e2 = new Error(T.signin); e2.signin = 1; throw e2; } body.sid = a.sid; body.pass = a.pass; });
      return who.then(sender).then(function (u) { return fetch(u + route, { method: 'POST', headers: h, body: JSON.stringify(body) }); })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || ('error ' + r.status)); return j; }); });
    }
    /* ---- styles ---- */
    var css = document.createElement('style');
    css.textContent =
      '#jt-btn{position:fixed;left:14px;bottom:' + (instructor ? 62 : 14) + 'px;z-index:320;background:' + accent + ';color:#fff;border:0;border-radius:30px;padding:10px 16px;font:700 13.5px/1 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);cursor:pointer;display:flex;gap:7px;align-items:center}' +
      '#jt-btn i{width:9px;height:9px;border-radius:50%;background:' + hot + ';display:inline-block}' +
      '#jt{position:fixed;left:0;top:0;bottom:0;width:min(420px,100vw);z-index:2147482000;background:#fff;color:#14213d;box-shadow:10px 0 30px rgba(0,0,0,.25);display:none;flex-direction:column;font:14.5px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}' +
      '#jt.on{display:flex}#jt .hd{display:flex;align-items:center;gap:8px;padding:12px 14px;background:' + accent + ';color:#fff}#jt .hd b{flex:1;font-size:15px}' +
      '#jt .hd button{background:transparent;border:1.5px solid rgba(255,255,255,.6);color:#fff;border-radius:20px;padding:5px 11px;font:600 12.5px system-ui,sans-serif;cursor:pointer}' +
      '#jt .nt{font-size:12.5px;color:#556;background:#f4f6f9;padding:9px 14px;border-bottom:1px solid #e3e7ee}' +
      '#jt .ms{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px}' +
      '#jt .m{max-width:92%;padding:9px 12px;border-radius:14px;word-wrap:break-word}#jt .m p{margin:0 0 6px}#jt .m p:last-child{margin:0}#jt .m ul,#jt .m ol{margin:4px 0 6px 18px;padding:0}#jt .m code{background:rgba(0,0,0,.06);padding:0 4px;border-radius:4px}' +
      '#jt .u{align-self:flex-end;background:' + accent + ';color:#fff;border-bottom-right-radius:4px}#jt .a{align-self:flex-start;background:#eef1f6;border-bottom-left-radius:4px}#jt .w{align-self:flex-start;color:#778;font-style:italic}#jt .e{align-self:flex-start;color:#9b2335;font-weight:600}' +
      '#jt form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #e3e7ee}#jt textarea{flex:1;resize:none;min-height:44px;max-height:140px;border:1.5px solid #d5dbe5;border-radius:12px;padding:9px 11px;font:inherit;color:inherit}' +
      '#jt form button{background:' + accent + ';color:#fff;border:0;border-radius:12px;padding:0 16px;font:700 14px system-ui,sans-serif;cursor:pointer}#jt form button:disabled{opacity:.5}' +
      '#jt .cl{background:none;border:0;color:#778;font-size:12px;text-decoration:underline;cursor:pointer;padding:0 14px 8px;align-self:flex-start}' +
      '.jt-fbb{display:inline-flex;gap:6px;align-items:center;margin:6px 0 2px;background:#fff;color:' + accent + ';border:1.5px solid ' + accent + ';border-radius:20px;padding:5px 12px;font:700 12.5px system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer}' +
      '.jt-fb{margin:6px 0 10px;border:1.5px solid #d5dbe5;border-left:5px solid ' + hot + ';border-radius:10px;padding:10px 13px;background:#fbfcfe;color:#14213d;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}' +
      '.jt-fb h5{margin:8px 0 3px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#556}.jt-fb ul{margin:0 0 4px 18px;padding:0}.jt-fb p{margin:0 0 4px}' +
      '.jt-fb table{border-collapse:collapse;width:100%;font-size:13px}.jt-fb td{border-top:1px solid #e3e7ee;padding:4px 6px;vertical-align:top}' +
      '.jt-r{font-weight:700;white-space:nowrap}.jt-r.met{color:#1a7f37}.jt-r.partly{color:#9a6700}.jt-r.not{color:#9b2335}.jt-fb .sm{font-size:12px;color:#667;margin-top:6px}' +
      '@media print{#jt,#jt-btn,.jt-fbb,.jt-fb{display:none!important}}';
    document.head.appendChild(css);

    /* ---- 1. the tutor panel ---- */
    var HK = KP + '_tutor_' + PATH, hist = []; try { hist = JSON.parse(ls(HK) || '[]') || []; } catch (e) { hist = []; }
    var btn = document.createElement('button'); btn.id = 'jt-btn'; btn.type = 'button'; btn.innerHTML = '<i></i>' + esc(T.btn); B.appendChild(btn);
    var P = document.createElement('div'); P.id = 'jt'; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', T.title);
    P.innerHTML = '<div class="hd"><b>' + esc(T.title) + '</b><button type="button" class="x">' + esc(T.close) + '</button></div><div class="nt">' + esc(T.note) + '</div><div class="ms" aria-live="polite"></div><button type="button" class="cl">' + esc(T.clear) + '</button><form><textarea rows="2" aria-label="' + esc(T.ph) + '" placeholder="' + esc(T.ph) + '"></textarea><button type="submit">' + esc(T.send) + '</button></form>';
    B.appendChild(P);
    var MS = P.querySelector('.ms'), TA = P.querySelector('textarea'), SB = P.querySelector('form button');
    function draw() { MS.innerHTML = hist.map(function (m) { return '<div class="m ' + (m.role === 'user' ? 'u' : 'a') + '">' + (m.role === 'user' ? '<p>' + esc(m.text) + '</p>' : md(m.text)) + '</div>'; }).join(''); MS.scrollTop = MS.scrollHeight; }
    function save() { hist = hist.slice(-20); ls(HK, JSON.stringify(hist)); }
    btn.onclick = function () { P.classList.add('on'); draw(); TA.focus(); };
    P.querySelector('.x').onclick = function () { P.classList.remove('on'); };
    P.querySelector('.cl').onclick = function () { hist = []; save(); draw(); };
    TA.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); P.querySelector('form').requestSubmit(); } });
    P.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault(); var q = TA.value.trim(); if (!q || SB.disabled) return;
      var prior = hist.slice(-6); hist.push({ role: 'user', text: q }); save(); draw(); TA.value = ''; SB.disabled = true;
      var w = document.createElement('div'); w.className = 'm w'; w.textContent = T.wait; MS.appendChild(w); MS.scrollTop = MS.scrollHeight;
      post('/tutor/ask', { q: q, history: prior }).then(function (j) { hist.push({ role: 'assistant', text: j.a }); save(); draw(); })
        .catch(function (err) { w.className = 'm e'; w.textContent = err.signin ? T.signin : T.err + ': ' + err.message; if (err.signin) { hist.pop(); save(); } })
        .then(function () { SB.disabled = false; });
    });

    /* ---- 2. feedback under the writing fields ---- */
    function taskOf(ta) {
      var box = ta.closest('.step, section, .card, .ex, .task, li, details') || ta.parentElement, t = '';
      try { var cl = box.cloneNode(true); cl.querySelectorAll('textarea, input, script, style, button, .jt-fb').forEach(function (x) { x.remove(); }); t = cl.textContent.replace(/\s+/g, ' ').trim(); } catch (e) {}
      return ((ta.getAttribute('data-worklabel') || '') + '\n' + t).slice(0, 3800);
    }
    function words(s) { return String(s).trim().split(/\s+/).filter(Boolean).length; }
    function fbHtml(j) {
      var f = j.fb || {};
      return '<p>' + esc(f.summary) + '</p>' +
        (f.strengths && f.strengths.length ? '<h5>' + T.works + '</h5><ul>' + f.strengths.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        (f.improve && f.improve.length ? '<h5>' + T.change + '</h5><ul>' + f.improve.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        (f.criteria && f.criteria.length ? '<h5>' + T.crit + '</h5><table>' + f.criteria.map(function (x) { var k = x.rating === 'met' ? 'met' : x.rating === 'partly' ? 'partly' : 'not'; return '<tr><td>' + esc(x.criterion) + '</td><td class="jt-r ' + k + '">' + esc(T.rate[x.rating] || x.rating) + '</td><td>' + esc(x.note) + '</td></tr>'; }).join('') + '</table>' : '') +
        (f.length ? '<h5>' + T.len + '</h5><p>' + esc(f.length) + '</p>' : '') + '<p class="sm">' + T.notMark + '</p>';
    }
    function wire() {
      Array.prototype.forEach.call(document.querySelectorAll('textarea[data-work]'), function (ta) {
        if (ta.__jt) return;
        /* short fields (a quotation, a one-liner) get no button: judged by the field's CSS min-height, which
           also works on the hidden screens of a screen-based page, where offsetHeight is 0 */
        var lab = ta.getAttribute('data-worklabel') || '', mh = parseFloat(getComputedStyle(ta).minHeight) || 0, rows = parseInt(ta.getAttribute('rows') || '0', 10);
        if ((mh && mh < 80 && !/\btext\b/i.test(lab)) || (rows && rows < 3) || /quot|citation|reference|source/i.test(lab)) return;
        ta.__jt = 1;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'jt-fbb'; b.textContent = T.fb;
        var out = document.createElement('div'); out.className = 'jt-fb'; out.hidden = true; out.setAttribute('aria-live', 'polite');
        ta.insertAdjacentElement('afterend', b); b.insertAdjacentElement('afterend', out);
        b.onclick = function () {
          out.hidden = false;
          if (words(ta.value) < 25) { out.innerHTML = '<p>' + esc(T.fbShort) + '</p>'; return; }
          b.disabled = true; out.innerHTML = '<p><i>' + esc(T.fbWait) + '</i></p>';
          post('/tutor/feedback', { field: ta.getAttribute('data-work'), label: lab, task: taskOf(ta), text: ta.value }).then(function (j) { out.innerHTML = fbHtml(j); })
            .catch(function (err) { out.innerHTML = '<p style="color:#9b2335;font-weight:600">' + esc(err.signin ? T.signin : T.err + ': ' + err.message) + '</p>'; })
            .then(function () { b.disabled = false; });
        };
      });
    }
    wire(); setTimeout(wire, 1500); setTimeout(wire, 4000);
  }).catch(function () {});
})();
