/* =====================================================================
   Capstone (Bachelors) · the course menu — a port of UMEF/gen110/nav.js
   (4 Nov 2026, Jan Erik: "make a course menu"). One <script src="nav.js"
   defer> on every student page; the stylesheet nav.css is injected here.

   A ☰ Menu button bottom-left opens a panel with the ten weeks (each
   week's counted sections underneath, ✓ where this device has ticked
   them — read from capstone.js's capstone-ba_capdone_<mod> mirror and
   progress.js's capstone-ba_done_<mod>), then the project pages and the
   reference pages. NAV is the one copy of the tree: a new week section
   or a renamed heading is changed here too (ids = the sections'
   data-step; a week page has no id on those sections, so a link
   week4.html#s3 is scrolled to [data-step="s3"] on arrival).
   ===================================================================== */
(function () {
  'use strict';
  var K = 'capstone-ba';
  var NAV = [
    { n: 1, mod: 'w1', href: 'week1.html', t: 'Organising the project',
      secs: [['s1', 'The question the client asks'], ['s2', 'Ten weeks, three phases, one report'], ['s3', 'Form your team'], ['s4', 'The team charter'], ['s5', 'Your tools'], ['s6', 'Your team presents']] },
    { n: 2, mod: 'w2', href: 'week2.html', t: 'The numbers: units, capacity factor, LCOE',
      secs: [['s1', 'This week you will learn'], ['s2', 'Energy units'], ['s3', 'Capacity factor'], ['s4', 'LCOE, the cost per MWh'], ['s5', 'The EU wind market today'], ['s6', 'AI as your research assistant'], ['s7', 'Three posts, one debate'], ['s8', 'Verified links']] },
    { n: 3, mod: 'w3', href: 'week3.html', t: 'Learning curves, and AI as an analyst',
      secs: [['s9', 'What the team carries forward'], ['s1', 'By the end of this week'], ['s2', 'What "AI" means this week'], ['s3', 'Vinuesa: enabler or inhibitor'], ['s4', 'Wright\'s Law and the learning curve'], ['s5', 'Projecting to 2040'], ['s6', 'How AI gets it wrong'], ['s10', 'What goes on the report page'], ['s7', 'The experiment and the audit'], ['s8', 'Where the data is']] },
    { n: 4, mod: 'w4', href: 'week4.html', t: 'Scenarios, and what a wind farm costs',
      secs: [['s1', 'A cautionary tale'], ['s2', 'Forecast versus scenarios'], ['s3', 'The impact × uncertainty matrix'], ['s4', 'The 2×2, worked'], ['s5', 'Stress-testing strategies'], ['s6', 'Three exercises'], ['s7', 'Benchmarks and anchors']] },
    { n: 5, mod: 'w5', href: 'week5.html', t: 'Phase 1: the system map, and the grid',
      secs: [['s6', 'Phase 1 week: who owns what'], ['s1', 'Two halves of one week'], ['s2', 'Grading and a structure that works'], ['s3', 'Make the second axis a driver'], ['s4', 'How the 2×2 disciplines the map'], ['s7', 'The grid is the bottleneck'], ['s5', 'Monday to Sunday']] },
    { n: 6, mod: 'w6', href: 'week6.html', t: 'The Phase 2 proposal, and the supply chain',
      secs: [['s7', 'Proposal week: who owns what'], ['s1', 'This week you will'], ['s2', 'From narrative to numbers'], ['s3', 'Methods you might use'], ['s4', 'The energy cost of the AI you use'], ['s5', 'The proposal and the audit'], ['s8', 'The supply chain and China'], ['s6', 'What your indicators require']] },
    { n: 7, mod: 'w7', href: 'week7.html', t: 'Curves and limits',
      secs: [['s1', 'This week you will'], ['s2', 'Fit your curve, three projections'], ['s3', 'Planetary boundaries'], ['s4', 'The water you did not measure'], ['s5', 'Fit it, then break it'], ['s6', 'Data for the fit and the limits']] },
    { n: 8, mod: 'w8', href: 'week8.html', t: 'Forecasts with uncertainty',
      secs: [['s1', 'This week you will'], ['s2', 'Time series versus learning curves'], ['s3', 'Uncertainty bands'], ['s4', 'Cross-checking against the industry'], ['s5', '2,000 words, and three rules for charts'], ['s6', 'Industry forecasts and tools']] },
    { n: 9, mod: 'w9', href: 'week9.html', t: 'From analyst to advisor',
      secs: [['s1', 'This week you will'], ['s2', 'From analyst to advisor'], ['s3', 'The robust-strategy test'], ['s4', 'Early-warning signals'], ['s5', 'A structure for 4,000–5,000 words'], ['s6', 'Draft, challenge, submit'], ['s7', 'Frameworks and fresh disclosures']] },
    { n: 10, mod: 'w10', href: 'week10.html', t: 'The exam',
      secs: [['s1', 'The shape of the question'], ['s2', 'A revision checklist'], ['s3', 'Wright\'s Law on new data'], ['s4', 'Calibrate the shape of the move'], ['s5', 'Read before Monday']] }
  ];
  var PROJECT = [
    ['report.html', 'The team report', 'one document per team, written here'],
    ['phase1.html', 'Phase 1, step by step', 'what to write, who writes it, the checklist'],
    ['handin.html', 'Hand in a PDF', 'figures, an appendix, the dossier'],
    ['canvas.html', 'The shared canvas', 'your team\'s block for each week'],
    ['wednesday.html', 'Wednesdays: the group hour', 'the plan for every week, step by step'],
    ['forum.html', 'The forums', 'the required posts, still open after the deadline']
  ];
  var REF = [
    ['toolkit.html', 'The toolkit', 'the five ideas the course uses every week'],
    ['glossary.html', 'The glossary', 'every term, by the week it first appears']
  ];

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var MOD = document.body ? (document.body.getAttribute('data-module') || '') : '';
  var CUR = null;
  NAV.forEach(function (s) { if (s.href === here || (MOD && s.mod === MOD)) CUR = s; });
  var OPEN = {}; if (CUR) OPEN[CUR.mod] = true;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function doneOf(s) {
    var d = {};
    try { var m = JSON.parse(localStorage.getItem(K + '_capdone_' + s.mod) || '{}') || {}; Object.keys(m).forEach(function (k) { if (m[k]) d[k] = true; }); } catch (e) {}
    try { var p = JSON.parse(localStorage.getItem(K + '_done_' + s.mod) || '{}') || {}; Object.keys(p).forEach(function (k) { if (p[k]) d[k] = true; }); } catch (e) {}
    if (CUR === s) document.querySelectorAll('.sec[data-step].done').forEach(function (el) { d[el.getAttribute('data-step')] = true; });
    return d;
  }
  function target(id) { return document.getElementById(id) || document.querySelector('.sec[data-step="' + id + '"]'); }

  var btn, scrim, panel, body;
  function build() {
    if (!document.body) return;
    if (!document.querySelector('link[href$="nav.css"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'nav.css'; document.head.appendChild(l);
    }
    btn = document.createElement('button');
    btn.className = 'nav-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Course menu');
    btn.innerHTML = '<span class="nav-ico">☰</span><span class="nav-lbl">Menu</span>';
    document.body.appendChild(btn);
    function level() {
      var jc = document.getElementById('jc-btn');
      var b = jc ? jc.style.bottom : (document.getElementById('cl-pill') ? '62px' : '14px');
      if (b && btn.style.bottom !== b) btn.style.bottom = b;
    }
    level(); setInterval(level, 1000);
    scrim = document.createElement('div'); scrim.className = 'nav-scrim';
    panel = document.createElement('nav'); panel.className = 'nav-panel'; panel.setAttribute('aria-label', 'Course menu');
    panel.innerHTML = '<div class="nav-hd"><div><div class="nav-eyebrow">Capstone · AI for Good · SUMAS</div><div class="nav-title">The course</div></div>' +
      '<button class="nav-x" type="button" aria-label="Close">✕</button></div><div class="nav-body"></div>' +
      '<div class="nav-ft"><a href="index.html">↖ Course home</a><span class="nav-hint">Esc closes · ✓ = done on this device</span></div>';
    document.body.appendChild(scrim); document.body.appendChild(panel);
    body = panel.querySelector('.nav-body');
    btn.addEventListener('click', toggle);
    scrim.addEventListener('click', close);
    panel.querySelector('.nav-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
    body.addEventListener('click', onClick);
  }

  function pageRow(p) {
    var cur = p[0] === here;
    return '<a class="nav-part tool' + (cur ? ' cur' : '') + '" href="' + p[0] + '"><span class="nav-chev"></span><span class="nav-pt">' + esc(p[1]) + '</span><span class="nav-soon">' + esc(p[2]) + '</span></a>';
  }
  function render() {
    var h = '<div class="nav-wk"><div class="nav-wkhd"><span class="nav-wkn">The ten weeks</span><span class="nav-wkt">Wednesdays, 17:15 the group hour · 18:15 with Jan Erik</span></div>';
    NAV.forEach(function (s) {
      var isCur = s === CUR, open = !!OPEN[s.mod];
      var done = doneOf(s), n = 0; s.secs.forEach(function (x) { if (done[x[0]]) n++; });
      h += '<div class="nav-part' + (isCur ? ' cur' : '') + (open ? ' open' : '') + '" data-mod="' + s.mod + '">' +
        '<button class="nav-chev" type="button" data-toggle="' + s.mod + '" aria-label="Show sections">▸</button>' +
        '<a class="nav-pt" href="' + s.href + '">' + s.n + ' · ' + esc(s.t) + '</a><span class="nav-cnt">' + n + '/' + s.secs.length + '</span></div>';
      if (open) {
        h += '<div class="nav-secs">';
        s.secs.forEach(function (x) {
          h += '<a class="nav-sec' + (done[x[0]] ? ' done' : '') + '" href="' + s.href + '#' + x[0] + '" data-sec="' + x[0] + '" data-mod="' + s.mod + '">' +
            '<span class="nav-num">' + esc(x[0].replace(/^s/, '§')) + '</span><span class="nav-nm">' + esc(x[1]) + '</span><span class="nav-tick">' + (done[x[0]] ? '✓' : '') + '</span></a>';
        });
        h += '</div>';
      }
    });
    h += '</div>';
    h += '<div class="nav-wk"><div class="nav-wkhd"><span class="nav-wkn">The project</span><span class="nav-wkt">written and handed in on this site</span></div>' + PROJECT.map(pageRow).join('') + '</div>';
    h += '<div class="nav-wk"><div class="nav-wkhd"><span class="nav-wkn">Reference</span></div>' + REF.map(pageRow).join('') + '</div>';
    body.innerHTML = h;
    var cur = body.querySelector('.nav-part.cur');
    if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: 'center' }); } catch (e) {} }
  }

  function onClick(e) {
    var t = e.target.closest('[data-toggle]');
    if (t) { var m = t.getAttribute('data-toggle'); OPEN[m] = !OPEN[m]; render(); return; }
    var s = e.target.closest('a.nav-sec');
    if (s && CUR && s.getAttribute('data-mod') === CUR.mod) {
      var el = target(s.getAttribute('data-sec'));
      if (el) { e.preventDefault(); close(); el.scrollIntoView({ block: 'start' }); try { history.replaceState(null, '', '#' + s.getAttribute('data-sec')); } catch (x) {} }
    }
  }
  function open() { render(); panel.classList.add('open'); scrim.classList.add('open'); document.body.classList.add('nav-open'); var x = panel.querySelector('.nav-x'); if (x) x.focus(); }
  function close() { panel.classList.remove('open'); scrim.classList.remove('open'); document.body.classList.remove('nav-open'); if (btn) btn.focus(); }
  function toggle() { if (panel.classList.contains('open')) close(); else open(); }

  function boot() {
    build();
    /* week4.html#s3 — the section has no id, only data-step */
    var m = (location.hash || '').match(/^#(s\d+)$/);
    if (m && !document.getElementById(m[1])) { var el = target(m[1]); if (el) [300, 1200].forEach(function (ms) { setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, ms); }); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
