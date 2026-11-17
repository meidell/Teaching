/* /shared/coursemenu.js — a course menu on the left of every page of a course (16 Nov 2026).
   Jan Erik: "add a course menu on the left side of all pages for this course". A course opts in with
   `menu: {on, sessions:[{n, date, title, href?, exam?}], tools:[{href, label}]}` in courses.json (first:
   escwa — its sessions MIRROR the hub's TERM array: change a date or a title there and here). /track.js
   loads this file on every page with <body data-course>; it exits at once for other courses.
   ≥ 900 px: a fixed column on the left (the page moves right; « folds it to a rail, remembered per device
   in `jem_cmenu`). Narrower: a "☰ Course" button in the course's blue bar (.topbar / nav.nav) opens it
   over the page. Contents: the course home; every session with its date (published ones are links, the
   next one is marked, the current page is highlighted); the tool pages; and shortcuts to the tutor, the
   messages and the class room when those are on the page. */
(function () {
  if (window.__jemCMenu) return; window.__jemCMenu = 1;
  var B = document.body, ID = B && B.getAttribute('data-course'); if (!ID) return;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var load = (window.CourseConfig && CourseConfig.load) ? CourseConfig.load() : fetch('/courses.json', { cache: 'no-cache' }).then(function (r) { return r.json(); });
  Promise.resolve(load).then(function (reg) {
    var list = reg && (reg.courses || reg); if (!list || !list.find) return;
    var c = list.find(function (x) { return x.id === ID; }); if (!c || !c.menu || !c.menu.on) return;
    var fr = c.lang === 'fr', th = (reg.themes || {})[c.theme] || {}, ink = th.accent || '#14213d', hot = th.accentBright || '#c9a961';
    /* the highlight must read on the menu's own colour: a theme whose bright
       accent is close to its accent (Kalaidos: #0096C7 on #007A87) gets it
       mixed toward white until the contrast is at least 4.5 : 1 */
    (function () {
      var rgb = function (h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
      var lum = function (c) { c = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
      try {
        var a = rgb(ink), b = rgb(hot), la = lum(a);
        for (var k = 0; k <= 10; k++) {
          var m = b.map(function (v) { return Math.round(v + (255 - v) * k / 10); }), lm = lum(m);
          if ((Math.max(la, lm) + 0.05) / (Math.min(la, lm) + 0.05) >= 4.5) { hot = '#' + m.map(function (v) { return (v < 16 ? '0' : '') + v.toString(16); }).join(''); break; }
        }
      } catch (e) {}
    })();
    var base = '/' + c.dir + '/', here = decodeURI(location.pathname).replace(/\/$/, '/index.html');
    var today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date());
    var T = fr ? { course: 'Cours', home: 'Accueil du cours', sess: 'Séances', tools: 'Outils et références', next: 'prochaine', soon: 'pas encore en ligne', exam: 'examen', extra: 'Séance en plus', fold: 'Réduire le menu', unfold: 'Ouvrir le menu', menu: 'Cours', close: 'Fermer', tutor: 'Poser une question au tuteur', msg: 'Écrire à l’enseignant', room: 'Rejoindre en ligne', cal: 'Ajouter les séances à mon agenda', calA: 'Apple Calendrier ou Outlook (abonnement)', calG: 'Google Agenda', calF: 'Télécharger le fichier (.ics)', calN: 'Un abonnement se met à jour tout seul quand une date change.', s: 'S' }
      : { course: 'Course', home: 'Course home', sess: 'Sessions', tools: 'Tools and references', next: 'next', soon: 'not online yet', exam: 'exam', extra: 'Extra session', fold: 'Fold the menu', unfold: 'Open the menu', menu: 'Course', close: 'Close', tutor: 'Ask the course tutor', msg: 'Message the instructor', room: 'Join online', cal: 'Add the sessions to my calendar', calA: 'Apple Calendar or Outlook (subscribe)', calG: 'Google Calendar', calF: 'Download the file (.ics)', calN: 'A subscription updates itself when a date moves.', s: 'S' };
    var dshort = function (iso) { return new Date(iso + 'T12:00:00').toLocaleDateString(fr ? 'fr-CH' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); };
    var S = c.menu.sessions || [], nextS = S.filter(function (s) { return s.date >= today; })[0];
    var title = (c.title && (c.title[c.lang] || c.title.en || c.title.fr)) || c.id;

    var css = document.createElement('style');
    css.textContent =
      '#jcm{position:fixed;left:0;top:0;bottom:0;width:250px;z-index:900;background:' + ink + ';color:#e9eef5;display:flex;flex-direction:column;font:14px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:2px 0 14px rgba(0,0,0,.18);transition:transform .2s}' +
      '#jcm a{color:inherit;text-decoration:none}#jcm .hd{display:flex;align-items:flex-start;gap:8px;padding:14px 12px 10px 14px;border-bottom:1px solid rgba(255,255,255,.12)}' +
      '#jcm .hd .t{flex:1;min-width:0}#jcm .hd small{display:block;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:' + hot + ';font-weight:800}#jcm .hd b{display:block;font-size:13.5px;line-height:1.3;margin-top:3px}' +
      '#jcm .x{background:none;border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:14px;flex:none}' +
      '#jcm .bd{flex:1;overflow:auto;padding:8px 8px 12px}#jcm h6{margin:12px 8px 4px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(233,238,245,.6);font-weight:800}' +
      '#jcm .it{display:flex;gap:8px;align-items:baseline;padding:6px 8px;border-radius:8px;font-size:13px}#jcm a.it:hover{background:rgba(255,255,255,.08)}' +
      '#jcm .it .n{flex:none;min-width:24px;font-weight:800;color:' + hot + ';font-size:12px}#jcm .it .l{flex:1;min-width:0}#jcm .it em{display:block;font-style:normal;font-size:11.5px;color:rgba(233,238,245,.62)}' +
      '#jcm .pt{margin:2px 0 6px 22px;border-left:1px solid rgba(255,255,255,.22);padding-left:6px}#jcm .pt button{display:flex;gap:8px;width:100%;background:none;border:0;color:inherit;text-align:left;padding:5px 8px;border-radius:7px;font:13px/1.35 system-ui,sans-serif;cursor:pointer}#jcm .pt button:hover{background:rgba(255,255,255,.08)}#jcm .pt button.on{background:rgba(255,255,255,.14);font-weight:700}#jcm .pt b{flex:none;min-width:24px;color:' + hot + ';font-size:12px}' +
      '#jcm .it.cur{background:rgba(255,255,255,.14);box-shadow:inset 3px 0 0 ' + hot + '}#jcm .it.off{opacity:.55}#jcm .tag{font-size:10.5px;font-weight:800;border-radius:20px;padding:0 7px;margin-left:4px;background:' + hot + ';color:#111}' +
      '#jcm .cal{margin:10px 6px 2px}#jcm .cal details summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.08);font:600 13px system-ui,sans-serif}#jcm .cal summary::-webkit-details-marker{display:none}#jcm .cal summary:hover{background:rgba(255,255,255,.16)}' +
      '#jcm .cal .m{display:flex;flex-direction:column;gap:2px;margin-top:4px;padding:4px;background:rgba(0,0,0,.18);border-radius:8px}#jcm .cal .m a{padding:7px 10px;border-radius:6px;font-size:13px}#jcm .cal .m a:hover{background:rgba(255,255,255,.1)}#jcm .cal .m small{font-size:11.5px;color:rgba(233,238,245,.62);padding:2px 10px 4px}' +
      '#jcm .ft{border-top:1px solid rgba(255,255,255,.12);padding:8px;display:flex;flex-direction:column;gap:4px}#jcm .ft button{background:rgba(255,255,255,.08);border:0;color:#fff;border-radius:8px;padding:8px 10px;text-align:left;font:600 13px system-ui,sans-serif;cursor:pointer}#jcm .ft button:hover{background:rgba(255,255,255,.16)}' +
      '@media(min-width:900px){body.jcm-on .topbar>.home,body.jcm-rail .topbar>.home{display:none}}' +
      'body.jcm-on{padding-left:250px}body.jcm-on #jt-btn,body.jcm-on #pw-btn{left:264px}' +
      'body.jcm-rail #jcm{width:46px}body.jcm-rail #jcm .hd{padding:14px 0 10px;justify-content:center}body.jcm-rail #jcm .t,body.jcm-rail #jcm .bd,body.jcm-rail #jcm .ft{display:none}body.jcm-rail{padding-left:46px}body.jcm-rail #jt-btn,body.jcm-rail #pw-btn{left:60px}' +
      '.jcm-open{display:none;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.55);border-radius:999px;padding:5px 11px;font:700 12.5px system-ui,sans-serif;cursor:pointer;white-space:nowrap}' +
      '@media(max-width:899px){#jcm{transform:translateX(-105%);width:min(300px,86vw)}#jcm.show{transform:none}body.jcm-on,body.jcm-rail{padding-left:0}body.jcm-on #jt-btn,body.jcm-on #pw-btn,body.jcm-rail #jt-btn,body.jcm-rail #pw-btn{left:14px}body.jcm-rail #jcm .t,body.jcm-rail #jcm .bd,body.jcm-rail #jcm .ft{display:flex}body.jcm-rail #jcm .bd{display:block}.jcm-open{display:inline-flex}#jcm-dim{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:899;display:none}#jcm-dim.show{display:block}}' +
      '@media print{#jcm,.jcm-open,#jcm-dim{display:none!important}body.jcm-on,body.jcm-rail{padding-left:0!important}}';
    document.head.appendChild(css);

    var item = function (href, n, label, sub, extra) {
      var cur = href && here === base + href, cls = 'it' + (cur ? ' cur' : '') + (href ? '' : ' off');
      var inner = (n != null ? '<span class="n">' + esc(n) + '</span>' : '') + '<span class="l">' + esc(label) + (extra || '') + (sub ? '<em>' + esc(sub) + '</em>' : '') + '</span>';
      return href ? '<a class="' + cls + '" href="' + esc(base + href) + '"' + (cur ? ' aria-current="page"' : '') + '>' + inner + '</a>' : '<div class="' + cls + '">' + inner + '</div>';
    };
    var M = document.createElement('nav'); M.id = 'jcm'; M.setAttribute('aria-label', T.course);
    M.innerHTML = '<div class="hd"><a class="t" href="' + esc('/' + c.home) + '"><small>' + esc(c.code || c.id) + '</small><b>' + esc(title) + '</b></a><button class="x" type="button" title="' + T.fold + '" aria-label="' + T.fold + '">«</button></div>' +
      '<div class="bd">' + item(String(c.home || '').replace(c.dir + '/', ''), null, T.home) +
      '<div class="cal" hidden></div><h6>' + T.sess + '</h6>' + S.map(function (s) {
        var sub = dshort(s.date) + (s.href ? '' : ' · ' + T.soon);
        var tag = s === nextS ? '<span class="tag">' + T.next + '</span>' : s.exam ? '<span class="tag" style="background:rgba(255,255,255,.2);color:#fff">' + T.exam + '</span>' : '';
        return item(s.href, s.n === '+' ? '+' : T.s + s.n, s.n === '+' ? T.extra + ': ' + s.title : s.title, sub, tag);
      }).join('') +
      ((c.menu.tools || []).length ? '<h6>' + T.tools + '</h6>' + c.menu.tools.map(function (t) { return item(t.href, null, t.label); }).join('') : '') + '</div>' +
      '<div class="ft"></div>';
    B.appendChild(M);
    var dim = document.createElement('div'); dim.id = 'jcm-dim'; B.appendChild(dim);
    var wide = function () { return window.matchMedia('(min-width:900px)').matches; };
    function setRail(on) { B.classList.toggle('jcm-rail', on); B.classList.toggle('jcm-on', !on); var x = M.querySelector('.x'); x.textContent = on ? '»' : '«'; x.title = on ? T.unfold : T.fold; ls('jem_cmenu', on ? 'rail' : 'open'); }
    function show(on) { M.classList.toggle('show', on); dim.classList.toggle('show', on); }
    setRail(ls('jem_cmenu') === 'rail');
    M.querySelector('.x').onclick = function () { if (wide()) setRail(!B.classList.contains('jcm-rail')); else show(false); };
    dim.onclick = function () { show(false); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') show(false); });
    /* the parts of THIS session, under its menu entry: a page built on the
       screen engines (bloc.js, journee.js…) exposes SECTIONS [{id,num,name}]
       and show(id); a click opens that part, the open one is highlighted */
    (function () {
      var SEC = window.SECTIONS, cu = M.querySelector('.cur');
      if (!cu || !Array.isArray(SEC) || !SEC.length || typeof window.show !== 'function' || !document.getElementById('home')) return;
      var box = document.createElement('div'); box.className = 'pt';
      box.innerHTML = '<button type="button" data-id="home"><b>≡</b><span>' + (fr ? 'Plan de la séance' : 'Session plan') + '</span></button>' +
        SEC.map(function (x) { return '<button type="button" data-id="' + esc(x.id) + '"><b>' + esc(x.num || '') + '</b><span>' + esc(x.name || x.id) + '</span></button>'; }).join('');
      cu.parentNode.insertBefore(box, cu.nextSibling);
      var mark = function () { var a = document.querySelector('.screen.active'), id = a ? a.id : ''; box.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-id') === id); }); };
      var orig = window.show; window.show = function (id) { var r = orig.apply(this, arguments); mark(); return r; };
      box.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; window.show(b.getAttribute('data-id')); if (!wide()) show(false); };
      mark();
    })();
    /* the cur item scrolled into view */
    var cur = M.querySelector('.cur'); if (cur) setTimeout(function () { try { cur.scrollIntoView({ block: 'center' }); } catch (e) {} }, 50);
    /* the ☰ button in the course's blue bar (narrow screens) */
    var ob = document.createElement('button'); ob.type = 'button'; ob.className = 'jcm-open'; ob.textContent = '☰ ' + T.menu; ob.onclick = function () { show(true); };
    var host = document.querySelector('.topbar') || document.querySelector('nav.nav');
    /* a light bar (Kalaidos' white .topbar) gets the button in the course colour,
       and the button goes into the bar's inner row where it has one */
    if (host) {
      try {
        var bg = getComputedStyle(host).backgroundColor.match(/[\d.]+/g);
        if (bg && (bg[3] === undefined || +bg[3] > 0.3) && (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) > 160) ob.style.cssText = 'color:' + ink + ';border-color:' + ink;
      } catch (e) {}
      var row = host.querySelector('.topbar-inner') || host;
      row.insertBefore(ob, row.firstChild);
    }
    if (!host) { ob.style.cssText = 'position:fixed;top:10px;left:10px;z-index:898;background:' + ink; B.appendChild(ob); }
    /* shortcuts to what the page offers (the tutor, the messages, the class room), filled when they appear */
    function shortcuts() {
      var ft = M.querySelector('.ft'), h = '';
      var tut = document.getElementById('jt-btn'), msg = document.getElementById('jc-btn'), room = document.querySelector('.jem-meet .join');
      if (room) h += '<button type="button" data-k="room">' + T.room + '</button>';
      if (tut) h += '<button type="button" data-k="tut">' + T.tutor + '</button>';
      if (msg && msg.style.display !== 'none') h += '<button type="button" data-k="msg">' + T.msg + '</button>';
      if (ft.getAttribute('data-h') === h) return; ft.setAttribute('data-h', h); ft.innerHTML = h; ft.style.display = h ? '' : 'none';
      ft.querySelectorAll('button').forEach(function (b) { b.onclick = function () { show(false); var t = { tut: document.getElementById('jt-btn'), msg: document.getElementById('jc-btn'), room: document.querySelector('.jem-meet .join') }[b.getAttribute('data-k')]; if (t) t.click(); }; });
    }
    /* "Add the sessions to my calendar", just above the sessions: the sender worker's live feed GET /ical/<id>.ics */
    fetch('https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app/_site/push.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (x) {
      if (!x || !x.url || !((c.schedule || {}).dates || []).length) return;
      var feed = x.url.replace(/\/+$/, '') + '/ical/' + c.id + '.ics', web = feed.replace(/^https?:/, 'webcal:'), box = M.querySelector('.cal');
      box.innerHTML = '<details><summary>📅 ' + T.cal + '</summary><div class="m"><a href="' + web + '">' + T.calA + '</a><a target="_blank" rel="noopener" href="https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(web) + '">' + T.calG + '</a><a href="' + feed + '" download>' + T.calF + '</a><small>' + T.calN + '</small></div></details>';
      box.hidden = false;
      var dt = box.querySelector('details');
      box.querySelectorAll('.m a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(function () { dt.open = false; }, 60); }); });
      document.addEventListener('click', function (e) { if (dt.open && !dt.contains(e.target)) dt.open = false; });
    }).catch(function () {});
    shortcuts(); setTimeout(shortcuts, 1500); setTimeout(shortcuts, 4000); setInterval(shortcuts, 10000);
  }).catch(function () {});
})();
