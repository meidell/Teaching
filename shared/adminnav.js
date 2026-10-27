/* =====================================================================
   SHARED · the instructor's left-hand menu (27 Oct 2026).
   Jan Erik: "make a menu (left) for all admin pages that allows me more
   easily to navigate."

   One <script src="/shared/adminnav.js" defer></script> on each
   instructor page — /admin/, admin2, insights, chat, inbox, site, board.
   It draws nothing until the device holds the instructor session
   (`jem_fb_session`), so a locked gate screen stays bare; it checks again
   every 1.5 s until the gate is passed, then stops.

   THE COURSE. The per-course links (Dashboard, Presence, Messages,
   Insights, Board) carry the course the page is showing: `?course=` in
   the address bar — the pages rewrite it with replaceState when the
   picker changes — else `jem_admin_last`, the one admin2 and chat.html
   remember. The href is recomputed when the pointer enters the menu, so
   it follows a picker change without the pages telling it anything.
   Clicking a course in the list opens the SAME tool for that course
   (on /admin/, inbox or site, the dashboard).

   LAYOUT. Wide screens (≥ 1000 px): fixed on the left, the page is
   pushed right by padding on <body>; « folds it to a 56 px rail,
   remembered per device (`jem_anav`). Narrow screens, and always on
   board.html (it is on the TV): hidden, a ☰ button bottom-left opens it
   over the page. The button hides while the board is full screen.

   admin2 reads its tab from the hash only at boot, so a click that only
   changes the hash (Dashboard ↔ Presence on the same course) reloads.
   ===================================================================== */
(function () {
  "use strict";
  if (window.AdminNav) return;
  window.AdminNav = true;

  var W = 224, RAIL = 56;
  var PATH = location.pathname.replace(/\/index\.html$/, '/');
  var BOARD = /\/shared\/board\.html$/.test(PATH);
  var REG = null;

  function trusted() {
    try { var v = JSON.parse(localStorage.getItem('jem_fb_session') || 'null'); return !!(v && v.rt); }
    catch (e) { return false; }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function courseId() {
    var q = new URLSearchParams(location.search).get('course');
    if (q) return q;
    try { return localStorage.getItem('jem_admin_last') || ''; } catch (e) { return ''; }
  }
  function course(id) {
    return REG && REG.courses ? REG.courses.filter(function (c) { return c.id === id; })[0] : null;
  }
  function hasPresence(c) { return !!(c && (c.features || []).indexOf('presence') >= 0); }

  /* the per-course tools: [key, icon, label, path, hash] */
  var TOOLS = [
    ['dash', '📊', 'Dashboard', '/shared/admin2.html', '#today'],
    ['pres', '✅', 'Presence', '/shared/admin2.html', '#presence'],
    ['chat', '💬', 'Messages', '/shared/chat.html', ''],
    ['ins', '🔎', 'Insights', '/shared/insights.html', ''],
    ['board', '📺', 'Board · TV', '/shared/board.html', '']
  ];
  /* which tool is this page? (admin2: by its hash) */
  function currentTool() {
    if (/\/shared\/admin2\.html$/.test(PATH)) {
      /* admin2's replaceState drops the hash; the tab it remembers is the truth */
      var tab = location.hash.slice(1);
      try { tab = tab || localStorage.getItem('jem_admin2_tab') || ''; } catch (e) {}
      return tab === 'presence' ? 'pres' : 'dash';
    }
    for (var i = 2; i < TOOLS.length; i++) if (PATH === TOOLS[i][3]) return TOOLS[i][0];
    return '';
  }
  function toolHref(t, id) {
    return t[3] + (id ? '?course=' + encodeURIComponent(id) : '') + t[4];
  }

  /* ---------- styles ---------- */
  function css() {
    var s = document.createElement('style');
    s.textContent =
      '#anav{position:fixed;top:0;left:0;bottom:0;width:' + W + 'px;z-index:300;background:#0a1a3a;color:#fff;' +
      'font:500 13px/1.35 system-ui,-apple-system,"Segoe UI","Helvetica Neue",Arial,sans-serif;' +
      'display:flex;flex-direction:column;overflow:hidden;box-shadow:1px 0 0 rgba(255,255,255,.06);transition:width .15s,transform .18s;}' +
      '#anav *{box-sizing:border-box;}' +
      '#anav .ah{display:flex;align-items:center;gap:8px;padding:14px 12px 10px 16px;}' +
      '#anav .ah b{flex:1;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#f0b33d;font-weight:800;white-space:nowrap;}' +
      '#anav .ab{background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;font:700 15px system-ui,sans-serif;padding:4px 6px;border-radius:6px;}' +
      '#anav .ab:hover{background:rgba(255,255,255,.1);color:#fff;}' +
      '#anav .as{overflow-y:auto;flex:1;padding:0 8px 16px;scrollbar-width:thin;}' +
      '#anav .ak{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.45);font-weight:800;' +
      'padding:14px 8px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#anav .ak em{font-style:normal;color:#f0b33d;letter-spacing:.06em;}' +
      '#anav a{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.86);text-decoration:none;' +
      'padding:7px 8px;border-radius:8px;white-space:nowrap;overflow:hidden;}' +
      '#anav a:hover{background:rgba(255,255,255,.09);color:#fff;}' +
      '#anav a.on{background:rgba(240,179,61,.16);color:#fff;box-shadow:inset 3px 0 0 #f0b33d;font-weight:700;}' +
      '#anav a .i{width:20px;text-align:center;flex:none;font-size:14px;}' +
      '#anav a .t{overflow:hidden;text-overflow:ellipsis;}' +
      '#anav a.off{opacity:.38;pointer-events:none;}' +
      '#anav details{margin-top:2px;}' +
      '#anav summary{cursor:pointer;list-style:none;padding:6px 8px;border-radius:8px;color:rgba(255,255,255,.7);font-weight:700;font-size:12px;white-space:nowrap;}' +
      '#anav summary::-webkit-details-marker{display:none;}' +
      '#anav summary::before{content:"▸";display:inline-block;width:14px;color:rgba(255,255,255,.4);transition:transform .12s;}' +
      '#anav details[open] summary::before{transform:rotate(90deg);}' +
      '#anav summary:hover{background:rgba(255,255,255,.07);}' +
      '#anav details a{padding:5px 8px 5px 22px;font-size:12.5px;}' +
      /* the rail */
      'body.anav-min #anav{width:' + RAIL + 'px;}' +
      'body.anav-min #anav .ah b,body.anav-min #anav a .t,body.anav-min #anav .ak,body.anav-min #anav details{display:none;}' +
      'body.anav-min #anav .ah{padding:14px 0 10px;justify-content:center;}' +
      'body.anav-min #anav a{justify-content:center;padding:9px 0;}' +
      /* the push */
      '@media(min-width:1000px){body.anav-push{padding-left:' + W + 'px!important;}body.anav-push.anav-min{padding-left:' + RAIL + 'px!important;}}' +
      /* the overlay (narrow, and the board) */
      '#anavBtn{position:fixed;left:14px;bottom:14px;z-index:299;width:42px;height:42px;border-radius:50%;border:none;cursor:pointer;' +
      'background:#0a1a3a;color:#fff;font:700 18px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);display:none;}' +
      '#anavScrim{position:fixed;inset:0;z-index:298;background:rgba(10,26,58,.45);display:none;}' +
      'body.anav-over #anav{transform:translateX(-102%);width:' + W + 'px;}' +
      'body.anav-over.anav-open #anav{transform:none;}' +
      'body.anav-over.anav-open #anavScrim{display:block;}' +
      'body.anav-over #anavBtn{display:block;}' +
      'body.anav-over #anav .amin{display:none;}' +
      'body.anav-over.anav-min #anav .ah b,body.anav-over.anav-min #anav a .t,body.anav-over.anav-min #anav .ak,body.anav-over.anav-min #anav details{display:revert;}' +
      ':fullscreen #anavBtn,body:fullscreen #anavBtn{display:none!important;}' +
      '@media print{#anav,#anavBtn,#anavScrim{display:none!important;}body.anav-push{padding-left:0!important;}}';
    document.head.appendChild(s);
  }

  /* ---------- the menu ---------- */
  function link(href, icon, label, on, extra) {
    return '<a href="' + esc(href) + '"' + (on ? ' class="on"' : '') + (extra || '') + ' title="' + esc(label) + '">' +
      '<span class="i">' + icon + '</span><span class="t">' + esc(label) + '</span></a>';
  }

  function render() {
    var nav = document.getElementById('anav');
    var id = courseId(), c = course(id), tool = currentTool();
    var h = '<div class="ah"><b>Instructor</b>' +
      '<button class="ab amin" id="anavMin" title="Fold the menu">' + (document.body.classList.contains('anav-min') ? '»' : '«') + '</button>' +
      '<button class="ab" id="anavX" title="Close" style="display:none">✕</button></div><div class="as">';

    h += link('/admin/', '⚙️', 'Admin console', PATH === '/admin/');
    h += link('/shared/inbox.html', '📥', 'Inbox · all courses', PATH === '/shared/inbox.html');

    h += '<div class="ak">Course' + (c || id ? ' · <em>' + esc(c ? (c.code || c.id) : id) + '</em>' : '') + '</div>';
    TOOLS.forEach(function (t) {
      if (t[0] === 'pres' && c && !hasPresence(c)) return;
      h += link(toolHref(t, id), t[1], t[2], tool === t[0], ' data-tool="' + t[0] + '"');
    });

    h += '<div class="ak">Site</div>';
    h += link('/shared/site.html', '📈', 'Statistics & alerts', PATH === '/shared/site.html');

    if (REG && REG.courses) {
      var list = REG.courses.filter(function (x) { return x.ns && x.status !== 'archived'; });
      var bySchool = {}, order = [];
      list.forEach(function (x) {
        var s = String(x.dir || '').split('/')[0];
        if (!/^[A-Z]/.test(s) || String(x.dir).indexOf('/') < 0) s = 'Other';
        if (!bySchool[s]) { bySchool[s] = []; order.push(s); }
        bySchool[s].push(x);
      });
      h += '<div class="ak">Switch course</div>';
      order.forEach(function (s) {
        var open = bySchool[s].some(function (x) { return x.id === id; });
        h += '<details' + (open ? ' open' : '') + '><summary>' + esc(s) + '</summary>';
        bySchool[s].forEach(function (x) {
          var t = (x.title && (x.title.en || x.title.fr)) || x.id;
          h += '<a href="#" data-course="' + esc(x.id) + '"' + (x.id === id ? ' class="on"' : '') + ' title="' + esc((x.code ? x.code + ' · ' : '') + t) + '">' +
            '<span class="t">' + esc(t) + '</span></a>';
        });
        h += '</details>';
      });
    }
    nav.innerHTML = h + '</div>';
    document.getElementById('anavX').style.display = document.body.classList.contains('anav-over') ? '' : 'none';
  }

  /* hrefs follow the page's course picker without a full re-render */
  function refresh() {
    var id = courseId(), c = course(id);
    var nav = document.getElementById('anav');
    if (!nav) return;
    var k = nav.querySelector('.ak em');
    if ((k ? k.textContent : '') !== (c ? (c.code || c.id) : id)) { render(); return; }
    Array.prototype.forEach.call(nav.querySelectorAll('a[data-tool]'), function (a) {
      var t = TOOLS.filter(function (x) { return x[0] === a.getAttribute('data-tool'); })[0];
      a.setAttribute('href', toolHref(t, id));
    });
  }

  function go(href) {
    var u = new URL(href, location.href);
    if (u.pathname === location.pathname && u.search === location.search && u.hash !== location.hash) {
      location.href = href; location.reload();      /* admin2 reads its tab only at boot */
    } else location.href = href;
  }

  function onClick(e) {
    var a = e.target.closest && e.target.closest('#anav a');
    if (!a) return;
    var cid = a.getAttribute('data-course');
    if (cid) {
      e.preventDefault();
      try { localStorage.setItem('jem_admin_last', cid); } catch (x) {}
      var tool = currentTool() || 'dash', c = course(cid);
      if (tool === 'pres' && !hasPresence(c)) tool = 'dash';
      var t = TOOLS.filter(function (x) { return x[0] === tool; })[0];
      go(toolHref(t, cid));
      return;
    }
    if (a.hasAttribute('data-tool')) { refresh(); e.preventDefault(); go(a.getAttribute('href')); }
  }

  function layout() {
    var b = document.body;
    var over = BOARD || window.innerWidth < 1000;
    b.classList.toggle('anav-over', over);
    b.classList.toggle('anav-push', !over);
    if (!over) b.classList.remove('anav-open');
    var x = document.getElementById('anavX');
    if (x) x.style.display = over ? '' : 'none';
  }

  function mount() {
    var b = document.body;
    css();
    try { if (localStorage.getItem('jem_anav') === 'min') b.classList.add('anav-min'); } catch (e) {}
    var nav = document.createElement('nav');
    nav.id = 'anav'; nav.setAttribute('aria-label', 'Instructor menu');
    var btn = document.createElement('button');
    btn.id = 'anavBtn'; btn.title = 'Menu'; btn.textContent = '☰';
    var scrim = document.createElement('div'); scrim.id = 'anavScrim';
    b.appendChild(scrim); b.appendChild(nav); b.appendChild(btn);
    layout(); render();

    btn.addEventListener('click', function () { b.classList.add('anav-open'); refresh(); });
    scrim.addEventListener('click', function () { b.classList.remove('anav-open'); });
    nav.addEventListener('click', function (e) {
      if (e.target.id === 'anavX') { b.classList.remove('anav-open'); return; }
      if (e.target.id === 'anavMin') {
        var min = b.classList.toggle('anav-min');
        try { if (min) localStorage.setItem('jem_anav', 'min'); else localStorage.removeItem('jem_anav'); } catch (x) {}
        e.target.textContent = min ? '»' : '«';
        return;
      }
      onClick(e);
    });
    nav.addEventListener('pointerenter', refresh);
    nav.addEventListener('focusin', refresh);
    window.addEventListener('resize', layout);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') b.classList.remove('anav-open'); });

    if (window.CourseConfig && CourseConfig.load) {
      CourseConfig.load().then(function (reg) { REG = reg; render(); }, function () {});
    }
  }

  function start() {
    if (trusted()) { mount(); return; }
    var t = setInterval(function () { if (trusted()) { clearInterval(t); mount(); } }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
